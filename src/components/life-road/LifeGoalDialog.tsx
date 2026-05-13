import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { GOAL_SPHERES } from './frameworks';
import { lifeApi } from './api';
import { listFrameworks } from '@/lib/goals/frameworkRegistry';
import SmartForm, { SMART_INITIAL, validateSmart, type SmartFrameworkState } from '@/components/goals/forms/SmartForm';
import OkrForm, {
  OKR_INITIAL,
  OKR_KR_INITIAL,
  validateOkr,
  normalizeOkrWeights,
  type OkrFrameworkState,
  type OkrKeyResultDraft,
} from '@/components/goals/forms/OkrForm';
import WheelForm, { WHEEL_INITIAL, validateWheel, type WheelFrameworkState } from '@/components/goals/forms/WheelForm';
import type { FrameworkType, LifeGoal } from './types';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: LifeGoal | null;
  defaultFramework?: FrameworkType | string;
  onSave: (data: Partial<LifeGoal>, id?: string) => Promise<LifeGoal | void>;
}

type FrameworkState = SmartFrameworkState | OkrFrameworkState | WheelFrameworkState | Record<string, unknown>;

export default function LifeGoalDialog({ open, onOpenChange, initial, defaultFramework, onSave }: Props) {
  const isEdit = Boolean(initial?.id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sphere, setSphere] = useState('personal');
  const [frameworkType, setFrameworkType] = useState<FrameworkType>('generic');
  const [deadline, setDeadline] = useState('');
  const [frameworkState, setFrameworkState] = useState<FrameworkState>({});
  const [linkedSphereIds, setLinkedSphereIds] = useState<string[]>([]);
  const [okrKrDrafts, setOkrKrDrafts] = useState<OkrKeyResultDraft[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // dirty используется для будущего «подтвердить закрытие при несохранённых данных».
  // Сейчас собираем только сигнал — confirm появится в Этапе 2.2.
  const [, setDirty] = useState(false);

  const frameworks = useMemo(() => listFrameworks(), []);

  // Инициализация при открытии
  useEffect(() => {
    if (!open) return;
    const allowed: FrameworkType[] = ['generic', 'smart', 'okr', 'wheel'];
    const candidate = (initial?.frameworkType || defaultFramework || 'generic') as FrameworkType;
    const ft: FrameworkType = allowed.includes(candidate) ? candidate : 'generic';
    setTitle(initial?.title || '');
    setDescription(initial?.description || '');
    setSphere(initial?.sphere || 'personal');
    setFrameworkType(ft);
    setDeadline(initial?.deadline || '');
    setLinkedSphereIds(initial?.linkedSphereIds || []);
    setFrameworkState(buildInitialState(ft, initial?.frameworkState as FrameworkState));
    setOkrKrDrafts(ft === 'okr' && !isEdit ? [{ ...OKR_KR_INITIAL }] : []);
    setErrors([]);
    setWarning(null);
    setDirty(false);
  }, [open, initial, defaultFramework, isEdit]);

  // Считается ли sub-form грязным (есть введённые данные)
  const isFrameworkStateDirty = (): boolean => {
    if (frameworkType === 'smart') {
      const s = frameworkState as SmartFrameworkState;
      return !!(s.specific || s.metric || s.targetValue || s.targetDate || s.achievable || s.relevant);
    }
    if (frameworkType === 'okr') {
      const s = frameworkState as OkrFrameworkState;
      return !!(s.objective || okrKrDrafts.some((k) => k.title || k.targetValue));
    }
    if (frameworkType === 'wheel') {
      return linkedSphereIds.length > 0;
    }
    return false;
  };

  const handleFrameworkChange = (nextValue: string) => {
    const next = nextValue as FrameworkType;
    if (next === frameworkType) return;
    if (isFrameworkStateDirty()) {
      const ok = window.confirm(
        `Сменить методику? Данные текущей формы (${frameworkType}) будут потеряны.`,
      );
      if (!ok) return;
    }
    setFrameworkType(next);
    setFrameworkState(buildInitialState(next));
    if (next === 'okr') setOkrKrDrafts([{ ...OKR_KR_INITIAL }]);
    else setOkrKrDrafts([]);
    if (next !== 'wheel') setLinkedSphereIds([]);
    setErrors([]);
    setDirty(true);
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!title.trim()) errs.push('Название цели обязательно');
    if (frameworkType === 'smart') errs.push(...validateSmart(frameworkState as SmartFrameworkState));
    if (frameworkType === 'okr') errs.push(...validateOkr(frameworkState as OkrFrameworkState, okrKrDrafts));
    if (frameworkType === 'wheel') errs.push(...validateWheel(linkedSphereIds));
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setWarning(null);
    setSaving(true);

    try {
      // Для SMART deadline = targetDate (один источник)
      let finalDeadline = deadline || null;
      if (frameworkType === 'smart') {
        finalDeadline = (frameworkState as SmartFrameworkState).targetDate || null;
      }

      const payload: Partial<LifeGoal> = {
        title: title.trim(),
        description: description.trim() || null,
        sphere,
        framework: frameworkType,
        frameworkType,
        frameworkState: frameworkType === 'okr'
          // Для OKR в frameworkState только metadata, KR — отдельно
          ? { objective: (frameworkState as OkrFrameworkState).objective }
          : (frameworkState as Record<string, unknown>),
        deadline: finalDeadline,
        linkedSphereIds: frameworkType === 'wheel' ? linkedSphereIds : (initial?.linkedSphereIds || []),
        status: initial?.status || 'active',
        progress: initial?.progress ?? 0,
      };

      const saved = await onSave(payload, initial?.id);
      const savedGoal = (saved || null) as LifeGoal | null;

      // OKR: после создания цели создаём KR батчем (источник истины — таблица)
      if (frameworkType === 'okr' && !isEdit && savedGoal?.id) {
        const normalized = normalizeOkrWeights(okrKrDrafts);
        let failedCount = 0;
        for (let i = 0; i < normalized.length; i++) {
          const kr = normalized[i];
          try {
            await lifeApi.createKeyResult({
              goalId: savedGoal.id,
              title: kr.title.trim(),
              metricType: kr.metricType,
              startValue: kr.metricType === 'boolean' ? 0 : kr.startValue,
              targetValue: kr.metricType === 'boolean' ? 1 : kr.targetValue,
              unit: kr.unit,
              dueDate: kr.dueDate || null,
              weight: kr.weight ?? 1,
              order: i,
            });
          } catch (e) {
            console.error('KR save failed', e);
            failedCount += 1;
          }
        }
        if (failedCount > 0) {
          setWarning(
            `Цель создана, но ${failedCount} из ${normalized.length} ключевых результатов сохранились не полностью. ` +
              `Открой страницу цели и добавь их вручную.`,
          );
          setSaving(false);
          return; // не закрываем диалог, чтобы пользователь увидел warning
        }
      }

      onOpenChange(false);
    } catch (e) {
      setErrors([(e as Error).message || 'Не удалось сохранить цель']);
    } finally {
      setSaving(false);
    }
  };

  const showDescriptionField = frameworkType !== 'smart'; // у SMART есть Specific + Relevant — отдельное Описание не нужно
  const showDeadlineField = frameworkType !== 'smart'; // у SMART срок внутри методики

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100vw-1rem)] sm:w-auto max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name={isEdit ? 'Pencil' : 'Target'} size={22} />
            {isEdit ? 'Редактировать цель' : 'Новая цель'}
          </DialogTitle>
          <DialogDescription>
            Длинная цель живёт в Мастерской и не дублируется в других разделах.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Название */}
          <div className="space-y-1.5">
            <Label>
              Название цели <span className="text-rose-500">*</span>
            </Label>
            <Input
              placeholder="Например: пробежать марафон, изучить английский, открыть своё дело"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
            />
          </div>

          {/* Описание (скрыто для SMART) */}
          {showDescriptionField && (
            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Textarea
                rows={2}
                placeholder="Зачем тебе эта цель?"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDirty(true);
                }}
              />
            </div>
          )}

          {/* Сфера / методика / срок */}
          <div className={`grid grid-cols-1 gap-3 ${showDeadlineField ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            <div className="space-y-1.5">
              <Label>Сфера жизни</Label>
              <Select
                value={sphere}
                onValueChange={(v) => {
                  setSphere(v);
                  setDirty(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Select value={frameworkType} onValueChange={handleFrameworkChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map((f) => (
                    <SelectItem key={f.type} value={f.type}>
                      <div className="flex items-center gap-2">
                        <Icon name={f.icon} size={14} /> {f.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {showDeadlineField && (
              <div className="space-y-1.5">
                <Label>Дедлайн</Label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    setDirty(true);
                  }}
                />
              </div>
            )}
          </div>

          {/* Sub-form методики */}
          <div className="rounded-2xl bg-slate-50/50 border border-slate-200 p-3">
            {frameworkType === 'generic' && (
              <p className="text-xs text-gray-500 italic">
                Без методики — просто длинная цель с описанием. Можешь добавить методику позже.
              </p>
            )}
            {frameworkType === 'smart' && (
              <SmartForm
                value={frameworkState as SmartFrameworkState}
                onChange={(v) => {
                  setFrameworkState(v);
                  setDirty(true);
                }}
              />
            )}
            {frameworkType === 'okr' && (
              <OkrForm
                value={frameworkState as OkrFrameworkState}
                onChange={(v) => {
                  setFrameworkState(v);
                  setDirty(true);
                }}
                keyResults={okrKrDrafts}
                onKeyResultsChange={(v) => {
                  setOkrKrDrafts(v);
                  setDirty(true);
                }}
              />
            )}
            {frameworkType === 'wheel' && (
              <WheelForm
                state={frameworkState as WheelFrameworkState}
                onStateChange={(v) => {
                  setFrameworkState(v);
                  setDirty(true);
                }}
                linkedSphereIds={linkedSphereIds}
                onLinkedChange={(v) => {
                  setLinkedSphereIds(v);
                  setDirty(true);
                }}
              />
            )}
          </div>

          {errors.length > 0 && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <Icon name="CircleAlert" size={12} /> Не получится сохранить:
              </div>
              {errors.map((e, i) => (
                <div key={i} className="ml-4">• {e}</div>
              ))}
            </div>
          )}

          {warning && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-start gap-2">
              <Icon name="TriangleAlert" size={14} className="mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          )}

          {initial && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge variant="outline">{initial.status}</Badge>
              <span>·</span>
              <span>прогресс {initial.progress}%</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Отмена
            </Button>
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

function buildInitialState(ft: FrameworkType, existing?: FrameworkState | null): FrameworkState {
  if (existing && Object.keys(existing).length > 0) {
    // нормализуем под текущий тип
    if (ft === 'smart') return { ...SMART_INITIAL, ...(existing as Partial<SmartFrameworkState>) };
    if (ft === 'okr') return { ...OKR_INITIAL, ...(existing as Partial<OkrFrameworkState>) };
    if (ft === 'wheel') return { ...WHEEL_INITIAL, ...(existing as Partial<WheelFrameworkState>) };
    return existing as Record<string, unknown>;
  }
  if (ft === 'smart') return { ...SMART_INITIAL };
  if (ft === 'okr') return { ...OKR_INITIAL };
  if (ft === 'wheel') return { ...WHEEL_INITIAL };
  return {};
}