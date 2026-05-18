import type { MemoryEntry } from './types';

export function formatMemoryShortDate(entry: MemoryEntry): string | null {
  if (entry.memory_date) {
    try {
      return new Date(entry.memory_date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return entry.memory_date;
    }
  }
  return entry.memory_period_label || null;
}
