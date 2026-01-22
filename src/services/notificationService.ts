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
    eventId: string
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
      return;
    }

    const notificationData = {
      title,
      body,
      scheduledTime: scheduledTimestamp,
      eventId,
    };

    const existingNotifications = this.getScheduledNotifications();
    existingNotifications.push(notificationData);
    localStorage.setItem('scheduledNotifications', JSON.stringify(existingNotifications));

    setTimeout(() => {
      this.showNotification(title, body);
      this.removeScheduledNotification(eventId);
    }, delay);
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
          this.removeScheduledNotification(notification.eventId);
        }, delay);
      } else {
        this.removeScheduledNotification(notification.eventId);
      }
    });
  }

  static hasPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }
}
