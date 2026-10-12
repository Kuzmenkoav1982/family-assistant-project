import { useCallback } from 'react';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';

export type SectionKey = 'tasks' | 'calendar' | 'traditions' | 'meals' | 'tree' | 'chat' | 'album';

export const SECTION_BY_PATH: Record<string, SectionKey> = {
  '/tasks': 'tasks',
  '/calendar': 'calendar',
  '/events': 'calendar',
  '/culture': 'traditions',
  '/meals': 'meals',
  '/tree': 'tree',
  '/family-chat': 'chat',
  '/memory': 'album',
};

export const SECTION_BY_MENU_ID: Record<string, SectionKey> = {
  tasks: 'tasks',
  calendar: 'calendar',
  traditions: 'traditions',
  meals: 'meals',
  tree: 'tree',
  'family-chat': 'chat',
  'memory-album': 'album',
};

export function useSectionAccess() {
  const { members, currentMemberId, currentAccessRole, currentIsOwner } = useFamilyMembersContext();

  const canAccess = useCallback(
    (section: SectionKey | undefined) => {
      if (!section) return true;
      if (currentIsOwner || currentAccessRole === 'admin') return true;
      const me = members.find(m => String(m.id) === String(currentMemberId));
      return me?.permissions?.[section] !== false;
    },
    [members, currentMemberId, currentAccessRole, currentIsOwner],
  );

  return { canAccess };
}

export default useSectionAccess;
