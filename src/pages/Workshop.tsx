import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { lifeApi } from '@/components/life-road/api';
import { normalizeLegacyGoals } from '@/lib/goals/goalMappers';
import { getFramework } from '@/lib/goals/frameworkRegistry';
import type { LifeGoal } from '@/components/life-road/types';

// Хаб Мастерской жизни — раздел триады «Куда и зачем я иду».
// В Этапе 1 это лёгкий лендинг с быстрым входом в цели.
// Постепенно сюда подтянем смыслы, сезоны, сверку часов.

export default function WorkshopPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    lifeApi
      .listGoals()
      .then((rows) => {
        if (cancelled) return;
        setGoals(normalizeLegacyGoals(rows));
      })
      .catch(() => {
        if (!cancelled) setGoals([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeGoals = goals.filter((g) => g.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-4">
        {/* Hero */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center">
              <Icon name="Compass" size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Мастерская жизни</h1>
              <p className="text-xs text-gray-500">Куда и зачем я иду</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Это место, где смыслы становятся целями, а цели — живут с тобой. Не просто «список задач», а
            компас на сезон, год и длинный путь.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={() => navigate('/life-road')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <Icon name="ArrowRight" size={14} className="mr-1.5" /> Открыть «Дорогу жизни»
            </Button>
            <Button variant="outline" onClick={() => navigate('/portfolio')}>
              <Icon name="LineChart" size={14} className="mr-1.5" /> Где я сейчас (Портфолио)
            </Button>
            <Button variant="outline" onClick={() => navigate('/planning-hub')}>
              <Icon name="ListChecks" size={14} className="mr-1.5" /> Что делаю сейчас (План)
            </Button>
          </div>
        </div>

        {/* Триада */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              k: 'mirror',
              title: 'Зеркало',
              sub: 'Где я сейчас',
              icon: 'LineChart',
              gradient: 'from-emerald-500 to-teal-500',
              to: '/portfolio',
              desc: 'Портфолио развития: сферы, достижения, следующий шаг.',
            },
            {
              k: 'compass',
              title: 'Компас',
              sub: 'Куда и зачем',
              icon: 'Compass',
              gradient: 'from-purple-600 to-pink-600',
              to: '/life-road',
              desc: 'Мастерская: длинные цели, методики, сезоны, смыслы.',
            },
            {
              k: 'engine',
              title: 'Двигатель',
              sub: 'Что делаю сейчас',
              icon: 'Zap',
              gradient: 'from-blue-500 to-cyan-500',
              to: '/planning-hub',
              desc: 'Планирование: задачи, привычки, календарь, ритуалы.',
            },
          ].map((item) => (
            <button
              key={item.k}
              onClick={() => navigate(item.to)}
              className="text-left bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center mb-2`}>
                <Icon name={item.icon} size={18} />
              </div>
              <div className="text-sm font-bold text-gray-900">{item.title}</div>
              <div className="text-[11px] text-gray-500 mb-1.5">{item.sub}</div>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </button>
          ))}
        </div>

        {/* Активные цели — короткая лента */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="Target" size={16} className="text-purple-600" />
              <div className="text-sm font-bold text-gray-900">Мои цели</div>
              <Badge variant="secondary" className="text-[10px]">{activeGoals.length}</Badge>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/life-road')}>
              Все цели <Icon name="ArrowRight" size={12} className="ml-1" />
            </Button>
          </div>

          {loading && (
            <div className="text-xs text-gray-400 italic flex items-center gap-2">
              <Icon name="Loader2" size={12} className="animate-spin" /> Загружаем цели...
            </div>
          )}

          {!loading && activeGoals.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-purple-200 rounded-xl">
              <Icon name="Compass" size={28} className="mx-auto text-purple-300 mb-2" />
              <div className="text-sm font-semibold text-gray-700 mb-1">Пока нет активных целей</div>
              <p className="text-xs text-gray-500 mb-3">Создай первую длинную цель — Домовой поможет с методикой.</p>
              <Button
                onClick={() => navigate('/life-road')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                size="sm"
              >
                <Icon name="Plus" size={12} className="mr-1" /> Создать цель
              </Button>
            </div>
          )}

          {!loading && activeGoals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {activeGoals.slice(0, 6).map((g) => {
                const fw = getFramework(g.frameworkType);
                return (
                  <button
                    key={g.id}
                    onClick={() => navigate(`/workshop/goal/${g.id}`)}
                    className="text-left bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${fw.gradient} text-white flex items-center justify-center`}>
                        <Icon name={fw.icon} size={12} />
                      </div>
                      <Badge variant="outline" className="text-[9px]">{fw.title}</Badge>
                      <span className="ml-auto text-[10px] text-gray-400">{g.progress}%</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 line-clamp-2">{g.title}</div>
                    {g.deadline && (
                      <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <Icon name="CalendarClock" size={10} />
                        {new Date(g.deadline).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Заметка про этап */}
        <div className="text-[11px] text-gray-400 text-center italic">
          Этап 1 триады • фундамент модели. Методики, мосты и сверка часов появятся следующими волнами.
        </div>
      </div>
    </div>
  );
}
