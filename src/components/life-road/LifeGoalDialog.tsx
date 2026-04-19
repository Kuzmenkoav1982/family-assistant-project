import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { FRAMEWORKS, GOAL_SPHERES } from './frameworks';
import { lifeApi } from './api';
import type { LifeGoal } from './types';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: LifeGoal | null;
  defaultFramework?: string;
  onSave: (data: Partial<LifeGoal>, id?: string) => Promise<void>;
}

export default function LifeGoalDialog({ open, onOpenChange, initial, defaultFramework, onSave }: Props) {
  const isEdit = Boolean(initial?.id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sphere, setSphere] = useState('personal');
  const [framework, setFramework] = useState<string | undefined>(undefined);
  const [deadline, setDeadline] = useState('');
  const [steps, setSteps] = useState<{ text: string; done?: boolean }[]>([]);
  const [newStep, setNewStep] = useState('');
  const [aiHint, setAiHint] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title || '');
      setDescription(initial?.description || '');
      setSphere(initial?.sphere || 'personal');
      setFramework(initial?.framework || defaultFramework || undefined);
      setDeadline(initial?.deadline || '');
      setSteps(initial?.steps || []);
      setAiHint('');
      setNewStep('');
    }
  }, [open, initial, defaultFramework]);

  const askAi = async () => {
    if (!title.trim()) {
      alert('Сначала укажи название цели');
      return;
    }
    setAiLoading(true);
    setAiHint('');
    try {
      const res = await lifeApi.coach({
        mode: 'goal-suggest',
        framework,
        goalTitle: title,
        goalDescription: description,
      });
      setAiHint(res.response);
    } catch (e) {
      setAiHint('Не удалось получить подсказку: ' + (e as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave(
        {
          title: title.trim(),
          description: description.trim() || null,
          sphere,
          framework: framework || null,
          deadline: deadline || null,
          steps,
          status: initial?.status || 'active',
          progress: initial?.progress ?? 0,
        },
        initial?.id,
      );
      onOpenChange(false);
    } catch (e) {
      alert('Не удалось сохранить: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const fwInfo = FRAMEWORKS.find((f) => f.id === framework);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name={isEdit ? 'Pencil' : 'Target'} size={22} />
            {isEdit ? 'Редактировать цель' : 'Новая цель'}
          </DialogTitle>
          <DialogDescription>
            Цель попадёт в твой план будущего на «Дороге жизни».
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Название цели <span className="text-rose-500">*</span></Label>
            <Input
              placeholder="Например: пробежать марафон, изучить английский, открыть своё дело"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Описание</Label>
            <Textarea
              rows={2}
              placeholder="Зачем тебе эта цель?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Сфера жизни</Label>
              <Select value={sphere} onValueChange={setSphere}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOAL_SPHERES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <Icon name={s.icon} size={14} />
                        {s.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Методика</Label>
              <Select value={framework || 'none'} onValueChange={(v) => setFramework(v === 'none' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="Выбрать" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без методики</SelectItem>
                  {FRAMEWORKS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      <div className="flex items-center gap-2">
                        <Icon name={f.icon} size={14} /> {f.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Дедлайн</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          {fwInfo && (
            <div className={`rounded-xl p-3 text-white text-xs bg-gradient-to-br ${fwInfo.gradient}`}>
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                <Icon name="Lightbulb" size={12} /> Подсказка по {fwInfo.title}
              </div>
              <div className="opacity-95">{fwInfo.hint}</div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Шаги</Label>
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!s.done}
                  onChange={(e) => {
                    const next = [...steps];
                    next[i] = { ...next[i], done: e.target.checked };
                    setSteps(next);
                  }}
                  className="accent-purple-600"
                />
                <Input
                  value={s.text}
                  onChange={(e) => {
                    const next = [...steps];
                    next[i] = { ...next[i], text: e.target.value };
                    setSteps(next);
                  }}
                />
                <Button size="icon" variant="ghost" onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}>
                  <Icon name="X" size={14} />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Добавить шаг..."
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newStep.trim()) {
                    setSteps([...steps, { text: newStep.trim() }]);
                    setNewStep('');
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (newStep.trim()) {
                    setSteps([...steps, { text: newStep.trim() }]);
                    setNewStep('');
                  }
                }}
              >
                <Icon name="Plus" size={14} />
              </Button>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2">
                <Icon name="Sparkles" size={14} className="text-purple-600" />
                Совет ИИ-Домового
              </Label>
              <Button size="sm" variant="outline" onClick={askAi} disabled={aiLoading}>
                <Icon name={aiLoading ? 'Loader2' : 'Wand2'} size={14} className={`mr-1.5 ${aiLoading ? 'animate-spin' : ''}`} />
                {aiHint ? 'Обновить' : 'Спросить'}
              </Button>
            </div>
            {aiHint && (
              <div className="rounded-xl p-3 bg-purple-50 border border-purple-200 text-sm text-purple-900 whitespace-pre-wrap leading-relaxed">
                {aiHint}
              </div>
            )}
            {!aiHint && !aiLoading && (
              <p className="text-xs text-gray-500 italic">
                Домовой подскажет первый шаг и адаптирует методику под твой контекст.
              </p>
            )}
          </div>

          {initial && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge variant="outline">{initial.status}</Badge>
              <span>·</span>
              <span>прогресс {initial.progress}%</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Отмена</Button>
            <Button onClick={handleSave} disabled={!title.trim() || saving}>
              <Icon name={saving ? 'Loader2' : 'Check'} size={14} className={`mr-1.5 ${saving ? 'animate-spin' : ''}`} />
              {isEdit ? 'Сохранить' : 'Создать цель'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
