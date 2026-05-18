import Icon from '@/components/ui/icon';
import MemberAvatar from '@/components/ui/member-avatar';
import type { FamilyMember } from '@/types/family.types';
import { getBd } from './constants';

interface Props {
  member: FamilyMember;
  isSelected: boolean;
  onClick: () => void;
}

export default function MemberChip({ member, isSelected, onClick }: Props) {
  const hasBd = !!getBd(member);
  return (
    <button
      onClick={() => hasBd && onClick()}
      className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50 shadow-md'
          : hasBd
            ? 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
            : 'border-dashed border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
      }`}
    >
      <MemberAvatar member={member} size="sm" />
      <div className="text-left">
        <p className={`text-xs font-medium ${isSelected ? 'text-indigo-800' : 'text-gray-800'}`}>
          {member.name}
        </p>
        <p className="text-[10px] text-gray-400">
          {hasBd ? member.role : 'Нет даты рождения'}
        </p>
      </div>
      {!hasBd && <Icon name="AlertCircle" size={14} className="text-amber-400 ml-1" />}
    </button>
  );
}
