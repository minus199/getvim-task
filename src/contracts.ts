export type NotificationChannel = 'email' | 'sms';

export type NotificationChannelPreferences = {
  [key in NotificationChannel]?: string;
};
export type NotificationChannelToggle = {
  [key in NotificationChannel]?: boolean;
};

export interface UserNotificationPreferences {
  userId: number;
  email: string;
  telephone: string;
  preferences: NotificationChannelToggle;
}

export interface NewNotification {
  email?: string;
  telephone?: string;
  message: string;
}

export interface NewNotificationDTO {
  userId: number;
  message: string;
}

export interface SendNotificationResponse {
  status: 'sent';
  channel: NotificationChannel;
  to: string;
  message: string;
}

export interface EditUserPreferencesDTO {
  email: string;
  preferences: NotificationChannelToggle;
}

export type NewUserPreferencesDTO = Omit<UserNotificationPreferences, 'userId'>;
