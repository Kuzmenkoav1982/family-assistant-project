import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import HubLayoutV2, { type HubAttentionItem, type HubNextStep } from '@/components/hub/HubLayoutV2';
import HubCardV2 from '@/components/hub/HubCardV2';
import type { CardStatus } from '@/components/hub/StatusBadge';
import type { Modality } from '@/components/hub/ModalityBadge';

interface SubSection {
  id: string;
  title: string;
  description: string;
  context?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  path: string;
  modality: Modality;
  status: CardStatus;
  statusLabel?: string;
  isNew?: boolean;
  cta?: string;
}

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export default function FamilyHub() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);

  // Перечитываем сигналы из localStorage при возврате на страницу
  useEffect(() => {
    const handler = () => setVersion(v => v + 1);
    window.addEventListener('storage', handler);
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('focus', handler);
    };
  }, []);

  const family = readJson<unknown[]>('familyMembers', []);
  const children = readJson<unknown[]>('children', []);
  const tree = readJson<unknown[]>('familyTree', []);
  // version используется для перерисовки, реальное значение неважно
  void version;

  const familyCount = Array.isArray(family) ? family.length : 0;
  const childrenCount = Array.isArray(children) ? children.length : 0;
  const treeCount = Array.isArray(tree) ? tree.length : 0;

  const subSections: SubSection[] = [
    {
      id: 'profiles',
      title: 'Профили семьи',
      description: 'Управление членами семьи, роли и права доступа',
      context: familyCount > 0 ? `${familyCount} профилей` : 'Пока никого нет',
      icon: 'Users',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      path: '/family-management',
      modality: 'service',
      status: familyCount === 0 ? 'idle' : familyCount < 2 ? 'partial' : 'ready',
      statusLabel: familyCount === 0 ? 'Не настроено' : familyCount < 2 ? `${familyCount} профиль` : `${familyCount} профилей`,
      cta: familyCount === 0 ? 'Добавить' : 'Открыть',
    },
    {
      id: 'children',
      title: 'Дети',
      description: 'Профили детей, развитие, успехи и оценка навыков',
      context: childrenCount > 0 ? `${childrenCount} ребёнок` : 'Пока не добавлено',
      icon: 'Baby',
      iconColor: 'text-pink-600',
      iconBg: 'bg-pink-50 dark:bg-pink-950/40',
      path: '/children',
      modality: 'family',
      status: childrenCount === 0 ? 'idle' : 'ready',
      statusLabel: childrenCount === 0 ? 'Не настроено' : `${childrenCount} ${childrenCount === 1 ? 'ребёнок' : 'детей'}`,
      cta: childrenCount === 0 ? 'Добавить' : 'Открыть',
    },
    {
      id: 'tree',
      title: 'Семейное древо',
      description: 'История рода, родственные связи и биографии',
      context: treeCount > 0 ? `${treeCount} человек` : 'Не заполнено',
      icon: 'GitBranch',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
      path: '/tree',
      modality: 'reflect',
      status: treeCount === 0 ? 'idle' : treeCount < 5 ? 'partial' : 'ready',
      statusLabel: treeCount === 0 ? 'Не заполнено' : `${treeCount} в древе`,
      cta: treeCount === 0 ? 'Начать' : 'Открыть',
    },
    {
      id: 'tracker',
      title: 'Семейный маячок',
      description: 'Геолокация членов семьи в реальном времени',
      icon: 'MapPin',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      path: '/family-tracker',
      modality: 'service',
      status: 'recommended',
      statusLabel: 'GPS · По согласию',
      cta: 'Настроить',
    },
    {
      id: 'family-chat',
      title: 'Чат семьи',
      description: 'Общий чат для всей семьи: обсуждения, фото, голосовые',
      icon: 'MessagesSquare',
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50 dark:bg-violet-950/40',
      path: '/family-chat',
      modality: 'family',
      status: 'new',
      statusLabel: 'Новое',
      isNew: true,
      cta: 'Открыть',
    },
    {
      id: 'matrix',
      title: 'Семейный код',
      description: 'Личный код, код пары, код семьи и ритуалы примирения',
      icon: 'Sparkles',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40',
      path: '/family-matrix',
      modality: 'reflect',
      status: 'recommended',
      cta: 'Открыть',
    },
  ];

  const attentionItems: HubAttentionItem[] = useMemo(() => {
    const items: HubAttentionItem[] = [];
    if (familyCount === 0) {
      items.push({
        id: 'no-family',
        icon: 'Users',
        title: 'Заполните состав семьи',
        hint: 'Без этого многие сервисы будут работать вслепую',
        cta: 'Добавить',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50 dark:bg-blue-950/40',
        onAction: () => navigate('/family-management'),
      });
    }
    if (familyCount > 0 && childrenCount === 0) {
      items.push({
        id: 'no-children',
        icon: 'Baby',
        title: 'Добавьте профили детей',
        hint: 'Развитие, успехи и навыки детей в одном месте',
        cta: 'Добавить',
        iconColor: 'text-pink-600',
        iconBg: 'bg-pink-50 dark:bg-pink-950/40',
        onAction: () => navigate('/children'),
      });
    }
    if (familyCount > 0 && treeCount === 0) {
      items.push({
        id: 'no-tree',
        icon: 'GitBranch',
        title: 'Постройте семейное древо',
        hint: 'Это важная часть семейной идентичности',
        cta: 'Начать',
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50 dark:bg-amber-950/40',
        onAction: () => navigate('/tree'),
      });
    }
    return items;
  }, [familyCount, childrenCount, treeCount, navigate]);

  const nextStep: HubNextStep | undefined = useMemo(() => {
    if (familyCount === 0) {
      return {
        title: 'Начните с состава семьи',
        hint: 'Это фундамент: остальные модули опираются на него',
        cta: 'Добавить',
        onAction: () => navigate('/family-management'),
      };
    }
    if (childrenCount === 0) {
      return {
        title: 'Добавьте профили детей',
        hint: 'Чтобы видеть их развитие и успехи',
        cta: 'Добавить',
        onAction: () => navigate('/children'),
      };
    }
    return undefined;
  }, [familyCount, childrenCount, navigate]);

  return (
    <>
      <SEOHead
        title="Семья — профили и управление семьёй"
        description="Профили членов семьи, семейное древо, дети, семейный маячок. Центр управления вашей семьёй."
        path="/family-hub"
        breadcrumbs={[{ name: 'Семья', path: '/family-hub' }]}
      />
      <HubLayoutV2
        title="Семья"
        subtitle="Операционный хаб — Цикл: Сбор"
        description="Профили, дети, древо и связь между всеми членами семьи."
        icon="Users"
        iconColor="text-blue-600"
        iconBg="bg-blue-100 dark:bg-blue-900/40"
        modalities={['family', 'service']}
        cycleHint="Здесь начинается семейная ОС: данные отсюда питают все остальные хабы"
        backgroundClass="bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        quickFacts={[
          { label: 'Профилей',  value: familyCount,   icon: 'Users' },
          { label: 'Детей',     value: childrenCount, icon: 'Baby' },
          { label: 'В древе',   value: treeCount,     icon: 'GitBranch' },
          { label: 'Сервисов',  value: subSections.length, icon: 'LayoutGrid' },
        ]}
        primaryAction={
          familyCount === 0
            ? { label: 'Добавить семью', icon: 'UserPlus', onClick: () => navigate('/family-management') }
            : { label: 'Открыть чат', icon: 'MessagesSquare', onClick: () => navigate('/family-chat') }
        }
        secondaryAction={{
          label: 'Древо',
          icon: 'GitBranch',
          onClick: () => navigate('/tree'),
        }}
        attention={attentionItems}
        nextStep={nextStep}
        relatedLinks={[
          { label: 'Планирование', icon: 'Target', path: '/planning-hub' },
          { label: 'Здоровье',     icon: 'HeartPulse', path: '/health-hub' },
          { label: 'Развитие',     icon: 'Brain', path: '/development-hub' },
          { label: 'Семейный код', icon: 'Sparkles', path: '/family-matrix' },
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
                context={s.context}
                modality={s.modality}
                status={s.status}
                statusLabel={s.statusLabel}
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
