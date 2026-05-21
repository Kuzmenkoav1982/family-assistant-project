import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { GarageNote } from '@/hooks/useGarage';
import { fmtDate } from '../constants';

const priorityColors: Record<string, string> = { urgent: 'bg-red-100 text-red-800', normal: 'bg-gray-100 text-gray-800', low: 'bg-green-100 text-green-800' };
const priorityLabels: Record<string, string> = { urgent: '🔴 Срочно', normal: '🟡 Обычное', low: '🟢 Низкий' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function NotesTab({ vehicleId, garage: g }: { vehicleId: string; garage: any }) {
  const [items, setItems] = useState<GarageNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ text: '', priority: 'normal' });

  useEffect(() => { g.loadNotes(vehicleId).then((d: GarageNote[]) => { setItems(d); setLoading(false); }); }, [vehicleId]);

  if (loading) return <p className="text-sm text-muted-foreground py-4 text-center">Загрузка...</p>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Заметок: {items.filter(n => !n.is_resolved).length}</p>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
          <Icon name={showAdd ? 'X' : 'Plus'} size={14} className="mr-1" />{showAdd ? 'Отмена' : 'Добавить'}
        </Button>
      </div>

      {showAdd && (
        <Card><CardContent className="p-3 space-y-2">
          <Textarea placeholder="Опишите проблему или наблюдение *" value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} />
          <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">🔴 Срочно</SelectItem>
              <SelectItem value="normal">🟡 Обычное</SelectItem>
              <SelectItem value="low">🟢 Низкий приоритет</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" disabled={!form.text} onClick={async () => {
            await g.createNote(vehicleId, form);
            const d = await g.loadNotes(vehicleId); setItems(d); setShowAdd(false);
            setForm({ text: '', priority: 'normal' });
          }}>Сохранить</Button>
        </CardContent></Card>
      )}

      {items.length === 0
        ? <p className="text-sm text-muted-foreground text-center py-6">Нет заметок</p>
        : items.map(n => (
          <Card key={n.id} className={n.is_resolved ? 'opacity-60' : ''}>
            <CardContent className="p-3 flex items-start gap-3">
              <Button variant="ghost" size="sm" className="flex-shrink-0 mt-0.5" onClick={async () => {
                await g.toggleNote(n.id); const d = await g.loadNotes(vehicleId); setItems(d);
              }}>
                <Icon name={n.is_resolved ? 'CheckCircle2' : 'Circle'} size={18} className={n.is_resolved ? 'text-green-500' : 'text-gray-400'} />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-[10px] ${priorityColors[n.priority] || priorityColors.normal}`}>{priorityLabels[n.priority] || n.priority}</Badge>
                  {n.author_name && <span className="text-xs text-muted-foreground">{n.author_name}</span>}
                </div>
                <p className={`text-sm ${n.is_resolved ? 'line-through text-muted-foreground' : ''}`}>{n.text}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{fmtDate(n.created_at)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={async () => { await g.deleteNote(n.id); const d = await g.loadNotes(vehicleId); setItems(d); }}>
                <Icon name="Trash2" size={14} className="text-red-400" />
              </Button>
            </CardContent>
          </Card>
        ))
      }
    </div>
  );
}
