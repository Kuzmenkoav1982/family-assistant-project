import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../backend/func2url.json';

const FAITH_API = (func2url as Record<string, string>)['faith-api'];

const HERO_IMAGE = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/e4fe4a35-a5c1-481d-9187-de9a4164267d.jpg';

interface Holiday {
  id?: number;
  title: string;
  description: string;
  event_date: string;
  event_type: string;
  religion: string;
  is_fasting: boolean;
  fasting_rules?: string;
  is_custom?: boolean;
}

interface FastingPeriod {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  rules: string;
  religion: string;
  is_active?: boolean;
}

interface Prayer {
  id?: number;
  title: string;
  text: string;
  category: string;
  time_of_day?: string;
  religion: string;
}

interface NameDay {
  id?: number;
  name: string;
  saint_name: string;
  day: number;
  month: number;
  description?: string;
  religion: string;
}

const RELIGIONS = [
  { key: 'orthodox', label: 'Православие', emoji: '\u2626\uFE0F' },
  { key: 'islam', label: 'Ислам', emoji: '\u262A\uFE0F' },
  { key: 'catholic', label: 'Католицизм', emoji: '\u271D\uFE0F' },
  { key: 'judaism', label: 'Иудаизм', emoji: '\u2721\uFE0F' },
  { key: 'buddhism', label: 'Буддизм', emoji: '\u2638\uFE0F' },
  { key: 'protestant', label: 'Протестантизм', emoji: '\u26EA' },
  { key: 'hinduism', label: 'Индуизм', emoji: '\uD83D\uDD49\uFE0F' },
];

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const PRAYER_CATEGORIES = [
  { key: 'all', label: 'Все' },
  { key: 'morning', label: 'Утренние' },
  { key: 'evening', label: 'Вечерние' },
  { key: 'meal', label: 'Трапеза' },
  { key: 'general', label: 'Основные' },
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
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getReligionLabel(key: string): string {
  return RELIGIONS.find(r => r.key === key)?.label || key;
}

function getReligionEmoji(key: string): string {
  return RELIGIONS.find(r => r.key === key)?.emoji || '';
}

function OverviewTab({
  religion,
  setReligion,
  onSaveSettings,
  holidays,
  fasting,
  saving,
  setActiveTab,
}: {
  religion: string;
  setReligion: (r: string) => void;
  onSaveSettings: () => void;
  holidays: Holiday[];
  fasting: FastingPeriod[];
  saving: boolean;
  setActiveTab: (t: string) => void;
}) {
  const upcoming = holidays
    .filter(h => new Date(h.event_date) >= new Date())
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
            Сохранить
          </Button>
        </CardContent>
      </Card>

      <Card className="border-amber-200/60">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={18} className="text-amber-600" />
              <h3 className="font-semibold text-amber-900">Ближайшие праздники</h3>
            </div>
            <button
              onClick={() => setActiveTab('holidays')}
              className="text-xs text-amber-600 hover:underline"
            >
              Все
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-amber-700/60">Нет предстоящих праздников</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100"
                >
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs text-amber-600 font-medium leading-none">
                      {new Date(h.event_date).toLocaleDateString('ru-RU', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-amber-800 leading-none">
                      {new Date(h.event_date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-900 truncate">{h.title}</p>
                    {h.description && (
                      <p className="text-xs text-amber-700/70 truncate">{h.description}</p>
                    )}
                  </div>
                  {h.is_fasting && (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 shrink-0">
                      Пост
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {activeFasting.length > 0 && (
        <Card className="border-orange-200/60 bg-gradient-to-br from-orange-50/80 to-red-50/40">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="Flame" size={18} className="text-orange-600" />
              <h3 className="font-semibold text-orange-900">Текущий пост</h3>
            </div>
            {activeFasting.map((f, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/60 border border-orange-100">
                <p className="font-medium text-orange-900">{f.title}</p>
                <p className="text-xs text-orange-700 mt-1">
                  {formatDate(f.start_date)} &mdash; {formatDate(f.end_date)}
                </p>
                {f.rules && (
                  <p className="text-xs text-orange-600/80 mt-1">{f.rules}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          { tab: 'holidays', icon: 'CalendarDays', label: 'Праздники', color: 'amber' },
          { tab: 'fasting', icon: 'Flame', label: 'Посты', color: 'orange' },
          { tab: 'prayers', icon: 'BookOpen', label: 'Молитвы', color: 'yellow' },
          { tab: 'namedays', icon: 'Baby', label: 'Дни ангела', color: 'rose' },
        ].map(item => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 hover:shadow-md transition-all text-left group"
          >
            <Icon
              name={item.icon}
              size={24}
              className="text-amber-600 mb-2 group-hover:scale-110 transition-transform"
            />
            <p className="text-sm font-semibold text-amber-900">{item.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function HolidaysTab({
  holidays,
  religion,
  onSync,
  onAddCustom,
  onDeleteCustom,
}: {
  holidays: Holiday[];
  religion: string;
  onSync: (holiday: Holiday) => void;
  onAddCustom: (title: string, date: string, desc: string) => void;
  onDeleteCustom: (id: number) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const grouped: Record<string, Holiday[]> = {};
  holidays.forEach(h => {
    const month = new Date(h.event_date).getMonth();
    const key = MONTH_NAMES[month];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(h);
  });

  const handleAdd = () => {
    if (!newTitle.trim() || !newDate) return;
    onAddCustom(newTitle.trim(), newDate, newDesc.trim());
    setNewTitle('');
    setNewDate('');
    setNewDesc('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-amber-900">
          {getReligionEmoji(religion)} Праздники &mdash; {getReligionLabel(religion)}
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAdd(!showAdd)}
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          <Icon name={showAdd ? 'X' : 'Plus'} size={16} className="mr-1" />
          {showAdd ? 'Отмена' : 'Добавить'}
        </Button>
      </div>

      {showAdd && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Название события"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="border-amber-200 focus:ring-amber-400"
            />
            <Input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="border-amber-200 focus:ring-amber-400"
            />
            <Input
              placeholder="Описание (необязательно)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="border-amber-200 focus:ring-amber-400"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newTitle.trim() || !newDate}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Icon name="Plus" size={16} className="mr-1" />
              Добавить событие
            </Button>
          </CardContent>
        </Card>
      )}

      {holidays.length === 0 ? (
        <Card className="border-dashed border-amber-200">
          <CardContent className="py-10 text-center text-amber-600/60">
            <Icon name="CalendarX2" size={40} className="mx-auto mb-3 text-amber-300" />
            <p>Нет праздников для выбранной религии</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([month, items]) => (
          <div key={month}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-amber-200" />
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                {month}
              </span>
              <div className="h-px flex-1 bg-amber-200" />
            </div>
            <div className="space-y-2">
              {items.map((h, i) => (
                <Card key={i} className="border-amber-100 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-16 bg-gradient-to-b from-amber-100 to-orange-100 flex flex-col items-center justify-center py-3">
                        <span className="text-xs text-amber-600 font-medium">
                          {new Date(h.event_date).toLocaleDateString('ru-RU', { month: 'short' })}
                        </span>
                        <span className="text-2xl font-bold text-amber-800">
                          {new Date(h.event_date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-amber-900">{h.title}</p>
                            {h.description && (
                              <p className="text-xs text-amber-700/70 mt-0.5">{h.description}</p>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {h.is_fasting && (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">
                                  Пост
                                </Badge>
                              )}
                              {h.is_custom && (
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">
                                  Свой
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              onClick={() => onSync(h)}
                              className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
                              title="Добавить в календарь"
                            >
                              <Icon name="CalendarPlus" size={16} />
                            </button>
                            {h.is_custom && h.id && (
                              <button
                                onClick={() => onDeleteCustom(h.id!)}
                                className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors"
                                title="Удалить"
                              >
                                <Icon name="Trash2" size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function FastingTab({ fasting, religion }: { fasting: FastingPeriod[]; religion: string }) {
  const today = new Date();
  const currentMonth = today.getMonth();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="Flame" size={18} className="text-orange-600" />
        <h3 className="font-semibold text-amber-900">
          Посты &mdash; {getReligionLabel(religion)}
        </h3>
      </div>

      {fasting.length === 0 ? (
        <Card className="border-dashed border-amber-200">
          <CardContent className="py-10 text-center text-amber-600/60">
            <Icon name="Utensils" size={40} className="mx-auto mb-3 text-amber-300" />
            <p>Нет информации о постах для выбранной религии</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 via-orange-300 to-amber-300" />
            <div className="space-y-4 pl-10">
              {fasting.map((f, i) => {
                const startMonth = new Date(f.start_date).getMonth();
                const endMonth = new Date(f.end_date).getMonth();
                const isNow = f.is_active || (currentMonth >= startMonth && currentMonth <= endMonth);

                return (
                  <div key={i} className="relative">
                    <div
                      className={`absolute -left-[26px] top-3 w-3 h-3 rounded-full border-2 ${
                        isNow
                          ? 'bg-orange-500 border-orange-300 shadow-md shadow-orange-200'
                          : 'bg-white border-amber-300'
                      }`}
                    />
                    <Card
                      className={`border-amber-100 ${
                        isNow ? 'ring-2 ring-orange-300 bg-gradient-to-br from-orange-50 to-amber-50' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-amber-900">{f.title}</p>
                            <p className="text-xs text-amber-600 mt-0.5">
                              {formatDateFull(f.start_date)} &mdash; {formatDateFull(f.end_date)}
                            </p>
                          </div>
                          {isNow && (
                            <Badge className="bg-orange-500 text-white border-orange-400 shrink-0">
                              Сейчас
                            </Badge>
                          )}
                        </div>
                        {f.description && (
                          <p className="text-sm text-amber-800/80 mt-2">{f.description}</p>
                        )}
                        {f.rules && (
                          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Icon name="Info" size={14} className="text-amber-600" />
                              <span className="text-xs font-semibold text-amber-700">
                                Правила поста
                              </span>
                            </div>
                            <p className="text-xs text-amber-700/80 leading-relaxed">{f.rules}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          <Card className="border-amber-200/60 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Utensils" size={18} className="text-amber-600" />
                <h4 className="font-semibold text-amber-900">Синхронизация с питанием</h4>
              </div>
              <p className="text-xs text-amber-700/70">
                Информация о постах может быть учтена при составлении плана питания.
                Включите синхронизацию в настройках раздела, чтобы меню автоматически
                адаптировалось к постным дням.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function PrayersTab({
  prayers,
  religion,
}: {
  prayers: Prayer[];
  religion: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered =
    selectedCategory === 'all'
      ? prayers
      : prayers.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="BookOpen" size={18} className="text-amber-600" />
        <h3 className="font-semibold text-amber-900">
          Молитвы &mdash; {getReligionLabel(religion)}
        </h3>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {PRAYER_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.key
                ? 'bg-amber-600 text-white shadow'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-amber-200">
          <CardContent className="py-10 text-center text-amber-600/60">
            <Icon name="BookX" size={40} className="mx-auto mb-3 text-amber-300" />
            <p>Нет молитв для выбранной категории</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => {
            const isExpanded = expandedId === i;
            return (
              <Card
                key={i}
                className={`border-amber-100 cursor-pointer transition-all hover:shadow-md ${
                  isExpanded ? 'ring-1 ring-amber-300' : ''
                }`}
                onClick={() => setExpandedId(isExpanded ? null : i)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <Icon
                          name={
                            p.category === 'morning'
                              ? 'Sunrise'
                              : p.category === 'evening'
                              ? 'Moon'
                              : p.category === 'meal'
                              ? 'Utensils'
                              : 'BookOpen'
                          }
                          size={16}
                          className="text-amber-600"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-amber-900 text-sm">{p.title}</p>
                        {p.time_of_day && (
                          <p className="text-[10px] text-amber-600/60">{p.time_of_day}</p>
                        )}
                      </div>
                    </div>
                    <Icon
                      name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                      size={18}
                      className="text-amber-400"
                    />
                  </div>
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-amber-100">
                      <p className="text-sm text-amber-900/80 leading-relaxed whitespace-pre-line font-serif">
                        {p.text}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NameDaysTab({ religion }: { religion: string }) {
  const { toast } = useToast();
  const [searchName, setSearchName] = useState('');
  const [searchMonth, setSearchMonth] = useState<number | null>(null);
  const [results, setResults] = useState<NameDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(
    async (name?: string, month?: number | null) => {
      const nameVal = name ?? searchName;
      const monthVal = month ?? searchMonth;
      if (!nameVal.trim() && monthVal === null) return;
      setLoading(true);
      setSearched(true);
      try {
        const params: Record<string, unknown> = { religion };
        if (nameVal.trim()) params.name = nameVal.trim();
        if (monthVal !== null) params.month = monthVal + 1;
        const data = await apiFetch('get_name_days', params);
        setResults(data.name_days || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Ошибка';
        toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [searchName, searchMonth, religion, toast],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="Baby" size={18} className="text-rose-500" />
        <h3 className="font-semibold text-amber-900">Дни ангела (именины)</h3>
      </div>

      <Card className="border-amber-200/60 bg-amber-50/50">
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
              disabled={loading || (!searchName.trim() && searchMonth === null)}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              {loading ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                <Icon name="Search" size={16} />
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {MONTH_NAMES.map((m, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const newMonth = searchMonth === idx ? null : idx;
                  setSearchMonth(newMonth);
                  if (newMonth !== null || searchName.trim()) {
                    doSearch(searchName, newMonth);
                  }
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

      {searched && !loading && results.length === 0 && (
        <Card className="border-dashed border-amber-200">
          <CardContent className="py-8 text-center text-amber-600/60">
            <Icon name="UserSearch" size={36} className="mx-auto mb-2 text-amber-300" />
            <p className="text-sm">Ничего не найдено</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((nd, i) => (
            <Card key={i} className="border-amber-100">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-lg">
                      {nd.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900">{nd.name}</p>
                    {nd.saint_name && (
                      <p className="text-xs text-amber-700/70">{nd.saint_name}</p>
                    )}
                    <p className="text-xs text-amber-600 mt-0.5">
                      {nd.day} {MONTH_NAMES[nd.month - 1]?.toLowerCase()}
                    </p>
                  </div>
                </div>
                {nd.description && (
                  <p className="text-xs text-amber-700/60 mt-2">{nd.description}</p>
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

  const loadSettings = useCallback(async () => {
    try {
      const data = await apiFetch('get_settings');
      if (data.settings?.religion) {
        setReligion(data.settings.religion);
      }
    } catch (_e) { /* use defaults */ }
  }, []);

  const loadHolidays = useCallback(async (rel: string) => {
    try {
      const now = new Date();
      const data = await apiFetch('get_holidays', {
        religion: rel,
        year: now.getFullYear(),
      });
      setHolidays(data.holidays || []);
    } catch {
      setHolidays([]);
    }
  }, []);

  const loadFasting = useCallback(async (rel: string) => {
    try {
      const now = new Date();
      const data = await apiFetch('get_fasting', {
        religion: rel,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      });
      setFasting(data.fasting || []);
    } catch {
      setFasting([]);
    }
  }, []);

  const loadPrayers = useCallback(async (rel: string) => {
    try {
      const data = await apiFetch('get_prayers', { religion: rel });
      setPrayers(data.prayers || []);
    } catch {
      setPrayers([]);
    }
  }, []);

  const loadAll = useCallback(
    async (rel: string) => {
      setLoading(true);
      await Promise.all([loadHolidays(rel), loadFasting(rel), loadPrayers(rel)]);
      setLoading(false);
    },
    [loadHolidays, loadFasting, loadPrayers],
  );

  useEffect(() => {
    (async () => {
      await loadSettings();
    })();
  }, [loadSettings]);

  useEffect(() => {
    loadAll(religion);
  }, [religion, loadAll]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await apiFetch('save_settings', { religion });
      toast({ title: 'Сохранено', description: 'Настройки обновлены' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const syncToCalendar = async (holiday: Holiday) => {
    try {
      await apiFetch('sync_to_calendar', {
        event_date: holiday.event_date,
        title: holiday.title,
      });
      toast({ title: 'Добавлено', description: `${holiday.title} добавлен в календарь` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    }
  };

  const addCustomEvent = async (title: string, date: string, description: string) => {
    try {
      await apiFetch('add_custom_event', { title, event_date: date, description, religion });
      toast({ title: 'Добавлено', description: 'Событие создано' });
      await loadHolidays(religion);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    }
  };

  const deleteCustomEvent = async (id: number) => {
    try {
      await apiFetch('delete_custom_event', { event_id: id });
      toast({ title: 'Удалено', description: 'Событие удалено' });
      await loadHolidays(religion);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pb-24">
      <Helmet>
        <title>Вера - Семейный помощник</title>
      </Helmet>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <SectionHero
          title="Вера"
          subtitle={`${getReligionEmoji(religion)} ${getReligionLabel(religion)}`}
          imageUrl={HERO_IMAGE}
          backPath="/values-hub"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5 h-auto bg-amber-100/80 rounded-xl p-1">
            <TabsTrigger
              value="overview"
              className="text-[11px] py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm text-amber-700"
            >
              <Icon name="Home" size={14} className="mr-1" />
              <span className="hidden sm:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger
              value="holidays"
              className="text-[11px] py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm text-amber-700"
            >
              <Icon name="CalendarDays" size={14} className="mr-1" />
              <span className="hidden sm:inline">Праздники</span>
            </TabsTrigger>
            <TabsTrigger
              value="fasting"
              className="text-[11px] py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm text-amber-700"
            >
              <Icon name="Flame" size={14} className="mr-1" />
              <span className="hidden sm:inline">Посты</span>
            </TabsTrigger>
            <TabsTrigger
              value="prayers"
              className="text-[11px] py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm text-amber-700"
            >
              <Icon name="BookOpen" size={14} className="mr-1" />
              <span className="hidden sm:inline">Молитвы</span>
            </TabsTrigger>
            <TabsTrigger
              value="namedays"
              className="text-[11px] py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm text-amber-700"
            >
              <Icon name="Baby" size={14} className="mr-1" />
              <span className="hidden sm:inline">Именины</span>
            </TabsTrigger>
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
                  religion={religion}
                  setReligion={setReligion}
                  onSaveSettings={saveSettings}
                  holidays={holidays}
                  fasting={fasting}
                  saving={saving}
                  setActiveTab={setActiveTab}
                />
              </TabsContent>

              <TabsContent value="holidays">
                <HolidaysTab
                  holidays={holidays}
                  religion={religion}
                  onSync={syncToCalendar}
                  onAddCustom={addCustomEvent}
                  onDeleteCustom={deleteCustomEvent}
                />
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
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}