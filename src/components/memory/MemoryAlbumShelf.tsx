import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import MemoryAlbumCard from './MemoryAlbumCard';
import { resolveAlbumCover } from './coverResolver';
import type { MemoryAlbum, MemoryEntry } from './types';

interface MemoryAlbumShelfProps {
  albums: MemoryAlbum[];
  entries: MemoryEntry[];
  loading: boolean;
  onOpen: (album: MemoryAlbum) => void;
  onCreate: () => void;
}

export default function MemoryAlbumShelf({
  albums,
  entries,
  loading,
  onOpen,
  onCreate,
}: MemoryAlbumShelfProps) {
  if (loading) {
    return (
      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Icon name="BookHeart" size={18} className="text-amber-600" />
          Альбомы
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Icon name="BookHeart" size={18} className="text-amber-600" />
          Альбомы
          {albums.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">({albums.length})</span>
          )}
        </h2>
        <Button variant="outline" size="sm" onClick={onCreate}>
          <Icon name="Plus" size={14} className="mr-1.5" />
          Создать альбом
        </Button>
      </div>

      {albums.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-amber-200 shadow-sm">
          <img
            src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/a55c5cf6-8112-4305-accd-bb133edf0a83.jpg"
            alt="Семейный альбом"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/30 dark:from-gray-900/95 dark:via-gray-900/80 dark:to-gray-900/20" />
          <div className="relative flex flex-col items-start gap-3 p-5 sm:p-6 max-w-md">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shadow-sm">
                <Icon name="BookHeart" size={18} className="text-amber-600 dark:text-amber-300" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Тематические альбомы
              </span>
            </div>
            <h3 className="text-lg font-bold text-amber-950 dark:text-amber-50 leading-tight">
              Начните летопись своей семьи
            </h3>
            <p className="text-sm text-amber-900/80 dark:text-amber-100/80 leading-relaxed">
              Соберите воспоминания в альбомы — «Предки», «Наша семья в 90-е», «Детство Матвея», «Свадьба бабушки и дедушки».
            </p>
            <Button onClick={onCreate} className="bg-amber-600 hover:bg-amber-700 text-white shadow-md">
              <Icon name="Plus" size={16} className="mr-1.5" />
              Создать первый альбом
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {albums.map(a => (
            <MemoryAlbumCard
              key={a.id}
              album={a}
              coverUrl={resolveAlbumCover(a, entries)}
              onClick={() => onOpen(a)}
            />
          ))}
        </div>
      )}
    </section>
  );
}