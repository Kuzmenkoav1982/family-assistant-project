import { useEffect, useState, useCallback } from 'react';
import func2url from '../../backend/func2url.json';

/**
 * Хук получения живого контекста семьи для ИИ-помощника Домового.
 *
 * Кэширует результат на CACHE_TTL_MS миллисекунд в памяти, чтобы
 * не дёргать бэкенд при каждом открытии чата. Можно принудительно
 * обновить через `refresh()`.
 */

export interface DomovoyContextData {
  family?: {
    members_count: number;
    members: { name: string; role: string }[];
  };
  home?: {
    apartment_filled: boolean;
    unpaid_utilities_count: number;
    unpaid_utilities_total: number;
    unpaid_utilities: { name: string; amount: number; due_date: string | null }[];
    active_repairs_count: number;
  };
  finance?: {
    month_income: number;
    month_expense: number;
    month_balance: number;
    top_expense_categories: { category: string; total: number }[];
    active_goals_count: number;
    active_debts_count: number;
  };
  shopping?: {
    pending_count: number;
    urgent_count: number;
  };
  tasks?: {
    open_count: number;
    overdue_count: number;
  };
  goals?: {
    active_count: number;
  };
  calendar?: {
    upcoming_count: number;
  };
  generated_at?: string;
}

export interface DomovoyContextResult {
  summary: string;
  data: DomovoyContextData;
}

const CACHE_TTL_MS = 60_000; // 1 минута

let cache: { result: DomovoyContextResult; fetchedAt: number } | null = null;
let inflight: Promise<DomovoyContextResult | null> | null = null;

const getAuthToken = (): string => {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed?.token) return parsed.token;
    }
  } catch {
    // ignore
  }
  return localStorage.getItem('authToken') || localStorage.getItem('token') || '';
};

const DEMO_CONTEXT: DomovoyContextResult = {
  summary: 'Семья Кузнецовых активна: 8 задач выполнено на этой неделе, 3 события в ближайшие дни, бюджет в норме.',
  data: {
    family: { members_count: 4, members: [
      { name: 'Алексей', role: 'Отец' },
      { name: 'Анастасия', role: 'Мать' },
      { name: 'Матвей', role: 'Сын' },
      { name: 'Даша', role: 'Дочь' },
    ]},
    finance: { month_income: 185000, month_expense: 124300, month_balance: 60700, top_expense_categories: [
      { category: 'Продукты', total: 38400 },
      { category: 'Транспорт', total: 22100 },
      { category: 'Развлечения', total: 18700 },
    ], active_goals_count: 3, active_debts_count: 1 },
    shopping: { pending_count: 7, urgent_count: 2 },
    tasks: { open_count: 9, overdue_count: 1 },
    goals: { active_count: 4 },
    calendar: { upcoming_count: 3 },
    home: { apartment_filled: true, unpaid_utilities_count: 0, unpaid_utilities_total: 0, unpaid_utilities: [], active_repairs_count: 0 },
    generated_at: new Date().toISOString(),
  },
};

const fetchContext = async (): Promise<DomovoyContextResult | null> => {
  if (localStorage.getItem('isDemoMode') === 'true') return DEMO_CONTEXT;

  const token = getAuthToken();
  if (!token) return null;

  const apiUrl = (func2url as Record<string, string>)['domovoy-context'];
  if (!apiUrl) return null;

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      summary: json.summary || '',
      data: json.data || {},
    };
  } catch {
    return null;
  }
};

const loadCached = async (force = false): Promise<DomovoyContextResult | null> => {
  const now = Date.now();
  if (!force && cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.result;
  }
  if (inflight) return inflight;

  inflight = fetchContext().then(result => {
    if (result) cache = { result, fetchedAt: Date.now() };
    inflight = null;
    return result;
  });
  return inflight;
};

export const useDomovoyContext = (autoload = true) => {
  const [result, setResult] = useState<DomovoyContextResult | null>(() =>
    cache ? cache.result : null
  );
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const r = await loadCached(true);
    setResult(r);
    setLoading(false);
    return r;
  }, []);

  useEffect(() => {
    if (!autoload) return;
    let mounted = true;
    setLoading(true);
    loadCached(false).then(r => {
      if (mounted) {
        setResult(r);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [autoload]);

  return {
    summary: result?.summary || '',
    data: result?.data,
    loading,
    isReady: !!result,
    refresh,
  };
};

/** Получить контекст без хука — для одноразовых вызовов перед запросом к ИИ. */
export const getDomovoyContext = (): Promise<DomovoyContextResult | null> => {
  return loadCached(false);
};

export default useDomovoyContext;