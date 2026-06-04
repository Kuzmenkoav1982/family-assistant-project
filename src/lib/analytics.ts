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
  | 'portfolio_empty_state_cta_click'
  | 'portfolio_templates_open'
  | 'portfolio_template_apply'
  | 'portfolio_about_open'
  | 'portfolio_why_suggested_open'
  | 'portfolio_source_deep_link_click'
  | 'portfolio_improve_cta_click';

// ─── TTL-дедупликация событий ─────────────────────────────────────────────────
// Защищает от технических дублей (React StrictMode unmount→mount, HMR),
// но НЕ блокирует валидные повторные действия пользователя после истечения TTL.
// Ключ дедупа: event_name (можно расширить до event+key для контекстного дедупа).
const DEDUP_TTL_MS = 3_000; // 3 сек — достаточно для StrictMode, не мешает UX
const SS_DEDUP_KEY = 'analytics:dedup_ttl';

// Формат: { [eventName]: timestamp_ms }
type DedupMap = Record<string, number>;

function isDuplicate(event: string): boolean {
  try {
    const raw = window.sessionStorage.getItem(SS_DEDUP_KEY);
    const map: DedupMap = raw ? JSON.parse(raw) : {};
    const ts = map[event];
    if (!ts) return false;
    return Date.now() - ts < DEDUP_TTL_MS;
  } catch {
    return false;
  }
}

function markSent(event: string): void {
  try {
    const raw = window.sessionStorage.getItem(SS_DEDUP_KEY);
    const map: DedupMap = raw ? JSON.parse(raw) : {};
    map[event] = Date.now();
    window.sessionStorage.setItem(SS_DEDUP_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

// ─── Детский режим: Safety & Region ──────────────────────────────────────────
export type KidsEvent =
  // Safety-блок
  | 'kids_safety_block_open'        // открыт блок «Что делать, если…»
  | 'kids_safety_mchs_click'        // клик по МЧС
  | 'kids_safety_antiscam_click'    // клик по антимошенник (kids entry)
  | 'kids_safety_call_112'          // нажал 112
  | 'kids_safety_call_101'          // нажал 101
  | 'kids_safety_call_102'          // нажал 102
  | 'kids_safety_call_103'          // нажал 103
  // Safety-тесты
  | 'kids_safety_tests_open'         // открыл экран тестов
  | 'kids_safety_age_group_selected' // выбрал возрастную группу (7_10 / 11_15)
  | 'kids_safety_test_start'         // начал тест (+ age_group в props)
  | 'kids_safety_test_finish'        // завершил тест (+ age_group, score)
  | 'kids_safety_level_reached'      // достигнут уровень знаний (+ age_group)
  // Мой край
  | 'kids_region_open'              // открыл «Мой край»
  | 'kids_region_facts_open'        // открыл факты
  | 'kids_region_quiz_start'        // начал квиз
  | 'kids_region_quiz_finish'       // завершил квиз
  | 'kids_region_best_score';       // обновил лучший результат

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
  age_band?: string;
  template_id?: string;
  source_type?: string;
  route?: string;
  level?: string;
  test_id?: string;
  score?: number;
  child_id?: string;
  age_group?: string;
  age_group_source?: string;
}

export interface TrackOptions {
  member_id?: string;
  page?: string;
  props?: TrackProps;
}

export function track(event: PortfolioEvent | KidsEvent, options: TrackOptions = {}): void {
  if (!URL) return;
  if (isDuplicate(event)) return;
  markSent(event);
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