// Сервис для работы с backend «Дом» Семейной ОС.
// Все запросы изолированы по family_id на стороне backend
// (определяется по токену сессии).

const API_URL = 'https://functions.poehali.dev/592bc978-3755-41e2-b7c2-09f5280f66dc';

// ─── Типы (соответствуют backend) ─────────────────────────────
export interface ApartmentDTO {
  address: string;
  area: string | null;
  rooms: number | null;
  ownership: 'own' | 'rent' | 'mortgage' | null;
  notes: string | null;
}

export interface UtilityDTO {
  id: string;
  name: string;
  amount: string;          // приходит как строка-десятичная
  due_date: string | null; // YYYY-MM-DD
  paid: boolean;
  linked_transaction_id?: string | null; // связь с расходом в финансах
}

export type MeterType =
  | 'electricity'
  | 'cold-water'
  | 'hot-water'
  | 'gas'
  | 'heating'
  | 'other';

export interface MeterDTO {
  id: string;
  meter_type: MeterType;
  reading_date: string; // YYYY-MM-DD
  value: string;
  note: string | null;
}

export type RepairStatus = 'planned' | 'in-progress' | 'done';
export type RepairPriority = 'low' | 'medium' | 'high';

export interface RepairDTO {
  id: string;
  title: string;
  status: RepairStatus;
  priority: RepairPriority;
  estimate_rub: string | null;
  notes: string | null;
}

export interface HomeData {
  apartment: ApartmentDTO;
  utilities: UtilityDTO[];
  meters: MeterDTO[];
  repairs: RepairDTO[];
}

// ─── Получение токена ─────────────────────────────────────────
function getAuthToken(): string {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed?.token) return parsed.token as string;
    }
  } catch {
    // ignore
  }
  return (
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    ''
  );
}

// ─── Универсальный запрос ─────────────────────────────────────
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  resource: 'all' | 'apartment' | 'utilities' | 'meters' | 'repairs';
  id?: string;
  body?: unknown;
}

async function request<T>(opts: RequestOptions): Promise<T> {
  const token = getAuthToken();
  const url = new URL(API_URL);
  url.searchParams.set('resource', opts.resource);
  if (opts.id) url.searchParams.set('id', opts.id);

  const init: RequestInit = {
    method: opts.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
    },
  };
  if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    let detail = '';
    try {
      const data = await res.json();
      detail = data?.error || data?.detail || '';
    } catch {
      // ignore
    }
    throw new Error(`Home API ${res.status}: ${detail || res.statusText}`);
  }
  return (await res.json()) as T;
}

// ─── Публичный API ────────────────────────────────────────────
export const HomeAPI = {
  getAll: () => request<HomeData>({ resource: 'all' }),

  saveApartment: (data: Partial<ApartmentDTO>) =>
    request<ApartmentDTO>({ method: 'POST', resource: 'apartment', body: data }),

  createUtility: (data: {
    name: string;
    amount: number | string;
    due_date?: string;
    paid?: boolean;
  }) => request<UtilityDTO>({ method: 'POST', resource: 'utilities', body: data }),

  updateUtility: (id: string, data: Partial<UtilityDTO>) =>
    request<UtilityDTO>({ method: 'PUT', resource: 'utilities', id, body: data }),

  deleteUtility: (id: string) =>
    request<{ success: boolean }>({ method: 'DELETE', resource: 'utilities', id }),

  createMeter: (data: {
    meter_type: MeterType;
    reading_date: string;
    value: number | string;
    note?: string;
  }) => request<MeterDTO>({ method: 'POST', resource: 'meters', body: data }),

  deleteMeter: (id: string) =>
    request<{ success: boolean }>({ method: 'DELETE', resource: 'meters', id }),

  createRepair: (data: {
    title: string;
    status?: RepairStatus;
    priority?: RepairPriority;
    estimate_rub?: number | string;
    notes?: string;
  }) => request<RepairDTO>({ method: 'POST', resource: 'repairs', body: data }),

  updateRepair: (id: string, data: Partial<RepairDTO>) =>
    request<RepairDTO>({ method: 'PUT', resource: 'repairs', id, body: data }),

  deleteRepair: (id: string) =>
    request<{ success: boolean }>({ method: 'DELETE', resource: 'repairs', id }),
};