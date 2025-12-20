import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  avatarUrl?: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: {
    canEditTasks: boolean;
    canDeleteTasks: boolean;
    canEditEvents: boolean;
    canDeleteEvents: boolean;
    canEditMembers: boolean;
    canDeleteMembers: boolean;
    canManageInvites: boolean;
    canEditFamily: boolean;
    canViewStats: boolean;
  };
}

const ROLES = {
  admin: {
    label: 'Администратор',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: 'ShieldCheck',
    description: 'Полный доступ ко всем функциям'
  },
  editor: {
    label: 'Редактор',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: 'Edit',
    description: 'Может создавать и редактировать контент'
  },
  viewer: {
    label: 'Наблюдатель',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: 'Eye',
    description: 'Только просмотр информации'
  }
};

const DEFAULT_PERMISSIONS = {
  admin: {
    canEditTasks: true,
    canDeleteTasks: true,
    canEditEvents: true,
    canDeleteEvents: true,
    canEditMembers: true,
    canDeleteMembers: true,
    canManageInvites: true,
    canEditFamily: true,
    canViewStats: true
  },
  editor: {
    canEditTasks: true,
    canDeleteTasks: false,
    canEditEvents: true,
    canDeleteEvents: false,
    canEditMembers: false,
    canDeleteMembers: false,
    canManageInvites: false,
    canEditFamily: false,
    canViewStats: true
  },
  viewer: {
    canEditTasks: false,
    canDeleteTasks: false,
    canEditEvents: false,
    canDeleteEvents: false,
    canEditMembers: false,
    canDeleteMembers: false,
    canManageInvites: false,
    canEditFamily: false,
    canViewStats: true
  }
};

export default function AccessControlManager() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = () => {
    const storedMembers = localStorage.getItem('familyMembers');
    if (storedMembers) {
      const parsedMembers = JSON.parse(storedMembers);
      const membersWithPermissions = parsedMembers.map((member: any) => ({
        ...member,
        role: member.role || 'viewer',
        permissions: member.permissions || DEFAULT_PERMISSIONS.viewer
      }));
      setMembers(membersWithPermissions);
    }
  };

  const updateMemberRole = (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    const updatedMembers = members.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          role: newRole,
          permissions: DEFAULT_PERMISSIONS[newRole]
        };
      }
      return member;
    });
    setMembers(updatedMembers);
    localStorage.setItem('familyMembers', JSON.stringify(updatedMembers));
  };

  const updateMemberPermission = (memberId: string, permission: keyof FamilyMember['permissions'], value: boolean) => {
    const updatedMembers = members.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          permissions: {
            ...member.permissions,
            [permission]: value
          }
        };
      }
      return member;
    });
    setMembers(updatedMembers);
    localStorage.setItem('familyMembers', JSON.stringify(updatedMembers));
  };

  const openPermissionsDialog = (member: FamilyMember) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon name="Users" size={48} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">Нет членов семьи для управления</p>
        <p className="text-sm text-gray-400">Пригласите родственников, чтобы настроить их права доступа</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {members.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {member.avatarUrl ? (
                    <img 
                      src={member.avatarUrl} 
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{member.name}</h4>
                      <Badge variant="outline" className={ROLES[member.role].color}>
                        <Icon name={ROLES[member.role].icon as any} size={12} className="mr-1" />
                        {ROLES[member.role].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{member.relationship}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Dialog open={isDialogOpen && selectedMember?.id === member.id} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setSelectedMember(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openPermissionsDialog(member)}
                        className="gap-2"
                      >
                        <Icon name="Settings" size={16} />
                        Настроить
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                                onClick={() => updateMemberRole(member.id, roleKey as any)}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                  member.role === roleKey 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
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
                                      updateMemberPermission(member.id, 'canEditTasks', checked)
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700">Удалять задачи</span>
                                  <Switch
                                    checked={member.permissions.canDeleteTasks}
                                    onCheckedChange={(checked) => 
                                      updateMemberPermission(member.id, 'canDeleteTasks', checked)
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
                                      updateMemberPermission(member.id, 'canEditEvents', checked)
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700">Удалять события</span>
                                  <Switch
                                    checked={member.permissions.canDeleteEvents}
                                    onCheckedChange={(checked) => 
                                      updateMemberPermission(member.id, 'canDeleteEvents', checked)
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
                                      updateMemberPermission(member.id, 'canEditMembers', checked)
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700">Удалять членов</span>
                                  <Switch
                                    checked={member.permissions.canDeleteMembers}
                                    onCheckedChange={(checked) => 
                                      updateMemberPermission(member.id, 'canDeleteMembers', checked)
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
                                      updateMemberPermission(member.id, 'canManageInvites', checked)
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700">Редактировать настройки семьи</span>
                                  <Switch
                                    checked={member.permissions.canEditFamily}
                                    onCheckedChange={(checked) => 
                                      updateMemberPermission(member.id, 'canEditFamily', checked)
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700">Просматривать статистику</span>
                                  <Switch
                                    checked={member.permissions.canViewStats}
                                    onCheckedChange={(checked) => 
                                      updateMemberPermission(member.id, 'canViewStats', checked)
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
                          onClick={() => {
                            setIsDialogOpen(false);
                            setSelectedMember(null);
                          }}
                        >
                          Закрыть
                        </Button>
                        <Button onClick={() => {
                          setIsDialogOpen(false);
                          setSelectedMember(null);
                          alert('✅ Права доступа сохранены');
                        }}>
                          Сохранить изменения
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">Рекомендации по настройке прав:</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Администратор</strong> — для родителей и доверенных членов семьи</li>
              <li>• <strong>Редактор</strong> — для взрослых членов семьи, которые активно участвуют</li>
              <li>• <strong>Наблюдатель</strong> — для детей и гостей, которым нужен только просмотр</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
