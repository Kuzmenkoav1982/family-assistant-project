import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
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

interface SubGroup {
  id: string;
  title: string;
  subtitle: string;
  sections: SubSection[];
}

const householdSubSections: SubSection[] = [
  {
    id: 'shopping',
    title: 'Список покупок',
    description: 'Общий список покупок для всей семьи с категориями',
    icon: 'ShoppingCart',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50 dark:bg-orange-950/40',
    path: '/shopping',
    modality: 'service',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'voting',
    title: 'Голосования',
    description: 'Семейные голосования для принятия общих решений',
    icon: 'Vote',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    path: '/voting',
    modality: 'family',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'home',
    title: 'Дом',
    description: 'Квартира, коммуналка, показания счётчиков и ремонты',
    icon: 'Building',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    path: '/home-hub',
    modality: 'service',
    status: 'new',
    isNew: true,
    cta: 'Открыть',
  },
];

const transportSubSections: SubSection[] = [
  {
    id: 'garage',
    title: 'Гараж',
    description: 'Учёт автомобилей, ТО, расходы и напоминания',
    icon: 'Car',
    iconColor: 'text-slate-700',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    path: '/garage',
    modality: 'service',
    status: 'ready',
    cta: 'Открыть',
  },
];

const subGroups: SubGroup[] = [
  {
    id: 'home-group',
    title: 'Дом и хозяйство',
    subtitle: 'Повседневные совместные дела',
    sections: householdSubSections,
  },
  {
    id: 'transport-group',
    title: 'Транспорт',
    subtitle: 'Машины и поездки',
    sections: transportSubSections,
  },
];

export default function HouseholdHub() {
  const navigate = useNavigate();
  const totalSections = householdSubSections.length + transportSubSections.length;

  return (
    <>
      <SEOHead
        title="Дом и быт — покупки, голосования, транспорт"
        description="Списки покупок, семейные голосования, управление автомобилем и домом. Организация повседневного быта семьи."
        path="/household-hub"
        breadcrumbs={[{ name: 'Дом и быт', path: '/household-hub' }]}
      />
      <HubLayoutV2
        title="Дом и быт"
        subtitle="Операционный хаб — Цикл: Договорённости → Исполнение"
        description="Покупки, домашние решения и транспорт — всё, что делает быт семьи спокойным и понятным."
        icon="Home"
        iconColor="text-amber-600"
        iconBg="bg-amber-100 dark:bg-amber-900/40"
        modalities={['service', 'family']}
        cycleHint="Связан с Финансами и Планированием: расходы и задачи стекаются в общую картину"
        backgroundClass="bg-gradient-to-b from-amber-50 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        quickFacts={[
          { label: 'Сервисов',  value: totalSections,  icon: 'LayoutGrid' },
          { label: 'Дом',       value: 'Новое',        icon: 'Building' },
          { label: 'Подход',    value: 'Семейный',     icon: 'Users' },
          { label: 'Связь',     value: 'Финансы',      icon: 'Wallet' },
        ]}
        primaryAction={{
          label: 'Открыть «Дом»',
          icon: 'Building',
          onClick: () => navigate('/home-hub'),
        }}
        secondaryAction={{
          label: 'Список покупок',
          icon: 'ShoppingCart',
          onClick: () => navigate('/shopping'),
        }}
        relatedLinks={[
          { label: 'Финансы',     icon: 'Wallet',  path: '/finance' },
          { label: 'Планирование', icon: 'Target', path: '/planning-hub' },
          { label: 'Семья',       icon: 'Users',   path: '/family-hub' },
          { label: 'Питание',     icon: 'Apple',   path: '/nutrition' },
        ]}
      >
        {subGroups.map(group => (
          <div key={group.id}>
            <div className="px-2 mb-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {group.title}
              </div>
              <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{group.subtitle}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.sections.map(s => (
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
        ))}
      </HubLayoutV2>
    </>
  );
}
