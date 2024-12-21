import { Injectable } from '@nestjs/common';
import {
  NotificationChannelToggle,
  UserNotificationPreferences,
} from './contracts';

@Injectable()
export class UserStorage {
  /**
   * provides O(1) average time complexity for lookups and insertions
   * @private
   */
  private users: Map<number, UserNotificationPreferences>;
  private idsByEmail: Map<string, UserNotificationPreferences>;

  constructor() {
    this.users = new Map();
    this.idsByEmail = new Map();
  }

  addUserPreferences(
    preferences: Omit<UserNotificationPreferences, 'userId'>,
  ): UserNotificationPreferences {
    const userId = this.nextId;
    const userPrefs = { userId, ...preferences };

    this.users.set(userId, userPrefs);
    this.idsByEmail.set(preferences.email, userPrefs);

    return userPrefs;
  }

  editUserPreferences(
    email: string,
    preferences: NotificationChannelToggle,
  ): void {
    const currentPrefs = this.getUserPreferences(email);
    currentPrefs.preferences = Object.assign(
      currentPrefs.preferences,
      preferences,
    );
  }

  getUserPreferences(id: number | string) {
    return typeof id === 'string'
      ? this.idsByEmail.get(id)
      : this.users.get(id);
  }

  getUserEmail(id: number): string | undefined {
    const user = this.users.get(id);
    return user?.email;
  }

  getUserPhone(id: number): string | undefined {
    const user = this.users.get(id);
    return user?.email;
  }

  getIdByEmail(email: string): number {
    return this.idsByEmail.get(email).userId;
  }

  get nextId(): number {
    return this.users.size;
  }
}
