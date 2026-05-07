import func2url from '../../backend/func2url.json';

const BASE = (func2url as Record<string, string>)['support-navigator'];

export interface SupportProfile {
  userId?: number;
  regionCode: string;
  childrenCount: number;
  childrenAges: number[];
  isPregnant: boolean;
  isSingleParent: boolean;
  isLowIncome: boolean;
  hasDisability: boolean;
  isMilitaryFamily: boolean;
  isStudent: boolean;
  hasMortgage: boolean;
  monthlyIncomePerCapita: number | null;
  parentAge: number | null;
}

export interface SupportMeasure {
  id: number;
  code: string;
  title: string;
  shortDescription: string;
  fullDescription: string | null;
  category: string;
  level: string;
  amountText: string | null;
  frequency: string | null;
  minChildren: number;
  requiresLowIncome: boolean;
  requiresManyChildren: boolean;
  requiresPregnancy: boolean;
  requiresSingleParent: boolean;
  requiresDisability: boolean;
  requiresMilitaryFamily: boolean;
  requiresStudent: boolean;
  requiresMortgage: boolean;
  childAgeMin: number | null;
  childAgeMax: number | null;
  applyUrl: string | null;
  legalSource: string | null;
  icon: string;
  priority: number;
  deadlineText: string | null;
  match?: { eligible: boolean; score: number; reasons: string[]; blockers: string[] };
  user?: { status: string; note: string | null; deadlineAt: string | null };
}

const headers = (userId?: string) => {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userId) h['X-User-Id'] = String(userId);
  return h;
};

export async function fetchRecommendations(userId?: string) {
  const r = await fetch(`${BASE}?action=recommend`, { headers: headers(userId) });
  if (!r.ok) throw new Error('Failed to load recommendations');
  return (await r.json()) as { measures: SupportMeasure[]; profile: SupportProfile };
}

export async function fetchProfile(userId: string) {
  const r = await fetch(`${BASE}?action=profile`, { headers: headers(userId) });
  if (!r.ok) throw new Error('Failed to load profile');
  return (await r.json()) as { profile: SupportProfile };
}

export async function saveProfile(userId: string, profile: Partial<SupportProfile>) {
  const r = await fetch(`${BASE}?action=profile`, {
    method: 'POST',
    headers: headers(userId),
    body: JSON.stringify(profile),
  });
  if (!r.ok) throw new Error('Failed to save profile');
  return (await r.json()) as { profile: SupportProfile; saved: boolean };
}

export async function setMeasureStatus(
  userId: string,
  measureId: number,
  status: string,
  note?: string,
  deadlineAt?: string,
) {
  const r = await fetch(`${BASE}?action=status`, {
    method: 'POST',
    headers: headers(userId),
    body: JSON.stringify({ measureId, status, note, deadlineAt }),
  });
  if (!r.ok) throw new Error('Failed to save status');
  return (await r.json()) as { saved: boolean };
}
