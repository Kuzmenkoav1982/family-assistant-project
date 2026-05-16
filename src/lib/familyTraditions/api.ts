import { readActorUserId } from '@/lib/identity';
import func2url from '../../../backend/func2url.json';

const API_URL = (func2url as Record<string, string>)['family-traditions'] ?? '';

export interface TraditionItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  frequency: string;
  nextDate: string;
  participants: string[];
  isActive?: boolean;
}

function normalizeItem(raw: Record<string, unknown>): TraditionItem {
  return {
    id: String(raw.id ?? Date.now()),
    name: String(raw.name ?? raw.title ?? ''),
    description: String(raw.description ?? ''),
    icon: String(raw.icon ?? '✨'),
    frequency: String(raw.frequency ?? 'monthly'),
    nextDate: String(raw.nextDate ?? raw.next_date ?? ''),
    participants: Array.isArray(raw.participants) ? raw.participants.map(String) : [],
    isActive: raw.isActive !== false,
  };
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const uid = readActorUserId();
  if (uid) headers['X-User-Id'] = uid;
  return headers;
}

export async function fetchTraditions(): Promise<TraditionItem[]> {
  if (!API_URL) throw new Error('family-traditions URL not configured');
  const res = await fetch(API_URL, { headers: buildHeaders() });
  if (!res.ok) throw new Error(`${res.status}`);
  const data = await res.json();
  const items = (data.traditions ?? []) as Record<string, unknown>[];
  return items.map(normalizeItem);
}

export async function syncTraditions(items: TraditionItem[]): Promise<void> {
  if (!API_URL) throw new Error('family-traditions URL not configured');
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
}
