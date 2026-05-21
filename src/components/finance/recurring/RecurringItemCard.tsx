import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { FREQ_LABELS, MONTH_NAMES, formatMoney, monthlyAmount, type RecurringItem } from './recurringUtils';

const DAY_OF_WEEK_SHORT: Record<number, string> = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' };

function MonthBadges({ item }: { item: RecurringItem }) {
  if (!item.active_months || item.active_months.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-0.5 mt-0.5">
      {item.active_months.map(m => (
        <Badge key={m} variant="outline" className="text-[10px] px-1 py-0 h-4 font-normal text-muted-foreground border-gray-200">
          {MONTH_NAMES[m - 1]}
        </Badge>
      ))}
    </div>
  );
}

interface Props {
  item: RecurringItem;
  onEdit: (item: RecurringItem) => void;
  onToggle: (item: RecurringItem, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function ActiveRecurringCard({ item, onEdit, onToggle, onDelete }: Props) {
  const color = item.category_color || (item.type === 'income' ? '#22C55E' : '#EF4444');
  const iconName = item.category_icon || (item.type === 'income' ? 'TrendingUp' : 'TrendingDown');

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit(item)}>
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
            <Icon name={iconName} size={20} style={{ color }} />
          </div>
          <div className="flex-1 px-3 py-2 min-w-0">
            <span className="text-sm font-medium truncate block">{item.description || 'Без описания'}</span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground min-w-0">
              <span className="truncate">{FREQ_LABELS[item.frequency] || item.frequency}</span>
              {item.day_of_month && (
                item.frequency === 'weekly'
                  ? <span className="truncate">· {DAY_OF_WEEK_SHORT[item.day_of_month] || item.day_of_month}</span>
                  : <span className="truncate">· {item.day_of_month}-е число</span>
              )}
              {item.category_name && <span className="truncate max-w-[120px]">· {item.category_name}</span>}
            </div>
            <MonthBadges item={item} />
          </div>
          <div className="pr-1 text-right flex-shrink-0">
            <p className={`font-bold text-sm ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {item.type === 'income' ? '+' : '-'}{formatMoney(item.amount)} ₽
            </p>
            {(item.frequency === 'weekly' || item.frequency === 'quarterly' || item.frequency === 'yearly') && (
              <p className="text-[10px] text-muted-foreground">~{formatMoney(Math.round(monthlyAmount(item)))} ₽/мес</p>
            )}
          </div>
          <div className="flex flex-col pr-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-blue-500"
              onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
              <Icon name="Pencil" size={12} />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-amber-500"
              onClick={(e) => onToggle(item, e)}>
              <Icon name="Pause" size={12} />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
              onClick={(e) => onDelete(item.id, e)}>
              <Icon name="Trash2" size={12} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InactiveRecurringCard({ item, onEdit, onToggle, onDelete }: Props) {
  const color = item.category_color || (item.type === 'income' ? '#22C55E' : '#EF4444');
  const iconName = item.category_icon || (item.type === 'income' ? 'TrendingUp' : 'TrendingDown');

  return (
    <Card className="opacity-50 cursor-pointer hover:opacity-70 transition-opacity overflow-hidden" onClick={() => onEdit(item)}>
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
            <Icon name={iconName} size={16} style={{ color }} />
          </div>
          <div className="flex-1 px-3 py-2 min-w-0">
            <span className="text-sm font-medium truncate block">{item.description || 'Без описания'}</span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground min-w-0">
              <span className="truncate">{FREQ_LABELS[item.frequency] || item.frequency}</span>
              {item.category_name && <span className="truncate max-w-[120px]">· {item.category_name}</span>}
            </div>
          </div>
          <span className={`text-sm font-bold pr-2 flex-shrink-0 ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {item.type === 'income' ? '+' : '-'}{formatMoney(item.amount)} ₽
          </span>
          <div className="flex items-center flex-shrink-0 pr-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-emerald-600"
              onClick={(e) => onToggle(item, e)}>
              <Icon name="Play" size={14} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
              onClick={(e) => onDelete(item.id, e)}>
              <Icon name="Trash2" size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
