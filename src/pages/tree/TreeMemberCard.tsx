import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TreeMember } from '@/hooks/useFamilyTree';
import type { FamilyUnit } from './treeUtils';
import { calculateAge, getAgeText, isImageUrl } from './treeUtils';

export function MemberCard({ member, onClick, isHighlighted, branchColor }: { member: TreeMember; onClick: () => void; isHighlighted?: boolean; branchColor?: string }) {
  const age = calculateAge(member);
  const isMe = member.relation === 'Я';

  return (
    <Card
      className={`w-[130px] cursor-pointer hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden ${
        isMe
          ? 'bg-gradient-to-br from-amber-100 to-yellow-100 ring-2 ring-amber-400/50'
          : isHighlighted
            ? 'bg-gradient-to-br from-pink-50 to-rose-50'
            : 'bg-gradient-to-br from-amber-50 to-yellow-50'
      }`}
      style={branchColor ? { borderColor: branchColor, borderWidth: 2 } : undefined}
      onClick={onClick}
    >
      {member.death_year && (
        <div className="absolute top-1 right-1 z-10">
          <Badge className="bg-gray-600 text-white text-[10px] px-1 py-0">&#10013;</Badge>
        </div>
      )}
      {isMe && (
        <div className="absolute top-1 left-1 z-10">
          <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">Я</Badge>
        </div>
      )}
      <CardContent className="p-3 text-center">
        {member.photo_url && isImageUrl(member.photo_url) ? (
          <img
            src={member.photo_url}
            alt={member.name}
            className="w-14 h-14 rounded-full object-cover border-2 mx-auto mb-2"
            style={{ borderColor: branchColor || (isMe ? '#f59e0b' : '#fcd34d') }}
          />
        ) : (
          <div className="text-3xl mb-2">{member.avatar || '👤'}</div>
        )}
        <p className="font-semibold text-sm text-amber-900 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
          {member.name.split(' ')[0]}
        </p>
        {member.relation && member.relation !== 'Я' && (
          <p className="text-[10px] text-amber-600 mt-0.5">{member.relation}</p>
        )}
        {(member.birth_date || member.birth_year) && (
          <p className="text-[10px] text-amber-500 mt-0.5">
            {(() => {
              const birthStr = member.birth_date
                ? new Date(member.birth_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
                : `${member.birth_year} г.р.`;
              if (member.death_date) {
                const deathStr = new Date(member.death_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
                return `${birthStr} — ${deathStr}`;
              }
              if (member.death_year) {
                return `${member.birth_year} — ${member.death_year}`;
              }
              return birthStr;
            })()}
          </p>
        )}
        {age !== null && (
          <Badge variant="outline" className="mt-1 text-[10px] border-amber-300 text-amber-700 px-1.5 py-0">
            {getAgeText(age)}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export function CoupleBlock({ unit, onSelect, memberColors }: { unit: FamilyUnit; onSelect: (m: TreeMember) => void; memberColors?: Map<number, string> }) {
  const left = unit.spouseLeft && unit.spouse ? unit.spouse : unit.primary;
  const right = unit.spouseLeft && unit.spouse ? unit.primary : unit.spouse;
  const leftColor = memberColors?.get(left.id);
  const rightColor = right ? memberColors?.get(right.id) : undefined;
  return (
    <div className="flex items-center gap-0">
      <MemberCard member={left} onClick={() => onSelect(left)} branchColor={leftColor} />
      {right && (
        <>
          <div className="flex items-center mx-[-4px] z-10">
            <div className="w-6 h-0.5 bg-pink-400" />
            <span className="text-pink-500 text-xs">&#10084;</span>
            <div className="w-6 h-0.5 bg-pink-400" />
          </div>
          <MemberCard member={right} onClick={() => onSelect(right)} isHighlighted branchColor={rightColor} />
        </>
      )}
    </div>
  );
}

export default MemberCard;
