import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { FinanceRecurringInstructions } from '@/components/finance/FinanceInstructions';

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

interface RecurringItem {
  id: string;
  amount: number;
  type: string;
  description: string;
  frequency: string;
  day_of_month: number | null;
  next_date: string | null;
  is_active: boolean;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  account_name: string | null;
  active_months: number[] | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}

function getHeaders() {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': localStorage.getItem('authToken') || '' };
}

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const FREQ_LABELS: Record<string, string> = {
  monthly: 'Ежемесячно',
  weekly: 'Еженедельно',
  quarterly: 'Ежеквартально',
  yearly: 'Ежегодно',
};

const MONTH_NAMES = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
];

const MONTH_FULL_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const DAY_OF_WEEK_LABELS: Record<number, string> = {
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
  6: 'Суббота',
  7: 'Воскресенье',
};

const DAY_OF_WEEK_SHORT: Record<number, string> = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  7: 'Вс',
};

const PRESETS = [
  { label: 'Зарплата', type: 'income', icon: 'Banknote', desc: 'Зарплата' },
  { label: 'Премия кварт.', type: 'income', icon: 'Award', desc: 'Квартальная премия', freq: 'quarterly' },
  { label: 'Премия год.', type: 'income', icon: 'Trophy', desc: 'Годовая премия', freq: 'yearly' },
  { label: 'ЖКХ', type: 'expense', icon: 'Home', desc: 'Коммунальные платежи' },
  { label: 'Аренда', type: 'expense', icon: 'Key', desc: 'Аренда жилья' },
  { label: 'Интернет', type: 'expense', icon: 'Wifi', desc: 'Интернет и ТВ' },
  { label: 'Телефон', type: 'expense', icon: 'Smartphone', desc: 'Мобильная связь' },
  { label: 'Подписки', type: 'expense', icon: 'Repeat', desc: 'Подписки (сервисы)' },
  { label: 'Кредит', type: 'expense', icon: 'CreditCard', desc: 'Платёж по кредиту' },
  { label: 'Садик/школа', type: 'expense', icon: 'GraduationCap', desc: 'Детский сад / школа' },
  { label: 'Страховка', type: 'expense', icon: 'Shield', desc: 'Страхование' },
  { label: 'Транспорт', type: 'expense', icon: 'Car', desc: 'Проездной / бензин' },
];

interface FormState {
  type: 'income' | 'expense';
  amount: string;
  description: string;
  frequency: string;
  day_of_month: string;
  next_date: string;
  category_id: string;
  active_months: number[];
}

const emptyForm: FormState = {
  type: 'expense',
  amount: '',
  description: '',
  frequency: 'monthly',
  day_of_month: '',
  next_date: '',
  category_id: '',
  active_months: [],
};

/** Считает среднемесячную сумму с учётом active_months */
function monthlyAmount(item: RecurringItem): number {
  if (item.frequency === 'monthly') {
    return item.amount;
  }
  if (item.frequency === 'weekly') {
    return item.amount * 4.33;
  }
  if (item.active_months && item.active_months.length > 0) {
    return (item.amount * item.active_months.length) / 12;
  }
  if (item.frequency === 'quarterly') return item.amount / 3;
  if (item.frequency === 'yearly') return item.amount / 12;
  return item.amount;
}

function monthlyExplanation(item: RecurringItem): string | null {
  if (item.frequency === 'monthly') return null;
  if (item.frequency === 'weekly') return `${formatMoney(item.amount)} x 4.33 нед`;
  if (item.active_months && item.active_months.length > 0) {
    return `${formatMoney(item.amount)} x ${item.active_months.length} мес / 12`;
  }
  if (item.frequency === 'quarterly') return `${formatMoney(item.amount)} / 3`;
  if (item.frequency === 'yearly') return `${formatMoney(item.amount)} / 12`;
  return null;
}

function MonthPicker({ selected, onChange }: { selected: number[]; onChange: (months: number[]) => void }) {
  const toggle = (month: number) => {
    if (selected.includes(month)) {
      onChange(selected.filter(m => m !== month));
    } else {
      onChange([...selected, month].sort((a, b) => a - b));
    }
  };

  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">Месяцы начисления</label>
      <div className="grid grid-cols-6 gap-1">
        {MONTH_NAMES.map((name, i) => {
          const monthNum = i + 1;
          const isSelected = selected.includes(monthNum);
          return (
            <button
              key={monthNum}
              type="button"
              onClick={() => toggle(monthNum)}
              className={`text-xs py-1.5 px-1 rounded-md border transition-all font-medium ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Выбрано: {selected.map(m => MONTH_FULL_NAMES[m - 1]).join(', ')}
        </p>
      )}
    </div>
  );
}

export default function FinanceRecurring() {
  const navigate = useNavigate();
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({ ...emptyForm });

  const loadData = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch(`${API}?section=recurring`, { headers: getHeaders() }),
      fetch(`${API}?section=categories`, { headers: getHeaders() }),
    ]);
    if (r1.ok) { const d = await r1.json(); setItems(d.recurring || []); }
    if (r2.ok) { const d = await r2.json(); setCategories(d.categories || []); }
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const isOwner = useIsFamilyOwner();

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24">
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={32} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold mb-2">Доступ ограничен</h2>
          <p className="text-sm text-muted-foreground mb-4">Этот раздел доступен только владельцу семьи</p>
          <Button onClick={() => navigate('/finance')}>Вернуться к финансам</Button>
        </div>
      </div>
    );
  }

  const openAdd = () => {
    setEditingItem(null);
    setForm({ ...emptyForm });
    setShowDialog(true);
  };

  const openEdit = (item: RecurringItem) => {
    setEditingItem(item);
    setForm({
      type: (item.type as 'income' | 'expense') || 'expense',
      amount: String(item.amount),
      description: item.description || '',
      frequency: item.frequency || 'monthly',
      day_of_month: item.day_of_month ? String(item.day_of_month) : '',
      next_date: item.next_date || '',
      category_id: item.category_id || '',
      active_months: item.active_months || [],
    });
    setShowDialog(true);
  };

  const saveItem = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0 || !form.description.trim()) {
      toast.error('Укажите сумму и описание');
      return;
    }
    setSaving(true);

    const payload: Record<string, unknown> = {
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description,
      frequency: form.frequency,
      day_of_month: form.day_of_month ? parseInt(form.day_of_month) : null,
      next_date: form.next_date || new Date().toISOString().split('T')[0],
      category_id: form.category_id || null,
      active_months: (form.frequency === 'quarterly' || form.frequency === 'yearly') && form.active_months.length > 0
        ? form.active_months
        : null,
    };

    if (editingItem) {
      payload.action = 'update_recurring';
      payload.id = editingItem.id;
    } else {
      payload.action = 'add_recurring';
    }

    const res = await fetch(API, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      toast.success(editingItem ? 'Сохранено' : 'Добавлено');
      setShowDialog(false);
      setEditingItem(null);
      setForm({ ...emptyForm });
      loadData();
    } else {
      toast.error('Ошибка сохранения');
    }
  };

  const toggleActive = async (item: RecurringItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'update_recurring', id: item.id, is_active: !item.is_active })
    });
    loadData();
  };

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'delete_recurring', id })
    });
    toast.success('Удалено');
    loadData();
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setForm({
      ...form,
      type: preset.type as 'income' | 'expense',
      description: preset.desc,
      frequency: (preset as { freq?: string }).freq || 'monthly',
      active_months: [],
    });
  };

  const activeItems = items.filter(i => i.is_active);
  const inactiveItems = items.filter(i => !i.is_active);
  const incomeItems = activeItems.filter(i => i.type === 'income');
  const expenseItems = activeItems.filter(i => i.type === 'expense');
  const totalIncome = incomeItems.reduce((s, i) => s + monthlyAmount(i), 0);
  const totalExpense = expenseItems.reduce((s, i) => s + monthlyAmount(i), 0);
  const filteredCategories = categories.filter(c => c.type === form.type);

  const showMonthPicker = form.frequency === 'quarterly' || form.frequency === 'yearly';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const renderMonthBadges = (item: RecurringItem) => {
    if (!item.active_months || item.active_months.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-0.5 mt-0.5">
        {item.active_months.map(m => (
          <Badge key={m} variant="outline" className="text-[10px] px-1 py-0 h-4 font-normal text-muted-foreground border-gray-200">
            {MONTH_NAMES[m - 1]}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <SectionHero
          title="Регулярные платежи"
          subtitle="Подписки, коммуналка и автоплатежи"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/cf1049c8-3a33-48d3-9b33-e69aa6cdfcb6.jpg"
          backPath="/finance/budget"
          rightAction={
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openAdd}>
              <Icon name="Plus" size={16} className="mr-1" /> Добавить
            </Button>
          }
        />

        <FinanceRecurringInstructions />

        {activeItems.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-green-600">Доходы/мес</p>
                <Popover>
                  <PopoverTrigger className="cursor-pointer group">
                    <div className="flex items-center gap-1 justify-center">
                      <p className="text-lg font-bold text-green-700 underline decoration-dashed decoration-green-300/50 underline-offset-4">+{formatMoney(Math.round(totalIncome))} ₽</p>
                      <Icon name="Info" size={12} className="text-green-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3" side="bottom">
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Доходы в месяц</p>
                      <p className="text-xs text-muted-foreground">Сумма всех активных регулярных доходов, приведённых к месячному эквиваленту.</p>
                      {incomeItems.length > 0 ? (
                        <>
                          <div className="border-t pt-2 space-y-1.5 max-h-48 overflow-y-auto">
                            {incomeItems.map(item => {
                              const explanation = monthlyExplanation(item);
                              return (
                                <div key={item.id} className="flex justify-between text-xs gap-2">
                                  <div className="min-w-0">
                                    <span className="font-medium truncate block">{item.description || 'Без описания'}</span>
                                    <span className="text-muted-foreground">{FREQ_LABELS[item.frequency] || item.frequency}</span>
                                    {explanation && (
                                      <span className="text-muted-foreground"> ({explanation})</span>
                                    )}
                                  </div>
                                  <span className="font-medium whitespace-nowrap text-green-600">+{formatMoney(Math.round(monthlyAmount(item)))} ₽</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="border-t pt-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span>Итого в месяц</span>
                              <span className="text-green-600">+{formatMoney(Math.round(totalIncome))} ₽</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground border-t pt-2">Нет активных регулярных доходов</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-red-600">Расходы/мес</p>
                <Popover>
                  <PopoverTrigger className="cursor-pointer group">
                    <div className="flex items-center gap-1 justify-center">
                      <p className="text-lg font-bold text-red-700 underline decoration-dashed decoration-red-300/50 underline-offset-4">-{formatMoney(Math.round(totalExpense))} ₽</p>
                      <Icon name="Info" size={12} className="text-red-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3" side="bottom">
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Расходы в месяц</p>
                      <p className="text-xs text-muted-foreground">Сумма всех активных регулярных расходов, приведённых к месячному эквиваленту.</p>
                      {expenseItems.length > 0 ? (
                        <>
                          <div className="border-t pt-2 space-y-1.5 max-h-48 overflow-y-auto">
                            {expenseItems.map(item => {
                              const explanation = monthlyExplanation(item);
                              return (
                                <div key={item.id} className="flex justify-between text-xs gap-2">
                                  <div className="min-w-0">
                                    <span className="font-medium truncate block">{item.description || 'Без описания'}</span>
                                    <span className="text-muted-foreground">{FREQ_LABELS[item.frequency] || item.frequency}</span>
                                    {explanation && (
                                      <span className="text-muted-foreground"> ({explanation})</span>
                                    )}
                                  </div>
                                  <span className="font-medium whitespace-nowrap text-red-600">-{formatMoney(Math.round(monthlyAmount(item)))} ₽</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="border-t pt-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span>Итого в месяц</span>
                              <span className="text-red-600">-{formatMoney(Math.round(totalExpense))} ₽</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground border-t pt-2">Нет активных регулярных расходов</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Repeat" size={48} className="mx-auto mb-3 text-emerald-300" />
            <p className="font-medium text-foreground">Нет регулярных платежей</p>
            <p className="text-sm mt-1">Добавьте зарплату, коммуналку, подписки и кредиты</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeItems.map(item => (
              <Card key={item.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openEdit(item)}>
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (item.category_color || (item.type === 'income' ? '#22C55E' : '#EF4444')) + '20' }}>
                      <Icon name={item.category_icon || (item.type === 'income' ? 'TrendingUp' : 'TrendingDown')}
                        size={20} style={{ color: item.category_color || (item.type === 'income' ? '#22C55E' : '#EF4444') }} />
                    </div>
                    <div className="flex-1 px-3 py-2 min-w-0">
                      <span className="text-sm font-medium truncate block">{item.description || 'Без описания'}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{FREQ_LABELS[item.frequency] || item.frequency}</span>
                        {item.day_of_month && (
                          item.frequency === 'weekly' 
                            ? <span>· {DAY_OF_WEEK_SHORT[item.day_of_month] || item.day_of_month}</span>
                            : <span>· {item.day_of_month}-е число</span>
                        )}
                        {item.category_name && <span>· {item.category_name}</span>}
                      </div>
                      {renderMonthBadges(item)}
                    </div>
                    <div className="pr-1 text-right flex-shrink-0">
                      <p className={`font-bold text-sm ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.type === 'income' ? '+' : '-'}{formatMoney(item.amount)} ₽
                      </p>
                      {(item.frequency === 'weekly' || item.frequency === 'quarterly' || item.frequency === 'yearly') && (
                        <p className="text-[10px] text-muted-foreground">
                          ~{formatMoney(Math.round(monthlyAmount(item)))} ₽/мес
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col pr-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-blue-500"
                        onClick={(e) => { e.stopPropagation(); openEdit(item); }}>
                        <Icon name="Pencil" size={12} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-amber-500"
                        onClick={(e) => toggleActive(item, e)}>
                        <Icon name="Pause" size={12} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                        onClick={(e) => deleteItem(item.id, e)}>
                        <Icon name="Trash2" size={12} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {inactiveItems.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide pt-2">Приостановлены</p>
                {inactiveItems.map(item => (
                  <Card key={item.id} className="opacity-50 cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={() => openEdit(item)}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <span className="text-sm flex-1 truncate">{item.description}</span>
                      <span className="text-sm text-muted-foreground">{formatMoney(item.amount)} ₽</span>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => toggleActive(item, e)}>
                        <Icon name="Play" size={12} />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) { setEditingItem(null); setForm({ ...emptyForm }); }
      }}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Редактировать платёж' : 'Регулярный платёж'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {!editingItem && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Быстрый выбор</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRESETS.map(p => (
                    <button key={p.label} onClick={() => applyPreset(p)}
                      className={`text-xs p-2 rounded-lg border transition-all text-center ${
                        form.description === p.desc ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                      <Icon name={p.icon} size={16} className={`mx-auto mb-0.5 ${p.type === 'income' ? 'text-green-600' : 'text-red-500'}`} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant={form.type === 'expense' ? 'default' : 'outline'}
                className={`flex-1 ${form.type === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={() => setForm({ ...form, type: 'expense', category_id: '' })}>
                Расход
              </Button>
              <Button variant={form.type === 'income' ? 'default' : 'outline'}
                className={`flex-1 ${form.type === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => setForm({ ...form, type: 'income', category_id: '' })}>
                Доход
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Описание</label>
              <Input placeholder="Зарплата / ЖКХ / Кредит..." value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Сумма, ₽</label>
                <Input type="number" inputMode="decimal" placeholder="50000" value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Частота</label>
                <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v, active_months: [], day_of_month: '' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(FREQ_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showMonthPicker && (
              <MonthPicker
                selected={form.active_months}
                onChange={months => setForm({ ...form, active_months: months })}
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                {form.frequency === 'weekly' ? (
                  <>
                    <label className="text-sm font-medium mb-1 block">День недели</label>
                    <Select value={form.day_of_month || ''} onValueChange={v => setForm({ ...form, day_of_month: v })}>
                      <SelectTrigger><SelectValue placeholder="Выбрать" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(DAY_OF_WEEK_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <label className="text-sm font-medium mb-1 block">Число месяца</label>
                    <Input type="number" min={1} max={31} placeholder="10" value={form.day_of_month}
                      onChange={e => setForm({ ...form, day_of_month: e.target.value })} />
                  </>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Категория</label>
                <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Выбрать" /></SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showMonthPicker && form.active_months.length > 0 && form.amount && (
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700">
                  <Icon name="Info" size={12} className="inline mr-1" />
                  {form.active_months.length}x в год по {formatMoney(parseFloat(form.amount))} ₽
                  = ~{formatMoney(Math.round((parseFloat(form.amount) * form.active_months.length) / 12))} ₽/мес в среднем
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={saveItem} disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 w-full">
              {saving ? 'Сохраняю...' : (editingItem ? 'Сохранить' : 'Добавить')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}