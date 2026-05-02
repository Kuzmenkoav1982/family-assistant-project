import { useState } from 'react';

const EXPORT_API = 'https://functions.poehali.dev/6db20156-2ce6-4ba2-923b-b3e8faf8a58b';
const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';
const AUTH_API = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';

export function useSettingsActions() {
  const [isExporting, setIsExporting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [chamomileEnabled, setChamomileEnabled] = useState(() => {
    return localStorage.getItem('chamomileEnabled') !== 'false';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false';
  });

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const response = await fetch(`${EXPORT_API}?format=${format}`, {
        headers: {
          'X-Auth-Token': getAuthToken()
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `family_export_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'html'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert('✅ Данные экспортированы!');
      } else {
        alert('❌ Ошибка экспорта данных');
      }
    } catch (error) {
      alert('❌ Ошибка сети');
    } finally {
      setIsExporting(false);
    }
  };

  const checkSubscription = async () => {
    setLoadingSubscription(true);
    try {
      const response = await fetch(PAYMENTS_API, {
        headers: {
          'X-Auth-Token': getAuthToken()
        }
      });
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const createSubscription = async (planType: string) => {
    try {
      const response = await fetch(PAYMENTS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'create',
          plan_type: planType,
          return_url: window.location.href
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.payment_url;
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка создания подписки');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${AUTH_API}?action=delete_account`, {
        method: 'POST',
        headers: {
          'X-Auth-Token': getAuthToken()
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Аккаунт успешно удалён');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка удаления аккаунта');
    }
  };

  return {
    isExporting,
    subscription,
    loadingSubscription,
    chamomileEnabled,
    soundEnabled,
    setChamomileEnabled,
    setSoundEnabled,
    handleExport,
    checkSubscription,
    createSubscription,
    handleDeleteAccount,
  };
}