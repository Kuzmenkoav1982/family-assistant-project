import { useState } from 'react';
import type { MemberProfile } from '@/types/family.types';

const MEMBER_PROFILE_API = 'https://functions.poehali.dev/84bdef99-0e4b-420f-af04-60ac37c6af1c';

export function useMemberProfile() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const saveProfile = async (memberId: string, profileData: MemberProfile): Promise<boolean> => {
    setSaving(true);
    setError(null);
    
    const token = getAuthToken();
    const memberIdNum = parseInt(memberId);
    
    console.log('[DEBUG saveMemberProfile] Saving profile for member:', memberId);
    console.log('[DEBUG saveMemberProfile] Member ID (parsed):', memberIdNum);
    console.log('[DEBUG saveMemberProfile] Profile data:', profileData);
    console.log('[DEBUG saveMemberProfile] Profile data keys:', Object.keys(profileData));
    
    const payload = {
      memberId: memberIdNum,
      profileData
    };
    
    console.log('[DEBUG saveMemberProfile] Full payload:', JSON.stringify(payload, null, 2));
    
    try {
      const response = await fetch(MEMBER_PROFILE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify(payload)
      });

      console.log('[DEBUG saveMemberProfile] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG saveMemberProfile] Error response:', errorText);
        throw new Error(`Ошибка ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[DEBUG saveMemberProfile] Success:', data);
      
      return data.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('[DEBUG saveMemberProfile] Error:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const getProfile = async (memberId: string): Promise<MemberProfile | null> => {
    setLoading(true);
    setError(null);
    
    const token = getAuthToken();
    
    try {
      const response = await fetch(`${MEMBER_PROFILE_API}?memberId=${memberId}`, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Ошибка ${response.status}`);
      }

      const data = await response.json();
      return data.profile || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveProfile,
    getProfile,
    saving,
    loading,
    error
  };
}