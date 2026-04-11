import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../backend/func2url.json';

const FAITH_API = (func2url as Record<string, string>)['faith-api'];

const CDN = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files';

const HERO_IMAGES: Record<string, string> = {
  orthodox: `${CDN}/7f633617-56c0-4321-a54e-df1837492a98.jpg`,
  islam: `${CDN}/18d91cd6-2b80-4bd6-b085-265dbd541d5c.jpg`,
  catholic: `${CDN}/aad5ebfe-ac8e-4fa2-a935-f2a1dbda81fb.jpg`,
  judaism: `${CDN}/e961e6cf-3406-4fb9-a38b-da36466cad03.jpg`,
  buddhism: `${CDN}/a0c58a84-7aa1-42ff-bb15-57d1a21cbcfd.jpg`,
  protestant: `${CDN}/dde09fa3-c8a2-49c7-a1b8-6caff16d1c7e.jpg`,
  hinduism: `${CDN}/d42d2942-00fd-4a1b-8147-d61611c9312b.jpg`,
};

interface Holiday {
  id?: number;
  title: string;
  description: string;
  event_date: string;
  event_type: string;
  is_fasting: boolean;
  fasting_rules?: string;
  is_custom?: boolean;
}

interface FastingPeriod {
  title: string;
  start_date: string;
  end_date: string;
  rules: string;
  is_active?: boolean;
}

interface Prayer {
  id?: number;
  title: string;
  text: string;
  category: string;
  time_of_day?: string;
}

interface NameDay {
  id?: number;
  name: string;
  saint_name: string;
  day: number;
  month: number;
  description?: string;
}

const RELIGIONS = [
  { key: 'orthodox', label: 'Православие', emoji: '☦️' },
  { key: 'islam', label: 'Ислам', emoji: '☪️' },
  { key: 'catholic', label: 'Католицизм', emoji: '✝️' },
  { key: 'judaism', label: 'Иудаизм', emoji: '✡️' },
  { key: 'buddhism', label: 'Буддизм', emoji: '☸️' },
  { key: 'protestant', label: 'Протестантизм', emoji: '⛪' },
  { key: 'hinduism', label: 'Индуизм', emoji: '🕉️' },
];

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const PRAYER_CATEGORIES = [
  { key: 'all', label: 'Все', icon: 'BookOpen' },
  { key: 'morning', label: 'Утренние', icon: 'Sunrise' },
  { key: 'evening', label: 'Вечерние', icon: 'Moon' },
  { key: 'meal', label: 'Трапеза', icon: 'UtensilsCrossed' },
  { key: 'general', label: 'Основные', icon: 'Heart' },
  { key: 'family', label: 'О семье', icon: 'Users' },
];

function getAuthToken(): string {
  try {
    const ud = localStorage.getItem('userData');
    if (ud) {
      const parsed = JSON.parse(ud);
      if (parsed.auth_token) return parsed.auth_token;
    }
  } catch (_e) { /* fallback */ }
  return localStorage.getItem('authToken') || '';
}

async function apiFetch(action: string, extra: Record<string, unknown> = {}) {
  const res = await fetch(FAITH_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': getAuthToken(),
    },
    body: JSON.stringify({ action, ...extra }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'API error');
  return data;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} — ${formatDate(end)}`;
}

function getReligionLabel(key: string): string {
  return RELIGIONS.find(r => r.key === key)?.label || key;
}

function getReligionEmoji(key: string): string {
  return RELIGIONS.find(r => r.key === key)?.emoji || '';
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function OverviewTab({
  religion, setReligion, onSaveSettings, holidays, fasting, saving, setActiveTab,
}: {
  religion: string; setReligion: (r: string) => void; onSaveSettings: () => void;
  holidays: Holiday[]; fasting: FastingPeriod[]; saving: boolean; setActiveTab: (t: string) => void;
}) {
  const upcoming = holidays
    .filter(h => daysUntil(h.event_date) >= 0)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);

  const activeFasting = fasting.filter(f => f.is_active);

  return (
    <div className="space-y-4">
      <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/60">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Icon name="Heart" size={18} className="text-amber-600" />
            <h3 className="font-semibold text-amber-900">Выберите вероисповедание</h3>
          </div>
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
          { tab: 'holidays', icon: 'CalendarDays', label: 'Праздники', desc: 'Все даты и события', color: 'amber' },
          { tab: 'fasting', icon: 'Flame', label: 'Посты', desc: 'Правила питания', color: 'orange' },
          { tab: 'prayers', icon: 'BookOpen', label: 'Молитвы', desc: 'Тексты и правила', color: 'rose' },
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

function HolidaysTab({
  holidays, religion, onSync, onAddCustom, onDeleteCustom,
}: {
  holidays: Holiday[]; religion: string;
  onSync: (h: Holiday) => void; onAddCustom: (t: string, d: string, desc: string) => void;
  onDeleteCustom: (id: number) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const sortedHolidays = [...holidays].sort((a, b) => a.event_date.localeCompare(b.event_date));
  const grouped: Record<string, Holiday[]> = {};
  sortedHolidays.forEach(h => {
    const monthKey = h.event_date.slice(0, 7);
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(h);
  });

  const handleAdd = () => {
    if (newTitle.trim() && newDate) {
      onAddCustom(newTitle.trim(), newDate, newDesc.trim());
      setNewTitle('');
      setNewDate('');
      setNewDesc('');
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <Icon name="CalendarDays" size={18} className="text-amber-600" />
          Праздники — {getReligionEmoji(religion)} {getReligionLabel(religion)}
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="border-amber-300 text-amber-700">
          <Icon name={showForm ? 'X' : 'Plus'} size={14} className="mr-1" />
          {showForm ? 'Отмена' : 'Своё событие'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Название события" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="border-amber-200" />
            <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="border-amber-200" />
            <Textarea placeholder="Описание (необязательно)" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="border-amber-200" rows={2} />
            <Button size="sm" onClick={handleAdd} disabled={!newTitle.trim() || !newDate} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Icon name="Plus" size={14} className="mr-1" />
              Добавить
            </Button>
          </CardContent>
        </Card>
      )}

      {Object.entries(grouped).map(([monthKey, items]) => {
        const monthIdx = parseInt(monthKey.split('-')[1]) - 1;
        return (
          <div key={monthKey}>
            <div className="flex items-center gap-2 mb-2 mt-3">
              <div className="h-px flex-1 bg-amber-200" />
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">{MONTH_NAMES[monthIdx]}</span>
              <div className="h-px flex-1 bg-amber-200" />
            </div>
            <div className="space-y-2">
              {items.map((h, i) => {
                const days = daysUntil(h.event_date);
                const isPast = days < 0;
                return (
                  <Card key={i} className={`border-amber-100 ${isPast ? 'opacity-50' : ''} ${days === 0 ? 'ring-2 ring-amber-400 shadow-lg' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 ${days === 0 ? 'bg-amber-500 text-white' : 'bg-amber-100'}`}>
                          <span className={`text-[10px] font-medium leading-none ${days === 0 ? 'text-amber-100' : 'text-amber-600'}`}>
                            {new Date(h.event_date + 'T00:00:00').toLocaleDateString('ru-RU', { month: 'short' })}
                          </span>
                          <span className={`text-base font-bold leading-none ${days === 0 ? 'text-white' : 'text-amber-800'}`}>
                            {new Date(h.event_date + 'T00:00:00').getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-amber-900">{h.title}</p>
                            {h.is_fasting && <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[9px]">Пост</Badge>}
                            {h.is_custom && <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[9px]">Своё</Badge>}
                            {days === 0 && <Badge className="bg-green-100 text-green-700 border-green-200 text-[9px]">Сегодня</Badge>}
                          </div>
                          {h.description && <p className="text-xs text-amber-700/70 mt-0.5">{h.description}</p>}
                          {!isPast && days > 0 && <p className="text-[10px] text-amber-500 mt-1">через {days} дн.</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {!isPast && !h.is_custom && (
                            <button onClick={() => onSync(h)} className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600" title="Добавить в календарь">
                              <Icon name="CalendarPlus" size={14} />
                            </button>
                          )}
                          {h.is_custom && h.id && (
                            <button onClick={() => onDeleteCustom(h.id!)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Удалить">
                              <Icon name="Trash2" size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {sortedHolidays.length === 0 && (
        <Card className="border-dashed border-amber-200">
          <CardContent className="py-10 text-center text-amber-600/60">
            <Icon name="CalendarX" size={36} className="mx-auto mb-2 text-amber-300" />
            <p className="text-sm">Нет праздников для этой конфессии</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FastingTab({ fasting, religion }: { fasting: FastingPeriod[]; religion: string }) {
  if (fasting.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <Icon name="Flame" size={18} className="text-orange-600" />
          Посты — {getReligionEmoji(religion)} {getReligionLabel(religion)}
        </h3>
        <Card className="border-dashed border-amber-200">
          <CardContent className="py-10 text-center text-amber-600/60">
            <Icon name="Flame" size={36} className="mx-auto mb-2 text-amber-300" />
            <p className="text-sm">Нет данных о постах для этой конфессии</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 flex items-center gap-2">
        <Icon name="Flame" size={18} className="text-orange-600" />
        Посты — {getReligionEmoji(religion)} {getReligionLabel(religion)}
      </h3>

      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 via-orange-300 to-amber-200 rounded-full" />
        {fasting.map((f, i) => (
          <div key={i} className="relative mb-6 last:mb-0">
            <div className={`absolute -left-4 top-3 w-3 h-3 rounded-full border-2 ${f.is_active ? 'bg-orange-500 border-orange-300 ring-4 ring-orange-100' : 'bg-amber-200 border-amber-300'}`} />
            <Card className={`border-amber-100 ${f.is_active ? 'ring-2 ring-orange-300 shadow-lg' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-amber-900">{f.title}</h4>
                  {f.is_active && (
                    <Badge className="bg-orange-500 text-white animate-pulse text-[10px]">
                      <Icon name="Flame" size={10} className="mr-0.5" />
                      Сейчас
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-amber-700 flex items-center gap-1.5 mb-3">
                  <Icon name="Calendar" size={12} />
                  {formatDateRange(f.start_date, f.end_date)}
                </p>
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                  <div className="flex items-start gap-2">
                    <Icon name="UtensilsCrossed" size={14} className="text-orange-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-orange-800 mb-1">Правила питания</p>
                      <p className="text-xs text-orange-700/80 leading-relaxed">{f.rules}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/60 to-green-50/40">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Icon name="UtensilsCrossed" size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">Интеграция с меню на неделю</p>
              <p className="text-xs text-emerald-700/70 mt-1">
                Во время поста раздел «Меню на неделю» учитывает ограничения вашей конфессии и предлагает постные блюда
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PrayersTab({ prayers, religion }: { prayers: Prayer[]; religion: string }) {
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = category === 'all' ? prayers : prayers.filter(p => p.category === category);

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'morning': return 'Sunrise';
      case 'evening': return 'Moon';
      case 'meal': return 'UtensilsCrossed';
      case 'family': return 'Users';
      default: return 'BookOpen';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 flex items-center gap-2">
        <Icon name="BookOpen" size={18} className="text-rose-600" />
        Молитвы — {getReligionEmoji(religion)} {getReligionLabel(religion)}
      </h3>

      <div className="flex flex-wrap gap-1.5">
        {PRAYER_CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              category === c.key
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <Icon name={c.icon} size={12} />
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-amber-200">
          <CardContent className="py-10 text-center text-amber-600/60">
            <Icon name="BookOpen" size={36} className="mx-auto mb-2 text-amber-300" />
            <p className="text-sm">Нет молитв в этой категории</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((p, i) => (
            <Card key={i} className={`border-amber-100 cursor-pointer transition-all ${expanded === i ? 'ring-1 ring-amber-300 shadow-md' : 'hover:shadow-sm'}`}>
              <CardContent className="p-0">
                <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full p-3 flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center shrink-0">
                    <Icon name={categoryIcon(p.category)} size={16} className="text-rose-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-900">{p.title}</p>
                    {p.time_of_day && (
                      <p className="text-[10px] text-amber-500">{p.time_of_day === 'morning' ? 'Утром' : 'Вечером'}</p>
                    )}
                  </div>
                  <Icon name={expanded === i ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-amber-400 shrink-0" />
                </button>
                {expanded === i && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-100">
                      <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line font-serif">{p.text}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TempleTab({
  religion, templeData, onSave, saving,
}: {
  religion: string;
  templeData: { name: string; address: string; schedule: string; contacts: string };
  onSave: (data: { name: string; address: string; schedule: string; contacts: string }) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(templeData.name);
  const [address, setAddress] = useState(templeData.address);
  const [schedule, setSchedule] = useState(templeData.schedule);
  const [contacts, setContacts] = useState(templeData.contacts);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    setName(templeData.name);
    setAddress(templeData.address);
    setSchedule(templeData.schedule);
    setContacts(templeData.contacts);
    setEdited(false);
  }, [templeData]);

  const handleChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(e.target.value);
    setEdited(true);
  };

  const templeLabel = (() => {
    switch (religion) {
      case 'orthodox': return { name: 'Храм / Церковь', icon: 'Church', placeholder: 'Храм Христа Спасителя' };
      case 'catholic': return { name: 'Костёл / Собор', icon: 'Church', placeholder: 'Собор Непорочного Зачатия' };
      case 'protestant': return { name: 'Церковь / Кирха', icon: 'Church', placeholder: 'Евангелическая церковь' };
      case 'islam': return { name: 'Мечеть', icon: 'Building', placeholder: 'Московская Соборная мечеть' };
      case 'judaism': return { name: 'Синагога', icon: 'Building', placeholder: 'Московская хоральная синагога' };
      case 'buddhism': return { name: 'Дацан / Храм', icon: 'Building', placeholder: 'Иволгинский дацан' };
      case 'hinduism': return { name: 'Мандир / Храм', icon: 'Building', placeholder: 'Храм Кришны' };
      default: return { name: 'Место поклонения', icon: 'Building', placeholder: '' };
    }
  })();

  const hasData = name || address || schedule || contacts;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 flex items-center gap-2">
        <Icon name={templeLabel.icon} size={18} className="text-amber-600" />
        {templeLabel.name} — {getReligionEmoji(religion)} {getReligionLabel(religion)}
      </h3>

      {!hasData && !edited && (
        <Card className="border-dashed border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
          <CardContent className="py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <Icon name={templeLabel.icon} size={32} className="text-amber-500" />
            </div>
            <p className="text-sm font-medium text-amber-900 mb-1">Добавьте информацию о вашем {templeLabel.name.toLowerCase().split(' ')[0]}е</p>
            <p className="text-xs text-amber-600/70">Сохраните адрес, расписание служб и контакты вашего места поклонения</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200/60">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
              <Icon name={templeLabel.icon} size={12} />
              Название
            </label>
            <Input
              placeholder={templeLabel.placeholder}
              value={name}
              onChange={handleChange(setName)}
              className="border-amber-200 focus:ring-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
              <Icon name="MapPin" size={12} />
              Адрес
            </label>
            <Input
              placeholder="Москва, ул. Волхонка, 15"
              value={address}
              onChange={handleChange(setAddress)}
              className="border-amber-200 focus:ring-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
              <Icon name="Clock" size={12} />
              Расписание служб
            </label>
            <Textarea
              placeholder={"Пн-Пт: 8:00, 18:00\nСб: 9:00, 17:00\nВс: 7:00, 10:00, 17:00"}
              value={schedule}
              onChange={handleChange(setSchedule)}
              className="border-amber-200 focus:ring-amber-400"
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
              <Icon name="Phone" size={12} />
              Контакты
            </label>
            <Input
              placeholder="+7 (495) 123-45-67, www.temple.ru"
              value={contacts}
              onChange={handleChange(setContacts)}
              className="border-amber-200 focus:ring-amber-400"
            />
          </div>

          {edited && (
            <Button
              onClick={() => onSave({ name, address, schedule, contacts })}
              disabled={saving}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? (
                <Icon name="Loader2" size={16} className="animate-spin mr-2" />
              ) : (
                <Icon name="Save" size={16} className="mr-2" />
              )}
              Сохранить
            </Button>
          )}
        </CardContent>
      </Card>

      {(name || address) && (
        <Card className="border-amber-100 bg-gradient-to-br from-amber-50/60 to-orange-50/40">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center shrink-0">
                <Icon name={templeLabel.icon} size={24} className="text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                {name && <p className="font-semibold text-amber-900">{name}</p>}
                {address && (
                  <p className="text-xs text-amber-700 flex items-center gap-1 mt-1">
                    <Icon name="MapPin" size={11} className="shrink-0" />
                    {address}
                  </p>
                )}
                {schedule && (
                  <div className="mt-2 p-2 rounded-lg bg-white/60 border border-amber-100">
                    <p className="text-[10px] font-medium text-amber-700 mb-1 flex items-center gap-1">
                      <Icon name="Clock" size={10} />
                      Расписание
                    </p>
                    <p className="text-xs text-amber-800 whitespace-pre-line">{schedule}</p>
                  </div>
                )}
                {contacts && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <Icon name="Phone" size={11} className="shrink-0" />
                    {contacts}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NameDaysTab({ religion }: { religion: string }) {
  const [searchName, setSearchName] = useState('');
  const [searchMonth, setSearchMonth] = useState<number | null>(null);
  const [results, setResults] = useState<NameDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const doSearch = useCallback(async (name?: string, month?: number | null) => {
    const n = name ?? searchName;
    const m = month !== undefined ? month : searchMonth;
    if (!n.trim() && m === null) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const params: Record<string, unknown> = { religion };
      if (n.trim()) params.name = n.trim();
      if (m !== null && m !== undefined) params.month = m + 1;
      const data = await apiFetch('get_name_days', params);
      setResults(data.nameDays || []);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchName, searchMonth, religion]);

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      const currentMonth = new Date().getMonth();
      setSearchMonth(currentMonth);
      doSearch('', currentMonth);
    }
  }, [initialLoad, doSearch]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 flex items-center gap-2">
        <Icon name="Baby" size={18} className="text-violet-600" />
        Дни ангела (именины) — {getReligionEmoji(religion)} {getReligionLabel(religion)}
      </h3>

      <Card className="border-amber-200/60">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Введите имя..."
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              className="border-amber-200 focus:ring-amber-400 flex-1"
            />
            <Button
              size="sm"
              onClick={() => doSearch()}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Search" size={16} />}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {MONTH_NAMES.map((m, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const newMonth = searchMonth === idx ? null : idx;
                  setSearchMonth(newMonth);
                  doSearch(searchName, newMonth);
                }}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                  searchMonth === idx
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-amber-600" />
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <Card className="border-dashed border-amber-200">
          <CardContent className="py-8 text-center text-amber-600/60">
            <Icon name="UserSearch" size={36} className="mx-auto mb-2 text-amber-300" />
            <p className="text-sm">Ничего не найдено</p>
            <p className="text-xs mt-1">Попробуйте другое имя или месяц</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && !loading && (
        <div className="space-y-2">
          <p className="text-xs text-amber-600 px-1">Найдено: {results.length}</p>
          {results.map((nd, i) => (
            <Card key={i} className="border-amber-100 hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-lg font-semibold text-rose-700">{nd.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900">{nd.name}</p>
                    {nd.saint_name && <p className="text-xs text-amber-700/70">{nd.saint_name}</p>}
                    <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                      <Icon name="Calendar" size={10} />
                      {nd.day} {MONTH_NAMES[nd.month - 1]?.toLowerCase()}
                    </p>
                  </div>
                </div>
                {nd.description && (
                  <p className="text-xs text-amber-700/60 mt-2 pl-14">{nd.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Faith() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [religion, setReligion] = useState('orthodox');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [fasting, setFasting] = useState<FastingPeriod[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [templeData, setTempleData] = useState({ name: '', address: '', schedule: '', contacts: '' });

  const loadSettings = useCallback(async () => {
    try {
      const data = await apiFetch('get_settings');
      if (data.settings?.religion) {
        setReligion(data.settings.religion);
      }
      if (data.settings) {
        setTempleData({
          name: data.settings.templeName || '',
          address: data.settings.templeAddress || '',
          schedule: data.settings.templeSchedule || '',
          contacts: data.settings.templeContacts || '',
        });
      }
    } catch { /* use defaults */ }
  }, []);

  const loadData = useCallback(async (rel: string) => {
    setLoading(true);
    try {
      const [hData, fData, pData] = await Promise.all([
        apiFetch('get_holidays', { religion: rel }),
        apiFetch('get_fasting', { religion: rel }),
        apiFetch('get_prayers', { religion: rel }),
      ]);
      const allHolidays = [...(hData.holidays || []), ...(hData.customEvents || [])];
      setHolidays(allHolidays);
      setFasting(fData.fasting || []);
      setPrayers(pData.prayers || []);
    } catch (err) {
      console.error('Faith API error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadData(religion);
  }, [religion, loadData]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await apiFetch('save_settings', { religion });
      toast({ title: 'Сохранено', description: `${getReligionEmoji(religion)} ${getReligionLabel(religion)} выбрано как ваше вероисповедание` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const syncToCalendar = async (holiday: Holiday) => {
    try {
      const calendarApi = (func2url as Record<string, string>)['calendar-events'];
      const res = await fetch(calendarApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getAuthToken() },
        body: JSON.stringify({
          action: 'create',
          title: `${getReligionEmoji(religion)} ${holiday.title}`,
          description: holiday.description,
          date: holiday.event_date,
          category: 'family',
          color: '#d97706',
          visibility: 'family',
          isRecurring: true,
          recurringPattern: { frequency: 'yearly', interval: 1 },
        }),
      });
      if (res.ok) {
        toast({ title: 'Добавлено в календарь', description: `${holiday.title} синхронизирован с семейным календарём` });
      } else {
        throw new Error('calendar_error');
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось добавить в календарь', variant: 'destructive' });
    }
  };

  const addCustomEvent = async (title: string, eventDate: string, description: string) => {
    try {
      await apiFetch('add_custom_event', { title, date: eventDate, description, religion });
      toast({ title: 'Событие добавлено', description: title });
      await loadData(religion);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    }
  };

  const deleteCustomEvent = async (id: number) => {
    try {
      await apiFetch('delete_custom_event', { eventId: id });
      toast({ title: 'Удалено' });
      await loadData(religion);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    }
  };

  const saveTemple = async (data: { name: string; address: string; schedule: string; contacts: string }) => {
    setSaving(true);
    try {
      await apiFetch('save_settings', {
        religion,
        templeName: data.name,
        templeAddress: data.address,
        templeSchedule: data.schedule,
        templeContacts: data.contacts,
      });
      setTempleData(data);
      toast({ title: 'Сохранено', description: 'Информация о вашем месте поклонения обновлена' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const heroImage = HERO_IMAGES[religion] || HERO_IMAGES.orthodox;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pb-24">
      <Helmet>
        <title>Вера - Семейный помощник</title>
      </Helmet>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <SectionHero
          title="Вера"
          subtitle={`${getReligionEmoji(religion)} ${getReligionLabel(religion)}`}
          imageUrl={heroImage}
          backPath="/values-hub"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-6 h-auto bg-amber-100/80 rounded-xl p-1">
            {[
              { value: 'overview', icon: 'Home', label: 'Главная' },
              { value: 'holidays', icon: 'CalendarDays', label: 'Праздники' },
              { value: 'fasting', icon: 'Flame', label: 'Посты' },
              { value: 'prayers', icon: 'BookOpen', label: 'Молитвы' },
              { value: 'namedays', icon: 'Baby', label: 'Именины' },
              { value: 'temple', icon: 'Church', label: 'Мой храм' },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-[11px] py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm text-amber-700"
              >
                <Icon name={tab.icon} size={14} className="mr-1" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-amber-600 mb-4" />
              <p className="text-sm text-amber-600/70">Загрузка...</p>
            </div>
          ) : (
            <>
              <TabsContent value="overview">
                <OverviewTab
                  religion={religion} setReligion={setReligion} onSaveSettings={saveSettings}
                  holidays={holidays} fasting={fasting} saving={saving} setActiveTab={setActiveTab}
                />
              </TabsContent>
              <TabsContent value="holidays">
                <HolidaysTab holidays={holidays} religion={religion} onSync={syncToCalendar} onAddCustom={addCustomEvent} onDeleteCustom={deleteCustomEvent} />
              </TabsContent>
              <TabsContent value="fasting">
                <FastingTab fasting={fasting} religion={religion} />
              </TabsContent>
              <TabsContent value="prayers">
                <PrayersTab prayers={prayers} religion={religion} />
              </TabsContent>
              <TabsContent value="namedays">
                <NameDaysTab religion={religion} />
              </TabsContent>
              <TabsContent value="temple">
                <TempleTab religion={religion} templeData={templeData} onSave={saveTemple} saving={saving} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}