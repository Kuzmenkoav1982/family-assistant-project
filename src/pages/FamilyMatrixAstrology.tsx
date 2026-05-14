import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import MemberAvatar from '@/components/ui/member-avatar';
import { Helmet } from '@/lib/helmet';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import {
  calculateAstrologyProfile,
  getZodiacCompatibility,
  getChineseCompatibility,
  getElementLabel,
  ZODIAC_DATA,
  CHINESE_ANIMALS,
} from '@/lib/astrology';
import type { FamilyMember } from '@/types/family.types';
import type { AstrologyProfile, ZodiacSign, Element } from '@/types/family-code.types';

function getBd(m: FamilyMember): string | null { return m.birth_date || m.birthDate || null; }

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'bg-red-100 text-red-700 border-red-200',
  earth: 'bg-amber-100 text-amber-700 border-amber-200',
  air: 'bg-sky-100 text-sky-700 border-sky-200',
  water: 'bg-blue-100 text-blue-700 border-blue-200',
  wood: 'bg-green-100 text-green-700 border-green-200',
  metal: 'bg-gray-100 text-gray-700 border-gray-200',
};

const ELEMENT_EMOJI: Record<string, string> = {
  fire: '🔥', earth: '🌍', air: '💨', water: '💧', wood: '🌳', metal: '⚔️',
};

const ELEMENT_BG: Record<string, string> = {
  fire: 'from-red-500 to-orange-400',
  earth: 'from-amber-500 to-yellow-400',
  air: 'from-sky-500 to-cyan-400',
  water: 'from-blue-500 to-indigo-400',
  wood: 'from-green-500 to-emerald-400',
  metal: 'from-gray-500 to-slate-400',
};

const PLANET_ICONS: Record<string, string> = {
  'Марс': 'Flame',
  'Венера': 'Heart',
  'Меркурий': 'MessageCircle',
  'Луна': 'Moon',
  'Солнце': 'Sun',
  'Плутон': 'Atom',
  'Юпитер': 'TrendingUp',
  'Сатурн': 'Mountain',
  'Уран': 'Zap',
  'Нептун': 'Waves',
};

const PLANET_DESCRIPTIONS: Record<string, string> = {
  'Марс': 'Планета энергии и действия. В этом месяце усиливает вашу решительность, мотивирует на активные шаги. Хорошее время для начала новых проектов и физической активности.',
  'Венера': 'Планета любви и гармонии. Благоприятствует отношениям, творчеству и финансовым делам. Располагает к романтике и семейному уюту.',
  'Меркурий': 'Планета коммуникации и разума. Усиливает интеллектуальные способности, помогает в переговорах и обучении. Хорошее время для важных разговоров.',
  'Луна': 'Светило эмоций и интуиции. Обостряет чувствительность и заботу о близких. Прислушивайтесь к внутреннему голосу — он сейчас особенно точен.',
  'Солнце': 'Центр жизненной силы и самовыражения. Усиливает вашу харизму и творческий потенциал. Время сиять и вдохновлять окружающих.',
  'Плутон': 'Планета трансформации и глубины. Период внутренних перемен и пересмотра ценностей. Помогает избавиться от лишнего и обрести новую силу.',
  'Юпитер': 'Планета удачи и расширения. Благоприятствует путешествиям, образованию и духовному росту. Время мыслить масштабно.',
  'Сатурн': 'Планета дисциплины и структуры. Помогает выстроить прочный фундамент. Награждает упорный труд и ответственный подход.',
  'Уран': 'Планета перемен и оригинальности. Вдохновляет на нестандартные решения и инновации. Будьте открыты неожиданным возможностям.',
  'Нептун': 'Планета мечты и вдохновения. Усиливает творческие способности и интуицию. Время для медитации, искусства и духовных практик.',
};

const DAILY_MOODS = [
  'Гармоничный', 'Вдохновлённый', 'Спокойный', 'Энергичный', 'Задумчивый',
  'Творческий', 'Решительный', 'Мечтательный', 'Радостный', 'Сосредоточенный',
  'Романтичный', 'Деловой',
];

const DAILY_COLORS = [
  'Синий', 'Зелёный', 'Золотой', 'Фиолетовый', 'Бирюзовый',
  'Алый', 'Серебристый', 'Лавандовый', 'Персиковый', 'Изумрудный',
  'Коралловый', 'Янтарный',
];

const DAILY_ADVICES = [
  'Доверяйте своей интуиции сегодня — она вас не подведёт.',
  'Отличный день для семейных дел и домашнего уюта.',
  'Сосредоточьтесь на одной важной задаче — результат превзойдёт ожидания.',
  'Проявите инициативу — сегодня вас поддержат.',
  'Уделите время творчеству, даже если это всего 15 минут.',
  'Позвоните тому, по кому давно скучаете.',
  'Сегодня ваша энергия заразительна — делитесь ей с близкими.',
  'Не бойтесь мечтать масштабно — звёзды на вашей стороне.',
  'Маленький сюрприз для близкого человека принесёт вам обоим радость.',
  'Найдите время для прогулки — свежий воздух перезарядит вас.',
  'Будьте терпеливы — всё, что нужно, придёт в своё время.',
  'Запишите свои идеи — среди них есть золотая.',
];

function getDailyHash(dateStr: string, signIndex: number): number {
  const parts = dateStr.split('-');
  const seed = parseInt(parts[0]) * 367 + parseInt(parts[1]) * 31 + parseInt(parts[2]);
  return Math.abs((seed * 2654435761 + signIndex * 40503) % 2147483647);
}

function getDailyForecast(zodiacSign: ZodiacSign) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const signIndex = ZODIAC_DATA.findIndex(z => z.id === zodiacSign);
  const hash = getDailyHash(dateStr, signIndex);

  const mood = DAILY_MOODS[hash % DAILY_MOODS.length];
  const energy = (hash % 5) + 1;
  const color = DAILY_COLORS[(hash >> 3) % DAILY_COLORS.length];
  const advice = DAILY_ADVICES[(hash >> 6) % DAILY_ADVICES.length];

  return { mood, energy, color, advice };
}

function MemberChip({ member, isSelected, onClick }: {
  member: FamilyMember;
  isSelected: boolean;
  onClick: () => void;
}) {
  const hasBd = !!getBd(member);
  return (
    <button
      onClick={() => hasBd && onClick()}
      className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50 shadow-md'
          : hasBd
            ? 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
            : 'border-dashed border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
      }`}
    >
      <MemberAvatar member={member} size="sm" />
      <div className="text-left">
        <p className={`text-xs font-medium ${isSelected ? 'text-indigo-800' : 'text-gray-800'}`}>
          {member.name}
        </p>
        <p className="text-[10px] text-gray-400">
          {hasBd ? member.role : 'Нет даты рождения'}
        </p>
      </div>
      {!hasBd && <Icon name="AlertCircle" size={14} className="text-amber-400 ml-1" />}
    </button>
  );
}

function ZodiacSignCard({ profile }: { profile: AstrologyProfile }) {
  const zodiacData = ZODIAC_DATA.find(z => z.id === profile.zodiacSign);
  return (
    <Card className="overflow-hidden border-2 border-indigo-200">
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Icon name="Star" size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Знак Зодиака</h3>
            <p className="text-xs text-gray-500">Западная астрология</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{profile.zodiacEmoji}</span>
          <div>
            <h4 className="text-xl font-bold text-gray-900">{profile.zodiacSignLabel}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{zodiacData?.dateRange}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge className={ELEMENT_COLORS[profile.zodiacElement]}>
                {ELEMENT_EMOJI[profile.zodiacElement]} {getElementLabel(profile.zodiacElement)}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                <Icon name={PLANET_ICONS[profile.zodiacPlanet] || 'Circle'} size={10} className="mr-1" />
                {profile.zodiacPlanet}
              </Badge>
            </div>
          </div>
        </div>
        {zodiacData && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {zodiacData.traits.map(t => (
              <Badge key={t} variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700">
                {t}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-700 leading-relaxed">{profile.zodiacDescription}</p>
      </CardContent>
    </Card>
  );
}

function ChineseZodiacCard({ profile }: { profile: AstrologyProfile }) {
  const animal = CHINESE_ANIMALS.find(a => a.id === profile.chineseAnimal);
  return (
    <Card className="overflow-hidden border-2 border-rose-200">
      <div className="h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500" />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-rose-100 p-2 rounded-lg">
            <Icon name="Compass" size={20} className="text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Китайский гороскоп</h3>
            <p className="text-xs text-gray-500">Восточная астрология</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{profile.chineseAnimalEmoji}</span>
          <div>
            <h4 className="text-xl font-bold text-gray-900">{profile.chineseAnimalLabel}</h4>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge className={ELEMENT_COLORS[profile.chineseElement]}>
                {ELEMENT_EMOJI[profile.chineseElement]} {getElementLabel(profile.chineseElement)}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {profile.chineseYinYang === 'yin' ? '☯ Инь' : '☯ Ян'}
              </Badge>
            </div>
          </div>
        </div>
        {animal && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {animal.traits.map(t => (
              <Badge key={t} variant="secondary" className="text-[10px] bg-rose-50 text-rose-700">
                {t}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-700 leading-relaxed">{profile.chineseDescription}</p>
      </CardContent>
    </Card>
  );
}

function ElementAnalysisCard({ profile }: { profile: AstrologyProfile }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Icon name="Leaf" size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Анализ стихий</h3>
            <p className="text-xs text-gray-500">Западные и восточные элементы</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 bg-gradient-to-br ${ELEMENT_BG[profile.zodiacElement]} text-white`}>
            <p className="text-[10px] uppercase tracking-wide opacity-80">Западная стихия</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{ELEMENT_EMOJI[profile.zodiacElement]}</span>
              <span className="text-lg font-bold">{getElementLabel(profile.zodiacElement)}</span>
            </div>
          </div>
          <div className={`rounded-xl p-3 bg-gradient-to-br ${ELEMENT_BG[profile.chineseElement]} text-white`}>
            <p className="text-[10px] uppercase tracking-wide opacity-80">Восточная стихия</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{ELEMENT_EMOJI[profile.chineseElement]}</span>
              <span className="text-lg font-bold">{getElementLabel(profile.chineseElement)}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">{profile.chineseYinYang === 'yin' ? '🌙' : '☀️'}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {profile.chineseYinYang === 'yin' ? 'Инь — женская энергия' : 'Ян — мужская энергия'}
            </p>
            <p className="text-xs text-gray-600">
              {profile.chineseYinYang === 'yin'
                ? 'Спокойствие, мудрость, интуиция. Сила в мягкости и принятии.'
                : 'Активность, сила, инициатива. Энергия созидания и движения.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DailyForecastCard({ profile }: { profile: AstrologyProfile }) {
  const forecast = getDailyForecast(profile.zodiacSign);
  const today = new Date();
  const dayStr = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  return (
    <Card className="overflow-hidden border-2 border-amber-200">
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Icon name="Sparkles" size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Прогноз дня</h3>
              <p className="text-xs text-gray-500">{dayStr}</p>
            </div>
          </div>
          <span className="text-2xl">{profile.zodiacEmoji}</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-purple-50 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-purple-600 mb-1">Настроение</p>
            <p className="text-xs font-bold text-purple-900">{forecast.mood}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-orange-600 mb-1">Энергия</p>
            <div className="flex justify-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  key={i}
                  name="Star"
                  size={12}
                  className={i < forecast.energy ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>
          <div className="bg-teal-50 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-teal-600 mb-1">Цвет дня</p>
            <p className="text-xs font-bold text-teal-900">{forecast.color}</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 flex items-start gap-2">
          <Icon name="Lightbulb" size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-800 leading-relaxed">{forecast.advice}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PlanetaryInfluenceCard({ profile }: { profile: AstrologyProfile }) {
  const planet = profile.zodiacPlanet;
  const iconName = PLANET_ICONS[planet] || 'Circle';
  const description = PLANET_DESCRIPTIONS[planet] || 'Влияние вашей управляющей планеты помогает раскрыть ваш потенциал и направляет к верным решениям.';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-violet-100 p-2 rounded-lg">
            <Icon name={iconName} size={20} className="text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Влияние планеты</h3>
            <p className="text-xs text-gray-500">Управляющая планета в этом месяце</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
              <Icon name={iconName} size={24} className="text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">{planet}</h4>
              <p className="text-xs text-violet-600">Управитель знака {profile.zodiacSignLabel}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CompatibilityTable({ membersData }: {
  membersData: { member: FamilyMember; profile: AstrologyProfile }[];
}) {
  if (membersData.length < 2) return null;

  return (
    <Card className="overflow-hidden border-2 border-purple-200">
      <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Icon name="Users" size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Совместимость знаков</h3>
            <p className="text-xs text-gray-500">Зодиакальная совместимость всех пар</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-gray-500 font-medium"></th>
                {membersData.map(({ member, profile }) => (
                  <th key={member.id} className="p-2 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-base">{profile.zodiacEmoji}</span>
                      <span className="text-[10px] text-gray-600 truncate max-w-[60px]">{member.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {membersData.map(({ member: rowM, profile: rowP }, ri) => (
                <tr key={rowM.id}>
                  <td className="p-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{rowP.zodiacEmoji}</span>
                      <span className="text-[10px] text-gray-700 truncate max-w-[60px]">{rowM.name}</span>
                    </div>
                  </td>
                  {membersData.map(({ member: colM, profile: colP }, ci) => {
                    if (ri === ci) {
                      return (
                        <td key={colM.id} className="p-2 text-center">
                          <span className="text-gray-300">---</span>
                        </td>
                      );
                    }
                    const zodiacCompat = getZodiacCompatibility(rowP.zodiacSign, colP.zodiacSign);
                    const chineseCompat = getChineseCompatibility(rowP.chineseAnimal, colP.chineseAnimal);
                    const avg = Math.round((zodiacCompat + chineseCompat) / 2);
                    const colorClass = avg >= 75 ? 'bg-emerald-100 text-emerald-700' : avg >= 55 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
                    return (
                      <td key={colM.id} className="p-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded-lg font-bold text-xs ${colorClass}`}>
                          {avg}%
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 justify-center mt-3 pt-3 border-t">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
            <span className="text-[10px] text-gray-500">75%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            <span className="text-[10px] text-gray-500">55-74%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
            <span className="text-[10px] text-gray-500">&lt;55%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ZodiacDistributionCard({ membersData }: {
  membersData: { member: FamilyMember; profile: AstrologyProfile }[];
}) {
  const elementCounts = useMemo(() => {
    const counts: Record<string, { count: number; label: string; members: string[] }> = {};
    const elements: Element[] = ['fire', 'earth', 'air', 'water'];
    elements.forEach(el => {
      counts[el] = { count: 0, label: getElementLabel(el), members: [] };
    });
    membersData.forEach(({ member, profile }) => {
      const el = profile.zodiacElement;
      if (counts[el]) {
        counts[el].count++;
        counts[el].members.push(member.name);
      }
    });
    return counts;
  }, [membersData]);

  const total = membersData.length;
  if (total === 0) return null;

  const elementOrder: Element[] = ['fire', 'earth', 'air', 'water'];
  const segmentColors: Record<string, string> = {
    fire: '#ef4444',
    earth: '#f59e0b',
    air: '#38bdf8',
    water: '#6366f1',
  };

  let cumulative = 0;
  const segments = elementOrder
    .filter(el => elementCounts[el].count > 0)
    .map(el => {
      const pct = (elementCounts[el].count / total) * 100;
      const offset = cumulative;
      cumulative += pct;
      return { el, pct, offset, color: segmentColors[el] };
    });

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Icon name="PieChart" size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Распределение стихий</h3>
            <p className="text-xs text-gray-500">Баланс элементов в семье</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {segments.map(seg => (
                <circle
                  key={seg.el}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="4"
                  strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                  strokeDashoffset={`${-seg.offset}`}
                  className="transition-all duration-500"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">{total}</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {elementOrder.map(el => {
              const data = elementCounts[el];
              if (data.count === 0) return null;
              const pct = Math.round((data.count / total) * 100);
              return (
                <div key={el}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      {ELEMENT_EMOJI[el]} {data.label}
                    </span>
                    <span className="text-[10px] text-gray-500">{data.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: segmentColors[el] }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{data.members.join(', ')}</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FamilyMatrixAstrology() {
  const { members, loading } = useFamilyMembersContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const membersWithBirth = members.filter(m => getBd(m));

  const selectedMember = members.find(m => m.id === selectedId) || null;
  const birthDate = selectedMember ? getBd(selectedMember) : null;

  const profile = useMemo(() => {
    if (!birthDate) return null;
    try {
      return calculateAstrologyProfile(birthDate);
    } catch {
      return null;
    }
  }, [birthDate]);

  const allMembersData = useMemo(() => {
    return membersWithBirth
      .map(m => {
        const bd = getBd(m);
        if (!bd) return null;
        try {
          const p = calculateAstrologyProfile(bd);
          if (!p) return null;
          return { member: m, profile: p };
        } catch {
          return null;
        }
      })
      .filter((x): x is { member: FamilyMember; profile: AstrologyProfile } => x !== null);
  }, [membersWithBirth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="mx-auto mb-3 text-indigo-500 animate-spin" />
          <p className="text-sm text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Астрология{selectedMember ? ` — ${selectedMember.name}` : ''} | Семейный код</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 p-4 lg:p-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-5">
          <SectionHero
            title="Астрология семьи"
            subtitle="Звёздные карты, стихии и совместимость знаков зодиака"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/da280cc1-1f9a-4521-995f-1fab621c0a1b.jpg"
            backPath="/family-matrix"
          />

          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                <Icon name="Users" size={16} className="text-indigo-600" />
                Выберите члена семьи
              </p>
              {members.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Icon name="UserPlus" size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Добавьте членов семьи в разделе «Семья»</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {members.map(m => (
                      <MemberChip
                        key={m.id}
                        member={m}
                        isSelected={selectedId === m.id}
                        onClick={() => setSelectedId(selectedId === m.id ? null : m.id)}
                      />
                    ))}
                  </div>
                  {membersWithBirth.length < members.length && (
                    <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1">
                      <Icon name="Info" size={12} />
                      У некоторых членов не указана дата рождения. Заполните в профиле для полного анализа.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {!selectedId && membersWithBirth.length > 0 && (
            <div className="text-center py-8 text-gray-400">
              <Icon name="Stars" size={48} className="mx-auto mb-3 text-indigo-300" />
              <p className="text-sm">Выберите человека для просмотра астрологического профиля</p>
            </div>
          )}

          {selectedMember && !birthDate && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-center">
                <Icon name="Calendar" size={32} className="mx-auto mb-2 text-amber-500" />
                <p className="text-sm text-amber-800 font-medium mb-1">Дата рождения не указана</p>
                <p className="text-xs text-amber-700">
                  Для построения астрологического профиля нужна дата рождения.
                </p>
              </CardContent>
            </Card>
          )}

          {selectedMember && profile && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ZodiacSignCard profile={profile} />
                <ChineseZodiacCard profile={profile} />
              </div>

              <ElementAnalysisCard profile={profile} />
              <DailyForecastCard profile={profile} />
              <PlanetaryInfluenceCard profile={profile} />
            </div>
          )}

          {allMembersData.length >= 2 && (
            <div className="space-y-5 pt-2">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Icon name="Network" size={20} className="text-purple-600" />
                Семейная совместимость
              </h3>
              <CompatibilityTable membersData={allMembersData} />
              <ZodiacDistributionCard membersData={allMembersData} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}