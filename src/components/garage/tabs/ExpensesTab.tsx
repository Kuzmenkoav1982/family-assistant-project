import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { Expense } from '@/hooks/useGarage';
import { EXPENSE_CATEGORIES, fmt, fmtDate } from '../constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ExpensesTab({ vehicleId, garage: g }: { vehicleId: string; garage: any }) {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'fuel', title: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => { g.loadExpenses(vehicleId).then((d: Expense[]) => { setItems(d); setLoading(false); }); }, [vehicleId]);

  const total = items.reduce((s, e) => s + Number(e.amount), 0);
  const byCategory = items.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  if (loading) return <p className="text-sm text-muted-foreground py-4 text-center">Загрузка...</p>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Всего: {fmt(total)}</p>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
          <Icon name={showAdd ? 'X' : 'Plus'} size={14} className="mr-1" />{showAdd ? 'Отмена' : 'Добавить'}
        </Button>
      </div>

      {Object.keys(byCategory).length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, sum]) => (
            <Badge key={cat} variant="outline" className="text-xs">{EXPENSE_CATEGORIES[cat] || cat}: {fmt(sum)}</Badge>
          ))}
        </div>
      )}

      {showAdd && (
        <Card><CardContent className="p-3 space-y-2">
          <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(EXPENSE_CATEGORIES).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Описание *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Сумма, ₽ *" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>
          <Button className="w-full" disabled={!form.title || !form.amount} onClick={async () => {
            await g.createExpense(vehicleId, { ...form, amount: Number(form.amount) });
            const d = await g.loadExpenses(vehicleId); setItems(d); await g.loadStats(); setShowAdd(false);
            setForm({ category: 'fuel', title: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
          }}>Сохранить</Button>
        </CardContent></Card>
      )}

      {items.length === 0
        ? <p className="text-sm text-muted-foreground text-center py-6">Нет расходов</p>
        : items.map(e => (
          <Card key={e.id}>
            <CardContent className="p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{EXPENSE_CATEGORIES[e.category] || e.category} — {e.title}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(e.date)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Badge className="bg-blue-100 text-blue-800">{fmt(e.amount)}</Badge>
                <Button variant="ghost" size="sm" onClick={async () => { await g.deleteExpense(e.id); const d = await g.loadExpenses(vehicleId); setItems(d); await g.loadStats(); }}>
                  <Icon name="Trash2" size={14} className="text-red-400" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      }
    </div>
  );
}
