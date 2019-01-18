import { isNil } from "lodash";
import Timeout = NodeJS.Timeout;

interface UserCache {
  [n: string]: CacheData | undefined;
}

interface CacheData {
  intentHistory: number[];
  timer: Timeout;
}

/**
 * Simple history of the last 10 intents triggered by a user.
 */
class ChatCache {
  public static readonly cacheTimeout = 600000;
  public store: UserCache = {};

  public getUserCache(user: string): CacheData {
    const result = this.store[user];
    if (isNil(result)) {
      this.store[user] = {
        intentHistory: [],
        timer: this.resetTimeOutForUser(user),
      };

      return this.store[user]!;
    } else {
      return result;
    }
  }

  public addIntentToUser(user: string, intentId: number): void {
    const specificCache = this.getUserCache(user);
    specificCache.intentHistory.push(intentId);
    if (specificCache.intentHistory.length > 10) {
      specificCache.intentHistory.shift();
    }

    specificCache.timer = this.resetTimeOutForUser(user);
  }

  public removeUser(user: string): void {
    const specificCache = this.store[user];
    if (!isNil(specificCache)) {
      clearTimeout(specificCache.timer);
    }

    this.store[user] = undefined;
  }

  private resetTimeOutForUser(user: string): Timeout {
    const specificCache = this.store[user];
    if (!isNil(specificCache)) {
      clearTimeout(specificCache.timer);
    }

    return setTimeout(() => this.removeUser(user), ChatCache.cacheTimeout);
  }
}

export const cache = new ChatCache();
