const CACHE_NAME = 'family-assistant-v12';
let geolocationIntervalId = null;

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
  console.log('[SW] Push event received!', event);
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
    console.log('[SW] Push data:', data);
  } catch (error) {
    console.error('[SW] Failed to parse push data:', error);
  }
  
  const title = data.title || 'Семейный Ассистент';
  const options = {
    body: data.body || data.message || 'У вас новое уведомление',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Открыть',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ]
  };

  console.log('[SW] Showing notification:', title, options);
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[SW] Notification shown successfully!'))
      .catch(err => console.error('[SW] Failed to show notification:', err))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});