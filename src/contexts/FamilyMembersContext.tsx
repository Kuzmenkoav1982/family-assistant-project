import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DialogLockContext } from '@/contexts/DialogLockContext';
import { initialFamilyMembers } from '@/data/mockData';

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
  dreams?: Array<{id: string; text: string; created_at: string}>;
  piggyBank?: number;
  achievements?: string[];
  responsibilities?: string[];
  permissions?: Record<string, boolean>;
}

interface FamilyMembersContextType {
  members: FamilyMember[];
  loading: boolean;
  error: string | null;
  familyId: string | null;
  fetchMembers: (silent?: boolean) => Promise<void>;
  addMember: (memberData: Partial<FamilyMember>) => Promise<{success: boolean; member?: FamilyMember; error?: string}>;
  updateMember: (memberData: Partial<FamilyMember> & { id?: string; member_id?: string }) => Promise<{success: boolean; error?: string}>;
  deleteMember: (memberId: string) => Promise<{success: boolean; error?: string}>;
}

export const FamilyMembersContext = createContext<FamilyMembersContextType | undefined>(undefined);

const FAMILY_MEMBERS_API = 'https://functions.poehali.dev/39a1ae0b-c445-4408-80a0-ce02f5a25ce5';

export function FamilyMembersProvider({ children }: { children: React.ReactNode }) {
  const dialogLock = useContext(DialogLockContext);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(() => localStorage.getItem('familyId'));
  const isFetchingRef = useRef(false);
  const hasInitialFetchRef = useRef(false);
  const dialogLockRef = useRef(dialogLock);
  const prevDemoModeRef = useRef<boolean | null>(null);

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const getMemberSortPriority = (member: FamilyMember, currentUserMemberId?: string): number => {
    if (currentUserMemberId && member.id === currentUserMemberId) return 0;
    const role = (member.role || '').toLowerCase();
    const rel = (member.relationship || '').toLowerCase();
    if (role === 'владелец') return 1;
    if (['жена', 'муж', 'супруга', 'супруг'].some(r => role.includes(r) || rel.includes(r))) return 2;
    if (['сын', 'дочь', 'ребёнок', 'ребенок'].some(r => role.includes(r) || rel.includes(r))) return 3;
    if (['бабушка', 'дедушка'].some(r => role.includes(r) || rel.includes(r))) return 4;
    return 5;
  };

  const sortMembers = (members: FamilyMember[], apiCurrentMemberId?: string): FamilyMember[] => {
    let currentUserMemberId = apiCurrentMemberId;
    if (!currentUserMemberId) {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          currentUserMemberId = parsed.member_id;
        }
      } catch { /* ignore */ }
    }

    return [...members].sort((a, b) => {
      const priorityA = getMemberSortPriority(a, currentUserMemberId);
      const priorityB = getMemberSortPriority(b, currentUserMemberId);
      if (priorityA !== priorityB) return priorityA - priorityB;
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateA - dateB;
    });
  };

  const fetchMembers = useCallback(async (silent = false) => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    
    // Проверяем демо-режим ТОЛЬКО если пользователь НЕ авторизован
    const authToken = localStorage.getItem('authToken');
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    
    if (isDemoMode && !authToken) {
      // В демо-режиме используем моковые данные
      
      if (!silent) {
        setLoading(true);
      }
      
      // Имитируем небольшую задержку загрузки
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const convertedMembers = initialFamilyMembers.map((m: Partial<FamilyMember> & {photoUrl?: string; avatarType?: string}) => ({
        ...m,
        user_id: `demo_${m.id}`,
        avatar_type: 'emoji',
        avatarType: 'emoji',
        photo_url: m.photoUrl || '',
        photoUrl: m.photoUrl || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        achievements: m.achievements || [],
        responsibilities: m.responsibilities || [],
        foodPreferences: m.foodPreferences || { favorites: [], dislikes: [] },
        dreams: m.dreams || [],
        piggyBank: m.piggyBank || 0,
        moodStatus: m.moodStatus || null,
        permissions: {}
      }));
      
      setMembers(sortMembers(convertedMembers));
      setError(null);
      setLoading(false);
      isFetchingRef.current = false;
      hasInitialFetchRef.current = true;
      return;
    }
    
    const token = getAuthToken();
    
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await fetch(FAMILY_MEMBERS_API, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token
        },
        signal: AbortSignal.timeout(10000) // Таймаут 10 секунд
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки членов семьи');
      }

      const data = await response.json();
      
      
      if (data.success && data.members) {
        if (data.family_id) {
          localStorage.setItem('familyId', data.family_id);
          setFamilyId(data.family_id);
        }
        
        const convertedMembers = data.members.map((m: Partial<FamilyMember> & {photo_url?: string; avatar_type?: string}) => ({
          ...m,
          avatarType: m.avatar_type,
          photoUrl: m.photo_url,
          achievements: m.achievements || [],
          responsibilities: m.responsibilities || [],
          foodPreferences: m.foodPreferences || { favorites: [], dislikes: [] },
          dreams: m.dreams || [],
          piggyBank: m.piggyBank || 0,
          moodStatus: m.moodStatus || null
        }));
        
        const sortedMembers = sortMembers(convertedMembers, data.current_member_id);
        
        setMembers(sortedMembers);
        setError(null);
      } else {
        console.warn('[FamilyMembersContext] Failed to load members:', data.error);
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
      isFetchingRef.current = false;
    }
  }, []);

  const addMember = async (memberData: Partial<FamilyMember>) => {
    try {
      const familyId = localStorage.getItem('familyId');
      if (familyId) {
        try {
          const limitsResponse = await fetch('https://functions.poehali.dev/b92c4b01-02db-4805-95d0-c79df5b10d1a', {
            headers: { 'X-Family-Id': familyId }
          });
          const limitsData = await limitsResponse.json();
          
          if (!limitsData.limits.family_members.allowed) {
            return { success: false, error: 'Лимит членов семьи исчерпан. Перейдите на Premium.' };
          }
        } catch {
          // ignore
        }
      }

      const backendData: Record<string, unknown> = { ...memberData };
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
        }),
        signal: AbortSignal.timeout(15000) // Таймаут 15 секунд для добавления
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

      const backendData: Record<string, unknown> = { ...memberData };
      
      // Конвертируем camelCase в snake_case для backend
      if (memberData.photoUrl) {
        backendData.photo_url = memberData.photoUrl;
        delete backendData.photoUrl;
      }
      if (memberData.avatarType) {
        backendData.avatar_type = memberData.avatarType;
        delete backendData.avatarType;
      }
      
      // Сохраняем profile_data поля как есть (бэкенд их обработает)
      // achievements, responsibilities, foodPreferences, dreams, piggyBank, moodStatus
      // Они уже в правильном формате
      
      delete backendData.id;
      delete backendData.member_id;

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

  useEffect(() => {
    dialogLockRef.current = dialogLock;
  }, [dialogLock]);

  useEffect(() => {
    const token = getAuthToken();
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    
    // Загружаем данные если есть токен ИЛИ активен демо-режим
    if ((token || isDemoMode) && !hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true;
      fetchMembers();
    } else if (!token && !isDemoMode) {
      setLoading(false);
    }
  }, []);

  // Подписка на изменение демо-режима
  useEffect(() => {
    const checkDemoModeChange = () => {
      const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
      
      // Проверяем, изменился ли демо-режим
      if (prevDemoModeRef.current !== isDemoMode) {
        prevDemoModeRef.current = isDemoMode;
        
        // Перезагружаем данные только если режим изменился на demo
        if (isDemoMode && !isFetchingRef.current) {
          hasInitialFetchRef.current = false; // Сбрасываем флаг чтобы данные перезагрузились
          fetchMembers();
        }
      }
    };

    const interval = setInterval(checkDemoModeChange, 500);
    return () => clearInterval(interval);
  }, [fetchMembers]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (dialogLockRef.current?.isDialogOpen) {
        return;
      }
      
      const token = getAuthToken();
      const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
      if ((token || isDemoMode) && hasInitialFetchRef.current && !isFetchingRef.current) {
        fetchMembers(true);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchMembers]);

  return (
    <FamilyMembersContext.Provider
      value={{
        members,
        loading,
        error,
        familyId,
        fetchMembers,
        addMember,
        updateMember,
        deleteMember
      }}
    >
      {children}
    </FamilyMembersContext.Provider>
  );
}

export function useFamilyMembersContext() {
  const context = useContext(FamilyMembersContext);
  if (context === undefined) {
    throw new Error('useFamilyMembersContext must be used within FamilyMembersProvider');
  }
  return context;
}