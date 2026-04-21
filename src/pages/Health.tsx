import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import SEOHead from '@/components/SEOHead';

interface HealthSection {
  title: string;
  description: string;
  icon: string;
  path: string;
  gradient: string;
  cta: string;
}

const sections: HealthSection[] = [
  {
    title: 'Медкарты детей',
    description: 'Прививки, анализы, визиты к врачу и лекарства для каждого ребёнка',
    icon: 'FileHeart',
    path: '/children',
    gradient: 'from-rose-500 to-pink-600',
    cta: 'Открыть карточки детей',
  },
  {
    title: 'Счётчик БЖУ',
    description: 'Дневник питания, калории, белки/жиры/углеводы для всей семьи',
    icon: 'Apple',
    path: '/nutrition/tracker',
    gradient: 'from-green-500 to-emerald-600',
    cta: 'Вести дневник питания',
  },
  {
    title: 'ИИ-диета по данным',
    description: 'Индивидуальный план питания на основе целей и показателей',
    icon: 'Sparkles',
    path: '/nutrition/diet',
    gradient: 'from-purple-500 to-fuchsia-600',
    cta: 'Создать план',
  },
  {
    title: 'Лекарства и приёмы',
    description: 'График приёма лекарств с напоминаниями',
    icon: 'Pill',
    path: '/children',
    gradient: 'from-blue-500 to-cyan-600',
    cta: 'Управлять лекарствами',
  },
  {
    title: 'Календарь здоровья',
    description: 'Запланированные визиты к врачу, процедуры и обследования',
    icon: 'CalendarHeart',
    path: '/calendar?category=health',
    gradient: 'from-orange-500 to-red-600',
    cta: 'Открыть календарь',
  },
  {
    title: 'ИИ-Доктор',
    description: 'Консультации по симптомам и профилактике',
    icon: 'Stethoscope',
    path: '/health-hub',
    gradient: 'from-indigo-500 to-blue-600',
    cta: 'Спросить ИИ-Доктора',
  },
];

export default function Health() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Здоровье семьи — медкарты, лекарства, питание"
        description="Управление здоровьем семьи: медкарты, прививки, лекарства, дневник питания, ИИ-диета и консультации врача."
        path="/health"
        breadcrumbs={[
          { name: 'Здоровье', path: '/health-hub' },
          { name: 'Все функции', path: '/health' },
        ]}
      />
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-red-50/30 to-white pb-24">
        <div className="max-w-5xl mx-auto p-4 space-y-6">
          <SectionHero
            title="Здоровье"
            subtitle="Медкарты, лекарства, питание и показатели здоровья"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/126eb1fc-4b71-4f1c-87fd-fa88beb6d32d.jpg"
            backPath="/health-hub"
          />

          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((s) => (
              <Card
                key={s.path + s.title}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(s.path)}
              >
                <div className={`h-2 bg-gradient-to-r ${s.gradient}`} />
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center flex-shrink-0 text-white`}>
                      <Icon name={s.icon} size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{s.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{s.description}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="group-hover:bg-gray-900 group-hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(s.path);
                        }}
                      >
                        {s.cta}
                        <Icon name="ArrowRight" size={14} className="ml-1" />
                      </Button>
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
