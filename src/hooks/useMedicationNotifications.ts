import { useEffect, useState } from 'react';

interface MedicationSchedule {
  id: string;
  medication_id: string;
  time_of_day: string;
  medication_name?: string;
}

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  minutesBefore: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  minutesBefore: 15
};

export function useMedicationNotifications(medications: any[] = []) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('medicationNotificationSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Ваш браузер не поддерживает уведомления');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('medicationNotificationSettings', JSON.stringify(updated));
  };

  const showNotification = (title: string, body: string, medicationId?: string) => {
    if (permission !== 'granted' || !settings.enabled) return;

    const notification = new Notification(title, {
      body,
      icon: '💊',
      badge: '💊',
      tag: medicationId || 'medication',
      requireInteraction: true,
      data: { medicationId }
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => notification.close(), 10000);
  };

  useEffect(() => {
    if (!settings.enabled || medications.length === 0) return;

    const checkSchedule = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      medications.forEach((med: any) => {
        if (!med.schedule || med.schedule.length === 0) return;

        med.schedule.forEach((schedule: MedicationSchedule) => {
          const [hours, minutes] = schedule.time_of_day.split(':').map(Number);
          const scheduledTime = hours * 60 + minutes;
          const timeDiff = scheduledTime - currentTime;

          const notificationKey = `med_notif_${med.id}_${schedule.id}_${now.toDateString()}`;
          const alreadyNotified = localStorage.getItem(notificationKey);

          if (timeDiff === settings.minutesBefore && !alreadyNotified) {
            showNotification(
              '⏰ Напоминание о приёме лекарства',
              `Через ${settings.minutesBefore} минут нужно дать ребёнку ${med.name} (${med.dosage || 'по назначению'})`,
              med.id
            );
            localStorage.setItem(notificationKey, 'true');
          }

          if (timeDiff === 0 && !alreadyNotified) {
            showNotification(
              '💊 Время принять лекарство!',
              `Сейчас нужно дать ребёнку ${med.name} (${med.dosage || 'по назначению'})`,
              med.id
            );
            localStorage.setItem(notificationKey, 'true');
          }
        });
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('med_notif_') && !key.includes(now.toDateString())) {
          localStorage.removeItem(key);
        }
      });
    };

    const interval = setInterval(checkSchedule, 60000);
    checkSchedule();

    return () => clearInterval(interval);
  }, [medications, settings, permission]);

  return {
    permission,
    settings,
    requestPermission,
    updateSettings,
    showNotification
  };
}
