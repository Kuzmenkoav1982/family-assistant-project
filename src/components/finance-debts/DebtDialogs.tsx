import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { Debt, DebtFormState } from '@/data/financeDebtsTypes';
import { DEBT_TYPES, isCC } from '@/data/financeDebtsTypes';

interface DebtDialogsProps {
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
  form: DebtFormState;
  setForm: React.Dispatch<React.SetStateAction<DebtFormState>>;
  saving: boolean;
  addDebt: () => void;
  editDebt: Debt | null;
  setEditDebt: (v: Debt | null) => void;
  updateDebt: () => void;
  showPayment: boolean;
  setShowPayment: (v: boolean) => void;
  payAmount: string;
  setPayAmount: (v: string) => void;
  payDate: string;
  setPayDate: (v: string) => void;
  payExtra: boolean;
  setPayExtra: (v: boolean) => void;
  payNotes: string;
  setPayNotes: (v: string) => void;
  addPayment: () => void;
  selectedDebt: Debt | null;
}

export default function DebtDialogs({
  showAdd, setShowAdd, form, setForm, saving, addDebt,
  editDebt, setEditDebt, updateDebt,
  showPayment, setShowPayment,
  payAmount, setPayAmount, payDate, setPayDate,
  payExtra, setPayExtra, payNotes, setPayNotes,
  addPayment, selectedDebt,
}: DebtDialogsProps) {
  return (
    <>
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Внести платёж</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Сумма, &#8381;</label>
              <Input type="number" inputMode="decimal" placeholder={selectedDebt?.monthly_payment ? String(selectedDebt.monthly_payment) : '0'}
                value={payAmount} onChange={e => setPayAmount(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Дата</label>
              <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={payExtra} onChange={e => setPayExtra(e.target.checked)} className="rounded border-gray-300" />
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
          <DialogHeader><DialogTitle>Редактировать долг</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Название</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <p className="text-[11px] text-muted-foreground mt-1">Как называете этот долг для себя, например «ВТБ кредитка»</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Кредитор / Банк</label>
              <Input value={form.creditor} onChange={e => setForm(f => ({ ...f, creditor: e.target.value }))} />
              <p className="text-[11px] text-muted-foreground mt-1">Название банка или человека, которому должны</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Остаток, &#8381;</label>
                <Input type="number" inputMode="decimal" value={form.remaining_amount}
                  onChange={e => setForm(f => ({ ...f, remaining_amount: e.target.value }))} />
                <p className="text-[11px] text-muted-foreground mt-1">Сколько осталось выплатить сейчас</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ставка, %</label>
                <Input type="number" inputMode="decimal" value={form.interest_rate}
                  onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} />
                <p className="text-[11px] text-muted-foreground mt-1">Годовая ставка из договора</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Платёж/мес, &#8381;</label>
              <Input type="number" inputMode="decimal" value={form.monthly_payment}
                onChange={e => setForm(f => ({ ...f, monthly_payment: e.target.value }))} />
              <p className="text-[11px] text-muted-foreground mt-1">Фиксированный ежемесячный платёж из графика платежей</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">След. платёж</label>
              <Input type="date" value={form.next_payment_date}
                onChange={e => setForm(f => ({ ...f, next_payment_date: e.target.value }))} />
              <p className="text-[11px] text-muted-foreground mt-1">Дата следующего обязательного платежа</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Заметка</label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <p className="text-[11px] text-muted-foreground mt-1">Любые важные детали для себя</p>
            </div>
            {editDebt && isCC(editDebt.debt_type) && (
              <>
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-orange-600 mb-2">Кредитная карта</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Банк</label>
                  <Input value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} />
                  <p className="text-[11px] text-muted-foreground mt-1">Название банка, выпустившего карту</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Кред. лимит, &#8381;</label>
                    <Input type="number" inputMode="decimal" value={form.credit_limit}
                      onChange={e => setForm(f => ({ ...f, credit_limit: e.target.value }))} />
                    <p className="text-[11px] text-muted-foreground mt-1">Максимум на карте</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Мин. платёж, %</label>
                    <Input type="number" inputMode="decimal" min="0" max="100" value={form.min_payment_pct}
                      onChange={e => setForm(f => ({ ...f, min_payment_pct: e.target.value }))} />
                    <p className="text-[11px] text-muted-foreground mt-1">Процент от долга, обычно 3–8% (смотрите в договоре)</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Льготный период, дн</label>
                    <Input type="number" inputMode="numeric" value={form.grace_period_days}
                      onChange={e => setForm(f => ({ ...f, grace_period_days: e.target.value }))} />
                    <p className="text-[11px] text-muted-foreground mt-1">Сколько дней без процентов (обычно 50–120)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Льготн. период до</label>
                    <Input type="date" value={form.grace_period_end}
                      onChange={e => setForm(f => ({ ...f, grace_period_end: e.target.value }))} />
                    <p className="text-[11px] text-muted-foreground mt-1">Конкретная дата окончания льготного периода</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Льготная задолж., &#8381;</label>
                  <Input type="number" inputMode="decimal" value={form.grace_amount}
                    onChange={e => setForm(f => ({ ...f, grace_amount: e.target.value }))} />
                  <p className="text-[11px] text-muted-foreground mt-1">Сумма, на которую сейчас действует льготный период (без процентов)</p>
                </div>
              </>
            )}
            <CheckboxField label="Показывать платёж в бюджете" checked={form.show_in_budget}
              onChange={() => setForm(f => ({ ...f, show_in_budget: !f.show_in_budget }))} iconName="Check" color="emerald" />
            <CheckboxField label="Приоритетный к выплате" checked={form.is_priority}
              onChange={() => setForm(f => ({ ...f, is_priority: !f.is_priority }))} iconName="Star" color="amber" iconSize={12} />
          </div>
          <DialogFooter>
            <Button onClick={updateDebt} disabled={saving} className="bg-rose-600 hover:bg-rose-700 w-full">
              {saving ? 'Сохраняю...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Новый долг</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Тип</label>
              <Select value={form.debt_type} onValueChange={v => setForm({ ...form, debt_type: v })}>
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
              <Input placeholder="Ипотека Сбербанк" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            {!isCC(form.debt_type) && (
              <div>
                <label className="text-sm font-medium mb-1 block">Кредитор</label>
                <Input placeholder="Банк / человек" value={form.creditor} onChange={e => setForm({ ...form, creditor: e.target.value })} />
              </div>
            )}
            {isCC(form.debt_type) ? (
              <CreditCardAddFields form={form} setForm={setForm} />
            ) : (
              <LoanAddFields form={form} setForm={setForm} />
            )}
            <CheckboxField label="Показывать платёж в бюджете" checked={form.show_in_budget}
              onChange={() => setForm({ ...form, show_in_budget: !form.show_in_budget })} iconName="Check" color="emerald" />
            <CheckboxField label="Приоритетный к выплате" checked={form.is_priority}
              onChange={() => setForm({ ...form, is_priority: !form.is_priority })} iconName="Star" color="amber" iconSize={12} />
          </div>
          <DialogFooter>
            <Button onClick={addDebt} disabled={saving} className="bg-rose-600 hover:bg-rose-700 w-full">
              {saving ? 'Сохраняю...' : 'Добавить долг'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CheckboxField({ label, checked, onChange, iconName, color, iconSize = 14 }: {
  label: string; checked: boolean; onChange: () => void; iconName: string; color: string; iconSize?: number;
}) {
  const bg = checked ? (color === 'emerald' ? 'bg-emerald-600 border-emerald-600' : 'bg-amber-500 border-amber-500') : 'border-gray-300';
  return (
    <label className="flex items-center gap-2 cursor-pointer py-1">
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${bg}`} onClick={onChange}>
        {checked && <Icon name={iconName} size={iconSize} className="text-white" />}
      </div>
      <span className="text-sm" onClick={onChange}>{label}</span>
    </label>
  );
}

function CreditCardAddFields({ form, setForm }: { form: DebtFormState; setForm: (f: DebtFormState) => void }) {
  return (
    <>
      <div>
        <label className="text-sm font-medium mb-1 block">Банк</label>
        <Input placeholder="Т-Банк, Сбер, Альфа..." value={form.bank_name}
          onChange={e => setForm({ ...form, bank_name: e.target.value })} />
        <p className="text-[11px] text-muted-foreground mt-1">Название банка, выпустившего карту</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Кредитный лимит, &#8381;</label>
          <Input type="number" inputMode="decimal" placeholder="300000" value={form.credit_limit}
            onChange={e => setForm({ ...form, credit_limit: e.target.value })} />
          <p className="text-[11px] text-muted-foreground mt-1">Максимальный лимит по карте</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Задолженность, &#8381;</label>
          <Input type="number" inputMode="decimal" placeholder="94675" value={form.remaining_amount}
            onChange={e => setForm({ ...form, remaining_amount: e.target.value })} />
          <p className="text-[11px] text-muted-foreground mt-1">Сколько потрачено и не погашено</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Ставка, % годовых</label>
          <Input type="number" inputMode="decimal" placeholder="59" value={form.interest_rate}
            onChange={e => setForm({ ...form, interest_rate: e.target.value })} />
          <p className="text-[11px] text-muted-foreground mt-1">Ставка при выходе из льготного периода</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Мин. платёж, %</label>
          <Input type="number" inputMode="decimal" placeholder="3" min="0" max="100" value={form.min_payment_pct}
            onChange={e => setForm({ ...form, min_payment_pct: e.target.value })} />
          <p className="text-[11px] text-muted-foreground mt-1">Процент от долга, обычно 3–8% (в договоре)</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Льготный период, дн</label>
          <Input type="number" inputMode="numeric" placeholder="55" value={form.grace_period_days}
            onChange={e => setForm({ ...form, grace_period_days: e.target.value })} />
          <p className="text-[11px] text-muted-foreground mt-1">Сколько дней без процентов (обычно 50–120)</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Льготн. период до</label>
          <Input type="date" value={form.grace_period_end}
            onChange={e => setForm({ ...form, grace_period_end: e.target.value })} />
          <p className="text-[11px] text-muted-foreground mt-1">Крайняя дата погашения без процентов</p>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Льготная задолженность, &#8381;</label>
        <Input type="number" inputMode="decimal" placeholder="Сумма без процентов" value={form.grace_amount}
          onChange={e => setForm({ ...form, grace_amount: e.target.value })} />
        <p className="text-[11px] text-muted-foreground mt-1">Часть долга, на которую сейчас действует беспроцентный период</p>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Мин. платёж/мес, &#8381;</label>
        <Input type="number" inputMode="decimal" placeholder="Если фиксированный" value={form.monthly_payment}
          onChange={e => setForm({ ...form, monthly_payment: e.target.value })} />
        <p className="text-[11px] text-muted-foreground mt-1">Заполните, если банк требует фиксированную сумму (не процент)</p>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">След. платёж</label>
        <Input type="date" value={form.next_payment_date} onChange={e => setForm({ ...form, next_payment_date: e.target.value })} />
        <p className="text-[11px] text-muted-foreground mt-1">Дата следующего обязательного платежа</p>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Заметка</label>
        <Input placeholder="Необязательно" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <p className="text-[11px] text-muted-foreground mt-1">Любые важные детали для себя</p>
      </div>
    </>
  );
}

function LoanAddFields({ form, setForm }: { form: DebtFormState; setForm: (f: DebtFormState) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Сумма кредита, &#8381;</label>
          <Input type="number" inputMode="decimal" placeholder="3000000" value={form.original_amount}
            onChange={e => setForm({ ...form, original_amount: e.target.value })} />
          <p className="text-[11px] text-muted-foreground mt-1">Сумма по договору (сколько брали изначально)</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Остаток, &#8381;</label>
          <Input type="number" inputMode="decimal" placeholder="Если уже платили" value={form.remaining_amount}
            onChange={e => setForm({ ...form, remaining_amount: e.target.value })} />
          <p className="text-[11px] text-muted-foreground mt-1">Сколько ещё осталось выплатить сейчас</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Ставка, %</label>
          <Input type="number" inputMode="decimal" placeholder="12.5" value={form.interest_rate}
            onChange={e => setForm({ ...form, interest_rate: e.target.value })} />
          <p className="text-[11px] text-muted-foreground mt-1">Годовая процентная ставка из договора</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Платёж/мес, &#8381;</label>
          <Input type="number" inputMode="decimal" placeholder="35000" value={form.monthly_payment}
            onChange={e => setForm({ ...form, monthly_payment: e.target.value })} />
          <p className="text-[11px] text-muted-foreground mt-1">Ежемесячный платёж из графика платежей</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Дата начала</label>
          <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
          <p className="text-[11px] text-muted-foreground mt-1">Когда был выдан кредит</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Дата окончания</label>
          <Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
          <p className="text-[11px] text-muted-foreground mt-1">Когда кредит должен быть полностью погашен</p>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">След. платёж</label>
        <Input type="date" value={form.next_payment_date} onChange={e => setForm({ ...form, next_payment_date: e.target.value })} />
        <p className="text-[11px] text-muted-foreground mt-1">Дата следующего обязательного платежа</p>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Заметка</label>
        <Input placeholder="Необязательно" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <p className="text-[11px] text-muted-foreground mt-1">Любые важные детали для себя</p>
      </div>
    </>
  );
}