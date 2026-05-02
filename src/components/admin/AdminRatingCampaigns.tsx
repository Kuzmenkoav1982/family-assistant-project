import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';

const API = 'https://functions.poehali.dev/e6ccd99c-a165-48c7-83cf-946941114931';

interface PrizeForm {
  place_from: number;
  place_to: number;
  amount_rub: number;
  prize_type: string;
  description: string;
}

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  banner_text?: string | null;
  period_type?: string;
  starts_at: string;
  ends_at: string;
  status: string;
  weight_progress?: number;
  weight_activity?: number;
  weight_engagement?: number;
  weight_referrals?: number;
  min_members?: number;
  min_progress?: number;
  is_payout_done?: boolean;
  prizes?: PrizeForm[];
}

interface CampaignFormState {
  id?: string;
  slug: string;
  title: string;
  description: string;
  banner_text: string;
  period_type: string;
  starts_at: string;
  ends_at: string;
  status: string;
  weight_progress: number;
  weight_activity: number;
  weight_engagement: number;
  weight_referrals: number;
  min_members: number;
  min_progress: number;
  prizes: PrizeForm[];
}

const initialForm: CampaignFormState = {
  slug: '',
  title: '',
  description: '',
  banner_text: '',
  period_type: 'monthly',
  starts_at: '',
  ends_at: '',
  status: 'draft',
  weight_progress: 1.0,
  weight_activity: 0.5,
  weight_engagement: 0.3,
  weight_referrals: 0.2,
  min_members: 2,
  min_progress: 0,
  prizes: [],
};

interface Props {
  adminToken: string;
}

function toLocalInput(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

export default function AdminRatingCampaigns({ adminToken }: Props) {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CampaignFormState>(initialForm);
  const [saving, setSaving] = useState(false);

  const headers = {
    'X-Admin-Token': adminToken,
    'Content-Type': 'application/json',
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}?action=campaigns`, {
        headers: { 'X-Admin-Token': adminToken },
      });
      if (!r.ok) throw new Error('error');
      const j = await r.json();
      setCampaigns(j.campaigns || j || []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(initialForm);
    setOpen(true);
  };

  const openEdit = (c: Campaign) => {
    setForm({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description || '',
      banner_text: c.banner_text || '',
      period_type: c.period_type || 'monthly',
      starts_at: toLocalInput(c.starts_at),
      ends_at: toLocalInput(c.ends_at),
      status: c.status,
      weight_progress: c.weight_progress ?? 1.0,
      weight_activity: c.weight_activity ?? 0.5,
      weight_engagement: c.weight_engagement ?? 0.3,
      weight_referrals: c.weight_referrals ?? 0.2,
      min_members: c.min_members ?? 2,
      min_progress: c.min_progress ?? 0,
      prizes: c.prizes || [],
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.slug.trim() || !form.title.trim()) {
      toast({ title: 'Заполни slug и title', variant: 'destructive' });
      return;
    }
    if (!form.starts_at || !form.ends_at) {
      toast({ title: 'Заполни даты', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const action = form.id ? 'campaign_update' : 'campaign_create';
    const body: Record<string, unknown> = {
      ...(form.id ? { id: form.id } : {}),
      slug: form.slug,
      title: form.title,
      description: form.description,
      banner_text: form.banner_text,
      period_type: form.period_type,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      status: form.status,
      weight_progress: form.weight_progress,
      weight_activity: form.weight_activity,
      weight_engagement: form.weight_engagement,
      weight_referrals: form.weight_referrals,
      min_members: form.min_members,
      min_progress: form.min_progress,
      prizes: form.prizes,
    };

    try {
      const r = await fetch(`${API}?action=${action}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && (j.success !== false)) {
        toast({ title: form.id ? 'Кампания обновлена' : 'Кампания создана' });
        setOpen(false);
        load();
      } else {
        toast({ title: 'Ошибка', description: j.error || 'Не удалось сохранить', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const recalculate = async (c: Campaign) => {
    if (!confirm(`Пересчитать рейтинг для "${c.title}"?`)) return;
    try {
      const r = await fetch(`${API}?action=recalculate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ campaign_id: c.id }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        toast({ title: 'Рейтинг пересчитан', description: j.recalculated ? `Записей: ${j.recalculated}` : undefined });
        load();
      } else {
        toast({ title: 'Ошибка', description: j.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', variant: 'destructive' });
    }
  };

  const payout = async (c: Campaign) => {
    if (!confirm(`Выплатить призы для "${c.title}"? Это действие нельзя отменить.`)) return;
    try {
      const r = await fetch(`${API}?action=payout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ campaign_id: c.id }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        toast({ title: 'Призы выплачены', description: j.paid_count ? `Семей: ${j.paid_count}` : undefined });
        load();
      } else {
        toast({ title: 'Ошибка', description: j.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', variant: 'destructive' });
    }
  };

  const disqualify = async (c: Campaign) => {
    const familyId = prompt('ID семьи для дисквалификации:');
    if (!familyId) return;
    const reason = prompt('Причина:') || '';
    try {
      const r = await fetch(`${API}?action=disqualify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ campaign_id: c.id, family_id: familyId, reason }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        toast({ title: 'Семья дисквалифицирована' });
        load();
      } else {
        toast({ title: 'Ошибка', description: j.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', variant: 'destructive' });
    }
  };

  const addPrize = () => {
    setForm((f) => ({
      ...f,
      prizes: [
        ...f.prizes,
        {
          place_from: f.prizes.length + 1,
          place_to: f.prizes.length + 1,
          amount_rub: 0,
          prize_type: 'wallet',
          description: '',
        },
      ],
    }));
  };

  const removePrize = (i: number) => {
    setForm((f) => ({ ...f, prizes: f.prizes.filter((_, idx) => idx !== i) }));
  };

  const updatePrize = <K extends keyof PrizeForm>(i: number, field: K, value: PrizeForm[K]) => {
    setForm((f) => ({
      ...f,
      prizes: f.prizes.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)),
    }));
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700',
      active: 'bg-green-100 text-green-700',
      finished: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-600">Управление рейтинговыми акциями (Семья месяца)</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load}>
            <Icon name="RefreshCcw" size={14} className="mr-1.5" />
            Обновить
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Icon name="Plus" size={14} className="mr-1.5" />
            Создать акцию
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Icon name="Loader2" className="animate-spin" size={30} />
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            <Icon name="Trophy" size={40} className="mx-auto mb-2 opacity-40" />
            <p>Кампаний пока нет</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {campaigns.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-base">{c.title}</h3>
                      <code className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded">
                        {c.slug}
                      </code>
                      <Badge className={`text-[10px] ${statusBadge(c.status)}`}>{c.status}</Badge>
                      {c.is_payout_done && (
                        <Badge className="text-[10px] bg-green-100 text-green-700">Выплачено</Badge>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-xs text-slate-600 mb-1 line-clamp-2">{c.description}</p>
                    )}
                    <p className="text-[11px] text-slate-500">
                      <Icon name="Calendar" size={11} className="inline mr-1" />
                      {new Date(c.starts_at).toLocaleDateString('ru-RU')} —{' '}
                      {new Date(c.ends_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                      <Icon name="Pencil" size={12} className="mr-1" />
                      Изменить
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => recalculate(c)}>
                      <Icon name="Calculator" size={12} className="mr-1" />
                      Пересчитать
                    </Button>
                    {c.status === 'finished' && !c.is_payout_done && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => payout(c)}
                      >
                        <Icon name="CircleDollarSign" size={12} className="mr-1" />
                        Выплатить
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => disqualify(c)}>
                      <Icon name="UserX" size={12} className="mr-1 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs uppercase tracking-wider text-slate-500">Призы</Label>
                <Button size="sm" variant="outline" type="button" onClick={addPrize}>
                  <Icon name="Plus" size={12} className="mr-1" />
                  Добавить место
                </Button>
              </div>
              {form.prizes.length === 0 && (
                <p className="text-xs text-slate-500 italic">Призы не заданы</p>
              )}
              <div className="space-y-2">
                {form.prizes.map((p, i) => (
                  <div key={i} className="grid grid-cols-12 gap-1.5 items-end p-2 bg-slate-50 rounded-lg">
                    <div className="col-span-2">
                      <Label className="text-[10px]">с</Label>
                      <Input
                        type="number"
                        value={p.place_from}
                        onChange={(e) => updatePrize(i, 'place_from', +e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px]">по</Label>
                      <Input
                        type="number"
                        value={p.place_to}
                        onChange={(e) => updatePrize(i, 'place_to', +e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-[10px]">Сумма ₽</Label>
                      <Input
                        type="number"
                        value={p.amount_rub}
                        onChange={(e) => updatePrize(i, 'amount_rub', +e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px]">Тип</Label>
                      <select
                        value={p.prize_type}
                        onChange={(e) => updatePrize(i, 'prize_type', e.target.value)}
                        className="w-full h-10 px-2 rounded-md border bg-white text-xs"
                      >
                        <option value="wallet">Кошелёк</option>
                        <option value="badge">Бейдж</option>
                        <option value="promo">Промо</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px]">Описание</Label>
                      <Input
                        value={p.description}
                        onChange={(e) => updatePrize(i, 'description', e.target.value)}
                        placeholder="..."
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() => removePrize(i)}
                      >
                        <Icon name="Trash2" size={14} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={save} disabled={saving}>
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
    </div>
  );
}
