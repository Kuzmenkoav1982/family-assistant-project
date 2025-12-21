import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import FamilyInviteManager from '@/components/FamilyInviteManager';
import { NotificationsSettings } from '@/components/NotificationsSettings';
import AccessControlManager from '@/components/AccessControlManager';

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
    { id: 'appearance', icon: 'Palette', label: 'Внешний вид', path: '' },
    { id: 'account', icon: 'UserCog', label: 'Аккаунт', path: '' },
    { id: 'assistants', icon: 'Bot', label: 'Ассистенты', path: '' },
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

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Shield" size={24} className="text-green-600" />
                      Управление правами доступа
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Настройте роли и права для членов семьи
                    </p>
                  </CardHeader>
                  <CardContent>
                    <AccessControlManager />
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

            {activeSection === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Palette" size={24} />
                    Внешний вид
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Настройте оформление приложения под свой вкус
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                      <Icon name="Moon" size={18} />
                      Тёмная тема
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <p className="font-medium">Тёмный режим</p>
                        <p className="text-sm text-muted-foreground">Снижает нагрузку на глаза в тёмное время</p>
                      </div>
                      <Button variant="outline">
                        Переключить
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                      <Icon name="Paintbrush" size={18} />
                      Тема оформления
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                        <div className="w-full h-12 rounded bg-gradient-to-r from-orange-400 to-pink-500"></div>
                        <span>Тёплая</span>
                      </Button>
                      <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                        <div className="w-full h-12 rounded bg-gradient-to-r from-blue-400 to-cyan-500"></div>
                        <span>Холодная</span>
                      </Button>
                      <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                        <div className="w-full h-12 rounded bg-gradient-to-r from-purple-400 to-pink-500"></div>
                        <span>Яркая</span>
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                      <Icon name="Languages" size={18} />
                      Язык интерфейса
                    </h3>
                    <div className="flex gap-2">
                      <Button variant="default">Русский</Button>
                      <Button variant="outline">English</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'assistants' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Bot" size={24} />
                    Ассистенты
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Управление AI-помощниками и интеграциями
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
                        <Icon name="Sparkles" size={24} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Мой AI-ассистент</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Управление настройками вашего персонального помощника
                        </p>
                        <Button variant="outline" className="gap-2">
                          <Icon name="Settings" size={16} />
                          Настроить ассистента
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                        <Icon name="Mic" size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">Яндекс.Алиса</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Управляйте своими делами голосом через Яндекс.Алису
                        </p>
                        <Button variant="outline" className="gap-2">
                          <Icon name="Link" size={16} />
                          Подключить Алису
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'account' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Key" size={24} />
                      Безопасность
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Управление паролем и доступом к аккаунту
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                        <Icon name="Lock" size={18} />
                        Изменить пароль
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="current-password">Текущий пароль</Label>
                          <Input id="current-password" type="password" placeholder="••••••••" />
                        </div>
                        <div>
                          <Label htmlFor="new-password">Новый пароль</Label>
                          <Input id="new-password" type="password" placeholder="••••••••" />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
                          <Input id="confirm-password" type="password" placeholder="••••••••" />
                        </div>
                        <Button className="gap-2">
                          <Icon name="Check" size={16} />
                          Сохранить новый пароль
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                        <Icon name="Shield" size={18} />
                        Двухфакторная аутентификация
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Добавьте дополнительный уровень защиты вашего аккаунта
                      </p>
                      <Button variant="outline" className="gap-2">
                        <Icon name="ShieldCheck" size={16} />
                        Настроить 2FA
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Download" size={24} />
                      Экспорт данных
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Скачайте копию ваших данных
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold mb-2">Экспорт всех данных</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Получите архив со всеми данными семьи, задачами, фотографиями и статистикой
                      </p>
                      <Button variant="outline" className="gap-2">
                        <Icon name="FileArchive" size={16} />
                        Скачать архив данных
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-base font-semibold mb-2">Экспорт календаря</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Экспортируйте события в формате .ics для импорта в Google Calendar, Apple Calendar и другие
                      </p>
                      <Button variant="outline" className="gap-2">
                        <Icon name="Calendar" size={16} />
                        Скачать .ics файл
                      </Button>
                    </div>
                  </CardContent>
                </Card>

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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}