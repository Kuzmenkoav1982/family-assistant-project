import { useMemo } from 'react';
import { signals } from '@/lib/cardStatus';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { useTasks } from '@/hooks/useTasks';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import type { SubSection } from './types';

export function useFamilyHubData() {
  const { members, loading: membersLoading } = useFamilyMembersContext();
  const { members: treeMembers } = useFamilyTree();
  const { tasks: tasksRaw } = useTasks();
  const { events: calendarEvents } = useCalendarEvents();
  const tasks = tasksRaw || [];

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

  const subSections = useMemo<SubSection[]>(() => {
    const familyStatus = signals.familyProfiles(familyCount);
    const childrenStatus = signals.children(childrenCount);
    const treeStatus = signals.familyTree(treeCount);

    return [
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
  }, [familyCount, childrenCount, treeCount]);

  return {
    members,
    membersLoading,
    tasks,
    calendarEvents,
    familyCount,
    childrenCount,
    treeCount,
    subSections,
  };
}
