import { useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CATEGORY_CONFIG, IMPORTANCE_CONFIG, LIFE_SEASONS, type LifeEvent, type LifeEventCategory } from './types';

interface Props {
  events: LifeEvent[];
  birthYear?: number;
  onOpenStory?: () => void;
  onJumpEvent?: (e: LifeEvent) => void;
}

interface SeasonStat {
  id: string;
  title: string;
  gradient: string;
  icon: string;
  count: number;
  topEvent?: LifeEvent;
}

const IMPORTANCE_RANK: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

function eventScore(e: LifeEvent): number {
  return IMPORTANCE_RANK[e.importance] || 1;
}

function daysBetween(a: Date, b: Date): number {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export default function LifeInsights({ events, birthYear, onOpenStory, onJumpEvent }: Props) {
  const today = new Date();
  const past = useMemo(() => events.filter((e) => new Date(e.date) <= today && !e.isFuture), [events, today]);
  const future = useMemo(() => events.filter((e) => new Date(e.date) > today || e.isFuture), [events, today]);

  // Подсчёт по категориям
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    past.forEach((e) => { map[e.category] = (map[e.category] || 0) + 1; });
    return map;
  }, [past]);

  // Топ событие
  const topEvent = useMemo(() => {
    if (past.length === 0) return null;
    return [...past].sort((a, b) => eventScore(b) - eventScore(a))[0];
  }, [past]);

  // Самое раннее событие
  const firstEvent = past[0];
  const lastEvent = past[past.length - 1];

  // Инсайты по сезонам
  const seasonStats = useMemo<SeasonStat[]>(() => {
    if (!birthYear) return [];
    return LIFE_SEASONS.map((s) => {
      const list = past.filter((e) => {
        const age = new Date(e.date).getFullYear() - birthYear;
        return age >= s.ageFrom && age <= s.ageTo;
      });
      const top = list.sort((a, b) => eventScore(b) - eventScore(a))[0];
      return { id: s.id, title: s.title, gradient: s.gradient, icon: s.icon, count: list.length, topEvent: top };
    }).filter((s) => s.count > 0);
  }, [past, birthYear]);

  // Самый насыщенный год
  const busiestYear = useMemo(() => {
    if (past.length === 0) return null;
    const map: Record<string, number> = {};
    past.forEach((e) => {
      const y = String(new Date(e.date).getFullYear());
      map[y] = (map[y] || 0) + 1;
    });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return entries[0];
  }, [past]);

  // События «в этот день» в прошлом
  const thisDayInHistory = useMemo(() => {
    const m = today.getMonth();
    const d = today.getDate();
    return past.filter((e) => {
      const ed = new Date(e.date);
      return ed.getMonth() === m && ed.getDate() === d && ed.getFullYear() !== today.getFullYear();
    });
  }, [past, today]);

  // Ближайшее будущее событие
  const nextFuture = useMemo(() => {
    if (future.length === 0) return null;
    return [...future].sort((a, b) => a.date.localeCompare(b.date))[0];
  }, [future]);

  if (past.length === 0 && future.length === 0) {
    return (
      <div className="text-center py-12 bg-white/60 rounded-2xl border-2 border-dashed border-purple-200">
        <Icon name="BarChart3" size={36} className="text-purple-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          Добавь первые события на «Дороге», и здесь появятся инсайты о твоём пути.
        </p>
      </div>
    );
  }

  const lifeDuration = firstEvent ? daysBetween(new Date(firstEvent.date), today) : 0;
  const yearsCovered = firstEvent
    ? today.getFullYear() - new Date(firstEvent.date).getFullYear() + 1
    : 0;

  return (
    <div className="space-y-4">
      {/* Кнопка истории */}
      {past.length > 0 && (
        <button
          onClick={onOpenStory}
          className="w-full group relative overflow-hidden rounded-2xl p-5 text-left bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 80% 30%, rgba(255,255,255,0.4) 0%, transparent 40%)',
            }}
          />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <Icon name="Film" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base sm:text-lg">Смотреть как историю</div>
              <div className="text-xs sm:text-sm opacity-90">
                {past.length} {pluralize(past.length, ['слайд', 'слайда', 'слайдов'])} · фуллскрин в стиле памятных моментов
              </div>
            </div>
            <Icon name="Play" size={22} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      )}

      {/* В этот день */}
      {thisDayInHistory.length > 0 && (
        <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-3 text-amber-900">
            <Icon name="CalendarHeart" size={18} />
            <h3 className="font-bold text-sm">В этот день в твоей истории</h3>
          </div>
          <div className="space-y-2">
            {thisDayInHistory.map((e) => {
              const c = CATEGORY_CONFIG[e.category];
              const yearsAgo = today.getFullYear() - new Date(e.date).getFullYear();
              return (
                <button
                  key={e.id}
                  onClick={() => onJumpEvent?.(e)}
                  className="w-full text-left bg-white rounded-xl p-3 flex items-center gap-3 hover:shadow-md transition-all"
                >
                  <span className={`w-9 h-9 rounded-full ${c.color} flex items-center justify-center text-white flex-shrink-0`}>
                    <Icon name={c.icon} size={14} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-800 truncate">{e.title}</div>
                    <div className="text-xs text-amber-700">
                      {yearsAgo} {pluralize(yearsAgo, ['год', 'года', 'лет'])} назад
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Жизнь в цифрах */}
      <div>
        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
          <Icon name="BarChart3" size={18} className="text-purple-600" />
          Жизнь в цифрах
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon="Sparkles" gradient="from-pink-500 to-rose-500" value={past.length} label="событий записано" />
          <StatCard icon="CalendarDays" gradient="from-purple-500 to-indigo-500" value={yearsCovered} label="лет на дороге" />
          <StatCard icon="Compass" gradient="from-blue-500 to-cyan-500" value={future.length} label="планов на будущее" />
          <StatCard icon="Star" gradient="from-amber-500 to-orange-500" value={past.filter((e) => e.importance === 'critical').length} label="ключевых вех" />
        </div>
      </div>

      {/* По категориям */}
      {Object.keys(byCategory).length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
            <Icon name="LayoutGrid" size={18} className="text-purple-600" />
            По категориям
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {Object.entries(byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => {
                const c = CATEGORY_CONFIG[cat as LifeEventCategory] || CATEGORY_CONFIG.other;
                return (
                  <div key={cat} className="bg-white/80 rounded-xl p-3 border border-white/60 flex items-center gap-2">
                    <span className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center text-white flex-shrink-0`}>
                      <Icon name={c.icon} size={16} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xl font-black text-gray-800 leading-none">{count}</div>
                      <div className="text-[11px] text-gray-500 truncate">{c.label}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Топ событие + следующая цель */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topEvent && (
          <button
            onClick={() => onJumpEvent?.(topEvent)}
            className="rounded-2xl p-4 text-left bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2 text-xs opacity-90 mb-1">
              <Icon name="Crown" size={14} /> Самое важное событие
            </div>
            <div className="font-bold text-lg leading-tight mb-1">{topEvent.title}</div>
            <div className="text-xs opacity-90">{new Date(topEvent.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </button>
        )}

        {nextFuture ? (
          <button
            onClick={() => onJumpEvent?.(nextFuture)}
            className="rounded-2xl p-4 text-left bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2 text-xs opacity-90 mb-1">
              <Icon name="Compass" size={14} /> Ближайший план
            </div>
            <div className="font-bold text-lg leading-tight mb-1">{nextFuture.title}</div>
            <div className="text-xs opacity-90">
              {new Date(nextFuture.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </button>
        ) : busiestYear ? (
          <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
            <div className="flex items-center gap-2 text-xs opacity-90 mb-1">
              <Icon name="Flame" size={14} /> Самый насыщенный год
            </div>
            <div className="font-bold text-2xl leading-tight">{busiestYear[0]}</div>
            <div className="text-xs opacity-90">{busiestYear[1]} {pluralize(busiestYear[1], ['событие', 'события', 'событий'])}</div>
          </div>
        ) : null}
      </div>

      {/* Сезоны жизни */}
      {seasonStats.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
            <Icon name="Layers" size={18} className="text-purple-600" />
            По сезонам жизни
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {seasonStats.map((s) => (
              <div
                key={s.id}
                className={`rounded-2xl p-4 text-white bg-gradient-to-br ${s.gradient} shadow-md`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={s.icon} size={18} />
                  <h4 className="font-bold">{s.title}</h4>
                  <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-0 text-[10px]">
                    {s.count} {pluralize(s.count, ['событие', 'события', 'событий'])}
                  </Badge>
                </div>
                {s.topEvent && (
                  <button
                    onClick={() => onJumpEvent?.(s.topEvent!)}
                    className="w-full text-left bg-white/15 backdrop-blur-md rounded-lg p-2.5 hover:bg-white/25 transition-all"
                  >
                    <div className="text-[10px] opacity-80 mb-0.5">Главное</div>
                    <div className="font-semibold text-sm leading-tight truncate">{s.topEvent.title}</div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Подвал */}
      {firstEvent && lastEvent && firstEvent !== lastEvent && (
        <div className="rounded-2xl p-4 bg-white/70 border border-white/60 text-center text-xs text-gray-600">
          От «<span className="font-semibold text-gray-800">{firstEvent.title}</span>»
          до «<span className="font-semibold text-gray-800">{lastEvent.title}</span>»
          прошло {lifeDuration} {pluralize(lifeDuration, ['день', 'дня', 'дней'])} —
          это твоя записанная история.
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, gradient, value, label }: { icon: string; gradient: string; value: number | string; label: string }) {
  return (
    <div className={`rounded-2xl p-3 text-white bg-gradient-to-br ${gradient} shadow-md`}>
      <Icon name={icon} size={18} className="opacity-80 mb-1" />
      <div className="text-2xl font-black leading-none">{value}</div>
      <div className="text-[11px] opacity-90 leading-tight mt-0.5">{label}</div>
    </div>
  );
}
