import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { CATEGORY_CONFIG, type LifeEventCategory } from './types';

interface Props {
  total: number;
  shown: number;
  category: 'all' | LifeEventCategory;
  setCategory: (c: 'all' | LifeEventCategory) => void;
  year: 'all' | string;
  setYear: (y: 'all' | string) => void;
  years: string[];
  search: string;
  setSearch: (q: string) => void;
  onAdd: () => void;
  onAddToday?: () => void;
}

export default function LifeFiltersBar({
  total, shown, category, setCategory, year, setYear, years, search, setSearch, onAdd, onAddToday,
}: Props) {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-3 shadow-sm space-y-2">
      <div className="relative w-full">
        <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Найти событие…"
          className="pl-9 pr-8 h-9 text-sm bg-white w-full"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            title="Очистить"
          >
            <Icon name="X" size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-2.5">
              <Icon name="Filter" size={14} className="sm:mr-1.5" />
              <span className="hidden sm:inline">Категория</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-72 overflow-y-auto">
            <DropdownMenuLabel>Категория события</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setCategory('all')}>
              <Icon name="Layers" size={14} className="mr-2" /> Все категории
            </DropdownMenuItem>
            {(Object.entries(CATEGORY_CONFIG) as [LifeEventCategory, typeof CATEGORY_CONFIG['other']][]).map(([k, c]) => (
              <DropdownMenuItem key={k} onClick={() => setCategory(k)}>
                <Icon name={c.icon} size={14} className="mr-2" /> {c.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {years.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-2.5">
                <Icon name="Calendar" size={14} className="sm:mr-1.5" />
                <span className="hidden sm:inline">Год</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
              <DropdownMenuLabel>Год</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setYear('all')}>Все годы</DropdownMenuItem>
              {years.map((y) => (
                <DropdownMenuItem key={y} onClick={() => setYear(y)}>{y}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {onAddToday && (
          <Button
            onClick={onAddToday}
            variant="outline"
            size="sm"
            className="h-9 px-2.5 border-pink-300 text-pink-700 hover:bg-pink-50"
            title="Записать сегодняшнее событие"
          >
            <Icon name="CalendarPlus" size={14} className="sm:mr-1.5" />
            <span className="hidden sm:inline">Сегодня</span>
          </Button>
        )}

        <Button
          onClick={onAdd}
          size="sm"
          className="h-9 px-3 ml-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        >
          <Icon name="Plus" size={14} className="mr-1.5" />
          Событие
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          <Icon name="MapPinned" size={12} className="mr-1" />
          {shown} / {total}
        </Badge>
        {category !== 'all' && (
          <Badge variant="outline" className="cursor-pointer" onClick={() => setCategory('all')}>
            {CATEGORY_CONFIG[category].label} ×
          </Badge>
        )}
        {year !== 'all' && (
          <Badge variant="outline" className="cursor-pointer" onClick={() => setYear('all')}>
            {year} ×
          </Badge>
        )}
        {search && (
          <Badge variant="outline" className="cursor-pointer" onClick={() => setSearch('')}>
            «{search}» ×
          </Badge>
        )}
      </div>
    </div>
  );
}