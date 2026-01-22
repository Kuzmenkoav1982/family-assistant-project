import { useEffect } from 'react';
import { useSubscription } from './useSubscription';
import { useNotifications } from './useNotifications';

export function useSubscriptionReminder() {
  const { subscription } = useSubscription();
  const { notifySubscriptionExpiring } = useNotifications();

  useEffect(() => {
    const checkExpiration = () => {
      if (!subscription?.has_subscription || !subscription.end_date) return;

      const endDate = new Date(subscription.end_date);
      const now = new Date();
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 0) return;

      const notificationKey = `subscription_notif_${daysLeft}_${endDate.toDateString()}`;
      const alreadyNotified = localStorage.getItem(notificationKey);

      if ([7, 3, 1].includes(daysLeft) && !alreadyNotified) {
        notifySubscriptionExpiring(daysLeft);
        localStorage.setItem(notificationKey, 'true');
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('subscription_notif_') && !key.includes(now.toDateString())) {
          localStorage.removeItem(key);
        }
      });
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 3600000);

    return () => clearInterval(interval);
  }, [subscription, notifySubscriptionExpiring]);
}
