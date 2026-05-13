import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { portfolioApi, type AchievementCreateInput } from '@/services/portfolioApi';
import { lifeApi } from '@/components/life-road/api';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import type { LifeGoal } from '@/components/life-road/types';

// Этап 3.4.1: ручной handoff из завершённой цели в Portfolio.
// Создаёт achievement и СРАЗУ link goal↔achievement.
// Двухшаговая ошибка: если link не записать удалось — показываем ясное сообщение,
// achievement при этом не отзываем.

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  goal: LifeGoal | null;
  onCreated?: () => void;
}

const CATEGORIES: { value: 'milestone' | 'path' | 'rhythm'; label: string; icon: string }[] = [
  { value: 'milestone', label: 'Веха', icon: 'Flag' },
  { value: 'path', label: 'Путь', icon: 'Route' },
  { value: 'rhythm', label: 'Ритм', icon: 'Repeat' },
];

const SPHERES: { value: string; label: string }[] = [
  { value: '', label: '— не выбрано —' },
  { value: 'intellect', label: 'Интеллект' },
  { value: 'emotions', label: 'Эмоции' },
  { value: 'body', label: 'Тело и здоровье' },
  { value: 'creativity', label: 'Творчество' },
  { value: 'social', label: 'Социальное' },
  { value: 'finance', label: 'Финансы' },
  { value: 'values', label: 'Ценности' },
  { value: 'life_skills', label: 'Самостоятельность' },
];

function toDateInput(value?: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export default function CreateAchievementFromGoalDialog({ open, onOpenChange, goal, onCreated }: Props) {
  const { members, currentMemberId } = useFamilyMembersContext();

  const [memberId, setMemberId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sphere, setSphere] = useState<string>('');
  const [category, setCategory] = useState<'milestone' | 'path' | 'rhythm'>('milestone');
  const [icon, setIcon] = useState('Award');
  const [earnedAt, setEarnedAt] = useState<string>(toDateInput(null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Двухшаговый статус
  const [partialAchievementId, setPartialAchievementId] = useState<string | null>(null);

  // Prefill при открытии
  useEffect(() => {
    if (!open || !goal) return;
    setTitle(goal.title || '');
    setDescription((goal.whyText || goal.description || '').slice(0, 500));
    setSphere(goal.sphere && goal.sphere !== 'personal' ? goal.sphere : '');
    setCategory('milestone');
    setIcon('Trophy');
    // Дата завершения цели → если есть completedAt в outcomeSignal, иначе deadline, иначе сегодня.
    const completedAt =
      (goal as unknown as { completedAt?: string }).completedAt ||
      (goal as unknown as { outcomeSignal?: { completedAt?: string } }).outcomeSignal?.completedAt ||
      goal.deadline ||
      null;
    setEarnedAt(toDateInput(completedAt));
    // По умолчанию — owner цели, иначе текущий member.
    const ownerId = (goal as unknown as { ownerId?: string }).ownerId || null;
    setMemberId(ownerId || currentMemberId || (members[0]?.id ?? ''));
    setError(null);
    setPartialAchievementId(null);
  }, [open, goal, currentMemberId, members]);

  const ownerOptions = useMemo(() => members.map((m) => ({ id: m.id, name: m.name })), [members]);

  if (!goal) return null;

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Название обязательно');
      return;
    }
    if (!memberId) {
      setError('Выбери, кому это достижение');
      return;
    }
    setSaving(true);
    setError(null);
    setPartialAchievementId(null);

    const payload: AchievementCreateInput = {
      title: title.trim(),
      description: description.trim() || null,
      icon: icon || 'Award',
      sphere_key: sphere || null,
      category,
      earned_at: earnedAt || null,
      metadata: {
        source: 'goal_handoff',
        sourceGoalId: goal.id,
        sourceGoalTitle: goal.title,
        createdFromUI: 'workshop',
      },
    };

    let createdAchId: string | null = null;
    try {
      const created = await portfolioApi.achievementCreate(memberId, payload);
      if ((created as { error?: string }).error) {
        throw new Error((created as { error?: string }).error || 'achievement create failed');
      }
      createdAchId = created.id;
    } catch (e) {
      setError(`Не удалось создать достижение: ${(e as Error).message}`);
      setSaving(false);
      return;
    }

    // Шаг 2 — линковка. Если упадёт, не скрываем — показываем явно.
    try {
      await lifeApi.attachPortfolioItem({
        goalId: goal.id,
        itemType: 'achievement',
        itemId: createdAchId,
        meta: {
          source: 'goal_handoff',
          sourceGoalId: goal.id,
          sourceTitle: title.trim(),
          createdFromUI: 'workshop',
          createdAt: new Date().toISOString(),
        },
      });
      onCreated?.();
      onOpenChange(false);
    } catch (e) {
      // Achievement создан, но link не сохранился. Не скрываем.
      setPartialAchievementId(createdAchId);
      setError(
        `Достижение создано, но привязка к цели не сохранилась: ${(e as Error).message}. ` +
          `Открой Портфолио — достижение там, его можно привязать вручную.`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[calc(100vw-1rem)] sm:w-auto max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name="Trophy" size={22} />
            Создать достижение
          </DialogTitle>
          <DialogDescription>
            Достижение появится в Портфолио и будет связано с этой целью. На прогресс цели это не влияет.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700 bg-amber-50">
            <Icon name="Target" size={10} className="mr-1" />
            из цели: {goal.title}
          </Badge>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Название <span className="text-rose-500">*</span>
            </Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Чего ты добился" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Описание</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Коротко, что получилось"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Кому</Label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выбери участника" />
                </SelectTrigger>
                <SelectContent>
                  {ownerOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Дата получения</Label>
              <Input type="date" value={earnedAt} onChange={(e) => setEarnedAt(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Сфера</Label>
              <Select value={sphere || '__none__'} onValueChange={(v) => setSphere(v === '__none__' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPHERES.map((s) => (
                    <SelectItem key={s.value || '__none__'} value={s.value || '__none__'}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Категория</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-800 flex items-start gap-1.5">
            <Icon name="Info" size={11} className="mt-0.5 flex-shrink-0" />
            <span>
              После сохранения достижение появится в Портфолио и будет связано с целью.
              Это никак не меняет прогресс или статус цели.
            </span>
          </div>

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
              {error}
              {partialAchievementId && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      setTimeout(() => window.location.assign('/portfolio'), 100);
                    }}
                  >
                    <Icon name="ArrowUpRight" size={12} className="mr-1" /> Открыть в Портфолио
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={saving || !title.trim() || !memberId}>
              <Icon
                name={saving ? 'Loader2' : 'Check'}
                size={14}
                className={`mr-1.5 ${saving ? 'animate-spin' : ''}`}
              />
              Создать достижение
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}