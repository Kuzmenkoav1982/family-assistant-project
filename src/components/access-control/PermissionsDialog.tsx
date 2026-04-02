import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FamilyMemberPermissions, ROLES } from './types';

interface PermissionsDialogProps {
  member: FamilyMemberPermissions;
  savingMemberId: string | null;
  onRoleChange: (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => void;
  onPermissionChange: (memberId: string, permission: keyof FamilyMemberPermissions['permissions'], value: boolean) => void;
  onClose: () => void;
}

export default function PermissionsDialog({ member, savingMemberId, onRoleChange, onPermissionChange, onClose }: PermissionsDialogProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Icon name="Shield" size={24} className="text-blue-600" />
          Управление правами: {member.name}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Icon name="UserCog" size={18} />
            Роль пользователя
          </h4>
          <div className="grid gap-3">
            {Object.entries(ROLES).map(([roleKey, roleData]) => (
              <button
                key={roleKey}
                onClick={() => onRoleChange(member.id, roleKey as any)}
                disabled={savingMemberId === member.id}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  member.role === roleKey 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  savingMemberId === member.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name={roleData.icon as any} size={20} />
                    <span className="font-semibold">{roleData.label}</span>
                  </div>
                  {member.role === roleKey && (
                    <Icon name="CheckCircle2" size={20} className="text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{roleData.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="Lock" size={18} />
            Детальные права доступа
          </h4>
          
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="CheckSquare" size={16} className="text-blue-600" />
                Задачи
              </h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Редактировать задачи</span>
                  <Switch
                    checked={member.permissions.canEditTasks}
                    onCheckedChange={(checked) => 
                      onPermissionChange(member.id, 'canEditTasks', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Удалять задачи</span>
                  <Switch
                    checked={member.permissions.canDeleteTasks}
                    onCheckedChange={(checked) => 
                      onPermissionChange(member.id, 'canDeleteTasks', checked)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Calendar" size={16} className="text-purple-600" />
                События
              </h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Редактировать события</span>
                  <Switch
                    checked={member.permissions.canEditEvents}
                    onCheckedChange={(checked) => 
                      onPermissionChange(member.id, 'canEditEvents', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Удалять события</span>
                  <Switch
                    checked={member.permissions.canDeleteEvents}
                    onCheckedChange={(checked) => 
                      onPermissionChange(member.id, 'canDeleteEvents', checked)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Users" size={16} className="text-green-600" />
                Члены семьи
              </h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Редактировать профили</span>
                  <Switch
                    checked={member.permissions.canEditMembers}
                    onCheckedChange={(checked) => 
                      onPermissionChange(member.id, 'canEditMembers', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Удалять членов</span>
                  <Switch
                    checked={member.permissions.canDeleteMembers}
                    onCheckedChange={(checked) => 
                      onPermissionChange(member.id, 'canDeleteMembers', checked)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Settings" size={16} className="text-orange-600" />
                Управление
              </h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Управлять приглашениями</span>
                  <Switch
                    checked={member.permissions.canManageInvites}
                    onCheckedChange={(checked) => 
                      onPermissionChange(member.id, 'canManageInvites', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Редактировать настройки семьи</span>
                  <Switch
                    checked={member.permissions.canEditFamily}
                    onCheckedChange={(checked) => 
                      onPermissionChange(member.id, 'canEditFamily', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Просматривать статистику</span>
                  <Switch
                    checked={member.permissions.canViewStats}
                    onCheckedChange={(checked) => 
                      onPermissionChange(member.id, 'canViewStats', checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={onClose}
        >
          Закрыть
        </Button>
        <Button onClick={() => {
          onClose();
          alert('✅ Права доступа сохранены');
        }}>
          Сохранить изменения
        </Button>
      </div>
    </>
  );
}
