// Утилита для работы с Яндекс.Метрикой

const METRIKA_ID = 106199026;

/**
 * Отправка события достижения цели в Яндекс.Метрику
 * @param goalName - название цели (например, 'registration_completed')
 * @param params - дополнительные параметры события
 */
export const sendMetrikaGoal = (goalName: string, params?: Record<string, unknown>) => {
  try {
    if (window.ym && typeof window.ym === 'function') {
      window.ym(METRIKA_ID, 'reachGoal', goalName, params);
      console.log(`[Метрика] Цель "${goalName}" отправлена`, params);
    } else {
      console.warn('[Метрика] window.ym не определён');
    }
  } catch (error) {
    console.error('[Метрика] Ошибка отправки цели:', error);
  }
};

/**
 * Список всех целей в проекте
 * 
 * ⚠️ ВАЖНО: После добавления новой цели здесь, создай её в Яндекс.Метрике!
 * https://metrika.yandex.ru/dashboard?id=106199026 → Цели → + Добавить цель
 */
export const METRIKA_GOALS = {
  // 🎯 Регистрация и авторизация
  REGISTRATION: 'registration_completed',        // JavaScript-событие
  LOGIN: 'login_completed',                      // JavaScript-событие
  
  // 📄 Просмотры страниц
  VIEW_PRICING: 'view_pricing_page',            // JavaScript-событие
  VIEW_FEATURES: 'view_features_page',          // JavaScript-событие
  
  // 💳 Действия с подписками (воронка продаж)
  CLICK_PREMIUM: 'click_premium_button',        // JavaScript-событие (клик "Оформить")
  PAYMENT_SUCCESS: 'payment_success',           // JavaScript-событие (успешная оплата)
  
  // ✅ Создание контента
  CREATE_TASK: 'create_task',                   // JavaScript-событие
  CREATE_EVENT: 'create_event',                 // JavaScript-событие
  ADD_CHILD: 'add_child_profile',               // JavaScript-событие
  ADD_RECIPE: 'add_recipe',                     // JavaScript-событие
  
  // 🤖 Использование AI
  USE_AI_ASSISTANT: 'use_ai_assistant',         // JavaScript-событие
  ASK_DOMOVOY: 'ask_domovoy_question',          // JavaScript-событие
} as const;