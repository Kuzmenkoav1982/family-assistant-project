import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import FamilyInviteManager from '@/components/FamilyInviteManager';
import { NotificationsSettings } from '@/components/NotificationsSettings';

export default function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('family');
  const [familyName, setFamilyName] = useState('Наша Семья "Кузьменко"');
  const [familyLogo, setFamilyLogo] = useState('https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/family-logos/2025-12-21_00-39-51.png');

  const handleSaveChanges = () => {
    localStorage.setItem('familyName', familyName);
    localStorage.setItem('familyLogo', familyLogo);
    alert('✅ Изменения сохранены');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('⚠️ Вы уверены? Это действие удалит все данные без возможности восстановления!')) {
      return;
    }
    
    const confirmed = confirm('Все члены семьи будут удалены\nВсе задачи и достижения будут потеряны\nИстория и статистика будут стёрты\nВосстановление будет невозможно\n\nПродолжить?');
    
    if (confirmed) {
      try {
        const authToken = localStorage.getItem('authToken') || '';
        const AUTH_API = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';
        
        const response = await fetch(`${AUTH_API}?action=delete_account`, {
          method: 'POST',
          headers: {
            'X-Auth-Token': authToken
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert('✅ Аккаунт успешно удалён');
          localStorage.clear();
          window.location.href = '/auth';
        } else {
          alert(`❌ ${data.error}`);
        }
      } catch (error) {
        alert('❌ Ошибка удаления аккаунта');
      }
    }
  };

  const sections = [
    { id: 'family', icon: 'Users', label: 'Семья', path: '' },
    { id: 'notifications', icon: 'Bell', label: 'Уведомления', path: '' },
    { id: 'subscription', icon: 'CreditCard', label: 'Подписка', path: '/pricing' },
    { id: 'account', icon: 'UserCog', label: 'Аккаунт', path: '' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Icon name="Settings" size={36} />
              Настройки
            </h1>
            <p className="text-gray-600 mt-2">Управление приложением и уведомлениями</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
            <Icon name="ArrowLeft" size={18} />
            На главную
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Разделы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    if (section.path) {
                      navigate(section.path);
                    } else {
                      setActiveSection(section.id);
                    }
                  }}
                >
                  <Icon name={section.icon as any} size={18} />
                  {section.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            {activeSection === 'family' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Users" size={24} className="text-blue-600" />
                      Настройки семьи
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Название и логотип вашей семьи
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Название семьи</Label>
                      <Input 
                        placeholder="Наша Семья" 
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Логотип семьи</Label>
                      <p className="text-xs text-orange-600 flex items-center gap-2">
                        <Icon name="AlertCircle" size={14} />
                        Используйте прямую ссылку на изображение (файлы заканчиваются на .jpg, .png, .gif) или загрузите файл ниже
                      </p>
                      <Input 
                        placeholder="https://cdn.poehali.dev/projects/..." 
                        value={familyLogo}
                        onChange={(e) => setFamilyLogo(e.target.value)}
                      />
                      <div className="flex items-center gap-4">
                        {familyLogo && (
                          <img 
                            src={familyLogo}
                            alt="Логотип"
                            className="h-20 w-20 object-cover rounded-lg border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="text-center flex-1">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Icon name="Upload" size={16} />
                            Перетащите изображение сюда
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            или нажмите для выбора файла
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF (макс. 5 МБ)
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleSaveChanges} className="w-full">
                      Сохранить изменения
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Users" size={24} className="text-purple-600" />
                      Приглашения в семью
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Создавайте коды для приглашения родственников
                    </p>
                  </CardHeader>
                  <CardContent>
                    <FamilyInviteManager />
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Bell" size={24} className="text-orange-600" />
                    Уведомления
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NotificationsSettings />
                </CardContent>
              </Card>
            )}

            {activeSection === 'account' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="AlertTriangle" size={24} className="text-red-600" />
                    Опасная зона
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Необратимые действия с вашим аккаунтом
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-6 border border-red-200 dark:border-red-900">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-100 dark:bg-red-900 rounded-full p-3">
                        <Icon name="Trash2" size={24} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                          Удалить аккаунт
                        </h3>
                        <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                          Это действие удалит ваш аккаунт и все связанные данные без возможности восстановления:
                        </p>
                        <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 mb-4">
                          <li className="flex items-center gap-2">
                            <Icon name="X" size={14} />
                            Все члены семьи будут удалены
                          </li>
                          <li className="flex items-center gap-2">
                            <Icon name="X" size={14} />
                            Все задачи и достижения будут потеряны
                          </li>
                          <li className="flex items-center gap-2">
                            <Icon name="X" size={14} />
                            История и статистика будут стёрты
                          </li>
                          <li className="flex items-center gap-2">
                            <Icon name="X" size={14} />
                            Восстановление будет невозможно
                          </li>
                        </ul>
                        <Button 
                          onClick={handleDeleteAccount}
                          variant="destructive" 
                          className="w-full gap-2"
                        >
                          <Icon name="Trash2" size={16} />
                          Удалить аккаунт навсегда
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}