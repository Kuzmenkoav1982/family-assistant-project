import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { NotificationsSettings } from '@/components/NotificationsSettings';
import { CalendarExport } from '@/components/CalendarExport';
import { useState, useEffect } from 'react';
import { themes } from '@/config/themes';
import type { ThemeType } from '@/types/family.types';
import { languageOptions, type LanguageCode } from '@/translations';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  console.log('[Settings] Component mounted, themes:', themes);
  console.log('[Settings] Theme keys:', Object.keys(themes));
  console.log('[Settings] First theme:', themes.middle);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('familyOrganizerTheme');
    return (saved as ThemeType) || 'middle';
  });
  
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem('familyOrganizerLanguage') as LanguageCode) || 'ru';
  });
  
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  
  useEffect(() => {
    localStorage.setItem('familyOrganizerTheme', currentTheme);
    
    // Применяем тему мгновенно без перезагрузки
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Отправляем кастомное событие для синхронизации с другими компонентами
    window.dispatchEvent(new CustomEvent('themeChange', { detail: currentTheme }));
  }, [currentTheme]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
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

        <NotificationsSettings />

        <CalendarExport />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="User" size={24} className="text-purple-600" />
              Профиль и безопасность
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
              Изменить пароль
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
              Двухфакторная аутентификация
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
              Экспорт данных
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Palette" size={24} className="text-pink-600" />
              Внешний вид
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Режим отображения</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setCurrentTheme('middle');
                    toast({
                      title: 'Светлая тема',
                      description: 'Применён светлый режим'
                    });
                  }}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all text-left
                    ${currentTheme !== 'dark'
                      ? 'border-purple-500 bg-purple-50 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Icon name="Sun" size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">Светлая</h4>
                      <p className="text-xs text-gray-600">Дневной режим</p>
                    </div>
                    {currentTheme !== 'dark' && (
                      <div className="absolute top-2 right-2">
                        <Icon name="Check" size={20} className="text-purple-600" />
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentTheme('dark');
                    toast({
                      title: 'Тёмная тема',
                      description: 'Применён ночной режим'
                    });
                  }}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all text-left
                    ${currentTheme === 'dark'
                      ? 'border-purple-500 bg-purple-50 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
                      <Icon name="Moon" size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">Тёмная</h4>
                      <p className="text-xs text-gray-600">Ночной режим</p>
                    </div>
                    {currentTheme === 'dark' && (
                      <div className="absolute top-2 right-2">
                        <Icon name="Check" size={20} className="text-purple-600" />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Стиль оформления (для светлой темы)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(themes).filter(([key]) => key !== 'dark').map(([key, theme]) => {
                  console.log(`[Settings] Rendering theme ${key}:`, theme);
                  
                  if (!theme || !theme.colors) {
                    console.error(`[Settings] Theme ${key} is invalid:`, theme);
                    return null;
                  }
                  
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
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          w-12 h-12 rounded-lg bg-gradient-to-r ${theme.colors.primary} 
                          flex items-center justify-center flex-shrink-0
                        `}>
                          <Icon name={key === 'dark' ? 'Moon' : 'Palette'} size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{theme.name}</h4>
                          <p className="text-xs text-gray-600 mb-1">{theme.description}</p>
                          <p className="text-xs text-gray-500">{theme.ageRange}</p>
                        </div>
                        {currentTheme === key && (
                          <div className="absolute top-2 right-2">
                            <Icon name="Check" size={20} className="text-purple-600" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => setShowLanguageDialog(true)}
              >
                <Icon name="Languages" size={18} />
                Язык интерфейса
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" size={24} className="text-blue-600" />
              О приложении
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Версия</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/instructions')}
            >
              <Icon name="BookOpen" size={18} />
              📖 Инструкции
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/privacy-policy')}
            >
              <Icon name="FileText" size={18} />
              Политика конфиденциальности
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/terms-of-service')}
            >
              <Icon name="HelpCircle" size={18} />
              Справка и поддержка
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Languages" size={24} />
              Выберите язык
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {languageOptions.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setCurrentLanguage(lang.code);
                  localStorage.setItem('familyOrganizerLanguage', lang.code);
                  toast({
                    title: 'Язык изменён',
                    description: `Выбран язык: ${lang.name}`
                  });
                  setShowLanguageDialog(false);
                  setTimeout(() => window.location.reload(), 500);
                }}
                className={`
                  w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-lg
                  ${currentLanguage === lang.code 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </div>
                  {currentLanguage === lang.code && (
                    <Icon name="Check" className="text-blue-600" size={20} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}