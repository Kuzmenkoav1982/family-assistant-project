import { useState, useEffect } from 'react';

const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';

interface SubscriptionStatus {
  has_subscription: boolean;
  plan?: string;
  plan_name?: string;
  status?: string;
  end_date?: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setSubscription({ has_subscription: false });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(PAYMENTS_API, {
          method: 'GET',
          headers: {
            'X-Auth-Token': token
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        } else {
          setSubscription({ has_subscription: false });
        }
      } catch (error) {
        console.error('Ошибка проверки подписки:', error);
        setSubscription({ has_subscription: false });
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  const hasAIAccess = subscription?.has_subscription && 
    (subscription.plan === 'ai_assistant' || 
     subscription.plan === 'full' ||
     subscription.plan === 'premium_1m' ||
     subscription.plan === 'premium_3m' ||
     subscription.plan === 'premium_6m' ||
     subscription.plan === 'premium_12m');

  const hasFullAccess = subscription?.has_subscription && 
    (subscription.plan === 'full' ||
     subscription.plan === 'premium_1m' ||
     subscription.plan === 'premium_3m' ||
     subscription.plan === 'premium_6m' ||
     subscription.plan === 'premium_12m');

  return {
    subscription,
    loading,
    hasAIAccess,
    hasFullAccess,
    hasPlan: subscription?.has_subscription || false
  };
}