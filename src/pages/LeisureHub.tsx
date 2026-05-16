import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import HubCardV2 from '@/components/hub/HubCardV2';
import HowItWorksBlock from '@/components/hub/HowItWorksBlock';
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
    id: 'trips',
    title: 'Путешествия',
    description: 'Планирование поездок, бюджет, маршруты и чек-листы',
    icon: 'Plane',
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
    path: '/trips',
    modality: 'service',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'leisure',
    title: 'Досуг',
    description: 'Места для отдыха, развлечения и совместные активности',
    icon: 'MapPin',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    path: '/leisure',
    modality: 'service',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'events',
    title: 'Праздники',
    description: 'Семейные праздники, дни рождения и памятные даты',
    icon: 'PartyPopper',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    path: '/events',
    modality: 'family',
    status: 'ready',
    cta: 'Открыть',
  },
];

export default function LeisureHub() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Досуг — путешествия, события и отдых"
        description="Планирование путешествий, досуг семьи, праздники и памятные даты. Всё для совместного отдыха."
        path="/leisure-hub"
        breadcrumbs={[{ name: 'Досуг', path: '/leisure-hub' }]}
      />
      <HubLayoutV2
        title="Путешествия и досуг"
        subtitle="Внешний мир — Цикл: Договорённости → Исполнение"
        description="Поездки, развлечения и праздники. Время вместе как семейная инвестиция."
        icon="Plane"
        iconColor="text-sky-600"
        iconBg="bg-sky-100 dark:bg-sky-900/40"
        modalities={['service', 'family']}
        cycleHint="Связан с Финансами и Календарём: бюджет поездки и даты праздников"
        backgroundClass="bg-gradient-to-b from-sky-50 via-blue-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        quickFacts={[
          { label: 'Сервисов',  value: subSections.length, icon: 'LayoutGrid' },
          { label: 'Подход',    value: 'Семейный',         icon: 'Users' },
          { label: 'Связь',     value: 'Финансы · Календарь', icon: 'Link2' },
          { label: 'Польза',    value: 'Время вместе',     icon: 'Heart' },
        ]}
        primaryAction={{
          label: 'Спланировать поездку',
          icon: 'Plane',
          onClick: () => navigate('/trips'),
        }}
        secondaryAction={{
          label: 'Праздники',
          icon: 'PartyPopper',
          onClick: () => navigate('/events'),
        }}
        relatedLinks={[
          { label: 'Финансы',   icon: 'Wallet',   path: '/finance' },
          { label: 'Календарь', icon: 'Calendar', path: '/calendar' },
          { label: 'Семья',     icon: 'Users',    path: '/family-hub' },
          { label: 'Госуслуги', icon: 'Landmark', path: '/state-hub' },
        ]}
      >
        <HowItWorksBlock
          accent="sky"
          intro="«Досуг» — пространство для совместных впечатлений. Путешествия, развлечения, праздники и семейные традиции — всё, что объединяет и оставляет тёплые воспоминания."
          steps={[
            {
              icon: 'Plane',
              title: 'Шаг 1. Планируйте поездки',
              description:
                'Маршруты, бюджет, чек-листы и документы — всё, чтобы отдых прошёл без сюрпризов.',
            },
            {
              icon: 'PartyPopper',
              title: 'Шаг 2. Праздники и события',
              description:
                'Дни рождения, годовщины, праздники — календарь напомнит, идеи подскажет.',
            },
            {
              icon: 'Calendar',
              title: 'Шаг 3. Развлечения',
              description:
                'Подбирайте активности: кино, выставки, прогулки. Сохраняйте идеи на «когда-нибудь».',
            },
            {
              icon: 'Heart',
              title: 'Шаг 4. Семейные традиции',
              description:
                'Создавайте и поддерживайте традиции — то, что делает семью особенной и крепкой.',
            },
          ]}
          footer="Время вместе — самая ценная инвестиция. «Досуг» помогает не откладывать её на потом."
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