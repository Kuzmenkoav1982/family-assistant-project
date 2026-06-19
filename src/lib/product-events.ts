import func2url from '@/../backend/func2url.json';

const API_URL = (func2url as Record<string, string>)['track-event'] || '';

const ANON_KEY = 'pe_anonymous_id';
const SESSION_KEY = 'pe_session_id';

function getAnonId(): string {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = 'anon_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch { return ''; }
}

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch { return ''; }
}

function getUtm(): Record<string, string | undefined> {
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get('utm_source') || undefined,
      utm_medium: p.get('utm_medium') || undefined,
      utm_campaign: p.get('utm_campaign') || undefined,
    };
  } catch { return {}; }
}

export type ProductEventName =
  | 'signup_started'
  | 'signup_failed'
  | 'login_failed'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'page_404_hit';

export function trackProductEvent(
  eventName: ProductEventName,
  properties?: Record<string, unknown>,
): void {
  if (!API_URL) return;
  const payload = {
    event_name: eventName,
    session_id: getSessionId(),
    anonymous_id: getAnonId(),
    path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
    ...getUtm(),
    properties,
  };
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
