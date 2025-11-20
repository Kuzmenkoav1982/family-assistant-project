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
    <div className="space-y-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
        <p className="text-sm font-medium text-blue-900">
          <Icon name="Info" className="inline mr-2" size={16} />
          Нажмите на карточку участника, чтобы открыть его полный профиль с возможностью редактирования
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, index) => (
          <Card
            key={member.id}
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-102 animate-fade-in group"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onMemberClick(member)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="relative">
                  {member.photoUrl ? (
                    <img 
                      src={member.photoUrl} 
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover border-3 border-purple-300 group-hover:border-purple-500 transition-colors"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-4xl border-3 border-purple-300 group-hover:border-purple-500 transition-colors">
                      {member.avatar}
                    </div>
                  )}
                  {member.moodStatus && (
                    <div className="absolute -bottom-1 -right-1 text-2xl bg-white rounded-full border-2 border-white" title={member.moodStatus.label}>
                      {member.moodStatus.emoji}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1 truncate group-hover:text-purple-600 transition-colors">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {member.age && (
                      <Badge variant="outline" className="text-xs">
                        {member.age} лет
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs bg-purple-50">
                      <Icon name="Award" size={10} className="mr-1" />
                      Ур. {member.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-orange-50">
                      <Icon name="Star" size={10} className="mr-1" />
                      {member.points}
                    </Badge>
                  </div>
                  
                  {member.tasksCompleted > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <Icon name="CheckCircle" size={12} className="inline mr-1 text-green-500" />
                      {member.tasksCompleted} задач выполнено
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {member.workload > 0 ? (
                    <>
                      <Icon name="TrendingUp" size={12} className="inline mr-1" />
                      Загрузка: {member.workload}%
                    </>
                  ) : (
                    'Нет активных задач'
                  )}
                </div>
                <Icon name="ChevronRight" size={16} className="text-purple-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}