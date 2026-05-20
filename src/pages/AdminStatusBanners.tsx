// /admin/status-banner — управление системными баннерами.
//
// Минимальный pragmatic v1:
//   - список с группировкой по lifecycle (active/scheduled/disabled/expired)
//   - create / edit / enable-disable / delete через admin write API
//   - inline-preview перед сохранением (через override → setBanners)
//   - route scope — chips textarea (по строкам / через запятую)
//
// Защита: страница рендерится только под AdminRoute (см. App.tsx).

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import SEOHead from '@/components/SEOHead';
import {
  adminCreateBanner,
  adminDeleteBanner,
  adminListBanners,
  adminSetEnabled,
  adminUpdateBanner,
} from '@/lib/statusBanner/statusBannerApi';
import {
  BANNER_AUDIENCES,
  BANNER_TYPES,
  DEFAULT_DISMISSIBLE_BY_TYPE,
  DEFAULT_PRIORITY_BY_TYPE,
  type BannerAudience,
  type BannerType,
  type StatusBanner,
  type StatusBannerDraft,
} from '@/lib/statusBanner/types';
import {
  LIFECYCLE_LABEL,
  LIFECYCLE_TONE,
  classifyBanner,
  type BannerLifecycle,
} from '@/lib/statusBanner/classifyBanner';
import { useSuggestions } from '@/lib/statusBanner/suggestions/useSuggestions';
import type { BannerSuggestion } from '@/lib/statusBanner/suggestions/types';
import { toast } from 'sonner';

// ---------- form state ----------

interface FormState {
  id?: string;
  type: BannerType;
  title: string;
  message: string;
  ctaLabel: string;
  ctaHref: string;
  enabled: boolean;
  dismissible: boolean;
  startsAt: string;
  endsAt: string;
  audience: BannerAudience;
  routeScopeRaw: string;
  priority: number;
}

function emptyForm(): FormState {
  return {
    type: 'info',
    title: '',
    message: '',
    ctaLabel: '',
    ctaHref: '',
    enabled: false,
    dismissible: DEFAULT_DISMISSIBLE_BY_TYPE.info,
    startsAt: '',
    endsAt: '',
    audience: 'public',
    routeScopeRaw: '',
    priority: DEFAULT_PRIORITY_BY_TYPE.info,
  };
}

function bannerToForm(b: StatusBanner): FormState {
  return {
    id: b.id,
    type: b.type,
    title: b.title,
    message: b.message,
    ctaLabel: b.ctaLabel ?? '',
    ctaHref: b.ctaHref ?? '',
    enabled: b.enabled,
    dismissible: b.dismissible,
    startsAt: b.startsAt ?? '',
    endsAt: b.endsAt ?? '',
    audience: b.audience,
    routeScopeRaw: (b.routeScope ?? []).join('\n'),
    priority: b.priority,
  };
}

function parseRouteScope(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function formToDraft(f: FormState): StatusBannerDraft {
  return {
    type: f.type,
    title: f.title.trim(),
    message: f.message.trim(),
    ctaLabel: f.ctaLabel.trim() || null,
    ctaHref: f.ctaHref.trim() || null,
    enabled: f.enabled,
    dismissible: f.dismissible,
    startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : null,
    endsAt: f.endsAt ? new Date(f.endsAt).toISOString() : null,
    audience: f.audience,
    routeScope: parseRouteScope(f.routeScopeRaw),
    priority: Number.isFinite(f.priority) ? f.priority : 0,
  };
}

function validateForm(f: FormState): string | null {
  if (!f.title.trim()) return 'Введите заголовок';
  if (!f.message.trim()) return 'Введите текст сообщения';
  const hasLabel = f.ctaLabel.trim() !== '';
  const hasHref = f.ctaHref.trim() !== '';
  if (hasLabel !== hasHref) return 'CTA — нужны и текст, и ссылка (или оба пустые)';
  if (f.startsAt && f.endsAt) {
    const s = new Date(f.startsAt).getTime();
    const e = new Date(f.endsAt).getTime();
    if (Number.isFinite(s) && Number.isFinite(e) && e <= s) {
      return 'Дата окончания должна быть позже даты начала';
    }
  }
  return null;
}

// ---------- preview via dev override ----------

function showPreview(form: FormState): void {
  if (typeof window === 'undefined' || !window.__statusBanner) return;
  const now = new Date().toISOString();
  const preview: StatusBanner = {
    id: form.id ?? 'preview',
    type: form.type,
    title: form.title || '(без заголовка)',
    message: form.message || '(без текста)',
    ctaLabel: form.ctaLabel.trim() || null,
    ctaHref: form.ctaHref.trim() || null,
    enabled: true,
    dismissible: form.dismissible,
    startsAt: null,
    endsAt: null,
    audience: 'admins',
    routeScope: [],
    priority: 1000,
    createdBy: 'preview',
    updatedBy: 'preview',
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    unpublishedAt: null,
  };
  window.__statusBanner.setBanners([preview]);
  toast.success('Предпросмотр включён', {
    description: 'Закрой через «Снять preview», иначе банeр останется виден только тебе.',
  });
}

function clearPreview(): void {
  if (typeof window === 'undefined' || !window.__statusBanner) return;
  window.__statusBanner.clear();
  window.__statusBanner.refresh();
}

// ---------- page ----------

export default function AdminStatusBanners() {
  const [banners, setBanners] = useState<StatusBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await adminListBanners();
      setBanners(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    return () => clearPreview();
  }, [reload]);

  const grouped = useMemo(() => {
    const out: Record<BannerLifecycle, StatusBanner[]> = {
      active: [],
      scheduled: [],
      disabled: [],
      expired: [],
    };
    for (const b of banners) {
      out[classifyBanner(b)].push(b);
    }
    return out;
  }, [banners]);

  const openCreate = () => {
    clearPreview();
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (b: StatusBanner) => {
    clearPreview();
    setForm(bannerToForm(b));
    setDialogOpen(true);
  };

  // ─── Suggestions (B4) ──────────────────────────────────────────────────
  const { suggestions, refresh: refreshSuggestions, reject: rejectSuggestion } = useSuggestions();

  /**
   * Принять suggestion → открыть форму с предзаполненными полями (enabled=false).
   * НИКАКОЙ автопубликации: админ должен сам нажать «Включить баннер» в форме.
   */
  const acceptSuggestion = (s: BannerSuggestion) => {
    clearPreview();
    const draft = s.draft;
    setForm({
      type: draft.type,
      title: draft.title,
      message: draft.message,
      ctaLabel: draft.ctaLabel ?? '',
      ctaHref: draft.ctaHref ?? '',
      enabled: false, // ← guard: даже если draft.enabled был true, форс false
      dismissible:
        typeof draft.dismissible === 'boolean'
          ? draft.dismissible
          : DEFAULT_DISMISSIBLE_BY_TYPE[draft.type],
      startsAt: draft.startsAt ?? '',
      endsAt: draft.endsAt ?? '',
      audience: draft.audience ?? 'all',
      routeScopeRaw: (draft.routeScope ?? []).join('\n'),
      priority: draft.priority ?? DEFAULT_PRIORITY_BY_TYPE[draft.type],
    });
    setDialogOpen(true);
    toast.info('Suggestion открыт как черновик', {
      description: 'Это только заготовка — отредактируйте и сами решите, включать ли баннер.',
    });
  };

  const onTypeChange = (t: BannerType) => {
    setForm((f) => ({
      ...f,
      type: t,
      dismissible: f.id ? f.dismissible : DEFAULT_DISMISSIBLE_BY_TYPE[t],
      priority: f.id ? f.priority : DEFAULT_PRIORITY_BY_TYPE[t],
    }));
  };

  const handleSave = async () => {
    const err = validateForm(form);
    if (err) {
      toast.error('Не получится сохранить', { description: err });
      return;
    }
    setSaving(true);
    try {
      const draft = formToDraft(form);
      if (form.id) {
        await adminUpdateBanner(form.id, draft);
        toast.success('Баннер обновлён');
      } else {
        await adminCreateBanner(draft);
        toast.success('Баннер создан');
      }
      // v1 gated audience warning: если включаешь баннер на non-all, он не
      // дойдёт до пользователей. Предупреждаем явно, чтобы админ не думал,
      // что сообщение ушло.
      if (form.enabled && form.audience !== 'all') {
        toast.warning('Баннер не показывается пользователям', {
          description: `Аудитория "${form.audience}" gated в v1 — заработает после security mini-sprint.`,
        });
      }
      setDialogOpen(false);
      clearPreview();
      await reload();
    } catch (e) {
      toast.error('Ошибка сохранения', { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (b: StatusBanner) => {
    try {
      await adminSetEnabled(b.id, !b.enabled);
      toast.success(b.enabled ? 'Выключен' : 'Включён');
      await reload();
    } catch (e) {
      toast.error('Не удалось', { description: (e as Error).message });
    }
  };

  const handleDelete = async (b: StatusBanner) => {
    if (!confirm(`Удалить баннер «${b.title}»?`)) return;
    try {
      await adminDeleteBanner(b.id);
      toast.success('Удалено');
      await reload();
    } catch (e) {
      toast.error('Не удалось', { description: (e as Error).message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead title="Status Banner · Admin" description="System banners admin" />
      <main role="main" className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Системные баннеры
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Управление верхним сообщением для пользователей: info / maintenance /
              warning / critical / update.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/dashboard">
                <Icon name="ArrowLeft" size={14} className="mr-1" aria-hidden="true" />
                В админку
              </Link>
            </Button>
            <Button onClick={openCreate} size="sm" className="bg-violet-600 hover:bg-violet-700">
              <Icon name="Plus" size={14} className="mr-1" aria-hidden="true" />
              Создать баннер
            </Button>
          </div>
        </div>

        {/* SEC-1.5: audience-policy info */}
        <div
          role="note"
          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3"
        >
          <Icon name="ShieldCheck" size={16} aria-hidden="true" className="text-emerald-700 mt-0.5 shrink-0" />
          <div className="text-xs text-emerald-900 leading-snug">
            <b>Аудитория проверяется сервером:</b> public — всем, authenticated — только залогиненным, admin — только администраторам.
          </div>
        </div>

        {/* B4: Suggestions */}
        <SuggestionsSection
          suggestions={suggestions}
          onAccept={acceptSuggestion}
          onReject={(id) => {
            rejectSuggestion(id);
            toast.message('Предложение отклонено');
          }}
          onRefresh={refreshSuggestions}
        />

        {/* Error */}
        {error && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="text-sm font-semibold text-rose-800 mb-1">
              Не удалось загрузить
            </div>
            <div className="text-xs text-rose-700 mb-2 break-words">{error}</div>
            <Button size="sm" variant="outline" onClick={reload}>
              <Icon name="RefreshCw" size={12} className="mr-1" aria-hidden="true" />
              Повторить
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-2" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 rounded-xl border border-slate-200 bg-white animate-pulse" />
            ))}
          </div>
        )}

        {/* Groups */}
        {!loading && !error && (
          <>
            <BannerGroup
              title="Активные"
              lifecycle="active"
              banners={grouped.active}
              onEdit={openEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
            <BannerGroup
              title="Запланированы"
              lifecycle="scheduled"
              banners={grouped.scheduled}
              onEdit={openEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
            <BannerGroup
              title="Выключены / черновики"
              lifecycle="disabled"
              banners={grouped.disabled}
              onEdit={openEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
            <BannerGroup
              title="Завершённые"
              lifecycle="expired"
              banners={grouped.expired}
              onEdit={openEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
              muted
            />
          </>
        )}

        {/* Editor dialog */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) clearPreview();
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {form.id ? 'Редактировать баннер' : 'Новый баннер'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="type">Тип</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => onTypeChange(v as BannerType)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BANNER_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="audience">Аудитория</Label>
                  <Select
                    value={form.audience}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, audience: v as BannerAudience }))
                    }
                  >
                    <SelectTrigger id="audience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public — все посетители</SelectItem>
                      <SelectItem value="authenticated">Authenticated — только залогиненные</SelectItem>
                      <SelectItem value="admin">Admin — только администраторы</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Заголовок *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  maxLength={140}
                />
              </div>

              <div>
                <Label htmlFor="message">Текст сообщения *</Label>
                <Textarea
                  id="message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ctaLabel">Кнопка (текст)</Label>
                  <Input
                    id="ctaLabel"
                    value={form.ctaLabel}
                    onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                    placeholder="Подробнее"
                  />
                </div>
                <div>
                  <Label htmlFor="ctaHref">Кнопка (ссылка)</Label>
                  <Input
                    id="ctaHref"
                    value={form.ctaHref}
                    onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))}
                    placeholder="/status или https://…"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startsAt">Начало</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={form.startsAt ? form.startsAt.slice(0, 16) : ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startsAt: e.target.value || '' }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endsAt">Конец</Label>
                  <Input
                    id="endsAt"
                    type="datetime-local"
                    value={form.endsAt ? form.endsAt.slice(0, 16) : ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endsAt: e.target.value || '' }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="routeScope">
                  Маршруты (по строкам или через запятую). Пусто = все страницы.
                </Label>
                <Textarea
                  id="routeScope"
                  rows={3}
                  value={form.routeScopeRaw}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, routeScopeRaw: e.target.value }))
                  }
                  placeholder="/portfolio
/workshop"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="priority">Приоритет</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={form.priority}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priority: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between sm:pt-6">
                  <Label htmlFor="dismissible">Можно закрыть</Label>
                  <Switch
                    id="dismissible"
                    checked={form.dismissible}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({ ...f, dismissible: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <Label htmlFor="enabled" className="font-semibold">
                    Включить баннер
                  </Label>
                  <p className="text-xs text-slate-500">
                    Выключенный баннер существует, но не показывается пользователям.
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={form.enabled}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, enabled: checked }))}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => showPreview(form)}
                disabled={saving}
              >
                <Icon name="Eye" size={14} className="mr-1" aria-hidden="true" />
                Предпросмотр
              </Button>
              <Button variant="ghost" onClick={() => clearPreview()} disabled={saving}>
                Снять preview
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Сохраняем…' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

// ---------- subcomponents ----------

const SUGGESTION_TYPE_TONE: Record<string, string> = {
  info: 'bg-blue-100 text-blue-800',
  update: 'bg-violet-100 text-violet-800',
  maintenance: 'bg-amber-100 text-amber-800',
  warning: 'bg-orange-100 text-orange-800',
  critical: 'bg-rose-100 text-rose-800',
};

function SuggestionsSection({
  suggestions,
  onAccept,
  onReject,
  onRefresh,
}: {
  suggestions: BannerSuggestion[];
  onAccept: (s: BannerSuggestion) => void;
  onReject: (id: string) => void;
  onRefresh: () => void;
}) {
  return (
    <section aria-label="Предложения системы" className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Sparkles" size={14} aria-hidden="true" className="text-violet-600" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Предложения системы
          </h2>
          {suggestions.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
              {suggestions.length}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <Icon name="RefreshCw" size={12} className="mr-1" aria-hidden="true" />
          Обновить
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <Card className="border-dashed border-slate-300">
          <CardContent className="p-3 text-xs text-slate-500">
            Нет активных сигналов. Когда система зафиксирует деградацию
            или critical-алерт, здесь появятся черновики для админа.
            Ничего не публикуется автоматически.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {suggestions.map((s) => (
            <Card key={s.id} className="border-violet-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] uppercase font-semibold tracking-wide px-2 py-0.5 rounded-full ${
                          SUGGESTION_TYPE_TONE[s.draft.type] ?? 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.draft.type}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        source: {s.sourceKind}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        confidence {(s.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 mt-1 break-words">
                      {s.draft.title}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 break-words leading-snug">
                      {s.draft.message}
                    </div>
                    <div className="text-[11px] text-violet-700 mt-2 break-words leading-snug">
                      <Icon name="Info" size={10} className="inline mr-1" aria-hidden="true" />
                      {s.reason}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => onAccept(s)}>
                      <Icon name="PencilLine" size={12} className="mr-1" aria-hidden="true" />
                      Открыть как черновик
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onReject(s.id)}>
                      Отклонить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function BannerGroup({
  title,
  lifecycle,
  banners,
  muted,
  onEdit,
  onToggle,
  onDelete,
}: {
  title: string;
  lifecycle: BannerLifecycle;
  banners: StatusBanner[];
  muted?: boolean;
  onEdit: (b: StatusBanner) => void;
  onToggle: (b: StatusBanner) => void;
  onDelete: (b: StatusBanner) => void;
}) {
  if (banners.length === 0) return null;
  return (
    <section aria-label={title} className={muted ? 'opacity-70' : ''}>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {title}
        </h2>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${LIFECYCLE_TONE[lifecycle]}`}>
          {banners.length}
        </span>
      </div>
      <div className="space-y-2">
        {banners.map((b) => (
          <BannerRow
            key={b.id}
            banner={b}
            onEdit={() => onEdit(b)}
            onToggle={() => onToggle(b)}
            onDelete={() => onDelete(b)}
          />
        ))}
      </div>
    </section>
  );
}

function BannerRow({
  banner,
  onEdit,
  onToggle,
  onDelete,
}: {
  banner: StatusBanner;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const lifecycle = classifyBanner(banner);
  return (
    <Card className="border-slate-200">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-semibold tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {banner.type}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${LIFECYCLE_TONE[lifecycle]}`}>
                {LIFECYCLE_LABEL[lifecycle]}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                banner.audience === 'admin'
                  ? 'bg-rose-100 text-rose-700'
                  : banner.audience === 'authenticated'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {banner.audience === 'admin' ? 'Admin' : banner.audience === 'authenticated' ? 'Auth' : 'Public'}
              </span>
              <span className="text-[10px] text-slate-500">prio {banner.priority}</span>
            </div>
            <div className="text-sm font-semibold text-slate-900 mt-1 break-words">
              {banner.title}
            </div>
            <div className="text-xs text-slate-600 mt-0.5 break-words leading-snug">
              {banner.message}
            </div>
            {(banner.startsAt || banner.endsAt) && (
              <div className="text-[11px] text-slate-500 mt-1">
                {banner.startsAt && <>с {new Date(banner.startsAt).toLocaleString()}</>}
                {banner.startsAt && banner.endsAt && ' · '}
                {banner.endsAt && <>до {new Date(banner.endsAt).toLocaleString()}</>}
              </div>
            )}
            {banner.routeScope.length > 0 && (
              <div className="text-[11px] text-slate-500 mt-1 break-words">
                routes: {banner.routeScope.join(', ')}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onToggle}>
              {banner.enabled ? 'Выключить' : 'Включить'}
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Icon name="Pencil" size={12} aria-hidden="true" />
            </Button>
            <Button size="sm" variant="outline" onClick={onDelete}>
              <Icon name="Trash2" size={12} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}