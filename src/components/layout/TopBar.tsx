import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
  const t = (key: keyof typeof import('@/translations').translations.ru) => getTranslation(currentLanguage, key);

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
    </div>
  );
}
