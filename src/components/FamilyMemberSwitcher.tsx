import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';

interface FamilyMember {
  id: string;
  user_id?: string;
  name: string;
  role: string;
  avatar: string;
  avatar_type: string;
  photo_url?: string;
  age?: number;
}

export default function FamilyMemberSwitcher() {
  const { members, loading } = useFamilyMembersContext();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<string>('');
  
  const authUser = localStorage.getItem('user');
  const currentUser = authUser ? JSON.parse(authUser) : null;
  const familyName = currentUser?.family_name || 'Моя семья';

  useEffect(() => {
    if (currentUser?.member_id) {
      setCurrentMemberId(currentUser.member_id);
    }
  }, [currentUser?.member_id]);

  const currentMember = members.find(m => m.id === currentMemberId) || members[0];

  const handleMemberSwitch = (memberId: string) => {
    setCurrentMemberId(memberId);
    
    if (currentUser) {
      const updatedUser = { ...currentUser, member_id: memberId };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    setIsOpen(false);
    window.location.reload();
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      owner: 'Владелец',
      admin: 'Администратор',
      member: 'Участник',
      child: 'Ребёнок',
      'Отец': 'Отец',
      'Мама': 'Мама',
      'Сын': 'Сын',
      'Дочь': 'Дочь'
    };
    return roles[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      member: 'bg-green-100 text-green-700',
      child: 'bg-yellow-100 text-yellow-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getMemberAvatar = (member: FamilyMember) => {
    if (member.avatar_type === 'photo' && member.photo_url) {
      return member.photo_url;
    }
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <text x="50" y="50" font-size="50" text-anchor="middle" dominant-baseline="central">
          ${member.avatar || '👤'}
        </text>
      </svg>
    `)}`;
  };

  if (loading || !currentMember || members.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-3 h-auto py-2 px-4"
        >
          <img
            src={getMemberAvatar(currentMember)}
            alt={currentMember.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex flex-col items-start">
            <span className="font-semibold text-sm">{currentMember.name}</span>
            <span className="text-xs text-muted-foreground">{getRoleLabel(currentMember.role)}</span>
          </div>
          <Icon name="ChevronDown" size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Users" size={24} />
            {familyName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Выберите члена семьи, чтобы увидеть приложение от его лица:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {members.map(member => (
              <button
                key={member.id}
                onClick={() => handleMemberSwitch(member.id)}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  member.id === currentMemberId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getMemberAvatar(member)}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-base">{member.name}</div>
                    {member.age && (
                      <div className="text-sm text-muted-foreground">{member.age} лет</div>
                    )}
                    <Badge className={`mt-1 ${getRoleBadgeColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </Badge>
                  </div>
                  {member.id === currentMemberId && (
                    <Icon name="Check" size={24} className="text-blue-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="pt-4 border-t">
            <div className="text-xs text-muted-foreground space-y-2">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={14} className="mt-0.5" />
                <span>Каждый член семьи видит разделы согласно своим правам доступа</span>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Shield" size={14} className="mt-0.5" />
                <span>Владелец может управлять доступами в разделе "Семья"</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}