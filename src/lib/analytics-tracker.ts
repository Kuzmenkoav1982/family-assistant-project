import func2url from '@/../backend/func2url.json';

interface PageViewData {
  page_path: string;
  page_title: string;
  referrer?: string;
  session_id?: string;
}

class AnalyticsTracker {
  private apiUrl: string;
  private sessionId: string;
  private enabled: boolean = true;

  constructor() {
    this.apiUrl = func2url['page-views'] || '';
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

  async trackPageView(path: string, title: string = document.title) {
    if (!this.enabled || !this.apiUrl) return;

    try {
      const data: PageViewData = {
        page_path: path,
        page_title: title,
        referrer: document.referrer,
        session_id: this.sessionId
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