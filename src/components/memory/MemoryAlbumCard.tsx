import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { MemoryAlbum } from './types';

interface MemoryAlbumCardProps {
  album: MemoryAlbum;
  /** Опциональный override URL. Если не задан — берём album.preview_asset с бэка. */
  coverUrl?: string | null;
  onClick?: () => void;
}

export default function MemoryAlbumCard({ album, coverUrl, onClick }: MemoryAlbumCardProps) {
  const [broken, setBroken] = useState(false);
  const count = album.entries_count ?? 0;
  // Приоритет: явный override → backend preview_asset → placeholder
  const url = !broken ? (coverUrl || album.preview_asset?.file_url || null) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-xl border-2 border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 text-left transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <div className="relative flex-1 bg-amber-100/30">
        {url ? (
          <img
            src={url}
            alt={album.title}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-amber-600/60">
            <Icon name="BookHeart" size={48} />
          </div>
        )}
        <div className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-medium text-amber-900 shadow-sm">
          {count === 0 ? 'Пусто' : count === 1 ? '1 память' : `${count} памятей`}
        </div>
      </div>
      <div className="space-y-0.5 border-t border-amber-200/60 bg-white/80 p-3 backdrop-blur-sm">
        <h3 className="line-clamp-1 text-sm font-semibold text-amber-950">{album.title}</h3>
        {album.description && (
          <p className="line-clamp-2 text-xs text-amber-900/70">{album.description}</p>
        )}
      </div>
    </button>
  );
}
