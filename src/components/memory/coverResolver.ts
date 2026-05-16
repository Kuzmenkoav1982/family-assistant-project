import type { MemoryAlbum, MemoryEntry } from './types';

/**
 * Возвращает URL обложки альбома.
 *
 * Приоритет:
 *  1. Если у альбома задан cover_asset_id и среди переданных entries есть asset с таким id —
 *     используем его (ручная обложка).
 *  2. Иначе (ручной cover не выбран ИЛИ asset не найден/архивирован) — fallback:
 *     первое фото первой памяти из списка (auto-cover).
 *  3. Если фото нет совсем — null.
 *
 * entries — массив памятей, входящих в альбом (или общий список, в котором будем искать asset).
 */
export function resolveAlbumCover(
  album: MemoryAlbum,
  entries: MemoryEntry[],
): string | null {
  // 1. Ручная обложка
  if (album.cover_asset_id) {
    for (const e of entries) {
      const found = e.assets.find(a => a.id === album.cover_asset_id);
      if (found) return found.file_url;
    }
    // cover_asset_id указан, но asset не найден среди переданных entries —
    // переходим к fallback.
  }

  // 2. Auto-cover: первое фото первой памяти (entries уже отсортированы по дате на бэке).
  for (const e of entries) {
    const sorted = [...e.assets].sort((a, b) => a.sort_order - b.sort_order);
    const cover =
      sorted.find(a => a.id === e.cover_asset_id)?.file_url || sorted[0]?.file_url;
    if (cover) return cover;
  }

  return null;
}
