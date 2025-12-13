import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface VitalsData {
  CLS: number | null;
  INP: number | null;
  FCP: number | null;
  LCP: number | null;
  TTFB: number | null;
}

const vitalsData: VitalsData = {
  CLS: null,
  INP: null,
  FCP: null,
  LCP: null,
  TTFB: null,
};

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    timestamp: Date.now(),
  });

  const analyticsUrl = 'https://functions.poehali.dev/f08e9689-5057-472f-8f5d-e3569af5d508';
  
  // Always use fetch with proper headers instead of sendBeacon
  fetch(analyticsUrl, { 
    body, 
    method: 'POST', 
    keepalive: true,
    headers: { 'Content-Type': 'application/json' }
  }).catch(() => {
    // Silently fail - don't block user experience
  });
}

export function initWebVitals() {
  onCLS((metric) => {
    vitalsData.CLS = metric.value;
    sendToAnalytics(metric);
  });
  
  onINP((metric) => {
    vitalsData.INP = metric.value;
    sendToAnalytics(metric);
  });
  
  onFCP((metric) => {
    vitalsData.FCP = metric.value;
    sendToAnalytics(metric);
  });
  
  onLCP((metric) => {
    vitalsData.LCP = metric.value;
    sendToAnalytics(metric);
  });
  
  onTTFB((metric) => {
    vitalsData.TTFB = metric.value;
    sendToAnalytics(metric);
  });
}

export function getVitalsData(): VitalsData {
  return vitalsData;
}

export function getPerformanceRating(): 'good' | 'needs-improvement' | 'poor' {
  const { LCP, INP, CLS } = vitalsData;
  
  if (LCP === null || INP === null || CLS === null) {
    return 'good';
  }

  if (LCP > 4000 || INP > 500 || CLS > 0.25) {
    return 'poor';
  }
  
  if (LCP > 2500 || INP > 200 || CLS > 0.1) {
    return 'needs-improvement';
  }
  
  return 'good';
}

export function getPerformanceDescription(rating: string): string {
  const descriptions = {
    good: 'Сайт работает быстро - пользователи довольны!',
    'needs-improvement': 'Сайт работает нормально, но можно ускорить',
    poor: 'Сайт загружается медленно - нужна оптимизация',
  };
  return descriptions[rating as keyof typeof descriptions] || '';
}