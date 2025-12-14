import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { NotificationsSettings } from '@/components/NotificationsSettings';
import { CalendarExport } from '@/components/CalendarExport';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import func2url from '../../backend/func2url.json';
import { themes } from '@/config/themes';
import type { ThemeType } from '@/types/family.types';
import { languageOptions, type LanguageCode } from '@/translations';

export default function Settings() {
  console.log('[Settings] Component mounted, themes:', themes);
  console.log('[Settings] Theme keys:', Object.keys(themes));
  console.log('[Settings] First theme:', themes.young);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [familyName, setFamilyName] = useState('');
  const [familyLogo, setFamilyLogo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as ThemeType) || 'young';
  });
  
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem('familyOrganizerLanguage') as LanguageCode) || 'ru';
  });
  
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  
  const token = localStorage.getItem('authToken');
  
  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);
  
  useEffect(() => {
    const loadFamilyData = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(func2url['family-data'], {
          headers: { 'X-Auth-Token': token }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.family) {
            setFamilyName(data.family.name || '');
            setFamilyLogo(data.family.logo_url || '');
          }
        }
      } catch (error) {
        console.error('Failed to load family data:', error);
      }
    };
    
    loadFamilyData();
  }, [token]);

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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={24} className="text-orange-600" />
              Информация о семье
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Название семьи</Label>
              <Input
                id="familyName"
                placeholder="Например: Семья Ивановых"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Логотип семьи</Label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <p className="text-sm text-gray-700 mb-2">
                  💡 <strong>Как добавить логотип:</strong>
                </p>
                <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal">
                  <li>Загрузите изображение на <a href="https://imgbb.com" target="_blank" className="text-blue-600 hover:underline">ImgBB.com</a> (бесплатно, без регистрации)</li>
                  <li>Скопируйте прямую ссылку на изображение</li>
                  <li>Вставьте ссылку в поле ниже</li>
                </ol>
              </div>
              <Input
                id="familyLogo"
                placeholder="https://i.ibb.co/ваше-изображение.png"
                value={familyLogo}
                onChange={(e) => setFamilyLogo(e.target.value)}
                disabled={isUploading}
                className="mb-2"
              />
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">Или загрузите файл (экспериментально)</summary>
                <Input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        title: 'Ошибка',
                        description: 'Размер файла не должен превышать 5 МБ',
                        variant: 'destructive'
                      });
                      return;
                    }
                    
                    setIsUploading(true);
                    try {
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const base64 = (reader.result as string).split(',')[1];
                        
                        const response = await fetch(func2url['upload-file'], {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'X-Auth-Token': token || ''
                          },
                          body: JSON.stringify({
                            file: base64,
                            fileName: file.name,
                            folder: 'family-logos'
                          })
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok && data.url) {
                          setFamilyLogo(data.url);
                          toast({
                            title: 'Успешно!',
                            description: 'Логотип загружен'
                          });
                        } else {
                          throw new Error(data.error || 'Ошибка загрузки');
                        }
                        
                        setIsUploading(false);
                      };
                      
                      reader.onerror = () => {
                        toast({
                          title: 'Ошибка',
                          description: 'Не удалось прочитать файл',
                          variant: 'destructive'
                        });
                        setIsUploading(false);
                      };
                      
                      reader.readAsDataURL(file);
                    } catch (error) {
                      toast({
                        title: 'Ошибка',
                        description: String(error),
                        variant: 'destructive'
                      });
                      setIsUploading(false);
                    }
                  }}
                  disabled={isUploading}
                />
              </details>
              {familyLogo && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Предпросмотр:</p>
                  <img 
                    src={familyLogo} 
                    alt="Логотип семьи" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
            </div>
            
            <Button 
              onClick={async () => {
                if (!familyName && !familyLogo) {
                  toast({
                    title: 'Ошибка',
                    description: 'Заполните хотя бы одно поле',
                    variant: 'destructive'
                  });
                  return;
                }

                setIsLoading(true);
                try {
                  const response = await fetch(func2url['family-data'], {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Auth-Token': token || ''
                    },
                    body: JSON.stringify({
                      name: familyName || undefined,
                      logoUrl: familyLogo || undefined
                    })
                  });

                  const data = await response.json();

                  if (response.ok && data.success) {
                    toast({
                      title: 'Успешно!',
                      description: 'Информация о семье обновлена'
                    });
                    
                    const userData = localStorage.getItem('userData');
                    if (userData) {
                      const user = JSON.parse(userData);
                      user.family_name = familyName;
                      user.logo_url = familyLogo;
                      localStorage.setItem('userData', JSON.stringify(user));
                    }
                  } else {
                    throw new Error(data.error || 'Ошибка обновления');
                  }
                } catch (error) {
                  toast({
                    title: 'Ошибка',
                    description: String(error),
                    variant: 'destructive'
                  });
                } finally {
                  setIsLoading(false);
                }
              }} 
              disabled={isLoading || isUploading}
              className="w-full"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить информацию о семье'}
            </Button>
          </CardContent>
        </Card>

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
            <div className="space-y-2">
              <Label className="text-base font-semibold">Выберите стиль оформления</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(themes).map(([key, theme]) => {
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
                          <Icon name="Palette" size={24} className="text-white" />
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