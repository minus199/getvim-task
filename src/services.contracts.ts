import {
  NewUserPreferencesDTO,
  NotificationChannelToggle,
  UserNotificationPreferences,
} from './contracts';

export interface IUserStorage {
  addUserPreferences(
    preferences: Omit<UserNotificationPreferences, 'userId'>,
  ): UserNotificationPreferences;

  editUserPreferences(
    email: string,
    preferences: NotificationChannelToggle,
  ): void;

  getUserPreferences(id: number | string): UserNotificationPreferences;

  getUserEmail(id: number): string | undefined;

  getUserPhone(id: number): string | undefined;

  getIdByEmail(email: string): number;
}

export interface IAppService {
  newUserNotificationsPreferences(
    body: NewUserPreferencesDTO,
  ): UserNotificationPreferences;

  editUserNotificationsPreferences(
    email: string,
    preferences: NotificationChannelToggle,
  ): Promise<boolean>;

  sendEmail(userId: number, message: string): Promise<boolean>;

  sendSms(userId: number, message: string): Promise<boolean>;

  dispatchForUserChannel(userId: number, message: string): Promise<void>;
}
