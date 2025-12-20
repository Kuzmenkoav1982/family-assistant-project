import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface AddMealDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (entry: NewEntry) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: any[];
  onSearch: (query: string) => void;
  onSelectProduct: (product: any) => void;
  newEntry: NewEntry;
  setNewEntry: (entry: NewEntry) => void;
  addMode: 'search' | 'manual';
  setAddMode: (mode: 'search' | 'manual') => void;
}

export interface NewEntry {
  product_id: number | null;
  product_name: string;
  amount: string;
  meal_type: string;
  calories: string;
  protein: string;
  fats: string;
  carbs: string;
}

export function AddMealDialog({
  isOpen,
  onOpenChange,
  onAdd,
  searchQuery,
  setSearchQuery,
  searchResults,
  onSearch,
  onSelectProduct,
  newEntry,
  setNewEntry,
  addMode,
  setAddMode
}: AddMealDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Icon name="Plus" size={18} />
          Добавить приём пищи
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить приём пищи</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Тип приёма пищи</Label>
            <Select
              value={newEntry.meal_type}
              onValueChange={(value) => setNewEntry({ ...newEntry, meal_type: value })}
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

          <div className="flex gap-2">
            <Button
              type="button"
              variant={addMode === 'search' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setAddMode('search')}
            >
              <Icon name="Search" size={16} className="mr-2" />
              Поиск в базе
            </Button>
            <Button
              type="button"
              variant={addMode === 'manual' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setAddMode('manual')}
            >
              <Icon name="Pencil" size={16} className="mr-2" />
              Ручной ввод
            </Button>
          </div>

          {addMode === 'search' ? (
            <>
              <Alert className="bg-blue-50 border-blue-200">
                <Icon name="Info" className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  Не нашли продукт в базе? Попробуйте <strong>Ручной ввод</strong> или{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 underline"
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/ai-assistant');
                    }}
                  >
                    спросите у Кузи
                  </Button>
                  {' '}о калорийности продукта!
                </AlertDescription>
              </Alert>
              
              <div>
                <Label>Продукт</Label>
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearch(e.target.value);
                  }}
                  placeholder="Начните вводить название..."
                />
                {searchResults.length > 0 && (
                  <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => onSelectProduct(product)}
                        className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-0"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {product.calories} ккал • Б: {product.protein}г • Ж: {product.fats}г • У: {product.carbs}г
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Название продукта или блюда</Label>
                <Input
                  value={newEntry.product_name}
                  onChange={(e) => setNewEntry({ ...newEntry, product_name: e.target.value })}
                  placeholder="Например: Борщ домашний"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Калории (ккал)</Label>
                  <Input
                    type="number"
                    value={newEntry.calories}
                    onChange={(e) => setNewEntry({ ...newEntry, calories: e.target.value })}
                    placeholder="250"
                  />
                </div>
                <div>
                  <Label>Белки (г)</Label>
                  <Input
                    type="number"
                    value={newEntry.protein}
                    onChange={(e) => setNewEntry({ ...newEntry, protein: e.target.value })}
                    placeholder="15"
                  />
                </div>
                <div>
                  <Label>Жиры (г)</Label>
                  <Input
                    type="number"
                    value={newEntry.fats}
                    onChange={(e) => setNewEntry({ ...newEntry, fats: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label>Углеводы (г)</Label>
                  <Input
                    type="number"
                    value={newEntry.carbs}
                    onChange={(e) => setNewEntry({ ...newEntry, carbs: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <Label>Количество (граммов)</Label>
            <Input
              type="number"
              value={newEntry.amount}
              onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
              placeholder="100"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={() => onAdd(newEntry)}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
