import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import SEOHead from '@/components/SEOHead';
import SectionAIAdvisor from '@/components/SectionAIAdvisor';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { calculatePariResults, getOverallScore, PARI_SCALES, type PariScaleResult } from '@/data/pariTestData';
import func2url from '../../backend/func2url.json';

const API = (func2url as Record<string, string>)['child-assessment'];

interface LocationState {
  answers?: Record<number, number>;
  scaleResults?: PariScaleResult[];
  overall?: { score: number; label: string; color: string };
}

interface CompactScale {
  key: string;
  title: string;
  percent: number;
  isHealthy: boolean;
}

interface PreviousResult {
  id: string;
  overall_score: number;
  overall_label: string;
  scale_results: CompactScale[];
  created_at: string;
}

export default function PariResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const state = location.state as LocationState | null;

  const [scaleResults, setScaleResults] = useState<PariScaleResult[]>(state?.scaleResults || []);
  const [overall, setOverall] = useState(state?.overall || null);
  const [loading, setLoading] = useState(!state?.scaleResults);
  const [error, setError] = useState('');
  const [previous, setPrevious] = useState<PreviousResult | null>(null);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = localStorage.getItem('authToken') || '';
        const res = await fetch(`${API}?section=pari`, { headers: { 'X-Auth-Token': token } });
        if (!res.ok) return;
        const json = await res.json();
        const all: PreviousResult[] = json.results || [];
        setHistoryCount(all.length);
        const sorted = [...all].sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
        const currentIdx = sorted.findIndex((r) => r.id === id);
        const prev = currentIdx >= 0 ? sorted[currentIdx + 1] : sorted[1] || sorted[0];
        if (prev && prev.id !== id) setPrevious(prev);
      } catch {
        // молча игнорируем — динамика опциональна
      }
    };

    if (state?.scaleResults && state.scaleResults.length > 0) {
      setLoading(false);
      loadHistory();
      return;
    }
    if (!id || id === 'local') {
      setError('Результаты теста не найдены');
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const token = localStorage.getItem('authToken') || '';
        const res = await fetch(`${API}?section=pari`, { headers: { 'X-Auth-Token': token } });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Ошибка загрузки');
        const all: PreviousResult[] = json.results || [];
        setHistoryCount(all.length);
        const item = all.find((r: { id: string }) => r.id === id);
        if (!item) throw new Error('Результат не найден');
        const sorted = [...all].sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
        const currentIdx = sorted.findIndex((r) => r.id === id);
        const prev = currentIdx >= 0 ? sorted[currentIdx + 1] : null;
        if (prev) setPrevious(prev);
        const itemWithAnswers = item as PreviousResult & { answers?: Record<number, number> };
        if (itemWithAnswers.answers) {
          const computed = calculatePariResults(itemWithAnswers.answers);
          const ov = getOverallScore(computed);
          setScaleResults(computed);
          setOverall(ov);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, state]);

  const previousMap = useMemo(() => {
    const m = new Map<string, number>();
    if (previous?.scale_results) {
      for (const s of previous.scale_results) m.set(s.key, s.percent);
    }
    return m;
  }, [previous]);

  const overallDelta = useMemo(() => {
    if (!previous || !overall) return null;
    return overall.score - previous.overall_score;
  }, [previous, overall]);

  const radarData = useMemo(
    () =>
      scaleResults.map((r) => ({
        scale: r.scale.title,
        fullName: r.scale.title,
        value: r.scale.goodWhen === 'high' ? r.percent : 100 - r.percent,
        raw: r.percent,
      })),
    [scaleResults]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Загружаем результаты...</p>
      </div>
    );
  }

  if (error || !overall || scaleResults.length === 0) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center gap-3">
        <Icon name="AlertCircle" size={40} className="text-amber-500" />
        <p className="text-sm text-muted-foreground text-center">{error || 'Нет данных'}</p>
        <Button onClick={() => navigate('/pari-test')}>Пройти тест</Button>
      </div>
    );
  }

  const problemAreas = scaleResults.filter((r) => !r.isHealthy);
  const strengths = scaleResults.filter((r) => r.isHealthy);

  return (
    <>
      <SEOHead
        title="Зеркало родителя — результаты"
        description="Ваш профиль детско-родительских отношений"
        path="/pari-results"
      />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50/40 to-white pb-24">
        <div className="max-w-3xl mx-auto p-4 space-y-5">
          <SectionHero
            title="Зеркало родителя"
            subtitle="Результаты диагностики"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/364dd778-d8dc-4105-a314-da0ca595ed73.jpg"
            backPath="/family-matrix"
          />

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent">
            <CardContent className="p-5 text-center space-y-3">
              <div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-extrabold text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${overall.color}, ${overall.color}dd)` }}
              >
                {overall.score}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Общий уровень контакта</p>
                <p className="text-base font-bold mt-0.5" style={{ color: overall.color }}>
                  {overall.label}
                </p>
              </div>
              {previous && overallDelta !== null && (
                <div className="pt-3 border-t border-purple-200/50">
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-muted-foreground">Было</p>
                      <p className="font-bold text-muted-foreground">{previous.overall_score}</p>
                    </div>
                    <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-muted-foreground">Стало</p>
                      <p className="font-bold" style={{ color: overall.color }}>{overall.score}</p>
                    </div>
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full font-bold ${
                        overallDelta > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : overallDelta < 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon
                        name={overallDelta > 0 ? 'TrendingUp' : overallDelta < 0 ? 'TrendingDown' : 'Minus'}
                        size={14}
                      />
                      <span>{overallDelta > 0 ? '+' : ''}{overallDelta}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    с {new Date(previous.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
              )}
              {!previous && historyCount <= 1 && (
                <p className="text-[11px] text-muted-foreground pt-2 border-t border-purple-200/50">
                  Это ваше первое прохождение. Пройдите тест ещё раз через 2-4 недели — увидите динамику
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Icon name="Radar" size={18} className="text-purple-600" />
                <h3 className="font-bold text-sm">Профиль по шкалам</h3>
              </div>
              <div className="h-80 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                    <PolarGrid strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="scale" tick={<MultilineTick />} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Здоровье" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                    <Tooltip
                      formatter={(_v: number, _n, p: { payload?: { fullName: string; raw: number } }) =>
                        p.payload ? [`${p.payload.raw}%`, p.payload.fullName] : ['', '']
                      }
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                Чем больше площадь — тем здоровее ваши родительские установки
              </p>
            </CardContent>
          </Card>

          {strengths.length > 0 && (
            <section className="space-y-2">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Icon name="Sparkles" size={16} className="text-emerald-600" />
                Ваши сильные стороны ({strengths.length})
              </h3>
              <div className="space-y-2">
                {strengths.map((r) => (
                  <ScaleResultCard key={r.scale.key} result={r} prevPercent={previousMap.get(r.scale.key)} />
                ))}
              </div>
            </section>
          )}

          {problemAreas.length > 0 && (
            <section className="space-y-2">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Icon name="Target" size={16} className="text-rose-600" />
                Зоны роста ({problemAreas.length})
              </h3>
              <div className="space-y-2">
                {problemAreas.map((r) => (
                  <ScaleResultCard key={r.scale.key} result={r} prevPercent={previousMap.get(r.scale.key)} />
                ))}
              </div>
            </section>
          )}

          <SectionAIAdvisor
            role="psychologist"
            title="Разбор с психологом-ИИ"
            description="Персональный план по итогам теста «Зеркало родителя»"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/364dd778-d8dc-4105-a314-da0ca595ed73.jpg"
            gradientFrom="from-purple-500"
            gradientTo="to-pink-500"
            accentBg="bg-purple-50"
            accentText="text-purple-700"
            accentBorder="border-purple-200"
            placeholder="Спросите о результатах теста..."
            sectionContext={buildPariAIContext(overall, scaleResults, problemAreas, strengths)}
            quickQuestions={buildPariQuickQuestions(problemAreas)}
          />

          {historyCount > 1 && (
            <div className="text-center text-xs text-muted-foreground">
              <Icon name="History" size={12} className="inline mr-1" />
              Всего прохождений: {historyCount}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/pari-test')}>
              <Icon name="RotateCcw" size={16} className="mr-1" />
              Пройти ещё раз
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate('/family-matrix')}>
              <Icon name="Home" size={16} className="mr-1" />К Семейному коду
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function ScaleResultCard({ result, prevPercent }: { result: PariScaleResult; prevPercent?: number }) {
  const [open, setOpen] = useState(false);
  const { scale, percent, isHealthy, recommendations } = result;
  const displayPercent = scale.goodWhen === 'high' ? percent : 100 - percent;
  const prevDisplay = prevPercent != null
    ? (scale.goodWhen === 'high' ? prevPercent : 100 - prevPercent)
    : null;
  const delta = prevDisplay != null ? displayPercent - prevDisplay : null;

  return (
    <Card
      className={`border-2 cursor-pointer transition-all ${
        isHealthy ? 'border-emerald-200 hover:border-emerald-300' : 'border-rose-200 hover:border-rose-300'
      }`}
      onClick={() => setOpen((o) => !o)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: scale.color + '22' }}
          >
            <Icon name={scale.icon} size={18} style={{ color: scale.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm truncate">{scale.title}</p>
              <div className="flex items-center gap-1.5 shrink-0">
                {delta != null && delta !== 0 && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      delta > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    <Icon name={delta > 0 ? 'ArrowUp' : 'ArrowDown'} size={10} />
                    {Math.abs(delta)}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={isHealthy ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}
                >
                  {displayPercent}%
                </Badge>
              </div>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${displayPercent}%`, backgroundColor: scale.color }}
              />
            </div>
          </div>
          <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground shrink-0" />
        </div>

        {open && (
          <div className="mt-3 pt-3 border-t space-y-2 text-xs">
            <p className="text-muted-foreground">{scale.description}</p>
            <div className="space-y-1.5">
              <p className="font-semibold text-foreground">
                {isHealthy ? 'Что поддерживает' : 'Рекомендации'}
              </p>
              <ul className="space-y-1">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <Icon
                      name={isHealthy ? 'Check' : 'ArrowRight'}
                      size={12}
                      className={`mt-0.5 shrink-0 ${isHealthy ? 'text-emerald-600' : 'text-rose-600'}`}
                    />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// suppress unused warning for PARI_SCALES import (kept for potential future use)
void PARI_SCALES;

interface TickProps {
  payload?: { value?: string };
  x?: number;
  y?: number;
  textAnchor?: string;
  cx?: number;
  cy?: number;
}

function MultilineTick(props: TickProps) {
  const { payload, x = 0, y = 0, textAnchor = 'middle', cx = 0, cy = 0 } = props;
  const text = payload?.value || '';
  const words = text.split(' ');

  let lines: string[] = [];
  if (words.length === 1) {
    lines = [words[0]];
  } else if (words.length === 2) {
    lines = words;
  } else {
    const mid = Math.ceil(words.length / 2);
    lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }

  const dy = y > cy ? 12 : -4;
  const offset = lines.length > 1 ? -6 : 0;

  return (
    <text x={x} y={y + dy + offset} textAnchor={textAnchor} fill="#475569" fontSize={10}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 12}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function buildPariAIContext(
  overall: { score: number; label: string } | null,
  scaleResults: PariScaleResult[],
  problemAreas: PariScaleResult[],
  strengths: PariScaleResult[]
): string {
  if (!overall || scaleResults.length === 0) return '';

  const formatScale = (r: PariScaleResult) => {
    const display = r.scale.goodWhen === 'high' ? r.percent : 100 - r.percent;
    return `- ${r.scale.title}: ${display}% (${r.scale.description})`;
  };

  return `КОНТЕКСТ: Пользователь только что прошёл научный тест PARI Шефера-Белла на родительские установки. Используй эти результаты для персональных советов.

ОБЩИЙ УРОВЕНЬ КОНТАКТА: ${overall.score}/100 — ${overall.label}

СИЛЬНЫЕ СТОРОНЫ (${strengths.length}):
${strengths.map(formatScale).join('\n') || 'нет'}

ЗОНЫ РОСТА (${problemAreas.length}):
${problemAreas.map(formatScale).join('\n') || 'нет'}

ИНСТРУКЦИЯ:
- Опирайся на результаты теста при ответах
- Давай конкретные техники именно для зон роста
- Не повторяй полностью данные теста — пользователь их видит
- Используй эмпатичный тон, без диагнозов
- Если просят план — предлагай пошаговые действия на 2-4 недели`;
}

function buildPariQuickQuestions(problemAreas: PariScaleResult[]): string[] {
  const base = [
    'Составь план работы на 2 недели',
    'С чего начать улучшать контакт с ребёнком?',
  ];

  const fromProblems = problemAreas.slice(0, 3).map(
    (r) => `Как работать с зоной "${r.scale.title}"?`
  );

  return [...fromProblems, ...base].slice(0, 5);
}