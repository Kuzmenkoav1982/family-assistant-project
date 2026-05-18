import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { RELIGIONS, getReligionEmoji, getReligionLabel } from '../constants';
import { formatDateRange, daysUntil } from '../api';
import type { Holiday, FastingPeriod } from '../types';

interface Props {
  religion: string;
  setReligion: (r: string) => void;
  onSaveSettings: () => void;
  holidays: Holiday[];
  fasting: FastingPeriod[];
  saving: boolean;
  setActiveTab: (t: string) => void;
  collapseReligion: boolean;
}

export default function OverviewTab({
  religion, setReligion, onSaveSettings, holidays, fasting, saving, setActiveTab, collapseReligion,
}: Props) {
  const [religionOpen, setReligionOpen] = useState(() => {
    const saved = localStorage.getItem('faith_religion_open');
    if (saved !== null) return saved === '1';
    return true;
  });

  useEffect(() => {
    if (collapseReligion) {
      setReligionOpen(false);
    }
  }, [collapseReligion]);

  const toggleReligion = () => {
    const next = !religionOpen;
    setReligionOpen(next);
    localStorage.setItem('faith_religion_open', next ? '1' : '0');
  };

  const upcoming = holidays
    .filter(h => daysUntil(h.event_date) >= 0)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);

  const activeFasting = fasting.filter(f => f.is_active);

  return (
    <div className="space-y-4">
      <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/60 overflow-hidden">
        <button
          onClick={toggleReligion}
          className="w-full p-4 pb-2 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Icon name="Heart" size={18} className="text-amber-600" />
            <h3 className="font-semibold text-amber-900">Вероисповедание</h3>
            {!religionOpen && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] ml-1">
                {getReligionEmoji(religion)} {getReligionLabel(religion)}
              </Badge>
            )}
          </div>
          <div className={`w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center transition-transform duration-300 ${religionOpen ? 'rotate-180' : ''}`}>
            <Icon name="ChevronDown" size={16} className="text-amber-600" />
          </div>
        </button>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${religionOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <CardContent className="px-4 pb-4 pt-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              {RELIGIONS.map(r => (
                <button
                  key={r.key}
                  onClick={() => setReligion(r.key)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    religion === r.key
                      ? 'bg-amber-600 text-white shadow-md scale-105'
                      : 'bg-white/80 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <span className="mr-1.5">{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              onClick={onSaveSettings}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? (
                <Icon name="Loader2" size={16} className="animate-spin mr-1" />
              ) : (
                <Icon name="Save" size={16} className="mr-1" />
              )}
              Сохранить выбор
            </Button>
          </CardContent>
        </div>

        {!religionOpen && (
          <div className="px-4 pb-2">
            <div className="h-1 w-10 rounded-full bg-amber-200 mx-auto" />
          </div>
        )}
      </Card>

      {activeFasting.length > 0 && (
        <Card className="border-orange-200/60 bg-gradient-to-br from-orange-50/80 to-red-50/40">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="Flame" size={18} className="text-orange-600" />
              <h3 className="font-semibold text-orange-900">Сейчас идёт пост</h3>
            </div>
            {activeFasting.map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/70 border border-orange-100">
                <p className="font-medium text-orange-900">{f.title}</p>
                <p className="text-xs text-orange-700 mt-1">{formatDateRange(f.start_date, f.end_date)}</p>
                <p className="text-xs text-orange-600/80 mt-2 leading-relaxed">{f.rules}</p>
                <button
                  onClick={() => setActiveTab('fasting')}
                  className="text-xs text-orange-600 hover:underline mt-2 flex items-center gap-1"
                >
                  <Icon name="UtensilsCrossed" size={12} />
                  Подробнее о посте и питании
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200/60">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={18} className="text-amber-600" />
              <h3 className="font-semibold text-amber-900">Ближайшие праздники</h3>
            </div>
            <button onClick={() => setActiveTab('holidays')} className="text-xs text-amber-600 hover:underline">
              Все праздники
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-amber-700/60 text-center py-4">Нет предстоящих праздников</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((h, i) => {
                const days = daysUntil(h.event_date);
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-100">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] text-amber-600 font-medium leading-none">
                        {new Date(h.event_date + 'T00:00:00').toLocaleDateString('ru-RU', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-amber-800 leading-none">
                        {new Date(h.event_date + 'T00:00:00').getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-900 truncate">{h.title}</p>
                      <p className="text-xs text-amber-700/60">
                        {days === 0 ? 'Сегодня!' : days === 1 ? 'Завтра' : `через ${days} дн.`}
                      </p>
                    </div>
                    {h.is_fasting && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] shrink-0">Пост</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {[
          { tab: 'texts', icon: 'BookText', label: 'Священные тексты', desc: 'Библия, молитвы, заповеди', color: 'amber' },
          { tab: 'saint', icon: 'Crown', label: 'Святой дня', desc: 'Жития и подвиги', color: 'rose' },
          { tab: 'icon', icon: 'Image', label: 'Икона дня', desc: 'Почитаемые образы', color: 'violet' },
          { tab: 'holidays', icon: 'CalendarDays', label: 'Праздники', desc: 'Все даты и события', color: 'amber' },
          { tab: 'fasting', icon: 'Flame', label: 'Посты', desc: 'Правила питания', color: 'orange' },
          { tab: 'prayers', icon: 'BookOpen', label: 'Молитвы', desc: 'Тексты и правила', color: 'rose' },
          { tab: 'library', icon: 'Library', label: 'Основы веры', desc: 'Книги и знания', color: 'blue' },
          { tab: 'namedays', icon: 'Baby', label: 'Именины', desc: 'Дни ангела семьи', color: 'violet' },
          { tab: 'temple', icon: 'Church', label: 'Мой храм', desc: 'Адрес, расписание', color: 'amber' },
        ].map(item => (
          <button key={item.tab} onClick={() => setActiveTab(item.tab)} className="text-left">
            <Card className={`border-${item.color}-200/60 hover:shadow-md transition-all hover:scale-[1.02]`}>
              <CardContent className="p-3">
                <Icon name={item.icon} size={20} className={`text-${item.color}-600 mb-1`} />
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-[10px] text-gray-500">{item.desc}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
