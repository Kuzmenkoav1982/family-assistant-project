import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';

interface Expense {
  id: number;
  trip_id: number;
  category: string;
  title: string;
  amount: number;
  currency: string;
  payment_status: string;
  payment_date?: string;
  booking_number?: string;
  provider?: string;
  notes?: string;
  exchange_rate?: number;
  created_at: string;
}

interface TripExpensesProps {
  tripId: number;
  tripCurrency: string;
  tripBudget: number | null;
  onBudgetUpdate: (newBudget: number) => void;
  onExpensesChange?: () => void;
}

const CATEGORIES = [
  { value: 'flights', label: 'Перелеты', icon: 'Plane' },
  { value: 'hotels', label: 'Отели', icon: 'Hotel' },
  { value: 'tours', label: 'Экскурсии', icon: 'Landmark' },
  { value: 'food', label: 'Еда', icon: 'UtensilsCrossed' },
  { value: 'transport', label: 'Транспорт', icon: 'Car' },
  { value: 'other', label: 'Другое', icon: 'Wallet' },
];

const EXCHANGE_RATES: { [key: string]: number } = {
  USD: 95,
  EUR: 105,
  GBP: 120,
  CNY: 13,
  RUB: 1,
};

export function TripExpenses({ tripId, tripCurrency, tripBudget, onBudgetUpdate, onExpensesChange }: TripExpensesProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState((tripBudget || 0).toString());
  const [savedExchangeRates, setSavedExchangeRates] = useState<{ [key: string]: number }>({});

  const [newExpense, setNewExpense] = useState({
    category: 'flights',
    title: '',
    amount: '',
    currency: tripCurrency,
    payment_status: 'paid',
    payment_date: new Date().toISOString().split('T')[0],
    booking_number: '',
    provider: '',
    notes: '',
    exchange_rate: '1',
  });

  useEffect(() => {
    loadExpenses();
  }, [tripId]);

  useEffect(() => {
    const rates: { [key: string]: number } = {};
    expenses.forEach((expense) => {
      if (expense.currency !== tripCurrency && expense.exchange_rate) {
        rates[expense.currency] = expense.exchange_rate;
      }
    });
    setSavedExchangeRates(rates);
  }, [expenses, tripCurrency]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(`${TRIPS_API_URL}/?action=expenses&trip_id=${tripId}`, {
        headers: { 'X-Auth-Token': token || '' },
      });
      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) {
      alert('Заполните название и сумму');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          action: 'add_expense',
          trip_id: tripId,
          category: newExpense.category,
          title: newExpense.title,
          amount: parseFloat(newExpense.amount),
          currency: newExpense.currency,
          payment_status: newExpense.payment_status,
          payment_date: newExpense.payment_date || null,
          booking_number: newExpense.booking_number || null,
          provider: newExpense.provider || null,
          notes: newExpense.notes || null,
          exchange_rate: parseFloat(newExpense.exchange_rate),
        }),
      });

      if (response.ok) {
        await loadExpenses();
        onExpensesChange?.();
        setIsAddDialogOpen(false);
        setNewExpense({
          category: 'flights',
          title: '',
          amount: '',
          currency: tripCurrency,
          payment_status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          booking_number: '',
          provider: '',
          notes: '',
          exchange_rate: '1',
        });
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Ошибка при добавлении расхода');
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense || !editingExpense.title || !editingExpense.amount) {
      alert('Заполните название и сумму');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          action: 'update_expense',
          id: editingExpense.id,
          category: editingExpense.category,
          title: editingExpense.title,
          amount: editingExpense.amount,
          currency: editingExpense.currency,
          payment_status: editingExpense.payment_status,
          payment_date: editingExpense.payment_date || null,
          booking_number: editingExpense.booking_number || null,
          provider: editingExpense.provider || null,
          notes: editingExpense.notes || null,
          exchange_rate: editingExpense.exchange_rate || 1.0,
        }),
      });

      if (response.ok) {
        await loadExpenses();
        onExpensesChange?.();
        setIsEditDialogOpen(false);
        setEditingExpense(null);
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Ошибка при обновлении расхода');
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('Удалить этот расход?')) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          action: 'delete_expense',
          expense_id: expenseId,
        }),
      });

      if (response.ok) {
        await loadExpenses();
        onExpensesChange?.();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Ошибка при удалении расхода');
    }
  };

  const convertToTripCurrency = (amount: number, currency: string, customRate?: number): number => {
    if (currency === tripCurrency) return amount;
    const rate = customRate || EXCHANGE_RATES[currency] || 1;
    const tripRate = EXCHANGE_RATES[tripCurrency] || 1;
    return (amount * rate) / tripRate;
  };

  const totalSpent = expenses.reduce((sum, expense) => {
    return sum + convertToTripCurrency(expense.amount, expense.currency, expense.exchange_rate);
  }, 0);

  const groupedExpenses = CATEGORIES.map((cat) => ({
    ...cat,
    expenses: expenses
      .filter((e) => e.category === cat.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    total: expenses
      .filter((e) => e.category === cat.value)
      .reduce((sum, e) => sum + convertToTripCurrency(e.amount, e.currency, e.exchange_rate), 0),
  })).filter((cat) => cat.expenses.length > 0);

  const toggleCategory = (categoryValue: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryValue)
        ? prev.filter((c) => c !== categoryValue)
        : [...prev, categoryValue]
    );
  };

  const formatBudget = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + currency;
  };

  const handleSaveBudget = async () => {
    const newBudget = parseFloat(budgetInput);
    if (isNaN(newBudget) || newBudget < 0) {
      alert('Введите корректную сумму');
      return;
    }
    onBudgetUpdate(newBudget);
    setIsEditingBudget(false);
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Запланировано</span>
        {!isEditingBudget ? (
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold">{formatBudget(tripBudget, tripCurrency)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setIsEditingBudget(true);
                setBudgetInput(tripBudget.toString());
              }}
            >
              <Icon name="Pencil" size={14} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-32 h-8 text-right"
              autoFocus
            />
            <Button size="icon" className="h-6 w-6" onClick={handleSaveBudget}>
              <Icon name="Check" size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsEditingBudget(false)}
            >
              <Icon name="X" size={14} />
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Потрачено</span>
        <span className={`text-base sm:text-lg font-bold ${totalSpent > tripBudget ? 'text-red-600' : 'text-green-600'}`}>
          {formatBudget(totalSpent, tripCurrency)}
        </span>
      </div>

      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${totalSpent > tripBudget ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min((totalSpent / tripBudget) * 100, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs sm:text-sm">
        <span className="text-gray-600">Остаток</span>
        <span className="font-semibold">{formatBudget(tripBudget - totalSpent, tripCurrency)}</span>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">📝 Расходы</h4>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)} className="gap-1">
            <Icon name="Plus" size={14} />
            Добавить
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <Icon name="Loader2" size={20} className="animate-spin text-gray-400" />
          </div>
        ) : groupedExpenses.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            <Icon name="Receipt" size={32} className="mx-auto mb-2 text-gray-300" />
            <p>Расходов пока нет</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groupedExpenses.map((category) => (
              <Collapsible
                key={category.value}
                open={expandedCategories.includes(category.value)}
                onOpenChange={() => toggleCategory(category.value)}
              >
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon name={category.icon} size={16} className="text-gray-600" />
                      <span className="font-medium text-sm">{category.label}</span>
                      <span className="text-xs text-gray-500">({category.expenses.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatBudget(category.total, tripCurrency)}</span>
                      <Icon
                        name={expandedCategories.includes(category.value) ? 'ChevronUp' : 'ChevronDown'}
                        size={16}
                        className="text-gray-400"
                      />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t divide-y">
                      {category.expenses.map((expense) => {
                        const convertedAmount = convertToTripCurrency(expense.amount, expense.currency, expense.exchange_rate);
                        const showConversion = expense.currency !== tripCurrency;

                        return (
                          <div key={expense.id} className="p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-sm truncate">{expense.title}</h5>
                                  {expense.payment_status === 'paid' ? (
                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                      <Icon name="CheckCircle2" size={12} />
                                      Оплачено
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-xs text-yellow-600">
                                      <Icon name="MapPin" size={12} />
                                      На месте
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm">
                                  <span className="font-semibold">
                                    {formatBudget(expense.amount, expense.currency)}
                                  </span>
                                  {showConversion && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      ≈ {formatBudget(convertedAmount, tripCurrency)}
                                    </span>
                                  )}
                                </div>
                                {expense.provider && (
                                  <p className="text-xs text-gray-500 mt-1">{expense.provider}</p>
                                )}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEditDialog(expense)}
                                >
                                  <Icon name="Pencil" size={14} className="text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                >
                                  <Icon name="Trash2" size={14} className="text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить расход</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Категория</Label>
              <Select value={newExpense.category} onValueChange={(val) => setNewExpense({ ...newExpense, category: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Название *</Label>
              <Input
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                placeholder="Например: Билеты Москва-Ялта"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Сумма *</Label>
                <Input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="25000"
                />
              </div>
              <div>
                <Label>Валюта</Label>
                <Select
                  value={newExpense.currency}
                  onValueChange={(val) => {
                    const savedRate = savedExchangeRates[val];
                    const rate = val === tripCurrency ? '1' : (savedRate?.toString() || EXCHANGE_RATES[val]?.toString() || '1');
                    setNewExpense({ ...newExpense, currency: val, exchange_rate: rate });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUB">RUB</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newExpense.currency !== tripCurrency && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="ArrowLeftRight" size={14} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Конвертация</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label className="text-xs">Курс ({newExpense.currency}/{tripCurrency})</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newExpense.exchange_rate}
                      onChange={(e) => setNewExpense({ ...newExpense, exchange_rate: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="text-sm">
                      <span className="text-gray-600">≈ </span>
                      <span className="font-semibold">
                        {formatBudget(
                          parseFloat(newExpense.amount || '0') * parseFloat(newExpense.exchange_rate || '1'),
                          tripCurrency
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label>Статус оплаты</Label>
              <Select value={newExpense.payment_status} onValueChange={(val) => setNewExpense({ ...newExpense, payment_status: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">✅ Оплачено</SelectItem>
                  <SelectItem value="on_site">📍 Оплата на месте</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Дата оплаты</Label>
              <Input
                type="date"
                value={newExpense.payment_date}
                onChange={(e) => setNewExpense({ ...newExpense, payment_date: e.target.value })}
              />
            </div>

            <div>
              <Label>Поставщик / Провайдер</Label>
              <Input
                value={newExpense.provider}
                onChange={(e) => setNewExpense({ ...newExpense, provider: e.target.value })}
                placeholder="Например: Аэрофлот, Booking.com"
              />
            </div>

            <div>
              <Label>Номер брони (необязательно)</Label>
              <Input
                value={newExpense.booking_number}
                onChange={(e) => setNewExpense({ ...newExpense, booking_number: e.target.value })}
                placeholder="ABC123456"
              />
            </div>

            <div>
              <Label>Примечания</Label>
              <Textarea
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                placeholder="Дополнительная информация"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddExpense}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать расход</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <div className="space-y-4">
              <div>
                <Label>Категория</Label>
                <Select
                  value={editingExpense.category}
                  onValueChange={(val) => setEditingExpense({ ...editingExpense, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Название *</Label>
                <Input
                  value={editingExpense.title}
                  onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Сумма *</Label>
                  <Input
                    type="number"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Валюта</Label>
                  <Select
                    value={editingExpense.currency}
                    onValueChange={(val) => setEditingExpense({ ...editingExpense, currency: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUB">RUB</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Статус оплаты</Label>
                <Select
                  value={editingExpense.payment_status}
                  onValueChange={(val) => setEditingExpense({ ...editingExpense, payment_status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">✅ Оплачено</SelectItem>
                    <SelectItem value="on_site">📍 Оплата на месте</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Дата оплаты</Label>
                <Input
                  type="date"
                  value={editingExpense.payment_date || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, payment_date: e.target.value })}
                />
              </div>

              <div>
                <Label>Поставщик / Провайдер</Label>
                <Input
                  value={editingExpense.provider || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, provider: e.target.value })}
                />
              </div>

              <div>
                <Label>Номер брони</Label>
                <Input
                  value={editingExpense.booking_number || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, booking_number: e.target.value })}
                />
              </div>

              <div>
                <Label>Примечания</Label>
                <Textarea
                  value={editingExpense.notes || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateExpense}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}