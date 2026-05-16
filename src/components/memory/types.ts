export interface MemoryAsset {
  id: string;
  file_url: string;
  sort_order: number;
  width: number | null;
  height: number | null;
  mime_type: string | null;
}

export type MemoryEntryStatus = 'draft' | 'published' | 'archived';

export interface MemoryEntry {
  id: string;
  title: string;
  caption: string | null;
  story: string | null;
  memory_date: string | null;
  memory_period_label: string | null;
  location_label: string | null;
  event_id: string | null;
  cover_asset_id: string | null;
  status?: MemoryEntryStatus;
  created_at: string | null;
  updated_at: string | null;
  assets: MemoryAsset[];
  member_ids: number[];
}

export interface MemoryAlbum {
  id: string;
  title: string;
  description: string | null;
  cover_asset_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  entries_count?: number;
  entries?: MemoryEntry[];
}

export interface CreateMemoryEntryInput {
  title: string;
  caption?: string | null;
  story?: string | null;
  memory_date?: string | null;
  memory_period_label?: string | null;
  location_label?: string | null;
  event_id?: string | null;
  member_ids?: number[];
}

export interface UpdateMemoryEntryInput {
  title?: string;
  caption?: string | null;
  story?: string | null;
  memory_date?: string | null;
  memory_period_label?: string | null;
  location_label?: string | null;
  event_id?: string | null;
  cover_asset_id?: string | null;
  member_ids?: number[];
}

export const MAX_PHOTOS_PER_MEMORY = 10;