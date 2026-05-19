// Sphere Detail (Sprint C / Wave 2 / Portfolio V1).
//
// Маршрут: /portfolio/:memberId/sphere/:sphereKey
//
// Контракт:
//   - hard dependency: portfolioApi.get(memberId)   — упал → page error
//   - soft dependency: lifeApi.listGoals()          — упал → soft fail
//                                                     в секции «Связанные цели»
//   - всё нормализуется через sphereDetailHelpers, страница ничего не считает
//   - page-shell в языке B.1/B.2: skeleton (без spinner), inline rose-alert
//   - секции — через PortfolioSection (B.2 контракт)
//   - deep-links из Radar/KeyHighlights подключаются отдельным шагом C.8

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import PortfolioSection from '@/components/portfolio/PortfolioSection';
import { portfolioApi } from '@/services/portfolioApi';
import { lifeApi } from '@/components/life-road/api';
import type { PortfolioData } from '@/types/portfolio.types';
import type { LifeGoal } from '@/components/life-road/types';
import { formatLastAggregated } from '@/lib/portfolio/portfolioHubHelpers';
import {
  getSphereMeta,
  buildSphereHero,
  buildSphereSummary,
  collectSphereStrengths,
  collectSphereGrowthZones,
  collectSphereSources,
  collectSphereAchievements,
  collectRelatedGoals,
  buildSphereNextSteps,
  formatSphereDelta,
  isSphereDataEmpty,
} from '@/lib/portfolio/sphereDetailHelpers';

type GoalsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; goals: LifeGoal[] }
  | { status: 'error'; message: string };

const GRADIENT = 'min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50';

export default function SphereDetail() {
  const { memberId, sphereKey } = useParams<{ memberId: string; sphereKey: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goalsState, setGoalsState] = useState<GoalsState>({ status: 'idle' });

  const load = useCallback(() => {
    if (!memberId) return;
    setLoading(true);
    setError(null);
    setGoalsState({ status: 'loading' });

    // allSettled-стиль: portfolio — hard, goals — soft.
    // Если goals упали, страница продолжает жить.
    Promise.allSettled([
      portfolioApi.get(memberId),
      lifeApi.listGoals(),
    ]).then(([p, g]) => {
      if (p.status === 'fulfilled') {
        setData(p.value);
        setError(null);
      } else {
        const err = p.reason as Error | undefined;
        setError(err?.message || 'Не удалось загрузить данные');
        setData(null);
      }

      if (g.status === 'fulfilled') {
        setGoalsState({ status: 'ok', goals: g.value });
      } else {
        const err = g.reason as Error | undefined;
        setGoalsState({
          status: 'error',
          message: err?.message || 'Не удалось получить список целей',
        });
      }

      setLoading(false);
    });
  }, [memberId]);

  useEffect(() => {
    load();
  }, [load]);

  // ─── View model (derive через helpers) ───────────────────────────────────
  const meta = useMemo(() => getSphereMeta(sphereKey ?? null, data), [sphereKey, data]);
  const hero = useMemo(() => buildSphereHero(sphereKey ?? null, data), [sphereKey, data]);
  const summary = useMemo(() => buildSphereSummary(sphereKey ?? null, data), [sphereKey, data]);
  const strengths = useMemo(() => collectSphereStrengths(sphereKey ?? null, data), [sphereKey, data]);
  const growthZones = useMemo(() => collectSphereGrowthZones(sphereKey ?? null, data), [sphereKey, data]);
  const sources = useMemo(() => collectSphereSources(sphereKey ?? null, data), [sphereKey, data]);
  const achievements = useMemo(() => collectSphereAchievements(sphereKey ?? null, data), [sphereKey, data]);
  const nextSteps = useMemo(() => buildSphereNextSteps(sphereKey ?? null, data), [sphereKey, data]);
  const isEmpty = useMemo(() => isSphereDataEmpty(sphereKey ?? null, data), [sphereKey, data]);
  const relatedGoals = useMemo(() => {
    if (goalsState.status !== 'ok') return [];
    return collectRelatedGoals(sphereKey ?? null, goalsState.goals, { memberId: memberId ?? null });
  }, [goalsState, sphereKey, memberId]);

  const deltaFmt = formatSphereDelta(hero.delta);
  const memberName = data?.member?.name ?? '';
  const updatedHuman = hero.updatedAtLabel
    ? formatLastAggregated(hero.updatedAtLabel)
    : data
      ? formatLastAggregated(data.last_aggregated_at)
      : null;

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={GRADIENT}>
        <main
          id="main"
          role="main"
          aria-busy="true"
          aria-live="polite"
          aria-label="Загрузка сферы развития"
          className="container mx-auto max-w-3xl px-3 sm:px-4 py-4 sm:py-6 space-y-4"
        >
          <span className="sr-only">Загружаем данные сферы развития…</span>
          <div className="h-6 w-2/3 rounded bg-slate-200 animate-pulse" aria-hidden="true" />
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 sm:p-5 shadow-sm" aria-hidden="true">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
                <div className="h-2 w-2/3 rounded bg-slate-100 animate-pulse mt-2" />
              </div>
            </div>
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className="h-28 rounded-2xl border border-white/60 bg-white/60 shadow-sm animate-pulse"
            />
          ))}
        </main>
      </div>
    );
  }

  // ─── Missing memberId (deep-link защита) ─────────────────────────────────
  if (!memberId) {
    return (
      <div className={GRADIENT}>
        <SEOHead title="Сфера развития" description="Sphere detail" />
        <main
          id="main"
          role="main"
          className="container mx-auto max-w-3xl px-3 sm:px-4 py-4 sm:py-6 space-y-4"
        >
          <BackBar memberId={undefined} />
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 sm:p-8 text-center space-y-3">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100"
                aria-hidden="true"
              >
                <Icon name="UserX" size={20} className="text-slate-500" />
              </div>
              <h1 className="text-base font-semibold text-slate-800">
                Не указан участник
              </h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Чтобы открыть сферу, нужно сначала выбрать участника на главной
                странице портфолио.
              </p>
              <div className="pt-2">
                <Button asChild variant="default" size="sm" className="min-h-[40px]">
                  <Link to="/portfolio">К списку участников</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ─── Page-level error (только если упал portfolioApi.get) ───────────────
  if (error || !data) {
    return (
      <div className={GRADIENT}>
        <main
          id="main"
          role="main"
          className="container mx-auto max-w-3xl px-3 sm:px-4 py-4 sm:py-6 space-y-4"
        >
          <BackBar memberId={memberId} />
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-2.5"
          >
            <Icon
              name="AlertCircle"
              size={16}
              aria-hidden="true"
              className="text-rose-600 mt-0.5 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-semibold text-rose-800 mb-0.5">
                Не удалось загрузить сферу
              </h1>
              <p className="text-xs text-rose-700 mb-2 break-words">
                {error || 'Данные не пришли. Попробуйте ещё раз.'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={load}
                  className="min-h-[40px] text-xs border-rose-300 text-rose-700 hover:bg-rose-100"
                >
                  <Icon name="RefreshCw" size={12} aria-hidden="true" className="mr-1" />
                  Повторить
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="min-h-[40px] text-xs text-rose-700 hover:bg-rose-100"
                >
                  <Link to={memberId ? `/portfolio/${memberId}` : '/portfolio'}>
                    Назад к портфолио
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Empty: невалидный sphereKey ─────────────────────────────────────────
  if (!meta.isValid) {
    return (
      <div className={GRADIENT}>
        <SEOHead title="Сфера не найдена" description="Sphere not found" />
        <main
          id="main"
          role="main"
          className="container mx-auto max-w-3xl px-3 sm:px-4 py-4 sm:py-6 space-y-4"
        >
          <BackBar memberId={memberId} />
          <Breadcrumbs memberId={memberId} memberName={memberName} sphereLabel="—" />
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 sm:p-8 text-center space-y-3">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100"
                aria-hidden="true"
              >
                <Icon name="Compass" size={20} className="text-slate-500" />
              </div>
              <h1 className="text-base font-semibold text-slate-800">
                Эта сфера не найдена
              </h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Возможно, ссылка устарела или в адресе опечатка. Вернитесь
                к портфолио и выберите сферу из радара.
              </p>
              <div className="pt-2">
                <Button asChild variant="default" size="sm" className="min-h-[40px]">
                  <Link to={memberId ? `/portfolio/${memberId}` : '/portfolio'}>
                    Назад к портфолио
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ─── Empty: валидный ключ, но недостаточно данных ───────────────────────
  if (isEmpty) {
    return (
      <div className={GRADIENT}>
        <SEOHead title={`${meta.label} · ${memberName}`} description="Sphere detail" />
        <main
          id="main"
          role="main"
          className="container mx-auto max-w-3xl px-3 sm:px-4 py-4 sm:py-6 space-y-4"
        >
          <BackBar memberId={memberId} />
          <Breadcrumbs memberId={memberId} memberName={memberName} sphereLabel={meta.label} />
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 sm:p-8 text-center space-y-3">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100"
                aria-hidden="true"
              >
                <Icon name={meta.icon} size={20} className="text-purple-600" fallback="Circle" />
              </div>
              <h1 className="text-base font-semibold text-slate-800">
                {meta.label}
              </h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Для этой сферы пока недостаточно данных. Добавьте наблюдения,
                пройдите тесты или зафиксируйте достижения — и здесь появится
                полная карта развития.
              </p>
              <div className="pt-2">
                <Button asChild variant="default" size="sm" className="min-h-[40px]">
                  <Link to={memberId ? `/portfolio/${memberId}` : '/portfolio'}>
                    Назад к портфолио
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ─── Success ─────────────────────────────────────────────────────────────
  const deltaIconName =
    deltaFmt.tone === 'positive'
      ? 'TrendingUp'
      : deltaFmt.tone === 'attention'
        ? 'TrendingDown'
        : 'Minus';
  const deltaSrLabel =
    deltaFmt.tone === 'positive'
      ? `Динамика: рост на ${deltaFmt.label}`
      : deltaFmt.tone === 'attention'
        ? `Динамика: снижение на ${deltaFmt.label}`
        : `Динамика: ${deltaFmt.label}`;

  return (
    <div className={GRADIENT}>
      <SEOHead title={`${meta.label} · ${memberName}`} description="Sphere detail" />
      <main
        id="main"
        role="main"
        aria-labelledby="sphere-title"
        className="container mx-auto max-w-3xl px-3 sm:px-4 py-4 sm:py-6 space-y-4"
      >
        <BackBar memberId={memberId} />
        <Breadcrumbs memberId={memberId} memberName={memberName} sphereLabel={meta.label} />

        {/* Hero */}
        <section
          aria-labelledby="sphere-title"
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 sm:p-5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 shrink-0"
            >
              <Icon name={meta.icon} size={22} className="text-purple-600" fallback="Circle" />
            </div>
            <div className="flex-1 min-w-0">
              <h1
                id="sphere-title"
                title={meta.label}
                className="text-lg sm:text-xl font-bold text-slate-900 break-words"
              >
                {meta.label}
              </h1>
              <div className="text-sm text-slate-600 mt-0.5">
                {hero.trendLabel}
                {hero.score !== null && (
                  <>
                    {' · '}
                    <span className="font-semibold text-slate-800">
                      <span className="sr-only">Текущий показатель: </span>
                      {hero.score}
                    </span>
                    <span className="text-xs text-slate-500"> / 100</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {hero.confidence !== null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    <Icon
                      name="Activity"
                      size={11}
                      aria-hidden="true"
                      className="text-slate-500"
                    />
                    Полнота {hero.confidence}%
                  </span>
                )}
                {deltaFmt.label !== '—' && (
                  <span
                    aria-label={deltaSrLabel}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      deltaFmt.tone === 'positive'
                        ? 'bg-emerald-50 text-emerald-700'
                        : deltaFmt.tone === 'attention'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon
                      name={deltaIconName}
                      size={11}
                      aria-hidden="true"
                      fallback="Minus"
                    />
                    <span aria-hidden="true">{deltaFmt.label}</span>
                  </span>
                )}
                {updatedHuman && (
                  <span className="text-xs text-slate-500">
                    <span className="sr-only">Дата обновления: </span>
                    Обновлено: {updatedHuman}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Что видно сейчас */}
        <PortfolioSection id="sphere-summary" label="Что видно сейчас" icon="Eye">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-5 space-y-1.5">
              <div className="text-sm font-semibold text-slate-800">
                {summary.headline}
              </div>
              <div className="text-sm text-slate-600 leading-snug">
                {summary.narrative}
              </div>
            </CardContent>
          </Card>
        </PortfolioSection>

        {/* Сильные сигналы */}
        {strengths.length > 0 && (
          <PortfolioSection id="sphere-strengths" label="Сильные сигналы" icon="Sparkles">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <ul role="list" className="space-y-2">
                  {strengths.map((s, i) => (
                    <li key={`${s.label}-${i}`} className="flex items-start gap-2">
                      <Icon
                        name={s.icon || 'Star'}
                        size={14}
                        aria-hidden="true"
                        className="text-emerald-600 mt-0.5 shrink-0"
                        fallback="Star"
                      />
                      <span className="text-sm text-slate-700 break-words min-w-0 flex-1">
                        {s.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </PortfolioSection>
        )}

        {/* Зоны роста */}
        {growthZones.length > 0 && (
          <PortfolioSection id="sphere-growth" label="Зоны роста" icon="TrendingUp">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <ul role="list" className="space-y-2">
                  {growthZones.map((g, i) => (
                    <li key={`${g.label}-${i}`} className="flex items-start gap-2">
                      <Icon
                        name={g.icon || 'Target'}
                        size={14}
                        aria-hidden="true"
                        className="text-amber-600 mt-0.5 shrink-0"
                        fallback="Target"
                      />
                      <span className="text-sm text-slate-700 break-words min-w-0 flex-1">
                        {g.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </PortfolioSection>
        )}

        {/* Что повлияло */}
        {sources.length > 0 && (
          <PortfolioSection id="sphere-sources" label="Что повлияло" icon="Search">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <ul role="list" className="space-y-2">
                  {sources.map((s, i) => (
                    <li
                      key={`${s.source_type}-${s.source_id ?? s.measured_at}-${i}`}
                      className="flex items-start gap-2"
                    >
                      <Icon
                        name="Dot"
                        size={14}
                        aria-hidden="true"
                        className="text-slate-400 mt-0.5 shrink-0"
                        fallback="Circle"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-slate-700 break-words">
                          {s.raw_value || s.metric_key}
                        </div>
                        <div className="text-xs text-slate-500 break-words">
                          {s.source_type} · {formatLastAggregated(s.measured_at) || s.measured_at}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </PortfolioSection>
        )}

        {/* Связанные цели (soft dependency) */}
        <PortfolioSection id="sphere-goals" label="Связанные цели" icon="Target">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              {goalsState.status === 'error' ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5"
                >
                  <Icon
                    name="AlertTriangle"
                    size={14}
                    aria-hidden="true"
                    className="text-amber-600 mt-0.5 shrink-0"
                  />
                  <div className="text-xs text-amber-800 min-w-0">
                    Не удалось загрузить список целей. Остальные данные сферы
                    доступны — список появится, когда соединение восстановится.
                  </div>
                </div>
              ) : relatedGoals.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Пока нет целей, связанных с этой сферой.
                </p>
              ) : (
                <ul role="list" className="space-y-2">
                  {relatedGoals.map((g) => (
                    <li key={g.id} className="flex items-start gap-2">
                      <Icon
                        name={g.status === 'paused' ? 'Pause' : 'Target'}
                        size={14}
                        aria-hidden="true"
                        className={
                          g.status === 'paused'
                            ? 'text-slate-400 mt-0.5 shrink-0'
                            : 'text-purple-600 mt-0.5 shrink-0'
                        }
                        fallback="Target"
                      />
                      <Link
                        to={`/workshop/goal/${g.id}`}
                        title={g.title}
                        className="text-sm text-slate-700 hover:text-purple-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 rounded min-w-0 flex-1 break-words"
                      >
                        {g.title}
                        {g.status === 'paused' && (
                          <span className="ml-1 text-xs text-slate-400">
                            (на паузе)
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </PortfolioSection>

        {/* Достижения */}
        {achievements.length > 0 && (
          <PortfolioSection id="sphere-achievements" label="Достижения" icon="Award">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <ul role="list" className="space-y-2">
                  {achievements.map((a) => (
                    <li key={a.id} className="flex items-start gap-2">
                      <Icon
                        name={a.icon || 'Trophy'}
                        size={14}
                        aria-hidden="true"
                        className="text-amber-500 mt-0.5 shrink-0"
                        fallback="Trophy"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-slate-700 break-words">
                          {a.title}
                        </div>
                        <div className="text-xs text-slate-500 break-words">
                          {formatLastAggregated(a.earned_at) || a.earned_at}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </PortfolioSection>
        )}

        {/* Следующий шаг */}
        <PortfolioSection id="sphere-next-steps" label="Следующий шаг" icon="ArrowRight">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <ul role="list" className="space-y-2">
                {nextSteps.map((s, i) => (
                  <li key={`${s.origin}-${i}`} className="flex items-start gap-2">
                    <Icon
                      name={s.origin === 'plan' ? 'ClipboardList' : s.origin === 'next_action' ? 'Zap' : 'Hourglass'}
                      size={14}
                      aria-hidden="true"
                      className={
                        s.origin === 'fallback'
                          ? 'text-slate-400 mt-0.5 shrink-0'
                          : 'text-purple-600 mt-0.5 shrink-0'
                      }
                      fallback="ArrowRight"
                    />
                    <span className="text-sm text-slate-700 break-words min-w-0 flex-1">
                      {s.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </PortfolioSection>

        {/* Footer back */}
        <div className="pt-2 pb-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(memberId ? `/portfolio/${memberId}` : '/portfolio')}
            className="min-h-[40px] text-slate-600"
          >
            <Icon name="ArrowLeft" size={14} aria-hidden="true" className="mr-1" />
            Назад к портфолио
          </Button>
        </div>
      </main>
    </div>
  );
}

// ─── small subcomponents ────────────────────────────────────────────────────

function BackBar({ memberId }: { memberId?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="min-h-[40px] px-2 text-gray-600"
      >
        <Link
          to={memberId ? `/portfolio/${memberId}` : '/portfolio'}
          aria-label={memberId ? 'Вернуться к портфолио участника' : 'Вернуться к списку портфолио'}
        >
          <Icon name="ArrowLeft" size={14} aria-hidden="true" className="mr-1" />
          Назад
        </Link>
      </Button>
    </div>
  );
}

function Breadcrumbs({
  memberId,
  memberName,
  sphereLabel,
}: {
  memberId?: string;
  memberName?: string;
  sphereLabel: string;
}) {
  return (
    <nav
      aria-label="Хлебные крошки"
      className="text-xs text-slate-500 flex items-center gap-1 flex-wrap"
    >
      <Link
        to="/portfolio"
        className="hover:text-purple-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 rounded"
      >
        Портфолио
      </Link>
      <span aria-hidden="true">/</span>
      {memberId && memberName ? (
        <Link
          to={`/portfolio/${memberId}`}
          title={memberName}
          className="hover:text-purple-700 hover:underline truncate max-w-[35%] sm:max-w-[40%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 rounded"
        >
          {memberName}
        </Link>
      ) : (
        <span className="text-slate-400" aria-hidden="true">
          …
        </span>
      )}
      <span aria-hidden="true">/</span>
      <span
        aria-current="page"
        title={sphereLabel}
        className="text-slate-700 font-medium truncate max-w-[55%] sm:max-w-[50%]"
      >
        {sphereLabel}
      </span>
    </nav>
  );
}