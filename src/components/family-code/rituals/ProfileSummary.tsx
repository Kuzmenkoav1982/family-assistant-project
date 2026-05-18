import { Badge } from '@/components/ui/badge';
import MemberAvatar from '@/components/ui/member-avatar';
import { calculateAstrologyProfile, getElementLabel } from '@/lib/astrology';
import { calculateNumerologyProfile } from '@/lib/numerology';
import type { FamilyMember } from '@/types/family.types';
import { getBd } from './types';

export default function ProfileSummary({ member }: { member: FamilyMember }) {
  const bd = getBd(member);
  if (!bd) return null;
  const astro = calculateAstrologyProfile(bd);
  const num = calculateNumerologyProfile(member.name, bd);
  if (!astro || !num) return null;

  return (
    <div className="bg-white/80 rounded-xl border border-gray-100 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <MemberAvatar member={member} size="sm" />
        <div>
          <p className="text-sm font-bold text-gray-900">{member.name}</p>
          <p className="text-[10px] text-gray-500">{member.role}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge className="bg-purple-100 text-purple-700 text-[10px]">
          {astro.zodiacEmoji} {astro.zodiacSignLabel}
        </Badge>
        <Badge className="bg-indigo-100 text-indigo-700 text-[10px]">
          Число {num.lifePath.value}: {num.lifePath.shortMeaning}
        </Badge>
        <Badge className="bg-teal-100 text-teal-700 text-[10px]">
          {getElementLabel(astro.zodiacElement)}
        </Badge>
        <Badge className="bg-rose-100 text-rose-700 text-[10px]">
          {astro.chineseAnimalEmoji} {astro.chineseAnimalLabel}
        </Badge>
      </div>
      <div className="text-[11px] text-gray-600 leading-relaxed">
        <p><span className="font-medium">Сильные стороны:</span> {num.lifePath.strengths?.slice(0, 3).join(', ')}</p>
        <p><span className="font-medium">Зоны роста:</span> {num.lifePath.weaknesses?.slice(0, 2).join(', ')}</p>
      </div>
    </div>
  );
}
