import { useAuth } from './useAuth';

const FUNC2URL = {
  'push-notifications': 'https://functions.poehali.dev/3c808a69-0f14-4db0-b486-3e2a0e273a94'
};

export interface NotificationPayload {
  title: string;
  message: string;
  icon?: string;
  url?: string;
  data?: Record<string, any>;
}

export interface NotificationRecipients {
  familyMembers?: string[];
  specificMembers?: string[];
  excludeCurrentUser?: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();

  const sendNotification = async (
    payload: NotificationPayload,
    recipients?: NotificationRecipients
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('[Notifications] No auth token, skipping notification');
        return { success: false, error: 'No auth token' };
      }

      const response = await fetch(FUNC2URL['push-notifications'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({
          action: 'send',
          title: payload.title,
          message: payload.message,
          icon: payload.icon || '/icon-192.png',
          url: payload.url || '/',
          data: payload.data,
          recipients,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Notifications] Send failed:', errorData);
        return { success: false, error: errorData.error || 'Send failed' };
      }

      const result = await response.json();
      return { success: result.success !== false };
    } catch (error) {
      console.error('[Notifications] Error:', error);
      return { success: false, error: String(error) };
    }
  };

  const notifyVotingCreated = async (votingTitle: string, votingId: string) => {
    return sendNotification({
      title: '🗳️ Новое голосование',
      message: `"${votingTitle}" — проголосуйте!`,
      url: '/votings',
      data: { type: 'voting', votingId },
    });
  };

  const notifyUrgentShopping = async (itemName: string) => {
    return sendNotification({
      title: '🚨 Срочная покупка',
      message: `Нужно срочно купить: ${itemName}`,
      url: '/shopping',
      data: { type: 'shopping', urgent: true },
    });
  };

  const notifyTaskAssigned = async (taskTitle: string, assigneeName: string, taskId: string) => {
    return sendNotification({
      title: '✅ Новая задача',
      message: `${assigneeName}, вам назначена задача: "${taskTitle}"`,
      url: '/tasks',
      data: { type: 'task', taskId },
    });
  };

  const notifyCalendarEvent = async (eventTitle: string, eventDate: string, isUpdate: boolean = false) => {
    return sendNotification({
      title: isUpdate ? '📅 Событие изменено' : '📅 Новое событие',
      message: `${eventTitle} — ${eventDate}`,
      url: '/calendar',
      data: { type: 'calendar', isUpdate },
    });
  };

  const notifySubscriptionExpiring = async (daysLeft: number) => {
    return sendNotification({
      title: '⚠️ Подписка истекает',
      message: `Ваша подписка заканчивается через ${daysLeft} ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}`,
      url: '/settings',
      data: { type: 'subscription', daysLeft },
    });
  };

  const notifyMedicationReminder = async (medicationName: string, childName: string, time: string) => {
    return sendNotification({
      title: `💊 Лекарство для ${childName}`,
      message: `${medicationName} в ${time}`,
      url: '/medications',
      data: { type: 'medication' },
    });
  };

  const notifyBirthday = async (name: string, isTomorrow: boolean = true) => {
    return sendNotification({
      title: '🎂 День рождения',
      message: isTomorrow ? `Завтра день рождения ${name}!` : `Сегодня день рождения ${name}!`,
      url: '/family',
      data: { type: 'birthday' },
    });
  };

  return {
    sendNotification,
    notifyVotingCreated,
    notifyUrgentShopping,
    notifyTaskAssigned,
    notifyCalendarEvent,
    notifySubscriptionExpiring,
    notifyMedicationReminder,
    notifyBirthday,
  };
};