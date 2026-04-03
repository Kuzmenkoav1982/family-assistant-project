import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { BudgetItem } from '@/data/financeBudgetTypes';
import { formatMoney } from '@/data/financeBudgetTypes';

interface BudgetsTabProps {
  budgets: BudgetItem[];
  totalPlanned: number;
  totalSpent: number;
  onAdd: () => void;
  onEdit: (b: BudgetItem) => void;
  onDelete: (id: string) => void;
}

export default function BudgetsTab({ budgets, totalPlanned, totalSpent, onAdd, onEdit, onDelete }: BudgetsTabProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Запланировано / Потрачено</p>
          <p className="font-bold">{formatMoney(totalSpent)} / {formatMoney(totalPlanned)} &#8381;</p>
        </div>
        <Button size="sm" onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Icon name="Plus" size={14} className="mr-1" /> Лимит
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="PieChart" size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Лимиты не установлены</p>
          <p className="text-xs mt-1">Задайте месячные лимиты по категориям расходов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map(b => {
            const pct = b.planned > 0 ? Math.min(100, (b.spent / b.planned) * 100) : 0;
            const over = b.spent > b.planned;
            return (
              <Card key={b.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: (b.category_color || '#6B7280') + '20' }}>
                        <Icon name={b.category_icon || 'Tag'} size={16}
                          style={{ color: b.category_color || '#6B7280' }} />
                      </div>
                      <span className="font-medium text-sm">{b.category_name || 'Без категории'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="text-right mr-1">
                        <span className={`text-sm font-bold ${over ? 'text-red-600' : 'text-foreground'}`}>
                          {formatMoney(b.spent)}
                        </span>
                        <span className="text-xs text-muted-foreground"> / {formatMoney(b.planned)} &#8381;</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-blue-500"
                        onClick={() => onEdit(b)} title="Редактировать">
                        <Icon name="Pencil" size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                        onClick={() => onDelete(b.id)} title="Удалить">
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  {over && (
                    <Badge variant="outline" className="mt-2 text-[10px] text-red-600 border-red-200 bg-red-50">
                      Превышение на {formatMoney(b.spent - b.planned)} &#8381;
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
