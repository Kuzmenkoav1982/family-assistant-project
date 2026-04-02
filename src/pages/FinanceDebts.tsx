import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { FinanceDebtsInstructions } from '@/components/finance/FinanceInstructions';

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

interface Debt {
  id: string;
  debt_type: string;
  name: string;
  creditor: string;
  original_amount: number;
  remaining_amount: number;
  interest_rate: number;
  monthly_payment: number;
  next_payment_date: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  notes: string;
  credit_limit?: number | null;
  grace_period_days?: number | null;
  grace_period_end?: string | null;
  grace_amount?: number | null;
  min_payment_pct?: number | null;
  bank_name?: string | null;
  show_in_budget?: boolean;
  is_priority?: boolean;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  is_extra: boolean;
  notes: string;
}

function getHeaders() {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': localStorage.getItem('authToken') || '' };
}

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const DEBT_TYPES = [
  { value: 'mortgage', label: 'Ипотека', icon: 'Home', color: '#3B82F6' },
  { value: 'credit', label: 'Кредит', icon: 'Banknote', color: '#EF4444' },
  { value: 'credit_card', label: 'Кредитная карта', icon: 'CreditCard', color: '#F97316' },
  { value: 'car_loan', label: 'Автокредит', icon: 'Car', color: '#F59E0B' },
  { value: 'personal', label: 'Личный долг', icon: 'Users', color: '#8B5CF6' },
  { value: 'microloan', label: 'Микрозайм', icon: 'Zap', color: '#EC4899' },
  { value: 'installment', label: 'Рассрочка', icon: 'ShoppingBag', color: '#14B8A6' },
];

function getDebtMeta(type: string) {
  return DEBT_TYPES.find(t => t.value === type) || DEBT_TYPES[1];
}

function isCC(type: string) {
  return type === 'credit_card';
}

const DEFAULT_RATES: Record<string, number> = {
  credit_card: 30,
  microloan: 292,
  credit: 18,
  car_loan: 18,
  mortgage: 12,
  personal: 0,
  installment: 0,
};

function getEffectiveRate(d: Debt): { rate: number; estimated: boolean } {
  if (d.interest_rate > 0) return { rate: d.interest_rate, estimated: false };
  const defaultRate = DEFAULT_RATES[d.debt_type] || 0;
  return { rate: defaultRate, estimated: defaultRate > 0 };
}

function calcLoanPayoff(remaining: number, rate: number, monthly: number) {
  if (monthly <= 0 || remaining <= 0) return null;
  const monthlyRate = rate / 100 / 12;
  let balance = remaining;
  let months = 0;
  let totalPaid = 0;
  const maxMonths = 600;
  while (balance > 0 && months < maxMonths) {
    const interest = balance * monthlyRate;
    const principal = Math.min(monthly - interest, balance);
    if (principal <= 0) return { months: Infinity, totalPaid: Infinity, overpayment: Infinity };
    balance -= principal;
    totalPaid += monthly;
    months++;
  }
  return { months, totalPaid, overpayment: totalPaid - remaining };
}

function calcCreditCardPayoff(remaining: number, rate: number, minPct: number) {
  if (remaining <= 0 || minPct <= 0) return null;
  const monthlyRate = rate / 100 / 12;
  let balance = remaining;
  let months = 0;
  let totalPaid = 0;
  const maxMonths = 600;
  while (balance > 1 && months < maxMonths) {
    const interest = balance * monthlyRate;
    const payment = Math.max(balance * (minPct / 100), 500);
    if (payment <= interest) return { months: Infinity, totalPaid: Infinity, overpayment: Infinity };
    balance = balance + interest - payment;
    totalPaid += payment;
    months++;
  }
  return { months, totalPaid, overpayment: totalPaid - remaining };
}

function formatMonths(m: number) {
  if (m === Infinity) return 'Не погасить';
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y > 0 && mo > 0) return `${y} г. ${mo} мес.`;
  if (y > 0) return `${y} г.`;
  return `${mo} мес.`;
}

function getDebtPayoff(d: Debt) {
  if (d.status === 'paid' || d.remaining_amount <= 0) return null;
  const { rate } = getEffectiveRate(d);
  if (isCC(d.debt_type) && d.min_payment_pct) {
    return calcCreditCardPayoff(d.remaining_amount, rate, d.min_payment_pct);
  }
  if (d.monthly_payment > 0) {
    return calcLoanPayoff(d.remaining_amount, rate, d.monthly_payment);
  }
  return null;
}

export default function FinanceDebts() {
  const navigate = useNavigate();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [totalMonthly, setTotalMonthly] = useState(0);

  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', debt_type: 'credit', creditor: '', original_amount: '',
    remaining_amount: '', interest_rate: '', monthly_payment: '',
    next_payment_date: '', start_date: '', end_date: '', notes: '',
    credit_limit: '', grace_period_days: '', grace_period_end: '',
    grace_amount: '', min_payment_pct: '', bank_name: '',
    show_in_budget: false as boolean,
    is_priority: false as boolean
  });

  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payExtra, setPayExtra] = useState(false);
  const [payNotes, setPayNotes] = useState('');
  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [simPayment, setSimPayment] = useState('');

  const loadDebts = useCallback(async () => {
    const res = await fetch(`${API}?section=debts`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setDebts(data.debts || []);
      setTotalRemaining(data.total_remaining || 0);
      setTotalMonthly(data.total_monthly_payment || 0);
    }
  }, []);

  const loadPayments = useCallback(async (debtId: string) => {
    const res = await fetch(`${API}?section=debt_payments&debt_id=${debtId}`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setPayments(data.payments || []);
    }
  }, []);

  useEffect(() => {
    loadDebts().finally(() => setLoading(false));
  }, [loadDebts]);

  useEffect(() => {
    if (selectedDebt) {
      loadPayments(selectedDebt.id);
      setSimPayment('');
    }
  }, [selectedDebt, loadPayments]);

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

  const addDebt = async () => {
    const isCreditCard = form.debt_type === 'credit_card';
    if (!form.name.trim()) {
      toast.error('Укажите название');
      return;
    }
    if (!isCreditCard && (!form.original_amount || parseFloat(form.original_amount) <= 0)) {
      toast.error('Укажите сумму');
      return;
    }
    if (isCreditCard && (!form.credit_limit || parseFloat(form.credit_limit) <= 0)) {
      toast.error('Укажите кредитный лимит');
      return;
    }
    if (form.min_payment_pct && parseFloat(form.min_payment_pct) > 100) {
      toast.error('Мин. платёж не может быть больше 100%');
      return;
    }
    if (form.interest_rate && parseFloat(form.interest_rate) > 999) {
      toast.error('Ставка слишком большая');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(API, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({
          action: 'add_debt',
          ...form,
          original_amount: isCreditCard && form.credit_limit ? parseFloat(form.credit_limit) : parseFloat(form.original_amount),
          remaining_amount: form.remaining_amount ? parseFloat(form.remaining_amount) : (isCreditCard && form.credit_limit ? parseFloat(form.credit_limit) : parseFloat(form.original_amount)),
          interest_rate: form.interest_rate ? parseFloat(form.interest_rate) : 0,
          monthly_payment: form.monthly_payment ? parseFloat(form.monthly_payment) : null,
          next_payment_date: form.next_payment_date || null,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          credit_limit: form.credit_limit ? parseFloat(form.credit_limit) : null,
          grace_period_days: form.grace_period_days ? parseInt(form.grace_period_days) : null,
          grace_period_end: form.grace_period_end || null,
          grace_amount: form.grace_amount ? parseFloat(form.grace_amount) : null,
          min_payment_pct: form.min_payment_pct ? parseFloat(form.min_payment_pct) : null,
          bank_name: form.bank_name || null,
          show_in_budget: form.show_in_budget,
          is_priority: form.is_priority
        })
      });
      setSaving(false);
      if (res.ok) {
        toast.success('Долг добавлен');
        setShowAdd(false);
        setForm({ name: '', debt_type: 'credit', creditor: '', original_amount: '', remaining_amount: '', interest_rate: '', monthly_payment: '', next_payment_date: '', start_date: '', end_date: '', notes: '', credit_limit: '', grace_period_days: '', grace_period_end: '', grace_amount: '', min_payment_pct: '', bank_name: '', show_in_budget: false, is_priority: false });
        loadDebts();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'Ошибка сохранения');
      }
    } catch {
      setSaving(false);
      toast.error('Ошибка сети');
    }
  };

  const deleteDebt = async (id: string) => {
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'delete_debt', id })
    });
    if (res.ok) {
      toast.success('Удалено');
      setSelectedDebt(null);
      loadDebts();
    }
  };

  const updateDebt = async () => {
    if (!editDebt) return;
    if (!form.name.trim()) {
      toast.error('Укажите название');
      return;
    }
    if (form.min_payment_pct && parseFloat(form.min_payment_pct) > 100) {
      toast.error('Мин. платёж не может быть больше 100%');
      return;
    }
    if (form.interest_rate && parseFloat(form.interest_rate) > 999) {
      toast.error('Ставка слишком большая');
      return;
    }
    const isCreditCard = form.debt_type === 'credit_card';
    setSaving(true);
    try {
      const res = await fetch(API, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({
          action: 'update_debt',
          id: editDebt.id,
          debt_type: form.debt_type,
          name: form.name,
          creditor: form.creditor,
          original_amount: isCreditCard && form.credit_limit ? parseFloat(form.credit_limit) : (form.original_amount ? parseFloat(form.original_amount) : editDebt.original_amount),
          remaining_amount: form.remaining_amount ? parseFloat(form.remaining_amount) : editDebt.remaining_amount,
          interest_rate: form.interest_rate ? parseFloat(form.interest_rate) : 0,
          monthly_payment: form.monthly_payment ? parseFloat(form.monthly_payment) : null,
          next_payment_date: form.next_payment_date || null,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          status: editDebt.status,
          notes: form.notes,
          credit_limit: form.credit_limit ? parseFloat(form.credit_limit) : null,
          grace_period_days: form.grace_period_days ? parseInt(form.grace_period_days) : null,
          grace_period_end: form.grace_period_end || null,
          grace_amount: form.grace_amount ? parseFloat(form.grace_amount) : null,
          min_payment_pct: form.min_payment_pct ? parseFloat(form.min_payment_pct) : null,
          bank_name: form.bank_name || null,
          show_in_budget: form.show_in_budget,
          is_priority: form.is_priority
        })
      });
      setSaving(false);
      if (res.ok) {
        toast.success('Сохранено');
        setEditDebt(null);
        setForm({ name: '', debt_type: 'credit', creditor: '', original_amount: '', remaining_amount: '', interest_rate: '', monthly_payment: '', next_payment_date: '', start_date: '', end_date: '', notes: '', credit_limit: '', grace_period_days: '', grace_period_end: '', grace_amount: '', min_payment_pct: '', bank_name: '', show_in_budget: false, is_priority: false });
        loadDebts();
        if (selectedDebt && selectedDebt.id === editDebt.id) {
          setSelectedDebt(null);
        }
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'Ошибка сохранения');
      }
    } catch {
      setSaving(false);
      toast.error('Ошибка сети');
    }
  };

  const openEditDebt = (debt: Debt) => {
    setForm({
      name: debt.name,
      debt_type: debt.debt_type,
      creditor: debt.creditor || '',
      original_amount: String(debt.original_amount),
      remaining_amount: String(debt.remaining_amount),
      interest_rate: String(debt.interest_rate || ''),
      monthly_payment: String(debt.monthly_payment || ''),
      next_payment_date: debt.next_payment_date || '',
      start_date: debt.start_date || '',
      end_date: debt.end_date || '',
      notes: debt.notes || '',
      credit_limit: debt.credit_limit ? String(debt.credit_limit) : '',
      grace_period_days: debt.grace_period_days ? String(debt.grace_period_days) : '',
      grace_period_end: debt.grace_period_end || '',
      grace_amount: debt.grace_amount ? String(debt.grace_amount) : '',
      min_payment_pct: debt.min_payment_pct ? String(debt.min_payment_pct) : '',
      bank_name: debt.bank_name || '',
      show_in_budget: debt.show_in_budget || false,
      is_priority: debt.is_priority || false
    });
    setEditDebt(debt);
  };

  const addPayment = async () => {
    if (!selectedDebt || !payAmount || parseFloat(payAmount) <= 0) {
      toast.error('Укажите сумму платежа');
      return;
    }
    setSaving(true);
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        action: 'add_debt_payment',
        debt_id: selectedDebt.id,
        amount: parseFloat(payAmount),
        date: payDate,
        is_extra: payExtra,
        notes: payNotes
      })
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      toast.success(`Платёж внесён. Остаток: ${formatMoney(data.new_remaining)} ₽`);
      setShowPayment(false);
      setPayAmount('');
      setPayNotes('');
      setPayExtra(false);
      loadDebts();
      loadPayments(selectedDebt.id);
    } else {
      toast.error('Ошибка');
    }
  };

  const togglePriority = async (debt: Debt) => {
    const newVal = !debt.is_priority;
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'update_debt', id: debt.id, is_priority: newVal })
    });
    if (res.ok) {
      toast.success(newVal ? 'Приоритетный долг установлен' : 'Приоритет снят');
      loadDebts();
      if (selectedDebt && selectedDebt.id === debt.id) {
        setSelectedDebt({ ...selectedDebt, is_priority: newVal });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600" />
      </div>
    );
  }

  if (selectedDebt) {
    const meta = getDebtMeta(selectedDebt.debt_type);
    const paidPct = selectedDebt.original_amount > 0
      ? ((selectedDebt.original_amount - selectedDebt.remaining_amount) / selectedDebt.original_amount) * 100 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedDebt(null)}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <h1 className="text-xl font-bold flex-1 truncate">{selectedDebt.name}</h1>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); togglePriority(selectedDebt); }}
              className={selectedDebt.is_priority ? 'text-amber-500' : 'text-gray-400'}
              title={selectedDebt.is_priority ? 'Снять приоритет' : 'Сделать приоритетным'}>
              <Icon name="Star" size={16} className={selectedDebt.is_priority ? 'fill-amber-500' : ''} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openEditDebt(selectedDebt)}>
              <Icon name="Pencil" size={16} />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteDebt(selectedDebt.id)}>
              <Icon name="Trash2" size={16} />
            </Button>
          </div>

          <Card className={`overflow-hidden ${selectedDebt.is_priority ? 'ring-2 ring-amber-400' : ''}`}>
            <div className={`h-2`} style={{ backgroundColor: selectedDebt.is_priority ? '#F59E0B' : meta.color }} />
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: meta.color + '20' }}>
                  <Icon name={meta.icon} size={20} style={{ color: meta.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{meta.label}</Badge>
                    {selectedDebt.is_priority && (
                      <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-300">
                        <Icon name="Star" size={10} className="fill-amber-500 mr-0.5" /> Приоритет к выплате
                      </Badge>
                    )}
                  </div>
                  {selectedDebt.creditor && <p className="text-sm text-muted-foreground mt-0.5">{selectedDebt.creditor}</p>}
                </div>
              </div>

              {isCC(selectedDebt.debt_type) ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Кредитный лимит</p>
                      <p className="font-bold">{formatMoney(selectedDebt.credit_limit || selectedDebt.original_amount)} ₽</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Общая задолженность</p>
                      <p className="font-bold text-red-600">{formatMoney(selectedDebt.remaining_amount)} ₽</p>
                    </div>
                  </div>

                  {(selectedDebt.grace_amount != null || selectedDebt.grace_period_end) && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-3 space-y-2">
                        <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                          <Icon name="Shield" size={14} /> Льготный период
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedDebt.grace_amount != null && (
                            <div>
                              <p className="text-xs text-blue-600">Льготная задолженность</p>
                              <p className="font-bold text-blue-800">{formatMoney(selectedDebt.grace_amount)} ₽</p>
                            </div>
                          )}
                          {selectedDebt.grace_period_end && (
                            <div>
                              <p className="text-xs text-blue-600">Действует до</p>
                              <p className="font-bold text-blue-800">{new Date(selectedDebt.grace_period_end).toLocaleDateString('ru-RU')}</p>
                            </div>
                          )}
                          {selectedDebt.grace_period_days && (
                            <div>
                              <p className="text-xs text-blue-600">Период</p>
                              <p className="font-medium text-blue-800">до {selectedDebt.grace_period_days} дней</p>
                            </div>
                          )}
                        </div>
                        {selectedDebt.grace_period_end && new Date(selectedDebt.grace_period_end) >= new Date() && (
                          <p className="text-[11px] text-green-700 bg-green-50 rounded px-2 py-1 flex items-center gap-1">
                            <Icon name="Clock" size={12} /> Погасите до {new Date(selectedDebt.grace_period_end).toLocaleDateString('ru-RU')} — проценты не начислятся
                          </p>
                        )}
                        {selectedDebt.grace_period_end && new Date(selectedDebt.grace_period_end) < new Date() && (
                          <p className="text-[11px] text-red-700 bg-red-50 rounded px-2 py-1 flex items-center gap-1">
                            <Icon name="AlertTriangle" size={12} /> Льготный период истёк — начисляются {getEffectiveRate(selectedDebt).rate}% годовых
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      const { rate, estimated } = getEffectiveRate(selectedDebt);
                      if (rate <= 0) return null;
                      return (
                        <div>
                          <p className="text-xs text-muted-foreground">Ставка</p>
                          {estimated ? (
                            <p className="font-medium text-orange-600">≈{rate}% <span className="text-[10px] text-muted-foreground">(средняя)</span></p>
                          ) : (
                            <p className="font-medium">{rate}% годовых</p>
                          )}
                        </div>
                      );
                    })()}
                    {selectedDebt.min_payment_pct && (
                      <div>
                        <p className="text-xs text-muted-foreground">Мин. платёж</p>
                        <p className="font-medium">{selectedDebt.min_payment_pct}% от долга</p>
                      </div>
                    )}
                    {selectedDebt.min_payment_pct && selectedDebt.remaining_amount > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Мин. платёж (расчёт)</p>
                        <p className="font-bold text-orange-600">{formatMoney(Math.ceil(selectedDebt.remaining_amount * (selectedDebt.min_payment_pct / 100)))} ₽</p>
                      </div>
                    )}
                    {!selectedDebt.min_payment_pct && selectedDebt.monthly_payment > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Мин. платёж/мес</p>
                        <p className="font-medium">{formatMoney(selectedDebt.monthly_payment)} ₽</p>
                      </div>
                    )}
                    {selectedDebt.bank_name && (
                      <div>
                        <p className="text-xs text-muted-foreground">Банк</p>
                        <p className="font-medium">{selectedDebt.bank_name}</p>
                      </div>
                    )}
                    {selectedDebt.next_payment_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Следующий платёж</p>
                        <p className="font-medium">{new Date(selectedDebt.next_payment_date).toLocaleDateString('ru-RU')}</p>
                      </div>
                    )}
                    {selectedDebt.credit_limit && (
                      <div>
                        <p className="text-xs text-muted-foreground">Доступно</p>
                        <p className="font-medium text-green-600">{formatMoney((selectedDebt.credit_limit || 0) - selectedDebt.remaining_amount)} ₽</p>
                      </div>
                    )}
                  </div>

                  {(selectedDebt.credit_limit || 0) > 0 && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Использовано лимита</span>
                        <span className="font-medium">{Math.round((selectedDebt.remaining_amount / (selectedDebt.credit_limit || 1)) * 100)}%</span>
                      </div>
                      <Progress value={(selectedDebt.remaining_amount / (selectedDebt.credit_limit || 1)) * 100} className="h-2" />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Сумма кредита</p>
                      <p className="font-bold">{formatMoney(selectedDebt.original_amount)} ₽</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Остаток</p>
                      <p className="font-bold text-red-600">{formatMoney(selectedDebt.remaining_amount)} ₽</p>
                    </div>
                    {(() => {
                      const { rate, estimated } = getEffectiveRate(selectedDebt);
                      if (rate <= 0) return null;
                      return (
                        <div>
                          <p className="text-xs text-muted-foreground">Ставка</p>
                          {estimated ? (
                            <p className="font-medium text-orange-600">≈{rate}% <span className="text-[10px] text-muted-foreground">(средняя)</span></p>
                          ) : (
                            <p className="font-medium">{rate}%</p>
                          )}
                        </div>
                      );
                    })()}
                    {selectedDebt.monthly_payment > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Ежемесячный платёж</p>
                        <p className="font-medium">{formatMoney(selectedDebt.monthly_payment)} ₽</p>
                      </div>
                    )}
                    {selectedDebt.next_payment_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Следующий платёж</p>
                        <p className="font-medium">{new Date(selectedDebt.next_payment_date).toLocaleDateString('ru-RU')}</p>
                      </div>
                    )}
                    {selectedDebt.end_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Дата окончания</p>
                        <p className="font-medium">{new Date(selectedDebt.end_date).toLocaleDateString('ru-RU')}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Погашено</span>
                      <span className="font-medium">{Math.round(paidPct)}%</span>
                    </div>
                    <Progress value={paidPct} className="h-2" />
                  </div>
                </>
              )}

              {selectedDebt.notes && (
                <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-3">{selectedDebt.notes}</p>
              )}
            </CardContent>
          </Card>

          {(() => {
            if (selectedDebt.status === 'paid' || selectedDebt.remaining_amount <= 0) return null;
            const payoff = getDebtPayoff(selectedDebt);
            const isInf = payoff ? payoff.months === Infinity : false;
            const { rate: effRate, estimated: rateEstimated } = getEffectiveRate(selectedDebt);

            const simAmt = simPayment ? parseFloat(simPayment) : 0;
            const simResult = simAmt > 0
              ? calcLoanPayoff(selectedDebt.remaining_amount, effRate, simAmt)
              : null;
            const simValid = simResult && simResult.months !== Infinity;
            const savedMonths = simValid && payoff && !isInf ? payoff.months - simResult!.months : 0;
            const savedMoney = simValid && payoff && !isInf ? payoff.overpayment - simResult!.overpayment : 0;

            return (
              <>
                {payoff && (
                <Card className={isInf ? 'border-red-200 bg-red-50/50' : 'border-purple-200 bg-purple-50/50'}>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                      <Icon name="Calculator" size={14} />
                      {isCC(selectedDebt.debt_type) ? 'Прогноз при минимальных платежах' : 'Прогноз погашения'}
                    </p>
                    {isInf ? (
                      <div className="text-center py-2">
                        <p className="font-bold text-red-600">Платёж не покрывает проценты</p>
                        <p className="text-xs text-red-500 mt-1">Увеличьте ежемесячный платёж, чтобы начать гасить долг</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">До погашения</p>
                          <p className="font-bold text-sm">{formatMonths(payoff.months)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Переплата</p>
                          <p className="font-bold text-sm text-red-600">{formatMoney(Math.round(payoff.overpayment))} ₽</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Всего выплатите</p>
                          <p className="font-bold text-sm">{formatMoney(Math.round(payoff.totalPaid))} ₽</p>
                        </div>
                      </div>
                    )}
                    {!isInf && isCC(selectedDebt.debt_type) && payoff.overpayment > 0 && (
                      <div className="bg-amber-50 rounded-lg p-2.5 flex items-start gap-2">
                        <Icon name="AlertTriangle" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-amber-700">При минимальных платежах переплата составит <b>{formatMoney(Math.round(payoff.overpayment))} ₽</b>. Платите больше минимума, чтобы сэкономить.</p>
                      </div>
                    )}
                    {rateEstimated && (
                      <div className="bg-blue-50 rounded-lg p-2.5 flex items-start gap-2">
                        <Icon name="Info" size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-blue-700">Расчёт по средней ставке ≈{effRate}%. Укажите реальную ставку вашей карты для точного прогноза (кнопка ✏️ сверху).</p>
                      </div>
                    )}
                    {!isInf && (
                      <p className="text-[11px] text-muted-foreground text-center">
                        Ожидаемый конец: {new Date(new Date().setMonth(new Date().getMonth() + payoff.months)).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </CardContent>
                </Card>
                )}

                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <Icon name="Sparkles" size={14} /> А если платить больше?
                    </p>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Ваш платёж в месяц, ₽</label>
                      <Input
                        type="number" inputMode="decimal"
                        placeholder={selectedDebt.monthly_payment > 0 ? `Сейчас ${formatMoney(selectedDebt.monthly_payment)}` : 'Введите сумму'}
                        value={simPayment}
                        onChange={e => setSimPayment(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    {simResult && simResult.months === Infinity && (
                      <p className="text-xs text-red-600 text-center font-medium">Эта сумма не покрывает проценты — увеличьте платёж</p>
                    )}
                    {simValid && (
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Срок</p>
                          <p className="font-bold text-sm text-emerald-700">{formatMonths(simResult!.months)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Переплата</p>
                          <p className="font-bold text-sm text-emerald-700">{formatMoney(Math.round(simResult!.overpayment))} ₽</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Всего</p>
                          <p className="font-bold text-sm">{formatMoney(Math.round(simResult!.totalPaid))} ₽</p>
                        </div>
                      </div>
                    )}
                    {simValid && (savedMonths > 0 || savedMoney > 0) && (
                      <div className="bg-emerald-100 rounded-lg p-2.5 text-center">
                        <p className="text-xs font-bold text-emerald-800">
                          Экономия:
                          {savedMonths > 0 && <> {formatMonths(savedMonths)} быстрее</>}
                          {savedMonths > 0 && savedMoney > 0 && ' и '}
                          {savedMoney > 0 && <> {formatMoney(Math.round(savedMoney))} ₽ меньше переплата</>}
                        </p>
                      </div>
                    )}
                    {!simPayment && (() => {
                      const base = selectedDebt.monthly_payment > 0
                        ? selectedDebt.monthly_payment
                        : isCC(selectedDebt.debt_type) && selectedDebt.min_payment_pct
                          ? Math.ceil(selectedDebt.remaining_amount * (selectedDebt.min_payment_pct / 100))
                          : selectedDebt.remaining_amount * 0.03;
                      const suggestions = [
                        Math.round(base * 1.5),
                        Math.round(base * 2),
                        Math.round(base * 3),
                      ].filter(a => a > 0);
                      if (suggestions.length === 0) return null;
                      return (
                        <div className="space-y-2">
                          <p className="text-[11px] text-muted-foreground">Попробуйте:</p>
                          <div className="grid grid-cols-3 gap-2">
                            {suggestions.map((amt, i) => (
                              <Button key={i} variant="outline" size="sm" className="text-xs bg-white"
                                onClick={() => setSimPayment(String(amt))}>
                                {formatMoney(amt)} ₽
                              </Button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </>
            );
          })()}

          <div className="flex items-center justify-between">
            <h2 className="font-bold">История платежей</h2>
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={() => setShowPayment(true)}>
              <Icon name="Plus" size={14} className="mr-1" /> Платёж
            </Button>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Icon name="Clock" size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Платежей пока нет</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map(p => (
                <Card key={p.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${p.is_extra ? 'bg-amber-100' : 'bg-green-100'}`}>
                      <Icon name={p.is_extra ? 'Zap' : 'Check'} size={16} className={p.is_extra ? 'text-amber-600' : 'text-green-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{formatMoney(p.amount)} ₽</span>
                        {p.is_extra && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">Досрочный</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.date).toLocaleDateString('ru-RU')}
                        {p.notes && ` · ${p.notes}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Внести платёж</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Сумма, ₽</label>
                <Input type="number" inputMode="decimal" placeholder={selectedDebt.monthly_payment > 0 ? String(selectedDebt.monthly_payment) : '0'}
                  value={payAmount} onChange={e => setPayAmount(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Дата</label>
                <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={payExtra} onChange={e => setPayExtra(e.target.checked)}
                  className="rounded border-gray-300" />
                <span className="text-sm">Досрочный платёж</span>
              </label>
              <div>
                <label className="text-sm font-medium mb-1 block">Комментарий</label>
                <Input placeholder="Необязательно" value={payNotes} onChange={e => setPayNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addPayment} disabled={saving} className="bg-rose-600 hover:bg-rose-700 w-full">
                {saving ? 'Сохраняю...' : 'Внести платёж'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editDebt} onOpenChange={(open) => { if (!open) setEditDebt(null); }}>
          <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактировать долг</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Название</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Кредитор / Банк</label>
                <Input value={form.creditor} onChange={e => setForm(f => ({ ...f, creditor: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Остаток, ₽</label>
                  <Input type="number" inputMode="decimal" value={form.remaining_amount}
                    onChange={e => setForm(f => ({ ...f, remaining_amount: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Ставка, %</label>
                  <Input type="number" inputMode="decimal" value={form.interest_rate}
                    onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Платёж/мес, ₽</label>
                <Input type="number" inputMode="decimal" value={form.monthly_payment}
                  onChange={e => setForm(f => ({ ...f, monthly_payment: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">След. платёж</label>
                <Input type="date" value={form.next_payment_date}
                  onChange={e => setForm(f => ({ ...f, next_payment_date: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Заметка</label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              {editDebt && isCC(editDebt.debt_type) && (
                <>
                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-orange-600 mb-2">Кредитная карта</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Банк</label>
                    <Input value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Кред. лимит, ₽</label>
                      <Input type="number" inputMode="decimal" value={form.credit_limit}
                        onChange={e => setForm(f => ({ ...f, credit_limit: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Мин. платёж, %</label>
                      <Input type="number" inputMode="decimal" min="0" max="100" value={form.min_payment_pct}
                        onChange={e => setForm(f => ({ ...f, min_payment_pct: e.target.value }))} />
                      <p className="text-[11px] text-muted-foreground mt-1">Процент от долга, обычно 3-8%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Льготный период, дн</label>
                      <Input type="number" inputMode="numeric" value={form.grace_period_days}
                        onChange={e => setForm(f => ({ ...f, grace_period_days: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Льготн. период до</label>
                      <Input type="date" value={form.grace_period_end}
                        onChange={e => setForm(f => ({ ...f, grace_period_end: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Льготная задолж., ₽</label>
                    <Input type="number" inputMode="decimal" value={form.grace_amount}
                      onChange={e => setForm(f => ({ ...f, grace_amount: e.target.value }))} />
                  </div>
                </>
              )}
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.show_in_budget ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}`}
                  onClick={() => setForm(f => ({ ...f, show_in_budget: !f.show_in_budget }))}>
                  {form.show_in_budget && <Icon name="Check" size={14} className="text-white" />}
                </div>
                <span className="text-sm" onClick={() => setForm(f => ({ ...f, show_in_budget: !f.show_in_budget }))}>Показывать платёж в бюджете</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.is_priority ? 'bg-amber-500 border-amber-500' : 'border-gray-300'}`}
                  onClick={() => setForm(f => ({ ...f, is_priority: !f.is_priority }))}>
                  {form.is_priority && <Icon name="Star" size={12} className="text-white" />}
                </div>
                <span className="text-sm" onClick={() => setForm(f => ({ ...f, is_priority: !f.is_priority }))}>Приоритетный к выплате</span>
              </label>
            </div>
            <DialogFooter>
              <Button onClick={updateDebt} disabled={saving}
                className="bg-rose-600 hover:bg-rose-700 w-full">
                {saving ? 'Сохраняю...' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <SectionHero
          title="Кредиты и долги"
          subtitle="Ипотека, кредиты и управление долгами"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/4cd90e85-8966-4402-84ce-6475cc940f22.jpg"
          backPath="/finance"
          rightAction={
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={() => setShowAdd(true)}>
              <Icon name="Plus" size={16} className="mr-1" /> Добавить
            </Button>
          }
        />

        <FinanceDebtsInstructions />

        {debts.length > 0 && (() => {
          const active = debts.filter(d => d.status === 'active' && d.remaining_amount > 0);
          const totalOverpayment = active.reduce((sum, d) => {
            const p = getDebtPayoff(d);
            return sum + (p && p.overpayment !== Infinity ? p.overpayment : 0);
          }, 0);
          const highestRate = active.reduce((max, d) => Math.max(max, getEffectiveRate(d).rate), 0);
          const highestRateDebt = active.reduce((best: Debt | null, d) => {
            const r = getEffectiveRate(d).rate;
            return !best || r > getEffectiveRate(best).rate ? d : best;
          }, null as Debt | null);
          const ccDebts = active.filter(d => isCC(d.debt_type));
          const ccTotal = ccDebts.reduce((s, d) => s + d.remaining_amount, 0);

          return (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-red-200 bg-red-50/50">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-red-600">Общий долг</p>
                    <p className="text-lg font-bold text-red-700">{formatMoney(totalRemaining)} ₽</p>
                  </CardContent>
                </Card>
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-orange-600">Платежи/мес</p>
                    <p className="text-lg font-bold text-orange-700">{formatMoney(totalMonthly)} ₽</p>
                  </CardContent>
                </Card>
              </div>

              {(totalOverpayment > 0 || ccTotal > 0 || active.length > 1) && (
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                      <Icon name="TrendingUp" size={14} /> Аналитика долгов
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {totalOverpayment > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Общая переплата</p>
                          <p className="font-bold text-sm text-red-600">{formatMoney(Math.round(totalOverpayment))} ₽</p>
                        </div>
                      )}
                      {ccTotal > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Долг по карт{ccDebts.length > 1 ? 'ам' : 'е'}</p>
                          <p className="font-bold text-sm text-orange-600">{formatMoney(ccTotal)} ₽</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Активных долгов</p>
                        <p className="font-bold text-sm">{active.length}</p>
                      </div>
                      {highestRate > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Макс. ставка</p>
                          <p className="font-bold text-sm">{highestRate}%</p>
                        </div>
                      )}
                    </div>
                    {highestRateDebt && active.length > 1 && highestRate > 0 && (
                      <div className="bg-white/70 rounded-lg p-2.5 flex items-start gap-2">
                        <Icon name="Lightbulb" size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-foreground">
                          <b>Совет:</b> Гасите «{highestRateDebt.name}» ({highestRate}%) в первую очередь — это сэкономит больше всего на переплате (метод лавины)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          );
        })()}

        {debts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="PartyPopper" size={48} className="mx-auto mb-3 text-green-400" />
            <p className="font-medium text-foreground">У вас нет долгов!</p>
            <p className="text-sm mt-1">Добавьте кредиты, ипотеку или займы для отслеживания</p>
          </div>
        ) : (
          <div className="space-y-3">
            {debts.map(debt => {
              const meta = getDebtMeta(debt.debt_type);
              const paidPct = debt.original_amount > 0
                ? ((debt.original_amount - debt.remaining_amount) / debt.original_amount) * 100 : 0;
              const isPaid = debt.status === 'paid';

              return (
                <Card key={debt.id}
                  className={`overflow-hidden cursor-pointer hover:shadow-lg transition-all ${isPaid ? 'opacity-60' : ''} ${debt.is_priority ? 'ring-2 ring-amber-400 border-amber-300' : ''}`}
                  onClick={() => setSelectedDebt(debt)}>
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      <div className="w-14 flex items-center justify-center flex-shrink-0 relative"
                        style={{ backgroundColor: debt.is_priority ? '#FEF3C7' : meta.color + '15' }}>
                        <Icon name={meta.icon} size={24} style={{ color: meta.color }} />
                        {debt.is_priority && (
                          <div className="absolute -top-0.5 -right-0.5">
                            <Icon name="Star" size={12} className="text-amber-500 fill-amber-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm truncate">{debt.name}</span>
                          {debt.is_priority && <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-300">Приоритет</Badge>}
                          {isPaid && <Badge className="text-[10px] bg-green-100 text-green-700">Погашен</Badge>}
                          <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                        </div>
                        {debt.creditor && <p className="text-xs text-muted-foreground mb-1">{debt.creditor}</p>}
                        <div className="flex items-center gap-4 text-xs flex-wrap">
                          <span className="text-red-600 font-medium">{formatMoney(debt.remaining_amount)} ₽</span>
                          {isCC(debt.debt_type) && debt.credit_limit ? (
                            <span className="text-muted-foreground">лимит {formatMoney(debt.credit_limit)}</span>
                          ) : debt.monthly_payment > 0 ? (
                            <span className="text-muted-foreground">{formatMoney(debt.monthly_payment)} ₽/мес</span>
                          ) : null}
                          {isCC(debt.debt_type) && debt.min_payment_pct && debt.remaining_amount > 0 && (
                            <span className="text-orange-600 font-medium">мин. {formatMoney(Math.ceil(debt.remaining_amount * (debt.min_payment_pct / 100)))} ₽</span>
                          )}
                          {(() => {
                            const { rate, estimated } = getEffectiveRate(debt);
                            if (rate <= 0) return null;
                            return estimated
                              ? <span className="text-orange-500">≈{rate}%</span>
                              : <span className="text-muted-foreground">{rate}%</span>;
                          })()}
                          {isCC(debt.debt_type) && debt.bank_name && (
                            <span className="text-muted-foreground">{debt.bank_name}</span>
                          )}
                        </div>
                        {(() => {
                          const po = getDebtPayoff(debt);
                          if (!po || isPaid) return null;
                          return (
                            <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                              {po.months !== Infinity && (
                                <span className="text-purple-600 flex items-center gap-0.5">
                                  <Icon name="Clock" size={11} /> {formatMonths(po.months)}
                                </span>
                              )}
                              {po.overpayment !== Infinity && po.overpayment > 0 && (
                                <span className="text-red-500">переплата {formatMoney(Math.round(po.overpayment))} ₽</span>
                              )}
                              {po.months === Infinity && (
                                <span className="text-red-600 font-medium">Платёж не покрывает %</span>
                              )}
                            </div>
                          );
                        })()}
                        <div className="mt-1.5">
                          <Progress value={isCC(debt.debt_type) && debt.credit_limit ? (debt.remaining_amount / debt.credit_limit) * 100 : paidPct} className="h-1.5" />
                        </div>
                      </div>
                      <div className="flex items-center pr-3">
                        <Icon name="ChevronRight" size={18} className="text-gray-400" />
                      </div>
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
          <DialogHeader><DialogTitle>Новый долг</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Тип</label>
              <Select value={form.debt_type} onValueChange={v => setForm({...form, debt_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEBT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <Icon name={t.icon} size={14} style={{ color: t.color }} />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Название</label>
              <Input placeholder="Ипотека Сбербанк" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            {!isCC(form.debt_type) && (
              <div>
                <label className="text-sm font-medium mb-1 block">Кредитор</label>
                <Input placeholder="Банк / человек" value={form.creditor} onChange={e => setForm({...form, creditor: e.target.value})} />
              </div>
            )}
            {isCC(form.debt_type) ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Банк</label>
                  <Input placeholder="Т-Банк, Сбер, Альфа..." value={form.bank_name}
                    onChange={e => setForm({...form, bank_name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Кредитный лимит, ₽</label>
                    <Input type="number" inputMode="decimal" placeholder="300000" value={form.credit_limit}
                      onChange={e => setForm({...form, credit_limit: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Задолженность, ₽</label>
                    <Input type="number" inputMode="decimal" placeholder="94675" value={form.remaining_amount}
                      onChange={e => setForm({...form, remaining_amount: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ставка, % годовых</label>
                    <Input type="number" inputMode="decimal" placeholder="59" value={form.interest_rate}
                      onChange={e => setForm({...form, interest_rate: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Мин. платёж, %</label>
                    <Input type="number" inputMode="decimal" placeholder="3" min="0" max="100" value={form.min_payment_pct}
                      onChange={e => setForm({...form, min_payment_pct: e.target.value})} />
                    <p className="text-[11px] text-muted-foreground mt-1">Процент от долга, обычно 3-8%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Льготный период, дн</label>
                    <Input type="number" inputMode="numeric" placeholder="55" value={form.grace_period_days}
                      onChange={e => setForm({...form, grace_period_days: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Льготн. период до</label>
                    <Input type="date" value={form.grace_period_end}
                      onChange={e => setForm({...form, grace_period_end: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Льготная задолженность, ₽</label>
                  <Input type="number" inputMode="decimal" placeholder="Сумма без процентов" value={form.grace_amount}
                    onChange={e => setForm({...form, grace_amount: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Мин. платёж/мес, ₽</label>
                  <Input type="number" inputMode="decimal" placeholder="Если фиксированный" value={form.monthly_payment}
                    onChange={e => setForm({...form, monthly_payment: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">След. платёж</label>
                  <Input type="date" value={form.next_payment_date} onChange={e => setForm({...form, next_payment_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Заметка</label>
                  <Input placeholder="Необязательно" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Сумма кредита, ₽</label>
                    <Input type="number" inputMode="decimal" placeholder="3000000" value={form.original_amount}
                      onChange={e => setForm({...form, original_amount: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Остаток, ₽</label>
                    <Input type="number" inputMode="decimal" placeholder="Если уже платили" value={form.remaining_amount}
                      onChange={e => setForm({...form, remaining_amount: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ставка, %</label>
                    <Input type="number" inputMode="decimal" placeholder="12.5" value={form.interest_rate}
                      onChange={e => setForm({...form, interest_rate: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Платёж/мес, ₽</label>
                    <Input type="number" inputMode="decimal" placeholder="35000" value={form.monthly_payment}
                      onChange={e => setForm({...form, monthly_payment: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Дата начала</label>
                    <Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Дата окончания</label>
                    <Input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">След. платёж</label>
                  <Input type="date" value={form.next_payment_date} onChange={e => setForm({...form, next_payment_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Заметка</label>
                  <Input placeholder="Необязательно" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
              </>
            )}
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.show_in_budget ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}`}
                onClick={() => setForm({...form, show_in_budget: !form.show_in_budget})}>
                {form.show_in_budget && <Icon name="Check" size={14} className="text-white" />}
              </div>
              <span className="text-sm" onClick={() => setForm({...form, show_in_budget: !form.show_in_budget})}>Показывать платёж в бюджете</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.is_priority ? 'bg-amber-500 border-amber-500' : 'border-gray-300'}`}
                onClick={() => setForm({...form, is_priority: !form.is_priority})}>
                {form.is_priority && <Icon name="Star" size={12} className="text-white" />}
              </div>
              <span className="text-sm" onClick={() => setForm({...form, is_priority: !form.is_priority})}>Приоритетный к выплате</span>
            </label>
          </div>
          <DialogFooter>
            <Button onClick={addDebt} disabled={saving} className="bg-rose-600 hover:bg-rose-700 w-full">
              {saving ? 'Сохраняю...' : 'Добавить долг'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}