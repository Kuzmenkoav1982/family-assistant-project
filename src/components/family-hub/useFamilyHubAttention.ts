import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HubAttentionItem, HubNextStep } from '@/components/hub/HubLayoutV2';

interface Args {
  familyCount: number;
  childrenCount: number;
  treeCount: number;
  membersLoading: boolean;
}

export function useFamilyHubAttention({ familyCount, childrenCount, treeCount, membersLoading }: Args) {
  const navigate = useNavigate();

  const attentionItems = useMemo<HubAttentionItem[]>(() => {
    const items: HubAttentionItem[] = [];
    if (membersLoading) return items;
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

  const nextStep = useMemo<HubNextStep | undefined>(() => {
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

  return { attentionItems, nextStep };
}
