import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface MemoryAlbumBannerProps {
  variant?: 'tree' | 'life-road';
}

export default function MemoryAlbumBanner({ variant = 'tree' }: MemoryAlbumBannerProps) {
  const isTree = variant === 'tree';

  const description = isTree
    ? 'Привяжите фотографии к людям из древа — память появится в карточке каждого, даже у тех, кого уже нет рядом.'
    : 'Привяжите фотографии к событиям дороги жизни — каждая точка хроники оживёт реальными моментами семьи.';

  return (
    <Link
      to="/memory"
      className="group block relative overflow-hidden rounded-2xl border border-violet-200 dark:border-violet-900/50 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 dark:from-violet-950/30 dark:via-fuchsia-950/20 dark:to-purple-950/30 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <img
        src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/ba58e6ab-2db3-41c5-b3a4-43bbec9c87c4.jpg"
        alt="Альбом поколений"
        className="absolute inset-0 h-full w-full object-cover opacity-30"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/60 dark:from-gray-900/95 dark:via-gray-900/85 dark:to-gray-900/40" />
      <div className="relative flex items-start gap-3 p-4">
        <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Icon name="BookHeart" size={22} className="text-violet-600 dark:text-violet-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
              Связанный раздел
            </span>
          </div>
          <h3 className="text-base font-bold text-violet-900 dark:text-violet-50 leading-tight">
            Альбом поколений
          </h3>
          <p className="text-xs text-violet-800/80 dark:text-violet-200/80 leading-relaxed mt-1">
            {description}
          </p>
        </div>
        <Icon
          name="ArrowRight"
          size={18}
          className="text-violet-600 dark:text-violet-300 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
