/**
 * Тонкий клиент продуктовой аналитики.
 * - Не блокирует UI: keepalive + молча игнорирует ошибки
 * - Не пишет PII: только enum/IDs/числа в props (whitelist на бэке)
 * - session_id хранится в sessionStorage
 */

import func2url from '../../backend/func2url.json';

export type PortfolioEvent =
  | 'portfolio_widget_open'
  | 'portfolio_list_open'
  | 'portfolio_profile_open'
  | 'portfolio_sources_open'
  | 'portfolio_insights_open'
  | 'portfolio_ai_click'
  | 'portfolio_ai_success'
  | 'portfolio_plan_create'
  | 'portfolio_plan_update'
  | 'portfolio_plan_complete'
  | 'portfolio_history_open'
  | 'portfolio_pdf_export'
  | 'portfolio_share_to_chat'
  | 'portfolio_family_overview_open'
  | 'portfolio_badge_open'
  | 'portfolio_onboarding_complete'
  | 'portfolio_empty_state_cta_click';

const URL = (func2url as Record<string, string>)['analytics-events'];

const SESSION_KEY = 'analytics:session_id';

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'no-storage';
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('authToken');
  } catch {
    return null;
  }
}

function getFamilyId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return (
      window.localStorage.getItem('familyId') ||
      window.localStorage.getItem('family_id')
    );
  } catch {
    return null;
  }
}

export interface TrackProps {
  sphere?: string;
  severity?: string;
  count?: number;
  has_ai?: boolean;
  completeness_bucket?: string;
  confidence_bucket?: string;
  source?: string;
  success?: boolean;
  duration_ms?: number;
  badge_key?: string;
  is_owner?: boolean;
  plan_status?: string;
}

export interface TrackOptions {
  member_id?: string;
  page?: string;
  props?: TrackProps;
}

export function track(event: PortfolioEvent, options: TrackOptions = {}): void {
  if (!URL) return;
  const token = getAuthToken();
  const payload = {
    event_name: event,
    session_id: getSessionId(),
    page: options.page || (typeof window !== 'undefined' ? window.location.pathname : undefined),
    family_id: getFamilyId(),
    member_id: options.member_id,
    props: options.props || {},
  };
  try {
    fetch(URL, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Auth-Token': token } : {}),
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      /* ignore — аналитика не должна влиять на UX */
    });
  } catch {
    /* ignore */
  }
}

export function bucketCompleteness(c: number): string {
  if (c >= 80) return '80+';
  if (c >= 60) return '60-79';
  if (c >= 40) return '40-59';
  if (c >= 20) return '20-39';
  return '0-19';
}

export function bucketConfidence(c: number): string {
  if (c >= 70) return 'high';
  if (c >= 40) return 'medium';
  return 'low';
}
