import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import SEOHead from '@/components/SEOHead';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import HubCardV2 from '@/components/hub/HubCardV2';
import type { Modality } from '@/components/hub/ModalityBadge';
import type { CardStatus } from '@/components/hub/StatusBadge';

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

type LayerId = 'panorama' | 'practice' | 'dialog' | 'reflection';

interface DevLayer {
  id: LayerId;
  title: string;
  fullTitle: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: 'emerald' | 'blue' | 'violet' | 'amber';
  badge: string;
  sections: SubSection[];
}

const layers: DevLayer[] = [
  {
    id: 'panorama',
    title: 'Панорама',
    fullTitle: 'Панорама развития',
    subtitle: 'Видим картину семьи целиком',
    description:
      'Карта по 8 сферам для каждого члена семьи. Не оценка и не диагноз — живая картина роста, источники данных и подсказки. Здесь начинается осмысленное развитие.',
    icon: 'LayoutDashboard',
    accent: 'emerald',
    badge: 'Картина',
    sections: [
      {
        id: 'portfolio',
        title: 'Портфолио развития',
        description:
          'Живая карта по 8 сферам для каждого члена семьи: радар, источники данных, подсказки. Не оценка и не диагноз — карта роста.',
        icon: 'Sparkles',
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        path: '/portfolio',
        modality: 'reflect',
        status: 'new',
        isNew: true,
        cta: 'Открыть',
      },
    ],
  },
  {
    id: 'practice',
    title: 'Практика',
    fullTitle: 'Практика и навыки',
    subtitle: 'Растём ежедневно',
    description:
      'Планы развития, навыки, достижения, мастерская жизни. Здесь картина превращается в реальные шаги и привычки. Семья как мастерская роста.',
    icon: 'Hammer',
    accent: 'blue',
    badge: 'Шаги',
    sections: [
      {
        id: 'development',
        title: 'Развитие семьи',
        description: 'Планы развития, навыки и достижения каждого члена семьи',
        icon: 'TrendingUp',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50 dark:bg-blue-950/40',
        path: '/development',
        modality: 'service',
        status: 'ready',
        cta: 'Открыть',
      },
      {
        id: 'life-road',
        title: 'Мастерская жизни',
        description:
          'Хронология событий, сезоны жизни, цели и инструменты для осознанного планирования',
        icon: 'Hammer',
        iconColor: 'text-pink-600',
        iconBg: 'bg-pink-50 dark:bg-pink-950/40',
        path: '/life-road',
        modality: 'reflect',
        status: 'new',
        isNew: true,
        cta: 'Открыть',
      },
    ],
  },
  {
    id: 'dialog',
    title: 'Диалог',
    fullTitle: 'Диалог и поддержка',
    subtitle: 'Разговор, который помогает',
    description:
      'ИИ-психолог, техники релаксации, справочник кризисов и поддержки. Здесь вы говорите — и вас слышат. Бережный собеседник для тонких семейных вопросов.',
    icon: 'MessagesSquare',
    accent: 'violet',
    badge: 'ИИ-помощник',
    sections: [
      {
        id: 'psychologist',
        title: 'Семейный психолог',
        description: 'ИИ-консультации, техники релаксации, упражнения для семьи, справочник кризисов',
        icon: 'Brain',
        iconColor: 'text-violet-600',
        iconBg: 'bg-violet-50 dark:bg-violet-950/40',
        path: '/psychologist',
        modality: 'ai',
        status: 'ready',
        cta: 'Поговорить',
      },
    ],
  },
  {
    id: 'reflection',
    title: 'Рефлексия',
    fullTitle: 'Рефлексия родителя',
    subtitle: 'Смотрим на себя честно',
    description:
      'Зеркало родителя: научный тест PARI, радар-диаграмма установок, ИИ-разбор. Это пространство тихого взгляда внутрь — без оценок, только наблюдение и осознание.',
    icon: 'HeartHandshake',
    accent: 'amber',
    badge: 'Шорткат в «Семейный код»',
    sections: [
      {
        id: 'pari-mirror',
        title: 'Зеркало родителя',
        description:
          'Научный тест родительских установок (PARI Шефера-Белла). 35 вопросов, радар-диаграмма, ИИ-разбор.',
        icon: 'HeartHandshake',
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50 dark:bg-amber-950/40',
        path: '/pari-test',
        modality: 'reflect',
        status: 'recommended',
        cta: 'Пройти тест',
      },
    ],
  },
];

const LAYER_TAB_ACCENT: Record<DevLayer['accent'], { active: string; inactive: string }> = {
  emerald: { active: 'bg-emerald-600 text-white border-transparent shadow-md scale-105', inactive: 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-300 border-slate-200 dark:border-gray-700 hover:border-slate-300' },
  blue:    { active: 'bg-blue-600 text-white border-transparent shadow-md scale-105',    inactive: 'bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 border-slate-200 dark:border-gray-700 hover:border-slate-300' },
  violet:  { active: 'bg-violet-600 text-white border-transparent shadow-md scale-105',  inactive: 'bg-white dark:bg-gray-900 text-violet-700 dark:text-violet-300 border-slate-200 dark:border-gray-700 hover:border-slate-300' },
  amber:   { active: 'bg-amber-600 text-white border-transparent shadow-md scale-105',   inactive: 'bg-white dark:bg-gray-900 text-amber-700 dark:text-amber-300 border-slate-200 dark:border-gray-700 hover:border-slate-300' },
};

export default function DevelopmentHub() {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState<LayerId>('panorama');
  const currentLayer = layers.find(l => l.id === activeLayer)!;

  return (
    <>
      <SEOHead
        title="Развитие — центр личностного роста семьи"
        description="Панорама развития, практика и навыки, диалог с ИИ-психологом, рефлексия родителя. Образование, рост и путь жизни в одном месте."
        path="/development-hub"
        breadcrumbs={[{ name: 'Развитие', path: '/development-hub' }]}
      />
      <HubLayoutV2
        title="Развитие"
        subtitle="Смысловой хаб — Цикл: Осмысление"
        description="От картины — к практике, диалогу и рефлексии. Четыре слоя личностного и семейного роста."
        icon="Brain"
        iconColor="text-violet-600"
        iconBg="bg-violet-100 dark:bg-violet-900/40"
        modalities={['reflect', 'ai']}
        cycleHint="Здесь рождаются смыслы, которые потом становятся договорённостями и действиями"
        backgroundClass="bg-gradient-to-b from-violet-50 via-fuchsia-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        quickFacts={[
          { label: 'Слоёв',     value: layers.length, icon: 'Layers' },
          { label: 'Сервисов',  value: layers.reduce((s, l) => s + l.sections.length, 0), icon: 'LayoutGrid' },
          { label: 'Активный', value: currentLayer.title, icon: currentLayer.icon },
          { label: 'Подход',    value: 'Без оценок', icon: 'Heart' },
        ]}
        primaryAction={{
          label: 'Открыть портфолио',
          icon: 'Sparkles',
          onClick: () => navigate('/portfolio'),
        }}
        secondaryAction={{
          label: 'Психолог',
          icon: 'Brain',
          onClick: () => navigate('/psychologist'),
        }}
        relatedLinks={[
          { label: 'Семейный код',  icon: 'Sparkles',       path: '/family-matrix' },
          { label: 'Ценности',      icon: 'Heart',          path: '/values-hub' },
          { label: 'Семья',         icon: 'Users',          path: '/family-hub' },
          { label: 'Зеркало родителя', icon: 'HeartHandshake', path: '/pari-test' },
        ]}
      >
        {/* Как это работает? */}
        <CollapsibleBlock
          icon="Info"
          iconBg="bg-violet-100 text-violet-600"
          title="Как это работает?"
          borderColor="border-violet-200"
          bgGradient="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50"
        >
          <div className="space-y-3">
            <p className="text-sm text-violet-900/80 leading-relaxed">
              «Развитие» — смысловой хаб личностного и семейного роста. Четыре слоя ведут вас от живой картины семьи к ежедневной практике, бережному диалогу и честной рефлексии. Без оценок и диагнозов — только наблюдение и осознанные шаги.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-white/60 rounded-lg p-3 border border-violet-100">
                <p className="text-xs font-semibold text-violet-900 mb-1.5 flex items-center gap-1.5">
                  <Icon name="LayoutDashboard" size={14} className="text-violet-600" />
                  Шаг 1. Панорама
                </p>
                <p className="text-[11px] text-violet-800/70 leading-relaxed">
                  Откройте «Портфолио развития» — живую карту по 8 сферам для каждого члена семьи. Это отправная точка: видим картину целиком.
                </p>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border border-violet-100">
                <p className="text-xs font-semibold text-violet-900 mb-1.5 flex items-center gap-1.5">
                  <Icon name="Hammer" size={14} className="text-violet-600" />
                  Шаг 2. Практика
                </p>
                <p className="text-[11px] text-violet-800/70 leading-relaxed">
                  Превращайте картину в шаги: планы развития, навыки, достижения, мастерская жизни. Здесь рост становится привычкой.
                </p>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border border-violet-100">
                <p className="text-xs font-semibold text-violet-900 mb-1.5 flex items-center gap-1.5">
                  <Icon name="MessagesSquare" size={14} className="text-violet-600" />
                  Шаг 3. Диалог
                </p>
                <p className="text-[11px] text-violet-800/70 leading-relaxed">
                  ИИ-психолог, техники релаксации, упражнения для семьи и справочник кризисов. Бережный собеседник для тонких вопросов.
                </p>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border border-violet-100">
                <p className="text-xs font-semibold text-violet-900 mb-1.5 flex items-center gap-1.5">
                  <Icon name="HeartHandshake" size={14} className="text-violet-600" />
                  Шаг 4. Рефлексия
                </p>
                <p className="text-[11px] text-violet-800/70 leading-relaxed">
                  Зеркало родителя: научный тест PARI, радар-диаграмма установок, ИИ-разбор. Тихий взгляд внутрь — без оценок.
                </p>
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-3 border border-violet-100">
              <p className="text-[11px] text-violet-800/80 leading-relaxed flex items-start gap-1.5">
                <Icon name="Sparkles" size={13} className="text-violet-600 mt-0.5 flex-shrink-0" />
                <span>Переключайте слои кнопками ниже — каждый открывает свои сервисы. Здесь рождаются смыслы, которые потом становятся договорённостями и действиями.</span>
              </p>
            </div>
          </div>
        </CollapsibleBlock>

        {/* Табы слоёв */}
        <div>
          <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
            Слои развития
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {layers.map(layer => {
              const a = LAYER_TAB_ACCENT[layer.accent];
              const isActive = layer.id === activeLayer;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-semibold text-sm whitespace-nowrap transition-all ${isActive ? a.active : a.inactive}`}
                >
                  <Icon name={layer.icon} size={15} />
                  <span>{layer.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Описание текущего слоя */}
        <div className="rounded-2xl border bg-white dark:bg-gray-900 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
              <Icon name={currentLayer.icon} size={18} className="text-violet-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                  {currentLayer.fullTitle}
                </h3>
                <span className="text-[10px] font-bold text-violet-700 bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 px-1.5 py-0.5 rounded-full">
                  {currentLayer.badge}
                </span>
              </div>
              <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">
                {currentLayer.description}
              </p>
            </div>
          </div>
        </div>

        {/* Карточки разделов текущего слоя */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentLayer.sections.map(s => (
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
      </HubLayoutV2>
    </>
  );
}