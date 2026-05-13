import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { lifeApi } from '@/components/life-road/api';
import { BALANCE_SPHERES } from '@/components/life-road/frameworks';
import type { GoalCheckin, GoalKeyResult, LifeGoal } from '@/components/life-road/types';
import GoalCheckinDialog from './GoalCheckinDialog';

interface Props {
  goal: LifeGoal;
  keyResults: GoalKeyResult[];
  refreshKey?: number;
  /** ID только что созданного check-in — подсвечиваем его строку, когда она реально появится в списке. */
  highlightCheckinId?: string;
  /** Колбэк родителю: «подсветку отыграли, можно сбросить pending id». */
  onHighlightConsumed?: () => void;
}

// Лента последних 5 check-in. История не перерисовывается задним числом —
// данные snapshot хранятся в data jsonb на момент записи.

export default function GoalCheckinsCard({
  goal,
  keyResults,
  refreshKey,
  highlightCheckinId,
  onHighlightConsumed,
}: Props) {
  const [checkins, setCheckins] = useState<GoalCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // Реально подсвечиваемый id — ставится только когда строка появилась в данных.
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const reload = async () => {
    if (!goal.id) return;
    setLoading(true);
    setError(null);
    try {
      const list = await lifeApi.listCheckins(goal.id);
      setCheckins(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal.id, refreshKey]);

  // Подсвечиваем строку только когда она реально пришла в данных.
  // Не зависим от индекса/сортировки — только от совпадения id.
  useEffect(() => {
    if (!highlightCheckinId) return;
    const found = checkins.some((c) => c.id === highlightCheckinId);
    if (!found) return;
    setHighlightedId(highlightCheckinId);
    onHighlightConsumed?.();
    const t = setTimeout(() => setHighlightedId(null), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightCheckinId, checkins]);

  const recent = checkins.slice(0, 5);

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center">
          <Icon name="CalendarHeart" size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-900">Check-ins</div>
          <div className="text-[11px] text-gray-500">Сверка по недели — без влияния на прогресс</div>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Icon name="Plus" size={12} className="mr-1" /> Новый check-in
        </Button>
      </div>

      {loading && (
        <div className="text-xs text-gray-400 italic flex items-center gap-2">
          <Icon name="Loader2" size={12} className="animate-spin" /> Загружаем историю...
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</div>
      )}

      {!loading && !error && recent.length === 0 && (
        <div className="text-xs text-gray-400 italic rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
          Пока нет записей. Сделай первый check-in — это поможет видеть путь, а не только текущий снимок.
        </div>
      )}

      {recent.length > 0 && (
        <div className="space-y-2">
          {recent.map((c) => (
            <CheckinRow key={c.id} checkin={c} highlighted={c.id === highlightedId} />
          ))}
          {checkins.length > 5 && (
            <div className="text-[10px] text-gray-400 italic text-center">
              Показаны последние 5 из {checkins.length}
            </div>
          )}
        </div>
      )}

      <GoalCheckinDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={goal}
        keyResults={keyResults}
        onSaved={() => reload()}
      />
    </div>
  );
}

// Безопасно достаёт краткую сводку для SMART-замера.
// Возвращает null, если это не SMART-замер или данных недостаточно.
function getSmartMetricSummary(
  checkin: GoalCheckin,
): { label: string; prev: number | null; next: number; unit: string } | null {
  const data = checkin.data as
    | {
        kind?: string;
        metric?: string | null;
        unit?: string | null;
        previousValue?: number | null;
        currentValue?: number | null;
      }
    | null
    | undefined;
  if (!data || data.kind !== 'smart-metric-checkin') return null;
  const next =
    typeof data.currentValue === 'number' && !Number.isNaN(data.currentValue)
      ? data.currentValue
      : null;
  if (next === null) return null;
  const prev =
    typeof data.previousValue === 'number' && !Number.isNaN(data.previousValue)
      ? data.previousValue
      : null;
  const label = (data.metric ?? '').trim() || 'метрика';
  const unit = (data.unit ?? '').trim();
  return { label, prev, next, unit };
}

function CheckinRow({ checkin, highlighted }: { checkin: GoalCheckin; highlighted?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const snapshot = (checkin.data as { snapshot?: Record<string, unknown> })?.snapshot;
  const created = checkin.createdAt ? new Date(checkin.createdAt) : null;
  const smart = getSmartMetricSummary(checkin);

  return (
    <div
      className={
        'rounded-xl border p-2.5 transition-colors duration-700 ' +
        (highlighted
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-white border-gray-100')
      }
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon name="MessageCircle" size={12} className="text-amber-600" />
        {created && (
          <span className="text-[10px] text-gray-500">{created.toLocaleDateString('ru-RU')}</span>
        )}
        {smart && (
          <Badge variant="outline" className="text-[9px] border-blue-300 text-blue-700">
            замер метрики
          </Badge>
        )}
        {typeof checkin.selfAssessment === 'number' && (
          <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-700">
            самооценка {checkin.selfAssessment}/10
          </Badge>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-auto text-[10px] text-gray-400 hover:text-gray-700"
        >
          {expanded ? 'свернуть' : 'подробнее'}
        </button>
      </div>

      {smart ? (
        <div className="text-xs text-gray-800 mb-1">
          <Icon name="Gauge" size={11} className="inline-block text-blue-700 mr-1 -mt-0.5" />
          <span className="font-semibold">{smart.label}:</span>{' '}
          {smart.prev !== null ? (
            <>
              {smart.prev} <span className="text-gray-400">→</span> {smart.next}
            </>
          ) : (
            <>{smart.next}</>
          )}
          {smart.unit ? ` ${smart.unit}` : ''}
        </div>
      ) : (
        checkin.summary && (
          <div className="text-xs text-gray-800 mb-1">
            <b className="text-emerald-700">+</b> {checkin.summary}
          </div>
        )
      )}
      {checkin.blockers && (
        <div className="text-xs text-gray-700 mb-1">
          <b className="text-rose-700">!</b> {checkin.blockers}
        </div>
      )}
      {checkin.nextStep && (
        <div className="text-xs text-gray-700">
          <b className="text-blue-700">→</b> {checkin.nextStep}
        </div>
      )}

      {expanded && snapshot && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
          <div className="font-semibold mb-1">Снимок на момент записи:</div>
          <SnapshotPreview snapshot={snapshot} />
        </div>
      )}
    </div>
  );
}

function SnapshotPreview({ snapshot }: { snapshot: Record<string, unknown> }) {
  const ft = snapshot.frameworkType as string | undefined;
  if (ft === 'smart') {
    const s = snapshot as {
      metric?: string;
      unit?: string;
      currentValue?: number | null;
      targetValue?: number | null;
    };
    return (
      <div>
        {s.metric || 'метрика'}: {s.currentValue ?? '—'} / {s.targetValue ?? '—'} {s.unit || ''}
      </div>
    );
  }
  if (ft === 'okr') {
    const krs = (snapshot.keyResults as Array<{
      title?: string;
      currentValue?: number;
      targetValue?: number;
      unit?: string;
    }>) || [];
    return (
      <div className="space-y-0.5">
        {krs.map((k, i) => (
          <div key={i}>
            • {k.title}: {k.currentValue}/{k.targetValue} {k.unit || ''}
          </div>
        ))}
      </div>
    );
  }
  if (ft === 'wheel') {
    const baseline = (snapshot.baselineScores as Record<string, number | null>) || {};
    const current = (snapshot.currentScores as Record<string, number | null>) || {};
    const linked = (snapshot.linkedSphereIds as string[]) || [];
    return (
      <div className="flex flex-wrap gap-1">
        {linked.map((sid) => {
          const sphere = BALANCE_SPHERES.find((s) => s.id === sid);
          return (
            <span key={sid}>
              {sphere?.label ?? sid}: {baseline[sid] ?? '—'} → {current[sid] ?? '—'};{' '}
            </span>
          );
        })}
      </div>
    );
  }
  return <div className="italic">без контекста</div>;
}