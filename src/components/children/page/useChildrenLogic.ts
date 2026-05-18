import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import type { FamilyMember } from '@/types/family.types';

const PARENT_ROLES = ['Папа', 'Мама', 'Владелец', 'Родитель', 'Отец', 'Мать', 'Жена', 'Муж'];

export function useChildrenLogic() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { members: realMembers, loading: realLoading, addMember } = useFamilyMembersContext();
  const { isDemoMode, demoMembers } = useDemoMode();
  const members = isDemoMode ? demoMembers : realMembers;
  const loading = isDemoMode ? false : realLoading;

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'parent' | 'child'>('parent');

  const children = useMemo<FamilyMember[]>(() => {
    if (!Array.isArray(members)) return [];
    return members.filter(m => {
      const role = m.role?.toLowerCase() || '';
      const relationship = m.relationship?.toLowerCase() || '';
      return role.includes('сын') ||
        role.includes('дочь') ||
        role.includes('ребёнок') ||
        role.includes('ребенок') ||
        role === 'сын' ||
        role === 'дочь' ||
        relationship.includes('сын') ||
        relationship.includes('дочь') ||
        relationship.includes('ребёнок') ||
        relationship.includes('ребенок') ||
        m.access_role === 'child';
    });
  }, [members]);

  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('userData') || '{}'), []);

  const currentMember = Array.isArray(members)
    ? members.find(m =>
      m.user_id === currentUser?.id ||
      m.id === currentUser?.id ||
      m.user_id === currentUser?.user_id
    )
    : undefined;

  const isParent = isDemoMode ||
    PARENT_ROLES.includes(currentMember?.role || '') ||
    currentUser?.role === 'Родитель' ||
    currentMember?.accessRole === 'admin' ||
    currentMember?.accessRole === 'editor';

  useEffect(() => {
    if (!Array.isArray(members) || members.length === 0) return;

    const childId = searchParams.get('childId') || searchParams.get('member');
    const mode = searchParams.get('mode') as 'parent' | 'child' | null;

    if (childId) {
      setSelectedChildId(childId);
    } else if (!isParent && currentMember) {
      const currentChild = children.find(c => {
        if (c.id === currentMember.id) return true;
        if (c.user_id && currentMember.user_id && c.user_id === currentMember.user_id) return true;
        if (c.user_id === currentUser?.id) return true;
        if (c.id === currentUser?.user_id) return true;
        return false;
      });
      setSelectedChildId(currentChild?.id || null);
    } else if (children.length > 0) {
      setSelectedChildId(children[0].id);
    }

    setViewMode(mode || (isParent ? 'parent' : 'child'));
  }, [searchParams, isParent, children, currentMember, currentUser, members]);

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  return {
    loading,
    children,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
    viewMode,
    setViewMode,
    isParent,
    addMember,
    searchParams,
    setSearchParams,
  };
}
