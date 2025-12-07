import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DialogLockContext } from '@/contexts/DialogLockContext';

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

interface FamilyMembersContextType {
  members: FamilyMember[];
  loading: boolean;
  error: string | null;
  fetchMembers: (silent?: boolean) => Promise<void>;
  addMember: (memberData: Partial<FamilyMember>) => Promise<any>;
  updateMember: (memberData: Partial<FamilyMember> & { id?: string; member_id?: string }) => Promise<any>;
  deleteMember: (memberId: string) => Promise<any>;
}

const FamilyMembersContext = createContext<FamilyMembersContextType | undefined>(undefined);

const FAMILY_MEMBERS_API = 'https://functions.poehali.dev/39a1ae0b-c445-4408-80a0-ce02f5a25ce5';

export function FamilyMembersProvider({ children }: { children: React.ReactNode }) {
  const dialogLock = useContext(DialogLockContext);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  const hasInitialFetchRef = useRef(false);

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const fetchMembers = useCallback(async (silent = false) => {
    if (isFetchingRef.current) {
      console.log('[FamilyMembersContext] Fetch already in progress, skipping');
      return;
    }

    isFetchingRef.current = true;
    const token = getAuthToken();
    console.log('[DEBUG FamilyMembersContext] Starting fetch, token:', token ? 'EXISTS' : 'MISSING');
    
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

      console.log('[DEBUG FamilyMembersContext] Response status:', response.status);

      if (!response.ok) {
        throw new Error('Ошибка загрузки членов семьи');
      }

      const data = await response.json();
      console.log('[DEBUG FamilyMembersContext] Response data:', data);
      
      if (data.success && data.members) {
        if (data.family_id) {
          localStorage.setItem('familyId', data.family_id);
          console.log('[DEBUG FamilyMembersContext] Saved familyId:', data.family_id);
        }
        
        const convertedMembers = data.members.map((m: any) => ({
          ...m,
          avatarType: m.avatar_type,
          photoUrl: m.photo_url
        }));
        console.log('[DEBUG FamilyMembersContext] Converted members:', convertedMembers);
        setMembers(convertedMembers);
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
      isFetchingRef.current = false;
    }
  }, []);

  const addMember = async (memberData: Partial<FamilyMember>) => {
    try {
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

      const backendData: any = { ...memberData };
      if (memberData.photoUrl) {
        backendData.photo_url = memberData.photoUrl;
        delete backendData.photoUrl;
      }
      if (memberData.avatarType) {
        backendData.avatar_type = memberData.avatarType;
        delete backendData.avatarType;
      }
      
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
    const token = getAuthToken();
    
    if (token && !hasInitialFetchRef.current) {
      console.log('[FamilyMembersContext] Initial fetch on mount');
      hasInitialFetchRef.current = true;
      fetchMembers();
    } else if (!token) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (dialogLock?.isDialogOpen) {
        console.log('[FamilyMembersContext] Skipping interval fetch - dialog is open');
        return;
      }
      
      const token = getAuthToken();
      if (token && hasInitialFetchRef.current && !isFetchingRef.current) {
        fetchMembers(true);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dialogLock]);

  return (
    <FamilyMembersContext.Provider
      value={{
        members,
        loading,
        error,
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
