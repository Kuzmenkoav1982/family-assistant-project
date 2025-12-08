import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { getTranslation, type LanguageCode } from '@/translations';

interface TopBarProps {
  isVisible: boolean;
  currentLanguage: LanguageCode;
  currentTheme: string;
  onLogout: () => void;
  onVisibilityChange: (visible: boolean) => void;
  onLanguageChange: (lang: string) => void;
  onThemeChange: (theme: string) => void;
  onResetDemo: () => void;
}

export default function TopBar({
  isVisible,
  currentLanguage,
  currentTheme,
  onLogout,
  onVisibilityChange,
  onLanguageChange,
  onThemeChange,
  onResetDemo
}: TopBarProps) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [kuzyaRole, setKuzyaRole] = useState(() => localStorage.getItem('kuzyaRole') || 'family-assistant');
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const t = (key: keyof typeof import('@/translations').translations.ru) => getTranslation(currentLanguage, key);

  const handleKuzyaRoleChange = (newRole: string) => {
    setKuzyaRole(newRole);
    localStorage.setItem('kuzyaRole', newRole);
  };

  const authToken = localStorage.getItem('authToken');
  const isAuthenticated = !!authToken;

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const themes = [
    { id: 'young', name: 'Молодёжный', icon: '🎨' },
    { id: 'middle', name: 'Деловой', icon: '💼' },
    { id: 'senior', name: 'Комфортный', icon: '🏡' },
    { id: 'apple', name: 'Apple', icon: '🍎' }
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="px-4 py-3 flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          <img 
            src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
            alt="Наша семья"
            className="h-8 w-8 object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="h-9 w-9 p-0"
              title="Выход"
            >
              <Icon name="LogOut" size={18} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/welcome')}
              className="h-9 w-9 p-0"
              title="Вход"
            >
              <Icon name="LogIn" size={18} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            title="Переключатель семьи"
          >
            <Icon name="Users" size={18} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                title="Настройки"
              >
                <Icon name="Settings" size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Icon name="Globe" size={16} className="mr-2" />
                <span>🌐 Язык</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Icon name="Palette" size={16} className="mr-2" />
                <span>🎨 Стиль</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={toggleDarkMode}>
                <Icon name={darkMode ? "Sun" : "Moon"} size={16} className="mr-2" />
                <span>🌙 Тёмная тема</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setSupportDialogOpen(true)}>
                <Icon name="HelpCircle" size={16} className="mr-2" />
                <span>🆘 Поддержка и помощь</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/instructions')}>
                <Icon name="BookOpen" size={16} className="mr-2" />
                <span>📖 Инструкции</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/presentation')}>
                <Icon name="Play" size={16} className="mr-2" />
                <span>🎬 Презентация</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Icon name="UserCircle" size={16} className="mr-2" />
                <span>👤 Мой профиль</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={onResetDemo}>
                <Icon name="RotateCcw" size={16} className="mr-2" />
                <span>🔄 Сбросить демо</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Диалог поддержки */}
      <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>🆘 Поддержка и помощь</DialogTitle>
            <DialogDescription>
              Выберите тип помощи или настройте Кузю
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Настройки Кузи */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="Bot" size={18} />
                Настройки Кузи — AI помощника
              </h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Роль Кузи:</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={kuzyaRole}
                  onChange={(e) => handleKuzyaRoleChange(e.target.value)}
                >
                  <option value="family-assistant">🏡 Семейный помощник (по умолчанию)</option>
                  <option value="cook">🍳 Повар — специалист по рецептам</option>
                  <option value="organizer">📋 Организатор — планирование дел</option>
                  <option value="child-educator">👶 Воспитатель — советы по детям</option>
                  <option value="financial-advisor">💰 Финансовый советник</option>
                  <option value="psychologist">🧠 Семейный психолог</option>
                  <option value="fitness-trainer">💪 Фитнес-тренер</option>
                  <option value="travel-planner">✈️ Организатор путешествий</option>
                </select>
                <p className="text-xs text-gray-600">
                  Выбранная роль определяет специализацию Кузи при ответах на ваши вопросы
                </p>
              </div>
            </div>

            {/* Техническая поддержка */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="Headphones" size={18} />
                Техническая поддержка
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Возникли проблемы с работой приложения? Свяжитесь с нашей службой поддержки
              </p>
              <Button 
                onClick={() => {
                  navigate('/support');
                  setSupportDialogOpen(false);
                }}
                className="w-full"
              >
                Написать в поддержку
              </Button>
            </div>

            {/* Обратная связь */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="MessageSquare" size={18} />
                Обратная связь и предложения
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Поделитесь своими идеями и предложениями по улучшению приложения
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    navigate('/feedback');
                    setSupportDialogOpen(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Жалобы
                </Button>
                <Button 
                  onClick={() => {
                    navigate('/suggestions');
                    setSupportDialogOpen(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Предложения
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}