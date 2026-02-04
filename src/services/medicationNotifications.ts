/**
 * Сервис уведомлений о приёме лекарств
 */

interface MedicationReminder {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string;
  enabled: boolean;
}

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  minutesBefore: number;
}

class MedicationNotificationService {
  private checkInterval: number | null = null;
  private notifiedReminders = new Set<string>();

  start() {
    // Проверяем каждую минуту
    this.checkInterval = window.setInterval(() => {
      this.checkReminders();
    }, 60000);
    
    // Сразу проверяем при старте
    this.checkReminders();
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkReminders() {
    try {
      const settings = this.getSettings();
      if (!settings.enabled) return;

      const permission = await this.checkPermission();
      if (permission !== 'granted') return;

      // Здесь должна быть загрузка лекарств из API
      // Пока заглушка - в реальной версии нужно загружать из func2url['health-medications']
      
    } catch (error) {
      console.error('Ошибка проверки напоминаний:', error);
    }
  }

  private getSettings(): NotificationSettings {
    const saved = localStorage.getItem('medicationNotifications');
    if (saved) {
      return JSON.parse(saved);
    }
    return { enabled: false, soundEnabled: true, minutesBefore: 15 };
  }

  private async checkPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  private shouldNotify(reminderTime: string, minutesBefore: number): boolean {
    const now = new Date();
    const [hours, minutes] = reminderTime.split(':').map(Number);
    
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);
    
    const notifyTime = new Date(reminderDate.getTime() - minutesBefore * 60000);
    
    // Проверяем, что текущее время в пределах 1 минуты от времени уведомления
    const diff = Math.abs(now.getTime() - notifyTime.getTime());
    return diff < 60000; // Меньше 1 минуты
  }

  async showNotification(medicationName: string, time: string, minutesBefore: number) {
    const settings = this.getSettings();
    
    const notification = new Notification('Напоминание о приёме лекарства', {
      body: `Примите ${medicationName} в ${time}`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `medication-${time}`,
      requireInteraction: true,
      silent: !settings.soundEnabled
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

export const medicationNotificationService = new MedicationNotificationService();
