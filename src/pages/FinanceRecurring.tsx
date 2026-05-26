import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { FinanceRecurringInstructions } from '@/components/finance/FinanceInstructions';
import {
  getHeaders, monthlyAmount, emptyForm,
  type RecurringItem, type Category, type FormState,
} from '@/components/finance/recurring/recurringUtils';
import { ActiveRecurringCard, InactiveRecurringCard } from '@/components/finance/recurring/RecurringItemCard';
import RecurringSummaryCards from '@/components/finance/recurring/RecurringSummaryCards';
import RecurringDialog from '@/components/finance/recurring/RecurringDialog';
import { PRESETS } from '@/components/finance/recurring/recurringUtils';

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';
const HERO_IMG = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/33db6959-0ba8-4234-ae74-71536adbd80b.jpg';
const BG = 'bg-gradient-to-b from-emerald-50 to-white dark:from-gray-950 dark:to-gray-900';

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

  useEffect(() => { loadData().finally(() => setLoading(false)); }, [loadData]);

  const isOwner = useIsFamilyOwner();

  if (!isOwner) {
    return (
      <SectionPageFrame title="Регулярные платежи" backPath="/finance" backgroundClass={BG}>
        <div className="flex items-center justify-center py-24 text-center">
          <div>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="Lock" size={32} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold mb-2">Доступ ограничен</h2>
            <p className="text-sm text-muted-foreground mb-4">Этот раздел доступен только владельцу семьи</p>
            <Button onClick={() => navigate('/finance')}>Вернуться к финансам</Button>
          </div>
        </div>
      </SectionPageFrame>
    );
  }

  const openAdd = () => { setEditingItem(null); setForm({ ...emptyForm }); setShowDialog(true); };

  const openEdit = (item: RecurringItem) => {
    setEditingItem(item);
    setForm({
      type: (item.type as 'income' | 'expense') || 'expense',
      amount: String(item.amount),
      description: item.description,
      frequency: item.frequency,
      day_of_month: item.day_of_month ? String(item.day_of_month) : '',
      next_date: item.next_date || new Date().toISOString().split('T')[0],
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
      active_months: (form.frequency === 'quarterly' || form.frequency === 'yearly') && form.active_months.length > 0 ? form.active_months : null,
    };
    if (editingItem) { payload.action = 'update_recurring'; payload.id = editingItem.id; }
    else { payload.action = 'add_recurring'; }

    const res = await fetch(API, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) {
      toast.success(editingItem ? 'Сохранено' : 'Добавлено');
      setShowDialog(false);
      setEditingItem(null);
      setForm({ ...emptyForm });
      loadData();
    } else { toast.error('Ошибка сохранения'); }
  };

  const toggleActive = async (item: RecurringItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(API, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ action: 'update_recurring', id: item.id, is_active: !item.is_active }) });
    loadData();
  };

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(API, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ action: 'delete_recurring', id }) });
    toast.success('Удалено');
    loadData();
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setForm({ ...form, type: preset.type as 'income' | 'expense', description: preset.desc, frequency: (preset as { freq?: string }).freq || 'monthly', active_months: [] });
  };

  const activeItems = items.filter(i => i.is_active);
  const inactiveItems = items.filter(i => !i.is_active);
  const incomeItems = activeItems.filter(i => i.type === 'income');
  const expenseItems = activeItems.filter(i => i.type === 'expense');
  const totalIncome = incomeItems.reduce((s, i) => s + monthlyAmount(i), 0);
  const totalExpense = expenseItems.reduce((s, i) => s + monthlyAmount(i), 0);

  const addBtn = (
    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openAdd}>
      <Icon name="Plus" size={16} className="mr-1" /> Добавить
    </Button>
  );

  if (loading) {
    return (
      <SectionPageFrame title="Регулярные платежи" backPath="/finance/budget" imageUrl={HERO_IMG} backgroundClass={BG}>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      </SectionPageFrame>
    );
  }

  return (
    <>
      <SectionPageFrame
        title="Регулярные платежи"
        subtitle="Подписки, коммуналка и автоплатежи"
        backPath="/finance/budget"
        imageUrl={HERO_IMG}
        rightAction={addBtn}
        backgroundClass={BG}
      >
        <FinanceRecurringInstructions />

        {activeItems.length > 0 && (
          <RecurringSummaryCards
            incomeItems={incomeItems}
            expenseItems={expenseItems}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
          />
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
              <ActiveRecurringCard key={item.id} item={item} onEdit={openEdit} onToggle={toggleActive} onDelete={deleteItem} />
            ))}
            {inactiveItems.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide pt-2">Приостановлены</p>
                {inactiveItems.map(item => (
                  <InactiveRecurringCard key={item.id} item={item} onEdit={openEdit} onToggle={toggleActive} onDelete={deleteItem} />
                ))}
              </>
            )}
          </div>
        )}
      </SectionPageFrame>

      <RecurringDialog
        open={showDialog}
        onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingItem(null); setForm({ ...emptyForm }); } }}
        editingItem={editingItem}
        form={form}
        setForm={setForm}
        saving={saving}
        categories={categories}
        onSave={saveItem}
        onApplyPreset={applyPreset}
      />
    </>
  );
}