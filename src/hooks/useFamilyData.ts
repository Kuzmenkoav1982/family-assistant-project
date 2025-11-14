import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://functions.poehali.dev/5cab3ca7-6fa8-4ffb-b9d1-999d93d29d2e';

interface FamilyData {
  members: any[];
  tasks: any[];
  children_profiles: any[];
  test_results: any[];
  calendar_events: any[];
  family_values: any[];
  traditions: any[];
  blog_posts: any[];
  family_album: any[];
  family_tree: any[];
  chat_messages: any[];
  family_needs: any[];
}

export function useFamilyData() {
  const [data, setData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const fetchFamilyData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setData(result.data);
        
        // Сохраняем в localStorage для офлайн доступа
        localStorage.setItem('family_data_cache', JSON.stringify(result.data));
        localStorage.setItem('family_data_last_sync', new Date().toISOString());
        
        setError(null);
      } else {
        setError(result.error || 'Ошибка загрузки данных');
        
        // Пытаемся загрузить из кэша
        const cached = localStorage.getItem('family_data_cache');
        if (cached) {
          setData(JSON.parse(cached));
        }
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      
      // Загружаем из кэша при ошибке
      const cached = localStorage.getItem('family_data_cache');
      if (cached) {
        setData(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTestResult = async (childMemberId: string, testData: any) => {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: 'Требуется авторизация' };
    }

    try {
      setSyncing(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'save_test_result',
          childMemberId,
          testData
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Обновляем данные после сохранения
        await fetchFamilyData();
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Ошибка сохранения' };
      }
    } catch (err) {
      return { success: false, error: 'Ошибка соединения с сервером' };
    } finally {
      setSyncing(false);
    }
  };

  const getLastSyncTime = () => {
    const lastSync = localStorage.getItem('family_data_last_sync');
    return lastSync ? new Date(lastSync) : null;
  };

  const syncData = async () => {
    await fetchFamilyData();
  };

  useEffect(() => {
    fetchFamilyData();
    
    // Автосинхронизация каждую минуту
    const syncInterval = setInterval(() => {
      fetchFamilyData();
    }, 60000); // 60 секунд
    
    return () => clearInterval(syncInterval);
  }, [fetchFamilyData]);

  return {
    data,
    loading,
    error,
    syncing,
    syncData,
    saveTestResult,
    getLastSyncTime
  };
}