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

interface BasicArticle {
  title: string;
  text: string;
}

interface SacredBook {
  title: string;
  author: string;
  description: string;
  category: string;
}

const BOOK_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  sacred: { label: 'Священное Писание', icon: 'BookMarked', color: 'amber' },
  study: { label: 'Для изучения', icon: 'GraduationCap', color: 'blue' },
  classic: { label: 'Классика', icon: 'Library', color: 'violet' },
  modern: { label: 'Современные', icon: 'Sparkles', color: 'emerald' },
  prayer: { label: 'Молитвословы', icon: 'Heart', color: 'rose' },
};

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
  religion, setReligion, onSaveSettings, holidays, fasting, saving, setActiveTab, collapseReligion,
}: {
  religion: string; setReligion: (r: string) => void; onSaveSettings: () => void;
  holidays: Holiday[]; fasting: FastingPeriod[]; saving: boolean; setActiveTab: (t: string) => void;
  collapseReligion: boolean;
}) {
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

function LibraryTab({ religion }: { religion: string }) {
  const { toast } = useToast();
  const [basics, setBasics] = useState<BasicArticle[]>([]);
  const [books, setBooks] = useState<SacredBook[]>([]);
  const [progress, setProgress] = useState<Record<string, { isRead: boolean; bookmark: string }>>({});
  const [loading, setLoading] = useState(true);
  const [expandedBasic, setExpandedBasic] = useState<number | null>(0);
  const [bookFilter, setBookFilter] = useState('all');
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);
  const [bookmarkText, setBookmarkText] = useState('');

  const progressKey = (type: string, title: string) => `${type}::${title}`;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await apiFetch('get_library', { religion });
        setBasics(data.basics || []);
        setBooks(data.books || []);
        const map: Record<string, { isRead: boolean; bookmark: string }> = {};
        (data.progress || []).forEach((p: { type: string; title: string; isRead: boolean; bookmark: string }) => {
          map[progressKey(p.type, p.title)] = { isRead: p.isRead, bookmark: p.bookmark || '' };
        });
        setProgress(map);
      } catch {
        setBasics([]);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [religion]);

  const saveProgress = async (itemType: string, itemTitle: string, isRead: boolean, bookmark: string) => {
    const key = progressKey(itemType, itemTitle);
    setProgress(prev => ({ ...prev, [key]: { isRead, bookmark } }));
    try {
      await apiFetch('save_reading_progress', { religion, itemType, itemTitle, isRead, bookmark });
    } catch {
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    }
  };

  const toggleRead = (type: string, title: string) => {
    const key = progressKey(type, title);
    const current = progress[key];
    const newRead = !current?.isRead;
    saveProgress(type, title, newRead, current?.bookmark || '');
    if (newRead) {
      toast({ title: 'Отмечено как прочитанное', description: title });
    }
  };

  const saveBookmark = (type: string, title: string) => {
    const key = progressKey(type, title);
    const current = progress[key];
    saveProgress(type, title, current?.isRead || false, bookmarkText);
    setEditingBookmark(null);
    toast({ title: 'Закладка сохранена', description: bookmarkText ? `«${bookmarkText.slice(0, 40)}...»` : 'Закладка удалена' });
  };

  const filteredBooks = bookFilter === 'all' ? books : books.filter(b => b.category === bookFilter);
  const availableCategories = ['all', ...new Set(books.map(b => b.category))];
  const readBasicsCount = basics.filter((_, i) => progress[progressKey('basic', basics[i]?.title)]?.isRead).length;
  const readBooksCount = books.filter(b => progress[progressKey('book', b.title)]?.isRead).length;

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(readBasicsCount > 0 || readBooksCount > 0) && (
        <Card className="border-emerald-200/60 bg-gradient-to-r from-emerald-50/60 to-green-50/40">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Icon name="Trophy" size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-emerald-900">Ваш прогресс</p>
              <p className="text-[10px] text-emerald-700/70">
                Статьи: {readBasicsCount}/{basics.length} · Книги: {readBooksCount}/{books.length}
              </p>
            </div>
            <div className="w-10 h-10">
              <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#d1fae5" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#059669" strokeWidth="3"
                  strokeDasharray={`${((readBasicsCount + readBooksCount) / Math.max(basics.length + books.length, 1)) * 94} 94`}
                  strokeLinecap="round" />
              </svg>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <Icon name="Lightbulb" size={18} className="text-amber-500" />
          Основы веры — {getReligionEmoji(religion)} {getReligionLabel(religion)}
        </h3>
        <p className="text-xs text-amber-700/70 -mt-2">Простым и доступным языком о самом важном</p>

        <div className="space-y-2">
          {basics.map((article, i) => {
            const key = progressKey('basic', article.title);
            const isRead = progress[key]?.isRead || false;
            const bm = progress[key]?.bookmark || '';
            const isEditing = editingBookmark === key;
            return (
              <Card
                key={i}
                className={`border-amber-100 overflow-hidden transition-all ${expandedBasic === i ? 'ring-1 ring-amber-300 shadow-md' : 'hover:shadow-sm'} ${isRead ? 'opacity-75' : ''}`}
              >
                <button
                  onClick={() => setExpandedBasic(expandedBasic === i ? null : i)}
                  className="w-full p-3 flex items-center gap-3 text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isRead ? 'bg-emerald-100' : 'bg-gradient-to-br from-amber-100 to-yellow-100'}`}>
                    {isRead ? (
                      <Icon name="Check" size={16} className="text-emerald-600" />
                    ) : (
                      <span className="text-sm font-bold text-amber-700">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isRead ? 'text-amber-700 line-through' : 'text-amber-900'}`}>{article.title}</p>
                    {bm && <p className="text-[10px] text-blue-600 flex items-center gap-0.5 mt-0.5"><Icon name="Bookmark" size={9} />{bm.slice(0, 50)}{bm.length > 50 ? '...' : ''}</p>}
                  </div>
                  <Icon name={expandedBasic === i ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-amber-400 shrink-0" />
                </button>
                {expandedBasic === i && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/40 border border-amber-100">
                      <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">{article.text}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isRead ? 'outline' : 'default'}
                        onClick={(e) => { e.stopPropagation(); toggleRead('basic', article.title); }}
                        className={isRead ? 'border-emerald-300 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
                      >
                        <Icon name={isRead ? 'RotateCcw' : 'Check'} size={14} className="mr-1" />
                        {isRead ? 'Прочитано' : 'Прочитал'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); setEditingBookmark(isEditing ? null : key); setBookmarkText(bm); }}
                        className="border-blue-300 text-blue-700"
                      >
                        <Icon name="Bookmark" size={14} className="mr-1" />
                        Закладка
                      </Button>
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Где остановились? Напр: Прочитал до раздела «Таинства»"
                          value={bookmarkText}
                          onChange={e => setBookmarkText(e.target.value)}
                          className="border-blue-200 text-sm flex-1"
                          onKeyDown={e => e.key === 'Enter' && saveBookmark('basic', article.title)}
                        />
                        <Button size="sm" onClick={() => saveBookmark('basic', article.title)} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                          <Icon name="Save" size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-amber-200" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="BookOpen" size={14} />
            Священные книги и литература
          </span>
          <div className="h-px flex-1 bg-amber-200" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {availableCategories.map(cat => {
            const info = cat === 'all'
              ? { label: 'Все', icon: 'Library', color: 'amber' }
              : BOOK_CATEGORIES[cat] || { label: cat, icon: 'Book', color: 'gray' };
            return (
              <button
                key={cat}
                onClick={() => setBookFilter(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                  bookFilter === cat
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                <Icon name={info.icon} size={11} />
                {info.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {filteredBooks.map((book, i) => {
            const catInfo = BOOK_CATEGORIES[book.category] || { label: '', icon: 'Book', color: 'gray' };
            const key = progressKey('book', book.title);
            const isRead = progress[key]?.isRead || false;
            const bm = progress[key]?.bookmark || '';
            const isEditing = editingBookmark === key;
            return (
              <Card key={i} className={`border-amber-100 transition-shadow ${isRead ? 'opacity-75' : 'hover:shadow-sm'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleRead('book', book.title)}
                      className={`w-11 h-14 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isRead
                          ? 'bg-emerald-100 ring-2 ring-emerald-300'
                          : `bg-gradient-to-br from-${catInfo.color}-100 to-${catInfo.color}-200 hover:ring-2 hover:ring-amber-300`
                      }`}
                    >
                      {isRead ? (
                        <Icon name="CheckCheck" size={20} className="text-emerald-600" />
                      ) : (
                        <Icon name={catInfo.icon} size={20} className={`text-${catInfo.color}-600`} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isRead ? 'text-amber-700 line-through' : 'text-amber-900'}`}>{book.title}</p>
                      {book.author && <p className="text-xs text-amber-600 mt-0.5">{book.author}</p>}
                      <p className="text-xs text-amber-700/70 mt-1.5 leading-relaxed">{book.description}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={`bg-${catInfo.color}-50 text-${catInfo.color}-700 border-${catInfo.color}-200 text-[9px]`}>
                          {catInfo.label}
                        </Badge>
                        {isRead && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px]">Прочитано</Badge>}
                      </div>
                      {bm && !isEditing && (
                        <button
                          onClick={() => { setEditingBookmark(key); setBookmarkText(bm); }}
                          className="mt-2 text-[10px] text-blue-600 flex items-center gap-1 hover:underline"
                        >
                          <Icon name="Bookmark" size={10} className="text-blue-500" />
                          {bm}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => { setEditingBookmark(isEditing ? null : key); setBookmarkText(bm); }}
                      className={`p-1.5 rounded-lg shrink-0 transition-colors ${bm || isEditing ? 'text-blue-600 bg-blue-50' : 'text-amber-400 hover:bg-amber-50'}`}
                      title="Закладка"
                    >
                      <Icon name={bm ? 'BookmarkCheck' : 'Bookmark'} size={16} />
                    </button>
                  </div>
                  {isEditing && (
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="Где остановились? Напр: Глава 5, стр. 123"
                        value={bookmarkText}
                        onChange={e => setBookmarkText(e.target.value)}
                        className="border-blue-200 text-sm flex-1"
                        onKeyDown={e => e.key === 'Enter' && saveBookmark('book', book.title)}
                        autoFocus
                      />
                      <Button size="sm" onClick={() => saveBookmark('book', book.title)} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                        <Icon name="Save" size={14} />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredBooks.length === 0 && (
          <Card className="border-dashed border-amber-200">
            <CardContent className="py-8 text-center text-amber-600/60">
              <Icon name="BookX" size={36} className="mx-auto mb-2 text-amber-300" />
              <p className="text-sm">Нет книг в этой категории</p>
            </CardContent>
          </Card>
        )}
      </div>
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

const SACRED_TEXTS: Record<string, { category: string; title: string; excerpt: string; fullText: string; source: string; sourceUrl: string }[]> = {
  orthodox: [
    {
      category: 'prayer',
      title: 'Символ веры',
      excerpt: 'Верую во единаго Бога Отца, Вседержителя, Творца небу и земли, видимым же всем и невидимым...',
      fullText: 'Верую во единаго Бога Отца, Вседержителя, Творца небу и земли, видимым же всем и невидимым.\n\nИ во единаго Господа Иисуса Христа, Сына Божия, Единороднаго, Иже от Отца рожденнаго прежде всех век; Света от Света, Бога истинна от Бога истинна, рожденна, несотворенна, единосущна Отцу, Имже вся быша.\n\nНас ради человек и нашего ради спасения сшедшаго с небес и воплотившагося от Духа Свята и Марии Девы и вочеловечшася.\n\nРаспятаго же за ны при Понтийстем Пилате, и страдавша, и погребенна.\n\nИ воскресшаго в третий день по Писанием.\n\nИ возшедшаго на небеса, и седяща одесную Отца.\n\nИ паки грядущаго со славою судити живым и мертвым, Егоже Царствию не будет конца.\n\nИ в Духа Святаго, Господа, Животворящаго, Иже от Отца исходящаго, Иже со Отцем и Сыном спокланяема и сславима, глаголавшаго пророки.\n\nВо едину Святую, Соборную и Апостольскую Церковь.\n\nИсповедую едино крещение во оставление грехов.\n\nЧаю воскресения мертвых,\n\nи жизни будущаго века. Аминь.',
      source: 'Азбука веры',
      sourceUrl: 'https://azbyka.ru/simvol-very',
    },
    {
      category: 'prayer',
      title: 'Отче наш',
      excerpt: 'Отче наш, Иже еси на небесех! Да святится имя Твое, да приидет Царствие Твое...',
      fullText: 'Отче наш, Иже еси на небесех!\nДа святится имя Твое,\nда приидет Царствие Твое,\nда будет воля Твоя, яко на небеси и на земли.\nХлеб наш насущный даждь нам днесь;\nи остави нам долги наша,\nякоже и мы оставляем должником нашим;\nи не введи нас во искушение,\nно избави нас от лукаваго.\nАминь.',
      source: 'Азбука веры',
      sourceUrl: 'https://azbyka.ru/otche-nash',
    },
    {
      category: 'commandment',
      title: 'Десять заповедей',
      excerpt: 'Я Господь, Бог твой; да не будет у тебя других богов пред лицем Моим...',
      fullText: '1. Я Господь, Бог твой; да не будет у тебя других богов пред лицем Моим.\n\n2. Не делай себе кумира и никакого изображения того, что на небе вверху, что на земле внизу, и что в воде ниже земли; не поклоняйся им и не служи им.\n\n3. Не произноси имени Господа, Бога твоего, напрасно.\n\n4. Помни день субботний, чтобы святить его; шесть дней работай и делай всякие дела твои, а день седьмой — суббота Господу, Богу твоему.\n\n5. Почитай отца твоего и мать твою, чтобы продлились дни твои на земле.\n\n6. Не убивай.\n\n7. Не прелюбодействуй.\n\n8. Не кради.\n\n9. Не произноси ложного свидетельства на ближнего твоего.\n\n10. Не желай дома ближнего твоего; не желай жены ближнего твоего, ни раба его, ни рабыни его, ни вола его, ни осла его, ничего, что у ближнего твоего.',
      source: 'Библия (Исход 20)',
      sourceUrl: 'https://bible.by/syn/2/20/',
    },
    {
      category: 'commandment',
      title: 'Заповеди Блаженств',
      excerpt: 'Блаженны нищие духом, ибо их есть Царство Небесное. Блаженны плачущие, ибо они утешатся...',
      fullText: 'Блаженны нищие духом, ибо их есть Царство Небесное.\n\nБлаженны плачущие, ибо они утешатся.\n\nБлаженны кроткие, ибо они наследуют землю.\n\nБлаженны алчущие и жаждущие правды, ибо они насытятся.\n\nБлаженны милостивые, ибо они помилованы будут.\n\nБлаженны чистые сердцем, ибо они Бога узрят.\n\nБлаженны миротворцы, ибо они будут наречены сынами Божиими.\n\nБлаженны изгнанные за правду, ибо их есть Царство Небесное.\n\nБлаженны вы, когда будут поносить вас и гнать и всячески неправедно злословить за Меня. Радуйтесь и веселитесь, ибо велика ваша награда на небесах.',
      source: 'Евангелие от Матфея 5:3-12',
      sourceUrl: 'https://bible.by/syn/40/5/',
    },
    {
      category: 'bible',
      title: 'Бытие, глава 1 — Сотворение мира',
      excerpt: 'В начале сотворил Бог небо и землю. Земля же была безвидна и пуста, и тьма над бездною...',
      fullText: 'В начале сотворил Бог небо и землю.\nЗемля же была безвидна и пуста, и тьма над бездною, и Дух Божий носился над водою.\n\nИ сказал Бог: да будет свет. И стал свет.\nИ увидел Бог свет, что он хорош, и отделил Бог свет от тьмы.\nИ назвал Бог свет днём, а тьму ночью. И был вечер, и было утро: день один.\n\nИ сказал Бог: да будет твердь посреди воды, и да отделяет она воду от воды.\nИ создал Бог твердь, и отделил воду, которая под твердью, от воды, которая над твердью. И стало так.\nИ назвал Бог твердь небом. И был вечер, и было утро: день второй.\n\nПолный текст читайте по ссылке на источник.',
      source: 'Библия (Бытие 1)',
      sourceUrl: 'https://bible.by/syn/1/1/',
    },
    {
      category: 'bible',
      title: 'Псалом 50 — Покаянный',
      excerpt: 'Помилуй мя, Боже, по великой милости Твоей, и по множеству щедрот Твоих изгладь беззакония мои...',
      fullText: 'Помилуй мя, Боже, по велицей милости Твоей,\nи по множеству щедрот Твоих очисти беззаконие мое.\nНаипаче омый мя от беззакония моего, и от греха моего очисти мя.\nЯко беззаконие мое аз знаю, и грех мой предо мною есть выну.\nТебе Единому согреших и лукавое пред Тобою сотворих.\nЯко да оправдишися во словесех Твоих и победиши внегда судити Ти.\nСе бо, в беззакониих зачат есмь, и во гресех роди мя мати моя.\nСе бо, истину возлюбил еси; безвестная и тайная премудрости Твоея явил ми еси.\nОкропиши мя иссопом, и очищуся; омыеши мя, и паче снега убелюся.\nСлуху моему даси радость и веселие; возрадуются кости смиренныя.\nОтврати лице Твое от грех моих и вся беззакония моя очисти.\nСердце чисто созижди во мне, Боже, и дух прав обнови во утробе моей.\nНе отвержи мене от лица Твоего и Духа Твоего Святаго не отыми от мене.\nВоздаждь ми радость спасения Твоего и Духом Владычним утверди мя.\nНаучу беззаконныя путем Твоим, и нечестивии к Тебе обратятся.\nИзбави мя от кровей, Боже, Боже спасения моего; возрадуется язык мой правде Твоей.\nГосподи, устне мои отверзеши, и уста моя возвестят хвалу Твою.\nЯко аще бы восхотел еси жертвы, дал бых убо: всесожжения не благоволиши.\nЖертва Богу дух сокрушен; сердце сокрушенно и смиренно Бог не уничижит.\nУблажи, Господи, благоволением Твоим Сиона, и да созиждутся стены Иерусалимския.\nТогда благоволиши жертву правды, возношение и всесожегаемая; тогда возложат на олтарь Твой тельцы.',
      source: 'Псалтирь (Псалом 50)',
      sourceUrl: 'https://bible.by/syn/19/50/',
    },
    {
      category: 'bible',
      title: 'Нагорная проповедь (Мф 5-7)',
      excerpt: 'Увидев народ, Он взошёл на гору; и когда сел, приступили к Нему ученики Его. И Он, отверзши уста Свои, учил их...',
      fullText: 'Увидев народ, Он взошёл на гору; и когда сел, приступили к Нему ученики Его. И Он, отверзши уста Свои, учил их, говоря:\n\nБлаженны нищие духом, ибо их есть Царство Небесное.\nБлаженны плачущие, ибо они утешатся.\nБлаженны кроткие, ибо они наследуют землю.\n\nВы — соль земли. Если же соль потеряет силу, то чем сделаешь её солёною?\nВы — свет мира. Не может укрыться город, стоящий на верху горы.\n\nНе судите, да не судимы будете, ибо каким судом судите, таким будете судимы.\n\nИтак во всём, как хотите, чтобы с вами поступали люди, так поступайте и вы с ними, ибо в этом закон и пророки.\n\nПолный текст Нагорной проповеди читайте по ссылке на источник.',
      source: 'Евангелие от Матфея 5-7',
      sourceUrl: 'https://bible.by/syn/40/5/',
    },
    {
      category: 'bible',
      title: 'Евангелие от Иоанна, глава 1',
      excerpt: 'В начале было Слово, и Слово было у Бога, и Слово было Бог. Оно было в начале у Бога...',
      fullText: 'В начале было Слово, и Слово было у Бога, и Слово было Бог.\nОно было в начале у Бога.\nВсё чрез Него начало быть, и без Него ничто не начало быть, что начало быть.\nВ Нём была жизнь, и жизнь была свет человеков.\nИ свет во тьме светит, и тьма не объяла его.\n\nБыл человек, посланный от Бога; имя ему Иоанн.\nОн пришёл для свидетельства, чтобы свидетельствовать о Свете, дабы все уверовали чрез него.\nОн не был свет, но был послан, чтобы свидетельствовать о Свете.\n\nБыл Свет истинный, Который просвещает всякого человека, приходящего в мир.\nВ мире был, и мир чрез Него начал быть, и мир Его не познал.\n\nИ Слово стало плотию, и обитало с нами, полное благодати и истины; и мы видели славу Его, славу, как Единородного от Отца.\n\nПолный текст читайте по ссылке на источник.',
      source: 'Евангелие от Иоанна 1',
      sourceUrl: 'https://bible.by/syn/43/1/',
    },
    {
      category: 'bible',
      title: 'Притча о блудном сыне (Лк 15)',
      excerpt: 'У некоторого человека было два сына. И сказал младший из них отцу: отче! дай мне следующую мне часть имения...',
      fullText: 'У некоторого человека было два сына.\nИ сказал младший из них отцу: отче! дай мне следующую мне часть имения. И отец разделил им имение.\n\nПо прошествии немногих дней младший сын, собрав всё, пошёл в дальнюю сторону и там расточил имение своё, живя распутно.\n\nКогда же он прожил всё, настал великий голод в той стране, и он начал нуждаться. И он встал и пошёл к отцу своему. И когда он был ещё далеко, увидел его отец его и сжалился; и, побежав, пал ему на шею и целовал его.\n\nСын же сказал ему: отче! я согрешил против неба и пред тобою и уже недостоин называться сыном твоим.\n\nА отец сказал рабам своим: принесите лучшую одежду и оденьте его, и дайте перстень на руку его и обувь на ноги; и приведите откормленного телёнка, и заколите; станем есть и веселиться!\n\nИбо этот сын мой был мёртв и ожил, пропадал и нашёлся.',
      source: 'Евангелие от Луки 15:11-24',
      sourceUrl: 'https://bible.by/syn/42/15/',
    },
    {
      category: 'bible',
      title: 'Воскресение Лазаря (Ин 11)',
      excerpt: 'Иисус сказал ей: Я есмь воскресение и жизнь; верующий в Меня, если и умрёт, оживёт...',
      fullText: 'Иисус сказал ей: Я есмь воскресение и жизнь; верующий в Меня, если и умрёт, оживёт.\nИ всякий, живущий и верующий в Меня, не умрёт вовек. Веришь ли сему?\n\nИисус прослезился. Тогда иудеи говорили: смотри, как Он любил его.\n\nИисус же, опять скорбя внутренно, приходит ко гробу. То была пещера, и камень лежал на ней.\nИисус говорит: отнимите камень.\n\nОтнявши камень, Иисус возвёл очи к небу и сказал: Отче! благодарю Тебя, что Ты услышал Меня.\nСказав это, Он воззвал громким голосом: Лазарь! иди вон.\nИ вышел умерший, обвитый по рукам и ногам погребальными пеленами.\n\nПолный текст читайте по ссылке на источник.',
      source: 'Евангелие от Иоанна 11',
      sourceUrl: 'https://bible.by/syn/43/11/',
    },
    {
      category: 'bible',
      title: 'Нагорная проповедь: Любите врагов (Мф 5:38-48)',
      excerpt: 'Вы слышали, что сказано: люби ближнего твоего и ненавидь врага твоего. А Я говорю вам: любите врагов ваших...',
      fullText: 'Вы слышали, что сказано: люби ближнего твоего и ненавидь врага твоего.\nА Я говорю вам: любите врагов ваших, благословляйте проклинающих вас, благотворите ненавидящим вас и молитесь за обижающих вас и гонящих вас,\nда будете сынами Отца вашего Небесного, ибо Он повелевает солнцу Своему восходить над злыми и добрыми и посылает дождь на праведных и неправедных.\n\nИбо если вы будете любить любящих вас, какая вам награда?\nИ если вы приветствуете только братьев ваших, что особенного делаете?\n\nИтак будьте совершенны, как совершен Отец ваш Небесный.',
      source: 'Евангелие от Матфея 5:43-48',
      sourceUrl: 'https://bible.by/syn/40/5/',
    },
    {
      category: 'bible',
      title: 'Псалом 22 — Господь пастырь мой',
      excerpt: 'Господь — Пастырь мой; я ни в чём не буду нуждаться. Он покоит меня на злачных пажитях...',
      fullText: 'Господь — Пастырь мой; я ни в чём не буду нуждаться.\nОн покоит меня на злачных пажитях и водит меня к водам тихим,\nкрепит душу мою, направляет меня на стези правды ради имени Своего.\n\nЕсли я пойду и долиною смертной тени, не убоюсь зла, потому что Ты со мной;\nТвой жезл и Твой посох — они успокаивают меня.\n\nТы приготовил предо мною трапезу в виду врагов моих;\nумастил елеем голову мою; чаша моя преисполнена.\n\nТак, благость и милость да сопровождают меня во все дни жизни моей,\nи я пребуду в доме Господнем многие дни.',
      source: 'Псалтирь (Псалом 22)',
      sourceUrl: 'https://bible.by/syn/19/22/',
    },
    {
      category: 'bible',
      title: 'Первое послание к Коринфянам 13 — О любви',
      excerpt: 'Если я говорю языками человеческими и ангельскими, а любви не имею, то я — медь звенящая...',
      fullText: 'Если я говорю языками человеческими и ангельскими, а любви не имею, то я — медь звенящая или кимвал звучащий.\nЕсли имею дар пророчества, и знаю все тайны, и имею всякое познание и всю веру, так что могу и горы переставлять, а не имею любви, — то я ничто.\n\nЛюбовь долготерпит, милосердствует, любовь не завидует, любовь не превозносится, не гордится,\nне бесчинствует, не ищет своего, не раздражается, не мыслит зла,\nне радуется неправде, а сорадуется истине;\nвсё покрывает, всему верит, всего надеется, всё переносит.\n\nЛюбовь никогда не перестаёт, хотя и пророчества прекратятся, и языки умолкнут, и знание упразднится.\n\nА теперь пребывают сии три: вера, надежда, любовь;\nно любовь из них больше.',
      source: '1 Коринфянам 13',
      sourceUrl: 'https://bible.by/syn/46/13/',
    },
    {
      category: 'bible',
      title: 'Книга Иова — О страдании и вере',
      excerpt: 'Господь дал, Господь и взял; да будет имя Господне благословенно!',
      fullText: 'И сказал: наг я вышел из чрева матери моей, наг и возвращусь.\nГосподь дал, Господь и взял; да будет имя Господне благословенно!\n\nВо всём этом Иов не согрешил и не сказал ничего неразумного о Боге.\n\nТогда Иов отвечал Господу и сказал:\nЗнаю, что Ты всё можешь, и что намерение Твоё не может быть остановлено.\nПоэтому я говорил о том, чего не разумел, о делах чудных для меня, которых я не знал.\n\nИ возвратил Господь потерю Иова, когда он помолился за друзей своих;\nи дал Господь Иову вдвое больше того, что он имел прежде.',
      source: 'Книга Иова 1:21; 42',
      sourceUrl: 'https://bible.by/syn/18/1/',
    },
    {
      category: 'bible',
      title: 'Апокалипсис (Откр 21) — Новый Иерусалим',
      excerpt: 'И увидел я новое небо и новую землю, ибо прежнее небо и прежняя земля миновали...',
      fullText: 'И увидел я новое небо и новую землю, ибо прежнее небо и прежняя земля миновали, и моря уже нет.\nИ я, Иоанн, увидел святый город Иерусалим, новый, сходящий от Бога с неба, приготовленный как невеста, украшенная для мужа своего.\n\nИ услышал я громкий голос с неба, говорящий: се, скиния Бога с человеками, и Он будет обитать с ними; они будут Его народом, и Сам Бог с ними будет Богом их.\nИ отрёт Бог всякую слезу с очей их, и смерти не будет уже; ни плача, ни вопля, ни болезни уже не будет, ибо прежнее прошло.\n\nИ сказал Сидящий на престоле: се, творю всё новое.',
      source: 'Откровение Иоанна 21',
      sourceUrl: 'https://bible.by/syn/66/21/',
    },
  ],
  islam: [
    {
      category: 'quran',
      title: 'Сура Аль-Фатиха (Открывающая)',
      excerpt: 'Во имя Аллаха, Милостивого, Милосердного! Хвала Аллаху, Господу миров...',
      fullText: 'Во имя Аллаха, Милостивого, Милосердного!\nХвала Аллаху, Господу миров,\nМилостивому, Милосердному,\nВластелину Дня воздаяния!\nТебе одному мы поклоняемся\nи Тебя одного молим о помощи.\nВеди нас прямым путём,\nпутём тех, кого Ты облагодетельствовал,\nне тех, на кого пал гнев,\nи не заблудших.',
      source: 'Коран (Сура 1)',
      sourceUrl: 'https://quran-online.ru/1',
    },
    {
      category: 'quran',
      title: 'Сура Аль-Ихлас (Очищение веры)',
      excerpt: 'Скажи: «Он — Аллах Единый, Аллах Самодостаточный...»',
      fullText: 'Во имя Аллаха, Милостивого, Милосердного!\nСкажи: «Он — Аллах Единый,\nАллах Самодостаточный.\nОн не родил и не был рождён,\nи нет никого, равного Ему».',
      source: 'Коран (Сура 112)',
      sourceUrl: 'https://quran-online.ru/112',
    },
  ],
  catholic: [
    {
      category: 'prayer',
      title: 'Аве Мария (Радуйся, Мария)',
      excerpt: 'Радуйся, Мария, благодати полная! Господь с Тобою; благословенна Ты между жёнами...',
      fullText: 'Радуйся, Мария, благодати полная!\nГосподь с Тобою;\nблагословенна Ты между жёнами,\nи благословен плод чрева Твоего Иисус.\nСвятая Мария, Матерь Божия,\nмолись о нас, грешных,\nныне и в час смерти нашей.\nАминь.',
      source: 'Католический катехизис',
      sourceUrl: 'https://catholic.ru/modules.php?name=Encyclopedia&op=content&tid=243',
    },
  ],
  judaism: [
    {
      category: 'torah',
      title: 'Шма Исраэль',
      excerpt: 'Слушай, Израиль: Господь — Бог наш, Господь один!',
      fullText: 'Слушай, Израиль: Господь — Бог наш, Господь один!\nИ люби Господа, Бога твоего, всем сердцем твоим, и всею душою твоею, и всеми силами твоими.\nИ да будут слова сии, которые Я заповедую тебе сегодня, в сердце твоём.\nИ внушай их детям твоим, и говори о них, сидя в доме твоём, и идя дорогою, и ложась, и вставая.',
      source: 'Тора (Дварим 6:4-7)',
      sourceUrl: 'https://toldot.com/Shma.html',
    },
  ],
  buddhism: [
    {
      category: 'sutra',
      title: 'Сутра Сердца',
      excerpt: 'Форма есть пустота, пустота есть форма. Форма не отличается от пустоты, пустота не отличается от формы...',
      fullText: 'Бодхисаттва Авалокитешвара, практикуя глубокую Праджняпарамиту, ясно увидел, что все пять скандх пусты, и преодолел все страдания.\n\nФорма есть пустота, пустота есть форма.\nФорма не отличается от пустоты, пустота не отличается от формы.\nТо же относится к ощущениям, представлениям, волениям и сознанию.\n\nВсе дхармы отмечены пустотой: они не возникают и не исчезают, не загрязнены и не чисты, не увеличиваются и не уменьшаются.',
      source: 'Буддийские тексты',
      sourceUrl: 'https://dharma.ru/sutra-serdca/',
    },
  ],
  protestant: [
    {
      category: 'bible',
      title: 'Послание к Римлянам 8',
      excerpt: 'Итак нет ныне никакого осуждения тем, которые во Христе Иисусе...',
      fullText: 'Итак нет ныне никакого осуждения тем, которые во Христе Иисусе живут не по плоти, но по духу.\n\nПотому что закон духа жизни во Христе Иисусе освободил меня от закона греха и смерти.\n\nИбо я уверен, что ни смерть, ни жизнь, ни Ангелы, ни Начала, ни Силы, ни настоящее, ни будущее, ни высота, ни глубина, ни другая какая тварь не может отлучить нас от любви Божией во Христе Иисусе, Господе нашем.\n\nПолный текст читайте по ссылке на источник.',
      source: 'Послание к Римлянам 8',
      sourceUrl: 'https://bible.by/syn/45/8/',
    },
  ],
  hinduism: [
    {
      category: 'scripture',
      title: 'Бхагавад-гита (глава 2, избранное)',
      excerpt: 'Душа не рождается и не умирает. Она не возникла однажды в прошлом и никогда не перестанет существовать...',
      fullText: 'Душа не рождается и не умирает. Она не возникла однажды в прошлом и никогда не перестанет существовать. Она — нерождённая, вечная, всегда существующая, изначальная. Она не уничтожается, когда погибает тело.\n\nКак человек надевает новые одежды, сбросив старые, так и душа принимает новое тело, оставив старое и бесполезное.\n\nТы имеешь право только на исполнение своего долга, но не на плоды своих действий. Никогда не считай себя причиной результатов своей деятельности и не пытайся уклоняться от исполнения долга.',
      source: 'Бхагавад-гита',
      sourceUrl: 'https://www.holy-bhagavad-gita.org/chapter/2/lang/ru',
    },
  ],
};

const TEXT_CATEGORIES: Record<string, { label: string; icon: string }> = {
  all: { label: 'Все', icon: 'BookOpen' },
  prayer: { label: 'Молитвы', icon: 'Heart' },
  commandment: { label: 'Заповеди', icon: 'ScrollText' },
  bible: { label: 'Библия', icon: 'BookMarked' },
  quran: { label: 'Коран', icon: 'BookMarked' },
  torah: { label: 'Тора', icon: 'BookMarked' },
  sutra: { label: 'Сутры', icon: 'BookMarked' },
  scripture: { label: 'Писание', icon: 'BookMarked' },
};

function SacredTextsTab({ religion }: { religion: string }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const [readItems, setReadItems] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('faith_texts_read') || '{}'); } catch { return {}; }
  });

  const texts = SACRED_TEXTS[religion] || SACRED_TEXTS.orthodox;
  const categories = ['all', ...Array.from(new Set(texts.map(t => t.category)))];
  const filtered = filter === 'all' ? texts : texts.filter(t => t.category === filter);

  const toggleRead = (title: string) => {
    const next = { ...readItems, [title]: !readItems[title] };
    setReadItems(next);
    localStorage.setItem('faith_texts_read', JSON.stringify(next));
  };

  const readCount = texts.filter(t => readItems[t.title]).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <Icon name="BookText" size={18} className="text-amber-600" />
          Священные тексты — {getReligionEmoji(religion)} {getReligionLabel(religion)}
        </h3>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
          {readCount}/{texts.length} прочитано
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {categories.map(cat => {
          const info = TEXT_CATEGORIES[cat] || { label: cat, icon: 'Book' };
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                filter === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <Icon name={info.icon} size={11} />
              {info.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {filtered.map((text, i) => {
          const isExpanded = expanded === i;
          const isRead = readItems[text.title];
          return (
            <Card key={i} className={`border-amber-100 overflow-hidden transition-all ${isExpanded ? 'ring-1 ring-amber-300 shadow-md' : 'hover:shadow-sm'} ${isRead ? 'opacity-75' : ''}`}>
              <button
                onClick={() => setExpanded(isExpanded ? null : i)}
                className="w-full p-3 flex items-center gap-3 text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isRead ? 'bg-emerald-100' : 'bg-gradient-to-br from-amber-100 to-yellow-100'}`}>
                  {isRead ? (
                    <Icon name="Check" size={16} className="text-emerald-600" />
                  ) : (
                    <Icon name="BookText" size={16} className="text-amber-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isRead ? 'text-amber-700 line-through' : 'text-amber-900'}`}>{text.title}</p>
                  <p className="text-xs text-amber-600/70 mt-0.5 line-clamp-1">{text.excerpt}</p>
                </div>
                <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-amber-400 shrink-0" />
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/40 border border-amber-100">
                    <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">{text.fullText}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={isRead ? 'outline' : 'default'}
                      onClick={(e) => { e.stopPropagation(); toggleRead(text.title); }}
                      className={isRead ? 'border-emerald-300 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
                    >
                      <Icon name={isRead ? 'RotateCcw' : 'Check'} size={14} className="mr-1" />
                      {isRead ? 'Прочитано' : 'Прочитал'}
                    </Button>
                    <a
                      href={text.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                      <Icon name="ExternalLink" size={12} />
                      Источник: {text.source}
                    </a>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="border-blue-200/60 bg-blue-50/50">
        <CardContent className="p-3">
          <p className="text-xs text-blue-700 flex items-center gap-1.5">
            <Icon name="Info" size={14} className="shrink-0" />
            Тексты приведены в сокращённом виде. Полные версии доступны по ссылкам на первоисточники.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const CDN_FAITH = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files';

type SaintEntry = { name: string; title: string; period: string; description: string; source: string; sourceUrl: string; image: string };

const SAINTS_BY_RELIGION: Record<string, SaintEntry[]> = {
  orthodox: [
    { name: 'Серафим Саровский', title: 'Преподобный', period: '1754–1833', description: 'Один из наиболее почитаемых русских святых. Провёл тысячу дней и ночей в молитве на камне. Учил, что цель жизни христианской — стяжание Духа Святого. Принимал тысячи паломников, обращаясь к каждому: «Радость моя!»', source: 'Азбука веры', sourceUrl: 'https://azbyka.ru/otechnik/Serafim_Sarovskij/', image: `${CDN_FAITH}/e2ffa98d-a5c7-4bc9-b54d-7dc34d6d3129.jpg` },
    { name: 'Николай Чудотворец', title: 'Святитель', period: '270–345', description: 'Архиепископ Мирликийский, один из самых почитаемых святых во всём христианском мире. Известен множеством чудес при жизни и по смерти. Покровитель путешественников, моряков и детей.', source: 'Православие.ру', sourceUrl: 'https://pravoslavie.ru/31375.html', image: `${CDN_FAITH}/dae860d0-d52b-4889-aff7-7847a713d80f.jpg` },
    { name: 'Матрона Московская', title: 'Блаженная', period: '1881–1952', description: 'Родилась слепой, но с детства имела дар духовного зрения. Помогала людям молитвой, исцеляла больных. К ней приходили тысячи людей за советом и утешением. Канонизирована в 1999 году.', source: 'Азбука веры', sourceUrl: 'https://azbyka.ru/days/sv-matrona-moskovskaja', image: `${CDN_FAITH}/dad60ad2-ed0b-4568-9b9a-6f61266c77d2.jpg` },
    { name: 'Сергий Радонежский', title: 'Преподобный', period: '1314–1392', description: 'Основатель Троице-Сергиевой лавры, духовный собиратель русского народа. Благословил Дмитрия Донского на Куликовскую битву. Величайший подвижник земли Русской.', source: 'Православие.ру', sourceUrl: 'https://pravoslavie.ru/1702.html', image: `${CDN_FAITH}/4d643f3e-461a-4a33-9e16-dbebc0da526b.jpg` },
    { name: 'Ксения Петербургская', title: 'Блаженная', period: '1720–1803', description: 'После смерти мужа приняла подвиг юродства Христа ради. Скиталась по улицам Петербурга, помогая людям. Её молитвы творили чудеса. Почитается как покровительница Санкт-Петербурга.', source: 'Азбука веры', sourceUrl: 'https://azbyka.ru/days/sv-ksenija-peterburgskaja', image: `${CDN_FAITH}/cdddaab9-a647-4036-9698-676f4ac47d09.jpg` },
    { name: 'Иоанн Кронштадтский', title: 'Праведный', period: '1829–1908', description: 'Настоятель Андреевского собора в Кронштадте. Великий проповедник и молитвенник. Основал Дом трудолюбия для бедных. Его дневник «Моя жизнь во Христе» стал духовной классикой.', source: 'Азбука веры', sourceUrl: 'https://azbyka.ru/otechnik/Ioann_Kronshtadtskij/', image: `${CDN_FAITH}/1bf6d833-00db-4366-8eb8-edb34762096e.jpg` },
    { name: 'Спиридон Тримифунтский', title: 'Святитель', period: '270–348', description: 'Епископ города Тримифунта на Кипре. Участник I Вселенского Собора, где наглядно доказал единство Святой Троицы, сжав в руке кирпич, из которого вышли огонь и вода. Покровитель нуждающихся.', source: 'Православие.ру', sourceUrl: 'https://pravoslavie.ru/28415.html', image: `${CDN_FAITH}/b57c290e-29e6-4fe0-b53e-83078573ec54.jpg` },
    { name: 'Лука Крымский', title: 'Святитель', period: '1877–1961', description: 'Архиепископ Симферопольский и Крымский, выдающийся хирург и учёный. Лауреат Сталинской премии за труды по гнойной хирургии. Совмещал служение Церкви и медицину, спас тысячи жизней.', source: 'Азбука веры', sourceUrl: 'https://azbyka.ru/days/sv-luka-krymskij', image: `${CDN_FAITH}/a9560347-2de0-487d-b378-a5a3f5a110a4.jpg` },
    { name: 'Мария Египетская', title: 'Преподобная', period: 'V век', description: 'Бывшая блудница, которая раскаялась у дверей храма Гроба Господня в Иерусалиме. Ушла в пустыню, где провела 47 лет в молитве и покаянии. Образец покаяния и преображения.', source: 'Азбука веры', sourceUrl: 'https://azbyka.ru/days/sv-marija-egipetskaja', image: `${CDN_FAITH}/48013bb8-1a93-49a7-8c9d-2ff03581fbf3.jpg` },
    { name: 'Пантелеимон Целитель', title: 'Великомученик', period: '275–305', description: 'Врач, бесплатно лечивший больных. Исцелял именем Христа безнадёжных пациентов. Принял мученическую смерть за веру. Почитается как покровитель врачей и болящих.', source: 'Православие.ру', sourceUrl: 'https://pravoslavie.ru/56374.html', image: `${CDN_FAITH}/d5822ca9-1f21-4a48-be95-9c5272954111.jpg` },
  ],
  catholic: [
    { name: 'Франциск Ассизский', title: 'Святой', period: '1181–1226', description: 'Основатель ордена францисканцев. Отказался от богатства ради служения бедным и прокажённым. Получил стигматы — раны Христа на теле. Покровитель животных и экологии.', source: 'Catholic.ru', sourceUrl: 'https://catholic.ru/modules.php?name=Encyclopedia&op=content&tid=1076', image: `${CDN_FAITH}/e2ffa98d-a5c7-4bc9-b54d-7dc34d6d3129.jpg` },
    { name: 'Тереза Авильская', title: 'Святая', period: '1515–1582', description: 'Испанская монахиня-кармелитка, мистик и реформатор. Основала орден босоногих кармелитов. Автор духовных трудов «Внутренний замок» и «Жизнь». Учитель Церкви.', source: 'Catholic.ru', sourceUrl: 'https://catholic.ru/modules.php?name=Encyclopedia&op=content&tid=1169', image: `${CDN_FAITH}/dad60ad2-ed0b-4568-9b9a-6f61266c77d2.jpg` },
    { name: 'Николай Чудотворец', title: 'Святитель', period: '270–345', description: 'Архиепископ Мирликийский, почитаемый и в католической традиции. Покровитель детей, путешественников и моряков. Прообраз Санта-Клауса в западной культуре.', source: 'Vatican News', sourceUrl: 'https://www.vaticannews.va/ru/saints/12/06/svyatoy-nikolay.html', image: `${CDN_FAITH}/dae860d0-d52b-4889-aff7-7847a713d80f.jpg` },
  ],
  protestant: [
    { name: 'Мартин Лютер', title: 'Реформатор', period: '1483–1546', description: 'Немецкий богослов, инициатор Реформации. В 1517 году прибил 95 тезисов к дверям Виттенбергской церкви. Перевёл Библию на немецкий язык, сделав её доступной каждому.', source: 'Реформация.рф', sourceUrl: 'https://xn--e1adhhknfc.xn--p1ai/reformatory/martin-lyuter/', image: `${CDN_FAITH}/af35f894-202f-4a4d-a05e-ca3435dac5f0.jpg` },
    { name: 'Дитрих Бонхёффер', title: 'Пастор, мученик', period: '1906–1945', description: 'Немецкий лютеранский пастор и богослов. Активно противостоял нацизму, участвовал в заговоре против Гитлера. Казнён в концлагере Флоссенбюрг. Автор «Сопротивления и покорности».', source: 'Bonhoeffer.ru', sourceUrl: 'https://www.bonhoeffer.ru/', image: `${CDN_FAITH}/35bb4a23-372a-4f1a-beb8-af1b644ea381.jpg` },
  ],
  islam: [
    { name: 'Пророк Мухаммад ﷺ', title: 'Пророк Аллаха', period: '570–632', description: 'Последний пророк ислама, через которого был ниспослан Коран. Родился в Мекке, получил первое откровение в 610 году. Основал исламскую общину (умму) и объединил аравийские племена.', source: 'Islam.ru', sourceUrl: 'https://islam.ru/content/history/prorok-mukhammad', image: `${CDN_FAITH}/f0cc1db3-dddd-4fbb-a153-1eee1603cc46.jpg` },
    { name: 'Джалал ад-Дин Руми', title: 'Суфийский поэт и мистик', period: '1207–1273', description: 'Величайший суфийский поэт и богослов. Автор «Маснави» — шедевра духовной поэзии. Основатель ордена кружащихся дервишей. Учил о любви как пути к Богу.', source: 'Islam.ru', sourceUrl: 'https://islam.ru/content/culture/dzhalaluddin-rumi', image: `${CDN_FAITH}/e84fd847-15a2-4327-a550-b0c3e7efc93d.jpg` },
    { name: 'Аль-Газали', title: 'Богослов, философ', period: '1058–1111', description: 'Величайший исламский богослов и философ, прозванный «Доказательством ислама». Автор «Воскрешения наук о вере». Примирил суфизм с ортодоксальным исламом.', source: 'Islam.ru', sourceUrl: 'https://islam.ru/content/history/al-ghazali', image: `${CDN_FAITH}/0f93b052-8686-44a9-8264-3eb27d42b386.jpg` },
  ],
  judaism: [
    { name: 'Моисей (Моше)', title: 'Пророк', period: 'XIII в. до н. э.', description: 'Величайший пророк иудаизма, получивший Тору на горе Синай. Вывел еврейский народ из египетского рабства. Законодатель и основоположник иудейской религии.', source: 'Toldot.com', sourceUrl: 'https://toldot.com/Moses.html', image: `${CDN_FAITH}/93144984-d53b-49d4-a83b-a64f85104943.jpg` },
    { name: 'Маймонид (Рамбам)', title: 'Раввин, философ', period: '1138–1204', description: 'Величайший средневековый еврейский философ и кодификатор еврейского права. Автор «Мишне Тора» и «Путеводителя растерянных». Совмещал еврейскую традицию с аристотелевской философией.', source: 'Toldot.com', sourceUrl: 'https://toldot.com/Maimonides.html', image: `${CDN_FAITH}/cdd4ae36-b1b8-48c8-8c74-8b39a5ef769a.jpg` },
    { name: 'Бааль Шем Тов', title: 'Основатель хасидизма', period: '1698–1760', description: 'Израэль Бен Элиэзер, основатель хасидского движения. Учил, что каждый человек может приблизиться к Богу через радость, молитву и добрые дела, а не только через изучение Торы.', source: 'Toldot.com', sourceUrl: 'https://toldot.com/BaalShemTov.html', image: `${CDN_FAITH}/d9f2a757-c6fc-4907-b163-7a813abd344f.jpg` },
  ],
  buddhism: [
    { name: 'Сиддхартха Гаутама (Будда)', title: 'Просветлённый', period: '563–483 до н. э.', description: 'Основатель буддизма. Достиг просветления под деревом Бодхи в Бодхгае. Проповедовал Четыре Благородные Истины и Восьмеричный путь как способ выхода из страдания.', source: 'Dharma.ru', sourceUrl: 'https://dharma.ru/budda/', image: `${CDN_FAITH}/deebec2e-9df7-4239-aed1-35148c6334f2.jpg` },
    { name: 'Далай-лама XIV', title: 'Духовный лидер', period: 'р. 1935', description: 'Тензин Гьяцо — 14-й Далай-лама Тибета, духовный лидер тибетского буддизма. Лауреат Нобелевской премии мира 1989 года. Учит ненасилию, состраданию и межрелигиозному диалогу.', source: 'Dalailama.ru', sourceUrl: 'https://www.dalailama.com/', image: `${CDN_FAITH}/a6d5b4cd-596e-4d60-8628-371a8107f459.jpg` },
  ],
  hinduism: [
    { name: 'Свами Вивекананда', title: 'Духовный учитель', period: '1863–1902', description: 'Индийский монах и философ, ученик Рамакришны. Представил индуизм на Западе на Парламенте религий в Чикаго в 1893 году. Основатель Миссии Рамакришны. Учил единству всех религий.', source: 'Vedanta.ru', sourceUrl: 'https://vedanta.ru/vivekananda/', image: `${CDN_FAITH}/8327ef4d-2a40-4da9-b76c-8a692862754e.jpg` },
    { name: 'Кришна', title: 'Аватар Вишну', period: 'Мифологический', description: 'Восьмой аватар Вишну, центральный персонаж «Бхагавад-гиты». Наставник воина Арджуны перед битвой при Курукшетре. Олицетворяет божественную любовь, мудрость и защиту праведных.', source: 'Hinduism.ru', sourceUrl: 'https://www.holy-bhagavad-gita.org/lang/ru', image: `${CDN_FAITH}/365ea676-ced4-41b9-9d0b-191c9e5267e0.jpg` },
  ],
};

function SaintOfDayTab({ religion }: { religion: string }) {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const saintsList = SAINTS_BY_RELIGION[religion] || SAINTS_BY_RELIGION['orthodox'];
  const todaySaint = saintsList[dayOfYear % saintsList.length];
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('faith_saint_favorites') || '{}'); } catch { return {}; }
  });

  const toggleFavorite = (name: string) => {
    const next = { ...favorites, [name]: !favorites[name] };
    setFavorites(next);
    localStorage.setItem('faith_saint_favorites', JSON.stringify(next));
  };

  const sectionLabel: Record<string, string> = {
    orthodox: 'Святой дня',
    catholic: 'Святой дня',
    protestant: 'Реформатор дня',
    islam: 'Мудрец дня',
    judaism: 'Мудрец дня',
    buddhism: 'Учитель дня',
    hinduism: 'Учитель дня',
    other: 'Мудрец дня',
  };

  const otherLabel: Record<string, string> = {
    orthodox: 'Другие святые',
    catholic: 'Другие святые',
    protestant: 'Другие реформаторы',
    islam: 'Другие мудрецы',
    judaism: 'Другие мудрецы',
    buddhism: 'Другие учителя',
    hinduism: 'Другие учителя',
    other: 'Другие мудрецы',
  };

  const [showStats, setShowStats] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 flex items-center gap-2">
        <Icon name="Crown" size={18} className="text-amber-600" />
        {sectionLabel[religion] || 'Мудрец дня'} — {getReligionEmoji(religion)} {getReligionLabel(religion)}
      </h3>

      <button
        onClick={() => setShowStats(!showStats)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
      >
        <span className="text-xs font-medium text-amber-800 flex items-center gap-2">
          <Icon name="BarChart2" size={14} className="text-amber-500" />
          Святых в мире: <span className="font-bold text-amber-900">~10 000+</span>
        </span>
        <Icon name={showStats ? 'ChevronUp' : 'ChevronDown'} size={15} className="text-amber-400" />
      </button>

      {showStats && (
        <div className="space-y-2 px-1">
          <div className="grid grid-cols-2 gap-2">
            {[
              { rel: 'orthodox', label: 'Православие', total: '~5 000', ours: SAINTS_BY_RELIGION.orthodox?.length || 0 },
              { rel: 'catholic', label: 'Католицизм', total: '~7 000', ours: SAINTS_BY_RELIGION.catholic?.length || 0 },
              { rel: 'protestant', label: 'Протестантизм', total: '~500', ours: SAINTS_BY_RELIGION.protestant?.length || 0 },
              { rel: 'islam', label: 'Ислам', total: '~124 000', ours: SAINTS_BY_RELIGION.islam?.length || 0 },
              { rel: 'judaism', label: 'Иудаизм', total: '~300', ours: SAINTS_BY_RELIGION.judaism?.length || 0 },
              { rel: 'buddhism', label: 'Буддизм', total: '~500', ours: SAINTS_BY_RELIGION.buddhism?.length || 0 },
              { rel: 'hinduism', label: 'Индуизм', total: '~330 млн', ours: SAINTS_BY_RELIGION.hinduism?.length || 0 },
            ].map(({ rel, label, total, ours }) => (
              <div
                key={rel}
                className={`flex flex-col gap-0.5 px-3 py-2 rounded-lg border text-xs ${rel === religion ? 'bg-amber-100 border-amber-400' : 'bg-white border-amber-100'}`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{getReligionEmoji(rel)}</span>
                  <span className="text-amber-800 font-medium truncate">{label}</span>
                </div>
                <span className="font-bold text-amber-900">{total}</span>
                <span className="text-[10px] text-amber-500">у нас: {ours}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-amber-500 text-center px-2">Мы постепенно добавляем всех — база пополняется ✨</p>
        </div>
      )}

      <Card className="border-amber-300/80 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
              {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Badge>
            <button onClick={() => toggleFavorite(todaySaint.name)} className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors">
              <Icon name={favorites[todaySaint.name] ? 'HeartHandshake' : 'Heart'} size={18} className={favorites[todaySaint.name] ? 'text-rose-500' : 'text-amber-400'} />
            </button>
          </div>
          <div className="flex items-start gap-3">
            <img
              src={todaySaint.image}
              alt={todaySaint.name}
              className="w-20 h-20 rounded-xl object-cover shrink-0 border-2 border-amber-300 shadow-md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-amber-900">{todaySaint.name}</p>
              <p className="text-xs text-amber-700 font-medium">{todaySaint.title} · {todaySaint.period}</p>
            </div>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">{todaySaint.description}</p>
          <a
            href={todaySaint.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Icon name="ExternalLink" size={12} />
            Подробнее: {todaySaint.source}
          </a>
        </CardContent>
      </Card>

      {saintsList.length > 1 && (
      <>
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-amber-200" />
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">{otherLabel[religion] || 'Другие'}</span>
        <div className="h-px flex-1 bg-amber-200" />
      </div>

      <div className="space-y-2">
        {saintsList.filter((s: SaintEntry) => s.name !== todaySaint.name).map((saint: SaintEntry, i: number) => (
          <Card key={i} className="border-amber-100 hover:shadow-sm transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <img
                  src={saint.image}
                  alt={saint.name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-amber-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-amber-900">{saint.name}</p>
                    <button onClick={() => toggleFavorite(saint.name)} className="p-0.5">
                      <Icon name={favorites[saint.name] ? 'HeartHandshake' : 'Heart'} size={14} className={favorites[saint.name] ? 'text-rose-500' : 'text-amber-300'} />
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-600 font-medium">{saint.title} · {saint.period}</p>
                  <p className="text-xs text-amber-700/70 mt-1 line-clamp-2">{saint.description}</p>
                  <a
                    href={saint.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-1.5"
                  >
                    <Icon name="ExternalLink" size={10} />
                    {saint.source}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </>
      )}
    </div>
  );
}

const ICONS_DATA: { name: string; description: string; feast: string; prayer: string; source: string; sourceUrl: string; image: string }[] = [
  { name: 'Казанская икона Божией Матери', description: 'Одна из самых почитаемых икон Богородицы в России. Явлена в 1579 году в Казани. Перед ней молились ополченцы Минина и Пожарского. Считается покровительницей России.', feast: '21 июля / 4 ноября', prayer: 'О Пресвятая Госпоже Владычице Богородице! Со страхом, верою и любовию припадающе пред честною иконою Твоею, молим Тя: не отврати лица Твоего от прибегающих к Тебе.', source: 'Правикон', sourceUrl: 'https://pravicon.com/icon-137', image: `${CDN_FAITH}/004165ec-ff86-4a5b-acd4-24cc1983ef37.jpg` },
  { name: 'Владимирская икона Божией Матери', description: 'Написана евангелистом Лукой. Главная святыня России на протяжении многих веков. Трижды спасала Москву от нашествий. Хранится в храме-музее Святителя Николая в Толмачах при Третьяковской галерее.', feast: '3 июня / 6 июля / 8 сентября', prayer: 'О Всемилостивая Госпоже Богородице, Небесная Царице, Всемощная Заступнице! Утешь нас, грешных и смиренных.', source: 'Азбука веры', sourceUrl: 'https://azbyka.ru/days/ikona-vladimirskaja', image: `${CDN_FAITH}/f7df3aea-892f-4498-95ae-ee0542e23882.jpg` },
  { name: 'Иверская икона Божией Матери', description: 'Одна из наиболее известных и почитаемых в православном мире. По преданию, написана евангелистом Лукой. Оригинал хранится в Иверском монастыре на Афоне.', feast: '25 февраля / 26 октября', prayer: 'О Пресвятая Дево, Мати Христа Бога нашего, Царице Небесе и земли! Вонми многоболезненному воздыханию душ наших.', source: 'Правикон', sourceUrl: 'https://pravicon.com/icon-104', image: `${CDN_FAITH}/ad6bc530-5c0c-4de9-bf25-01a5419a7964.jpg` },
  { name: 'Икона «Троица» Андрея Рублёва', description: 'Величайший шедевр русской иконописи, написанный в XV веке. Изображает трёх ангелов — символ Святой Троицы. Является вершиной русского искусства и духовным символом единения.', feast: 'День Святой Троицы (переходящий)', prayer: 'Пресвятая Троице, помилуй нас; Господи, очисти грехи наша; Владыко, прости беззакония наша; Святый, посети и исцели немощи наша, имене Твоего ради.', source: 'Азбука веры', sourceUrl: 'https://azbyka.ru/days/ikona-troica', image: `${CDN_FAITH}/b51b1888-5a20-4227-acf5-2784712c27c6.jpg` },
  { name: 'Икона «Спас Нерукотворный»', description: 'По преданию, первая икона — отпечаток лица Христа на полотенце (убрусе), посланном царю Авгарю. Один из основных типов изображения Христа в православной иконографии.', feast: '29 августа', prayer: 'Пречистому Твоему образу покланяемся, Благий, просяще прощения прегрешений наших, Христе Боже.', source: 'Православие.ру', sourceUrl: 'https://pravoslavie.ru/65536.html', image: `${CDN_FAITH}/fa9d44b9-704d-4723-996c-67295c69aa85.jpg` },
  { name: 'Икона «Умиление» Серафимо-Дивеевская', description: 'Келейная икона преподобного Серафима Саровского. Перед ней он молился и перед ней скончался. Называется также «Радость всех радостей». Является одной из главных святынь Дивеевского монастыря.', feast: '1 августа / 10 августа', prayer: 'О Пресвятая Госпоже, Владычице Богородице! Приими недостойную молитву нашу, и сохрани нас от навета злых человек и от внезапныя смерти.', source: 'Правикон', sourceUrl: 'https://pravicon.com/icon-329', image: `${CDN_FAITH}/d2a017f5-8125-42a7-8a21-c211555f4019.jpg` },
  { name: 'Тихвинская икона Божией Матери', description: 'По преданию, написана евангелистом Лукой. Явилась на Руси в 1383 году. Почитается как покровительница Северо-Запада России. Хранится в Тихвинском Богородичном Успенском монастыре.', feast: '9 июля', prayer: 'О Пресвятая Дево, Мати Господа вышних сил, Небесе и земли Царице! Град и страну нашу сию от всякаго навета вражия избави.', source: 'Азбука веры', sourceUrl: 'https://azbyka.ru/days/ikona-tihvinskaja', image: `${CDN_FAITH}/b0f5cf7c-29df-408e-a505-6ca9875f10be.jpg` },
];

function IconOfDayTab({ religion }: { religion: string }) {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const todayIcon = ICONS_DATA[dayOfYear % ICONS_DATA.length];
  const [showPrayer, setShowPrayer] = useState(false);
  const [showIconStats, setShowIconStats] = useState(false);

  if (religion !== 'orthodox' && religion !== 'catholic') {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <Icon name="Image" size={18} className="text-amber-600" />
          Икона дня — {getReligionEmoji(religion)} {getReligionLabel(religion)}
        </h3>
        <Card className="border-amber-200/60 bg-amber-50/50">
          <CardContent className="py-8 text-center">
            <span className="text-4xl mb-3 block">🖼️</span>
            <p className="text-sm text-amber-800 font-medium">Раздел икон доступен для Православия и Католицизма</p>
            <p className="text-xs text-amber-600/70 mt-1">Выберите соответствующую конфессию на главной вкладке</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 flex items-center gap-2">
        <Icon name="Image" size={18} className="text-amber-600" />
        Икона дня — {getReligionEmoji(religion)} {getReligionLabel(religion)}
      </h3>

      <button
        onClick={() => setShowIconStats(!showIconStats)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
      >
        <span className="text-xs font-medium text-amber-800 flex items-center gap-2">
          <Icon name="Image" size={14} className="text-amber-500" />
          Православных икон в мире: <span className="font-bold text-amber-900">~50 000+</span>
        </span>
        <Icon name={showIconStats ? 'ChevronUp' : 'ChevronDown'} size={15} className="text-amber-400" />
      </button>

      {showIconStats && (
        <div className="space-y-2 px-1">
          <div className="grid grid-cols-1 gap-1.5">
            {ICONS_DATA.map((icon, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${icon.name === todayIcon.name ? 'bg-amber-100 border-amber-400 font-semibold' : 'bg-white border-amber-100'}`}>
                <Icon name="ImageIcon" fallback="Image" size={12} className="text-amber-400 shrink-0" />
                <span className="text-amber-800 truncate">{icon.name}</span>
                {icon.name === todayIcon.name && <span className="ml-auto text-[10px] text-amber-600 shrink-0">сегодня</span>}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-amber-500 text-center px-2">У нас сейчас {ICONS_DATA.length} икон — пополняем постепенно ✨</p>
        </div>
      )}

      <Card className="border-amber-300/80 bg-gradient-to-br from-amber-50 to-orange-50/60 shadow-md">
        <CardContent className="p-4 space-y-3">
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
            {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Badge>
          <div className="flex items-start gap-3">
            <img
              src={todayIcon.image}
              alt={todayIcon.name}
              className="w-20 h-24 rounded-xl object-cover shrink-0 border-2 border-amber-300 shadow-md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-amber-900">{todayIcon.name}</p>
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
                <Icon name="Calendar" size={11} />
                Празднование: {todayIcon.feast}
              </p>
            </div>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">{todayIcon.description}</p>

          <button
            onClick={() => setShowPrayer(!showPrayer)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/70 border border-amber-200 hover:bg-amber-50 transition-colors"
          >
            <span className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <Icon name="BookOpen" size={14} className="text-amber-600" />
              Молитва перед иконой
            </span>
            <Icon name={showPrayer ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-amber-400" />
          </button>

          {showPrayer && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/40 border border-amber-100">
              <p className="text-sm text-amber-900 leading-relaxed italic">{todayIcon.prayer}</p>
            </div>
          )}

          <a
            href={todayIcon.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Icon name="ExternalLink" size={12} />
            Подробнее: {todayIcon.source}
          </a>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-amber-200" />
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Почитаемые иконы</span>
        <div className="h-px flex-1 bg-amber-200" />
      </div>

      <div className="space-y-2">
        {ICONS_DATA.filter(ic => ic.name !== todayIcon.name).map((icon, i) => (
          <Card key={i} className="border-amber-100 hover:shadow-sm transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <img
                  src={icon.image}
                  alt={icon.name}
                  className="w-12 h-14 rounded-lg object-cover shrink-0 border border-amber-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-900">{icon.name}</p>
                  <p className="text-[10px] text-amber-600 font-medium">Празднование: {icon.feast}</p>
                  <p className="text-xs text-amber-700/70 mt-1 line-clamp-2">{icon.description}</p>
                  <a
                    href={icon.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-1.5"
                  >
                    <Icon name="ExternalLink" size={10} />
                    {icon.source}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
  const [collapseReligion, setCollapseReligion] = useState(false);

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
      localStorage.setItem('faith_religion_open', '0');
      setCollapseReligion(true);
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
          <TabsList className="w-full flex overflow-x-auto h-auto bg-amber-100/80 rounded-xl p-1 gap-0.5">
            {[
              { value: 'overview', icon: 'Home', label: 'Главная' },
              { value: 'texts', icon: 'BookText', label: 'Тексты' },
              { value: 'saint', icon: 'Crown', label: 'Святые' },
              { value: 'icon', icon: 'Image', label: 'Икона' },
              { value: 'holidays', icon: 'CalendarDays', label: 'Праздники' },
              { value: 'fasting', icon: 'Flame', label: 'Посты' },
              { value: 'prayers', icon: 'BookOpen', label: 'Молитвы' },
              { value: 'library', icon: 'Library', label: 'Основы' },
              { value: 'namedays', icon: 'Baby', label: 'Именины' },
              { value: 'temple', icon: 'Church', label: 'Храм' },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-[10px] py-2 px-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm text-amber-700 shrink-0 flex flex-col items-center gap-0.5"
              >
                <Icon name={tab.icon} size={14} />
                <span className="leading-none">{tab.label}</span>
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
                  collapseReligion={collapseReligion}
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
              <TabsContent value="texts">
                <SacredTextsTab religion={religion} />
              </TabsContent>
              <TabsContent value="saint">
                <SaintOfDayTab religion={religion} />
              </TabsContent>
              <TabsContent value="icon">
                <IconOfDayTab religion={religion} />
              </TabsContent>
              <TabsContent value="library">
                <LibraryTab religion={religion} />
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