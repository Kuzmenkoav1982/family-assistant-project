import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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
    id: 'diet-ai',
    title: 'ИИ-Диета по данным',
    description: 'Персональный план питания на основе анкеты: здоровье, цели, предпочтения',
    icon: 'Brain',
    path: '/nutrition/diet',
    gradient: 'from-violet-500 to-purple-600',
    badge: 'ИИ',
    badgeColor: 'bg-violet-100 text-violet-700',
    ready: false,
  },
  {
    id: 'diet-preset',
    title: 'Готовые режимы питания',
    description: 'Стол 1, 5, 9, Веган, Кето, Облегчённое — выберите свой режим',
    icon: 'ListChecks',
    path: '/nutrition/programs',
    gradient: 'from-emerald-500 to-teal-600',
    badge: '6 программ',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    ready: false,
  },
  {
    id: 'recipe-from-products',
    title: 'Рецепт из продуктов',
    description: 'Укажите продукты дома — ИИ предложит рецепты с пошаговой инструкцией',
    icon: 'ChefHat',
    path: '/nutrition/recipe-from-products',
    gradient: 'from-orange-500 to-amber-600',
    badge: 'ИИ',
    badgeColor: 'bg-orange-100 text-orange-700',
    ready: false,
  },
  {
    id: 'nutrition-tracker',
    title: 'Счётчик БЖУ',
    description: 'Дневник питания с подсчётом калорий, белков, жиров и углеводов',
    icon: 'Calculator',
    path: '/nutrition/tracker',
    gradient: 'from-blue-500 to-indigo-600',
    ready: true,
  },
  {
    id: 'meals',
    title: 'Меню на неделю',
    description: 'Планирование семейного меню на каждый день недели',
    icon: 'CalendarDays',
    path: '/meals',
    gradient: 'from-pink-500 to-rose-600',
    ready: true,
  },
  {
    id: 'recipes',
    title: 'Рецепты',
    description: 'Коллекция семейных рецептов с пошаговыми инструкциями',
    icon: 'BookOpen',
    path: '/recipes',
    gradient: 'from-cyan-500 to-sky-600',
    ready: true,
  },
];

export default function NutritionHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="relative -mx-4 -mt-4 mb-2 rounded-b-2xl overflow-hidden">
          <img
            src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/332a580b-fc76-4272-8503-b220098c2419.jpg"
            alt="Питание"
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 mb-1"
            >
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Питание
              </h1>
              <p className="text-sm text-white/80">
                Полный контроль питания семьи
              </p>
            </div>
          </div>
        </div>

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
                      <h3 className="font-bold text-base group-hover:text-green-700 transition-colors">
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

        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <Icon name="Sparkles" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">
                  Как это работает?
                </h3>
                <div className="space-y-1 text-sm text-green-800">
                  <p>
                    <strong>ИИ-Диета</strong> — заполните анкету, и искусственный интеллект составит персональный план питания с учётом здоровья и целей.
                  </p>
                  <p>
                    <strong>Готовые режимы</strong> — выберите проверенную программу (медицинские столы, веган, кето) и получите меню на каждый день.
                  </p>
                  <p>
                    <strong>Рецепт из продуктов</strong> — назовите что есть в холодильнике, а ИИ предложит варианты блюд.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}