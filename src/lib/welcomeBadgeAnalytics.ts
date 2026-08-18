const WELCOME_API = 'https://functions.poehali.dev/fe19c08e-4cc1-4aa8-a1af-b03678b7ba22';

// Общий section_index для всех кликов по бейджу "Реестр российского ПО".
// Реальные разделы велком-страницы используют индексы >= 0, поэтому -1
// зарезервирован и не пересекается с ними.
export const REESTR_BADGE_SECTION_INDEX = -1;

function getSessionId() {
  let sid = sessionStorage.getItem('welcome_sid');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('welcome_sid', sid);
  }
  return sid;
}

/**
 * Трекинг клика по бейджу "В Реестре российского ПО" на главной странице.
 * placement — где именно расположен бейдж (Hero / Footer / Security), чтобы
 * в статистике было видно, какое размещение кликают чаще.
 */
export function trackReestrBadgeClick(placement: 'hero' | 'footer' | 'security') {
  try {
    fetch(WELCOME_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'track_click',
        section_index: REESTR_BADGE_SECTION_INDEX,
        section_title: `Реестр РПО: ${placement}`,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // тихо игнорируем — трекинг не должен мешать переходу по ссылке
  }
}
