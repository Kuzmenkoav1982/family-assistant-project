import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

interface FamilyMembersGridProps {
  members: FamilyMember[];
  onMemberClick: (member: FamilyMember) => void;
}

export function FamilyMembersGrid({ members, onMemberClick }: FamilyMembersGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {members.map((member, index) => (
        <Card
          key={member.id}
          className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={() => onMemberClick(member)}
        >
          <CardContent className="p-4 text-center">
            {member.photoUrl ? (
              <img 
                src={member.photoUrl} 
                alt={member.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-purple-300"
              />
            ) : (
              <div className="text-6xl mb-3 animate-bounce-slow">
                {member.avatar}
              </div>
            )}
            <h3 className="font-bold text-lg mb-1">{member.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
            
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="text-xs justify-center">
                <Icon name="Award" size={12} className="mr-1" />
                Уровень {member.level}
              </Badge>
              <Badge variant="outline" className="text-xs justify-center bg-orange-50">
                <Icon name="Star" size={12} className="mr-1" />
                {member.points} баллов
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}