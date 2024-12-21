import { Injectable } from '@nestjs/common';
import {
  NotificationChannelToggle,
  UserNotificationPreferences,
} from './contracts';
import { UserNotFound } from './exceptions';
import { IUserStorage } from './services.contracts';

@Injectable()
export class UserStorage implements IUserStorage {
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
    try {
      return this.getUserPreferences(preferences.email);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_: any) {
      // user does not exists yet
    }

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
    if (!currentPrefs) {
      throw new UserNotFound(email);
    }

    currentPrefs.preferences = Object.assign(
      currentPrefs.preferences,
      preferences,
    );
  }

  getUserPreferences(id: number | string) {
    const prefs =
      typeof id === 'string' ? this.idsByEmail.get(id) : this.users.get(id);

    if (!prefs) {
      throw new UserNotFound(id);
    }

    return prefs;
  }

  getUserEmail(id: number): string | undefined {
    const user = this.users.get(id);
    return user?.email;
  }

  getUserPhone(id: number): string | undefined {
    const user = this.users.get(id);
    return user?.telephone;
  }

  getIdByEmail(email: string): number {
    return this.idsByEmail.get(email).userId;
  }

  private get nextId(): number {
    return this.users.size;
  }
}
