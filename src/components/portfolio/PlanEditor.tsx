import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { portfolioApi, type PlanInput } from '@/services/portfolioApi';
import { SPHERE_ORDER, type DevelopmentPlan, type SphereKey } from '@/types/portfolio.types';

interface PlanEditorProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  memberId: string;
  sphereLabels: Record<SphereKey, string>;
  initial?: DevelopmentPlan | null;
  onSaved: () => void;
}

export default function PlanEditor({
  open,
  onOpenChange,
  memberId,
  sphereLabels,
  initial,
  onSaved,
}: PlanEditorProps) {
  const [sphere, setSphere] = useState<SphereKey>('intellect');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestone, setMilestone] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setSphere(initial.sphere_key);
      setTitle(initial.title || '');
      setDescription(initial.description || '');
      setMilestone(initial.milestone || '');
      setNextStep(initial.next_step || '');
      setTargetDate(initial.target_date ? initial.target_date.slice(0, 10) : '');
      setProgress(initial.progress || 0);
    } else {
      setSphere('intellect');
      setTitle('');
      setDescription('');
      setMilestone('');
      setNextStep('');
      setTargetDate('');
      setProgress(0);
    }
    setError(null);
  }, [initial, open]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Введите название цели');
      return;
    }
    setSaving(true);
    setError(null);
    const payload: PlanInput = {
      sphere_key: sphere,
      title: title.trim(),
      description: description.trim() || null,
      milestone: milestone.trim() || null,
      next_step: nextStep.trim() || null,
      target_date: targetDate || null,
      progress,
    };
    try {
      if (initial) {
        await portfolioApi.planUpdate(initial.id, payload);
      } else {
        await portfolioApi.planCreate(memberId, payload);
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    if (!confirm('Удалить эту цель?')) return;
    setSaving(true);
    try {
      await portfolioApi.planDelete(initial.id);
      onSaved();
      onOpenChange(false);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Target" size={18} className="text-primary" />
            {initial ? 'Редактировать цель' : 'Новая цель развития'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Сфера</Label>
            <Select value={sphere} onValueChange={(v) => setSphere(v as SphereKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPHERE_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {sphereLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Название цели *</Label>
            <Input
              placeholder="Например: научиться читать по слогам"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-xs">Описание</Label>
            <Textarea
              placeholder="Подробнее о цели"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label className="text-xs">Веха (что значит «достигнуто»)</Label>
            <Input
              placeholder="Например: прочитал 5 коротких слов"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-xs">Следующий шаг</Label>
            <Input
              placeholder="Что сделать в первую очередь"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Срок</Label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Прогресс: {progress}%</Label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full mt-2 accent-primary"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {initial && (
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={saving}
              className="text-red-600 hover:text-red-700 sm:mr-auto"
            >
              <Icon name="Trash2" size={14} className="mr-1" />
              Удалить
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение…' : initial ? 'Сохранить' : 'Создать цель'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
