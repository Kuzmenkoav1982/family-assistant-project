import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

interface LoyaltyCard {
  id: string;
  name: string;
  store_name: string;
  card_number: string;
  barcode_data: string;
  barcode_type: string;
  category: string;
  discount_percent: number | null;
  cashback_percent: number | null;
  points_balance: number;
  member_id: string | null;
  member_name: string | null;
  icon: string;
  color: string;
  notes: string;
  is_active: boolean;
}

function getHeaders() {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': localStorage.getItem('authToken') || '' };
}

const CATEGORIES = [
  { value: 'grocery', label: 'Продукты', icon: 'ShoppingCart', color: '#22C55E' },
  { value: 'pharmacy', label: 'Аптека', icon: 'Pill', color: '#EF4444' },
  { value: 'clothes', label: 'Одежда', icon: 'Shirt', color: '#8B5CF6' },
  { value: 'electronics', label: 'Электроника', icon: 'Smartphone', color: '#3B82F6' },
  { value: 'gas', label: 'АЗС', icon: 'Fuel', color: '#F59E0B' },
  { value: 'beauty', label: 'Красота', icon: 'Sparkles', color: '#EC4899' },
  { value: 'kids', label: 'Детские товары', icon: 'Baby', color: '#14B8A6' },
  { value: 'sport', label: 'Спорт', icon: 'Dumbbell', color: '#6366F1' },
  { value: 'restaurant', label: 'Рестораны', icon: 'UtensilsCrossed', color: '#F97316' },
  { value: 'travel', label: 'Путешествия', icon: 'Plane', color: '#06B6D4' },
  { value: 'marketplace', label: 'Маркетплейсы', icon: 'Package', color: '#A855F7' },
  { value: 'other', label: 'Другое', icon: 'Tag', color: '#64748B' },
];

const STORE_PRESETS = [
  { name: 'Пятёрочка', category: 'grocery', color: '#E11D48' },
  { name: 'Магнит', category: 'grocery', color: '#DC2626' },
  { name: 'Лента', category: 'grocery', color: '#2563EB' },
  { name: 'Перекрёсток', category: 'grocery', color: '#16A34A' },
  { name: 'Ozon', category: 'marketplace', color: '#2563EB' },
  { name: 'Wildberries', category: 'marketplace', color: '#7C3AED' },
  { name: 'Яндекс Маркет', category: 'marketplace', color: '#EAB308' },
  { name: 'DNS', category: 'electronics', color: '#F97316' },
  { name: 'М.Видео', category: 'electronics', color: '#EF4444' },
  { name: 'Спортмастер', category: 'sport', color: '#2563EB' },
  { name: 'Детский мир', category: 'kids', color: '#22C55E' },
  { name: 'Лукойл', category: 'gas', color: '#DC2626' },
  { name: 'Газпром', category: 'gas', color: '#2563EB' },
  { name: 'Аптека.ру', category: 'pharmacy', color: '#16A34A' },
  { name: 'Золотое яблоко', category: 'beauty', color: '#000000' },
  { name: 'Ikea', category: 'other', color: '#2563EB' },
];

function getCatMeta(cat: string) {
  return CATEGORIES.find(c => c.value === cat) || CATEGORIES[11];
}

export default function FinanceLoyalty() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<LoyaltyCard | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', store_name: '', card_number: '', barcode_data: '',
    category: 'other', discount_percent: '', cashback_percent: '',
    points_balance: '', icon: 'CreditCard', color: '#8B5CF6', notes: ''
  });

  const loadCards = useCallback(async () => {
    const res = await fetch(`${API}?section=loyalty_cards`, { headers: getHeaders() });
    if (res.ok) { const d = await res.json(); setCards(d.cards || []); }
  }, []);

  useEffect(() => { loadCards().finally(() => setLoading(false)); }, [loadCards]);

  const resetForm = () => {
    setForm({ name: '', store_name: '', card_number: '', barcode_data: '', category: 'other',
      discount_percent: '', cashback_percent: '', points_balance: '', icon: 'CreditCard', color: '#8B5CF6', notes: '' });
  };

  const applyPreset = (preset: typeof STORE_PRESETS[0]) => {
    const cat = getCatMeta(preset.category);
    setForm({ ...form, name: `Карта ${preset.name}`, store_name: preset.name,
      category: preset.category, color: preset.color, icon: cat.icon });
  };

  const addCard = async () => {
    if (!form.name.trim()) { toast.error('Укажите название'); return; }
    setSaving(true);
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        action: 'add_loyalty_card', ...form,
        discount_percent: form.discount_percent ? parseFloat(form.discount_percent) : null,
        cashback_percent: form.cashback_percent ? parseFloat(form.cashback_percent) : null,
        points_balance: form.points_balance ? parseFloat(form.points_balance) : 0,
      })
    });
    setSaving(false);
    if (res.ok) { toast.success('Карта добавлена'); setShowAdd(false); resetForm(); loadCards(); }
    else { toast.error('Ошибка'); }
  };

  const deleteCard = async (id: string) => {
    await fetch(API, { method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'delete_loyalty_card', id }) });
    toast.success('Удалено'); setShowDetail(null); loadCards();
  };

  const activeCards = cards.filter(c => c.is_active);
  const usedCategories = [...new Set(activeCards.map(c => c.category))];
  const filteredCards = filter === 'all' ? activeCards : activeCards.filter(c => c.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (showDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pb-24">
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setShowDetail(null)}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <h1 className="text-lg font-bold flex-1 truncate">{showDetail.name}</h1>
            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteCard(showDetail.id)}>
              <Icon name="Trash2" size={16} />
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="h-32 flex items-center justify-center" style={{ backgroundColor: showDetail.color }}>
              <div className="text-center text-white">
                <Icon name={showDetail.icon || 'CreditCard'} size={40} className="mx-auto mb-2 drop-shadow" />
                <p className="font-bold text-lg">{showDetail.store_name || showDetail.name}</p>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              {showDetail.card_number && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Номер карты</p>
                  <p className="text-2xl font-mono font-bold tracking-wider mt-1">{showDetail.card_number}</p>
                </div>
              )}

              {showDetail.barcode_data && (
                <div className="text-center bg-white p-4 rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-xs text-muted-foreground mb-1">Штрихкод</p>
                  <p className="text-lg font-mono tracking-widest">{showDetail.barcode_data}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Покажите на кассе</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 text-center">
                {showDetail.discount_percent != null && (
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-green-600">Скидка</p>
                    <p className="font-bold text-green-700">{showDetail.discount_percent}%</p>
                  </div>
                )}
                {showDetail.cashback_percent != null && (
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-blue-600">Кэшбэк</p>
                    <p className="font-bold text-blue-700">{showDetail.cashback_percent}%</p>
                  </div>
                )}
                {showDetail.points_balance > 0 && (
                  <div className="bg-amber-50 rounded-lg p-2">
                    <p className="text-xs text-amber-600">Баллы</p>
                    <p className="font-bold text-amber-700">{showDetail.points_balance}</p>
                  </div>
                )}
              </div>

              {showDetail.member_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="User" size={14} /> {showDetail.member_name}
                </div>
              )}
              {showDetail.notes && (
                <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-3">{showDetail.notes}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <SectionHero
          title="Скидочные карты"
          subtitle="Карты лояльности магазинов и сервисов"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/0a4f80d7-d7e6-435f-809d-f93e457230b2.jpg"
          backPath="/finance"
          rightAction={
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={() => { resetForm(); setShowAdd(true); }}>
              <Icon name="Plus" size={16} className="mr-1" /> Добавить
            </Button>
          }
        />

        {usedCategories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm"
              className={filter === 'all' ? 'bg-violet-600 hover:bg-violet-700' : ''}
              onClick={() => setFilter('all')}>Все ({activeCards.length})</Button>
            {usedCategories.map(cat => {
              const meta = getCatMeta(cat);
              const count = activeCards.filter(c => c.category === cat).length;
              return (
                <Button key={cat} variant={filter === cat ? 'default' : 'outline'} size="sm"
                  className={`whitespace-nowrap ${filter === cat ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                  onClick={() => setFilter(cat)}>
                  {meta.label} ({count})
                </Button>
              );
            })}
          </div>
        )}

        {cards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="CreditCard" size={48} className="mx-auto mb-3 text-violet-300" />
            <p className="font-medium text-foreground">Нет скидочных карт</p>
            <p className="text-sm mt-1">Добавьте карты лояльности магазинов, аптек, АЗС</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredCards.map(card => {
              const meta = getCatMeta(card.category);
              return (
                <Card key={card.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setShowDetail(card)}>
                  <div className="h-2" style={{ backgroundColor: card.color }} />
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: card.color + '20' }}>
                        <Icon name={card.icon || meta.icon} size={20} style={{ color: card.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{card.store_name || card.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                          {card.discount_percent != null && <span className="text-green-600">−{card.discount_percent}%</span>}
                          {card.cashback_percent != null && <span className="text-blue-600">{card.cashback_percent}% кэшбэк</span>}
                        </div>
                      </div>
                      {card.card_number && (
                        <p className="text-xs font-mono text-muted-foreground">•••{card.card_number.slice(-4)}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Новая карта</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Быстрый выбор магазина</label>
              <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto">
                {STORE_PRESETS.map(p => (
                  <button key={p.name} onClick={() => applyPreset(p)}
                    className={`text-[10px] p-1.5 rounded-lg border transition-all text-center ${
                      form.store_name === p.name ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Название карты</label>
              <Input placeholder="Карта Пятёрочки" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Магазин</label>
              <Input placeholder="Пятёрочка" value={form.store_name}
                onChange={e => setForm({ ...form, store_name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Категория</label>
              <Select value={form.category} onValueChange={v => {
                const m = getCatMeta(v);
                setForm({ ...form, category: v, icon: m.icon });
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <Icon name={c.icon} size={14} style={{ color: c.color }} /> {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Номер карты</label>
              <Input placeholder="4627 0000 1234 5678" value={form.card_number}
                onChange={e => setForm({ ...form, card_number: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Штрихкод / QR данные</label>
              <Input placeholder="Номер штрихкода для показа на кассе" value={form.barcode_data}
                onChange={e => setForm({ ...form, barcode_data: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Скидка %</label>
                <Input type="number" inputMode="decimal" placeholder="5" value={form.discount_percent}
                  onChange={e => setForm({ ...form, discount_percent: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Кэшбэк %</label>
                <Input type="number" inputMode="decimal" placeholder="2" value={form.cashback_percent}
                  onChange={e => setForm({ ...form, cashback_percent: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Баллы</label>
                <Input type="number" inputMode="decimal" placeholder="0" value={form.points_balance}
                  onChange={e => setForm({ ...form, points_balance: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Заметка</label>
              <Input placeholder="Необязательно" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addCard} disabled={saving} className="bg-violet-600 hover:bg-violet-700 w-full">
              {saving ? 'Сохраняю...' : 'Добавить карту'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}