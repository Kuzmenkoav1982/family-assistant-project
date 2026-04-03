import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useDemoMode } from '@/contexts/DemoModeContext';

export function useIsFamilyOwner(): boolean {
  const { members } = useFamilyMembersContext();
  const { isDemoMode } = useDemoMode();

  if (isDemoMode) return true;

  try {
    const userData = localStorage.getItem('userData');
    if (!userData) return false;
    const user = JSON.parse(userData);
    const memberId = user.member_id;
    if (!memberId) return false;
    const currentMember = members.find(m => m.id === memberId);
    if (!currentMember) return false;
    const role = (currentMember.role || '').toLowerCase();
    return role === 'владелец' || role.includes('владел') || role === 'папа' || role === 'мама';
  } catch {
    return false;
  }
}

export default useIsFamilyOwner;