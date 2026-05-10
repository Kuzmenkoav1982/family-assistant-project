import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import SEOHead from '@/components/SEOHead';
import ProgressMap, { type ProgressStep } from '@/components/ui/progress-map';

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

type LayerId = 'panorama' | 'practice' | 'dialog' | 'reflection';

interface DevLayer {
  id: LayerId;
  title: string;          // короткое название (для табов)
  fullTitle: string;      // полное название
  subtitle: string;       // одно предложение под табом
  description: string;    // 2-3 предложения о смысле слоя
  icon: string;
  accent: 'emerald' | 'blue' | 'violet' | 'amber';
  gradient: string;       // tailwind from-… via-… to-…
  badge: string;          // короткий лейбл-чип
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
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    badge: 'Картина',
    sections: [
      {
        id: 'portfolio',
        title: 'Портфолио развития',
        description:
          'Живая карта по 8 сферам для каждого члена семьи: радар, источники данных, подсказки. Не оценка и не диагноз — карта роста.',
        icon: 'Sparkles',
        path: '/portfolio',
        gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
        badge: 'Новое',
        badgeColor: 'bg-emerald-100 text-emerald-700',
        ready: true,
      },
    ],
  },
  {
    id: 'practice',
    title: 'Практика',
    fullTitle: 'Практика и навыки',
    subtitle: 'Растём ежедневно',
    description:
      'Планы развития, навыки, достижения, мастерская жизни. Здесь картина превращается в реальные шаги и привычки. Семья как мастерская роста — вы создаёте свой путь.',
    icon: 'Hammer',
    accent: 'blue',
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    badge: 'Шаги',
    sections: [
      {
        id: 'development',
        title: 'Развитие семьи',
        description: 'Планы развития, навыки и достижения каждого члена семьи',
        icon: 'TrendingUp',
        path: '/development',
        gradient: 'from-blue-500 to-indigo-600',
        ready: true,
      },
      {
        id: 'life-road',
        title: 'Мастерская жизни',
        description:
          'Твори свой путь: хронология событий, сезоны жизни, цели и инструменты для осознанного планирования',
        icon: 'Hammer',
        path: '/life-road',
        gradient: 'from-pink-500 via-purple-500 to-indigo-600',
        badge: 'Новое',
        badgeColor: 'bg-pink-100 text-pink-700',
        ready: true,
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
    gradient: 'from-violet-500 via-fuchsia-500 to-purple-600',
    badge: 'ИИ-помощник',
    sections: [
      {
        id: 'psychologist',
        title: 'Семейный психолог',
        description: 'ИИ-консультации, техники релаксации, упражнения для семьи, справочник кризисов',
        icon: 'Brain',
        path: '/psychologist',
        gradient: 'from-violet-500 to-purple-600',
        badge: 'ИИ',
        badgeColor: 'bg-violet-100 text-violet-700',
        ready: true,
      },
    ],
  },
  {
    id: 'reflection',
    title: 'Рефлексия',
    fullTitle: 'Рефлексия родителя',
    subtitle: 'Смотрим на себя честно',
    description:
      'Зеркало родителя: научный тест PARI, радар-диаграмма установок, ИИ-разбор. Это пространство тихого взгляда внутрь — без оценок, только наблюдение и осознание. Канонический раздел живёт в «Семейном коде».',
    icon: 'HeartHandshake',
    accent: 'amber',
    gradient: 'from-amber-500 via-orange-500 to-pink-500',
    badge: 'Шорткат в «Семейный код»',
    sections: [
      {
        id: 'pari-mirror',
        title: 'Зеркало родителя',
        description:
          'Научный тест родительских установок (PARI Шефера-Белла). 35 вопросов, радар-диаграмма, ИИ-разбор. Раздел в «Семейном коде» — здесь карточка-шорткат.',
        icon: 'HeartHandshake',
        path: '/pari-test',
        gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
        badge: 'Семейный код',
        badgeColor: 'bg-purple-100 text-purple-700',
        ready: true,
      },
    ],
  },
];

const LAYER_ACCENT_MAP = {
  emerald: {
    activeBg: 'bg-emerald-600',
    activeText: 'text-white',
    inactiveBg: 'bg-emerald-50',
    inactiveText: 'text-emerald-700',
    ring: 'ring-emerald-200',
    softBg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
    icon: 'text-emerald-700',
  },
  blue: {
    activeBg: 'bg-blue-600',
    activeText: 'text-white',
    inactiveBg: 'bg-blue-50',
    inactiveText: 'text-blue-700',
    ring: 'ring-blue-200',
    softBg: 'bg-blue-50/50',
    border: 'border-blue-200',
    icon: 'text-blue-700',
  },
  violet: {
    activeBg: 'bg-violet-600',
    activeText: 'text-white',
    inactiveBg: 'bg-violet-50',
    inactiveText: 'text-violet-700',
    ring: 'ring-violet-200',
    softBg: 'bg-violet-50/50',
    border: 'border-violet-200',
    icon: 'text-violet-700',
  },
  amber: {
    activeBg: 'bg-amber-600',
    activeText: 'text-white',
    inactiveBg: 'bg-amber-50',
    inactiveText: 'text-amber-700',
    ring: 'ring-amber-200',
    softBg: 'bg-amber-50/50',
    border: 'border-amber-200',
    icon: 'text-amber-700',
  },
};

export default function DevelopmentHub() {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState<LayerId>('panorama');

  const currentLayer = layers.find((l) => l.id === activeLayer)!;
  const currentAccent = LAYER_ACCENT_MAP[currentLayer.accent];

  // ProgressMap — общий путь по 4 слоям развития
  const progressSteps: ProgressStep[] = layers.map((layer) => ({
    id: layer.id,
    label: layer.title,
    hint: layer.subtitle,
    icon: layer.icon,
    status:
      layer.id === activeLayer
        ? 'current'
        : layers.findIndex((l) => l.id === layer.id) <
          layers.findIndex((l) => l.id === activeLayer)
        ? 'done'
        : 'available',
  }));

  return (
    <>
      <SEOHead
        title="Развитие — центр личностного роста семьи"
        description="Панорама развития, практика и навыки, диалог с ИИ-психологом, рефлексия родителя. Образование, рост и путь жизни в одном месте."
        path="/development-hub"
        breadcrumbs={[{ name: 'Развитие', path: '/development-hub' }]}
      />
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-emerald-50/30 to-white pb-24">
        <div className="max-w-5xl mx-auto p-4 space-y-6">
          <SectionHero
            title="Развитие"
            subtitle="От картины — к практике, диалогу и рефлексии"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/364dd778-d8dc-4105-a314-da0ca595ed73.jpg"
          />

          {/* Карта прогресса по 4 слоям */}
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-white">
            <CardContent className="p-4">
              <ProgressMap
                steps={progressSteps}
                onStepClick={(step) => setActiveLayer(step.id as LayerId)}
                title="Путь развития семьи"
                subtitle="Четыре слоя — каждый отвечает за свою часть роста. Начинайте с любого, возвращайтесь, когда нужно."
                accent={currentLayer.accent === 'amber' ? 'amber' : currentLayer.accent}
              />
            </CardContent>
          </Card>

          {/* Табы слоёв */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {layers.map((layer) => {
              const a = LAYER_ACCENT_MAP[layer.accent];
              const isActive = layer.id === activeLayer;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-semibold text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? `${a.activeBg} ${a.activeText} border-transparent shadow-md scale-105`
                      : `bg-white ${a.inactiveText} border-slate-200 hover:border-slate-300`
                  }`}
                >
                  <Icon name={layer.icon} size={15} />
                  <span>{layer.title}</span>
                </button>
              );
            })}
          </div>

          {/* Описание текущего слоя */}
          <div className={`rounded-xl border-2 ${currentAccent.border} ${currentAccent.softBg} px-4 py-3`}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Icon name={currentLayer.icon} size={18} className={currentAccent.icon} />
              <h2 className="text-lg font-bold text-slate-800 leading-tight">{currentLayer.fullTitle}</h2>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${currentAccent.inactiveBg} ${currentAccent.inactiveText} border ${currentAccent.border}`}>
                {currentLayer.badge}
              </span>
              <span className="text-xs text-slate-500 italic">· {currentLayer.subtitle}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{currentLayer.description}</p>
          </div>

          {/* Карточки разделов текущего слоя */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentLayer.sections.map((section) => (
              <Card
                key={section.id}
                className={`group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 ${
                  section.ready ? 'border-transparent' : 'border-dashed border-gray-200'
                } overflow-hidden`}
                onClick={() => {
                  if (section.ready) {
                    navigate(section.path);
                  }
                }}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div
                      className={`w-20 min-h-full bg-gradient-to-br ${section.gradient} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon name={section.icon} size={32} className="text-white drop-shadow-sm" />
                    </div>

                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-base group-hover:text-teal-700 transition-colors">
                          {section.title}
                        </h3>
                        {section.badge && (
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 ${section.badgeColor || ''}`}
                          >
                            {section.badge}
                          </Badge>
                        )}
                        {!section.ready && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-600 border-amber-200"
                          >
                            Скоро
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug">{section.description}</p>
                    </div>

                    <div className="flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon name="ChevronRight" size={20} className="text-gray-400" />
                    </div>
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
