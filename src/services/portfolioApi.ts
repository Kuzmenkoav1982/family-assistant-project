import type {
  PortfolioData,
  FamilyPortfolioListItem,
  Insight,
  Achievement,
} from '@/types/portfolio.types';

const PORTFOLIO_URL = 'https://functions.poehali.dev/3f5999bc-b4e5-41bd-b39f-c64e45c53d5a';

/** Stage-3 hardening: при write-операциях (manual achievement create) шлём X-User-Id,
 *  чтобы backend смог сверить семью пользователя с семьёй member_id. */
function getActorUserId(): string | null {
  const direct = localStorage.getItem('familyMemberId') || localStorage.getItem('userId');
  if (direct) return direct;
  const raw = localStorage.getItem('userData') || localStorage.getItem('user');
  if (raw) {
    try {
      const u = JSON.parse(raw);
      const id = u?.member_id || u?.memberId || u?.id;
      if (id) return String(id);
    } catch {
      /* ignore */
    }
  }
  return null;
}

async function call<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${PORTFOLIO_URL}?${qs}`);
  if (!res.ok) {
    throw new Error(`Portfolio API error ${res.status}`);
  }
  return res.json();
}

async function callPost<T>(
  params: Record<string, string>,
  body: unknown,
  opts?: { auth?: boolean },
): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts?.auth) {
    const uid = getActorUserId();
    if (uid) headers['X-User-Id'] = uid;
  }
  const res = await fetch(`${PORTFOLIO_URL}?${qs}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    let msg = `Portfolio API error ${res.status}`;
    try {
      const j = await res.json();
      if (j?.error) msg = `${j.error} (${res.status})`;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
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

  history: (memberId: string, limit = 12) =>
    call<{ history: PortfolioHistoryPoint[]; count: number }>({
      action: 'history',
      member_id: memberId,
      limit: String(limit),
    }),

  planCreate: (memberId: string, plan: PlanInput) =>
    callPost<{ id: string; status: string }>(
      { action: 'plan_create', member_id: memberId },
      plan,
    ),

  planUpdate: (planId: string, plan: Partial<PlanInput> & { status?: string; progress?: number }) =>
    callPost<{ id: string; status: string }>(
      { action: 'plan_update', plan_id: planId },
      plan,
    ),

  planDelete: (planId: string) =>
    call<{ id: string; status: string }>({
      action: 'plan_delete',
      plan_id: planId,
    }),

  autoBadges: (memberId: string) =>
    call<{ created: number; badges: { badge_key: string; title: string }[] }>({
      action: 'auto_badges',
      member_id: memberId,
    }),

  /** Этап 3.4.1 + hardening: ручное создание достижения. Требует X-User-Id (auth). */
  achievementCreate: (memberId: string, body: AchievementCreateInput) =>
    callPost<AchievementCreated>(
      { action: 'achievement_create', member_id: memberId },
      body,
      { auth: true },
    ),

  compare: (familyId: string) =>
    call<CompareResponse>({
      action: 'compare',
      family_id: familyId,
    }),

  aiInsights: (memberId: string) =>
    call<{ insights: import('@/types/portfolio.types').Insight[]; count: number; error?: string }>({
      action: 'ai_insights',
      member_id: memberId,
    }),
};

export interface AchievementCreateInput {
  title: string;
  description?: string | null;
  icon?: string;
  sphere_key?: string | null;
  category?: 'milestone' | 'path' | 'rhythm';
  earned_at?: string | null;
  badge_key?: string;
  metadata?: Record<string, unknown>;
}

export interface AchievementCreated {
  id: string;
  memberId: string;
  familyId: string;
  badgeKey: string;
  title: string;
  description?: string | null;
  icon: string;
  sphereKey?: string | null;
  category: string;
  earnedAt?: string | null;
  error?: string;
}

export interface PlanInput {
  sphere_key: string;
  title: string;
  description?: string | null;
  milestone?: string | null;
  target_date?: string | null;
  next_step?: string | null;
  progress?: number;
}

export interface CompareMember {
  id: string;
  name: string;
  role: string | null;
  age: number | null;
  photo_url: string | null;
  avatar: string | null;
  completeness: number;
  scores: Record<string, number>;
  confidence: Record<string, number>;
  has_portfolio: boolean;
}

export interface CompareResponse {
  family_id: string;
  members: CompareMember[];
  sphere_labels_child: Record<string, string>;
  sphere_icons: Record<string, string>;
}

export interface PortfolioHistoryPoint {
  id: string;
  date: string;
  type: string;
  scores: Record<string, number>;
  confidence: Record<string, number>;
  summary: Record<string, unknown>;
  source_count: number | null;
  trigger: string;
}