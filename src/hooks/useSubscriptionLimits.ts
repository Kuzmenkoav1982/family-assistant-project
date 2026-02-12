import { useState, useEffect, useCallback } from 'react';
import func2url from '@/../backend/func2url.json';

const CHECK_LIMITS_API = func2url['check-limits'] || '';

interface LimitInfo {
  used: number;
  limit: number | null;
  allowed: boolean;
  reset_date?: string;
}

interface SubscriptionLimits {
  plan_type: string;
  is_premium: boolean;
  limits: {
    ai_requests: LimitInfo;
    photos: LimitInfo;
    family_members: LimitInfo;
  };
}

export function useSubscriptionLimits(familyId?: string | null) {
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkLimits = useCallback(async (type: 'ai_requests' | 'photos' | 'family_members' = 'ai_requests') => {
    if (!familyId) {
      console.log('[useSubscriptionLimits] Family ID отсутствует');
      setError('Family ID отсутствует');
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      console.log('[useSubscriptionLimits] Checking limits for family:', familyId);
      const response = await fetch(`${CHECK_LIMITS_API}?type=${type}`, {
        method: 'GET',
        headers: {
          'X-Family-Id': familyId
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка проверки лимитов');
      }

      const data = await response.json();
      console.log('[useSubscriptionLimits] Limits response:', data);
      setLimits(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      return null;
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  const incrementUsage = useCallback(async (type: 'ai_requests' | 'photos') => {
    if (!familyId) return null;

    try {
      const response = await fetch(CHECK_LIMITS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Family-Id': familyId
        },
        body: JSON.stringify({ type })
      });

      if (!response.ok) {
        throw new Error('Ошибка инкремента лимита');
      }

      const data = await response.json();
      setLimits(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      return null;
    }
  }, [familyId]);

  useEffect(() => {
    if (familyId) {
      checkLimits('ai_requests');
    }
  }, [familyId, checkLimits]);

  return {
    limits,
    loading,
    error,
    checkLimits,
    incrementUsage,
    isPremium: limits?.is_premium || false,
    aiRequestsAllowed: limits?.limits?.ai_requests?.allowed || false,
    photosAllowed: limits?.limits?.photos?.allowed || false,
    familyMembersAllowed: limits?.limits?.family_members?.allowed || false
  };
}