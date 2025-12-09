import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface VitalsData {
  CLS: number | null;
  FID: number | null;
  FCP: number | null;
  LCP: number | null;
  TTFB: number | null;
}

const vitalsData: VitalsData = {
  CLS: null,
  FID: null,
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

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body);
  } else {
    fetch('/api/analytics', { body, method: 'POST', keepalive: true });
  }
}

export function initWebVitals() {
  onCLS((metric) => {
    vitalsData.CLS = metric.value;
    sendToAnalytics(metric);
  });
  
  onFID((metric) => {
    vitalsData.FID = metric.value;
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
  const { LCP, FID, CLS } = vitalsData;
  
  if (LCP === null || FID === null || CLS === null) {
    return 'good';
  }

  if (LCP > 4000 || FID > 300 || CLS > 0.25) {
    return 'poor';
  }
  
  if (LCP > 2500 || FID > 100 || CLS > 0.1) {
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
