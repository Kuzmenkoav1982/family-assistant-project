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
    id: 'values',
    title: 'Ценности семьи',
    description: 'Определите и храните главные ценности вашей семьи',
    icon: 'HeartHandshake',
    path: '/?section=values',
    gradient: 'from-rose-500 to-pink-600',
    ready: true,
  },
  {
    id: 'traditions',
    title: 'Традиции и культура',
    description: 'Национальные традиции, обычаи и культурное наследие',
    icon: 'Sparkles',
    path: '/nationalities',
    gradient: 'from-amber-500 to-orange-600',
    ready: true,
  },
  {
    id: 'faith',
    title: 'Вера и духовность',
    description: 'Духовные практики и религиозные традиции семьи',
    icon: 'Church',
    path: '/faith',
    gradient: 'from-violet-500 to-purple-600',
    ready: true,
  },
  {
    id: 'rules',
    title: 'Правила дома',
    description: 'Семейный кодекс: правила, договорённости и границы',
    icon: 'ScrollText',
    path: '/rules',
    gradient: 'from-blue-500 to-indigo-600',
    ready: true,
  },
  {
    id: 'what-is-family',
    title: 'Что такое семья?',
    description: 'Философия семьи, важные размышления и ответы',
    icon: 'BookHeart',
    path: '/what-is-family',
    gradient: 'from-emerald-500 to-teal-600',
    ready: true,
  },
  {
    id: 'family-policy',
    title: 'Семейная политика',
    description: 'Государственные программы поддержки семей',
    icon: 'Landmark',
    path: '/family-policy',
    gradient: 'from-cyan-500 to-sky-600',
    badge: 'Инфо',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    ready: true,
  },
];

export default function ValuesHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Ценности и культура"
          subtitle="Традиции, вера и правила вашей семьи"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/6cfbf071-8a12-494d-90e2-93c37aaa217c.jpg"
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
