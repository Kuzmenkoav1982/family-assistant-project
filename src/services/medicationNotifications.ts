/**
 * Сервис уведомлений о приёме лекарств.
 *
 * Stage 4.3: загрузка списка лекарств переведена на healthApi wrapper.
 * Прямое чтение localStorage.userData + fallback `member_id || '1'` удалён
 * (см. A1 в docs/stage-4-id-contracts.md).
 */

import { healthApi } from '@/services/healthApi';

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

const NOTIFIED_KEY = 'medication_notified_reminders';

class MedicationNotificationService {
  private checkInterval: number | null = null;
  private notifiedReminders: Set<string> = this.loadNotifiedFromStorage();
  private lastCheck = '';

  private loadNotifiedFromStorage(): Set<string> {
    try {
      const raw = localStorage.getItem(NOTIFIED_KEY);
      if (raw) return new Set(JSON.parse(raw));
    } catch { /* ignore */ }
    return new Set();
  }

  private persistNotified() {
    try {
      localStorage.setItem(NOTIFIED_KEY, JSON.stringify(Array.from(this.notifiedReminders)));
    } catch { /* ignore */ }
  }

  start() {
    // bug17: защита от двойного запуска (двойной mount React или повторный вызов)
    if (this.checkInterval !== null) {
      return;
    }

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
      if (!settings.enabled) {
        
        return;
      }

      const permission = this.checkPermission();
      if (permission !== 'granted') {
        
        return;
      }

      const now = new Date();
      const currentMinute = `${now.getHours()}:${now.getMinutes()}`;
      
      // Проверяем только раз в минуту
      if (this.lastCheck === currentMinute) return;
      this.lastCheck = currentMinute;

      

      // Загружаем активные лекарства
      const medications = await this.loadMedications();
      if (!medications || medications.length === 0) {
        
        return;
      }

      

      // Проверяем каждое напоминание
      for (const medication of medications) {
        if (!medication.reminders || medication.reminders.length === 0) continue;

        for (const reminder of medication.reminders) {
          if (!reminder.enabled) continue;

          const notificationKey = `${medication.id}-${reminder.id}-${this.getTodayDate()}`;
          
          // Если уже уведомляли сегодня - пропускаем
          if (this.notifiedReminders.has(notificationKey)) continue;

          if (this.shouldNotify(reminder.time, settings.minutesBefore, now)) {
            await this.showNotification(medication.name, medication.dosage, reminder.time, settings);
            this.notifiedReminders.add(notificationKey);
            this.persistNotified();
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
      const medications = await healthApi.get<Medication[]>('medications');
      // Фильтруем только активные
      return medications.filter((m) => m.active);
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
    return { enabled: true, soundEnabled: true, minutesBefore: 15 };
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
      const notification = new Notification('Напоминание о приёме лекарства от Наша Семья', {
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
      this.persistNotified();
      console.log(`[MedicationNotifications] Cleaned up ${toRemove.length} old notifications`);
    }
  }
}

export const medicationNotificationService = new MedicationNotificationService();