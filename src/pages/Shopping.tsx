import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ShoppingItem } from '@/types/family.types';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';

const STORAGE_KEY = 'family_shopping_list';

const CATEGORIES = [
  { value: 'products', label: '🥛 Продукты', icon: 'ShoppingBasket' },
  { value: 'household', label: '🧴 Хозтовары', icon: 'Home' },
  { value: 'clothes', label: '👕 Одежда', icon: 'Shirt' },
  { value: 'other', label: '📦 Другое', icon: 'Package' }
];

export default function Shopping() {
  const navigate = useNavigate();
  const { members } = useFamilyMembers();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'bought'>('active');
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'products' as ShoppingItem['category'],
    quantity: '',
    priority: 'normal' as ShoppingItem['priority']
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const saveItems = (updatedItems: ShoppingItem[]) => {
    setItems(updatedItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;

    const currentMember = members[0] || { id: 'demo', name: 'Пользователь', avatar: '👤' };
    
    const item: ShoppingItem = {
      id: Date.now().toString(),
      name: newItem.name,
      category: newItem.category,
      quantity: newItem.quantity,
      priority: newItem.priority,
      bought: false,
      addedBy: currentMember.id,
      addedByName: currentMember.name,
      addedAt: new Date().toISOString()
    };

    saveItems([...items, item]);
    
    setNewItem({
      name: '',
      category: 'products',
      quantity: '',
      priority: 'normal'
    });
    setIsDialogOpen(false);
  };

  const toggleBought = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, bought: !item.bought } : item
    );
    saveItems(updated);
  };

  const deleteItem = (id: string) => {
    saveItems(items.filter(item => item.id !== id));
  };

  const filteredItems = items.filter(item => {
    if (filterStatus === 'active' && item.bought) return false;
    if (filterStatus === 'bought' && !item.bought) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    return true;
  });

  const activeCount = items.filter(i => !i.bought).length;
  const boughtCount = items.filter(i => i.bought).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate('/')} variant="outline">
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-white">
              <Icon name="ShoppingCart" size={14} className="mr-1" />
              Активных: {activeCount}
            </Badge>
            <Badge variant="outline" className="bg-green-100">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              Куплено: {boughtCount}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Icon name="ShoppingCart" size={28} />
                Список покупок
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить товар
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить товар в список</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Название</label>
                      <Input
                        placeholder="Молоко, хлеб..."
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Категория</label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value: ShoppingItem['category']) =>
                          setNewItem({ ...newItem, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Количество (опционально)</label>
                      <Input
                        placeholder="2 литра, 1 кг..."
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Приоритет</label>
                      <Select
                        value={newItem.priority}
                        onValueChange={(value: ShoppingItem['priority']) =>
                          setNewItem({ ...newItem, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Обычный</SelectItem>
                          <SelectItem value="urgent">Срочно</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddItem} className="w-full bg-green-600 hover:bg-green-700">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setFilterStatus('all')}
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                Все ({items.length})
              </Button>
              <Button
                onClick={() => setFilterStatus('active')}
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
              >
                Активные ({activeCount})
              </Button>
              <Button
                onClick={() => setFilterStatus('bought')}
                variant={filterStatus === 'bought' ? 'default' : 'outline'}
                size="sm"
              >
                Куплено ({boughtCount})
              </Button>
              <div className="w-px bg-border mx-2" />
              {CATEGORIES.map(cat => (
                <Button
                  key={cat.value}
                  onClick={() => setFilterCategory(filterCategory === cat.value ? 'all' : cat.value)}
                  variant={filterCategory === cat.value ? 'default' : 'outline'}
                  size="sm"
                >
                  {cat.label.split(' ')[0]}
                </Button>
              ))}
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="ShoppingCart" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Список покупок пуст</p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить первый товар
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map(item => {
                  const category = CATEGORIES.find(c => c.value === item.category);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                        item.bought
                          ? 'bg-green-50 border-green-200 opacity-70'
                          : 'bg-white hover:shadow-md'
                      }`}
                    >
                      <Button
                        onClick={() => toggleBought(item.id)}
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto"
                      >
                        {item.bought ? (
                          <Icon name="CheckCircle2" size={24} className="text-green-600" />
                        ) : (
                          <Icon name="Circle" size={24} className="text-gray-400" />
                        )}
                      </Button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-medium ${item.bought ? 'line-through text-gray-500' : ''}`}>
                            {item.name}
                          </h4>
                          {item.quantity && (
                            <Badge variant="secondary" className="text-xs">
                              {item.quantity}
                            </Badge>
                          )}
                          {item.priority === 'urgent' && !item.bought && (
                            <Badge variant="destructive" className="text-xs">
                              <Icon name="AlertCircle" size={12} className="mr-1" />
                              Срочно
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {category?.label.split(' ')[0]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Добавил: {item.addedByName} • {new Date(item.addedAt).toLocaleString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <Button
                        onClick={() => deleteItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Icon name="Trash2" size={18} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
