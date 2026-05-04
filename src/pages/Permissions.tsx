import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import func2url from '@/config/func2url';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  photo_url?: string;
  permissions?: Record<string, boolean>;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const PERMISSIONS: Permission[] = [
  { id: 'view_tasks', name: 'Просмотр задач', description: 'Видеть все задачи семьи', category: 'Задачи' },
  { id: 'create_tasks', name: 'Создание задач', description: 'Создавать новые задачи', category: 'Задачи' },
  { id: 'edit_tasks', name: 'Редактирование задач', description: 'Изменять существующие задачи', category: 'Задачи' },
  { id: 'delete_tasks', name: 'Удаление задач', description: 'Удалять задачи', category: 'Задачи' },
  
  { id: 'view_calendar', name: 'Просмотр календаря', description: 'Видеть семейный календарь', category: 'Календарь' },
  { id: 'create_events', name: 'Создание событий', description: 'Добавлять события в календарь', category: 'Календарь' },
  { id: 'edit_events', name: 'Редактирование событий', description: 'Изменять события', category: 'Календарь' },
  
  { id: 'view_shopping', name: 'Просмотр покупок', description: 'Видеть списки покупок', category: 'Покупки' },
  { id: 'manage_shopping', name: 'Управление покупками', description: 'Добавлять и редактировать покупки', category: 'Покупки' },
  
  { id: 'view_finances', name: 'Просмотр финансов', description: 'Видеть финансовые данные', category: 'Финансы' },
  { id: 'manage_finances', name: 'Управление финансами', description: 'Редактировать бюджет и расходы', category: 'Финансы' },
  
  { id: 'invite_members', name: 'Приглашение участников', description: 'Создавать инвайт-коды', category: 'Управление' },
  { id: 'manage_permissions', name: 'Управление правами', description: 'Изменять права доступа', category: 'Управление' },
];

export default function Permissions() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    if (authToken) {
      loadMembers();
    } else {
      setError('Требуется авторизация');
      setLoading(false);
    }
  }, [authToken]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${func2url['family-members']}?action=list`, {
        headers: { 'X-Auth-Token': authToken || '' },
      });
      const data = await response.json();
      const membersList = data.members || [];
      setMembers(membersList);
      
      if (membersList.length > 0) {
        setSelectedMember(membersList[0]);
        setPermissions(membersList[0].permissions || {});
      }
    } catch {
      setError('Не удалось загрузить участников');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (member: FamilyMember) => {
    setSelectedMember(member);
    setPermissions(member.permissions || {});
    setSuccess('');
    setError('');
  };

  const togglePermission = (permissionId: string) => {
    setPermissions(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId]
    }));
  };

  const savePermissions = async () => {
    if (!selectedMember) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(func2url['family-members'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken || ''
        },
        body: JSON.stringify({
          action: 'update_permissions',
          member_id: selectedMember.id,
          permissions
        })
      });

      if (!response.ok) throw new Error('Ошибка сохранения');

      setSuccess('Права доступа сохранены');
      
      setMembers(prev => prev.map(m => 
        m.id === selectedMember.id ? { ...m, permissions } : m
      ));
    } catch {
      setError('Не удалось сохранить права доступа');
    } finally {
      setSaving(false);
    }
  };

  const categories = [...new Set(PERMISSIONS.map(p => p.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Icon name="Shield" size={36} className="text-blue-600" />
              Права доступа
            </h1>
            <p className="text-gray-600 mt-2">Управление разрешениями для членов семьи</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
            <Icon name="ArrowLeft" size={18} />
            Назад
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <Icon name="AlertCircle" className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50">
            <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Участники</CardTitle>
              <CardDescription>Выберите участника для настройки прав</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map(member => (
                    <button
                      key={member.id}
                      onClick={() => handleMemberSelect(member)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        selectedMember?.id === member.id
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-gray-50 border-2 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center text-xl">
                          {member.avatar || '👤'}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{member.name}</div>
                        <Badge variant="outline" className="text-xs">{member.role}</Badge>
                      </div>
                      {selectedMember?.id === member.id && (
                        <Icon name="Check" size={20} className="text-purple-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {selectedMember ? `Права: ${selectedMember.name}` : 'Выберите участника'}
                  </CardTitle>
                  <CardDescription>Настройте разрешения для выбранного участника</CardDescription>
                </div>
                {selectedMember && (
                  <Button onClick={savePermissions} disabled={saving} className="gap-2">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Icon name="Save" size={18} />
                        Сохранить
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedMember ? (
                <div className="space-y-6">
                  {categories.map(category => (
                    <div key={category}>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Icon name="FolderOpen" size={20} className="text-purple-600" />
                        {category}
                      </h3>
                      <div className="space-y-3 ml-7">
                        {PERMISSIONS.filter(p => p.category === category).map(permission => (
                          <div
                            key={permission.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-sm text-gray-500">{permission.description}</div>
                            </div>
                            <Switch
                              checked={permissions[permission.id] || false}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Icon name="UserCog" className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Выберите участника для настройки прав доступа</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}