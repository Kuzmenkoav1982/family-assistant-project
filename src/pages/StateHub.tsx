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
    id: 'what-is-family',
    title: 'Что такое семья',
    description: 'Философия семьи, определения и исторический контекст',
    icon: 'BookHeart',
    path: '/what-is-family',
    gradient: 'from-emerald-500 to-teal-600',
    ready: true,
  },
  {
    id: 'family-code',
    title: 'Семейный кодекс РФ',
    description: 'Основные статьи семейного законодательства России',
    icon: 'Scale',
    path: '/family-code',
    gradient: 'from-blue-500 to-indigo-600',
    ready: true,
  },
  {
    id: 'state-support',
    title: 'Господдержка семей',
    description: 'Материнский капитал, пособия, льготы и субсидии',
    icon: 'HandHeart',
    path: '/state-support',
    gradient: 'from-amber-500 to-orange-600',
    ready: true,
  },
  {
    id: 'family-policy',
    title: 'Семейная политика',
    description: 'Государственные программы и направления поддержки семей',
    icon: 'Flag',
    path: '/family-policy',
    gradient: 'from-violet-500 to-purple-600',
    badge: 'Инфо',
    badgeColor: 'bg-violet-100 text-violet-700',
    ready: true,
  },
  {
    id: 'family-news',
    title: 'Новости и инициативы',
    description: 'Актуальные новости семейного законодательства и политики',
    icon: 'Newspaper',
    path: '/family-news',
    gradient: 'from-cyan-500 to-sky-600',
    badge: 'Новое',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    ready: true,
  },
];

export default function StateHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Семья и государство"
          subtitle="Законы, поддержка и политика для семей"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/6cfbf071-8a12-494d-90e2-93c37aaa217c.jpg"
          backPath="/"
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
                      <h3 className="font-bold text-base group-hover:text-blue-700 transition-colors">
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
