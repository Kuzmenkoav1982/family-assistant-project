import func2url from '@/../backend/func2url.json';

export const API = (func2url as Record<string, string>)['admin-users'];
export const ANALYTICS_URL = (func2url as Record<string, string>)['analytics'];
export const AUTH_HEADERS = { 'X-Admin-Token': 'admin_authenticated', 'Content-Type': 'application/json' };

export async function apiGet<T>(resource: string, extra = ''): Promise<T | null> {
  try {
    const r = await fetch(`${API}?resource=${resource}${extra}`, { headers: AUTH_HEADERS });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export async function apiPost<T>(resource: string, body: object): Promise<T | null> {
  try {
    const r = await fetch(`${API}?resource=${resource}`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch {
    return null;
  }
}

export async function apiDelete<T>(resource: string, body: object): Promise<T | null> {
  try {
    const r = await fetch(`${API}?resource=${resource}`, {
      method: 'DELETE',
      headers: AUTH_HEADERS,
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch {
    return null;
  }
}

export interface Family {
  id: string;
  name: string;
  created_at: string | null;
  logo_url: string | null;
  member_count: number;
  owner_email: string | null;
  owner_name: string | null;
  last_activity: string | null;
}

export interface FamiliesResponse {
  families: Family[];
  summary: { total: number; today: number; week: number; month: number; active_week: number };
}

export interface FinanceData {
  total_revenue: number;
  today_revenue: number;
  week_revenue: number;
  month_revenue: number;
  total_payments: number;
  successful_payments: number;
  methods: Array<{ method: string; count: number; amount: number }>;
  recent_payments: Array<{ id: string; user_id: string | null; amount: number; status: string; method: string | null; created_at: string | null }>;
  by_day: Array<{ date: string; amount: number; count: number }>;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  max_uses: number;
  current_uses: number;
  valid_until: string | null;
  created_at: string | null;
}

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  target: string;
  sent_count: number;
  created_at: string | null;
  status: string;
}

export interface FunnelStep { name: string; count: number }

export interface ErrorRow {
  id: string;
  message: string;
  stack: string | null;
  path: string | null;
  user_agent: string | null;
  created_at: string | null;
}

export interface Ticket {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  description: string;
  status: string;
  created_at: string | null;
}

export interface TopFamily { family_id: string; name: string; score: number }

export interface FeatureFlag { key: string; enabled: boolean; description: string | null; updated_at: string | null }

export interface HubStat {
  hub: string;
  label: string;
  views: number;
  unique_families: number;
  unique_sessions: number;
}

export interface HubStatsData {
  hubs: HubStat[];
  total_views: number;
  total_families: number;
  avg_depth: number;
  days: number;
  daily: { day: string; views: number }[];
}
