import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import FamilyInviteManager from '@/components/FamilyInviteManager';
import { NotificationsSettings } from '@/components/NotificationsSettings';
import AccessControlManager from '@/components/AccessControlManager';
import ExportSettings from '@/components/settings/ExportSettings';
import AccountSettings from '@/components/settings/AccountSettings';
import AssistantSettings from '@/components/settings/AssistantSettings';
import { CalendarExport } from '@/components/CalendarExport';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useTasks } from '@/hooks/useTasks';
import { ImageCropDialog } from '@/components/ImageCropDialog';

export default function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('family');
  const [familyName, setFamilyName] = useState(() => {
    return localStorage.getItem('familyName') || 'Наша Семья';
  });
  const [familyLogo, setFamilyLogo] = useState(() => {
    return localStorage.getItem('familyLogo') || 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/family-logos/2025-12-21_00-39-51.png';
  });
  const [familyBanner, setFamilyBanner] = useState(() => {
    return localStorage.getItem('familyBanner') || '';
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [bannerFileBase64, setBannerFileBase64] = useState('');
  const [tempImageSrc, setTempImageSrc] = useState('');
  const [croppedImageBase64, setCroppedImageBase64] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('familyLanguage');
    return saved || 'ru';
  });
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('familyOrganizerTheme');
    return saved || 'middle';
  });
  const [themeChanging, setThemeChanging] = useState(false);

  const { members: familyMembers } = useFamilyMembersContext();
  const { tasks } = useTasks();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempImageSrc(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setBannerFileBase64(base64);
      setFamilyBanner(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBase64: string) => {
    setCroppedImageBase64(croppedBase64);
    setFamilyLogo(croppedBase64);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const authToken = localStorage.getItem('authToken') || '';
      const FAMILY_SETTINGS_API = 'https://functions.poehali.dev/444bfdad-3354-44c6-95cb-c58ad7c8e4ea';

      const payload: { name: string; logoBase64?: string; bannerBase64?: string } = {
        name: familyName
      };

      if (croppedImageBase64) {
        payload.logoBase64 = croppedImageBase64;
      }

      if (bannerFileBase64) {
        payload.bannerBase64 = bannerFileBase64;
      }

      const response = await fetch(FAMILY_SETTINGS_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('familyName', familyName);
        if (data.family?.logo_url) {
          localStorage.setItem('familyLogo', data.family.logo_url);
          setFamilyLogo(data.family.logo_url);
        }
        if (data.family?.banner_url) {
          localStorage.setItem('familyBanner', data.family.banner_url);
          setFamilyBanner(data.family.banner_url);
        }
        
        // Обновляем userData для других компонентов
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            user.family_name = familyName;
            if (data.family?.logo_url) {
              user.logo_url = data.family.logo_url;
            }
            if (data.family?.banner_url) {
              user.banner_url = data.family.banner_url;
            }
            localStorage.setItem('userData', JSON.stringify(user));
          } catch (e) {
            console.error('Error updating userData:', e);
          }
        }
        
        // Dispatch события для обновления главной страницы
        window.dispatchEvent(new Event('familySettingsUpdated'));
        
        alert('✅ Изменения сохранены');
        setCroppedImageBase64('');
        setBannerFileBase64('');
      } else {
        alert(`❌ Ошибка: ${data.error || 'Не удалось сохранить'}`);
      }
    } catch (error) {
      alert('❌ Ошибка сохранения');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
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
        window.location.href = '/login';
      } else {
        throw new Error(data.error || 'Ошибка удаления');
      }
    } catch (error) {
      const err = error as Error;
      alert(`❌ ${err.message || 'Ошибка удаления аккаунта'}`);
      throw error;
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      if (format === 'csv') {
        // CSV Export
        const csvData = [
          ['Имя', 'Роль', 'Баллы', 'Уровень', 'Загрузка'],
          ...familyMembers.map((m) => [
            m.name,
            m.role,
            m.points || 0,
            m.level || 1,
            m.workload || 0
          ])
        ];
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `family_data_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        alert('✅ CSV файл скачан');
      } else if (format === 'pdf') {
        alert('📄 PDF экспорт будет доступен в следующей версии');
      }
    } catch (error) {
      alert('❌ Ошибка экспорта данных');
    } finally {
      setIsExporting(false);
    }
  };

  const handleThemeChange = (theme: string) => {
    setThemeChanging(true);
    setCurrentTheme(theme);
    localStorage.setItem('familyOrganizerTheme', theme);
    
    setTimeout(() => {
      setThemeChanging(false);
      window.location.reload();
    }, 600);
  };

  const handleDarkModeToggle = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem('darkMode', String(newValue));
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem('familyLanguage', lang);
  };

  const sections = [
    { id: 'family', icon: 'Users', label: 'Семья', path: '' },
    { id: 'notifications', icon: 'Bell', label: 'Уведомления', path: '' },
    { id: 'subscription', icon: 'CreditCard', label: 'Подписка', path: '/pricing' },
    { id: 'appearance', icon: 'Palette', label: 'Внешний вид', path: '' },
    { id: 'account', icon: 'UserCog', label: 'Аккаунт', path: '' },
    { id: 'assistants', icon: 'Bot', label: 'Ассистенты', path: '' },
  ];

  const themes = [
    { 
      id: 'middle', 
      name: 'Деловой', 
      description: 'Сдержанные тона и бизнес-стиль',
      ageRange: '21-45 лет',
      gradient: 'from-slate-600 to-slate-800',
      icon: '💼'
    },
    { 
      id: 'mono', 
      name: 'Монохром', 
      description: 'Элегантный стиль с геометрией и серыми тонами',
      ageRange: 'Премиум',
      gradient: 'from-gray-900 to-gray-800',
      icon: '🎨'
    },
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
                  <Icon name={section.icon} size={18} />
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
                      <Icon name="Users" size={24} />
                      Настройки семьи
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="familyName">Название семьи</Label>
                        <Input
                          id="familyName"
                          value={familyName}
                          onChange={(e) => setFamilyName(e.target.value)}
                          placeholder="Например: Семья Ивановых"
                        />
                      </div>

                      <div>
                        <Label>Логотип семьи</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-50">
                            {familyLogo ? (
                              <img src={familyLogo} alt="Family logo" className="w-full h-full object-cover" />
                            ) : (
                              <Icon name="Users" size={32} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="logoUpload"
                            />
                            <label htmlFor="logoUpload">
                              <Button variant="outline" className="cursor-pointer" asChild>
                                <span>
                                  <Icon name="Upload" size={16} className="mr-2" />
                                  Загрузить изображение
                                </span>
                              </Button>
                            </label>
                            <p className="text-xs text-muted-foreground">
                              После выбора файла откроется редактор для кадрирования
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Баннер главной страницы</Label>
                        <p className="text-xs text-muted-foreground mb-2">Горизонтальное фото семьи, отображается вверху главного экрана</p>
                        <div className="flex flex-col gap-3">
                          <div className="w-full h-32 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                            {familyBanner ? (
                              <img src={familyBanner} alt="Family banner" className="w-full h-full object-cover object-center" />
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-gray-400">
                                <Icon name="Image" size={28} />
                                <span className="text-xs">Баннер не загружен</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBannerSelect}
                              className="hidden"
                              id="bannerUpload"
                            />
                            <label htmlFor="bannerUpload">
                              <Button variant="outline" className="cursor-pointer" asChild>
                                <span>
                                  <Icon name="Upload" size={16} className="mr-2" />
                                  Загрузить баннер
                                </span>
                              </Button>
                            </label>
                            {familyBanner && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => {
                                  setFamilyBanner('');
                                  setBannerFileBase64('');
                                }}
                              >
                                <Icon name="Trash2" size={14} className="mr-1" />
                                Сбросить
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Рекомендуется горизонтальное фото (16:9). Все члены семьи должны быть видны.
                          </p>
                        </div>
                      </div>

                      <Button 
                        onClick={handleSaveChanges} 
                        disabled={isSaving}
                        className="w-full"
                      >
                        {isSaving ? (
                          <>
                            <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            <Icon name="Save" size={16} className="mr-2" />
                            Сохранить изменения
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <FamilyInviteManager />
                <AccessControlManager />
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
                      <Switch checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                      <Icon name="Paintbrush" size={18} />
                      Стиль оформления
                    </h3>
                    
                    {themeChanging && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
                        <div className="animate-spin">
                          <Icon name="Loader2" size={18} className="text-blue-600" />
                        </div>
                        <span className="text-sm text-blue-700 dark:text-blue-300">Применяем новую тему...</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {themes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => handleThemeChange(theme.id)}
                          disabled={themeChanging}
                          className={`p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                            currentTheme === theme.id
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg scale-[1.02]'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md'
                          } ${themeChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{theme.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{theme.name}</span>
                                {currentTheme === theme.id && (
                                  <Icon name="Check" className="text-purple-600" size={24} />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{theme.description}</p>
                              <span className="text-xs text-gray-500 dark:text-gray-500">{theme.ageRange}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                      <Icon name="Languages" size={18} />
                      Язык интерфейса
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant={currentLanguage === 'ru' ? 'default' : 'outline'}
                        onClick={() => handleLanguageChange('ru')}
                      >
                        Русский
                      </Button>
                      <Button
                        variant={currentLanguage === 'en' ? 'default' : 'outline'}
                        onClick={() => handleLanguageChange('en')}
                      >
                        English
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'assistants' && (
              <>
                <AssistantSettings />
                
                {/* Яндекс Алиса интеграция */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Mic" size={24} className="text-purple-600" />
                      Яндекс Алиса
                    </CardTitle>
                    <CardDescription>
                      Управляйте семейными делами голосом через Яндекс Станцию или приложение Алиса
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Icon name="Sparkles" size={18} className="text-purple-600" />
                        Возможности навыка
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Добавление задач и напоминаний голосом</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Просмотр списка дел на сегодня</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Добавление продуктов в список покупок</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Просмотр ближайших событий</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Icon name="Info" size={18} />
                        Как подключить
                      </h4>
                      <ol className="space-y-2 text-sm list-decimal list-inside">
                        <li>Откройте приложение "Яндекс" или скажите "Алиса" на Яндекс Станции</li>
                        <li>Скажите: <strong>"Алиса, запусти навык Семейный Ассистент"</strong></li>
                        <li>Следуйте инструкциям для привязки аккаунта</li>
                      </ol>
                    </div>

                    <Button 
                      onClick={() => window.open('https://dialogs.yandex.ru/store/skills/', '_blank')}
                      className="w-full"
                    >
                      <Icon name="ExternalLink" className="mr-2" size={18} />
                      Открыть каталог навыков Алисы
                    </Button>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-800 flex items-start gap-2">
                        <Icon name="AlertTriangle" size={16} className="mt-0.5 flex-shrink-0" />
                        <span>
                          Для работы навыка нужно авторизоваться через Яндекс ID. 
                          Ваши данные защищены и не передаются третьим лицам.
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === 'account' && (
              <>
                <ExportSettings isExporting={isExporting} onExport={handleExport} />
                <CalendarExport />
                <AccountSettings onDeleteAccount={handleDeleteAccount} />
              </>
            )}
          </div>
        </div>

        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
        />
      </div>
    </div>
  );
}