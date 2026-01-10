import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useShopping } from '@/hooks/useShopping';

const CATEGORIES = [
  { value: 'Продукты', label: '🥛 Продукты', icon: 'ShoppingBasket' },
  { value: 'Хозтовары', label: '🧴 Хозтовары', icon: 'Home' },
  { value: 'Одежда', label: '👕 Одежда', icon: 'Shirt' },
  { value: 'Другое', label: '📦 Другое', icon: 'Package' }
];

export default function Shopping() {
  const navigate = useNavigate();
  const { items, loading, createItem, toggleBought, deleteItem, clearBought } = useShopping();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'bought'>('active');
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Продукты',
    quantity: '',
    priority: 'normal' as 'urgent' | 'normal' | 'low'
  });

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;

    await createItem({
      name: newItem.name,
      category: newItem.category,
      quantity: newItem.quantity,
      priority: newItem.priority
    });
    
    setNewItem({
      name: '',
      category: 'Продукты',
      quantity: '',
      priority: 'normal'
    });
    setIsDialogOpen(false);
  };

  const handleToggleBought = (id: string, bought: boolean) => {
    toggleBought(id, !bought);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Удалить эту покупку?')) {
      deleteItem(id);
    }
  };

  const handleClearBought = () => {
    if (window.confirm('Удалить все купленные товары?')) {
      clearBought();
    }
  };

  const filteredItems = items.filter(item => {
    if (filterStatus === 'active' && item.bought) return false;
    if (filterStatus === 'bought' && !item.bought) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    return true;
  });

  const activeCount = items.filter(i => !i.bought).length;
  const boughtCount = items.filter(i => i.bought).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Загрузка списка покупок...</p>
        </div>
      </div>
    );
  }

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
            {boughtCount > 0 && (
              <Button
                onClick={handleClearBought}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Icon name="Trash2" size={14} className="mr-1" />
                Очистить купленные
              </Button>
            )}
          </div>
        </div>

        {/* Инструкция */}
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
          <Alert className="bg-gradient-to-r from-teal-50 to-teal-100 border-2 border-teal-300 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-3">
              <div className="bg-teal-500 rounded-full p-2 shadow-md">
                <Icon name="Info" className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-teal-900 text-lg">
                      Как вести список покупок
                    </h3>
                    <span className="text-xs bg-teal-200 text-teal-800 px-2 py-1 rounded-full font-medium">Инструкция</span>
                  </div>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-6 w-6 text-teal-600 transition-transform group-hover:scale-110" 
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-teal-800">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">🛒 Для чего нужен список покупок?</p>
                        <p className="text-sm">
                          Список покупок помогает не забыть нужные товары в магазине и экономит время. 
                          Все члены семьи могут добавлять товары, а кто идёт за покупками — видит полный список.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">✨ Возможности раздела</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>Категории товаров:</strong> Продукты, хозтовары, одежда, другое</li>
                          <li><strong>Приоритеты:</strong> Отмечайте срочные покупки (ургентно, обычно, несрочно)</li>
                          <li><strong>Количество:</strong> Указывайте количество (например, "2 литра", "5 штук")</li>
                          <li><strong>Отметка купленных:</strong> Отмечайте товары галочкой в магазине</li>
                          <li><strong>Фильтры:</strong> Просматривайте только активные или купленные товары</li>
                          <li><strong>Совместный доступ:</strong> Вся семья видит и редактирует список</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📝 Как добавить товар?</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>Нажмите кнопку <strong>"Добавить товар"</strong></li>
                          <li>Введите название товара (например, "Молоко")</li>
                          <li>Выберите категорию (продукты, хозтовары и т.д.)</li>
                          <li>Укажите количество (опционально)</li>
                          <li>Выберите приоритет (срочно, обычно, несрочно)</li>
                          <li>Нажмите "Добавить" — товар появится в списке</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🛋️ В магазине</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Откройте список на телефоне</li>
                          <li>Нажимайте на товар чтобы отметить как купленный</li>
                          <li>Купленные товары автоматически переходят в низ списка</li>
                          <li>После покупок можно очистить список от купленных</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🎯 Полезные советы</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>Группируйте по категориям:</strong> Так удобнее ходить по магазину (сначала продукты, потом хозтовары)</li>
                          <li><strong>Используйте приоритеты:</strong> Срочные товары отмечены красным — купите их в первую очередь</li>
                          <li><strong>Добавляйте сразу:</strong> Закончилось что-то дома — сразу добавьте в список</li>
                          <li><strong>Связь с меню:</strong> Смотрите недельное меню в "Питании" и добавляйте нужные продукты</li>
                          <li><strong>Делегируйте:</strong> Отправьте кого-то за покупками — он увидит актуальный список</li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-teal-200">
                        <p className="text-sm italic">
                          💡 <strong>Совет:</strong> Привыкните добавлять товары сразу, как только заметили что они закончились. 
                          Это займёт 5 секунд, но сэкономит часы потом!
                        </p>
                      </div>

                      <div className="pt-2 border-t border-teal-200">
                        <Button
                          variant="link"
                          onClick={() => navigate('/instructions')}
                          className="text-teal-600 hover:underline p-0 h-auto text-sm"
                        >
                          📖 <strong>Подробнее:</strong> Полная инструкция
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

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
                        onValueChange={(value: string) =>
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
                        onValueChange={(value: 'urgent' | 'normal' | 'low') =>
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
                        onClick={() => handleToggleBought(item.id, item.bought)}
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
                          Добавил: {item.added_by_name} • {new Date(item.created_at).toLocaleString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleDeleteItem(item.id)}
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