import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  onAdd: () => void;
}

export default function LifeFiltersBar({
  total, shown, category, setCategory, year, setYear, years, onAdd,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-3 shadow-sm">
      <div className="flex items-center gap-2 mr-auto">
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
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Icon name="Filter" size={14} className="mr-1.5" />
            Категория
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
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
            <Button variant="outline" size="sm">
              <Icon name="Calendar" size={14} className="mr-1.5" />
              Год
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

      <Button onClick={onAdd} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <Icon name="Plus" size={14} className="mr-1.5" />
        Событие
      </Button>
    </div>
  );
}
