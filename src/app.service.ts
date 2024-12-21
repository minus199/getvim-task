import { Injectable, Logger } from '@nestjs/common';
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
import { UserStorage } from './user-storage.service';
import { ConfigService } from '@nestjs/config';
import { BaseError } from './exceptions';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private notificationServiceURI: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly storage: UserStorage,
  ) {
    this.notificationServiceURI = config.getOrThrow<string>(
      'NOTIFICATION_SERVICE_URI',
    );
  }

  protected async sendNotification(
    channel: NotificationChannel,
    to: string,
    message: string,
  ) {
    const url = `${this.notificationServiceURI}/send-${channel}`;
    const payload = {
      [channel]: to,
      message,
    };

    return await firstValueFrom(
      this.httpService
        .post<SendNotificationResponse>(url, payload, {
          headers: { 'Content-Type': 'application/json' },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);

            if (error.message.startsWith('Too many requests for ')) {
              throw new BaseError('Too many requests - try again later');
            }

            throw new BaseError('Sorry, service has issues - try again later'); // or backoff retry
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
}
