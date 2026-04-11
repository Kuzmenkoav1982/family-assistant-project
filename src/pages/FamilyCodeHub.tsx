import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from 'react-helmet-async';

interface SubSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  gradient: string;
  badge?: string;
  badgeColor?: string;
  ready: boolean;
}

const subSections: SubSection[] = [
  {
    id: 'personal',
    title: 'Личный код',
    description: 'Полный расклад на каждого члена семьи: числа судьбы, квадрат Пифагора, знаки зодиака, карта Бацзы и арканы Таро',
    icon: 'UserCircle2',
    path: '/family-matrix/personal',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    badge: 'Расклад',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    ready: true,
  },
  {
    id: 'couple',
    title: 'Код пары',
    description: 'Совместимость по всем 4 пластам: нумерология, астрология, арканы, психология. Оценка 0-100% и советы',
    icon: 'Heart',
    path: '/family-matrix/couple',
    gradient: 'from-rose-500 via-pink-500 to-red-500',
    badge: 'Совместимость',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    ready: true,
  },
  {
    id: 'family',
    title: 'Код семьи',
    description: 'Энергетика семьи сегодня, матрица взаимоотношений, биоритмы и дни силы для каждого',
    icon: 'Users',
    path: '/family-matrix/family',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    badge: 'Энергетика',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    ready: true,
  },
  {
    id: 'rituals',
    title: 'Ритуалы примирения',
    description: 'Персональные сценарии после ссор + ИИ-анализ конкретных конфликтов с учётом нумерологии и астрологии обоих участников',
    icon: 'Flame',
    path: '/family-matrix/rituals',
    gradient: 'from-teal-500 via-cyan-500 to-blue-500',
    badge: 'ИИ-советник',
    badgeColor: 'bg-violet-100 text-violet-700',
    ready: true,
  },
  {
    id: 'child-code',
    title: 'Детский код',
    description: 'Врождённые таланты, стиль обучения, мотивация и рекомендации для родителей',
    icon: 'Baby',
    path: '/family-matrix/child',
    gradient: 'from-sky-400 via-blue-500 to-indigo-500',
    badge: 'Таланты',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    ready: true,
  },
  {
    id: 'name-calculator',
    title: 'Имя для малыша',
    description: 'Топ-10 имён по совместимости с родителями + проверка своего варианта',
    icon: 'Sparkles',
    path: '/family-matrix/name',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    badge: 'Калькулятор',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    ready: true,
  },
  {
    id: 'astrology',
    title: 'Астрология',
    description: 'Знаки зодиака, китайский гороскоп, карта Бацзы (4 столпа судьбы), прогнозы на день/неделю/месяц и ИИ-прогноз от Домового',
    icon: 'Moon',
    path: '/family-matrix/astrology',
    gradient: 'from-indigo-500 via-violet-500 to-purple-600',
    badge: 'Бацзы + ИИ',
    badgeColor: 'bg-violet-100 text-violet-700',
    ready: true,
  },
];

function CollapsibleBlock({
  icon,
  iconBg,
  title,
  borderColor,
  bgGradient,
  defaultOpen = false,
  children,
}: {
  icon: string;
  iconBg: string;
  title: string;
  borderColor: string;
  bgGradient: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className={`border-2 ${borderColor} ${bgGradient} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 md:p-5 text-left hover:bg-white/20 transition-colors"
      >
        <div className={`${iconBg} p-2 rounded-xl flex-shrink-0`}>
          <Icon name={icon} size={18} className="text-inherit" />
        </div>
        <h3 className="font-bold text-sm flex-1">{title}</h3>
        <Icon
          name="ChevronDown"
          size={18}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 md:px-5 md:pb-5">{children}</div>
      </div>
    </Card>
  );
}

export default function FamilyCodeHub() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Семейный код — Нумерология, Астрология, Бацзы, Таро | Наша Семья</title>
        <meta
          name="description"
          content="Семейный код — полный эзотерический портрет вашей семьи: числа судьбы, квадрат Пифагора, зодиак, карта Бацзы, арканы Таро, ИИ-анализ конфликтов и персональные прогнозы."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 lg:p-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          <SectionHero
            title="Семейный код"
            subtitle="Нумерология, астрология, Бацзы, арканы Таро и ИИ-советник"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b01853ff-894d-4bfc-98e1-e32b7c13a7bc.jpg"
            backPath="/"
          />

          <CollapsibleBlock
            icon="Info"
            iconBg="bg-amber-100 text-amber-600"
            title="Как это работает?"
            borderColor="border-amber-200"
            bgGradient="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50"
          >
            <div className="space-y-3">
              <p className="text-sm text-amber-900/80 leading-relaxed">
                «Семейный код» — объединённая система глубокого эзотерического анализа: нумерология, астрология,
                карта Бацзы, арканы Таро и ИИ-советник. Всё рассчитывается автоматически на основе имени и даты рождения.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
                  <p className="text-xs font-semibold text-amber-900 mb-1.5 flex items-center gap-1.5">
                    <Icon name="UserCircle2" size={14} className="text-amber-600" />
                    Шаг 1. Заполните профили
                  </p>
                  <p className="text-[11px] text-amber-800/70 leading-relaxed">
                    Укажите дату рождения и ФИО каждого члена семьи в разделе «Семья». Этого достаточно для полного расчёта нумерологии, астрологии и арканов.
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
                  <p className="text-xs font-semibold text-amber-900 mb-1.5 flex items-center gap-1.5">
                    <Icon name="Calculator" size={14} className="text-amber-600" />
                    Шаг 2. Автоматический расчёт
                  </p>
                  <p className="text-[11px] text-amber-800/70 leading-relaxed">
                    Система рассчитает все числа судьбы, квадрат Пифагора, знак зодиака, карту Бацзы (4 столпа судьбы) и 4 аркана Таро — полностью автоматически.
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
                  <p className="text-xs font-semibold text-amber-900 mb-1.5 flex items-center gap-1.5">
                    <Icon name="Heart" size={14} className="text-amber-600" />
                    Шаг 3. Совместимость пары
                  </p>
                  <p className="text-[11px] text-amber-800/70 leading-relaxed">
                    Совместимость считается по 4 пластам одновременно: числа + стихии + арканы + психотипы. Оценка 0-100% по каждому направлению.
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
                  <p className="text-xs font-semibold text-amber-900 mb-1.5 flex items-center gap-1.5">
                    <Icon name="MessageCircle" size={14} className="text-amber-600" />
                    Шаг 4. Персональные советы
                  </p>
                  <p className="text-[11px] text-amber-800/70 leading-relaxed">
                    Домовой даёт рекомендации, анализирует конфликты и составляет персональные прогнозы на основе ВСЕХ расчётов. ИИ учитывает ваши уникальные числа, стихии и Бацзы.
                  </p>
                </div>
              </div>

              <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
                <p className="text-xs font-semibold text-amber-900 mb-2">Что анализируется:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { icon: 'Calculator', label: 'Нумерология', desc: '6 чисел судьбы, квадрат Пифагора, линии силы' },
                    { icon: 'Star', label: 'Астрология', desc: 'Зодиак, планеты, прогнозы, Бацзы — 4 столпа' },
                    { icon: 'Wand2', label: 'Арканы Таро', desc: '4 аркана: личность, судьба, год, отношения' },
                    { icon: 'Brain', label: 'ИИ-советник', desc: 'Анализ конфликтов и персональные прогнозы' },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <Icon name={item.icon} size={18} className="text-amber-600 mx-auto mb-1" />
                      <p className="text-[11px] font-semibold text-amber-900">{item.label}</p>
                      <p className="text-[10px] text-amber-800/60 leading-tight">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <ul className="text-xs text-amber-900/70 space-y-1">
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Все расчёты происходят мгновенно — ничего не нужно ждать</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Чем больше данных в анкете — тем точнее анализ и советы</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Доступ можно отключить в настройках → Права доступа</span>
                </li>
              </ul>
            </div>
          </CollapsibleBlock>

          <CollapsibleBlock
            icon="Sparkles"
            iconBg="bg-purple-100 text-purple-600"
            title="Что входит в раздел «Нумерология»?"
            borderColor="border-purple-200"
            bgGradient="bg-gradient-to-r from-purple-50 via-violet-50 to-fuchsia-50"
          >
            <div className="space-y-3">
              <p className="text-sm text-purple-800/80 leading-relaxed">
                Это единый раздел глубокого анализа членов вашей семьи. Система рассчитывает и комбинирует
                все пласты информации о человеке для максимально точного портрета и анализа совместимости:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-white/60 rounded-lg p-2.5 border border-purple-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon name="Calculator" size={14} className="text-purple-600" />
                    <span className="text-xs font-semibold text-purple-900">Нумерология</span>
                  </div>
                  <p className="text-[11px] text-purple-800/70 leading-tight">Числа судьбы, квадрат Пифагора</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2.5 border border-purple-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon name="Star" size={14} className="text-purple-600" />
                    <span className="text-xs font-semibold text-purple-900">Астрология</span>
                  </div>
                  <p className="text-[11px] text-purple-800/70 leading-tight">Зодиак, Бацзы, стихии</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2.5 border border-purple-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon name="Wand2" size={14} className="text-purple-600" />
                    <span className="text-xs font-semibold text-purple-900">Арканы</span>
                  </div>
                  <p className="text-[11px] text-purple-800/70 leading-tight">Таро-расклад судьбы</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2.5 border border-purple-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon name="Heart" size={14} className="text-purple-600" />
                    <span className="text-xs font-semibold text-purple-900">Психология</span>
                  </div>
                  <p className="text-[11px] text-purple-800/70 leading-tight">Языки любви, психотипы</p>
                </div>
              </div>
              <p className="text-sm text-purple-800/80 leading-relaxed">
                Совместимость супругов анализируется по <strong>всем четырём пластам одновременно</strong>:
                числа, знаки зодиака, арканы и психотипы. Получаете оценку 0-100% по каждому направлению
                и общий вердикт с конкретными рекомендациями.
              </p>
            </div>
          </CollapsibleBlock>

          <CollapsibleBlock
            icon="Info"
            iconBg="bg-blue-100 text-blue-600"
            title="Дисклеймер"
            borderColor="border-blue-200"
            bgGradient="bg-gradient-to-r from-blue-50 to-indigo-50"
          >
            <p className="text-xs text-blue-800/80 leading-relaxed">
              Раздел «Нумерология» носит <strong>развлекательно-познавательный характер</strong> и основан на традиционных эзотерических системах (пифагорейская нумерология, астрология, Таро). 
              Результаты не являются научно доказанными и <strong>не заменяют консультацию психолога, врача или другого специалиста</strong>. 
              Используйте как инструмент для самопознания и вдохновения.
            </p>
          </CollapsibleBlock>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subSections.map((section) => (
              <Card
                key={section.id}
                className={`group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 overflow-hidden ${
                  section.ready ? 'border-transparent' : 'border-dashed border-purple-200'
                }`}
                onClick={() => {
                  if (section.ready) {
                    navigate(section.path);
                  }
                }}
              >
                <div className={`h-2 bg-gradient-to-r ${section.gradient}`} />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`bg-gradient-to-br ${section.gradient} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon name={section.icon} size={24} className="text-white" />
                    </div>
                    {section.badge && (
                      <Badge className={section.badgeColor || 'bg-gray-100 text-gray-600'}>
                        {section.badge}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {section.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <span
                      className={`text-xs font-medium flex items-center gap-1 transition-all ${
                        section.ready
                          ? 'text-purple-600 group-hover:gap-2'
                          : 'text-gray-400'
                      }`}
                    >
                      {section.ready ? 'Открыть' : 'В разработке'}
                      <Icon name={section.ready ? 'ArrowRight' : 'Clock'} size={14} />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}