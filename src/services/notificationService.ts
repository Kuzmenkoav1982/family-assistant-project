interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  daysOfWeek?: number[];
}

export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Браузер не поддерживает уведомления');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async scheduleNotification(
    title: string,
    body: string,
    scheduledTime: Date,
    eventId: string,
    recurringPattern?: RecurringPattern
  ): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Нет разрешения на уведомления');
      return;
    }

    const now = new Date().getTime();
    const scheduledTimestamp = scheduledTime.getTime();
    const delay = scheduledTimestamp - now;

    if (delay <= 0) {
      this.showNotification(title, body);
      if (recurringPattern) {
        this.scheduleNextRecurring(title, body, scheduledTime, eventId, recurringPattern);
      }
      return;
    }

    const notificationData = {
      title,
      body,
      scheduledTime: scheduledTimestamp,
      eventId,
      recurringPattern,
    };

    const existingNotifications = this.getScheduledNotifications();
    existingNotifications.push(notificationData);
    localStorage.setItem('scheduledNotifications', JSON.stringify(existingNotifications));

    setTimeout(() => {
      this.showNotification(title, body);
      if (recurringPattern) {
        this.scheduleNextRecurring(title, body, scheduledTime, eventId, recurringPattern);
      } else {
        this.removeScheduledNotification(eventId);
      }
    }, delay);
  }

  static scheduleNextRecurring(
    title: string,
    body: string,
    previousTime: Date,
    eventId: string,
    pattern: RecurringPattern
  ): void {
    const nextTime = this.calculateNextOccurrence(previousTime, pattern);
    
    if (!nextTime) {
      this.removeScheduledNotification(eventId);
      return;
    }

    if (pattern.endDate) {
      const endDate = new Date(pattern.endDate);
      if (nextTime > endDate) {
        this.removeScheduledNotification(eventId);
        return;
      }
    }

    this.scheduleNotification(title, body, nextTime, eventId, pattern);
  }

  static calculateNextOccurrence(currentDate: Date, pattern: RecurringPattern): Date | null {
    const next = new Date(currentDate);

    switch (pattern.frequency) {
      case 'daily':
        next.setDate(next.getDate() + pattern.interval);
        break;

      case 'weekly':
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          const currentDay = next.getDay();
          const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b);
          
          let nextDay = sortedDays.find(day => day > currentDay);
          if (nextDay === undefined) {
            nextDay = sortedDays[0];
            next.setDate(next.getDate() + 7 * pattern.interval);
          }
          
          const daysToAdd = (nextDay - currentDay + 7) % 7;
          next.setDate(next.getDate() + daysToAdd);
        } else {
          next.setDate(next.getDate() + 7 * pattern.interval);
        }
        break;

      case 'monthly':
        next.setMonth(next.getMonth() + pattern.interval);
        break;

      case 'yearly':
        next.setFullYear(next.getFullYear() + pattern.interval);
        break;

      default:
        return null;
    }

    return next;
  }

  static showNotification(title: string, body: string): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'calendar-reminder',
        requireInteraction: true,
      });
    }
  }

  static getScheduledNotifications(): any[] {
    const stored = localStorage.getItem('scheduledNotifications');
    return stored ? JSON.parse(stored) : [];
  }

  static removeScheduledNotification(eventId: string): void {
    const notifications = this.getScheduledNotifications();
    const filtered = notifications.filter(n => n.eventId !== eventId);
    localStorage.setItem('scheduledNotifications', JSON.stringify(filtered));
  }

  static cancelNotification(eventId: string): void {
    this.removeScheduledNotification(eventId);
  }

  static restoreScheduledNotifications(): void {
    const notifications = this.getScheduledNotifications();
    const now = new Date().getTime();

    notifications.forEach(notification => {
      const delay = notification.scheduledTime - now;
      
      if (delay > 0) {
        setTimeout(() => {
          this.showNotification(notification.title, notification.body);
          if (notification.recurringPattern) {
            this.scheduleNextRecurring(
              notification.title,
              notification.body,
              new Date(notification.scheduledTime),
              notification.eventId,
              notification.recurringPattern
            );
          } else {
            this.removeScheduledNotification(notification.eventId);
          }
        }, delay);
      } else if (notification.recurringPattern) {
        this.scheduleNextRecurring(
          notification.title,
          notification.body,
          new Date(notification.scheduledTime),
          notification.eventId,
          notification.recurringPattern
        );
      } else {
        this.removeScheduledNotification(notification.eventId);
      }
    });
  }

  static hasPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }
}