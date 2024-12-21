import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  NewUserPreferencesDTO,
  NotificationChannel,
  NotificationChannelToggle,
  SendNotificationResponse,
  UserNotificationPreferences,
} from './contracts';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import {
  ExternalServerException,
  TooManyRequestsException,
} from './exceptions';
import { IAppService, IUserStorage } from './services.contracts';

@Injectable()
export class AppService implements IAppService {
  private readonly logger = new Logger(AppService.name);
  private readonly notificationServiceURI: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    @Inject('IUserStorage') private readonly storage: IUserStorage,
  ) {
    this.notificationServiceURI = config.getOrThrow<string>(
      'NOTIFICATION_SERVICE_URI',
    );

    this.logger.log(
      `using ${this.notificationServiceURI} as notifications service`,
    );
  }

  newUserNotificationsPreferences(
    body: NewUserPreferencesDTO,
  ): UserNotificationPreferences {
    return this.storage.addUserPreferences(body);
  }

  async editUserNotificationsPreferences(
    email: string,
    preferences: NotificationChannelToggle,
  ): Promise<boolean> {
    this.storage.editUserPreferences(email, preferences);
    return true;
  }

  private async sendNotification(
    channel: NotificationChannel,
    to: string,
    message: string,
  ) {
    const url = `${this.notificationServiceURI}/send-${channel}`;
    const payload = {
      [channel]: to,
      message,
    };

    await firstValueFrom(
      this.httpService
        .post<SendNotificationResponse>(url, payload, {
          headers: { 'Content-Type': 'application/json' },
        })
        .pipe(
          catchError((error: AxiosError) => {
            // @ts-expect-error since there is no mapping for the actual error
            const message = error.response.data.error;

            if (message.startsWith('Too many requests for ')) {
              throw new TooManyRequestsException();
            }

            throw new ExternalServerException(); // or backoff retry
          }),
        ),
    );
  }

  async sendEmail(userId: number, message: string): Promise<boolean> {
    const email = this.storage.getUserEmail(userId);
    await this.sendNotification('email', email, message);
    return true;
  }

  async sendSms(userId: number, message: string): Promise<boolean> {
    const telephone = this.storage.getUserPhone(userId);
    await this.sendNotification('sms', telephone, message);
    this.logger.log(`Sent notification by sms to ${userId}`);
    return true;
  }

  async dispatchForUserChannel(userId: number, message: string) {
    const { preferences } = this.storage.getUserPreferences(userId);

    for (const [channel, enabled] of Object.entries(preferences)) {
      if (enabled) {
        switch (channel) {
          case 'email':
            await this.sendEmail(userId, message);
            break;
          case 'sms':
            await this.sendSms(userId, message);
            break;
        }
      }
    }
  }
}
