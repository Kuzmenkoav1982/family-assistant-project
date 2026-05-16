import func2url from '../../../backend/func2url.json';
import { readActorMemberId } from '@/lib/identity';
import type {
  MemoryEntry,
  MemoryAlbum,
  CreateMemoryEntryInput,
  UpdateMemoryEntryInput,
  MemoryAsset,
} from './types';

const API_URL = (func2url as Record<string, string>)['memory'];

function getActorMemberId(): string {
  const id = readActorMemberId();
  if (!id) {
    throw new Error('Не найден member_id. Войдите в аккаунт заново.');
  }
  return id;
}

export class MemoryApiError extends Error {
  status: number;
  payload?: Record<string, unknown>;
  constructor(status: number, message: string, payload?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function call<T>(method: string, query: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${query}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-User-Id': getActorMemberId() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let payload: Record<string, unknown> | undefined;
    const text = await res.text().catch(() => '');
    try { payload = text ? JSON.parse(text) : undefined; } catch { /* not json */ }
    const message = (payload?.error as string) || text || `HTTP ${res.status}`;
    throw new MemoryApiError(res.status, message, payload);
  }
  return res.json() as Promise<T>;
}

export const memoryApi = {
  // Entries
  listEntries: (params?: { event_id?: string; member_id?: number; album_id?: string }) => {
    const q = new URLSearchParams({ resource: 'entries' });
    if (params?.event_id) q.set('event_id', params.event_id);
    if (params?.member_id != null) q.set('member_id', String(params.member_id));
    if (params?.album_id) q.set('album_id', params.album_id);
    return call<{ entries: MemoryEntry[] }>('GET', `?${q.toString()}`).then(r => r.entries);
  },

  getEntry: (id: string) =>
    call<MemoryEntry>('GET', `?resource=entries&id=${encodeURIComponent(id)}`),

  createEntry: (input: CreateMemoryEntryInput & { status?: 'draft' | 'published' }) =>
    call<MemoryEntry>('POST', '?resource=entries', input),

  updateEntry: (id: string, patch: UpdateMemoryEntryInput) =>
    call<MemoryEntry>('PUT', `?resource=entries&id=${encodeURIComponent(id)}`, patch),

  archiveEntry: (id: string) =>
    call<{ ok: boolean }>('POST', `?resource=entries/archive&id=${encodeURIComponent(id)}`),

  publishEntry: (id: string) =>
    call<MemoryEntry>('POST', `?resource=entries/publish&id=${encodeURIComponent(id)}`),

  discardDraft: (id: string) =>
    call<{ ok: boolean; discarded: boolean }>(
      'POST',
      `?resource=entries/discard&id=${encodeURIComponent(id)}`,
    ),

  // Assets
  addAsset: (
    entryId: string,
    asset: { file_url: string; width?: number; height?: number; mime_type?: string; sort_order?: number },
  ) =>
    call<{ id: string; entry: MemoryEntry }>(
      'POST',
      `?resource=assets&entry_id=${encodeURIComponent(entryId)}`,
      asset,
    ),

  reorderAsset: (assetId: string, sortOrder: number) =>
    call<{ ok: boolean }>('PUT', `?resource=assets&id=${encodeURIComponent(assetId)}`, { sort_order: sortOrder }),

  removeAsset: (assetId: string) =>
    call<{ ok: boolean; entry: MemoryEntry }>('POST', `?resource=assets/remove&id=${encodeURIComponent(assetId)}`),

  // Persons
  setPersons: (entryId: string, memberIds: number[]) =>
    call<{ entry: MemoryEntry }>('POST', `?resource=persons&entry_id=${encodeURIComponent(entryId)}`, {
      member_ids: memberIds,
    }),

  // Albums
  listAlbums: () =>
    call<{ albums: MemoryAlbum[] }>('GET', '?resource=albums').then(r => r.albums),

  getAlbum: (id: string) =>
    call<MemoryAlbum>('GET', `?resource=albums&id=${encodeURIComponent(id)}`),

  createAlbum: (input: { title: string; description?: string | null; cover_asset_id?: string | null }) =>
    call<MemoryAlbum>('POST', '?resource=albums', input),

  updateAlbum: (id: string, patch: Partial<{ title: string; description: string | null; cover_asset_id: string | null }>) =>
    call<MemoryAlbum>('PUT', `?resource=albums&id=${encodeURIComponent(id)}`, patch),

  archiveAlbum: (id: string) =>
    call<{ ok: boolean }>('POST', `?resource=albums/archive&id=${encodeURIComponent(id)}`),

  // Album links
  addToAlbum: (albumId: string, entryId: string, sortOrder = 0) =>
    call<{ ok: boolean }>('POST', '?resource=album-links', {
      album_id: albumId,
      memory_entry_id: entryId,
      sort_order: sortOrder,
    }),

  removeFromAlbum: (albumId: string, entryId: string) =>
    call<{ ok: boolean }>('POST', '?resource=album-links/remove', {
      album_id: albumId,
      memory_entry_id: entryId,
    }),
};

export type { MemoryEntry, MemoryAlbum, MemoryAsset };