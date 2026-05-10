import { useState } from 'react';
import SEOHead from "@/components/SEOHead";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SectionHero from '@/components/ui/section-hero';
import { useShopping } from '@/hooks/useShopping';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'Продукты', label: '🥛 Продукты', icon: 'ShoppingBasket', gradient: 'from-green-500 to-emerald-600' },
  { value: 'Хозтовары', label: '🧴 Хозтовары', icon: 'Home', gradient: 'from-blue-500 to-sky-600' },
  { value: 'Одежда', label: '👕 Одежда', icon: 'Shirt', gradient: 'from-pink-500 to-rose-600' },
  { value: 'Другое', label: '📦 Другое', icon: 'Package', gradient: 'from-gray-500 to-slate-600' }
];

export default function Shopping() {
  const navigate = useNavigate();
  const { items, loading, createItem, toggleBought, deleteItem, clearBought } = useShopping();
  const { notifyUrgentShopping } = useNotifications();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'bought'>('active');
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Продукты',
    quantity: '',
    price: '',
    priority: 'normal' as 'urgent' | 'normal' | 'low'
  });

  // Диалог цены при отметке «куплено»
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [pricePromptItemId, setPricePromptItemId] = useState<string | null>(null);
  const [pricePromptName, setPricePromptName] = useState('');
  const [pricePromptValue, setPricePromptValue] = useState('');

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;
    const priceNum = newItem.price ? parseFloat(newItem.price) : null;
    await createItem({
      name: newItem.name,
      category: newItem.category,
      quantity: newItem.quantity,
      priority: newItem.priority,
      ...(priceNum != null && !Number.isNaN(priceNum) ? { price: priceNum } : {})
    });
    if (newItem.priority === 'urgent') {
      notifyUrgentShopping(newItem.name);
    }
    setNewItem({ name: '', category: 'Продукты', quantity: '', price: '', priority: 'normal' });
    setIsDialogOpen(false);
  };

  const handleToggleBought = (id: string, bought: boolean) => {
    const next = !bought;
    if (next) {
      // Помечаем «куплено» — спрашиваем цену чтобы создать расход в Финансах
      const item = items.find(i => i.id === id);
      if (!item) return;
      setPricePromptItemId(id);
      setPricePromptName(item.name);
      setPricePromptValue(item.price ? String(item.price) : '');
      setPriceDialogOpen(true);
    } else {
      // Снятие отметки «куплено» — связанный расход удалится автоматически
      toggleBought(id, false).then(updated => {
        if (updated && !updated.linked_transaction_id) {
          // ok
        }
      });
    }
  };

  const confirmPriceAndMarkBought = async (skipPrice: boolean) => {
    if (!pricePromptItemId) return;
    const priceNum = skipPrice
      ? null
      : pricePromptValue
        ? parseFloat(pricePromptValue)
        : null;
    const validPrice = priceNum != null && !Number.isNaN(priceNum) && priceNum > 0 ? priceNum : null;

    setPriceDialogOpen(false);
    const updated = await toggleBought(pricePromptItemId, true, validPrice);
    if (updated?.linked_transaction_id && validPrice) {
      toast.success('Куплено и добавлено в бюджет', {
        description: `Расход ${validPrice.toLocaleString('ru-RU')} ₽ в категории «Продукты»`,
      });
    } else if (updated) {
      toast.success('Отмечено как куплено');
    }
    setPricePromptItemId(null);
    setPricePromptValue('');
    setPricePromptName('');
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Загрузка списка покупок...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <SEOHead title="Список покупок — совместные покупки семьи" description="Общий список покупок для всей семьи. Добавляйте товары, отмечайте купленное, распределяйте по магазинам." path="/shopping" />
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Покупки"
          subtitle={`Активных: ${activeCount} • Куплено: ${boughtCount}`}
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/a0559aa1-893a-44e6-84ca-315aec043fd9.jpg"
          backPath="/household-hub"
          rightAction={
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-white/90 text-green-700 hover:bg-white shadow-lg">
                  <Icon name="Plus" size={16} className="mr-1" />
                  Добавить
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
                      onValueChange={(value: string) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
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
                    <label className="text-sm font-medium mb-2 block">Цена, ₽ (опционально)</label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="Например, 250"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Если укажете — при отметке «куплено» расход автоматически попадёт в бюджет
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Приоритет</label>
                    <Select
                      value={newItem.priority}
                      onValueChange={(value: 'urgent' | 'normal' | 'low') => setNewItem({ ...newItem, priority: value })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
          }
        />

        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
          <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-start gap-3">
              <Icon name="ShoppingCart" className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                  <h3 className="font-semibold text-green-900 text-sm">Как вести список покупок</h3>
                  <Icon name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} className="h-5 w-5 text-green-600 transition-transform group-hover:scale-110" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-green-800">
                    <div className="space-y-2 text-xs">
                      <div className="p-1.5 bg-white/60 rounded border-l-3 border-green-500">
                        <p className="font-medium">1. Добавьте товар</p>
                        <p className="text-[11px] text-green-700">Название, категория, количество, приоритет</p>
                      </div>
                      <div className="p-1.5 bg-white/60 rounded border-l-3 border-green-500">
                        <p className="font-medium">2. В магазине — отмечайте купленное</p>
                        <p className="text-[11px] text-green-700">Нажимайте на кружок слева от товара</p>
                      </div>
                      <div className="p-1.5 bg-white/60 rounded border-l-3 border-green-500">
                        <p className="font-medium">3. Очистите купленные</p>
                        <p className="text-[11px] text-green-700">Купленные товары можно удалить одной кнопкой</p>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => {
            const count = items.filter(i => i.category === cat.value && !i.bought).length;
            return (
              <Card
                key={cat.value}
                className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden ${
                  filterCategory === cat.value ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setFilterCategory(filterCategory === cat.value ? 'all' : cat.value)}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className={`w-14 min-h-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center flex-shrink-0`}>
                      <Icon name={cat.icon} size={22} className="text-white drop-shadow-sm" />
                    </div>
                    <div className="flex-1 p-3">
                      <h3 className="font-bold text-sm">{cat.label.split(' ')[1]}</h3>
                      <p className="text-xs text-muted-foreground">{count} товаров</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          {boughtCount > 0 && (
            <Button onClick={handleClearBought} variant="outline" size="sm" className="text-red-600 hover:text-red-700 ml-auto">
              <Icon name="Trash2" size={14} className="mr-1" />
              Очистить купленные
            </Button>
          )}
        </div>

        <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200/70 p-3 flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <Icon name="Link2" size={14} className="text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-700 leading-tight">
              Связано с разделом «Финансы»
            </p>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
              Если у товара указана цена и вы отметите «куплено» — расход автоматически попадёт в бюджет в категорию «Продукты»
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="ShoppingCart" size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-medium">Список покупок пуст</p>
                <p className="text-sm mt-1">Добавьте первый товар кнопкой вверху</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map(item => {
                  const category = CATEGORIES.find(c => c.value === item.category);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${
                        item.bought ? 'bg-green-50 border-green-200 opacity-70' : 'bg-white hover:shadow-md'
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-medium ${item.bought ? 'line-through text-gray-500' : ''}`}>
                            {item.name}
                          </h4>
                          {item.quantity && (
                            <Badge variant="secondary" className="text-xs">{item.quantity}</Badge>
                          )}
                          {item.price != null && Number(item.price) > 0 && (
                            <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 bg-emerald-50">
                              {Number(item.price).toLocaleString('ru-RU')} ₽
                            </Badge>
                          )}
                          {item.priority === 'urgent' && !item.bought && (
                            <Badge variant="destructive" className="text-xs">
                              <Icon name="AlertCircle" size={12} className="mr-1" />
                              Срочно
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">{category?.label.split(' ')[0]}</Badge>
                          {item.bought && item.linked_transaction_id && (
                            <Badge variant="outline" className="text-[10px] border-emerald-400 text-emerald-700 bg-white inline-flex items-center gap-0.5">
                              <Icon name="Wallet" size={10} />
                              В бюджете
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.added_by_name} • {new Date(item.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeleteItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
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

      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Wallet" size={18} className="text-emerald-600" />
              Сколько стоила покупка?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm text-gray-600">
              <strong>{pricePromptName}</strong>
            </p>
            <p className="text-xs text-gray-500">
              Если укажете цену — расход автоматически попадёт в бюджет в категорию «Продукты».
              Без цены товар просто отметится как купленный.
            </p>
            <Input
              type="number"
              inputMode="decimal"
              autoFocus
              placeholder="Например, 250"
              value={pricePromptValue}
              onChange={(e) => setPricePromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmPriceAndMarkBought(false);
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => confirmPriceAndMarkBought(true)}>
              Без цены
            </Button>
            <Button onClick={() => confirmPriceAndMarkBought(false)} className="bg-emerald-600 hover:bg-emerald-700">
              <Icon name="Check" size={14} className="mr-1" />
              Куплено
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}