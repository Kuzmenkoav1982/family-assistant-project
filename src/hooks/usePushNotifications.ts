import { useState, useEffect } from 'react';

const PUSH_API_URL = 'https://functions.poehali.dev/3c808a69-0f14-4db0-b486-3e2a0e273a94';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const isIOS = () => {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

const isStandalone = () => {
  return ('standalone' in window.navigator) && ((window.navigator as any).standalone === true);
};

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isIOSPWA, setIsIOSPWA] = useState(false);

  useEffect(() => {
    const iosDevice = isIOS();
    const iosPWA = isStandalone();
    
    setIsIOSDevice(iosDevice);
    setIsIOSPWA(iosPWA);

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    } else if (iosDevice && !iosPWA) {
      setIsSupported(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribe = async () => {
    console.log('[DEBUG Push Hook] Starting subscribe...');
    
    if (!isSupported) {
      console.log('[DEBUG Push Hook] Not supported');
      alert('Push-уведомления не поддерживаются в вашем браузере');
      return false;
    }

    setIsLoading(true);

    try {
      console.log('[DEBUG Push Hook] Requesting permission...');
      const permission = await Notification.requestPermission();
      setPermission(permission);
      console.log('[DEBUG Push Hook] Permission result:', permission);

      if (permission !== 'granted') {
        console.log('[DEBUG Push Hook] Permission denied');
        alert('Вы отклонили разрешение на уведомления');
        setIsLoading(false);
        return false;
      }

      console.log('[DEBUG Push Hook] Waiting for service worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('[DEBUG Push Hook] Service worker ready');
      
      const vapidPublicKey = 'BFI48D8n8_Yk-OyCsKWzqOYt8RLTQSfkCwwh1ck36dvnMc3vCTbkgv2a64JV19MqYGe7NY2dKJoW2JZIaaLbkqQ';
      
      console.log('[DEBUG Push Hook] Creating push subscription...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      console.log('[DEBUG Push Hook] Push subscription created:', subscription);

      const token = localStorage.getItem('authToken');
      console.log('[DEBUG Push Hook] Auth token present:', !!token);
      console.log('[DEBUG Push Hook] Sending to backend:', PUSH_API_URL);
      
      const response = await fetch(PUSH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'subscribe',
          subscription: subscription.toJSON()
        })
      });

      console.log('[DEBUG Push Hook] Backend response status:', response.status);
      const result = await response.json();
      console.log('[DEBUG Push Hook] Backend response data:', result);

      if (result.success) {
        console.log('[DEBUG Push Hook] Successfully subscribed!');
        setIsSubscribed(true);
        setIsLoading(false);
        return true;
      } else {
        throw new Error(result.error || 'Failed to save subscription');
      }
    } catch (error) {
      console.error('[ERROR Push Hook] Subscribe error:', error);
      alert('Ошибка подписки на уведомления');
      setIsLoading(false);
      return false;
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      const token = localStorage.getItem('authToken');
      
      await fetch(PUSH_API_URL, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': token || ''
        }
      });

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setIsLoading(false);
      return false;
    }
  };

  const sendTestNotification = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(PUSH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'send',
          title: 'Тестовое уведомление',
          message: 'Это тестовое push-уведомление от Семейного Ассистента!'
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    isIOSDevice,
    isIOSPWA
  };
}