import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import usePets, { type PetSubKind } from '@/hooks/usePets';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'bool';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  primary?: boolean;
  muted?: boolean;
  prefix?: string;
  suffix?: string;
}

interface Props {
  kind: PetSubKind;
  petId: string;
  title: string;
  icon: string;
  color: string;
  gradient: string;
  emptyText: string;
  fields: FieldDef[];
  renderTitle: (item: Record<string, unknown>) => string;
  renderSubtitle?: (item: Record<string, unknown>) => string | null;
  renderBadge?: (item: Record<string, unknown>) => { text: string; color: string } | null;
  onChanged?: () => void;
}

export default function PetSubSection({
  kind, petId, title, icon, color, gradient, emptyText, fields,
  renderTitle, renderSubtitle, renderBadge, onChanged,
}: Props) {
  const { listSub, createSub, updateSub, deleteSub } = usePets();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await listSub(kind, petId);
    setItems(data);
    setLoading(false);
  }, [kind, petId, listSub]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    const init: Record<string, unknown> = {};
    fields.forEach(f => {
      if (f.type === 'bool') init[f.key] = true;
    });
    setForm(init);
    setDialogOpen(true);
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditing(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const payload: Record<string, unknown> = { pet_id: petId };
    fields.forEach(f => {
      const v = form[f.key];
      if (v !== undefined && v !== null && v !== '') {
        payload[f.key] = f.type === 'number' ? Number(v) : v;
      } else {
        payload[f.key] = null;
      }
    });
    if (editing) {
      await updateSub(kind, { id: editing.id, ...payload });
    } else {
      await createSub(kind, payload);
    }
    setSaving(false);
    setDialogOpen(false);
    await load();
    onChanged?.();
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить запись?')) return;
    await deleteSub(kind, id);
    await load();
    onChanged?.();
  };

  const required = fields.filter(f => f.required);
  const canSave = required.every(f => {
    const v = form[f.key];
    return v !== undefined && v !== null && v !== '';
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
            <Icon name={icon} size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-xs text-muted-foreground">{items.length} записей</p>
          </div>
        </div>
        <Button size="sm" onClick={openCreate} className={`bg-gradient-to-r ${gradient} text-white border-0`}>
          <Icon name="Plus" size={16} className="mr-1" />
          Добавить
        </Button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-muted-foreground text-sm">Загрузка...</div>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <Icon name={icon} size={36} className={`${color} mx-auto mb-2 opacity-50`} />
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const badge = renderBadge?.(item);
            const sub = renderSubtitle?.(item);
            return (
              <Card key={String(item.id)} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {renderTitle(item)}
                      </h4>
                      {badge && (
                        <Badge variant="secondary" className={`text-xs ${badge.color}`}>{badge.text}</Badge>
                      )}
                    </div>
                    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
                    {typeof item.notes === 'string' && item.notes && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{item.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(item)}>
                      <Icon name="Pencil" size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600" onClick={() => remove(String(item.id))}>
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Редактировать' : 'Добавить'} — {title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {fields.map(f => (
              <div key={f.key}>
                <Label>{f.label}{f.required && ' *'}</Label>
                {f.type === 'textarea' ? (
                  <Textarea
                    value={(form[f.key] as string) || ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    rows={2}
                    placeholder={f.placeholder}
                  />
                ) : f.type === 'select' ? (
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={(form[f.key] as string) || ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  >
                    <option value="">—</option>
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'bool' ? (
                  <div className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      checked={!!form[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-muted-foreground">Активно</span>
                  </div>
                ) : (
                  <Input
                    type={f.type}
                    step={f.type === 'number' ? '0.01' : undefined}
                    value={(form[f.key] as string | number) ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={save} disabled={saving || !canSave} className={`bg-gradient-to-r ${gradient} text-white border-0`}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
