import type { FamilyMember } from '@/types/family.types';

interface MemberAvatarProps {
  member: FamilyMember;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-7 h-7 text-sm',
  md: 'w-9 h-9 text-lg',
  lg: 'w-12 h-12 text-2xl',
};

export default function MemberAvatar({ member, size = 'md', className = '' }: MemberAvatarProps) {
  const sizeClass = SIZES[size];
  const photoUrl = member.photo_url || member.photoUrl;
  const hasPhoto = photoUrl && (member.avatar_type === 'photo' || member.avatarType === 'photo');

  if (hasPhoto) {
    return (
      <img
        src={photoUrl}
        alt={member.name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 ${className}`}>
      {member.avatar || member.name.charAt(0)}
    </div>
  );
}
