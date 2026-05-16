import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import HubLayoutV2, { type HubAttentionItem, type HubNextStep } from '@/components/hub/HubLayoutV2';
import HubCardV2 from '@/components/hub/HubCardV2';
import HowItWorksBlock from '@/components/hub/HowItWorksBlock';
import type { CardStatus } from '@/components/hub/StatusBadge';
import type { Modality } from '@/components/hub/ModalityBadge';
import { signals } from '@/lib/cardStatus';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { FamilyMembersGrid } from '@/components/FamilyMembersGrid';
import { useTasks } from '@/hooks/useTasks';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

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

export default function FamilyHub() {
  const navigate = useNavigate();

  // Реальные данные семьи из backend (не localStorage)
  const { members, loading: membersLoading } = useFamilyMembersContext();
  const { members: treeMembers } = useFamilyTree();
  const { tasks: tasksRaw } = useTasks();
  const { events: calendarEvents } = useCalendarEvents();
  const tasks = tasksRaw || [];

  // Дети — фильтр по ролям и access_role (как в Children.tsx)
  const childrenList = useMemo(() => {
    if (!Array.isArray(members)) return [];
    return members.filter((m) => {
      const role = (m.role || '').toLowerCase();
      const accessRole = (m as { access_role?: string }).access_role;
      return (
        accessRole === 'child' ||
        role.includes('сын') ||
        role.includes('дочь') ||
        role.includes('дочер') ||
        role.includes('ребёнок') ||
        role.includes('ребенок')
      );
    });
  }, [members]);

  const familyCount = Array.isArray(members) ? members.length : 0;
  const childrenCount = childrenList.length;
  const treeCount = Array.isArray(treeMembers) ? treeMembers.length : 0;

  const familyStatus = signals.familyProfiles(familyCount);
  const childrenStatus = signals.children(childrenCount);
  const treeStatus = signals.familyTree(treeCount);

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
      status: familyStatus.status,
      statusLabel: familyStatus.statusLabel,
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
      status: childrenStatus.status,
      statusLabel: childrenStatus.statusLabel,
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
      status: treeStatus.status,
      statusLabel: treeStatus.statusLabel,
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
    // Пока данные семьи ещё грузятся — не выдаём ложный сигнал «нет семьи».
    if (membersLoading) {
      return items;
    }
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
  }, [familyCount, childrenCount, treeCount, navigate, membersLoading]);

  const nextStep: HubNextStep | undefined = useMemo(() => {
    if (membersLoading) return undefined;
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
  }, [familyCount, childrenCount, navigate, membersLoading]);

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
        <div className="space-y-6">
          <HowItWorksBlock
            accent="blue"
            intro="«Семья» — центральное пространство, где живёт состав, связи и совместная жизнь. Добавьте близких, опишите отношения — и все остальные разделы оживут вашими реальными данными."
            steps={[
              {
                icon: 'UserPlus',
                title: 'Шаг 1. Добавьте членов семьи',
                description:
                  'Заполните имена, даты рождения и роли. Это база для всех расчётов: от планов до семейного кода.',
              },
              {
                icon: 'GitBranch',
                title: 'Шаг 2. Постройте дерево связей',
                description:
                  'Укажите родственные отношения — кто кому кем приходится. Это раскрывает картину семьи целиком.',
              },
              {
                icon: 'CalendarDays',
                title: 'Шаг 3. Ведите общую жизнь',
                description:
                  'Календарь событий, задачи, праздники, традиции — всё, что объединяет семью в одном месте.',
              },
              {
                icon: 'Heart',
                title: 'Шаг 4. Связи с другими разделами',
                description:
                  'Данные о семье автоматически подтягиваются в «Развитие», «Семейный код», «Ценности» и другие хабы.',
              },
            ]}
            footer="Чем подробнее заполнен профиль семьи — тем точнее работают ИИ-советы и персональные рекомендации во всех разделах."
          />

          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Члены семьи
              </div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500">
                {familyCount > 0 ? `${familyCount} участников` : 'Никого не добавлено'}
              </div>
            </div>
            <FamilyMembersGrid
              members={Array.isArray(members) ? members : []}
              onMemberClick={(member) => navigate(`/member/${member.id}`)}
              tasks={tasks}
              events={calendarEvents}
            />
          </div>

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
        </div>
      </HubLayoutV2>
    </>
  );
}