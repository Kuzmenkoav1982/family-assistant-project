import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';

interface DietProgram {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  target_audience: string;
  allowed_foods: string[];
  forbidden_foods: string[];
  principles: string[];
  daily_calories_range: number[];
}

const categoryMeta: Record<string, { label: string; icon: string; color: string; gradient: string }> = {
  medical: {
    label: 'Медицинская',
    icon: 'HeartPulse',
    color: 'bg-red-100 text-red-700 border-red-200',
    gradient: 'from-red-500 to-rose-600',
  },
  lifestyle: {
    label: 'Стиль жизни',
    icon: 'Leaf',
    color: 'bg-green-100 text-green-700 border-green-200',
    gradient: 'from-green-500 to-emerald-600',
  },
};

const programIcons: Record<string, string> = {
  'stol-1': '🏥',
  'stol-5': '🫀',
  'stol-9': '💉',
  'vegan': '🌱',
  'keto': '🥑',
  'light': '🥗',
};

export default function DietProgramCatalog() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<DietProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'medical' | 'lifestyle'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const hardcoded: DietProgram[] = [
        {
          id: 1, slug: 'stol-1', name: 'Стол №1', category: 'medical',
          description: 'Лечебная диета при гастрите и язвенной болезни желудка. Щадящее питание с минимальной нагрузкой на ЖКТ.',
          target_audience: 'Люди с гастритом, язвой желудка и двенадцатиперстной кишки',
          allowed_foods: ['каши на воде и молоке', 'нежирное мясо', 'паровая рыба', 'овощные супы', 'молочные продукты', 'яйца всмятку', 'белый хлеб вчерашний', 'сливочное масло', 'мёд'],
          forbidden_foods: ['жареное', 'острое', 'копчёное', 'маринады', 'газировка', 'алкоголь', 'свежий хлеб', 'грибы', 'бобовые', 'кислые фрукты'],
          principles: ['Пища готовится на пару, варится или запекается', 'Температура блюд 15-65 градусов', 'Дробное питание 5-6 раз в день', 'Тщательное пережёвывание', 'Исключение грубой клетчатки'],
          daily_calories_range: [1800, 2200],
        },
        {
          id: 2, slug: 'stol-5', name: 'Стол №5', category: 'medical',
          description: 'Лечебная диета при заболеваниях печени и желчевыводящих путей. Снижение нагрузки на печень.',
          target_audience: 'Люди с заболеваниями печени, желчного пузыря, желчевыводящих путей',
          allowed_foods: ['нежирное мясо и птица', 'нежирная рыба', 'крупы', 'овощи', 'фрукты некислые', 'молочные продукты', 'яйца (белок)', 'вчерашний хлеб', 'растительное масло', 'мёд'],
          forbidden_foods: ['жирное мясо', 'сало', 'субпродукты', 'жареное', 'острое', 'копчёности', 'маринады', 'грибы', 'бобовые', 'шоколад', 'алкоголь'],
          principles: ['Варка, запекание, тушение, приготовление на пару', 'Дробное питание 5-6 раз в день', 'Пища в тёплом виде', 'Ограничение жиров до 70-80 г в сутки', 'Обильное питьё 1.5-2 л воды'],
          daily_calories_range: [2000, 2500],
        },
        {
          id: 3, slug: 'stol-9', name: 'Стол №9', category: 'medical',
          description: 'Лечебная диета при сахарном диабете. Контроль углеводов и нормализация уровня сахара в крови.',
          target_audience: 'Люди с сахарным диабетом 1 и 2 типа',
          allowed_foods: ['нежирное мясо', 'рыба', 'овощи (кроме картофеля)', 'крупы (гречка, овсянка)', 'бобовые', 'кисломолочные продукты', 'яйца', 'хлеб из муки грубого помола', 'несладкие фрукты'],
          forbidden_foods: ['сахар', 'конфеты', 'шоколад', 'мёд', 'варенье', 'белый хлеб', 'сдоба', 'рис', 'манка', 'виноград', 'бананы', 'жирное мясо', 'алкоголь'],
          principles: ['Контроль гликемического индекса продуктов', 'Дробное питание 5-6 раз в день', 'Равномерное распределение углеводов', 'Подсчёт хлебных единиц', 'Замена сахара на сахарозаменители'],
          daily_calories_range: [1800, 2300],
        },
        {
          id: 4, slug: 'vegan', name: 'Веган', category: 'lifestyle',
          description: 'Полностью растительное питание без продуктов животного происхождения.',
          target_audience: 'Люди, выбирающие этичное растительное питание',
          allowed_foods: ['овощи', 'фрукты', 'злаки', 'бобовые', 'орехи', 'семена', 'тофу', 'соевое молоко', 'растительные масла', 'грибы', 'водоросли'],
          forbidden_foods: ['мясо', 'рыба', 'молочные продукты', 'яйца', 'мёд', 'желатин'],
          principles: ['Обязательно B12 как добавка', 'Комбинирование бобовых и злаков для полного белка', 'Достаточное потребление железа из растительных источников', 'Обогащённые продукты для кальция и витамина D'],
          daily_calories_range: [1800, 2500],
        },
        {
          id: 5, slug: 'keto', name: 'Кето', category: 'lifestyle',
          description: 'Кетогенная диета с высоким содержанием жиров и минимумом углеводов.',
          target_audience: 'Люди, стремящиеся к снижению веса и контролю аппетита',
          allowed_foods: ['жирное мясо', 'рыба жирная', 'яйца', 'авокадо', 'орехи', 'масло сливочное', 'масло кокосовое', 'сыр', 'сливки', 'зелёные овощи', 'грибы'],
          forbidden_foods: ['хлеб', 'макароны', 'рис', 'картофель', 'сахар', 'фрукты (большинство)', 'бобовые', 'крупы', 'молоко', 'соки', 'мёд'],
          principles: ['Углеводы 20-50 г в сутки', 'Жиры 70-80% калорий', 'Белок 15-20% калорий', 'Обильное питьё воды', 'Контроль электролитов', 'Постепенный вход в кетоз 3-7 дней'],
          daily_calories_range: [1600, 2200],
        },
        {
          id: 6, slug: 'light', name: 'Облегчённое питание', category: 'lifestyle',
          description: 'Сбалансированное питание с умеренным снижением калорийности.',
          target_audience: 'Люди, стремящиеся к здоровому и лёгкому питанию',
          allowed_foods: ['нежирное мясо', 'рыба', 'овощи', 'фрукты', 'крупы', 'бобовые', 'кисломолочные продукты', 'яйца', 'цельнозерновой хлеб', 'орехи (умеренно)'],
          forbidden_foods: ['фастфуд', 'полуфабрикаты', 'сладкая газировка', 'чипсы', 'майонез', 'колбасные изделия', 'сдобная выпечка'],
          principles: ['Снижение калорийности на 15-20% от нормы', 'Дробное питание 4-5 раз в день', 'Больше овощей и клетчатки', 'Минимум переработанных продуктов', 'Контроль порций', 'Достаточное потребление воды 1.5-2 л'],
          daily_calories_range: [1500, 2000],
        },
      ];
      setPrograms(hardcoded);
    } finally {
      setLoading(false);
    }
  };

  const filtered = programs.filter(p => filter === 'all' || p.category === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pb-24">
      <div className="max-w-4xl mx-auto p-4 space-y-5">
        <SectionHero
          title="Готовые режимы питания"
          subtitle="Выберите программу и получите план"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/62fbca40-b16c-44ff-a3d4-53a5dfc288ea.jpg"
          backPath="/nutrition"
        />

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">Все</TabsTrigger>
            <TabsTrigger value="medical" className="flex-1">Медицинские</TabsTrigger>
            <TabsTrigger value="lifestyle" className="flex-1">Стиль жизни</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {filtered.map((program) => {
            const meta = categoryMeta[program.category];
            const isExpanded = expandedId === program.id;

            return (
              <Card
                key={program.id}
                className="overflow-hidden border-2 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : program.id)}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className={`w-16 bg-gradient-to-br ${meta.gradient} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-2xl">{programIcons[program.slug] || '🍽️'}</span>
                    </div>

                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base">{program.name}</h3>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${meta.color}`}>
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Icon name="Flame" size={12} />
                          {program.daily_calories_range[0]}-{program.daily_calories_range[1]} ккал
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Users" size={12} />
                          {program.target_audience.substring(0, 40)}...
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center pr-3">
                      <Icon
                        name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                        size={20}
                        className="text-gray-400"
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t px-4 py-4 bg-gray-50/50 space-y-4 animate-fade-in">
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Принципы</h4>
                        <div className="space-y-1">
                          {program.principles.map((p, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <Icon name="Check" size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-green-600 uppercase mb-2">Можно</h4>
                          <div className="flex flex-wrap gap-1">
                            {program.allowed_foods.slice(0, 8).map((f, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] bg-green-100 text-green-700">
                                {f}
                              </Badge>
                            ))}
                            {program.allowed_foods.length > 8 && (
                              <Badge variant="secondary" className="text-[10px]">+{program.allowed_foods.length - 8}</Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-red-600 uppercase mb-2">Нельзя</h4>
                          <div className="flex flex-wrap gap-1">
                            {program.forbidden_foods.slice(0, 8).map((f, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] bg-red-100 text-red-700">
                                {f}
                              </Badge>
                            ))}
                            {program.forbidden_foods.length > 8 && (
                              <Badge variant="secondary" className="text-[10px]">+{program.forbidden_foods.length - 8}</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/nutrition/programs/${program.slug}/quiz`);
                        }}
                      >
                        <Icon name="Play" size={16} className="mr-2" />
                        Выбрать и заполнить анкету
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}