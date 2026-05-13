import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { createTaskFromGoal, type CreateTaskFromGoalInput } from '@/lib/goals/tasksBridge';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  prefill: CreateTaskFromGoalInput | null;
  onCreated?: (taskId: string) => void;
}

const SOURCE_LABEL: Record<string, { label: string; icon: string; color: string }> = {
  goal: { label: 'из цели', icon: 'Target', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  milestone: { label: 'из вехи', icon: 'Flag', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  keyresult: { label: 'из KR', icon: 'Crosshair', color: 'bg-violet-100 text-violet-700 border-violet-200' },
};

export default function CreateTaskFromGoalDialog({ open, onOpenChange, prefill, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !prefill) return;
    setTitle(prefill.title);
    setDescription(prefill.description || '');
    setDeadline(prefill.deadline || '');
    setPriority(prefill.priority || 'medium');
    setError(null);
  }, [open, prefill]);

  const handleCreate = async () => {
    if (!prefill || !title.trim()) {
      setError('Заголовок задачи обязателен');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { taskId } = await createTaskFromGoal({
        ...prefill,
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline || null,
        priority,
      });
      onCreated?.(taskId);
      onOpenChange(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!prefill) return null;
  const src = SOURCE_LABEL[prefill.source];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[calc(100vw-1rem)] sm:w-auto max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name="Plus" size={22} />
            Создать задачу
          </DialogTitle>
          <DialogDescription>
            Задача попадёт в Планирование и сохранит ссылку обратно на цель.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Бейдж источника */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-[10px] ${src.color}`}>
              <Icon name={src.icon} size={10} className="mr-1" />
              {src.label}: {prefill.sourceTitle}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Название <span className="text-rose-500">*</span>
            </Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что нужно сделать" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Описание</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Срок</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Приоритет</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-800 flex items-start gap-1.5">
            <Icon name="Info" size={11} className="mt-0.5 flex-shrink-0" />
            <span>
              Закрытие задачи НЕ меняет прогресс цели автоматически. Прогресс по-прежнему считается из методики.
            </span>
          </div>

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={saving || !title.trim()}>
              <Icon
                name={saving ? 'Loader2' : 'Check'}
                size={14}
                className={`mr-1.5 ${saving ? 'animate-spin' : ''}`}
              />
              Создать задачу
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
