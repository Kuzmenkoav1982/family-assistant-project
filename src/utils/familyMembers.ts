export interface FamilyMemberType {
  id: string;
  account_type?: 'full' | 'child_profile';
  user_id?: string;
  [key: string]: any;
}

export function getActiveVotersCount(members: FamilyMemberType[]): number {
  return members.filter(m => m.account_type !== 'child_profile').length;
}

export function getActiveMembersForVoting(members: FamilyMemberType[]): FamilyMemberType[] {
  return members.filter(m => m.account_type !== 'child_profile');
}

export function isChildProfile(member: FamilyMemberType): boolean {
  return member.account_type === 'child_profile';
}

export function canParticipateInVoting(member: FamilyMemberType): boolean {
  return member.account_type !== 'child_profile';
}
