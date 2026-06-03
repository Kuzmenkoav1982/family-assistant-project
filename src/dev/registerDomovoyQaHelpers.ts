import {
  enableDomovoyGuideOverride,
  disableDomovoyGuideOverride,
  clearDomovoyGuideOverride,
  readDomovoyGuideFlag,
} from '@/lib/featureFlags';

declare global {
  interface Window {
    __DOMOVOY_QA__?: {
      enableGuide: () => void;
      disableGuide: () => void;
      clearGuide: () => void;
      getGuideStatus: () => ReturnType<typeof readDomovoyGuideFlag>;
    };
  }
}

export function registerDomovoyQaHelpers(): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') return;

  window.__DOMOVOY_QA__ = {
    enableGuide: () => { enableDomovoyGuideOverride(); console.info('[QA] Guide enabled. Call location.reload()'); },
    disableGuide: () => { disableDomovoyGuideOverride(); console.info('[QA] Guide disabled. Call location.reload()'); },
    clearGuide: () => { clearDomovoyGuideOverride(); console.info('[QA] Guide override cleared. Call location.reload()'); },
    getGuideStatus: () => readDomovoyGuideFlag(),
  };

  console.info('[DEV] window.__DOMOVOY_QA__ registered. Try: __DOMOVOY_QA__.getGuideStatus()');
}
