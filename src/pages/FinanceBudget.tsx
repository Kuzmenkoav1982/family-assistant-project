import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

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
  const [accountBalance, setAccountBalance] = useState(0);
  const [accountCount, setAccountCount] = useState(0);
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
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());

  const [cashGapWarning, setCashGapWarning] = useState<{
    show: boolean;
    gapDate: string;
    gapAmount: number;
    action: 'add' | 'edit' | 'confirm';
    confirmData?: PlannedItem;
  } | null>(null);

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

  const loadAccountBalance = useCallback(async () => {
    try {
      const res = await fetch(`${API}?section=accounts`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAccountBalance(data.total_balance || 0);
        setAccountCount((data.accounts || []).filter((a: { is_active: boolean }) => a.is_active).length);
      }
    } catch { /* ignore */ }
  }, []);

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
    Promise.all([loadCategories(), loadTransactions(), loadBudgets(), loadHistory(), loadAccountBalance()])
      .finally(() => setLoading(false));
  }, [loadCategories, loadTransactions, loadBudgets, loadHistory, loadAccountBalance]);

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

  const timeline = useMemo(() => {
    type TimelineItem = {
      id: string;
      date: string;
      dateStr: string;
      amount: number;
      type: string;
      description: string;
      isPlanned: boolean;
      source?: 'recurring' | 'debt';
      debt_type?: string;
      bank_name?: string;
      category_name: string | null;
      category_icon: string | null;
      category_color: string | null;
      account_name: string | null;
      originalPlanned?: PlannedItem;
      originalTx?: Transaction;
    };

    const items: TimelineItem[] = [];

    // Add planned items
    plannedItems
      .filter(p => txFilter === 'all' || p.type === txFilter)
      .forEach(p => items.push({
        id: 'p_' + p.id,
        date: p.date,
        dateStr: new Date(p.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        amount: p.amount,
        type: p.type,
        description: p.description || 'Платёж',
        isPlanned: true,
        source: p.source,
        debt_type: p.debt_type,
        bank_name: p.bank_name,
        category_name: p.category_name,
        category_icon: p.category_icon,
        category_color: p.category_color,
        account_name: p.account_name,
        originalPlanned: p,
      }));

    // Add actual transactions
    transactions
      .filter(t => txFilter === 'all' || t.type === txFilter)
      .forEach(tx => items.push({
        id: 'tx_' + tx.id,
        date: tx.date,
        dateStr: new Date(tx.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        amount: tx.amount,
        type: tx.type,
        description: tx.description || tx.category_name || (tx.type === 'income' ? 'Доход' : 'Расход'),
        isPlanned: false,
        category_name: tx.category_name,
        category_icon: tx.category_icon,
        category_color: tx.category_color,
        account_name: tx.account_name,
        originalTx: tx,
      }));

    // Sort by date ascending
    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let balance = accountBalance;
    const today = new Date().toISOString().split('T')[0];
    let cashGap: { date: string; amount: number } | null = null;

    const withBalance = items.map((item) => {
      if (item.type === 'income') {
        balance += item.amount;
      } else {
        balance -= item.amount;
      }
      const runningBalance = balance;
      const isGap = runningBalance < 0;
      if (isGap && !cashGap) {
        cashGap = { date: item.dateStr, amount: runningBalance };
      }
      return { ...item, runningBalance, isGap };
    });

    // Group by date
    const todayDate = today;
    const groups: { dateKey: string; dateLabel: string; isToday: boolean; isPast: boolean; items: typeof withBalance }[] = [];
    const dateMap = new Map<string, typeof withBalance>();

    withBalance.forEach(item => {
      const key = item.date.split('T')[0];
      if (!dateMap.has(key)) dateMap.set(key, []);
      dateMap.get(key)!.push(item);
    });

    dateMap.forEach((groupItems, dateKey) => {
      const d = new Date(dateKey);
      const isToday = dateKey === todayDate;
      const isPast = dateKey < todayDate;
      const dateLabel = isToday
        ? `Сегодня, ${d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`
        : d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      groups.push({ dateKey, dateLabel, isToday, isPast, items: groupItems });
    });

    return { groups, cashGap, todayDate };
  }, [plannedItems, transactions, txFilter, accountBalance]);

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

  const checkCashGap = (
    newAmount: number,
    newDate: string,
    newType: string,
    editTxId?: string
  ): { willCauseGap: boolean; gapDate: string; gapAmount: number } => {
    // Build all timeline items (unfiltered — we need all items for accurate balance)
    type SimItem = { date: string; amount: number; type: string; id: string };
    const items: SimItem[] = [];

    // Add planned items
    plannedItems.forEach(p => items.push({
      id: 'p_' + p.id,
      date: p.date,
      amount: p.amount,
      type: p.type,
    }));

    // Add actual transactions (replacing edited one if applicable)
    transactions.forEach(tx => {
      if (editTxId && tx.id === editTxId) {
        // Replace with new values
        items.push({
          id: 'tx_' + tx.id,
          date: newDate,
          amount: newAmount,
          type: newType,
        });
      } else {
        items.push({
          id: 'tx_' + tx.id,
          date: tx.date,
          amount: tx.amount,
          type: tx.type,
        });
      }
    });

    // If adding a new transaction (not editing), insert the hypothetical one
    if (!editTxId) {
      items.push({
        id: 'hypothetical_new',
        date: newDate,
        amount: newAmount,
        type: newType,
      });
    }

    // Sort by date ascending
    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let balance = accountBalance;
    for (const item of items) {
      if (item.type === 'income') {
        balance += item.amount;
      } else {
        balance -= item.amount;
      }
      if (balance < 0) {
        const dateStr = new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
        return { willCauseGap: true, gapDate: dateStr, gapAmount: balance };
      }
    }

    return { willCauseGap: false, gapDate: '', gapAmount: 0 };
  };

  const executeAddTransaction = async () => {
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

  const executeUpdateTransaction = async () => {
    if (!editTx) return;
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

  const executeConfirmPlanned = async (item: PlannedItem) => {
    setConfirmingIds(prev => new Set(prev).add(item.id));
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
      setTimeout(() => {
        loadTransactions();
        loadBudgets();
        loadHistory();
        setConfirmingIds(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }, 600);
    } else {
      toast.error('Ошибка при подтверждении');
      setConfirmingIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const confirmPlanned = async (item: PlannedItem) => {
    if (item.type === 'expense') {
      const gap = checkCashGap(item.amount, item.date, item.type);
      if (gap.willCauseGap) {
        setCashGapWarning({
          show: true,
          gapDate: gap.gapDate,
          gapAmount: gap.gapAmount,
          action: 'confirm',
          confirmData: item,
        });
        return;
      }
    }
    executeConfirmPlanned(item);
  };

  const addTransaction = async () => {
    if (!txAmount || parseFloat(txAmount) <= 0) {
      toast.error('Укажите сумму');
      return;
    }
    if (txType === 'expense') {
      const gap = checkCashGap(parseFloat(txAmount), txDate, txType);
      if (gap.willCauseGap) {
        setCashGapWarning({
          show: true,
          gapDate: gap.gapDate,
          gapAmount: gap.gapAmount,
          action: 'add',
        });
        return;
      }
    }
    executeAddTransaction();
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
    if (editTx.type === 'expense') {
      const gap = checkCashGap(parseFloat(txAmount), txDate, editTx.type, editTx.id);
      if (gap.willCauseGap) {
        setCashGapWarning({
          show: true,
          gapDate: gap.gapDate,
          gapAmount: gap.gapAmount,
          action: 'edit',
        });
        return;
      }
    }
    executeUpdateTransaction();
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
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/finance/recurring')}>
            <Icon name="Repeat" size={16} className="mr-1" /> Регулярные
          </Button>
          <Button size="sm" onClick={() => { setTxType('expense'); setShowAddTx(true); }}
            className="bg-emerald-600 hover:bg-emerald-700">
            <Icon name="Plus" size={16} className="mr-1" /> Запись
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

        {/* Текущий баланс на счетах */}
        {accountCount > 0 && (
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-shrink">
                  <p className="text-blue-200 text-xs">На счетах сейчас</p>
                  <Popover>
                    <PopoverTrigger className="cursor-pointer group">
                      <div className="flex items-center gap-1">
                        <p className="text-xl font-bold underline decoration-dashed decoration-blue-300/50 underline-offset-4 truncate">{formatMoney(accountBalance)} ₽</p>
                        <Icon name="Info" size={12} className="text-blue-200 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-3" side="bottom">
                      <div className="space-y-2">
                        <p className="font-semibold text-sm">Баланс на счетах</p>
                        <p className="text-xs text-muted-foreground">Сумма остатков на всех активных счетах семьи на текущий момент.</p>
                        <div className="border-t pt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Активных счетов</span>
                            <span className="font-medium">{accountCount}</span>
                          </div>
                        </div>
                        <div className="border-t pt-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span>Итого на счетах</span>
                            <span>{formatMoney(accountBalance)} ₽</span>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <p className="text-blue-200 text-[10px]">{accountCount} {accountCount === 1 ? 'счёт' : accountCount < 5 ? 'счёта' : 'счетов'}</p>
                </div>
                <div className="text-right min-w-0 flex-shrink">
                  <p className="text-blue-200 text-xs">Прогноз на конец мес.</p>
                  <Popover>
                    <PopoverTrigger className="cursor-pointer group">
                      <div className="flex items-center gap-1 justify-end">
                        <p className={`text-base font-bold underline decoration-dashed decoration-blue-300/50 underline-offset-4 truncate ${(accountBalance + planIncome - planExpense) >= 0 ? 'text-white' : 'text-orange-300'}`}>
                          {formatMoney(accountBalance + planIncome - planExpense)} ₽
                        </p>
                        <Icon name="Info" size={12} className="text-blue-200 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-3" side="bottom">
                      <div className="space-y-2">
                        <p className="font-semibold text-sm">Прогноз на конец месяца</p>
                        <p className="text-xs text-muted-foreground">Ожидаемый баланс на счетах к концу месяца с учётом запланированных доходов и расходов.</p>
                        <div className="border-t pt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Текущий баланс</span>
                            <span className="font-medium">{formatMoney(accountBalance)} ₽</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">+ Ожидаемые доходы</span>
                            <span className="font-medium text-green-600">+{formatMoney(planIncome)} ₽</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">- Ожидаемые расходы</span>
                            <span className="font-medium text-red-600">-{formatMoney(planExpense)} ₽</span>
                          </div>
                        </div>
                        <div className="border-t pt-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span>Прогноз</span>
                            <span>{formatMoney(accountBalance + planIncome - planExpense)} ₽</span>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {(planIncome > 0 || planExpense > 0) && (
                    <Popover>
                      <PopoverTrigger className="cursor-pointer group">
                        <p className="text-blue-200 text-[10px] underline decoration-dashed decoration-blue-300/40 underline-offset-2 flex items-center gap-0.5 justify-end">
                          {(planIncome - planExpense) >= 0 ? '+' : ''}{formatMoney(planIncome - planExpense)} ожид.
                          <Icon name="Info" size={10} className="text-blue-200 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </p>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" side="bottom">
                        <div className="space-y-2">
                          <p className="font-semibold text-sm">Ожидаемое изменение</p>
                          <p className="text-xs text-muted-foreground">Чистое изменение баланса от запланированных операций (регулярные платежи, долги).</p>
                          <div className="border-t pt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Ожидаемые доходы</span>
                              <span className="font-medium text-green-600">+{formatMoney(planIncome)} ₽</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Ожидаемые расходы</span>
                              <span className="font-medium text-red-600">-{formatMoney(planExpense)} ₽</span>
                            </div>
                          </div>
                          <div className="border-t pt-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span>Итого изменение</span>
                              <span>{(planIncome - planExpense) >= 0 ? '+' : ''}{formatMoney(planIncome - planExpense)} ₽</span>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Card className="border-green-200 bg-green-50/50 overflow-hidden">
            <CardContent className="p-2 text-center">
              <p className="text-xs text-green-600">Доходы</p>
              <Popover>
                <PopoverTrigger className="cursor-pointer group w-full">
                  <div className="flex items-center gap-0.5 justify-center">
                    <p className="text-sm font-bold text-green-700 underline decoration-dashed decoration-green-300/50 underline-offset-4 truncate">{formatMoney(sumIncome + planIncome)}</p>
                    <Icon name="Info" size={10} className="text-green-400 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" side="bottom">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Доходы за месяц</p>
                    <p className="text-xs text-muted-foreground">Сумма фактически полученных доходов и запланированных поступлений (регулярные платежи).</p>
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Фактические доходы</span>
                        <span className="font-medium">{formatMoney(sumIncome)} ₽</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">+ Запланированные</span>
                        <span className="font-medium text-green-600">+{formatMoney(planIncome)} ₽</span>
                      </div>
                    </div>
                    <div className="border-t pt-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Итого доходов</span>
                        <span>{formatMoney(sumIncome + planIncome)} ₽</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {planIncome > 0 && (
                <p className="text-[10px] text-green-500">ожид. +{formatMoney(planIncome)}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50 overflow-hidden">
            <CardContent className="p-2 text-center">
              <p className="text-xs text-red-600">Расходы</p>
              <Popover>
                <PopoverTrigger className="cursor-pointer group w-full">
                  <div className="flex items-center gap-0.5 justify-center">
                    <p className="text-sm font-bold text-red-700 underline decoration-dashed decoration-red-300/50 underline-offset-4 truncate">{formatMoney(sumExpense + planExpense)}</p>
                    <Icon name="Info" size={10} className="text-red-400 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" side="bottom">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Расходы за месяц</p>
                    <p className="text-xs text-muted-foreground">Сумма фактических расходов и запланированных трат (регулярные платежи, долги).</p>
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Фактические расходы</span>
                        <span className="font-medium">{formatMoney(sumExpense)} ₽</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">+ Запланированные</span>
                        <span className="font-medium text-red-600">+{formatMoney(planExpense)} ₽</span>
                      </div>
                    </div>
                    <div className="border-t pt-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Итого расходов</span>
                        <span>{formatMoney(sumExpense + planExpense)} ₽</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {planExpense > 0 && (
                <p className="text-[10px] text-red-500">ожид. +{formatMoney(planExpense)}</p>
              )}
            </CardContent>
          </Card>
          <Card className={`border-2 overflow-hidden ${(sumIncome + planIncome) - (sumExpense + planExpense) >= 0 ? 'border-emerald-300 bg-emerald-50/50' : 'border-orange-300 bg-orange-50/50'}`}>
            <CardContent className="p-2 text-center">
              <p className="text-xs text-muted-foreground">Баланс</p>
              <Popover>
                <PopoverTrigger className="cursor-pointer group w-full">
                  <div className="flex items-center gap-0.5 justify-center">
                    <p className={`text-sm font-bold underline decoration-dashed underline-offset-4 truncate ${(sumIncome + planIncome) - (sumExpense + planExpense) >= 0 ? 'text-emerald-700 decoration-emerald-300/50' : 'text-orange-700 decoration-orange-300/50'}`}>
                      {(sumIncome + planIncome) - (sumExpense + planExpense) >= 0 ? '+' : ''}{formatMoney((sumIncome + planIncome) - (sumExpense + planExpense))}
                    </p>
                    <Icon name="Info" size={10} className="text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" side="bottom">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Баланс за месяц</p>
                    <p className="text-xs text-muted-foreground">Разница между всеми доходами и расходами за месяц (включая запланированные).</p>
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Всего доходов</span>
                        <span className="font-medium text-green-600">{formatMoney(sumIncome + planIncome)} ₽</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Всего расходов</span>
                        <span className="font-medium text-red-600">-{formatMoney(sumExpense + planExpense)} ₽</span>
                      </div>
                    </div>
                    <div className="border-t pt-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Баланс</span>
                        <span>{(sumIncome + planIncome) - (sumExpense + planExpense) >= 0 ? '+' : ''}{formatMoney((sumIncome + planIncome) - (sumExpense + planExpense))} ₽</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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

            {/* Cash gap alert */}
            {timeline.cashGap && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                <Icon name="AlertTriangle" size={18} className="flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold">Кассовый разрыв</span>{' '}
                  <span>{timeline.cashGap.date}</span> — баланс уходит до{' '}
                  <span className="font-bold">{formatMoney(timeline.cashGap.amount)} ₽</span>
                </div>
              </div>
            )}

            {/* Starting balance */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
              <Icon name="Wallet" size={14} />
              <span>Начальный баланс на счетах:</span>
              <span className="font-bold text-foreground">{formatMoney(accountBalance)} ₽</span>
            </div>

            {timeline.groups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="FileText" size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Нет операций за этот месяц</p>
                <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => { setTxType('expense'); setShowAddTx(true); }}>
                  <Icon name="Plus" size={14} className="mr-1" /> Добавить первую запись
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {timeline.groups.map((group, gi) => {
                  const showNowDivider = !group.isPast && !group.isToday &&
                    (gi === 0 || timeline.groups[gi - 1].isPast || timeline.groups[gi - 1].isToday);

                  return (
                    <div key={group.dateKey}>
                      {showNowDivider && (
                        <div className="flex items-center gap-2 py-3">
                          <div className="flex-1 h-px bg-blue-400" />
                          <span className="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-full border border-blue-200">
                            СЕЙЧАС
                          </span>
                          <div className="flex-1 h-px bg-blue-400" />
                        </div>
                      )}

                      {/* Date header */}
                      <div className={`flex items-center gap-2 pt-3 pb-1 px-1 ${group.isToday ? 'text-blue-700' : group.isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                        <span className={`text-xs font-semibold ${group.isToday ? 'text-blue-600' : ''}`}>
                          {group.dateLabel}
                        </span>
                        {group.isToday && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                      </div>

                      {/* Items for this date */}
                      <div className="space-y-1.5">
                        {group.items.map(item => (
                          <div key={item.id}>
                            <Card className={`overflow-hidden transition-all duration-300 ${
                              item.isPlanned
                                ? (confirmingIds.has(item.originalPlanned?.id || '')
                                    ? 'border-solid border-emerald-400 bg-emerald-50/40'
                                    : 'border-dashed border-amber-300 bg-amber-50/30')
                                : item.isGap
                                  ? 'border-red-300 bg-red-50/30'
                                  : ''
                            }`}>
                              <CardContent className="p-0">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 ml-1"
                                    style={{ backgroundColor: item.isPlanned && item.source === 'debt' ? '#EF444420' : (item.category_color || (item.isPlanned ? '#F59E0B' : '#6B7280')) + '20' }}>
                                    <Icon name={
                                      item.isPlanned && item.source === 'debt'
                                        ? (item.debt_type === 'mortgage' ? 'Home' : item.debt_type === 'car_loan' ? 'Car' : 'Landmark')
                                        : (item.category_icon || (item.type === 'income' ? 'TrendingUp' : 'TrendingDown'))
                                    } size={18} style={{ color: item.isPlanned && item.source === 'debt' ? '#EF4444' : (item.category_color || (item.isPlanned ? '#F59E0B' : '#6B7280')) }} />
                                  </div>
                                  <div className="flex-1 px-2 py-1.5 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm font-medium truncate">{item.description}</span>
                                      {item.isPlanned && (
                                        <Badge variant="outline" className="text-[10px] px-1 py-0 border-amber-400 text-amber-600">
                                          {item.source === 'debt' ? 'долг' : 'регуляр.'}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                      {item.category_name && <span>{item.category_name}</span>}
                                      {item.bank_name && <span>{item.bank_name}</span>}
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0 pr-1">
                                    <p className={`font-bold text-sm ${item.type === 'income' ? 'text-green-600' : 'text-red-600'} ${item.isPlanned && !confirmingIds.has(item.originalPlanned?.id || '') ? 'opacity-60' : ''}`}>
                                      {item.type === 'income' ? '+' : '−'}{formatMoney(item.amount)} ₽
                                    </p>
                                    <p className={`text-[10px] font-medium ${item.isGap ? 'text-red-600 font-bold' : 'text-muted-foreground'}`}>
                                      → {formatMoney(item.runningBalance)} ₽
                                    </p>
                                  </div>
                                  {/* Action buttons */}
                                  {item.isPlanned && item.originalPlanned ? (
                                    <Button variant="ghost" size="sm"
                                      className={`mr-1 p-0 h-8 w-8 transition-all duration-300 ${confirmingIds.has(item.originalPlanned.id) ? 'text-emerald-600 scale-110' : 'text-gray-400 hover:text-emerald-600'}`}
                                      title="Подтвердить"
                                      disabled={confirmingIds.has(item.originalPlanned.id)}
                                      onClick={() => confirmPlanned(item.originalPlanned!)}>
                                      <Icon name={confirmingIds.has(item.originalPlanned.id) ? "CheckSquare" : "Square"} size={18} />
                                    </Button>
                                  ) : item.originalTx ? (
                                    <div className="flex flex-shrink-0">
                                      <Button variant="ghost" size="sm" className="p-0 h-7 w-7 text-gray-400 hover:text-blue-500"
                                        onClick={(e) => { e.stopPropagation(); openEditTx(item.originalTx!); }}>
                                        <Icon name="Pencil" size={13} />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="mr-1 p-0 h-7 w-7 text-gray-400 hover:text-red-500"
                                        onClick={(e) => { e.stopPropagation(); deleteTransaction(item.originalTx!.id); }}>
                                        <Icon name="Trash2" size={13} />
                                      </Button>
                                    </div>
                                  ) : null}
                                </div>
                              </CardContent>
                            </Card>
                            {/* Cash gap warning inline */}
                            {item.isGap && item.runningBalance < 0 && (
                              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-red-600 font-medium">
                                <Icon name="AlertTriangle" size={12} />
                                <span>Кассовый разрыв! Недостаточно средств</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* End of month forecast */}
                <div className="flex items-center gap-2 pt-4 pb-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] text-muted-foreground px-2">конец месяца</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <Card className={`border-2 ${
                  timeline.groups.length > 0 && timeline.groups[timeline.groups.length - 1].items[timeline.groups[timeline.groups.length - 1].items.length - 1]?.runningBalance >= 0
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-red-200 bg-red-50/50'
                }`}>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Прогноз баланса на конец месяца</p>
                    <p className={`text-xl font-bold ${
                      (timeline.groups.length > 0 && timeline.groups[timeline.groups.length - 1].items[timeline.groups[timeline.groups.length - 1].items.length - 1]?.runningBalance >= 0)
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }`}>
                      {formatMoney(
                        timeline.groups.length > 0
                          ? timeline.groups[timeline.groups.length - 1].items[timeline.groups[timeline.groups.length - 1].items.length - 1]?.runningBalance || 0
                          : accountBalance
                      )} ₽
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
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

      <AlertDialog open={cashGapWarning?.show === true} onOpenChange={(open) => { if (!open) setCashGapWarning(null); }}>
        <AlertDialogContent className="max-w-sm z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={20} className="text-red-500" />
              Внимание: кассовый разрыв!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Этот расход приведёт к отрицательному балансу{' '}
              <span className="font-bold text-red-600">
                {cashGapWarning ? formatMoney(cashGapWarning.gapAmount) : 0} ₽
              </span>{' '}
              на дату{' '}
              <span className="font-bold">{cashGapWarning?.gapDate}</span>.
              {' '}Это значит, что на счетах может не хватить средств для покрытия всех расходов.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCashGapWarning(null)}>
              Отменить
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                const warning = cashGapWarning;
                setCashGapWarning(null);
                if (warning?.action === 'add') {
                  executeAddTransaction();
                } else if (warning?.action === 'edit') {
                  executeUpdateTransaction();
                } else if (warning?.action === 'confirm' && warning.confirmData) {
                  executeConfirmPlanned(warning.confirmData);
                }
              }}
            >
              Всё равно добавить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}