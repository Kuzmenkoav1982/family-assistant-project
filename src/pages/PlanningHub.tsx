import { useNavigate } from 'react-router-dom';
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
  cta?: string;
}

const subSections: SubSection[] = [
  {
    id: 'goals',
    title: 'Цели семьи',
    description: 'Общие семейные цели с отслеживанием прогресса',
    icon: 'Target',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    path: '/goals',
    modality: 'service',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'tasks',
    title: 'Задачи',
    description: 'Распределение задач между членами семьи',
    icon: 'CheckSquare',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    path: '/tasks',
    modality: 'service',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'calendar',
    title: 'Календарь',
    description: 'Общий семейный календарь событий и напоминаний',
    icon: 'Calendar',
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
    path: '/calendar',
    modality: 'service',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'purchases',
    title: 'План покупок',
    description: 'Планирование крупных семейных покупок',
    icon: 'ClipboardList',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50 dark:bg-orange-950/40',
    path: '/purchases',
    modality: 'service',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'analytics',
    title: 'Аналитика',
    description: 'Статистика и графики семейной активности',
    icon: 'BarChart3',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50 dark:bg-violet-950/40',
    path: '/analytics',
    modality: 'service',
    status: 'recommended',
    cta: 'Открыть',
  },
];

export default function PlanningHub() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Планирование — цели, задачи и календарь семьи"
        description="Семейные цели, задачи, календарь событий, план покупок, аналитика. Эффективное планирование жизни семьи."
        path="/planning-hub"
        breadcrumbs={[{ name: 'Планирование', path: '/planning-hub' }]}
      />
      <HubLayoutV2
        title="Планирование"
        subtitle="Операционный хаб — Цикл: Договорённости → Исполнение"
        description="Цели, задачи, календарь и аналитика. Превращаем намерения семьи в конкретные шаги."
        icon="Target"
        iconColor="text-indigo-600"
        iconBg="bg-indigo-100 dark:bg-indigo-900/40"
        modalities={['service', 'ai']}
        cycleHint="Здесь договорённости становятся задачами и попадают в календарь"
        backgroundClass="bg-gradient-to-b from-indigo-50 via-blue-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        quickFacts={[
          { label: 'Сервисов',   value: subSections.length, icon: 'LayoutGrid' },
          { label: 'Помощник',   value: 'ИИ-организатор',   icon: 'Brain' },
          { label: 'Подход',     value: 'Семейный',         icon: 'Users' },
          { label: 'Связь',      value: 'Все хабы',         icon: 'Link2' },
        ]}
        primaryAction={{
          label: 'Открыть календарь',
          icon: 'Calendar',
          onClick: () => navigate('/calendar'),
        }}
        secondaryAction={{
          label: 'Цели',
          icon: 'Target',
          onClick: () => navigate('/goals'),
        }}
        relatedLinks={[
          { label: 'Семья',     icon: 'Users',   path: '/family-hub' },
          { label: 'Финансы',   icon: 'Wallet',  path: '/finance' },
          { label: 'Дом',       icon: 'Home',    path: '/home-hub' },
          { label: 'Развитие',  icon: 'Brain',   path: '/development-hub' },
        ]}
      >
        <SectionAIAdvisor
          role="organizer"
          title="ИИ-Организатор"
          description="Цели, задачи, расписание, приоритеты"
          imageUrl="https://cdn.poehali.dev/files/%D0%9E%D1%80%D0%B3%D0%B0%D0%BD%D0%B8%D0%B7%D0%B0%D1%82%D0%BE%D1%80.png"
          gradientFrom="from-indigo-500"
          gradientTo="to-blue-600"
          accentBg="bg-indigo-50"
          accentText="text-indigo-700"
          accentBorder="border-indigo-200"
          placeholder="Спросите о планах..."
          quickQuestions={[
            'Составь план на неделю',
            'Как расставить приоритеты?',
            'Как перестать откладывать дела?',
            'Помоги разбить цель на задачи',
            'Как распределить дела в семье?',
          ]}
        />

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
