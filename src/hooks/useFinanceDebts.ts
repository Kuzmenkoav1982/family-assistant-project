import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Debt, Payment, DebtFormState } from '@/data/financeDebtsTypes';
import { API, getHeaders, isCC, INITIAL_FORM } from '@/data/financeDebtsTypes';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_DEBTS, DEMO_PAYMENTS } from '@/data/demoFinanceData';

export default function useFinanceDebts() {
  const { isDemoMode } = useDemoMode();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [totalMonthly, setTotalMonthly] = useState(0);

  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DebtFormState>({ ...INITIAL_FORM });

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
    if (isDemoMode) {
      setDebts(DEMO_DEBTS);
      setTotalRemaining(DEMO_DEBTS.reduce((s, d) => s + d.remaining_amount, 0));
      setTotalMonthly(DEMO_DEBTS.reduce((s, d) => s + d.monthly_payment, 0));
      setLoading(false);
      return;
    }
    loadDebts().finally(() => setLoading(false));
  }, [isDemoMode, loadDebts]);

  useEffect(() => {
    if (selectedDebt) {
      if (isDemoMode) {
        setPayments(DEMO_PAYMENTS[selectedDebt.id] || []);
        setSimPayment('');
        return;
      }
      loadPayments(selectedDebt.id);
      setSimPayment('');
    }
  }, [selectedDebt, isDemoMode, loadPayments]);

  const addDebt = async () => {
    const isCreditCard = form.debt_type === 'credit_card';
    if (!form.name.trim()) { toast.error('Укажите название'); return; }
    if (!isCreditCard && (!form.original_amount || parseFloat(form.original_amount) <= 0)) { toast.error('Укажите сумму'); return; }
    if (isCreditCard && (!form.credit_limit || parseFloat(form.credit_limit) <= 0)) { toast.error('Укажите кредитный лимит'); return; }
    setSaving(true);
    const body: Record<string, unknown> = {
      action: 'add_debt',
      debt_type: form.debt_type,
      name: form.name,
      creditor: isCreditCard ? (form.bank_name || form.creditor) : form.creditor,
      original_amount: isCreditCard ? parseFloat(form.credit_limit) || 0 : parseFloat(form.original_amount) || 0,
      remaining_amount: parseFloat(form.remaining_amount) || (isCreditCard ? 0 : parseFloat(form.original_amount) || 0),
      interest_rate: parseFloat(form.interest_rate) || 0,
      monthly_payment: parseFloat(form.monthly_payment) || 0,
      next_payment_date: form.next_payment_date || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      notes: form.notes,
      show_in_budget: form.show_in_budget,
      is_priority: form.is_priority,
    };
    if (isCreditCard) {
      body.credit_limit = parseFloat(form.credit_limit) || 0;
      body.grace_period_days = form.grace_period_days ? parseInt(form.grace_period_days) : null;
      body.grace_period_end = form.grace_period_end || null;
      body.grace_amount = form.grace_amount ? parseFloat(form.grace_amount) : null;
      body.min_payment_pct = form.min_payment_pct ? parseFloat(form.min_payment_pct) : null;
      body.bank_name = form.bank_name || null;
    }
    const res = await fetch(API, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) {
      toast.success('Долг добавлен');
      setShowAdd(false);
      setForm({ ...INITIAL_FORM });
      loadDebts();
    } else {
      toast.error('Ошибка при сохранении');
    }
  };

  const deleteDebt = async (id: string) => {
    const res = await fetch(API, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ action: 'delete_debt', id }) });
    if (res.ok) { toast.success('Долг удалён'); setSelectedDebt(null); loadDebts(); }
    else toast.error('Ошибка при удалении');
  };

  const addPayment = async () => {
    if (!selectedDebt || !payAmount || parseFloat(payAmount) <= 0) { toast.error('Укажите сумму'); return; }
    setSaving(true);
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        action: 'add_debt_payment', debt_id: selectedDebt.id,
        amount: parseFloat(payAmount), date: payDate, is_extra: payExtra, notes: payNotes,
      })
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Платёж внесён');
      setShowPayment(false); setPayAmount(''); setPayNotes(''); setPayExtra(false);
      loadDebts();
      loadPayments(selectedDebt.id);
      const updated = await fetch(`${API}?section=debts`, { headers: getHeaders() });
      if (updated.ok) {
        const data = await updated.json();
        const fresh = (data.debts || []).find((d: Debt) => d.id === selectedDebt.id);
        if (fresh) setSelectedDebt(fresh);
      }
    } else toast.error('Ошибка');
  };

  const openEditDebt = (debt: Debt) => {
    setForm({
      name: debt.name, debt_type: debt.debt_type, creditor: debt.creditor,
      original_amount: String(debt.original_amount), remaining_amount: String(debt.remaining_amount),
      interest_rate: String(debt.interest_rate || ''), monthly_payment: String(debt.monthly_payment || ''),
      next_payment_date: debt.next_payment_date ? debt.next_payment_date.split('T')[0] : '',
      start_date: debt.start_date ? debt.start_date.split('T')[0] : '',
      end_date: debt.end_date ? debt.end_date.split('T')[0] : '',
      notes: debt.notes || '',
      credit_limit: String(debt.credit_limit || ''),
      grace_period_days: String(debt.grace_period_days || ''),
      grace_period_end: debt.grace_period_end ? debt.grace_period_end.split('T')[0] : '',
      grace_amount: String(debt.grace_amount || ''),
      min_payment_pct: String(debt.min_payment_pct || ''),
      bank_name: debt.bank_name || '',
      show_in_budget: debt.show_in_budget || false,
      is_priority: debt.is_priority || false,
    });
    setEditDebt(debt);
  };

  const updateDebt = async () => {
    if (!editDebt) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      action: 'update_debt', id: editDebt.id,
      name: form.name, creditor: form.creditor,
      remaining_amount: parseFloat(form.remaining_amount) || editDebt.remaining_amount,
      interest_rate: parseFloat(form.interest_rate) || 0,
      monthly_payment: parseFloat(form.monthly_payment) || 0,
      next_payment_date: form.next_payment_date || null,
      notes: form.notes,
      show_in_budget: form.show_in_budget,
      is_priority: form.is_priority,
    };
    if (isCC(editDebt.debt_type)) {
      body.credit_limit = parseFloat(form.credit_limit) || editDebt.credit_limit;
      body.grace_period_days = form.grace_period_days ? parseInt(form.grace_period_days) : null;
      body.grace_period_end = form.grace_period_end || null;
      body.grace_amount = form.grace_amount ? parseFloat(form.grace_amount) : null;
      body.min_payment_pct = form.min_payment_pct ? parseFloat(form.min_payment_pct) : null;
      body.bank_name = form.bank_name || null;
    }
    const res = await fetch(API, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) {
      toast.success('Сохранено');
      setEditDebt(null);
      loadDebts();
      const updated = await fetch(`${API}?section=debts`, { headers: getHeaders() });
      if (updated.ok) {
        const data = await updated.json();
        const fresh = (data.debts || []).find((d: Debt) => d.id === selectedDebt?.id);
        if (fresh) setSelectedDebt(fresh);
      }
    } else toast.error('Ошибка');
  };

  const markPaid = async (id: string) => {
    const res = await fetch(API, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ action: 'mark_debt_paid', id }) });
    if (res.ok) { toast.success('Отмечен как погашенный'); setSelectedDebt(null); loadDebts(); }
    else toast.error('Ошибка');
  };

  return {
    debts, loading, totalRemaining, totalMonthly,
    showAdd, setShowAdd, saving, form, setForm,
    selectedDebt, setSelectedDebt, payments,
    showPayment, setShowPayment,
    payAmount, setPayAmount, payDate, setPayDate,
    payExtra, setPayExtra, payNotes, setPayNotes,
    editDebt, setEditDebt, simPayment, setSimPayment,
    addDebt, deleteDebt, addPayment, openEditDebt, updateDebt, markPaid,
  };
}