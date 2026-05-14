import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { lifeApi } from '@/components/life-road/api';
import { normalizeLegacyGoals } from '@/lib/goals/goalMappers';
import type { LifeGoal } from '@/components/life-road/types';

// Goals V1 Visual QA — внутренний deep-link manifest.
// Доступна только в dev (route регистрируется в App.tsx при import.meta.env.DEV).
// Никаких моков, никаких фейковых UI-состояний — только удобные ссылки на реальные
// сценарии и быстрый запуск smoke-runner'а.

type ConsoleLogLine = { kind: 'log' | 'error'; text: string };

interface ScenarioLink {
  id: string;
  area: 'smart' | 'okr' | 'wheel' | 'hub' | 'review';
  state: string;
  description: string;
  /** В runtime подменяется на путь, если найдена подходящая цель. */
  href?: string;
  /** Чем фильтровать цели на этой странице. */
  match?: (g: LifeGoal) => boolean;
  /** Совет, если кандидатов нет. */
  emptyHint?: string;
}

function frameworkOf(g: LifeGoal): string {
  return (
    g.frameworkType || (typeof g.framework === 'string' ? g.framework : 'generic')
  );
}

const STATIC_LINKS: ScenarioLink[] = [
  {
    id: 'focus-section',
    area: 'hub',
    state: 'normal',
    description: 'Focus — что делать сейчас (верх Workshop)',
    href: '/workshop',
  },
  {
    id: 'hub-normal',
    area: 'hub',
    state: 'normal',
    description: 'Workshop hub — основной список целей',
    href: '/workshop',
  },
  {
    id: 'hub-attention',
    area: 'hub',
    state: 'attention',
    description: 'Hub с фильтром "Внимание"',
    href: '/workshop?qa=attention',
  },
  {
    id: 'review',
    area: 'review',
    state: 'normal',
    description: 'Weekly Review — секция в Workshop (скролл вниз)',
    href: '/workshop',
  },
];

export default function DevGoalsQaPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ConsoleLogLine[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    lifeApi
      .listGoals()
      .then((rows) => setGoals(normalizeLegacyGoals(rows)))
      .catch(() => setGoals([]))
      .finally(() => setLoading(false));
  }, []);

  const linksByArea = useMemo(() => {
    const smart = goals.find((g) => frameworkOf(g) === 'smart');
    const okr = goals.find((g) => frameworkOf(g) === 'okr');
    const wheel = goals.find((g) => frameworkOf(g) === 'wheel');
    const overdue = goals.find(
      (g) => g.deadline && new Date(g.deadline).getTime() < Date.now(),
    );

    const dynamic: ScenarioLink[] = [
      {
        id: 'smart-normal',
        area: 'smart',
        state: 'normal',
        description: 'SMART-цель — открыть детали',
        href: smart ? `/workshop/goal/${smart.id}` : undefined,
        emptyHint: 'Создай SMART-цель',
      },
      {
        id: 'okr-normal',
        area: 'okr',
        state: 'normal',
        description: 'OKR-цель — открыть детали',
        href: okr ? `/workshop/goal/${okr.id}` : undefined,
        emptyHint: 'Создай OKR-цель',
      },
      {
        id: 'wheel-normal',
        area: 'wheel',
        state: 'normal',
        description: 'Wheel-цель — открыть детали',
        href: wheel ? `/workshop/goal/${wheel.id}` : undefined,
        emptyHint: 'Создай Wheel-цель',
      },
      {
        id: 'overdue-goal',
        area: 'hub',
        state: 'attention',
        description: 'Цель с просроченным дедлайном — открыть',
        href: overdue ? `/workshop/goal/${overdue.id}` : undefined,
        emptyHint: 'Поставь дедлайн в прошлом одной из целей',
      },
    ];

    return [...STATIC_LINKS, ...dynamic];
  }, [goals]);

  const runSmoke = async () => {
    setRunning(true);
    setLogs([]);
    // Перехватываем console во время прогона, чтобы вывести в UI.
    const origLog = console.log;
    const origErr = console.error;
    const buf: ConsoleLogLine[] = [];
    console.log = (...args: unknown[]) => {
      buf.push({ kind: 'log', text: args.map(String).join(' ') });
      origLog.apply(console, args as []);
    };
    console.error = (...args: unknown[]) => {
      buf.push({ kind: 'error', text: args.map(String).join(' ') });
      origErr.apply(console, args as []);
    };
    try {
      const mod = await import('@/lib/goals/__smokeTests__');
      await mod.runAllGoalsSmokeTests();
    } catch (e) {
      buf.push({ kind: 'error', text: `Smoke runner crashed: ${(e as Error).message}` });
    } finally {
      console.log = origLog;
      console.error = origErr;
      setLogs(buf);
      setRunning(false);
    }
  };

  const totalGoals = goals.length;
  const byFramework = {
    smart: goals.filter((g) => frameworkOf(g) === 'smart').length,
    okr: goals.filter((g) => frameworkOf(g) === 'okr').length,
    wheel: goals.filter((g) => frameworkOf(g) === 'wheel').length,
    generic: goals.filter((g) => !['smart', 'okr', 'wheel'].includes(frameworkOf(g)))
      .length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Icon name="FlaskConical" size={18} />
          </span>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-gray-900">
              Goals V1 — Visual QA manifest
            </h1>
            <p className="text-xs text-gray-500">
              Dev-only. См. <code>docs/goals/GOALS_V1_VISUAL_QA.md</code> и{' '}
              <code>docs/goals/GOALS_V1_SIGNOFF.md</code>.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">DEV ONLY</Badge>
        </div>

        {/* Состояние */}
        <div className="bg-white rounded-2xl border p-3 shadow-sm">
          <div className="text-xs font-semibold text-gray-700 mb-2">Состояние профиля</div>
          {loading ? (
            <div className="text-xs text-gray-400 italic">Загружаем…</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              <Tile label="Всего" value={totalGoals} />
              <Tile label="SMART" value={byFramework.smart} />
              <Tile label="OKR" value={byFramework.okr} />
              <Tile label="Wheel" value={byFramework.wheel} />
              <Tile label="Прочие" value={byFramework.generic} />
            </div>
          )}
        </div>

        {/* Deep-link сценарии */}
        <div className="bg-white rounded-2xl border p-3 shadow-sm">
          <div className="text-xs font-semibold text-gray-700 mb-2">Deep-link сценарии</div>
          <ul className="space-y-1.5">
            {linksByArea.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  disabled={!l.href}
                  onClick={() => l.href && navigate(l.href)}
                  className={
                    'w-full text-left flex items-center gap-2 rounded-lg border p-2 text-xs transition-all ' +
                    (l.href
                      ? 'bg-white hover:bg-purple-50 hover:border-purple-200 border-gray-200'
                      : 'bg-slate-50 border-slate-200 text-gray-400 cursor-not-allowed')
                  }
                >
                  <Badge variant="outline" className="text-[9px] uppercase">
                    {l.area}
                  </Badge>
                  <Badge variant="secondary" className="text-[9px]">
                    {l.state}
                  </Badge>
                  <span className="flex-1 min-w-0 truncate">{l.description}</span>
                  {l.href ? (
                    <Icon name="ArrowRight" size={12} className="text-gray-400" />
                  ) : (
                    <span className="text-[10px] italic">{l.emptyHint}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Smoke runner */}
        <div className="bg-white rounded-2xl border p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="text-xs font-semibold text-gray-700">Smoke runner</div>
            <Button
              size="sm"
              onClick={runSmoke}
              disabled={running}
              className="h-7 text-xs"
              aria-busy={running}
            >
              {running ? (
                <>
                  <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
                  Запускаем…
                </>
              ) : (
                <>
                  <Icon name="Play" size={12} className="mr-1" />
                  Запустить smoke
                </>
              )}
            </Button>
          </div>
          <p className="text-[10px] text-gray-400 mb-2">
            Эквивалентно{' '}
            <code>
              import('@/lib/goals/__smokeTests__').then(m =&gt; m.runAllGoalsSmokeTests())
            </code>{' '}
            в консоли.
          </p>
          <div className="rounded-lg bg-slate-900 text-slate-100 p-2 text-[11px] font-mono max-h-[260px] overflow-auto whitespace-pre-wrap">
            {logs.length === 0 ? (
              <span className="text-slate-500 italic">Логи появятся после запуска</span>
            ) : (
              logs.map((l, i) => (
                <div
                  key={i}
                  className={l.kind === 'error' ? 'text-rose-300' : 'text-slate-100'}
                >
                  {l.text}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-[11px] text-gray-400 text-center italic">
          Goals V1 — QA manifest · только dev-окружение
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 p-2 bg-gradient-to-br from-slate-50 to-white">
      <div className="text-[10px] text-gray-500 uppercase">{label}</div>
      <div className="text-lg font-extrabold text-gray-900 tabular-nums">{value}</div>
    </div>
  );
}