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

interface SubGroup {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  sections: SubSection[];
}

// Зонт «Дом и хозяйство» — повседневные совместные дела семьи
const householdSubSections: SubSection[] = [
  {
    id: 'shopping',
    title: 'Список покупок',
    description: 'Общий список покупок для всей семьи с категориями',
    icon: 'ShoppingCart',
    path: '/shopping',
    gradient: 'from-orange-500 to-amber-600',
    ready: true,
  },
  {
    id: 'voting',
    title: 'Голосования',
    description: 'Семейные голосования для принятия общих решений',
    icon: 'Vote',
    path: '/voting',
    gradient: 'from-blue-500 to-indigo-600',
    ready: true,
  },
  {
    id: 'home',
    title: 'Дом',
    description: 'Квартира, коммуналка, показания счётчиков, ремонты и техника',
    icon: 'Building',
    path: '/household-hub',
    gradient: 'from-amber-500 to-orange-600',
    badge: 'Скоро',
    badgeColor: 'bg-amber-100 text-amber-700',
    ready: false,
  },
];

// Зонт «Транспорт» — машины, ТО, расходы и напоминания
const transportSubSections: SubSection[] = [
  {
    id: 'garage',
    title: 'Гараж',
    description: 'Учёт автомобилей, ТО, расходы и напоминания',
    icon: 'Car',
    path: '/garage',
    gradient: 'from-slate-600 to-blue-700',
    ready: true,
  },
];

const subGroups: SubGroup[] = [
  {
    id: 'home-group',
    title: 'Дом и хозяйство',
    subtitle: 'Повседневные совместные дела',
    icon: 'Home',
    sections: householdSubSections,
  },
  {
    id: 'transport-group',
    title: 'Транспорт',
    subtitle: 'Машины и поездки',
    icon: 'Car',
    sections: transportSubSections,
  },
];

export default function HouseholdHub() {
  const navigate = useNavigate();

  // Карта прогресса — даёт пользователю визуальный путь по разделам быта
  const progressSteps: ProgressStep[] = [
    {
      id: 'shopping',
      label: 'Покупки',
      hint: 'Что нужно купить',
      icon: 'ShoppingCart',
      status: 'available',
    },
    {
      id: 'voting',
      label: 'Решения',
      hint: 'Голосуем семьёй',
      icon: 'Vote',
      status: 'available',
    },
    {
      id: 'home',
      label: 'Дом',
      hint: 'Квартира и быт',
      icon: 'Building',
      status: 'locked',
      tooltip: 'Скоро: учёт коммуналки, показаний и ремонтов',
    },
    {
      id: 'garage',
      label: 'Транспорт',
      hint: 'Машины и ТО',
      icon: 'Car',
      status: 'available',
    },
  ];

  const handleStepClick = (step: ProgressStep) => {
    const allSections = [...householdSubSections, ...transportSubSections];
    const target = allSections.find((s) => s.id === step.id);
    if (target?.ready) navigate(target.path);
  };

  return (
    <>
      <SEOHead
        title="Дом и быт — покупки, голосования, транспорт"
        description="Списки покупок, семейные голосования, управление автомобилем и домом. Организация повседневного быта семьи."
        path="/household-hub"
        breadcrumbs={[{ name: 'Дом и быт', path: '/household-hub' }]}
      />
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-white pb-24">
        <div className="max-w-5xl mx-auto p-4 space-y-6">
          <SectionHero
            title="Дом и быт"
            subtitle="Покупки, домашние решения и транспорт — всё в одном месте"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/3846fdd1-13b2-4590-82b3-e8c37204ee0b.jpg"
          />

          {/* Карта прогресса */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
            <CardContent className="p-4">
              <ProgressMap
                steps={progressSteps}
                onStepClick={handleStepClick}
                title="Карта быта семьи"
                subtitle="Заглядывайте в каждый раздел — все шаги доступны независимо"
                accent="amber"
              />
            </CardContent>
          </Card>

          {/* Группы разделов */}
          {subGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Icon name={group.icon} size={18} className="text-amber-700" />
                <div>
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">{group.title}</h2>
                  <p className="text-xs text-slate-500">{group.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.sections.map((section) => (
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
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-base group-hover:text-amber-700 transition-colors">
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
                            {!section.ready && !section.badge && (
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
          ))}
        </div>
      </div>
    </>
  );
}
