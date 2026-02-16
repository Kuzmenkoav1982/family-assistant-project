import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';

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
    id: 'goals',
    title: 'Цели семьи',
    description: 'Общие семейные цели с отслеживанием прогресса',
    icon: 'Target',
    path: '/?section=goals',
    gradient: 'from-indigo-500 to-blue-600',
    ready: true,
  },
  {
    id: 'tasks',
    title: 'Задачи',
    description: 'Распределение задач между членами семьи',
    icon: 'CheckSquare',
    path: '/?section=tasks',
    gradient: 'from-emerald-500 to-teal-600',
    ready: true,
  },
  {
    id: 'calendar',
    title: 'Календарь',
    description: 'Общий семейный календарь событий и напоминаний',
    icon: 'Calendar',
    path: '/calendar',
    gradient: 'from-sky-500 to-cyan-600',
    ready: true,
  },
  {
    id: 'purchases',
    title: 'План покупок',
    description: 'Планирование крупных семейных покупок',
    icon: 'ClipboardList',
    path: '/purchases',
    gradient: 'from-orange-500 to-amber-600',
    ready: true,
  },
  {
    id: 'analytics',
    title: 'Аналитика',
    description: 'Статистика и графики семейной активности',
    icon: 'BarChart3',
    path: '/analytics',
    gradient: 'from-violet-500 to-purple-600',
    badge: 'Графики',
    badgeColor: 'bg-violet-100 text-violet-700',
    ready: true,
  },
  {
    id: 'finance',
    title: 'Финансы',
    description: 'Бюджет семьи, доходы, расходы и накопления',
    icon: 'Wallet',
    path: '/finance',
    gradient: 'from-green-500 to-emerald-600',
    ready: true,
  },
];

export default function PlanningHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Планирование"
          subtitle="Цели, задачи, календарь и аналитика"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b8d96cd0-c983-4192-983e-991c1440e285.jpg"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subSections.map((section) => (
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
                    <Icon
                      name={section.icon}
                      size={32}
                      className="text-white drop-shadow-sm"
                    />
                  </div>

                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-base group-hover:text-indigo-700 transition-colors">
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
                    <p className="text-sm text-muted-foreground leading-snug">
                      {section.description}
                    </p>
                  </div>

                  <div className="flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon
                      name="ChevronRight"
                      size={20}
                      className="text-gray-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
