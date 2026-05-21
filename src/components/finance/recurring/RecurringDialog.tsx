import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import MonthPicker from './MonthPicker';
import { FREQ_LABELS, DAY_OF_WEEK_LABELS, PRESETS, formatMoney, type FormState, type RecurringItem, type Category } from './recurringUtils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: RecurringItem | null;
  form: FormState;
  setForm: (f: FormState) => void;
  saving: boolean;
  categories: Category[];
  onSave: () => void;
  onApplyPreset: (preset: typeof PRESETS[0]) => void;
}

export default function RecurringDialog({ open, onOpenChange, editingItem, form, setForm, saving, categories, onSave, onApplyPreset }: Props) {
  const filteredCategories = categories.filter(c => c.type === form.type);
  const showMonthPicker = form.frequency === 'quarterly' || form.frequency === 'yearly';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  <button key={p.label} onClick={() => onApplyPreset(p)}
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
                  {Object.entries(FREQ_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showMonthPicker && (
            <MonthPicker selected={form.active_months} onChange={months => setForm({ ...form, active_months: months })} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              {form.frequency === 'weekly' ? (
                <>
                  <label className="text-sm font-medium mb-1 block">День недели</label>
                  <Select value={form.day_of_month || ''} onValueChange={v => setForm({ ...form, day_of_month: v })}>
                    <SelectTrigger><SelectValue placeholder="Выбрать" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DAY_OF_WEEK_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
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

          <div>
            <label className="text-sm font-medium mb-1 block">Начиная с</label>
            <Input type="date" value={form.next_date} onChange={e => setForm({ ...form, next_date: e.target.value })} />
            <p className="text-[11px] text-muted-foreground mt-1">
              <Icon name="Info" size={11} className="inline mr-0.5" />
              Платёж не будет появляться в бюджете до этой даты
            </p>
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
          <Button onClick={onSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 w-full">
            {saving ? 'Сохраняю...' : (editingItem ? 'Сохранить' : 'Добавить')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
