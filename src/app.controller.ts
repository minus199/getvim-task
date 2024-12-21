import { Body, Controller, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import {
  EditUserPreferencesDTO,
  NewNotificationDTO,
  NewUserPreferencesDTO,
  UserNotificationPreferences,
} from './contracts';

@Controller('/notifications')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/preferences')
  async newUserNotificationsPreferences(
    @Body() body: NewUserPreferencesDTO,
  ): Promise<UserNotificationPreferences> {
    return this.appService.newUserNotificationsPreferences(body);
  }

  @Put('/preferences')
  async editUserNotificationsPreferences(
    @Body() { email, preferences }: EditUserPreferencesDTO,
  ): Promise<boolean> {
    return await this.appService.editUserNotificationsPreferences(
      email,
      preferences,
    );
  }

  @Post('/')
  async newNotifications(
    @Body() { userId, message }: NewNotificationDTO,
  ): Promise<boolean> {
    await this.appService.dispatchForUserChannel(userId, message);
    return true;
  }
}
