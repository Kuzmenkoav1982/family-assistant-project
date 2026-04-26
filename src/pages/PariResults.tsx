import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import SEOHead from '@/components/SEOHead';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { calculatePariResults, getOverallScore, PARI_SCALES, type PariScaleResult } from '@/data/pariTestData';
import func2url from '../../backend/func2url.json';

const API = (func2url as Record<string, string>)['child-assessment'];

interface LocationState {
  answers?: Record<number, number>;
  scaleResults?: PariScaleResult[];
  overall?: { score: number; label: string; color: string };
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

  useEffect(() => {
    if (state?.scaleResults && state.scaleResults.length > 0) {
      setLoading(false);
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
        const res = await fetch(`${API}?section=pari`, {
          headers: { 'X-Auth-Token': token },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Ошибка загрузки');
        const item = (json.results || []).find((r: { id: string }) => r.id === id);
        if (!item) throw new Error('Результат не найден');
        if (item.answers) {
          const computed = calculatePariResults(item.answers);
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

  const radarData = useMemo(
    () =>
      scaleResults.map((r) => ({
        scale: r.scale.title.length > 14 ? r.scale.title.slice(0, 12) + '…' : r.scale.title,
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
        title="Результаты теста PARI"
        description="Ваш профиль детско-родительских отношений"
        path="/pari-results"
      />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50/40 to-white pb-24">
        <div className="max-w-3xl mx-auto p-4 space-y-5">
          <SectionHero
            title="Ваш семейный код"
            subtitle="Результаты диагностики"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/364dd778-d8dc-4105-a314-da0ca595ed73.jpg"
            backPath="/development-hub"
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
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Icon name="Radar" size={18} className="text-purple-600" />
                <h3 className="font-bold text-sm">Профиль по шкалам</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="scale" tick={{ fontSize: 10 }} />
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
                  <ScaleResultCard key={r.scale.key} result={r} />
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
                  <ScaleResultCard key={r.scale.key} result={r} />
                ))}
              </div>
            </section>
          )}

          <Card className="border-purple-200 bg-purple-50/60">
            <CardContent className="p-4 flex items-start gap-3">
              <Icon name="Brain" size={20} className="text-purple-600 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-semibold">Хотите детальный разбор?</p>
                <p className="text-xs text-muted-foreground">
                  Семейный психолог-ИИ поможет составить план работы с зонами роста
                </p>
                <Button size="sm" onClick={() => navigate('/psychologist')}>
                  <Icon name="Sparkles" size={14} className="mr-1" />
                  Открыть консультацию
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/pari-test')}>
              <Icon name="RotateCcw" size={16} className="mr-1" />
              Пройти ещё раз
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate('/development-hub')}>
              <Icon name="Home" size={16} className="mr-1" />К развитию
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function ScaleResultCard({ result }: { result: PariScaleResult }) {
  const [open, setOpen] = useState(false);
  const { scale, percent, isHealthy, recommendations } = result;
  const displayPercent = scale.goodWhen === 'high' ? percent : 100 - percent;

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
              <Badge
                variant="outline"
                className={isHealthy ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}
              >
                {displayPercent}%
              </Badge>
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
