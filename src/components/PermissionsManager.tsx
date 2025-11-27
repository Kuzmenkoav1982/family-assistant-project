import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';

interface PermissionsManagerProps {
  member: FamilyMember;
}

const PERMISSION_CONFIG = [
  { key: 'tasks', label: 'Задачи', icon: 'CheckSquare', description: 'Создание и управление задачами' },
  { key: 'calendar', label: 'Календарь', icon: 'Calendar', description: 'Добавление событий в календарь' },
  { key: 'traditions', label: 'Традиции', icon: 'Sparkles', description: 'Создание и редактирование традиций' },
  { key: 'blog', label: 'Блог', icon: 'BookOpen', description: 'Публикация записей в блоге' },
  { key: 'meals', label: 'Меню', icon: 'UtensilsCrossed', description: 'Планирование меню и голосование' },
  { key: 'education', label: 'Образование', icon: 'GraduationCap', description: 'Доступ к образовательным материалам' },
  { key: 'tree', label: 'Древо', icon: 'GitBranch', description: 'Редактирование семейного древа' },
  { key: 'chat', label: 'Чат', icon: 'MessageCircle', description: 'Участие в семейном чате' },
  { key: 'album', label: 'Альбом', icon: 'Image', description: 'Загрузка фото и видео' }
];

export function PermissionsManager({ member }: PermissionsManagerProps) {
  const { updateMember } = useFamilyMembers();
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
  const [isSaving, setIsSaving] = useState(false);

  const togglePermission = (key: string) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateMember({
      id: member.id,
      permissions
    });
    setIsSaving(false);
  };

  const enableAll = () => {
    const allEnabled = PERMISSION_CONFIG.reduce((acc, perm) => ({
      ...acc,
      [perm.key]: true
    }), {} as typeof permissions);
    setPermissions(allEnabled);
  };

  const disableAll = () => {
    const allDisabled = PERMISSION_CONFIG.reduce((acc, perm) => ({
      ...acc,
      [perm.key]: false
    }), {} as typeof permissions);
    setPermissions(allDisabled);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Shield" size={24} />
          Управление правами доступа
        </CardTitle>
        <CardDescription>
          Настройте доступ {member.name} к разделам приложения
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2 mb-4">
          <Button onClick={enableAll} variant="outline" size="sm">
            <Icon name="CheckSquare" size={16} className="mr-2" />
            Включить все
          </Button>
          <Button onClick={disableAll} variant="outline" size="sm">
            <Icon name="Square" size={16} className="mr-2" />
            Выключить все
          </Button>
        </div>

        <div className="grid gap-4">
          {PERMISSION_CONFIG.map(permission => {
            const isEnabled = permissions[permission.key as keyof typeof permissions];
            return (
              <div
                key={permission.key}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-1 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                    <Icon name={permission.icon} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{permission.label}</h4>
                      <Badge variant={isEnabled ? 'default' : 'secondary'} className="text-xs">
                        {isEnabled ? 'Включено' : 'Выключено'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {permission.description}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => togglePermission(permission.key)}
                  variant={isEnabled ? 'default' : 'outline'}
                  size="sm"
                  className="ml-4"
                >
                  {isEnabled ? (
                    <>
                      <Icon name="Check" size={16} className="mr-1" />
                      Вкл
                    </>
                  ) : (
                    <>
                      <Icon name="X" size={16} className="mr-1" />
                      Выкл
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            <Icon name="Save" size={18} className="mr-2" />
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
