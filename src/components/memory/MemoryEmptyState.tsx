import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface MemoryEmptyStateProps {
  filterKind: 'member' | 'event' | 'album' | 'search' | null;
  filterLabel?: string;
  onAdd: () => void;
  onBulkAdd?: () => void;
  onClearFilter?: () => void;
}

export default function MemoryEmptyState({
  filterKind,
  filterLabel,
  onAdd,
  onBulkAdd,
  onClearFilter,
}: MemoryEmptyStateProps) {
  let heading = 'Здесь будут жить семейные моменты';
  if (filterKind === 'search') heading = 'Ничего не найдено по текущим фильтрам';
  else if (filterKind === 'member' && filterLabel) heading = `Пока нет воспоминаний про ${filterLabel}`;
  else if (filterKind === 'event' && filterLabel) heading = `Пока нет воспоминаний об «${filterLabel}»`;
  else if (filterKind === 'album' && filterLabel) heading = `Альбом «${filterLabel}» пока пуст`;

  let description = 'Добавьте первую карточку памяти: 1–10 фото, кто на них, дата и короткая история. Раз в месяц или раз в полгода — пополняйте альбом вместе с семьёй.';
  if (filterKind === 'search') description = 'Попробуйте упростить запрос или сбросить часть фильтров.';
  else if (filterKind === 'album') description = 'Соберите его из уже созданных карточек или создайте новую — она автоматически попадёт сюда.';
  else if (filterKind) description = 'Создайте первую карточку памяти — фото, дата и короткая история. Контекст уже привязан.';

  const isSearch = filterKind === 'search';
  const eyebrow = isSearch ? 'Поиск не дал результатов' : 'Семейная память';
  const eyebrowColor = isSearch ? 'text-slate-700 dark:text-slate-300' : 'text-violet-700 dark:text-violet-300';
  const iconBg = isSearch ? 'bg-slate-100 dark:bg-slate-800' : 'bg-violet-100 dark:bg-violet-900/40';
  const iconColor = isSearch ? 'text-slate-600 dark:text-slate-300' : 'text-violet-600 dark:text-violet-300';
  const overlay = isSearch
    ? 'bg-gradient-to-r from-white/95 via-white/85 to-white/40 dark:from-gray-900/95 dark:via-gray-900/85 dark:to-gray-900/30'
    : 'bg-gradient-to-r from-white/95 via-white/80 to-white/30 dark:from-gray-900/95 dark:via-gray-900/80 dark:to-gray-900/20';
  const borderColor = isSearch ? 'border-slate-200' : 'border-violet-200';

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${borderColor} shadow-sm`}>
      <img
        src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/ba58e6ab-2db3-41c5-b3a4-43bbec9c87c4.jpg"
        alt="Семейные воспоминания"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className={`absolute inset-0 ${overlay}`} />
      <div className="relative flex flex-col items-start gap-3 p-5 sm:p-7 max-w-xl">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
            <Icon name={isSearch ? 'SearchX' : 'BookHeart'} size={18} className={iconColor} />
          </div>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${eyebrowColor}`}>
            {eyebrow}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold leading-tight text-gray-900 dark:text-gray-50">
          {heading}
        </h3>
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
          {description}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {onBulkAdd && !isSearch && (
            <Button onClick={onBulkAdd} variant="outline" className="bg-white/90 hover:bg-white">
              <Icon name="FolderPlus" size={16} className="mr-1.5" />
              Добавить существующие
            </Button>
          )}
          {!isSearch && (
            <Button onClick={onAdd} className="bg-violet-600 hover:bg-violet-700 text-white shadow-md">
              <Icon name="Plus" size={16} className="mr-1.5" />
              {filterKind ? 'Создать новую' : 'Добавить первую память'}
            </Button>
          )}
          {onClearFilter && (
            <Button
              onClick={onClearFilter}
              variant={isSearch ? 'default' : 'ghost'}
              className={isSearch ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-md' : ''}
            >
              <Icon name="X" size={14} className="mr-1.5" />
              Сбросить фильтры
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
