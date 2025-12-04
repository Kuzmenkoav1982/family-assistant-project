import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, type Role } from '@/utils/permissions';

interface FamilyMember {
  id: string;
  name: string;
  display_role?: string;
  access_role: Role;
  user_email?: string;
  member_status: 'pending' | 'active' | 'revoked';
  avatar?: string;
  photo_url?: string;
  joined_at?: string;
}

interface MemberCardProps {
  member: FamilyMember;
  canManageRoles: boolean;
  currentUserEmail: string;
  onRoleUpdate: (memberId: string, newRole: Role) => void;
}

export default function MemberCard({
  member,
  canManageRoles,
  currentUserEmail,
  onRoleUpdate,
}: MemberCardProps) {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState<Role>(member.access_role);

  const isCurrentUser = member.user_email === currentUserEmail;

  const handleRoleChange = () => {
    if (selectedNewRole !== member.access_role) {
      onRoleUpdate(member.id, selectedNewRole);
      setShowRoleDialog(false);
    }
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'parent':
        return 'secondary';
      case 'guardian':
        return 'outline';
      case 'viewer':
        return 'outline';
      case 'child':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                {member.photo_url ? (
                  <AvatarImage src={member.photo_url} alt={member.name} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {member.avatar || member.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  {isCurrentUser && (
                    <Badge variant="outline" className="text-xs">
                      Вы
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getRoleBadgeVariant(member.access_role)}>
                    {ROLE_LABELS[member.access_role]}
                  </Badge>

                  {member.display_role && member.display_role !== member.name && (
                    <span className="text-sm text-muted-foreground">
                      • {member.display_role}
                    </span>
                  )}

                  {member.user_email && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Icon name="Mail" className="h-3 w-3" />
                      {member.user_email}
                    </span>
                  )}
                </div>

                {member.joined_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    В семье с {new Date(member.joined_at).toLocaleDateString('ru-RU')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canManageRoles && !isCurrentUser && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoleDialog(true)}
                >
                  <Icon name="Shield" className="mr-2 h-4 w-4" />
                  Изменить роль
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изменить роль участника</AlertDialogTitle>
            <AlertDialogDescription>
              Выберите новую роль для {member.name}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Select value={selectedNewRole} onValueChange={(v) => setSelectedNewRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">
                  {ROLE_LABELS[selectedNewRole]}
                </p>
                <p className="text-sm text-muted-foreground">
                  {ROLE_DESCRIPTIONS[selectedNewRole]}
                </p>
              </div>
            </div>

            {selectedNewRole === 'admin' && (
              <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    Осторожно!
                  </p>
                  <p className="text-amber-800 dark:text-amber-200">
                    Администратор получит полный доступ к управлению семьёй, включая
                    возможность удалять участников и изменять роли.
                  </p>
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange}>
              Изменить роль
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
