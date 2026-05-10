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
  description: string;
  sections: SubSection[];
}

const servicesSubSections: SubSection[] = [
  {
    id: 'support-navigator',
    title: 'Навигатор мер поддержки',
    description: 'Персональный подбор: что положено именно вашей семье. 40+ федеральных мер.',
    icon: 'Sparkles',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    path: '/support-navigator',
    modality: 'gov',
    status: 'new',
    isNew: true,
    cta: 'Подобрать',
  },
  {
    id: 'state-support',
    title: 'Господдержка семей',
    description: 'Материнский капитал, пособия, льготы и субсидии',
    icon: 'HandHeart',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    path: '/state-support',
    modality: 'gov',
    status: 'recommended',
    cta: 'Открыть',
  },
];

const knowledgeSubSections: SubSection[] = [
  {
    id: 'family-code',
    title: 'Семейный кодекс РФ',
    description: 'Основные статьи семейного законодательства России',
    icon: 'Scale',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    path: '/family-code',
    modality: 'law',
    status: 'ready',
    cta: 'Читать',
  },
  {
    id: 'what-is-family',
    title: 'Что такое семья',
    description: 'Философия семьи, определения и исторический контекст',
    icon: 'BookHeart',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    path: '/what-is-family',
    modality: 'content',
    status: 'ready',
    cta: 'Читать',
  },
  {
    id: 'family-policy',
    title: 'Семейная политика',
    description: 'Государственные программы и направления поддержки семей',
    icon: 'Flag',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50 dark:bg-violet-950/40',
    path: '/family-policy',
    modality: 'content',
    status: 'ready',
    cta: 'Открыть',
  },
  {
    id: 'family-news',
    title: 'Новости и инициативы',
    description: 'Актуальные новости семейного законодательства и политики',
    icon: 'Newspaper',
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    path: '/family-news',
    modality: 'content',
    status: 'new',
    isNew: true,
    cta: 'Открыть',
  },
];

const subGroups: SubGroup[] = [
  {
    id: 'services',
    title: 'Сервисы',
    subtitle: 'Утилитарные действия',
    description:
      'Помогают получить конкретную пользу: подобрать меры поддержки, оформить льготы, понять, что положено вашей семье.',
    sections: servicesSubSections,
  },
  {
    id: 'knowledge',
    title: 'Знание',
    subtitle: 'Право, справка, контекст',
    description:
      'Помогают разобраться: статьи Семейного кодекса РФ, философия семьи, государственные программы и актуальные инициативы.',
    sections: knowledgeSubSections,
  },
];

export default function StateHub() {
  const navigate = useNavigate();

  const totalServices = servicesSubSections.length;
  const totalKnowledge = knowledgeSubSections.length;

  return (
    <>
      <SEOHead
        title="Госуслуги — поддержка семей от государства"
        description="Семейный кодекс РФ, государственная поддержка семей, семейная политика, новости и инициативы. Полезная информация для семей."
        path="/state-hub"
        breadcrumbs={[{ name: 'Госуслуги', path: '/state-hub' }]}
      />
      <HubLayoutV2
        title="Семья и государство"
        subtitle="Внешний мир — Право · Госданные · Контент"
        description="Поддержка, право и ориентиры для семьи. Сервисы господдержки и знание о праве в одном месте."
        icon="Landmark"
        iconColor="text-slate-600"
        iconBg="bg-slate-100 dark:bg-slate-800"
        modalities={['gov', 'law', 'content']}
        cycleHint="Связь семьи с государством: данные → право → поддержка"
        backgroundClass="bg-gradient-to-b from-slate-50 via-blue-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        quickFacts={[
          { label: 'Сервисов',    value: totalServices,  icon: 'Sparkles' },
          { label: 'Материалов',  value: totalKnowledge, icon: 'BookOpen' },
          { label: 'Мер поддержки', value: '40+',        icon: 'HandHeart' },
          { label: 'Источник',    value: 'Официальный', icon: 'ShieldCheck' },
        ]}
        primaryAction={{
          label: 'Подобрать меры поддержки',
          icon: 'Sparkles',
          onClick: () => {
            try { localStorage.setItem('supportNavigatorOpened', '1'); } catch (_e) {
              // ignore
            }
            navigate('/support-navigator');
          },
        }}
        secondaryAction={{
          label: 'Семейный кодекс',
          icon: 'Scale',
          onClick: () => navigate('/family-code'),
        }}
        relatedLinks={[
          { label: 'Финансы',  icon: 'Wallet',     path: '/finance' },
          { label: 'Семья',    icon: 'Users',      path: '/family-hub' },
          { label: 'Дети',     icon: 'Baby',       path: '/children' },
          { label: 'Полезные статьи', icon: 'BookOpen', path: '/articles' },
        ]}
      >
        {subGroups.map(group => (
          <div key={group.id}>
            <div className="px-2 mb-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {group.title}
              </div>
              <div className="text-[12px] text-gray-600 dark:text-gray-400 mt-0.5">
                {group.subtitle} · {group.description}
              </div>
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
