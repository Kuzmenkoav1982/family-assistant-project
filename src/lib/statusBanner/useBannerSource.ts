// useBannerSource — источник списка баннеров для GlobalStatusBanner.
//
// B2 контракт (без backend ещё):
//   - читает список из window.__statusBanner.banners (для dev/debug/seed)
//   - подписывается на event 'status-banner-source-changed' — UI обновляется
//   - можно ставить/менять список через
//       window.__statusBanner.setBanners([...]);
//
// B3 заменит это на fetch /admin-status-banner (action=list), не трогая
// внешний контракт хука. UI компонент GlobalStatusBanner НЕ зависит от того,
// откуда пришли баннеры.

import { useEffect, useState } from 'react';
import type { StatusBanner } from './types';

const EVENT = 'status-banner-source-changed';

type SourceApi = {
  banners: StatusBanner[];
  setBanners: (banners: StatusBanner[]) => void;
  clear: () => void;
};

declare global {
  interface Window {
    __statusBanner?: SourceApi;
  }
}

function installSourceApi(): SourceApi {
  if (typeof window === 'undefined') {
    return {
      banners: [],
      setBanners: () => {},
      clear: () => {},
    };
  }
  if (window.__statusBanner) return window.__statusBanner;

  let current: StatusBanner[] = [];
  const api: SourceApi = {
    get banners() {
      return current;
    },
    set banners(v: StatusBanner[]) {
      current = Array.isArray(v) ? v : [];
      window.dispatchEvent(new Event(EVENT));
    },
    setBanners(v: StatusBanner[]) {
      current = Array.isArray(v) ? v : [];
      window.dispatchEvent(new Event(EVENT));
    },
    clear() {
      current = [];
      window.dispatchEvent(new Event(EVENT));
    },
  };

  try {
    Object.defineProperty(window, '__statusBanner', {
      value: api,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  } catch {
    window.__statusBanner = api;
  }
  return api;
}

export function useBannerSource(): StatusBanner[] {
  const [banners, setBanners] = useState<StatusBanner[]>(() => {
    const api = installSourceApi();
    return api.banners ?? [];
  });

  useEffect(() => {
    const api = installSourceApi();
    const sync = () => setBanners([...(api.banners ?? [])]);
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  return banners;
}
