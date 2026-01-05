const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';

export interface Subscription {
  has_subscription: boolean;
  plan: string;
  plan_name?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  auto_renew?: boolean;
}

export const subscriptionService = {
  /**
   * Получить текущую подписку пользователя
   */
  async getSubscription(): Promise<Subscription> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { has_subscription: false, plan: 'free' };
    }

    try {
      const response = await fetch(PAYMENTS_API, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки подписки');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка получения подписки:', error);
      return { has_subscription: false, plan: 'free' };
    }
  },

  /**
   * Создать платёж для подписки
   */
  async createPayment(planType: string, returnUrl?: string): Promise<{ success: boolean; payment_url?: string; error?: string }> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Требуется авторизация');
    }

    try {
      const response = await fetch(PAYMENTS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'create',
          plan_type: planType,
          return_url: returnUrl || window.location.origin + '/pricing?status=success'
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка создания платежа:', error);
      return { success: false, error: 'Ошибка сети' };
    }
  },

  /**
   * Проверить, имеет ли пользователь доступ к функции
   */
  async hasAccess(feature: 'ai_assistant' | 'full'): Promise<boolean> {
    const subscription = await this.getSubscription();
    
    if (!subscription.has_subscription) {
      return false;
    }

    const plan = subscription.plan;
    
    // Полный пакет имеет доступ ко всему
    if (plan === 'full') {
      return true;
    }

    // AI-помощник доступен только в тарифе ai_assistant или full
    if (feature === 'ai_assistant' && plan === 'ai_assistant') {
      return true;
    }

    return false;
  },

  /**
   * Получить название плана для отображения
   */
  getPlanName(plan: string): string {
    const plans: Record<string, string> = {
      'free': 'Бесплатный',
      'ai_assistant': 'AI-Помощник',
      'full': 'Полный пакет'
    };
    return plans[plan] || 'Неизвестный';
  }
};
