import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export interface RecentHub {
  path: string;
  title: string;
  icon: string;
  iconColor: string;
  visitedAt: number;
}

const STORAGE_KEY = 'recentHubs';
const MAX_RECENT = 4;

const HUB_META: Record<string, { title: string; icon: string; iconColor: string }> = {
  '/family-hub':       { title: 'Семья',           icon: 'Users',      iconColor: 'text-blue-600' },
  '/health-hub':       { title: 'Здоровье',        icon: 'HeartPulse', iconColor: 'text-rose-600' },
  '/nutrition':        { title: 'Питание',         icon: 'Apple',      iconColor: 'text-emerald-600' },
  '/values-hub':       { title: 'Ценности',        icon: 'Heart',      iconColor: 'text-pink-600' },
  '/planning-hub':     { title: 'Планирование',    icon: 'Target',     iconColor: 'text-indigo-600' },
  '/finance':          { title: 'Финансы',         icon: 'Wallet',     iconColor: 'text-emerald-600' },
  '/household-hub':    { title: 'Дом и быт',       icon: 'Home',       iconColor: 'text-amber-600' },
  '/home-hub':         { title: 'Дом',             icon: 'Building',   iconColor: 'text-amber-600' },
  '/leisure-hub':      { title: 'Путешествия',     icon: 'Plane',      iconColor: 'text-sky-600' },
  '/development-hub':  { title: 'Развитие',        icon: 'Brain',      iconColor: 'text-violet-600' },
  '/family-matrix':    { title: 'Семейный код',    icon: 'Sparkles',   iconColor: 'text-purple-600' },
  '/pets':             { title: 'Питомцы',         icon: 'PawPrint',   iconColor: 'text-violet-600' },
  '/state-hub':        { title: 'Госуслуги',       icon: 'Landmark',   iconColor: 'text-slate-600' },
};

const readStorage = (): RecentHub[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeStorage = (hubs: RecentHub[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hubs));
  } catch (_e) {
    // ignore
  }
};

export const useRecentHubsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const meta = HUB_META[location.pathname];
    if (!meta) return;

    const current = readStorage();
    const filtered = current.filter(h => h.path !== location.pathname);
    const next: RecentHub[] = [
      { path: location.pathname, ...meta, visitedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT);
    writeStorage(next);
    window.dispatchEvent(new Event('recentHubsChanged'));
  }, [location.pathname]);
};

export const useRecentHubs = (): RecentHub[] => {
  const [hubs, setHubs] = useState<RecentHub[]>(() => readStorage());

  useEffect(() => {
    const handler = () => setHubs(readStorage());
    window.addEventListener('recentHubsChanged', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('recentHubsChanged', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return hubs;
};

export default useRecentHubs;
