import { useState, useEffect } from 'react';

interface FamilyMember {
  id: string;
  user_id?: string;
  name: string;
  role: string;
  relationship?: string;
  avatar: string;
  avatar_type: string;
  photo_url?: string;
  points: number;
  level: number;
  workload: number;
  age?: number;
  created_at: string;
  updated_at: string;
  dreams?: any[];
  piggyBank?: number;
  achievements?: string[];
  responsibilities?: string[];
}

const FAMILY_MEMBERS_API = 'https://functions.poehali.dev/39a1ae0b-c445-4408-80a0-ce02f5a25ce5';

export function useFamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const fetchMembers = async (silent = false) => {
    const token = getAuthToken();
    console.log('[DEBUG useFamilyMembers] Starting fetch, token:', token ? 'EXISTS' : 'MISSING');
    console.log('[DEBUG useFamilyMembers] API URL:', FAMILY_MEMBERS_API);
    
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await fetch(FAMILY_MEMBERS_API, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token
        }
      });

      console.log('[DEBUG useFamilyMembers] Response status:', response.status);
      console.log('[DEBUG useFamilyMembers] Response ok:', response.ok);

      if (!response.ok) {
        throw new Error('Ошибка загрузки членов семьи');
      }

      const data = await response.json();
      console.log('[DEBUG useFamilyMembers] Response data:', data);
      console.log('[DEBUG useFamilyMembers] data.success:', data.success);
      console.log('[DEBUG useFamilyMembers] data.members:', data.members);
      
      if (data.success && data.members) {
        setMembers(data.members);
        setError(null);
      } else {
        if (!silent) {
          setError(data.error || 'Ошибка загрузки');
          setMembers([]);
        }
      }
    } catch (err) {
      if (!silent) {
        setError('Ошибка загрузки данных');
        setMembers([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const addMember = async (memberData: Partial<FamilyMember>) => {
    try {
      const response = await fetch(FAMILY_MEMBERS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'add',
          ...memberData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchMembers();
        return { success: true, member: data.member };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Ошибка добавления члена семьи' };
    }
  };

  const updateMember = async (memberData: Partial<FamilyMember> & { id?: string; member_id?: string }) => {
    try {
      const memberId = memberData.id || memberData.member_id;
      if (!memberId) {
        return { success: false, error: 'Не указан ID члена семьи' };
      }

      const response = await fetch(FAMILY_MEMBERS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'update',
          member_id: memberId,
          ...memberData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchMembers();
        return { success: true, member: data.member };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Ошибка обновления члена семьи' };
    }
  };

  const deleteMember = async (memberId: string) => {
    try {
      const response = await fetch(FAMILY_MEMBERS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'delete',
          member_id: memberId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchMembers();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Ошибка удаления члена семьи' };
    }
  };

  // Первоначальная загрузка при монтировании
  useEffect(() => {
    const token = getAuthToken();
    console.log('[DEBUG useFamilyMembers useEffect MOUNT] Token check:', token ? 'EXISTS' : 'MISSING');
    
    if (!token) {
      console.log('[DEBUG useFamilyMembers useEffect MOUNT] No token, setting loading = false');
      setLoading(false);
      return;
    }
    
    console.log('[DEBUG useFamilyMembers useEffect MOUNT] Token found, calling fetchMembers');
    fetchMembers();
    
    const interval = setInterval(() => {
      const currentToken = getAuthToken();
      if (currentToken) {
        fetchMembers(true);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Дополнительная проверка каждые 100мс — если токен появился, загружаем данные
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      const token = getAuthToken();
      if (token && members.length === 0 && !loading) {
        console.log('[DEBUG useFamilyMembers TOKEN CHECK] Token appeared! Fetching members...');
        fetchMembers();
        clearInterval(checkTokenInterval);
      }
    }, 100);

    // Очистка через 10 секунд
    const cleanup = setTimeout(() => {
      clearInterval(checkTokenInterval);
    }, 10000);

    return () => {
      clearInterval(checkTokenInterval);
      clearTimeout(cleanup);
    };
  }, [members, loading]);

  return {
    members,
    loading,
    error,
    fetchMembers,
    addMember,
    updateMember,
    deleteMember
  };
}