import func2url from '@/../backend/func2url.json';

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
  '/ai-assistant': 'Домовой ИИ',
  '/settings': 'Настройки',
  '/member-profile': 'Профиль',
  '/events': 'События',
  '/votings': 'Голосования',
  '/clan-tree': 'Клан',
};

interface PageViewData {
  page_path: string;
  page_title: string;
  referrer?: string;
  session_id?: string;
  user_agent?: string;
}

class AnalyticsTracker {
  private apiUrl: string;
  private hubApiUrl: string;
  private sessionId: string;
  private enabled: boolean = true;

  constructor() {
    this.apiUrl = func2url['page-views'] || '';
    this.hubApiUrl = (func2url as Record<string, string>)['analytics'] || '';
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    const storageKey = 'analytics_session_id';
    let sessionId = sessionStorage.getItem(storageKey);
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(storageKey, sessionId);
    }
    
    return sessionId;
  }

  trackHub(path: string) {
    if (!this.enabled || !this.hubApiUrl) return;
    const hub = path === '/' ? '/' : path.replace(/\/$/, '').split('?')[0];
    const label = HUB_LABELS[hub];
    if (!label) return;

    let familyId = '';
    try {
      const raw = localStorage.getItem('userData');
      const d = raw ? JSON.parse(raw) : null;
      familyId = d?.family_id || d?.familyId || '';
    } catch { /* ignore */ }

    fetch(`${this.hubApiUrl}?action=hub`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hub, hub_label: label, family_id: familyId, session_id: this.sessionId }),
    }).catch(() => {});
  }

  async trackPageView(path: string, title: string = document.title) {
    if (!this.enabled || !this.apiUrl) return;

    try {
      const data: PageViewData = {
        page_path: path,
        page_title: title,
        referrer: document.referrer,
        session_id: this.sessionId,
        user_agent: navigator.userAgent
      };

      await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }
}

export const analyticsTracker = new AnalyticsTracker();