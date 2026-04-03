import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { FamilyMember, LocationData } from '@/hooks/useFamilyTracker';

interface MembersPanelProps {
  familyMembers: FamilyMember[];
  locations: LocationData[];
}

export default function MembersPanel({ familyMembers, locations }: MembersPanelProps) {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Users" size={20} />
          Члены семьи
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {familyMembers.map((member) => {
          const memberLocation = locations.find(loc => loc.memberId === member.id);
          const isOnline = memberLocation && (new Date().getTime() - new Date(memberLocation.timestamp).getTime()) < 1800000;
          return (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border-2" style={{ borderColor: member.color }}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ring-2 ${isOnline ? 'ring-green-500' : 'ring-gray-300'}`} style={{ backgroundColor: member.avatar_url ? 'transparent' : member.color + '20' }}>
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover rounded-full" onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = 'none'; if (target.parentElement) { target.parentElement.style.backgroundColor = member.color + '20'; target.parentElement.innerHTML = `<span class="text-lg font-bold" style="color: ${member.color}">${member.name.charAt(0)}</span>`; } }} />
                  ) : (
                    <span className="text-lg font-bold" style={{ color: member.color }}>{member.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{member.name}</p>
                  <p className="text-xs text-gray-500">
                    {memberLocation ? new Date(memberLocation.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' }) : 'Нет данных'}
                  </p>
                </div>
              </div>
              <Badge className={isOnline ? 'bg-green-500 hover:bg-green-500' : 'bg-gray-400 hover:bg-gray-400'}>
                {isOnline ? 'Онлайн' : 'Оффлайн'}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
