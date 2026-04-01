import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  date: string;
  member_id: string | null;
  account_id: string | null;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  account_name: string | null;
}

interface PlannedItem {
  id: string;
  source_id: string;
  source: 'recurring' | 'debt';
  amount: number;
  type: string;
  description: string;
  date: string;
  is_planned: true;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  account_name: string | null;
  debt_type?: string;
  bank_name?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  is_system: boolean;
}

interface BudgetItem {
  id: string;
  category_id: string | null;
  month: string;
  planned: number;
  spent: number;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Auth-Token': localStorage.getItem('authToken') || ''
  };
}

function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatShort(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}М`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}т`;
  return String(n);
}

const MONTH_NAMES = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export default function FinanceBudget() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sumIncome, setSumIncome] = useState(0);
  const [sumExpense, setSumExpense] = useState(0);
  const [plannedItems, setPlannedItems] = useState<PlannedItem[]>([]);
  const [planIncome, setPlanIncome] = useState(0);
  const [planExpense, setPlanExpense] = useState(0);
  const [totalPlanned, setTotalPlanned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [month, setMonth] = useState(getCurrentMonth());
  const [txFilter, setTxFilter] = useState<'all' | 'income' | 'expense'>('all');

  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txCategoryId, setTxCategoryId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [budgetCategoryId, setBudgetCategoryId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [exporting, setExporting] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [editBudget, setEditBudget] = useState<BudgetItem | null>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);

  const [historyData, setHistoryData] = useState<{ month: string; income: number; expense: number }[]>([]);

  const loadCategories = useCallback(async () => {
    const res = await fetch(`${API}?section=categories`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories || []);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    const params = new URLSearchParams({ section: 'transactions', month, limit: '200' });
    if (txFilter !== 'all') params.set('type', txFilter);
    const res = await fetch(`${API}?${params}`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setTransactions(data.transactions || []);
      setSumIncome(data.sum_income || 0);
      setSumExpense(data.sum_expense || 0);
      setPlannedItems(data.planned || []);
      setPlanIncome(data.plan_income || 0);
      setPlanExpense(data.plan_expense || 0);
    }
  }, [month, txFilter]);

  const loadBudgets = useCallback(async () => {
    const res = await fetch(`${API}?section=budgets&month=${month}`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setBudgets(data.budgets || []);
      setTotalPlanned(data.total_planned || 0);
      setTotalSpent(data.total_spent || 0);
    }
  }, [month]);

  const loadHistory = useCallback(async () => {
    const months: { month: string; income: number; expense: number }[] = [];
    const d = new Date(month + '-01');
    const promises = [];
    for (let i = 5; i >= 0; i--) {
      const md = new Date(d);
      md.setMonth(md.getMonth() - i);
      const m = `${md.getFullYear()}-${String(md.getMonth() + 1).padStart(2, '0')}`;
      promises.push(
        fetch(`${API}?section=transactions&month=${m}&limit=1`, { headers: getHeaders() })
          .then(r => r.ok ? r.json() : null)
          .then(data => ({
            month: MONTH_NAMES[md.getMonth()],
            income: data?.sum_income || 0,
            expense: data?.sum_expense || 0
          }))
      );
    }
    const results = await Promise.all(promises);
    setHistoryData(results);
  }, [month]);

  useEffect(() => {
    Promise.all([loadCategories(), loadTransactions(), loadBudgets(), loadHistory()])
      .finally(() => setLoading(false));
  }, [loadCategories, loadTransactions, loadBudgets, loadHistory]);

  const pieData = useMemo(() => {
    const map = new Map<string, { name: string; value: number; color: string }>();
    transactions.filter(t => t.type === 'expense').forEach(tx => {
      const name = tx.category_name || 'Прочее';
      const color = tx.category_color || '#6B7280';
      const existing = map.get(name);
      if (existing) {
        existing.value += tx.amount;
      } else {
        map.set(name, { name, value: tx.amount, color });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const budgetChartData = useMemo(() => {
    return budgets.map(b => ({
      name: b.category_name || 'Без категории',
      planned: b.planned,
      spent: b.spent,
      color: b.category_color || '#6B7280'
    }));
  }, [budgets]);

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

  const confirmPlanned = async (item: PlannedItem) => {
    const res = await fetch(API, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        action: 'confirm_planned',
        source: item.source,
        source_id: item.source_id,
        amount: item.amount,
        type: item.type,
        description: item.description,
        date: item.date
      })
    });
    if (res.ok) {
      toast.success('Операция подтверждена');
      loadTransactions();
      loadBudgets();
      loadHistory();
    } else {
      toast.error('Ошибка при подтверждении');
    }
  };

  const addTransaction = async () => {
    if (!txAmount || parseFloat(txAmount) <= 0) {
      toast.error('Укажите сумму');
      return;
    }
    setSaving(true);
    const res = await fetch(API, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        action: 'add_transaction',
        type: txType,
        amount: parseFloat(txAmount),
        description: txDesc,
        category_id: txCategoryId || null,
        date: txDate
      })
    });
    setSaving(false);
    if (res.ok) {
      toast.success(txType === 'income' ? 'Доход добавлен' : 'Расход добавлен');
      setShowAddTx(false);
      setTxAmount('');
      setTxDesc('');
      setTxCategoryId('');
      loadTransactions();
      loadBudgets();
      loadHistory();
    } else {
      toast.error('Ошибка при сохранении');
    }
  };

  const deleteTransaction = async (id: string) => {
    const res = await fetch(API, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action: 'delete_transaction', id })
    });
    if (res.ok) {
      toast.success('Удалено');
      loadTransactions();
      loadBudgets();
      loadHistory();
    }
  };

  const updateTransaction = async () => {
    if (!editTx) return;
    if (!txAmount || parseFloat(txAmount) <= 0) {
      toast.error('Укажите сумму');
      return;
    }
    setSaving(true);
    const res = await fetch(API, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        action: 'update_transaction',
        id: editTx.id,
        amount: parseFloat(txAmount),
        description: txDesc,
        category_id: txCategoryId || null,
        date: txDate
      })
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Сохранено');
      setEditTx(null);
      setTxAmount('');
      setTxDesc('');
      setTxCategoryId('');
      loadTransactions();
      loadBudgets();
      loadHistory();
    } else {
      toast.error('Ошибка');
    }
  };

  const openEditTx = (tx: Transaction) => {
    setTxType(tx.type as 'income' | 'expense');
    setTxAmount(String(tx.amount));
    setTxDesc(tx.description || '');
    setTxCategoryId(tx.category_name ? categories.find(c => c.name === tx.category_name)?.id || '' : '');
    setTxDate(tx.date ? tx.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    setEditTx(tx);
  };

  const saveBudget = async () => {
    if (!budgetCategoryId || !budgetAmount || parseFloat(budgetAmount) <= 0) {
      toast.error('Заполните все поля');
      return;
    }
    setSaving(true);
    const res = await fetch(API, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        action: 'set_budget',
        category_id: budgetCategoryId,
        planned_amount: parseFloat(budgetAmount),
        month
      })
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editBudget ? 'Лимит обновлён' : 'Лимит установлен');
      closeBudgetDialog();
      loadBudgets();
    }
  };

  const deleteBudget = async (id: string) => {
    const res = await fetch(API, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action: 'delete_budget', id })
    });
    if (res.ok) {
      toast.success('Лимит удалён');
      loadBudgets();
    } else {
      toast.error('Ошибка при удалении');
    }
  };

  const openEditBudget = (b: BudgetItem) => {
    setBudgetCategoryId(b.category_id || '');
    setBudgetAmount(String(b.planned));
    setEditBudget(b);
    setShowBudgetDialog(true);
  };

  const closeBudgetDialog = () => {
    setShowBudgetDialog(false);
    setEditBudget(null);
    setBudgetAmount('');
    setBudgetCategoryId('');
  };

  const filteredCategories = categories.filter(c =>
    txType === 'income' ? c.type === 'income' : c.type === 'expense'
  );
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const monthLabel = new Date(month + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const prevMonth = () => {
    const d = new Date(month + '-01');
    d.setMonth(d.getMonth() - 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const nextMonth = () => {
    const d = new Date(month + '-01');
    d.setMonth(d.getMonth() + 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const exportPDF = async () => {
    if (!analyticsRef.current) { toast.error('Откройте вкладку Аналитика'); return; }
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const el = analyticsRef.current;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      pdf.setFontSize(16);
      pdf.text('Финансовый отчёт', pageW / 2, 15, { align: 'center' });
      pdf.setFontSize(11);
      pdf.text(monthLabel, pageW / 2, 22, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Доходы: ${formatMoney(sumIncome)} р.  |  Расходы: ${formatMoney(sumExpense)} р.  |  Баланс: ${formatMoney(sumIncome - sumExpense)} р.`, pageW / 2, 30, { align: 'center' });
      const imgW = pageW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;
      const y = 36;
      if (imgH + y > pageH - 10) {
        const scale = (pageH - 46) / imgH;
        pdf.addImage(imgData, 'PNG', 10, y, imgW * scale, imgH * scale);
      } else {
        pdf.addImage(imgData, 'PNG', 10, y, imgW, imgH);
      }
      pdf.save(`budget_${month}.pdf`);
      toast.success('PDF сохранён');
    } catch (e) {
      toast.error('Ошибка экспорта');
      console.error(e);
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <SectionHero
          title="Бюджет"
          subtitle="Доходы, расходы и планирование"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/3811fe85-aff5-47a9-8059-48190f4100e4.jpg"
          backPath="/finance"
          rightAction={
            <Button size="sm" onClick={() => { setTxType('expense'); setShowAddTx(true); }}
              className="bg-emerald-600 hover:bg-emerald-700">
              <Icon name="Plus" size={16} className="mr-1" /> Запись
            </Button>
          }
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/finance/recurring')}>
            <Icon name="Repeat" size={16} className="mr-1" /> Регулярные
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={prevMonth}>
            <Icon name="ChevronLeft" size={18} />
          </Button>
          <span className="font-medium capitalize">{monthLabel}</span>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <Icon name="ChevronRight" size={18} />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-green-600">Доходы</p>
              <p className="text-lg font-bold text-green-700">{formatMoney(sumIncome + planIncome)}</p>
              {planIncome > 0 && (
                <p className="text-[10px] text-green-500">ожид. +{formatMoney(planIncome)}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-red-600">Расходы</p>
              <p className="text-lg font-bold text-red-700">{formatMoney(sumExpense + planExpense)}</p>
              {planExpense > 0 && (
                <p className="text-[10px] text-red-500">ожид. +{formatMoney(planExpense)}</p>
              )}
            </CardContent>
          </Card>
          <Card className={`border-2 ${(sumIncome + planIncome) - (sumExpense + planExpense) >= 0 ? 'border-emerald-300 bg-emerald-50/50' : 'border-orange-300 bg-orange-50/50'}`}>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Баланс</p>
              <p className={`text-lg font-bold ${(sumIncome + planIncome) - (sumExpense + planExpense) >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                {(sumIncome + planIncome) - (sumExpense + planExpense) >= 0 ? '+' : ''}{formatMoney((sumIncome + planIncome) - (sumExpense + planExpense))}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="transactions" className="flex-1">Операции</TabsTrigger>
            <TabsTrigger value="budgets" className="flex-1">Лимиты</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-3 mt-3">
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map(f => (
                <Button key={f} variant={txFilter === f ? 'default' : 'outline'} size="sm"
                  onClick={() => setTxFilter(f)}
                  className={txFilter === f ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
                  {f === 'all' ? 'Все' : f === 'income' ? 'Доходы' : 'Расходы'}
                </Button>
              ))}
            </div>

            {plannedItems.filter(p => txFilter === 'all' || p.type === txFilter).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                  <Icon name="Clock" size={14} /> Запланированные
                </p>
                {plannedItems.filter(p => txFilter === 'all' || p.type === txFilter).map(p => (
                  <Card key={p.id} className="overflow-hidden border-dashed border-amber-300 bg-amber-50/30">
                    <CardContent className="p-0">
                      <div className="flex items-center">
                        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: p.source === 'debt' ? '#EF444420' : (p.category_color || '#F59E0B') + '20' }}>
                          <Icon name={p.source === 'debt' ? (p.debt_type === 'mortgage' ? 'Home' : p.debt_type === 'car_loan' ? 'Car' : 'Landmark')
                            : (p.category_icon || (p.type === 'income' ? 'TrendingUp' : 'TrendingDown'))}
                            size={20} style={{ color: p.source === 'debt' ? '#EF4444' : (p.category_color || '#F59E0B') }} />
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium truncate">{p.description || 'Платёж'}</span>
                            <Badge variant="outline" className="text-[10px] px-1 py-0 border-amber-400 text-amber-600">
                              {p.source === 'debt' ? 'долг' : 'регуляр.'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {p.category_name && <span>{p.category_name}</span>}
                            {p.bank_name && <span>{p.bank_name}</span>}
                            <span>{new Date(p.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>
                        <div className="pr-1 text-right flex-shrink-0">
                          <p className={`font-bold text-sm ${p.type === 'income' ? 'text-green-600' : 'text-red-600'} opacity-60`}>
                            {p.type === 'income' ? '+' : '−'}{formatMoney(p.amount)} ₽
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="mr-1 text-amber-600 hover:text-emerald-600"
                          title="Подтвердить"
                          onClick={() => confirmPlanned(p)}>
                          <Icon name="CheckCircle" size={18} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {transactions.length === 0 && plannedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="FileText" size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Нет операций за этот месяц</p>
                <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => { setTxType('expense'); setShowAddTx(true); }}>
                  <Icon name="Plus" size={14} className="mr-1" /> Добавить первую запись
                </Button>
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-2">
                {plannedItems.length > 0 && transactions.length > 0 && (
                  <p className="text-xs font-semibold text-muted-foreground pt-1">Фактические</p>
                )}
                {transactions.map(tx => (
                  <Card key={tx.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center">
                        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: (tx.category_color || '#6B7280') + '20' }}>
                          <Icon name={tx.category_icon || (tx.type === 'income' ? 'TrendingUp' : 'TrendingDown')}
                            size={20} style={{ color: tx.category_color || '#6B7280' }} />
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {tx.description || tx.category_name || (tx.type === 'income' ? 'Доход' : 'Расход')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {tx.category_name && <span>{tx.category_name}</span>}
                            <span>{new Date(tx.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>
                        <div className="pr-2 text-right flex-shrink-0">
                          <p className={`font-bold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'income' ? '+' : '−'}{formatMoney(tx.amount)} ₽
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-500"
                          onClick={(e) => { e.stopPropagation(); openEditTx(tx); }}>
                          <Icon name="Pencil" size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="mr-1 text-gray-400 hover:text-red-500"
                          onClick={(e) => { e.stopPropagation(); deleteTransaction(tx.id); }}>
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="budgets" className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Запланировано / Потрачено</p>
                <p className="font-bold">{formatMoney(totalSpent)} / {formatMoney(totalPlanned)} ₽</p>
              </div>
              <Button size="sm" onClick={() => setShowBudgetDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700">
                <Icon name="Plus" size={14} className="mr-1" /> Лимит
              </Button>
            </div>

            {budgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="PieChart" size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Лимиты не установлены</p>
                <p className="text-xs mt-1">Задайте месячные лимиты по категориям расходов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {budgets.map(b => {
                  const pct = b.planned > 0 ? Math.min(100, (b.spent / b.planned) * 100) : 0;
                  const over = b.spent > b.planned;
                  return (
                    <Card key={b.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: (b.category_color || '#6B7280') + '20' }}>
                              <Icon name={b.category_icon || 'Tag'} size={16}
                                style={{ color: b.category_color || '#6B7280' }} />
                            </div>
                            <span className="font-medium text-sm">{b.category_name || 'Без категории'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="text-right mr-1">
                              <span className={`text-sm font-bold ${over ? 'text-red-600' : 'text-foreground'}`}>
                                {formatMoney(b.spent)}
                              </span>
                              <span className="text-xs text-muted-foreground"> / {formatMoney(b.planned)} ₽</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-blue-500"
                              onClick={() => openEditBudget(b)} title="Редактировать">
                              <Icon name="Pencil" size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                              onClick={() => deleteBudget(b.id)} title="Удалить">
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        {over && (
                          <Badge variant="outline" className="mt-2 text-[10px] text-red-600 border-red-200 bg-red-50">
                            Превышение на {formatMoney(b.spent - b.planned)} ₽
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-3">
            {transactions.length > 0 && (
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={exportPDF} disabled={exporting}>
                  <Icon name="FileDown" size={14} className="mr-1" />
                  {exporting ? 'Экспорт...' : 'Скачать PDF'}
                </Button>
              </div>
            )}
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="BarChart3" size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Добавьте операции для аналитики</p>
              </div>
            ) : (
              <div ref={analyticsRef}>
                {pieData.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-3">Расходы по категориям</h3>
                      <div className="flex items-center gap-4">
                        <ResponsiveContainer width="50%" height={180}>
                          <PieChart>
                            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                              {pieData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v: number) => `${formatMoney(v)} ₽`} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-1.5">
                          {pieData.slice(0, 6).map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                              <span className="truncate flex-1">{item.name}</span>
                              <span className="font-medium">{formatShort(item.value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {historyData.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-3">Доходы и расходы за 6 месяцев</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={historyData} barGap={2}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={formatShort} width={40} />
                          <Tooltip formatter={(v: number) => `${formatMoney(v)} ₽`} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="income" name="Доходы" fill="#22C55E" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="expense" name="Расходы" fill="#EF4444" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {historyData.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-3">Динамика баланса</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={historyData.map(h => ({ ...h, balance: h.income - h.expense }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={formatShort} width={40} />
                          <Tooltip formatter={(v: number) => `${formatMoney(v)} ₽`} />
                          <Line type="monotone" dataKey="balance" name="Баланс" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {budgetChartData.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-3">План vs Факт</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={budgetChartData} layout="vertical" barGap={2}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={formatShort} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                          <Tooltip formatter={(v: number) => `${formatMoney(v)} ₽`} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="planned" name="План" fill="#93C5FD" radius={[0, 3, 3, 0]} />
                          <Bar dataKey="spent" name="Факт" fill="#F87171" radius={[0, 3, 3, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddTx} onOpenChange={setShowAddTx}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Новая запись</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button variant={txType === 'expense' ? 'default' : 'outline'}
                className={`flex-1 ${txType === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={() => { setTxType('expense'); setTxCategoryId(''); }}>
                <Icon name="TrendingDown" size={16} className="mr-1" /> Расход
              </Button>
              <Button variant={txType === 'income' ? 'default' : 'outline'}
                className={`flex-1 ${txType === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => { setTxType('income'); setTxCategoryId(''); }}>
                <Icon name="TrendingUp" size={16} className="mr-1" /> Доход
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Сумма, ₽</label>
              <Input type="number" inputMode="decimal" placeholder="0"
                value={txAmount} onChange={e => setTxAmount(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Категория</label>
              <Select value={txCategoryId} onValueChange={setTxCategoryId}>
                <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Описание</label>
              <Input placeholder="Комментарий (необязательно)"
                value={txDesc} onChange={e => setTxDesc(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Дата</label>
              <Input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addTransaction} disabled={saving}
              className={txType === 'income' ? 'bg-green-600 hover:bg-green-700 w-full' : 'bg-red-600 hover:bg-red-700 w-full'}>
              {saving ? 'Сохраняю...' : txType === 'income' ? 'Добавить доход' : 'Добавить расход'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBudgetDialog} onOpenChange={(open) => { if (!open) closeBudgetDialog(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editBudget ? 'Редактировать лимит' : 'Установить лимит'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Категория расходов</label>
              <Select value={budgetCategoryId} onValueChange={setBudgetCategoryId} disabled={!!editBudget}>
                <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Лимит на месяц, ₽</label>
              <Input type="number" inputMode="decimal" placeholder="25000"
                value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} autoFocus />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveBudget} disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 w-full">
              {saving ? 'Сохраняю...' : editBudget ? 'Сохранить' : 'Установить лимит'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTx} onOpenChange={(open) => { if (!open) setEditTx(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Редактировать запись</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Сумма, ₽</label>
              <Input type="number" inputMode="decimal" placeholder="0"
                value={txAmount} onChange={e => setTxAmount(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Категория</label>
              <Select value={txCategoryId} onValueChange={setTxCategoryId}>
                <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Описание</label>
              <Input placeholder="Комментарий"
                value={txDesc} onChange={e => setTxDesc(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Дата</label>
              <Input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateTransaction} disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 w-full">
              {saving ? 'Сохраняю...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}