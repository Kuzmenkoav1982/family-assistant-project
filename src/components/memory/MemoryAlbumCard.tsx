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
          <>
            <img
              src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/a55c5cf6-8112-4305-accd-bb133edf0a83.jpg"
              alt={album.title}
              loading="lazy"
              className="h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-amber-50/30 via-transparent to-amber-100/40">
              <div className="rounded-full bg-white/80 p-3 shadow-md backdrop-blur-sm">
                <Icon name="BookHeart" size={28} className="text-amber-600" />
              </div>
            </div>
          </>
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