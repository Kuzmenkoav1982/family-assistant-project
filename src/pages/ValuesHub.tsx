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

const subSections: SubSection[] = [
  {
    id: 'values',
    title: 'Ценности семьи',
    description: 'Определите и храните главные ценности вашей семьи',
    icon: 'HeartHandshake',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
    path: '/values',
    modality: 'reflect',
    status: 'recommended',
    cta: 'Открыть',
  },
  {
    id: 'faith',
    title: 'Вера',
    description: 'Религиозные праздники, посты, молитвы, дни ангела и ИИ-помощник с учётом вашей конфессии',
    icon: 'Church',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    path: '/faith',
    modality: 'reflect',
    status: 'new',
    isNew: true,
    cta: 'Открыть',
  },
  {
    id: 'traditions',
    title: 'Традиции и культура',
    description: 'Национальные традиции, обычаи и культурное наследие',
    icon: 'Sparkles',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50 dark:bg-orange-950/40',
    path: '/culture',
    modality: 'content',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'wisdom',
    title: 'Мудрость народа',
    description: 'Вековая мудрость разных народов мира',
    icon: 'BookOpen',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-50 dark:bg-yellow-950/40',
    path: '/wisdom',
    modality: 'content',
    status: 'ready',
    cta: 'Читать',
  },
  {
    id: 'rules',
    title: 'Правила дома',
    description: 'Семейный кодекс: правила, договорённости и границы',
    icon: 'ScrollText',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    path: '/rules',
    modality: 'family',
    status: 'recommended',
    cta: 'Открыть',
  },
];

export default function ValuesHub() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Ценности — духовное развитие семьи"
        description="Семейные ценности, вера, традиции, мудрость народа и правила дома. Духовный фундамент вашей семьи."
        path="/values-hub"
        breadcrumbs={[{ name: 'Ценности', path: '/values-hub' }]}
      />
      <HubLayoutV2
        title="Ценности и культура"
        subtitle="Смысловой хаб — Цикл: Осмысление → Договорённости"
        description="Ценности, вера, традиции, мудрость народа и правила дома. Духовный фундамент семьи."
        icon="Heart"
        iconColor="text-pink-600"
        iconBg="bg-pink-100 dark:bg-pink-900/40"
        modalities={['reflect', 'family', 'content']}
        cycleHint="Здесь хранится «зачем»: ценности рождают правила, а они — ежедневные действия"
        backgroundClass="bg-gradient-to-b from-amber-50 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        quickFacts={[
          { label: 'Сервисов',  value: subSections.length, icon: 'LayoutGrid' },
          { label: 'Глубина',   value: 'Ценности · Вера', icon: 'Sparkles' },
          { label: 'Подход',    value: 'Без догм',        icon: 'Heart' },
          { label: 'Польза',    value: 'Идентичность',    icon: 'Compass' },
        ]}
        primaryAction={{
          label: 'Ценности семьи',
          icon: 'HeartHandshake',
          onClick: () => navigate('/values'),
        }}
        secondaryAction={{
          label: 'Правила дома',
          icon: 'ScrollText',
          onClick: () => navigate('/rules'),
        }}
        relatedLinks={[
          { label: 'Развитие',     icon: 'Brain',    path: '/development-hub' },
          { label: 'Семейный код', icon: 'Sparkles', path: '/family-matrix' },
          { label: 'Семья',        icon: 'Users',    path: '/family-hub' },
          { label: 'Полезные статьи', icon: 'BookOpen', path: '/articles' },
        ]}
      >
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
