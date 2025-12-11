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
import SettingsMenu from '@/components/SettingsMenu';

const APP_VERSION = '1.2.0';

interface TopBarProps {
  isVisible: boolean;
  currentLanguage: LanguageCode;
  currentTheme: string;
  onLogout: () => void;
  onVisibilityChange: (visible: boolean) => void;
  onLanguageChange: (lang: string) => void;
  onThemeChange: (theme: string) => void;
  onResetDemo: () => void;
  onMenuClick?: () => void;
}

export default function TopBar({
  isVisible,
  currentLanguage,
  currentTheme,
  onLogout,
  onVisibilityChange,
  onLanguageChange,
  onThemeChange,
  onResetDemo,
  onMenuClick
}: TopBarProps) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const t = (key: keyof typeof import('@/translations').translations.ru) => getTranslation(currentLanguage, key);

  console.log('🚀 App Version:', APP_VERSION);

  const openJivoChat = () => {
    // @ts-ignore - Jivo глобальная переменная
    if (window.jivo_api) {
      // @ts-ignore
      window.jivo_api.open();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const authToken = localStorage.getItem('authToken');
  const isAuthenticated = !!authToken;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="px-4 py-3 flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="h-9 w-9 p-0 md:hidden"
              title="Меню"
            >
              <Icon name="Menu" size={18} />
            </Button>
          )}
          <img 
            src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
            alt="Наша семья"
            className="h-8 w-8 object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3"
            >
              <Icon name="Menu" size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
              <Icon name="Settings" size={16} className="mr-2" />
              <span>Настройки семьи</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => {
              const newLang = currentLanguage === 'ru' ? 'en' : 'ru';
              onLanguageChange(newLang);
            }}>
              <Icon name="Globe" size={16} className="mr-2" />
              <span>Язык: {currentLanguage.toUpperCase()}</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => {
              const themes = ['default', 'purple', 'ocean', 'sunset', 'forest', 'rose'];
              const currentIndex = themes.indexOf(currentTheme);
              const nextIndex = (currentIndex + 1) % themes.length;
              onThemeChange(themes[nextIndex]);
            }}>
              <Icon name="Palette" size={16} className="mr-2" />
              <span>Стиль: {currentTheme}</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={toggleDarkMode}>
              <Icon name={darkMode ? "Sun" : "Moon"} size={16} className="mr-2" />
              <span>Тёмная тема</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={openJivoChat}>
              <Icon name="MessageCircle" size={16} className="mr-2" />
              <span>Онлайн поддержка</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/feedback')}>
              <Icon name="MessageSquareText" size={16} className="mr-2" />
              <span>Отзывы</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/instructions')}>
              <Icon name="BookOpen" size={16} className="mr-2" />
              <span>Инструкции</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/presentation')}>
              <Icon name="Play" size={16} className="mr-2" />
              <span>Презентация</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/family-invite')}>
              <Icon name="UserPlus" size={16} className="mr-2" />
              <span>Приглашения и подписка</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Icon name="UserCircle" size={16} className="mr-2" />
              <span>Мой профиль</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onResetDemo}>
              <Icon name="RotateCcw" size={16} className="mr-2" />
              <span>Сбросить демо</span>
            </DropdownMenuItem>

            {isAuthenticated ? (
              <DropdownMenuItem onClick={onLogout}>
                <Icon name="LogOut" size={16} className="mr-2" />
                <span>Выход</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => navigate('/welcome')}>
                <Icon name="LogIn" size={16} className="mr-2" />
                <span>Вход</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SettingsMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      <button
        onClick={() => onVisibilityChange(!isVisible)}
        className={`fixed left-1/2 -translate-x-1/2 z-40 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-md rounded-b-lg px-4 py-2 transition-all duration-300 ${
          isVisible ? 'top-[52px]' : 'top-0'
        }`}
      >
        <Icon 
          name={isVisible ? 'ChevronUp' : 'ChevronDown'} 
          size={20} 
          className="text-gray-600 dark:text-gray-400" 
        />
      </button>
    </div>
  );
}