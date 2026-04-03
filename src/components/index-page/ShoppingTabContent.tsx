import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import type { ShoppingItem, FamilyMember } from '@/types/family.types';

interface ShoppingTabContentProps {
  shoppingList: ShoppingItem[];
  currentUserId: string;
  currentUser: FamilyMember | undefined;
  toggleShoppingItem: (itemId: string) => void;
  deleteShoppingItem: (itemId: string) => void;
  clearBoughtItems: () => void;
  addShoppingItem: () => void;
  newItemName: string;
  setNewItemName: (v: string) => void;
  newItemCategory: 'products' | 'household' | 'clothes' | 'other';
  setNewItemCategory: (v: 'products' | 'household' | 'clothes' | 'other') => void;
  newItemQuantity: string;
  setNewItemQuantity: (v: string) => void;
  newItemPriority: 'normal' | 'urgent';
  setNewItemPriority: (v: 'normal' | 'urgent') => void;
  showAddItemDialog: boolean;
  setShowAddItemDialog: (v: boolean) => void;
}

export default function ShoppingTabContent({
  shoppingList,
  currentUserId,
  currentUser,
  toggleShoppingItem,
  deleteShoppingItem,
  clearBoughtItems,
  addShoppingItem,
  newItemName,
  setNewItemName,
  newItemCategory,
  setNewItemCategory,
  newItemQuantity,
  setNewItemQuantity,
  newItemPriority,
  setNewItemPriority,
  showAddItemDialog,
  setShowAddItemDialog,
}: ShoppingTabContentProps) {
  return (
    <TabsContent value="shopping">
      <Card key="shopping-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="ShoppingCart" />
              Список покупок
            </CardTitle>
            <div className="flex gap-2">
              {shoppingList.some(item => item.bought) && (
                <Button variant="outline" size="sm" onClick={clearBoughtItems}>
                  <Icon name="Trash2" className="mr-2" size={14} />
                  Очистить купленное
                </Button>
              )}
              <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-blue-500">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Добавить товар
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить товар</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Название товара</label>
                      <Input
                        placeholder="Молоко, хлеб..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Категория</label>
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value as 'products' | 'household' | 'clothes' | 'other')}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md"
                      >
                        <option value="products">{'\u{1F95B}'} Продукты</option>
                        <option value="household">{'\u{1F9F4}'} Хозтовары</option>
                        <option value="clothes">{'\u{1F455}'} Одежда</option>
                        <option value="other">{'\u{1F4E6}'} Другое</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Количество (опционально)</label>
                      <Input
                        placeholder="2 литра, 1 кг..."
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Приоритет</label>
                      <select
                        value={newItemPriority}
                        onChange={(e) => setNewItemPriority(e.target.value as 'normal' | 'urgent')}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md"
                      >
                        <option value="normal">Обычный</option>
                        <option value="urgent">{'\u{1F525}'} Срочно</option>
                      </select>
                    </div>
                    <Button onClick={addShoppingItem} className="w-full">
                      Добавить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {shoppingList.length > 0 ? (
            <div className="space-y-2">
              {shoppingList.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border-2 transition-all animate-fade-in ${
                    item.bought ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300 hover:border-green-400'
                  }`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={item.bought}
                      onCheckedChange={() => toggleShoppingItem(item.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${item.bought ? 'line-through text-gray-400' : ''}`}>
                          {item.name}
                        </h4>
                        {item.priority === 'urgent' && (
                          <Badge className="bg-red-500 text-white">Срочно</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.category === 'products' && '\u{1F95B} Продукты'}
                          {item.category === 'household' && '\u{1F9F4} Хозтовары'}
                          {item.category === 'clothes' && '\u{1F455} Одежда'}
                          {item.category === 'other' && '\u{1F4E6} Другое'}
                        </Badge>
                        {item.quantity && (
                          <span className="text-xs text-gray-600">{item.quantity}</span>
                        )}
                        <span className="text-xs text-gray-500">&bull; {item.addedByName}</span>
                      </div>
                    </div>
                    {(item.addedBy === currentUserId || currentUser?.role === 'owner') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteShoppingItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Всего товаров: {shoppingList.length}</span>
                  <span className="text-gray-600">
                    Куплено: {shoppingList.filter(item => item.bought).length} &bull; Осталось: {shoppingList.filter(item => !item.bought).length}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 text-center">
              <Icon name="ShoppingCart" size={48} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">Список покупок пуст</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Добавьте первый товар, чтобы начать планировать покупки
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
