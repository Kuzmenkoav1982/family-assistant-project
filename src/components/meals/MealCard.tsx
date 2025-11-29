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
    <Card className="bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{meal.emoji}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm break-words">{meal.dishName}</h4>
              {meal.description && (
                <p className="text-xs text-muted-foreground mt-1 break-words">{meal.description}</p>
              )}
              <Badge variant="outline" className="mt-2 text-[10px] px-1 py-0">
                <Icon name="User" size={10} className="mr-1" />
                {meal.addedByName}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onEdit(meal)}
            >
              <Icon name="Edit2" size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(meal.id)}
            >
              <Icon name="Trash2" size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
