import { useNavigate } from 'react-router-dom';
import NutritionHubInstructions from '@/components/nutrition/NutritionHubInstructions';
import SEOHead from '@/components/SEOHead';
import SectionAIAdvisor from '@/components/SectionAIAdvisor';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import HubCardV2 from '@/components/hub/HubCardV2';
import type { Modality } from '@/components/hub/ModalityBadge';
import type { CardStatus } from '@/components/hub/StatusBadge';

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

const subSections: SubSection[] = [
  {
    id: 'diet-ai',
    title: 'ИИ-Диета по данным',
    description: 'Персональный план питания на основе анкеты: здоровье, цели, предпочтения',
    icon: 'Brain',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50 dark:bg-violet-950/40',
    path: '/nutrition/diet',
    modality: 'ai',
    status: 'recommended',
    cta: 'Подобрать',
  },
  {
    id: 'diet-preset',
    title: 'Готовые режимы питания',
    description: 'Стол 1, 5, 9, Веган, Кето, Облегчённое — выберите свой режим',
    icon: 'ListChecks',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    path: '/nutrition/programs',
    modality: 'service',
    status: 'ready',
    cta: 'Выбрать',
  },
  {
    id: 'recipe-from-products',
    title: 'Рецепт из продуктов',
    description: 'Укажите продукты дома — ИИ предложит рецепты с пошаговой инструкцией',
    icon: 'ChefHat',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50 dark:bg-orange-950/40',
    path: '/nutrition/recipe-from-products',
    modality: 'ai',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'diet-progress',
    title: 'Прогресс диеты',
    description: 'Трекинг веса, мотивация от ИИ, график изменений, кнопка SOS',
    icon: 'TrendingUp',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
    path: '/nutrition/progress',
    modality: 'ai',
    status: 'new',
    isNew: true,
    cta: 'Открыть',
  },
  {
    id: 'nutrition-tracker',
    title: 'Счётчик БЖУ',
    description: 'Дневник питания с подсчётом калорий, белков, жиров и углеводов',
    icon: 'Calculator',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    path: '/nutrition/tracker',
    modality: 'service',
    status: 'ready',
    cta: 'Считать',
  },
  {
    id: 'meals',
    title: 'Меню на неделю',
    description: 'Планирование семейного меню на каждый день недели',
    icon: 'CalendarDays',
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50 dark:bg-pink-950/40',
    path: '/meals',
    modality: 'service',
    status: 'ready',
    cta: 'Планировать',
  },
  {
    id: 'recipes',
    title: 'Рецепты',
    description: 'Коллекция семейных рецептов с пошаговыми инструкциями',
    icon: 'BookOpen',
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    path: '/recipes',
    modality: 'content',
    status: 'ready',
    cta: 'Открыть',
  },
];

export default function NutritionHub() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Питание — центр здорового питания семьи"
        description="Всё о питании семьи: рационы, диеты, рецепты, меню на неделю, счётчик калорий. Персональные рекомендации от ИИ."
        path="/nutrition"
        breadcrumbs={[{ name: 'Питание', path: '/nutrition' }]}
      />
      <HubLayoutV2
        title="Питание"
        subtitle="Хаб заботы — Цикл: Сбор → Исполнение"
        description="Персональные рационы, диеты, меню и рецепты с поддержкой ИИ-диетолога. Питание для здоровья всей семьи."
        icon="Apple"
        iconColor="text-emerald-600"
        iconBg="bg-emerald-100 dark:bg-emerald-900/40"
        modalities={['ai', 'service']}
        cycleHint="Связь с Здоровьем и Финансами: рацион → состояние → бюджет"
        backgroundClass="bg-gradient-to-b from-green-50 via-emerald-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        quickFacts={[
          { label: 'Сервисов',   value: subSections.length, icon: 'LayoutGrid' },
          { label: 'Программ',   value: 6,                  icon: 'ListChecks' },
          { label: 'Помощник',   value: 'ИИ-диетолог',      icon: 'Brain' },
          { label: 'Подход',     value: 'Семейный',         icon: 'Users' },
        ]}
        primaryAction={{
          label: 'Подобрать диету',
          icon: 'Brain',
          onClick: () => navigate('/nutrition/diet'),
        }}
        secondaryAction={{
          label: 'Меню на неделю',
          icon: 'CalendarDays',
          onClick: () => navigate('/meals'),
        }}
        relatedLinks={[
          { label: 'Здоровье',  icon: 'HeartPulse', path: '/health-hub' },
          { label: 'Финансы',   icon: 'Wallet',     path: '/finance' },
          { label: 'Список покупок', icon: 'ShoppingCart', path: '/shopping' },
          { label: 'Питомцы',   icon: 'PawPrint',   path: '/pets' },
        ]}
      >
        <SectionAIAdvisor
          role="nutritionist"
          title="ИИ-Диетолог"
          description="Рационы, калории, меню и советы"
          gradientFrom="from-green-500"
          gradientTo="to-emerald-600"
          accentBg="bg-green-50"
          accentText="text-green-700"
          accentBorder="border-green-200"
          placeholder="Спросите о питании..."
          quickQuestions={[
            'Составь меню на неделю',
            'Как правильно считать калории?',
            'Чем заменить сладкое?',
            'Полезные перекусы для детей',
            'Как похудеть без вреда?',
          ]}
        />

        <NutritionHubInstructions />

        <div>
          <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
            Сервисы
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subSections.map(s => (
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
        </div>
      </HubLayoutV2>
    </>
  );
}