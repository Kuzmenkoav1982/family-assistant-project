import type {
  PortfolioData,
  FamilyPortfolioListItem,
  Insight,
  Achievement,
} from '@/types/portfolio.types';

const PORTFOLIO_URL = 'https://functions.poehali.dev/3f5999bc-b4e5-41bd-b39f-c64e45c53d5a';

async function call<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${PORTFOLIO_URL}?${qs}`);
  if (!res.ok) {
    throw new Error(`Portfolio API error ${res.status}`);
  }
  return res.json();
}

export const portfolioApi = {
  get: (memberId: string) =>
    call<PortfolioData>({ action: 'get', member_id: memberId }),

  aggregate: (memberId: string) =>
    call<PortfolioData>({ action: 'aggregate', member_id: memberId }),

  list: (familyId: string) =>
    call<{ family_id: string; members: FamilyPortfolioListItem[] }>({
      action: 'list',
      family_id: familyId,
    }),

  insights: (memberId: string) =>
    call<{ insights: Insight[]; count: number }>({
      action: 'insights',
      member_id: memberId,
    }),

  achievements: (memberId: string) =>
    call<{ achievements: Achievement[]; count: number }>({
      action: 'achievements',
      member_id: memberId,
    }),

  snapshot: (memberId: string, trigger = 'manual') =>
    call<{ snapshot_id: string; trigger_event: string }>({
      action: 'snapshot',
      member_id: memberId,
      trigger,
    }),
};
