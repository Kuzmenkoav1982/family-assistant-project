import { useCallback, useEffect, useState } from 'react';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { portfolioApi } from '@/services/portfolioApi';
import type { FamilyPortfolioListItem } from '@/types/portfolio.types';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { isAdultMember } from '@/utils/familyRole';
import { buildHubSummary, sortMembersForHub } from '@/lib/portfolio/portfolioHubHelpers';

export function useFamilyPortfolio() {
  const { familyId, members, currentMemberId } = useFamilyMembersContext();
  const [items, setItems] = useState<FamilyPortfolioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const compareEnabled = useFeatureFlag('portfolio_compare_enabled', false);
  const currentMember = members.find((m) => m.id === currentMemberId) || null;
  const isAdult = isAdultMember(currentMember);
  const showCompare = compareEnabled && isAdult;

  const load = useCallback(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    portfolioApi
      .list(familyId)
      .then((res) => {
        setItems(res.members);
        setError(null);
      })
      .catch((e) => setError((e as Error)?.message || String(e)))
      .finally(() => setLoading(false));
  }, [familyId]);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = sortMembersForHub(items);
  const summary = buildHubSummary(items);

  return { familyId, items, loading, error, load, sorted, summary, showCompare };
}
