import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Permission {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface MemberPermissionsProps {
  member: {
    id: string;
    name: string;
    avatar: string;
    permissions?: {
      tasks: boolean;
      calendar: boolean;
      traditions: boolean;
      blog: boolean;
      meals: boolean;
      education: boolean;
      tree: boolean;
      chat: boolean;
      album: boolean;
    };
  };
  onUpdate: (memberId: string, permissions: any) => Promise<void>;
}

const PERMISSIONS: Permission[] = [
  { id: 'tasks', label: 'Задачи', description: 'Просмотр и управление задачами', icon: 'CheckSquare' },
  { id: 'calendar', label: 'Календарь', description: 'Доступ к семейному календарю', icon: 'Calendar' },
  { id: 'traditions', label: 'Традиции', description: 'Просмотр семейных традиций', icon: 'Heart' },
  { id: 'blog', label: 'Блог', description: 'Чтение и написание постов', icon: 'BookOpen' },
  { id: 'meals', label: 'Питание', description: 'Планирование меню и голосование', icon: 'Utensils' },
  { id: 'education', label: 'Образование', description: 'Доступ к образовательным материалам', icon: 'GraduationCap' },
  { id: 'tree', label: 'Древо семьи', description: 'Просмотр генеалогического древа', icon: 'GitBranch' },
  { id: 'chat', label: 'Чат', description: 'Участие в семейном чате', icon: 'MessageCircle' },
  { id: 'album', label: 'Альбом', description: 'Доступ к семейным фотографиям', icon: 'Image' }
];

export default function MemberPermissions({ member, onUpdate }: MemberPermissionsProps) {
  if (!member) return null;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [permissions, setPermissions] = useState(
    member.permissions || {
      tasks: true,
      calendar: true,
      traditions: true,
      blog: true,
      meals: true,
      education: true,
      tree: true,
      chat: true,
      album: true
    }
  );

  const handleToggle = (permissionId: string) => {
    setPermissions(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId as keyof typeof prev]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(member.id, permissions);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Ошибка сохранения доступов');
    } finally {
      setIsSaving(false);
    }
  };

  const enabledCount = Object.values(permissions).filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon name="Shield" size={16} />
          Доступы ({enabledCount}/{PERMISSIONS.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div>
              <div>Управление доступами</div>
              <div className="text-sm font-normal text-gray-500">{member.name}</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Info" size={16} />
                Информация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Настройте какие разделы приложения доступны этому члену семьи. 
                Отключенные разделы не будут отображаться в его интерфейсе.
              </CardDescription>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {PERMISSIONS.map(permission => (
              <Card key={permission.id} className="border-2 hover:border-blue-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Icon name={permission.icon as any} size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={permission.id} className="text-base font-semibold cursor-pointer">
                          {permission.label}
                        </Label>
                        <p className="text-sm text-gray-500">{permission.description}</p>
                      </div>
                    </div>
                    <Switch
                      id={permission.id}
                      checked={permissions[permission.id as keyof typeof permissions]}
                      onCheckedChange={() => handleToggle(permission.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader" className="mr-2 animate-spin" size={16} />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" className="mr-2" size={16} />
                  Сохранить
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}