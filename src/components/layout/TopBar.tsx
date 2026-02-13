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
  showMenuHint?: boolean;
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
  showMenuHint,
  onLogout,
  onVisibilityChange,
  onLanguageChange,
  onThemeChange,
  onResetDemo,
  onMenuClick
}: TopBarProps) {
  const navigate = useNavigate();
  const t = (key: keyof typeof import('@/translations').translations.ru) => getTranslation(currentLanguage, key);
  const isDarkMode = currentTheme === 'dark';

  const openTelegramSupport = () => {
    window.open('https://t.me/Nasha7iya', '_blank');
  };

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'middle' : 'dark';
    onThemeChange(newTheme);
  };

  const authToken = localStorage.getItem('authToken');
  const isAuthenticated = !!authToken;
  
  const getUserName = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user.name || user.email || 'Пользователь';
      }
    } catch (e) {
      console.error('Error parsing userData:', e);
    }
    return 'Пользователь';
  };

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="px-4 py-1.5 flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuClick}
                className="h-9 w-9 p-0"
                title="Меню"
              >
                <Icon name="Menu" size={18} />
              </Button>
              {showMenuHint && (
                <>
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500" />
                  </span>
                  <div className="absolute top-full left-0 mt-2 whitespace-nowrap bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl z-50 animate-bounce">
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45" />
                    Все разделы здесь
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Icon name="User" size={18} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getUserName()}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
            >
              <Icon name="Menu" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            
            <DropdownMenuItem onClick={() => navigate('/instructions')}>
              <Icon name="BookOpen" size={16} className="mr-2" />
              <span>Инструкции</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/presentation')}>
              <Icon name="Play" size={16} className="mr-2" />
              <span>Презентация</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={openTelegramSupport}>
              <Icon name="MessageCircle" size={16} className="mr-2" />
              <span>Онлайн поддержка</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/support')}>
              <Icon name="HelpCircle" size={16} className="mr-2" />
              <span>Тех. поддержка</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/feedback')}>
              <Icon name="MessageSquareText" size={16} className="mr-2" />
              <span>Отзывы</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/ideas-board')}>
              <Icon name="Lightbulb" size={16} className="mr-2" />
              <span>Предложения</span>
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

      {isVisible && (
        <button
          onClick={() => onVisibilityChange(false)}
          className="fixed left-1/2 -translate-x-1/2 top-0 z-[60] bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-md rounded-b-lg px-3 py-1 transition-all duration-300"
        >
          <Icon 
            name="ChevronUp" 
            size={16} 
            className="text-gray-600 dark:text-gray-400" 
          />
        </button>
      )}
    </div>
  );
}