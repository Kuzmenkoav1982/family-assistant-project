import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Helmet } from 'react-helmet-async';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import HubCardV2 from '@/components/hub/HubCardV2';
import type { Modality } from '@/components/hub/ModalityBadge';
import type { CardStatus } from '@/components/hub/StatusBadge';

interface SubSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  path: string;
  modality: Modality;
  status: CardStatus;
  isNew?: boolean;
  cta?: string;
}

const subSections: SubSection[] = [
  {
    id: 'personal',
    title: 'Личный код',
    description: 'Полный расклад на каждого члена семьи: числа судьбы, квадрат Пифагора, знаки зодиака, карта Бацзы и арканы Таро',
    icon: 'UserCircle2',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50 dark:bg-violet-950/40',
    path: '/family-matrix/personal',
    modality: 'reflect',
    status: 'recommended',
    cta: 'Открыть',
  },
  {
    id: 'couple',
    title: 'Код пары',
    description: 'Совместимость по всем 4 пластам: нумерология, астрология, арканы, психология. Оценка 0-100% и советы',
    icon: 'Heart',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
    path: '/family-matrix/couple',
    modality: 'reflect',
    status: 'recommended',
    cta: 'Открыть',
  },
  {
    id: 'family',
    title: 'Код семьи',
    description: 'Энергетика семьи сегодня, матрица взаимоотношений, биоритмы и дни силы для каждого',
    icon: 'Users',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    path: '/family-matrix/family',
    modality: 'family',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'rituals',
    title: 'Ритуалы примирения',
    description: 'Персональные сценарии после ссор + ИИ-анализ конкретных конфликтов с учётом нумерологии и астрологии обоих участников',
    icon: 'Flame',
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50 dark:bg-teal-950/40',
    path: '/family-matrix/rituals',
    modality: 'ai',
    status: 'recommended',
    cta: 'Открыть',
  },
  {
    id: 'child-code',
    title: 'Детский код',
    description: 'Врождённые таланты, стиль обучения, мотивация и рекомендации для родителей',
    icon: 'Baby',
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
    path: '/family-matrix/child',
    modality: 'reflect',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'name-calculator',
    title: 'Имя для малыша',
    description: 'Топ-10 имён по совместимости с родителями + проверка своего варианта',
    icon: 'Sparkles',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    path: '/family-matrix/name',
    modality: 'service',
    status: 'ready',
    cta: 'Подобрать',
  },
  {
    id: 'astrology',
    title: 'Астрология',
    description: 'Знаки зодиака, китайский гороскоп, карта Бацзы (4 столпа судьбы), прогнозы на день/неделю/месяц и ИИ-прогноз от Домового',
    icon: 'Moon',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    path: '/family-matrix/astrology',
    modality: 'ai',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'pari-mirror',
    title: 'Зеркало родителя',
    description: 'Научный тест PARI Шефера-Белла на родительские установки. 35 вопросов, радар-диаграмма, ИИ-разбор результатов',
    icon: 'HeartHandshake',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 dark:bg-purple-950/40',
    path: '/pari-test',
    modality: 'reflect',
    status: 'recommended',
    cta: 'Пройти тест',
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

      <HubLayoutV2
        title="Семейный код"
        subtitle="Смысловой хаб — Цикл: Осмысление → Договорённости"
        description="Нумерология, астрология, Бацзы, арканы Таро и ИИ-советник. Глубокий портрет вашей семьи и совместимости."
        icon="Sparkles"
        iconColor="text-purple-600"
        iconBg="bg-purple-100 dark:bg-purple-900/40"
        modalities={['reflect', 'ai', 'family']}
        cycleHint="Здесь рождается понимание себя и пары — основа семейных договорённостей"
        backgroundClass="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        quickFacts={[
          { label: 'Сервисов',  value: subSections.length, icon: 'LayoutGrid' },
          { label: 'Систем',    value: 4,                  icon: 'Layers' },
          { label: 'Помощник',  value: 'Домовой ИИ',       icon: 'Brain' },
          { label: 'Характер',  value: 'Развлек. + ИИ',    icon: 'Sparkles' },
        ]}
        primaryAction={{
          label: 'Открыть личный код',
          icon: 'UserCircle2',
          onClick: () => navigate('/family-matrix/personal'),
        }}
        secondaryAction={{
          label: 'Код пары',
          icon: 'Heart',
          onClick: () => navigate('/family-matrix/couple'),
        }}
        relatedLinks={[
          { label: 'Семья',      icon: 'Users',          path: '/family-hub' },
          { label: 'Развитие',   icon: 'Brain',          path: '/development-hub' },
          { label: 'Ценности',   icon: 'Heart',          path: '/values-hub' },
          { label: 'Зеркало родителя', icon: 'HeartHandshake', path: '/pari-test' },
        ]}
      >
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
                  Домовой даёт рекомендации, анализирует конфликты и составляет персональные прогнозы на основе ВСЕХ расчётов.
                </p>
              </div>
            </div>
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
            «Семейный код» носит <strong>развлекательно-познавательный характер</strong> и основан на традиционных эзотерических системах (пифагорейская нумерология, астрология, Бацзы, Таро).
            Результаты не являются научно доказанными и <strong>не заменяют консультацию психолога, врача или другого специалиста</strong>.
            Используйте как инструмент для самопознания и вдохновения.
          </p>
        </CollapsibleBlock>

        <div>
          <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
            Сервисы
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subSections.map(s => (
              <HubCardV2
                key={s.id}
                icon={s.icon}
                iconColor={s.iconColor}
                iconBg={s.iconBg}
                title={s.title}
                description={s.description}
                modality={s.modality}
                status={s.status}
                isNew={s.isNew}
                cta={s.cta}
                onClick={() => navigate(s.path)}
              />
            ))}
          </div>
        </div>
      </HubLayoutV2>
    </>
  );
}
