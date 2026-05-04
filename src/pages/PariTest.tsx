import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import SEOHead from '@/components/SEOHead';
import { toast } from 'sonner';
import {
  PARI_QUESTIONS,
  PARI_ANSWERS,
  calculatePariResults,
  getOverallScore,
} from '@/data/pariTestData';
import func2url from '@/config/func2url';

const API = (func2url as Record<string, string>)['child-assessment'];

export default function PariTest() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'intro' | 'test' | 'saving'>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const total = PARI_QUESTIONS.length;
  const progress = useMemo(
    () => (Object.keys(answers).length / total) * 100,
    [answers, total]
  );

  const question = PARI_QUESTIONS[current];

  const onAnswer = (value: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    if (current < total - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 150);
    } else {
      setTimeout(finish, 200);
    }
  };

  const goPrev = () => current > 0 && setCurrent((c) => c - 1);
  const goNext = () => current < total - 1 && setCurrent((c) => c + 1);

  const finish = async () => {
    setStep('saving');
    const scaleResults = calculatePariResults(answers);
    const overall = getOverallScore(scaleResults);

    const compactScales = scaleResults.map((r) => ({
      key: r.scale.key,
      title: r.scale.title,
      percent: r.percent,
      level: r.level,
      isHealthy: r.isHealthy,
    }));

    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${API}?section=pari`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({
          answers,
          scale_results: compactScales,
          overall_score: overall.score,
          overall_label: overall.label,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Не удалось сохранить');
      toast.success('Результат сохранён');
      navigate(`/pari-results/${json.id}`, { state: { answers, scaleResults, overall } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Ошибка';
      toast.error(msg);
      navigate('/pari-results/local', { state: { answers, scaleResults, overall } });
    }
  };

  if (step === 'intro') {
    return (
      <>
        <SEOHead
          title="Зеркало родителя — диагностика родительских установок"
          description="Научно обоснованный тест Шефера-Белла для оценки детско-родительских отношений. 35 вопросов, 10 минут."
          path="/pari-test"
        />
        <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50/40 to-white pb-24">
          <div className="max-w-2xl mx-auto p-4 space-y-5">
            <SectionHero
              title="Зеркало родителя"
              subtitle="Диагностика родительских установок (PARI)"
              imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/364dd778-d8dc-4105-a314-da0ca595ed73.jpg"
              backPath="/family-matrix"
            />

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                    <Icon name="HeartHandshake" size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Что покажет тест</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Адаптация классической методики Шефера-Белла. Оценивает 7 ключевых
                      шкал детско-родительских отношений.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    'Раздражительность',
                    'Излишняя строгость',
                    'Уклонение от конфликта',
                    'Гиперопека',
                    'Эмоциональная теплота',
                    'Активность ребёнка',
                    'Сотрудничество',
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-2 bg-purple-50 rounded-lg p-2">
                      <Icon name="Check" size={14} className="text-purple-600 shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Clock" size={16} />
                    <span>10 минут · 35 вопросов</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Lock" size={16} />
                    <span>Результаты приватные, доступны только вам</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="TrendingUp" size={16} />
                    <span>Получите радар-диаграмму и персональные рекомендации</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/60">
              <CardContent className="p-4 flex gap-3">
                <Icon name="Info" size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900">
                  Тест помогает увидеть свои реакции со стороны. Это не диагноз —
                  это карта того, где вы сейчас и куда расти.
                </p>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
              onClick={() => setStep('test')}
            >
              <Icon name="Play" size={18} className="mr-2" />
              Начать тест
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (step === 'saving') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Считаем результаты...</p>
      </div>
    );
  }

  const selected = answers[question.id];

  return (
    <>
      <SEOHead title="Тест PARI" description="Прохождение теста" path="/pari-test" />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50/40 to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/development-hub')}>
              <Icon name="X" size={18} />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              {Object.keys(answers).length} / {total}
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 space-y-5">
              <p className="text-xs uppercase tracking-wider text-purple-600 font-semibold">
                Вопрос {current + 1} из {total}
              </p>
              <h2 className="text-xl font-bold leading-snug">{question.text}</h2>

              <div className="space-y-2 pt-2">
                {PARI_ANSWERS.map((a) => {
                  const active = selected === a.value;
                  return (
                    <button
                      key={a.value}
                      onClick={() => onAnswer(a.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        active
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            active ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                          }`}
                        >
                          {active && <Icon name="Check" size={14} className="text-white" />}
                        </div>
                        <span className={`text-sm ${active ? 'font-semibold' : ''}`}>
                          {a.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={goPrev}
              disabled={current === 0}
            >
              <Icon name="ChevronLeft" size={16} className="mr-1" /> Назад
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={goNext}
              disabled={current === total - 1 || !selected}
            >
              Дальше <Icon name="ChevronRight" size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}