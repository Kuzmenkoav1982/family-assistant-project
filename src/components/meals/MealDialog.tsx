import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Понедельник' },
  { value: 'tuesday', label: 'Вторник' },
  { value: 'wednesday', label: 'Среда' },
  { value: 'thursday', label: 'Четверг' },
  { value: 'friday', label: 'Пятница' },
  { value: 'saturday', label: 'Суббота' },
  { value: 'sunday', label: 'Воскресенье' }
];

const MEAL_TYPES = [
  { value: 'breakfast', label: '🍳 Завтрак', emoji: '🍳' },
  { value: 'lunch', label: '🍽️ Обед', emoji: '🍽️' },
  { value: 'dinner', label: '🍷 Ужин', emoji: '🍷' }
];

interface MealDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingMeal: MealPlan | null;
  newMeal: {
    day: string;
    mealType: MealPlan['mealType'];
    dishName: string;
    description: string;
    emoji: string;
  };
  setNewMeal: (meal: any) => void;
  handleAddMeal: () => void;
}

export function MealDialog({
  isOpen,
  onOpenChange,
  editingMeal,
  newMeal,
  setNewMeal,
  handleAddMeal
}: MealDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingMeal ? 'Редактировать блюдо' : 'Добавить блюдо в меню'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">День недели</label>
            <Select
              value={newMeal.day}
              onValueChange={(value) => setNewMeal({ ...newMeal, day: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map(day => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Приём пищи</label>
            <Select
              value={newMeal.mealType}
              onValueChange={(value: MealPlan['mealType']) => {
                const selectedType = MEAL_TYPES.find(t => t.value === value);
                setNewMeal({ 
                  ...newMeal, 
                  mealType: value,
                  emoji: selectedType?.emoji || '🍳'
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Название блюда</label>
            <Input
              placeholder="Например: Паста карбонара"
              value={newMeal.dishName}
              onChange={(e) => setNewMeal({ ...newMeal, dishName: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Описание (необязательно)</label>
            <Textarea
              placeholder="Рецепт или комментарий"
              value={newMeal.description}
              onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAddMeal} className="flex-1">
              <Icon name={editingMeal ? "Save" : "Plus"} size={16} className="mr-2" />
              {editingMeal ? 'Сохранить' : 'Добавить'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
