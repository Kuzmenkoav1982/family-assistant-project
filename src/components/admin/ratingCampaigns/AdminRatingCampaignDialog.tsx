import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import AdminRatingCampaignPrizes from './AdminRatingCampaignPrizes';
import { CampaignFormState, PrizeForm } from './types';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: CampaignFormState;
  setForm: Dispatch<SetStateAction<CampaignFormState>>;
  saving: boolean;
  onSave: () => void;
  onAddPrize: () => void;
  onRemovePrize: (i: number) => void;
  onUpdatePrize: <K extends keyof PrizeForm>(i: number, field: K, value: PrizeForm[K]) => void;
}

export default function AdminRatingCampaignDialog({
  open,
  onOpenChange,
  form,
  setForm,
  saving,
  onSave,
  onAddPrize,
  onRemovePrize,
  onUpdatePrize,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.id ? 'Изменить кампанию' : 'Новая кампания'}</DialogTitle>
          <DialogDescription>Параметры рейтинговой акции и призы</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Slug (уникальный)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="family-of-may-2026"
              />
            </div>
            <div>
              <Label>Тип периода</Label>
              <select
                value={form.period_type}
                onChange={(e) => setForm({ ...form, period_type: e.target.value })}
                className="w-full h-10 px-3 rounded-md border bg-white text-sm"
              >
                <option value="monthly">Месячный</option>
                <option value="weekly">Недельный</option>
                <option value="custom">Произвольный</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Название</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Семья мая 2026"
            />
          </div>

          <div>
            <Label>Описание</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label>Текст-баннер (короткий)</Label>
            <Input
              value={form.banner_text}
              onChange={(e) => setForm({ ...form, banner_text: e.target.value })}
              placeholder="Призовой фонд 30 000 ₽"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Начало</Label>
              <Input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
            </div>
            <div>
              <Label>Окончание</Label>
              <Input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Статус</Label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full h-10 px-3 rounded-md border bg-white text-sm"
            >
              <option value="draft">Черновик</option>
              <option value="active">Активная</option>
              <option value="finished">Завершена</option>
              <option value="cancelled">Отменена</option>
            </select>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-slate-500">Веса формулы</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              <div>
                <Label className="text-[10px]">Прогресс</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.weight_progress}
                  onChange={(e) => setForm({ ...form, weight_progress: +e.target.value })}
                />
              </div>
              <div>
                <Label className="text-[10px]">Активность</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.weight_activity}
                  onChange={(e) => setForm({ ...form, weight_activity: +e.target.value })}
                />
              </div>
              <div>
                <Label className="text-[10px]">Вовлечённость</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.weight_engagement}
                  onChange={(e) => setForm({ ...form, weight_engagement: +e.target.value })}
                />
              </div>
              <div>
                <Label className="text-[10px]">Рефералы</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.weight_referrals}
                  onChange={(e) => setForm({ ...form, weight_referrals: +e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Мин. членов семьи</Label>
              <Input
                type="number"
                value={form.min_members}
                onChange={(e) => setForm({ ...form, min_members: +e.target.value })}
              />
            </div>
            <div>
              <Label>Мин. прогресс, %</Label>
              <Input
                type="number"
                value={form.min_progress}
                onChange={(e) => setForm({ ...form, min_progress: +e.target.value })}
              />
            </div>
          </div>

          <AdminRatingCampaignPrizes
            prizes={form.prizes}
            onAdd={onAddPrize}
            onRemove={onRemovePrize}
            onUpdate={onUpdatePrize}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Icon name="Loader2" size={14} className="mr-1.5 animate-spin" />
                Сохраняю...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
