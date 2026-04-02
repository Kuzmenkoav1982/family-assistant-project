import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FamilyMemberPermissions, ROLES } from './types';
import PermissionsDialog from './PermissionsDialog';

interface MemberCardProps {
  member: FamilyMemberPermissions;
  savingMemberId: string | null;
  isDialogOpen: boolean;
  selectedMemberId: string | null;
  onOpenDialog: (member: FamilyMemberPermissions) => void;
  onDialogChange: (open: boolean) => void;
  onRoleChange: (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => void;
  onPermissionChange: (memberId: string, permission: keyof FamilyMemberPermissions['permissions'], value: boolean) => void;
}

export default function MemberCard({
  member,
  savingMemberId,
  isDialogOpen,
  selectedMemberId,
  onOpenDialog,
  onDialogChange,
  onRoleChange,
  onPermissionChange,
}: MemberCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {(member.avatarUrl || member.avatar) ? (
              <img 
                src={member.avatarUrl || member.avatar} 
                alt={member.name}
                className="w-12 h-12 aspect-square rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 aspect-square rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {member.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                {member.role && ROLES[member.role] && (
                  <Badge variant="outline" className={ROLES[member.role].color}>
                    <Icon name={ROLES[member.role].icon as any} size={12} className="mr-1" />
                    {ROLES[member.role].label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{member.relationship}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savingMemberId === member.id && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Icon name="Loader2" size={16} className="animate-spin" />
                Сохранение...
              </div>
            )}
            <Dialog open={isDialogOpen && selectedMemberId === member.id} onOpenChange={onDialogChange}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onOpenDialog(member)}
                  className="gap-2"
                  disabled={savingMemberId === member.id}
                >
                  <Icon name="Settings" size={16} />
                  Настроить
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <PermissionsDialog
                  member={member}
                  savingMemberId={savingMemberId}
                  onRoleChange={onRoleChange}
                  onPermissionChange={onPermissionChange}
                  onClose={() => onDialogChange(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
