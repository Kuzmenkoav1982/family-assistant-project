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
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { FinanceAccountsInstructions } from '@/components/finance/FinanceInstructions';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_ACCOUNTS } from '@/data/demoFinanceData';

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

interface Account {
  id: string;
  name: string;
  account_type: string;
  bank_name: string;
  last4: string;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  is_active: boolean;
}

function getHeaders() {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': localStorage.getItem('authToken') || '' };
}

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const ACCOUNT_TYPES = [
  { value: 'card', label: 'Банковская карта', icon: 'CreditCard' },
  { value: 'debit', label: 'Дебетовая карта', icon: 'CreditCard' },
  { value: 'credit_card', label: 'Кредитная карта', icon: 'CreditCard' },
  { value: 'account', label: 'Счёт в банке', icon: 'Building2' },
  { value: 'deposit', label: 'Вклад', icon: 'PiggyBank' },
  { value: 'cash', label: 'Наличные', icon: 'Banknote' },
  { value: 'ewallet', label: 'Электронный кошелёк', icon: 'Smartphone' },
];

const COLORS = [
  '#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#64748B',
];

const BANKS = [
  'Сбер', 'Т-Банк', 'Альфа-Банк', 'ВТБ', 'Газпромбанк',
  'Райффайзен', 'Совкомбанк', 'ПСБ', 'Россельхозбанк', 'Другой',
];

function getTypeLabel(type: string) {
  return ACCOUNT_TYPES.find(t => t.value === type)?.label || 'Счёт';
}

export default function FinanceAccounts() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<Account | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', account_type: 'card', bank_name: '', last4: '',
    balance: '', color: '#3B82F6', icon: 'CreditCard'
  });

  const loadAccounts = useCallback(async () => {
    const res = await fetch(`${API}?section=accounts`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setAccounts(data.accounts || []);
      setTotalBalance(data.total_balance || 0);
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setAccounts(DEMO_ACCOUNTS as Account[]);
      setTotalBalance(DEMO_ACCOUNTS.filter(a => a.is_active).reduce((s, a) => s + a.balance, 0));
      setLoading(false);
      return;
    }
    loadAccounts().finally(() => setLoading(false));
  }, [isDemoMode, loadAccounts]);

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

  const addAccount = async () => {
    if (!form.name.trim()) { toast.error('Укажите название'); return; }
    setSaving(true);
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        action: 'add_account', ...form,
        balance: form.balance ? parseFloat(form.balance) : 0
      })
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Счёт добавлен');
      setShowAdd(false);
      resetForm();
      loadAccounts();
    } else { toast.error('Ошибка'); }
  };

  const updateAccount = async () => {
    if (!showEdit) return;
    setSaving(true);
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        action: 'update_account', id: showEdit.id,
        name: form.name, bank_name: form.bank_name, last4: form.last4,
        balance: form.balance ? parseFloat(form.balance) : 0,
        color: form.color, icon: form.icon
      })
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Сохранено');
      setShowEdit(null);
      resetForm();
      loadAccounts();
    } else { toast.error('Ошибка'); }
  };

  const deleteAccount = async (id: string) => {
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'delete_account', id })
    });
    if (res.ok) {
      toast.success('Удалено');
      setShowEdit(null);
      loadAccounts();
    }
  };

  const toggleActive = async (acc: Account) => {
    await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'update_account', id: acc.id, is_active: !acc.is_active })
    });
    loadAccounts();
  };

  const resetForm = () => {
    setForm({ name: '', account_type: 'card', bank_name: '', last4: '', balance: '', color: '#3B82F6', icon: 'CreditCard' });
  };

  const openEdit = (acc: Account) => {
    setForm({
      name: acc.name, account_type: acc.account_type, bank_name: acc.bank_name || '',
      last4: acc.last4 || '', balance: String(acc.balance), color: acc.color, icon: acc.icon
    });
    setShowEdit(acc);
  };

  const activeAccounts = accounts.filter(a => a.is_active);
  const inactiveAccounts = accounts.filter(a => !a.is_active);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <SectionHero
          title="Счета и карты"
          subtitle="Банковские карты, счета и кошельки"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/ccb6f09e-cd0b-4725-ada5-75300dace1fd.jpg"
          backPath="/finance"
          rightAction={
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
              onClick={() => { resetForm(); setShowAdd(true); }}>
              <Icon name="Plus" size={16} className="mr-1" /> Добавить
            </Button>
          }
        />

        <FinanceAccountsInstructions />

        {accounts.length > 0 && (
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-blue-200 text-sm">Общий баланс</p>
              <p className="text-3xl font-bold mt-1">{formatMoney(totalBalance)} ₽</p>
              <p className="text-blue-200 text-xs mt-1">{activeAccounts.length} активных счетов</p>
            </CardContent>
          </Card>
        )}

        {accounts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="CreditCard" size={48} className="mx-auto mb-3 text-blue-300" />
            <p className="font-medium text-foreground">Нет счетов</p>
            <p className="text-sm mt-1">Добавьте банковские карты, счета или наличные</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAccounts.map(acc => (
              <Card key={acc.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                onClick={() => openEdit(acc)}>
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="w-16 h-16 flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: acc.color + '15' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: acc.color }}>
                        <Icon name={acc.icon || 'CreditCard'} size={20} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 px-3 py-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm truncate">{acc.name}</span>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">{getTypeLabel(acc.account_type)}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {acc.bank_name && <span>{acc.bank_name}</span>}
                        {acc.last4 && <span>•••• {acc.last4}</span>}
                      </div>
                    </div>
                    <div className="pr-3 text-right">
                      <p className={`font-bold ${acc.balance >= 0 ? 'text-foreground' : 'text-red-600'}`}>
                        {formatMoney(acc.balance)} ₽
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {inactiveAccounts.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide pt-2">Скрытые</p>
                {inactiveAccounts.map(acc => (
                  <Card key={acc.id} className="overflow-hidden opacity-50 cursor-pointer hover:opacity-75 transition-all"
                    onClick={() => openEdit(acc)}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: acc.color + '30' }}>
                        <Icon name={acc.icon || 'CreditCard'} size={16} style={{ color: acc.color }} />
                      </div>
                      <span className="text-sm flex-1 truncate">{acc.name}</span>
                      <span className="text-sm text-muted-foreground">{formatMoney(acc.balance)} ₽</span>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Новый счёт</DialogTitle></DialogHeader>
          <AccountForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button onClick={addAccount} disabled={saving} className="bg-blue-600 hover:bg-blue-700 w-full">
              {saving ? 'Сохраняю...' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showEdit} onOpenChange={() => { setShowEdit(null); resetForm(); }}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Редактировать счёт</DialogTitle></DialogHeader>
          <AccountForm form={form} setForm={setForm} />
          <DialogFooter className="flex-col gap-2">
            <Button onClick={updateAccount} disabled={saving} className="bg-blue-600 hover:bg-blue-700 w-full">
              {saving ? 'Сохраняю...' : 'Сохранить'}
            </Button>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => showEdit && toggleActive(showEdit)}>
                <Icon name={showEdit?.is_active ? 'EyeOff' : 'Eye'} size={14} className="mr-1" />
                {showEdit?.is_active ? 'Скрыть' : 'Показать'}
              </Button>
              <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => showEdit && deleteAccount(showEdit.id)}>
                <Icon name="Trash2" size={14} className="mr-1" /> Удалить
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccountForm({ form, setForm }: {
  form: { name: string; account_type: string; bank_name: string; last4: string; balance: string; color: string; icon: string };
  setForm: (f: typeof form) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-1 block">Тип</label>
        <Select value={form.account_type} onValueChange={v => {
          const t = ACCOUNT_TYPES.find(at => at.value === v);
          setForm({ ...form, account_type: v, icon: t?.icon || 'CreditCard' });
        }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ACCOUNT_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>
                <span className="flex items-center gap-2">
                  <Icon name={t.icon} size={14} /> {t.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Название</label>
        <Input placeholder="Моя карта Тинькофф" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Банк</label>
        <Select value={form.bank_name} onValueChange={v => setForm({ ...form, bank_name: v })}>
          <SelectTrigger><SelectValue placeholder="Выберите банк" /></SelectTrigger>
          <SelectContent>
            {BANKS.map(b => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Последние 4 цифры</label>
          <Input placeholder="1234" maxLength={4} value={form.last4} onChange={e => setForm({ ...form, last4: e.target.value.replace(/\D/g, '') })} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Баланс, ₽</label>
          <Input type="number" inputMode="decimal" placeholder="0" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Цвет</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} onClick={() => setForm({ ...form, color: c })}
              className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}