import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DEMO_FAMILY, getCurrentMember, setCurrentMember, type FamilyMember } from '@/data/demoFamily';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export default function FamilyMemberSwitcher() {
  const [currentMember, setCurrentMemberState] = useState<FamilyMember | null>(getCurrentMember());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentMemberState(getCurrentMember());
  }, []);

  const handleMemberSwitch = (memberId: string) => {
    setCurrentMember(memberId);
    const member = DEMO_FAMILY.members.find(m => m.id === memberId);
    setCurrentMemberState(member || null);
    setIsOpen(false);
    window.location.reload();
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      owner: 'Владелец',
      admin: 'Администратор',
      member: 'Участник',
      child: 'Ребёнок'
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      member: 'bg-green-100 text-green-700',
      child: 'bg-yellow-100 text-yellow-700'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  if (!currentMember) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-3 h-auto py-2 px-4"
        >
          <img
            src={currentMember.avatar}
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
            Семья "{DEMO_FAMILY.name}"
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Выберите члена семьи, чтобы увидеть приложение от его лица:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEMO_FAMILY.members.map(member => (
              <button
                key={member.id}
                onClick={() => handleMemberSwitch(member.id)}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  member.id === currentMember.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-base">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.age} лет</div>
                    <Badge className={`mt-1 ${getRoleBadgeColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </Badge>
                  </div>
                  {member.id === currentMember.id && (
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
