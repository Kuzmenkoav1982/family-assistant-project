import { useState, useEffect } from 'react';
import { healthApi } from '@/services/healthApi';

/**
 * Stage 4 (4.2.5): хуки используют healthApi wrapper.
 *
 * Изменения по сравнению с pre-stage-4:
 *   - убран локальный getUserId() с fallback '1';
 *   - X-User-Id берётся в healthApi из readActorMemberId() (см. KE-health);
 *   - вся ручная сборка fetch + headers выкинута.
 *
 * Подробности контракта — docs/stage-4-id-contracts.md и комментарий в src/services/healthApi.ts.
 */

function useHealthResource<T>(
  fetcher: () => Promise<T[]>,
  deps: ReadonlyArray<unknown>,
  fieldName: string,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const data = await fetcher();
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) {
          console.error(`[${fieldName}] fetch error:`, err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refetchTrigger]);

  const refetch = () => setRefetchTrigger((p) => p + 1);
  return { items, loading, error, refetch };
}

/* Public hook surface: возвращаем any[] для backwards-compat с useHealthNew,
 * который массово обращается к динамическим полям записей. */
/* eslint-disable @typescript-eslint/no-explicit-any */

export function useHealthProfiles() {
  const { items, loading, error, refetch } = useHealthResource<any>(
    () => healthApi.get<any[]>('profiles'),
    [],
    'useHealthProfiles',
  );
  return { profiles: items, loading, error, refetch };
}

export function useHealthRecords(profileId?: string) {
  const { items, loading, error, refetch } = useHealthResource<any>(
    () => healthApi.get<any[]>('records', { profileId }),
    [profileId],
    'useHealthRecords',
  );
  return { records: items, loading, error, refetch };
}

export function useVaccinations(profileId?: string) {
  const { items, loading, error, refetch } = useHealthResource<any>(
    () => healthApi.get<any[]>('vaccinations', { profileId }),
    [profileId],
    'useVaccinations',
  );
  return { vaccinations: items, loading, error, refetch };
}

export function useMedications(profileId?: string) {
  const { items, loading, error, refetch } = useHealthResource<any>(
    () => healthApi.get<any[]>('medications', { profileId }),
    [profileId],
    'useMedications',
  );
  return { medications: items, loading, error, refetch };
}

export function useVitalRecords(profileId?: string) {
  const { items, loading, error, refetch } = useHealthResource<any>(
    () => healthApi.get<any[]>('vitals', { profileId }),
    [profileId],
    'useVitalRecords',
  );
  return { vitals: items, loading, error, refetch };
}

export function useDoctors() {
  const { items, loading, error, refetch } = useHealthResource<any>(
    () => healthApi.get<any[]>('doctors'),
    [],
    'useDoctors',
  );
  return { doctors: items, loading, error, refetch };
}

export function useInsurance(profileId?: string) {
  const { items, loading, error, refetch } = useHealthResource<any>(
    () => healthApi.get<any[]>('insurance', { profileId }),
    [profileId],
    'useInsurance',
  );
  return { insurance: items, loading, error, refetch };
}

export function useTelemedicine(profileId?: string) {
  const { items, loading, error } = useHealthResource<any>(
    () => healthApi.get<any[]>('telemedicine', { profileId }),
    [profileId],
    'useTelemedicine',
  );
  return { sessions: items, loading, error };
}
/* eslint-enable @typescript-eslint/no-explicit-any */