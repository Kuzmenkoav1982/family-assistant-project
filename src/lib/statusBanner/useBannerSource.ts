// useBannerSource — источник списка баннеров для GlobalStatusBanner.
//
// Контракт (B3):
//   1. Основной путь — fetch /status-banners-public каждые POLL_INTERVAL_MS,
//      + при window focus, + по window.__statusBanner.refresh() (manual).
//   2. Dev override — window.__statusBanner.setBanners([...]) ПОЛНОСТЬЮ
//      перекрывает серверный список локально (для smoke / QA / preview).
//      window.__statusBanner.clear() снимает override → снова берётся сервер.
//
// Поведение при ошибках:
//   - сетевая ошибка / 5xx / битый JSON → оставляем последний успешный список
//     (graceful — баннер не валит весь shell)
//   - первый fetch упал → [] (рендера баннера просто не будет)

import { useEffect, useState } from 'react';
import { fetchPublicBanners } from './statusBannerApi';
import type { StatusBanner } from './types';

const POLL_INTERVAL_MS = 60_000;
const OVERRIDE_EVENT = 'status-banner-source-changed';

type SourceApi = {
  /** Полностью перекрыть серверный список локальным (dev/qa). */
  setBanners: (banners: StatusBanner[]) => void;
  /** Снять override → снова брать с сервера. */
  clear: () => void;
  /** Принудительно дернуть refresh с сервера. */
  refresh: () => void;
  /** Прочитать текущий override (или null, если override не активен). */
  getOverride: () => StatusBanner[] | null;
};

declare global {
  interface Window {
    __statusBanner?: SourceApi;
  }
}

// Module-level состояние: override и колбек refresh — общие для всех инстансов
// хука (на практике инстанс один, GlobalStatusBanner singleton).
let overrideBanners: StatusBanner[] | null = null;
let refreshCallback: (() => void) | null = null;

function emitChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OVERRIDE_EVENT));
}

function installSourceApi(): void {
  if (typeof window === 'undefined') return;
  if (window.__statusBanner) return;

  const api: SourceApi = {
    setBanners(v: StatusBanner[]) {
      overrideBanners = Array.isArray(v) ? v : [];
      emitChange();
    },
    clear() {
      overrideBanners = null;
      emitChange();
    },
    refresh() {
      refreshCallback?.();
    },
    getOverride() {
      return overrideBanners;
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
}

export function useBannerSource(): StatusBanner[] {
  const [serverBanners, setServerBanners] = useState<StatusBanner[]>([]);
  const [overrideTick, setOverrideTick] = useState(0);

  // Install dev override API + подписка на смену override
  useEffect(() => {
    installSourceApi();
    const onChange = () => setOverrideTick((x) => x + 1);
    window.addEventListener(OVERRIDE_EVENT, onChange);
    return () => window.removeEventListener(OVERRIDE_EVENT, onChange);
  }, []);

  // Поллинг сервера + refresh-on-focus + manual refresh
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const reload = async () => {
      try {
        const list = await fetchPublicBanners(controller.signal);
        if (!cancelled) setServerBanners(list);
      } catch {
        // graceful: оставляем предыдущий serverBanners
      }
    };

    refreshCallback = reload;
    reload();
    const id = window.setInterval(reload, POLL_INTERVAL_MS);
    const onFocus = () => reload();
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
      refreshCallback = null;
    };
  }, []);

  // Override побеждает сервер (если активен)
  if (overrideBanners !== null) {
    // overrideTick — чтобы React пересчитал при смене override
    void overrideTick;
    return overrideBanners;
  }
  return serverBanners;
}
