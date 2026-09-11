const CACHE_NAME = 'family-assistant-v15';
let geolocationIntervalId = null;

// SEC-2026-001: фоновый сбор координат приостановлен.
//
// Версия бампнута намеренно: у части пользователей трекинг уже был запущен,
// и старый service worker продолжал бы будить вкладки и запрашивать GPS
// каждые 10 минут даже после того, как backend перестал принимать точки.
// Отказ сервера не отменяет того, что у человека на устройстве всё это
// время запрашивают местоположение. Поэтому выключаем здесь, а не только
// на сервере: сбор должен прекратиться на устройстве.
const GEOLOCATION_DISABLED = true;

self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker...');
  event.waitUntil(
    Promise.resolve()
      .then(() => {
        console.log('[SW] Install complete, calling skipWaiting()');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // SEC-2026-001: гасим фоновый сбор, если он был запущен предыдущей
        // версией воркера. Без этого обновление кода ничего не изменило бы
        // для тех, у кого трекинг уже работает.
        if (geolocationIntervalId) {
          clearInterval(geolocationIntervalId);
          geolocationIntervalId = null;
          console.log('[SW] Background geolocation stopped (SEC-2026-001)');
        }
        console.log('[SW] Claiming clients...');
        return self.clients.claim();
      })
      .then(() => {
        console.log('[SW] Service worker activated and ready!');
      })
  );
});

self.addEventListener('fetch', (event) => {
  // НЕ перехватываем API запросы (избегаем CORS проблем)
  if (event.request.url.includes('functions.poehali.dev') || 
      event.request.url.includes('/api/')) {
    return; // Пропускаем API запросы
  }

  event.respondWith(
    fetch(event.request).catch((error) => {
      console.log('[SW] Fetch failed, returning offline page:', error);
      if (event.request.mode === 'navigate') {
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Офлайн</title></head><body><h1>Нет соединения</h1><p>Проверьте интернет-соединение</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      }
      return new Response('Network error', { status: 408, statusText: 'Network error' });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Управление фоновой геолокацией
  if (event.data && event.data.type === 'START_GEOLOCATION') {
    if (GEOLOCATION_DISABLED) {
      console.log('[SW] Geolocation disabled (SEC-2026-001), ignoring start');
      if (geolocationIntervalId) {
        clearInterval(geolocationIntervalId);
        geolocationIntervalId = null;
      }
      return;
    }
    console.log('[SW] Starting background geolocation tracking');
    const interval = event.data.interval || 600000; // 10 минут по умолчанию
    const apiUrl = event.data.apiUrl;
    const authToken = event.data.authToken;
    
    if (geolocationIntervalId) {
      clearInterval(geolocationIntervalId);
    }
    
    // Функция отправки координат
    const sendLocation = async () => {
      try {
        // Запрос координат из всех активных клиентов
        const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
        
        for (const client of clients) {
          client.postMessage({
            type: 'REQUEST_LOCATION',
            apiUrl,
            authToken
          });
        }
      } catch (error) {
        console.error('[SW] Error requesting location:', error);
      }
    };
    
    // Отправить координаты сразу
    sendLocation();
    
    // Настроить периодическую отправку
    geolocationIntervalId = setInterval(sendLocation, interval);
  }
  
  if (event.data && event.data.type === 'STOP_GEOLOCATION') {
    console.log('[SW] Stopping background geolocation tracking');
    if (geolocationIntervalId) {
      clearInterval(geolocationIntervalId);
      geolocationIntervalId = null;
    }
  }
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('[SW] Failed to parse push data:', error);
  }
  
  const title = data.title || 'Семейный Ассистент';
  const targetUrl = data.url || '/notifications';
  
  const options = {
    body: data.body || data.message || 'У вас новое уведомление',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.type || 'general',
    renotify: true,
    data: {
      url: targetUrl,
      type: data.type || 'general',
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'open', title: 'Открыть' },
      { action: 'close', title: 'Закрыть' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data && event.notification.data.url 
    ? event.notification.data.url 
    : '/notifications';
  
  const fullUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            client.postMessage({ type: 'NAVIGATE', url: targetUrl });
            return client.focus();
          }
        }
        for (const client of clientList) {
          if ('focus' in client) {
            client.postMessage({ type: 'NAVIGATE', url: targetUrl });
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});