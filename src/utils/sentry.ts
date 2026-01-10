// Интеграция Sentry для отслеживания ошибок
// После регистрации в Sentry добавь DSN в этот файл

import * as Sentry from '@sentry/react';

// ⚠️ ВАЖНО: После создания проекта в Sentry замени на свой DSN!
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';

export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN не настроен. Добавь VITE_SENTRY_DSN в .env');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Производительность: отслеживание 10% транзакций
    tracesSampleRate: 0.1,

    // Session Replay: записывать 10% сессий
    replaysSessionSampleRate: 0.1,
    
    // При ошибке записывать 100% сессий
    replaysOnErrorSampleRate: 1.0,

    // Окружение
    environment: import.meta.env.MODE, // 'development' или 'production'

    // Игнорировать определённые ошибки
    ignoreErrors: [
      // Игнорируем ошибки расширений браузера
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],

    beforeSend(event) {
      // Не отправляем события в dev-режиме
      if (import.meta.env.MODE === 'development') {
        console.log('[Sentry] Ошибка (не отправлена в dev):', event);
        return null;
      }
      return event;
    },
  });

  console.log('[Sentry] Инициализирован');
};

/**
 * Отправка пользовательского события в Sentry
 */
export const logSentryMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.captureMessage(message, level);
};

/**
 * Установка данных пользователя для Sentry
 */
export const setSentryUser = (userId: string, email?: string, name?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    username: name,
  });
};

/**
 * Очистка данных пользователя (при выходе)
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Добавление контекста к ошибкам
 */
export const addSentryBreadcrumb = (category: string, message: string, data?: Record<string, unknown>) => {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
};
