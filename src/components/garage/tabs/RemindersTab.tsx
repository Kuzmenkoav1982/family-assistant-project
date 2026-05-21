import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { Reminder } from '@/hooks/useGarage';
import { REMINDER_TYPES, fmtDate } from '../constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RemindersTab({ vehicleId, garage: g }: { vehicleId: string; garage: any }) {
  const [items, setItems] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ reminder_type: 'maintenance', title: '', description: '', due_date: '', due_mileage: '' });

  useEffect(() => { g.loadReminders(vehicleId).then((d: Reminder[]) => { setItems(d); setLoading(false); }); }, [vehicleId]);

  const isOverdue = (r: Reminder) => r.due_date && !r.is_completed && new Date(r.due_date) < new Date();

  if (loading) return <p className="text-sm text-muted-foreground py-4 text-center">Загрузка...</p>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Активных: {items.filter(r => !r.is_completed).length}</p>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
          <Icon name={showAdd ? 'X' : 'Plus'} size={14} className="mr-1" />{showAdd ? 'Отмена' : 'Добавить'}
        </Button>
      </div>

      {showAdd && (
        <Card><CardContent className="p-3 space-y-2">
          <Select value={form.reminder_type} onValueChange={v => setForm(p => ({ ...p, reminder_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(REMINDER_TYPES).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Название *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <Input placeholder="Описание" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Дата</Label><Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} /></div>
            <div><Label className="text-xs">Пробег, км</Label><Input type="number" value={form.due_mileage} onChange={e => setForm(p => ({ ...p, due_mileage: e.target.value }))} /></div>
          </div>
          <Button className="w-full" disabled={!form.title} onClick={async () => {
            await g.createReminder(vehicleId, { ...form, due_mileage: form.due_mileage ? Number(form.due_mileage) : undefined });
            const d = await g.loadReminders(vehicleId); setItems(d); setShowAdd(false);
            setForm({ reminder_type: 'maintenance', title: '', description: '', due_date: '', due_mileage: '' });
          }}>Сохранить</Button>
        </CardContent></Card>
      )}

      {items.length === 0
        ? <p className="text-sm text-muted-foreground text-center py-6">Нет напоминаний</p>
        : items.map(r => (
          <Card key={r.id} className={isOverdue(r) ? 'border-red-300 bg-red-50/50' : r.is_completed ? 'opacity-60' : ''}>
            <CardContent className="p-3 flex items-center gap-3">
              <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={async () => {
                await g.toggleReminder(r.id); const d = await g.loadReminders(vehicleId); setItems(d);
              }}>
                <Icon name={r.is_completed ? 'CheckCircle2' : 'Circle'} size={20} className={r.is_completed ? 'text-green-500' : isOverdue(r) ? 'text-red-500' : 'text-gray-400'} />
              </Button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${r.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                  {REMINDER_TYPES[r.reminder_type] || r.reminder_type} — {r.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.due_date ? fmtDate(r.due_date) : ''}{r.due_mileage ? ` · ${r.due_mileage.toLocaleString('ru-RU')} км` : ''}
                </p>
                {r.description && <p className="text-xs mt-0.5">{r.description}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={async () => { await g.deleteReminder(r.id); const d = await g.loadReminders(vehicleId); setItems(d); }}>
                <Icon name="Trash2" size={14} className="text-red-400" />
              </Button>
            </CardContent>
          </Card>
        ))
      }
    </div>
  );
}
