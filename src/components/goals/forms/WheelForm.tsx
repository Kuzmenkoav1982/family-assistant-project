import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { BALANCE_SPHERES } from '@/components/life-road/frameworks';
import { lifeApi } from '@/components/life-road/api';

// Каноническая форма Wheel.
// frameworkState = { baselineScores, currentScores, targetScores, steps }
// linkedSphereIds = выбранные сферы (массив id).
// Baseline НЕ подставляем нулём — если нет данных, оставляем null + helper text.

export interface WheelFrameworkState {
  baselineScores: Record<string, number | null>;
  currentScores: Record<string, number | null>;
  targetScores: Record<string, number | null>;
  steps: Record<string, string[]>;
}

export const WHEEL_INITIAL: WheelFrameworkState = {
  baselineScores: {},
  currentScores: {},
  targetScores: {},
  steps: {},
};

export function validateWheel(linkedSphereIds: string[]): string[] {
  const errors: string[] = [];
  if (linkedSphereIds.length === 0) errors.push('Выбери хотя бы одну сферу');
  return errors;
}

interface Props {
  state: WheelFrameworkState;
  onStateChange: (next: WheelFrameworkState) => void;
  linkedSphereIds: string[];
  onLinkedChange: (next: string[]) => void;
}

export default function WheelForm({ state, onStateChange, linkedSphereIds, onLinkedChange }: Props) {
  const [snapshotScores, setSnapshotScores] = useState<Record<string, number> | null>(null);
  const [snapshotLoaded, setSnapshotLoaded] = useState(false);

  // Подтягиваем последний snapshot Колеса для подсказки baseline.
  useEffect(() => {
    let cancelled = false;
    lifeApi
      .listBalance()
      .then((snapshots) => {
        if (cancelled) return;
        const last = snapshots?.[0];
        setSnapshotScores(last?.scores ?? null);
      })
      .catch(() => {
        if (!cancelled) setSnapshotScores(null);
      })
      .finally(() => {
        if (!cancelled) setSnapshotLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSphere = (sphereId: string) => {
    if (linkedSphereIds.includes(sphereId)) {
      onLinkedChange(linkedSphereIds.filter((s) => s !== sphereId));
      // не очищаем state — оставляем данные на случай, если пользователь вернёт сферу
    } else {
      onLinkedChange([...linkedSphereIds, sphereId]);
      // префилл baseline из snapshot, если есть
      const snap = snapshotScores?.[sphereId];
      if (typeof snap === 'number' && state.baselineScores[sphereId] === undefined) {
        onStateChange({
          ...state,
          baselineScores: { ...state.baselineScores, [sphereId]: snap },
          currentScores: { ...state.currentScores, [sphereId]: snap },
        });
      }
    }
  };

  const setScore = (kind: 'baselineScores' | 'currentScores' | 'targetScores', sphereId: string, val: string) => {
    const num = val === '' ? null : Math.max(0, Math.min(10, Number(val)));
    onStateChange({ ...state, [kind]: { ...state[kind], [sphereId]: num } });
  };

  const setStep = (sphereId: string, idx: number, text: string) => {
    const current = state.steps[sphereId] || ['', '', ''];
    const next = [...current];
    next[idx] = text;
    onStateChange({ ...state, steps: { ...state.steps, [sphereId]: next } });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-2 text-[11px] text-emerald-700 flex items-start gap-1.5">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0" />
        <span>
          Колесо баланса = одна цель по нескольким связанным сферам жизни. Выбери 1+ сферу, укажи
          где ты сейчас (1-10) и куда хочешь прийти. Это будет одна цель, не 8.
        </span>
      </div>

      {/* Выбор сфер */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-emerald-700">
          Сферы <span className="text-rose-500">*</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {BALANCE_SPHERES.map((s) => {
            const selected = linkedSphereIds.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSphere(s.id)}
                className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-xs transition-colors ${
                  selected
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-semibold'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]"
                  style={{ background: s.color }}
                >
                  <Icon name={s.icon} size={10} />
                </div>
                {s.label}
                {selected && <Icon name="Check" size={12} className="ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Поля по выбранным сферам */}
      {linkedSphereIds.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-emerald-700">Оценки и шаги по сферам</Label>
          {linkedSphereIds.map((sid) => {
            const sphere = BALANCE_SPHERES.find((s) => s.id === sid);
            if (!sphere) return null;
            const baseline = state.baselineScores[sid];
            const current = state.currentScores[sid];
            const target = state.targetScores[sid];
            const steps = state.steps[sid] || ['', '', ''];
            const snap = snapshotScores?.[sid];
            const hasSnap = typeof snap === 'number';

            return (
              <div key={sid} className="rounded-xl bg-white border border-emerald-100 p-2.5 space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                    style={{ background: sphere.color }}
                  >
                    <Icon name={sphere.icon} size={12} />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{sphere.label}</span>
                  {hasSnap && (
                    <span className="text-[10px] text-gray-400 ml-auto">
                      Замер из Колеса: {snap}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <Label className="text-[10px] text-gray-500">Базово (1-10)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      className="h-7 text-xs"
                      placeholder={hasSnap ? String(snap) : '—'}
                      value={baseline ?? ''}
                      onChange={(e) => setScore('baselineScores', sid, e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-gray-500">Сейчас</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      className="h-7 text-xs"
                      placeholder="—"
                      value={current ?? ''}
                      onChange={(e) => setScore('currentScores', sid, e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-gray-500">Цель</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      className="h-7 text-xs"
                      placeholder="—"
                      value={target ?? ''}
                      onChange={(e) => setScore('targetScores', sid, e.target.value)}
                    />
                  </div>
                </div>

                {!hasSnap && snapshotLoaded && baseline === null && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 rounded p-1.5 flex items-start gap-1">
                    <Icon name="TriangleAlert" size={10} className="mt-0.5 flex-shrink-0" />
                    Нет замера по сфере. Укажи текущее состояние вручную (или сделай замер в Колесе позже).
                  </p>
                )}

                <div>
                  <Label className="text-[10px] text-gray-500">1-3 микро-шага</Label>
                  <div className="space-y-1">
                    {[0, 1, 2].map((i) => (
                      <Textarea
                        key={i}
                        rows={1}
                        placeholder={`Шаг ${i + 1}`}
                        className="text-xs min-h-[28px] resize-none"
                        value={steps[i] || ''}
                        onChange={(e) => setStep(sid, i, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
