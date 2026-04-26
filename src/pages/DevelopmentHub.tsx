import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import SEOHead from "@/components/SEOHead";

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
    id: 'development',
    title: 'Развитие семьи',
    description: 'Планы развития, навыки и достижения каждого члена семьи',
    icon: 'TrendingUp',
    path: '/development',
    gradient: 'from-emerald-500 to-teal-600',
    ready: true,
  },
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
  {
    id: 'life-road',
    title: 'Мастерская жизни',
    description: 'Твори свой путь: хронология событий, сезоны жизни, цели и инструменты для осознанного планирования',
    icon: 'Hammer',
    path: '/life-road',
    gradient: 'from-pink-500 via-purple-500 to-indigo-600',
    badge: 'Новое',
    badgeColor: 'bg-pink-100 text-pink-700',
    ready: true,
  },
  {
    id: 'pari-test',
    title: 'Семейный код',
    description: 'Научный тест родительских установок (PARI Шефера-Белла). 35 вопросов, радар-диаграмма, рекомендации',
    icon: 'HeartHandshake',
    path: '/pari-test',
    gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
    badge: 'Новое',
    badgeColor: 'bg-purple-100 text-purple-700',
    ready: true,
  },
];

export default function DevelopmentHub() {
  const navigate = useNavigate();

  return (
    <>
    <SEOHead title="Развитие — центр личностного роста семьи" description="Тесты, обучение и инструменты для развития каждого члена семьи. Психологические тесты, ИИ-психолог, аналитика прогресса." path="/development-hub" breadcrumbs={[{ name: "Развитие", path: "/development-hub" }]} />
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-emerald-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Развитие"
          subtitle="Образование, рост и путь жизни"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/364dd778-d8dc-4105-a314-da0ca595ed73.jpg"
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
    </>
  );
}