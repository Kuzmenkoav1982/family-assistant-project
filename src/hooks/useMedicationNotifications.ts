import { useEffect, useState } from 'react';

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

export function useMedicationNotifications(_medications: unknown[] = []) {
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

  // bug17: убран дублирующий setInterval. Единственный источник пушей —
  // medicationNotificationService в App.tsx (с persist-дедупликацией).
  // Этот хук оставлен только для запроса permission и UI-настроек.

  return {
    permission,
    settings,
    requestPermission,
    updateSettings,
    showNotification
  };
}