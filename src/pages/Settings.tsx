import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { themes } from '@/config/themes';
import type { ThemeType } from '@/types/family.types';
import { languageOptions, type LanguageCode } from '@/translations';
import { useToast } from '@/hooks/use-toast';
import { NotificationsSettings } from '@/components/NotificationsSettings';
import { CalendarExport } from '@/components/CalendarExport';
import SubscriptionTab from '@/components/SubscriptionTab';
import AssistantSettings from '@/components/settings/AssistantSettings';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = useState('family');
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('familyOrganizerTheme');
    return (saved as ThemeType) || 'middle';
  });
  
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem('familyOrganizerLanguage') as LanguageCode) || 'ru';
  });
  
  useEffect(() => {
    localStorage.setItem('familyOrganizerTheme', currentTheme);
    
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    window.dispatchEvent(new CustomEvent('themeChange', { detail: currentTheme }));
  }, [currentTheme]);

  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    localStorage.setItem('familyOrganizerLanguage', lang);
    toast({
      title: 'Язык изменён',
      description: `Язык интерфейса: ${languageOptions[lang]}`
    });
    setTimeout(() => window.location.reload(), 500);
  };

  const sections = [
    { id: 'family', icon: 'Users', label: 'Семья' },
    { id: 'notifications', icon: 'Bell', label: 'Уведомления' },
    { id: 'subscription', icon: 'CreditCard', label: 'Подписка' },
    { id: 'appearance', icon: 'Palette', label: 'Внешний вид' },
    { id: 'assistants', icon: 'Bot', label: 'Ассистенты' },
    { id: 'account', icon: 'User', label: 'Аккаунт' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ⚙️ Настройки
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
                  onClick={() => setActiveSection(section.id)}
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
                      👥 Семья
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Название семьи</Label>
                      <Input placeholder="Наша Семья" defaultValue="Наша Семья" />
                    </div>
                    <div className="space-y-2">
                      <Label>Логотип семьи</Label>
                      <div className="flex items-center gap-4">
                        <img 
                          src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
                          alt="Логотип"
                          className="h-16 w-16 object-cover rounded-lg border"
                        />
                        <Button variant="outline" size="sm">
                          <Icon name="Upload" size={16} className="mr-2" />
                          Изменить логотип
                        </Button>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate('/family-invite')}
                    >
                      <Icon name="UserPlus" size={18} />
                      Приглашения и инвайт-коды
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate('/permissions')}
                    >
                      <Icon name="Shield" size={18} />
                      Управление правами доступа
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === 'notifications' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Bell" size={24} className="text-orange-600" />
                      🔔 Уведомления
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NotificationsSettings />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Mail" size={24} className="text-blue-600" />
                      Email-рассылка
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Еженедельный дайджест</Label>
                        <p className="text-sm text-gray-500">Получайте сводку по делам семьи раз в неделю</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Важные уведомления</Label>
                        <p className="text-sm text-gray-500">События, требующие внимания</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Send" size={24} className="text-blue-600" />
                      Telegram-бот
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Получайте уведомления в Telegram
                    </p>
                    <Button variant="outline" className="w-full">
                      <Icon name="Send" size={16} className="mr-2" />
                      Подключить Telegram
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === 'subscription' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="CreditCard" size={24} className="text-green-600" />
                    💳 Подписка
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SubscriptionTab />
                </CardContent>
              </Card>
            )}

            {activeSection === 'appearance' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Moon" size={24} className="text-purple-600" />
                      🌙 Тёмная тема
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Тёмная тема</Label>
                        <p className="text-sm text-gray-500">Комфортный режим для глаз</p>
                      </div>
                      <Switch 
                        checked={currentTheme === 'dark'}
                        onCheckedChange={(checked) => {
                          const newTheme = checked ? 'dark' : 'middle';
                          setCurrentTheme(newTheme);
                          toast({
                            title: checked ? 'Тёмная тема включена' : 'Светлая тема включена'
                          });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Palette" size={24} className="text-pink-600" />
                      🎨 Тема оформления
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Label className="text-base font-semibold">Выберите стиль оформления</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(themes).filter(([key]) => key !== 'dark').map(([key, theme]) => {
                        if (!theme || !theme.colors) return null;
                        
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setCurrentTheme(key as ThemeType);
                              toast({
                                title: 'Стиль изменён',
                                description: `Применён стиль "${theme.name}"`
                              });
                              setTimeout(() => window.location.reload(), 500);
                            }}
                            className={`
                              relative p-4 rounded-lg border-2 transition-all text-left
                              ${currentTheme === key 
                                ? 'border-purple-500 bg-purple-50 shadow-lg' 
                                : 'border-gray-200 hover:border-purple-300'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-12 h-12 rounded-lg shadow-md"
                                style={{ 
                                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                                }}
                              />
                              <div className="flex-1">
                                <div className="font-semibold">{theme.name}</div>
                                <div className="text-sm text-gray-500">{theme.description}</div>
                              </div>
                              {currentTheme === key && (
                                <Icon name="Check" className="text-purple-600" size={20} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Globe" size={24} className="text-blue-600" />
                      🌍 Язык интерфейса
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>Выберите язык</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(languageOptions).map(([code, name]) => (
                          <Button
                            key={code}
                            variant={currentLanguage === code ? 'default' : 'outline'}
                            onClick={() => handleLanguageChange(code as LanguageCode)}
                            className="justify-start"
                          >
                            {name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === 'assistants' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-orange-600" />
                      🏠 Мой AI-ассистент
                    </CardTitle>
                    <p className="text-sm text-gray-500">Управление настройками вашего помощника</p>
                  </CardHeader>
                  <CardContent>
                    <AssistantSettings />
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Mic" size={24} className="text-purple-600" />
                      🎤 Яндекс.Алиса
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Управляйте своими делами голосом через Яндекс.Алису
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 border-purple-300 hover:bg-purple-50"
                      onClick={() => navigate('/alice')}
                    >
                      <Icon name="Mic" size={18} className="text-purple-600" />
                      Настроить интеграцию с Алисой
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === 'account' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="User" size={24} className="text-purple-600" />
                      👤 Аккаунт
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        toast({
                          title: 'В разработке',
                          description: 'Функция смены пароля скоро будет доступна'
                        });
                      }}
                    >
                      <Icon name="Lock" size={18} />
                      🔐 Изменить пароль
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        toast({
                          title: 'В разработке',
                          description: '2FA будет доступна в следующем обновлении'
                        });
                      }}
                    >
                      <Icon name="Shield" size={18} />
                      🛡️ Двухфакторная аутентификация
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        const data = {
                          exportDate: new Date().toISOString(),
                          familyData: localStorage.getItem('userData'),
                          members: localStorage.getItem('familyMembers'),
                          tasks: localStorage.getItem('tasks')
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `family-data-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        toast({
                          title: 'Экспорт завершен',
                          description: 'Данные сохранены в файл'
                        });
                      }}
                    >
                      <Icon name="Download" size={18} />
                      📥 Экспорт данных
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Calendar" size={24} className="text-blue-600" />
                      📅 Экспорт календаря
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CalendarExport />
                  </CardContent>
                </Card>

                <Card className="border-2 border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Icon name="Trash2" size={24} />
                      🗑️ Удаление аккаунта
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Это действие необратимо. Все данные будут удалены.
                    </p>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => {
                        if (confirm('Вы уверены? Это действие необратимо!')) {
                          toast({
                            title: 'В разработке',
                            description: 'Функция удаления аккаунта скоро будет доступна',
                            variant: 'destructive'
                          });
                        }
                      }}
                    >
                      <Icon name="Trash2" size={18} className="mr-2" />
                      Удалить аккаунт
                    </Button>
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
