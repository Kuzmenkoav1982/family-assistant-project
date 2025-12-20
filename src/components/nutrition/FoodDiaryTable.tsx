import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

export interface FoodDiaryEntry {
  id: number;
  meal_type: string;
  product_name: string;
  amount: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  created_at: string;
}

interface FoodDiaryTableProps {
  foodDiary: FoodDiaryEntry[];
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  editingEntry: FoodDiaryEntry | null;
  setEditingEntry: (entry: FoodDiaryEntry | null) => void;
  onEdit: (entry: FoodDiaryEntry) => void;
  onDelete: (entryId: number) => void;
  onUpdate: () => Promise<void>;
}

const getMealTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    breakfast: '🍳 Завтрак',
    lunch: '🍽️ Обед',
    dinner: '🍷 Ужин',
    snack: '🍎 Перекус'
  };
  return labels[type] || type;
};

export function FoodDiaryTable({
  foodDiary,
  isEditDialogOpen,
  setIsEditDialogOpen,
  editingEntry,
  setEditingEntry,
  onEdit,
  onDelete,
  onUpdate
}: FoodDiaryTableProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BookOpen" size={24} />
            Дневник питания
          </CardTitle>
        </CardHeader>
        <CardContent>
          {foodDiary.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon name="UtensilsCrossed" size={48} className="mx-auto mb-4 opacity-30" />
              <p>Записей пока нет</p>
              <p className="text-sm mt-2">Добавьте приём пищи в разделе "Меню"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                const meals = foodDiary.filter(entry => entry.meal_type === mealType);
                if (meals.length === 0) return null;
                
                const totalCal = meals.reduce((sum, m) => sum + m.calories, 0);
                
                return (
                  <div key={mealType} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{getMealTypeLabel(mealType)}</h3>
                      <Badge variant="secondary">{Math.round(totalCal)} ккал</Badge>
                    </div>
                    <div className="space-y-2">
                      {meals.map(meal => (
                        <div key={meal.id} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2 group">
                          <div>
                            <div className="font-medium">{meal.product_name}</div>
                            <div className="text-gray-500 text-xs">
                              {meal.amount}г · Б: {Math.round(meal.protein)}г · Ж: {Math.round(meal.fats)}г · У: {Math.round(meal.carbs)}г
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="font-semibold">{Math.round(meal.calories)} ккал</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                              onClick={() => onEdit(meal)}
                            >
                              <Icon name="Pencil" size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                              onClick={() => onDelete(meal.id)}
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать запись</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4">
              <div>
                <Label>Продукт</Label>
                <Input value={editingEntry.product_name} disabled className="bg-gray-100" />
              </div>

              <div>
                <Label>Приём пищи</Label>
                <Select 
                  value={editingEntry.meal_type} 
                  onValueChange={(value) => setEditingEntry({ ...editingEntry, meal_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">🍳 Завтрак</SelectItem>
                    <SelectItem value="lunch">🍽️ Обед</SelectItem>
                    <SelectItem value="dinner">🍷 Ужин</SelectItem>
                    <SelectItem value="snack">🍎 Перекус</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Количество (граммов)</Label>
                <Input
                  type="number"
                  value={editingEntry.amount}
                  onChange={(e) => setEditingEntry({ ...editingEntry, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={onUpdate}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
