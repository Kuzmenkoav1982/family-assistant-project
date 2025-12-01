import { useState, useEffect, useRef } from 'react';

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
  const [hasFetched, setHasFetched] = useState(false);
  const hasFetchedRef = useRef(false);

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
      
      setHasFetched(true);
      hasFetchedRef.current = true;
      
      if (data.success && data.members) {
        // Конвертируем snake_case в camelCase для frontend
        const convertedMembers = data.members.map((m: any) => ({
          ...m,
          avatarType: m.avatar_type,
          photoUrl: m.photo_url
        }));
        console.log('[DEBUG useFamilyMembers] Converted members:', convertedMembers);
        setMembers(convertedMembers);
        setError(null);
      } else {
        if (!silent) {
          setError(data.error || 'Ошибка загрузки');
          setMembers([]);
        }
      }
    } catch (err) {
      setHasFetched(true);
      hasFetchedRef.current = true;
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
      // Конвертируем camelCase в snake_case для backend
      const backendData: any = { ...memberData };
      if (memberData.photoUrl) {
        backendData.photo_url = memberData.photoUrl;
        delete backendData.photoUrl;
      }
      if (memberData.avatarType) {
        backendData.avatar_type = memberData.avatarType;
        delete backendData.avatarType;
      }

      const response = await fetch(FAMILY_MEMBERS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'add',
          ...backendData
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

      // Конвертируем camelCase в snake_case для backend
      const backendData: any = { ...memberData };
      if (memberData.photoUrl) {
        backendData.photo_url = memberData.photoUrl;
        delete backendData.photoUrl;
      }
      if (memberData.avatarType) {
        backendData.avatar_type = memberData.avatarType;
        delete backendData.avatarType;
      }
      
      // Удаляем id из backendData, чтобы избежать дублирования
      delete backendData.id;
      delete backendData.member_id;

      console.log('[DEBUG updateMember] Sending data:', {
        action: 'update',
        member_id: memberId,
        ...backendData
      });

      const response = await fetch(FAMILY_MEMBERS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'update',
          member_id: memberId,
          ...backendData
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

  // Polling: проверяем появление токена каждые 100мс в течение 10 секунд
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 100; // 100 * 100ms = 10 секунд
    let isMounted = true;
    
    const checkTokenInterval = setInterval(() => {
      attempts++;
      const token = getAuthToken();
      
      console.log(`[DEBUG useFamilyMembers POLLING] Attempt ${attempts}/${maxAttempts}, token:`, token ? 'EXISTS' : 'MISSING', 'hasFetched:', hasFetchedRef.current);
      
      if (token && !hasFetchedRef.current && isMounted) {
        console.log('[DEBUG useFamilyMembers POLLING] Token found and not fetched yet! Calling fetchMembers...');
        fetchMembers();
        clearInterval(checkTokenInterval);
      }
      
      if (attempts >= maxAttempts) {
        console.log('[DEBUG useFamilyMembers POLLING] Max attempts reached, stopping');
        clearInterval(checkTokenInterval);
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 100);

    return () => {
      isMounted = false;
      clearInterval(checkTokenInterval);
    };
  }, []);

  // Периодическое обновление (каждые 30 секунд)
  useEffect(() => {
    const interval = setInterval(() => {
      const token = getAuthToken();
      if (token && hasFetchedRef.current) {
        fetchMembers(true);
      }
    }, 30000); // 30 секунд вместо 5
    
    return () => clearInterval(interval);
  }, []);

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