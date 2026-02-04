/**
 * Сервис уведомлений о приёме лекарств
 */

import func2url from '../../backend/func2url.json';

interface MedicationReminder {
  id: string;
  time: string;
  enabled: boolean;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  active: boolean;
  reminders: MedicationReminder[];
}

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  minutesBefore: number;
}

class MedicationNotificationService {
  private checkInterval: number | null = null;
  private notifiedReminders = new Set<string>();
  private lastCheck = '';

  start() {
    console.log('[MedicationNotifications] Service started');
    
    // Проверяем каждую минуту
    this.checkInterval = window.setInterval(() => {
      this.checkReminders();
    }, 60000);
    
    // Сразу проверяем при старте
    this.checkReminders();
  }

  stop() {
    console.log('[MedicationNotifications] Service stopped');
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkReminders() {
    try {
      const settings = this.getSettings();
      if (!settings.enabled) {
        console.log('[MedicationNotifications] Notifications disabled in settings');
        return;
      }

      const permission = this.checkPermission();
      if (permission !== 'granted') {
        console.log('[MedicationNotifications] Notification permission not granted:', permission);
        return;
      }

      const now = new Date();
      const currentMinute = `${now.getHours()}:${now.getMinutes()}`;
      
      // Проверяем только раз в минуту
      if (this.lastCheck === currentMinute) return;
      this.lastCheck = currentMinute;

      console.log('[MedicationNotifications] Checking reminders at', currentMinute);

      // Загружаем активные лекарства
      const medications = await this.loadMedications();
      if (!medications || medications.length === 0) {
        console.log('[MedicationNotifications] No active medications found');
        return;
      }

      console.log(`[MedicationNotifications] Found ${medications.length} active medications`);

      // Проверяем каждое напоминание
      for (const medication of medications) {
        if (!medication.reminders || medication.reminders.length === 0) continue;

        for (const reminder of medication.reminders) {
          if (!reminder.enabled) continue;

          const notificationKey = `${medication.id}-${reminder.id}-${this.getTodayDate()}`;
          
          // Если уже уведомляли сегодня - пропускаем
          if (this.notifiedReminders.has(notificationKey)) continue;

          if (this.shouldNotify(reminder.time, settings.minutesBefore, now)) {
            console.log(`[MedicationNotifications] Showing notification for ${medication.name} at ${reminder.time}`);
            await this.showNotification(medication.name, medication.dosage, reminder.time, settings);
            this.notifiedReminders.add(notificationKey);
          }
        }
      }

      // Очищаем старые записи (старше 2 дней)
      this.cleanupOldNotifications();
      
    } catch (error) {
      console.error('[MedicationNotifications] Error checking reminders:', error);
    }
  }

  private async loadMedications(): Promise<Medication[]> {
    try {
      const authToken = localStorage.getItem('authToken');
      const userDataStr = localStorage.getItem('userData');
      
      if (!userDataStr) {
        console.log('[MedicationNotifications] No user data found');
        return [];
      }

      let userId = '1';
      try {
        const userData = JSON.parse(userDataStr);
        userId = userData.member_id || '1';
      } catch (e) {
        console.error('[MedicationNotifications] Failed to parse userData:', e);
      }

      const response = await fetch(func2url['health-medications'], {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (!response.ok) {
        console.error('[MedicationNotifications] Failed to load medications:', response.status);
        return [];
      }

      const medications: Medication[] = await response.json();
      // Фильтруем только активные
      return medications.filter(m => m.active);
      
    } catch (error) {
      console.error('[MedicationNotifications] Error loading medications:', error);
      return [];
    }
  }

  private getSettings(): NotificationSettings {
    const saved = localStorage.getItem('medicationNotifications');
    if (saved) {
      return JSON.parse(saved);
    }
    return { enabled: false, soundEnabled: true, minutesBefore: 15 };
  }

  private checkPermission(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  private getTodayDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  private shouldNotify(reminderTime: string, minutesBefore: number, now: Date): boolean {
    try {
      const [hours, minutes] = reminderTime.split(':').map(Number);
      
      const reminderDate = new Date(now);
      reminderDate.setHours(hours, minutes, 0, 0);
      
      const notifyTime = new Date(reminderDate.getTime() - minutesBefore * 60000);
      
      // Проверяем, что текущее время в пределах 1 минуты от времени уведомления
      const diff = Math.abs(now.getTime() - notifyTime.getTime());
      return diff < 60000; // Меньше 1 минуты
    } catch (error) {
      console.error('[MedicationNotifications] Error in shouldNotify:', error);
      return false;
    }
  }

  private async showNotification(medicationName: string, dosage: string, time: string, settings: NotificationSettings) {
    try {
      const notification = new Notification('Напоминание о приёме лекарства', {
        body: `${medicationName} (${dosage}) - примите в ${time}`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `medication-${medicationName}-${time}`,
        requireInteraction: true,
        silent: !settings.soundEnabled
      });

      notification.onclick = () => {
        window.focus();
        // Открываем страницу Здоровье
        window.location.href = '/health';
        notification.close();
      };
    } catch (error) {
      console.error('[MedicationNotifications] Error showing notification:', error);
    }
  }

  private cleanupOldNotifications() {
    const today = this.getTodayDate();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    // Удаляем все записи, кроме сегодняшних и вчерашних
    const toRemove: string[] = [];
    this.notifiedReminders.forEach(key => {
      if (!key.includes(today) && !key.includes(yesterdayStr)) {
        toRemove.push(key);
      }
    });
    
    toRemove.forEach(key => this.notifiedReminders.delete(key));
    
    if (toRemove.length > 0) {
      console.log(`[MedicationNotifications] Cleaned up ${toRemove.length} old notifications`);
    }
  }
}

export const medicationNotificationService = new MedicationNotificationService();