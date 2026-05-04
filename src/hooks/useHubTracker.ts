import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ANALYTICS_URL = 'https://functions.poehali.dev/f08e9689-5057-472f-8f5d-e3569af5d508';

// Карта путей → название хаба для отображения в админке
const HUB_LABELS: Record<string, string> = {
  '/': 'Главная',
  '/calendar': 'Календарь',
  '/tasks': 'Задачи',
  '/family-management': 'Семья',
  '/pets': 'Питомцы',
  '/garage': 'Гараж',
  '/health': 'Здоровье',
  '/finance': 'Финансы',
  '/shopping': 'Покупки',
  '/nutrition': 'Питание',
  '/trips': 'Путешествия',
  '/leisure': 'Досуг',
  '/family-tree': 'Родословная',
  '/life-road': 'Жизненный путь',
  '/tracker': 'Геолокация',
  '/children': 'Дети',
  '/documents': 'Документы',
  '/ai-assistant': 'Домовой ИИ',
  '/settings': 'Настройки',
  '/member-profile': 'Профиль',
  '/events': 'События',
  '/votings': 'Голосования',
  '/clan-tree': 'Клан',
};

function getSessionId(): string {
  let sid = sessionStorage.getItem('hub_session_id');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('hub_session_id', sid);
  }
  return sid;
}

function getFamilyId(): string {
  try {
    const raw = localStorage.getItem('userData');
    const data = raw ? JSON.parse(raw) : null;
    return data?.family_id || data?.familyId || '';
  } catch {
    return '';
  }
}

export function useHubTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const hub = path === '/' ? '/' : path.replace(/\/$/, '');
    const label = HUB_LABELS[hub];

    // Трекаем только известные хабы
    if (!label) return;

    const payload = {
      hub,
      hub_label: label,
      family_id: getFamilyId(),
      session_id: getSessionId(),
    };

    // fire-and-forget, не блокируем UI
    fetch(`${ANALYTICS_URL}?action=hub`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, [location.pathname]);
}
