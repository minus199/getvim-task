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

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly storage: UserStorage,
  ) {}

  protected async sendNotification(
    channel: NotificationChannel,
    to: string,
    message: string,
  ) {
    return await firstValueFrom(
      this.httpService
        .post<SendNotificationResponse>(`/send-${channel}`, {
          [channel]: to,
          message,
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);

            if (error.message.startsWith('Too many requests for ')) {
              // backoff retry
            }

            if (error.message.startsWith('Random server error ')) {
              // tell user to try again later
            }

            throw 'An error happened!';
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
          case 'sms':
            await this.sendSms(userId, message);
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

  async publishNotification() {}
}
