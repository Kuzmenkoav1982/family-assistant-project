import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import type {
  Transaction, PlannedItem, Category, BudgetItem, CashGapWarning, TimelineData,
} from '@/data/financeBudgetTypes';
import { API, MONTH_NAMES, getHeaders, getCurrentMonth } from '@/data/financeBudgetTypes';

export default function useFinanceBudget() {
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
  const [cashGapWarning, setCashGapWarning] = useState<CashGapWarning | null>(null);

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

  const timeline = useMemo<TimelineData>(() => {
    type TItem = {
      id: string; date: string; dateStr: string; amount: number; type: string;
      description: string; isPlanned: boolean; source?: 'recurring' | 'debt';
      debt_type?: string; bank_name?: string;
      category_name: string | null; category_icon: string | null;
      category_color: string | null; account_name: string | null;
      originalPlanned?: PlannedItem; originalTx?: Transaction;
    };

    const items: TItem[] = [];

    plannedItems
      .filter(p => txFilter === 'all' || p.type === txFilter)
      .forEach(p => items.push({
        id: 'p_' + p.id, date: p.date,
        dateStr: new Date(p.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        amount: p.amount, type: p.type,
        description: p.description || 'Платёж',
        isPlanned: true, source: p.source,
        debt_type: p.debt_type, bank_name: p.bank_name,
        category_name: p.category_name, category_icon: p.category_icon,
        category_color: p.category_color, account_name: p.account_name,
        originalPlanned: p,
      }));

    transactions
      .filter(t => txFilter === 'all' || t.type === txFilter)
      .forEach(tx => items.push({
        id: 'tx_' + tx.id, date: tx.date,
        dateStr: new Date(tx.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        amount: tx.amount, type: tx.type,
        description: tx.description || tx.category_name || (tx.type === 'income' ? 'Доход' : 'Расход'),
        isPlanned: false,
        category_name: tx.category_name, category_icon: tx.category_icon,
        category_color: tx.category_color, account_name: tx.account_name,
        originalTx: tx,
      }));

    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let balance = accountBalance;
    const today = new Date().toISOString().split('T')[0];
    let cashGap: { date: string; amount: number } | null = null;

    const withBalance = items.map((item) => {
      if (item.type === 'income') balance += item.amount;
      else balance -= item.amount;
      const runningBalance = balance;
      const isGap = runningBalance < 0;
      if (isGap && !cashGap) cashGap = { date: item.dateStr, amount: runningBalance };
      return { ...item, runningBalance, isGap };
    });

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

  const checkCashGap = (
    newAmount: number, newDate: string, newType: string, editTxId?: string
  ): { willCauseGap: boolean; gapDate: string; gapAmount: number } => {
    type SimItem = { date: string; amount: number; type: string; id: string };
    const items: SimItem[] = [];
    plannedItems.forEach(p => items.push({ id: 'p_' + p.id, date: p.date, amount: p.amount, type: p.type }));
    transactions.forEach(tx => {
      if (editTxId && tx.id === editTxId) {
        items.push({ id: 'tx_' + tx.id, date: newDate, amount: newAmount, type: newType });
      } else {
        items.push({ id: 'tx_' + tx.id, date: tx.date, amount: tx.amount, type: tx.type });
      }
    });
    if (!editTxId) items.push({ id: 'hypothetical_new', date: newDate, amount: newAmount, type: newType });
    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let balance = accountBalance;
    for (const item of items) {
      if (item.type === 'income') balance += item.amount;
      else balance -= item.amount;
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
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        action: 'add_transaction', type: txType,
        amount: parseFloat(txAmount), description: txDesc,
        category_id: txCategoryId || null, date: txDate
      })
    });
    setSaving(false);
    if (res.ok) {
      toast.success(txType === 'income' ? 'Доход добавлен' : 'Расход добавлен');
      setShowAddTx(false); setTxAmount(''); setTxDesc(''); setTxCategoryId('');
      loadTransactions(); loadBudgets(); loadHistory();
    } else {
      toast.error('Ошибка при сохранении');
    }
  };

  const executeUpdateTransaction = async () => {
    if (!editTx) return;
    setSaving(true);
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        action: 'update_transaction', id: editTx.id,
        amount: parseFloat(txAmount), description: txDesc,
        category_id: txCategoryId || null, date: txDate
      })
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Сохранено');
      setEditTx(null); setTxAmount(''); setTxDesc(''); setTxCategoryId('');
      loadTransactions(); loadBudgets(); loadHistory();
    } else {
      toast.error('Ошибка');
    }
  };

  const executeConfirmPlanned = async (item: PlannedItem) => {
    if (confirmingIds.has(item.id)) return;
    setConfirmingIds(prev => new Set(prev).add(item.id));
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        action: 'add_transaction', type: item.type,
        amount: item.amount, description: item.description || 'Платёж',
        category_id: null, date: item.date
      })
    });
    if (res.ok) {
      toast.success('Операция подтверждена');
      setTimeout(() => {
        loadTransactions(); loadBudgets(); loadHistory();
        setConfirmingIds(prev => { const next = new Set(prev); next.delete(item.id); return next; });
      }, 600);
    } else {
      toast.error('Ошибка при подтверждении');
      setConfirmingIds(prev => { const next = new Set(prev); next.delete(item.id); return next; });
    }
  };

  const confirmPlanned = async (item: PlannedItem) => {
    if (item.type === 'expense') {
      const gap = checkCashGap(item.amount, item.date, item.type);
      if (gap.willCauseGap) {
        setCashGapWarning({ show: true, gapDate: gap.gapDate, gapAmount: gap.gapAmount, action: 'confirm', confirmData: item });
        return;
      }
    }
    executeConfirmPlanned(item);
  };

  const addTransaction = async () => {
    if (!txAmount || parseFloat(txAmount) <= 0) { toast.error('Укажите сумму'); return; }
    if (txType === 'expense') {
      const gap = checkCashGap(parseFloat(txAmount), txDate, txType);
      if (gap.willCauseGap) {
        setCashGapWarning({ show: true, gapDate: gap.gapDate, gapAmount: gap.gapAmount, action: 'add' });
        return;
      }
    }
    executeAddTransaction();
  };

  const deleteTransaction = async (id: string) => {
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'delete_transaction', id })
    });
    if (res.ok) { toast.success('Удалено'); loadTransactions(); loadBudgets(); loadHistory(); }
  };

  const updateTransaction = async () => {
    if (!editTx) return;
    if (!txAmount || parseFloat(txAmount) <= 0) { toast.error('Укажите сумму'); return; }
    if (editTx.type === 'expense') {
      const gap = checkCashGap(parseFloat(txAmount), txDate, editTx.type, editTx.id);
      if (gap.willCauseGap) {
        setCashGapWarning({ show: true, gapDate: gap.gapDate, gapAmount: gap.gapAmount, action: 'edit' });
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
    if (!budgetCategoryId || !budgetAmount || parseFloat(budgetAmount) <= 0) { toast.error('Заполните все поля'); return; }
    setSaving(true);
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'set_budget', category_id: budgetCategoryId, planned_amount: parseFloat(budgetAmount), month })
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editBudget ? 'Лимит обновлён' : 'Лимит установлен');
      closeBudgetDialog(); loadBudgets();
    }
  };

  const deleteBudget = async (id: string) => {
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'delete_budget', id })
    });
    if (res.ok) { toast.success('Лимит удалён'); loadBudgets(); }
    else toast.error('Ошибка при удалении');
  };

  const openEditBudget = (b: BudgetItem) => {
    setBudgetCategoryId(b.category_id || '');
    setBudgetAmount(String(b.planned));
    setEditBudget(b);
    setShowBudgetDialog(true);
  };

  const closeBudgetDialog = () => {
    setShowBudgetDialog(false); setEditBudget(null); setBudgetAmount(''); setBudgetCategoryId('');
  };

  const filteredCategories = categories.filter(c =>
    txType === 'income' ? c.type === 'income' : c.type === 'expense'
  );
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const monthLabel = new Date(month + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const prevMonth = () => {
    const d = new Date(month + '-01'); d.setMonth(d.getMonth() - 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const nextMonth = () => {
    const d = new Date(month + '-01'); d.setMonth(d.getMonth() + 1);
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

  const formatMoney = (n: number) => n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return {
    tab, setTab, transactions, categories, budgets, loading,
    sumIncome, sumExpense, plannedItems, planIncome, planExpense,
    totalPlanned, totalSpent, month, accountBalance, accountCount,
    txFilter, setTxFilter,
    showAddTx, setShowAddTx, txType, setTxType,
    txAmount, setTxAmount, txDesc, setTxDesc,
    txCategoryId, setTxCategoryId, txDate, setTxDate, saving,
    showBudgetDialog, setShowBudgetDialog,
    budgetCategoryId, setBudgetCategoryId,
    budgetAmount, setBudgetAmount,
    exporting, editTx, setEditTx, editBudget,
    analyticsRef, historyData, confirmingIds,
    cashGapWarning, setCashGapWarning,
    pieData, budgetChartData, timeline,
    filteredCategories, expenseCategories, monthLabel,
    prevMonth, nextMonth, exportPDF,
    addTransaction, deleteTransaction, updateTransaction,
    openEditTx, confirmPlanned, saveBudget, deleteBudget,
    openEditBudget, closeBudgetDialog,
    executeAddTransaction, executeUpdateTransaction, executeConfirmPlanned,
  };
}
