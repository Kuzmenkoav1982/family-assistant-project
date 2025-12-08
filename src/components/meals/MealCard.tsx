import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface MealPlan {
  id: string;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  dishName: string;
  description?: string;
  addedBy: string;
  addedByName: string;
  addedAt: string;
  emoji?: string;
}

interface MealCardProps {
  meal: MealPlan;
  onEdit: (meal: MealPlan) => void;
  onDelete: (id: string) => void;
}

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  return (
    <Card className="bg-white hover:shadow-sm transition-shadow border border-gray-200">
      <CardContent className="p-2">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-lg flex-shrink-0">{meal.emoji}</span>
              <h4 className="font-semibold text-xs leading-tight break-words line-clamp-2">{meal.dishName}</h4>
            </div>
            <div className="flex gap-0.5 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-100"
                onClick={() => onEdit(meal)}
                title="Редактировать"
              >
                <Icon name="Edit2" size={12} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(meal.id)}
                title="Удалить"
              >
                <Icon name="Trash2" size={12} />
              </Button>
            </div>
          </div>
          {meal.description && (
            <p className="text-[10px] text-muted-foreground leading-tight break-words line-clamp-2 pl-6">{meal.description}</p>
          )}
          <div className="flex items-center gap-1 pl-6">
            <Icon name="User" size={8} className="text-gray-400" />
            <span className="text-[9px] text-gray-500 truncate">{meal.addedByName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}