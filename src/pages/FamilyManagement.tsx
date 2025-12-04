import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, type Role } from '@/utils/permissions';
import InviteMemberDialog from '@/components/FamilyManagement/InviteMemberDialog';
import MemberCard from '@/components/FamilyManagement/MemberCard';
import PermissionsMatrix from '@/components/FamilyManagement/PermissionsMatrix';

interface FamilyMember {
  id: string;
  name: string;
  display_role?: string;
  access_role: Role;
  user_email?: string;
  member_status: 'pending' | 'active' | 'revoked';
  invited_at?: string;
  joined_at?: string;
  avatar?: string;
  photo_url?: string;
  granular_permissions?: Record<string, string[]>;
}

export default function FamilyManagement() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<Role>('viewer');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(true);

  const familyId = localStorage.getItem('familyId');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    if (!familyId) {
      setError('ID семьи не найден');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://functions.yandexcloud.net/d4e7hum8ji3v1oiqhgs9?familyId=${familyId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка загрузки участников');
      }

      const data = await response.json();
      
      if (data.members) {
        setMembers(data.members);
        
        const currentMember = data.members.find((m: FamilyMember) => 
          m.user_email === localStorage.getItem('userEmail')
        );
        if (currentMember) {
          setCurrentUserRole(currentMember.access_role || 'viewer');
        }
      }
    } catch (err) {
      console.error('Error loading members:', err);
      setError('Не удалось загрузить список участников');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (memberId: string, newRole: Role) => {
    if (!familyId) return;

    try {
      const response = await fetch(
        'https://functions.yandexcloud.net/d4e7hum8ji3v1oiqhgs9',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update_role',
            family_id: familyId,
            member_id: memberId,
            role: newRole,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка обновления роли');
      }

      await loadMembers();
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Не удалось обновить роль');
    }
  };

  const handleInviteSent = () => {
    setShowInviteDialog(false);
    loadMembers();
  };

  const canManageRoles = currentUserRole === 'admin';
  const canInvite = currentUserRole === 'admin';

  const activeMembers = members.filter(m => m.member_status === 'active');
  const pendingMembers = members.filter(m => m.member_status === 'pending');

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Управление семьёй</h1>
          <p className="text-muted-foreground">
            Управление участниками, ролями и правами доступа
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/settings')}>
          <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
          Назад
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <Icon name="AlertCircle" className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Инструкция */}
      <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
          <div className="flex items-start gap-3">
            <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                <h3 className="font-semibold text-blue-900 text-lg">
                  Как управлять семьёй
                </h3>
                <Icon 
                  name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                  className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" 
                />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-3">
                <AlertDescription className="text-blue-800">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">👨‍👩‍👧‍👦 Для чего нужен этот раздел?</p>
                      <p className="text-sm">
                        Здесь вы управляете составом семьи, приглашаете новых участников, назначаете роли 
                        и настраиваете права доступа. Это центр администрирования вашей семейной системы.
                      </p>
                    </div>

                    <div>
                      <p className="font-medium mb-2">✨ Основные возможности</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li><strong>Приглашение участников:</strong> Отправляйте приглашения по email</li>
                        <li><strong>Управление ролями:</strong> Назначайте роли (Администратор, Участник, Наблюдатель)</li>
                        <li><strong>Права доступа:</strong> Смотрите матрицу прав для каждой роли</li>
                        <li><strong>Статусы:</strong> Отслеживайте активных участников и ожидающие приглашения</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium mb-2">🎯 Роли и права</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li><strong>Администратор:</strong> Полный доступ ко всем функциям, кроме удаления семьи</li>
                        <li><strong>Участник:</strong> Может создавать и редактировать контент, но не управлять семьёй</li>
                        <li><strong>Наблюдатель:</strong> Только просмотр информации без права изменений</li>
                        <li><strong>Владелец:</strong> Создатель семьи, имеет все права включая удаление</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium mb-2">💡 Советы по управлению</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Назначайте роли в соответствии с реальными обязанностями</li>
                        <li>Роль Администратор подходит для родителей</li>
                        <li>Детям обычно достаточно роли Участник</li>
                        <li>Наблюдатель хорош для бабушек/дедушек или нянь</li>
                        <li>Регулярно проверяйте список ожидающих приглашений</li>
                        <li>При необходимости можно изменить роль участника</li>
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </CollapsibleContent>
            </div>
          </div>
        </Alert>
      </Collapsible>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">
            <Icon name="Users" className="mr-2 h-4 w-4" />
            Участники ({activeMembers.length})
          </TabsTrigger>
          <TabsTrigger value="invites">
            <Icon name="Mail" className="mr-2 h-4 w-4" />
            Приглашения ({pendingMembers.length})
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Icon name="Shield" className="mr-2 h-4 w-4" />
            Права доступа
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Участники семьи</CardTitle>
                  <CardDescription>
                    Управление участниками и их ролями
                  </CardDescription>
                </div>
                {canInvite && (
                  <Button onClick={() => setShowInviteDialog(true)}>
                    <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                    Пригласить
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Users" className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Нет активных участников</p>
                  </div>
                ) : (
                  activeMembers.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      canManageRoles={canManageRoles}
                      currentUserEmail={localStorage.getItem('userEmail') || ''}
                      onRoleUpdate={handleRoleUpdate}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ожидающие приглашения</CardTitle>
                  <CardDescription>
                    Участники, которых пригласили, но они ещё не присоединились
                  </CardDescription>
                </div>
                {canInvite && (
                  <Button onClick={() => setShowInviteDialog(true)}>
                    <Icon name="Send" className="mr-2 h-4 w-4" />
                    Отправить приглашение
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Mail" className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Нет ожидающих приглашений</p>
                    {canInvite && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setShowInviteDialog(true)}
                      >
                        Пригласить участника
                      </Button>
                    )}
                  </div>
                ) : (
                  pendingMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <Icon name="Clock" className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{member.user_email || 'Без email'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{ROLE_LABELS[member.access_role]}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Приглашён{' '}
                              {member.invited_at
                                ? new Date(member.invited_at).toLocaleDateString('ru-RU')
                                : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">Ожидание</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Матрица прав доступа</CardTitle>
              <CardDescription>
                Полная таблица прав для каждой роли
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionsMatrix />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {ROLE_LABELS[role]}
                  </CardTitle>
                  <CardDescription>{ROLE_DESCRIPTIONS[role]}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {showInviteDialog && (
        <InviteMemberDialog
          open={showInviteDialog}
          onClose={() => setShowInviteDialog(false)}
          onInviteSent={handleInviteSent}
          familyId={familyId || ''}
        />
      )}
    </div>
  );
}