import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
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

  const WALLET_API = 'https://functions.poehali.dev/26de1854-01bd-4700-bb2d-6e59cebab238';
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const fetchBalance = useCallback(() => {
    if (!authToken) return;
    fetch(`${WALLET_API}?action=balance`, { headers: { 'X-Auth-Token': authToken } })
      .then(r => r.json())
      .then(j => { if (j.balance !== undefined) setWalletBalance(j.balance); })
      .catch(() => {});
  }, [authToken]);

  useEffect(() => {
    fetchBalance();
    const iv = setInterval(fetchBalance, 60000);
    return () => clearInterval(iv);
  }, [fetchBalance]);
  
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

  const getUserAvatar = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user.photo_url || user.avatar || null;
      }
    } catch {
      return null;
    }
    return null;
  };

  const avatar = getUserAvatar();

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="px-4 h-16 flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <div className="relative">
              <button
                onClick={onMenuClick}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Icon name="Menu" size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              {showMenuHint && (
                <>
                  <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                  </span>
                  <div className="absolute top-full left-0 mt-2 whitespace-nowrap bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl z-50 animate-bounce">
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45" />
                    Все разделы здесь
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {avatar ? (
              <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Icon name="User" size={14} className="text-white" />
              </div>
            )}
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden sm:block">
              {getUserName()}
            </span>
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <button
            onClick={() => navigate('/')}
            className="text-sm font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Наша Семья
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {isAuthenticated && walletBalance !== null && (
            <button
              onClick={() => navigate('/wallet')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              <Icon name="Wallet" size={14} className="text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{walletBalance.toFixed(0)} р</span>
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Icon name="MoreVertical" size={18} className="text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1">
              <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-lg">
                <Icon name="Settings" size={16} className="mr-2.5 text-gray-500" />
                <span>Настройки</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/instructions')} className="rounded-lg">
                <Icon name="BookOpen" size={16} className="mr-2.5 text-gray-500" />
                <span>Инструкции</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/presentation')} className="rounded-lg">
                <Icon name="Play" size={16} className="mr-2.5 text-gray-500" />
                <span>Презентация</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={openTelegramSupport} className="rounded-lg">
                <Icon name="MessageCircle" size={16} className="mr-2.5 text-blue-500" />
                <span>Онлайн поддержка</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/support')} className="rounded-lg">
                <Icon name="HelpCircle" size={16} className="mr-2.5 text-gray-500" />
                <span>Тех. поддержка</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/feedback')} className="rounded-lg">
                <Icon name="MessageSquareText" size={16} className="mr-2.5 text-gray-500" />
                <span>Отзывы</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/ideas-board')} className="rounded-lg">
                <Icon name="Lightbulb" size={16} className="mr-2.5 text-amber-500" />
                <span>Предложения</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={onResetDemo} className="rounded-lg">
                <Icon name="RotateCcw" size={16} className="mr-2.5 text-gray-500" />
                <span>Сбросить демо</span>
              </DropdownMenuItem>

              {isAuthenticated ? (
                <DropdownMenuItem onClick={onLogout} className="rounded-lg text-red-600">
                  <Icon name="LogOut" size={16} className="mr-2.5" />
                  <span>Выход</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => navigate('/welcome')} className="rounded-lg text-blue-600">
                  <Icon name="LogIn" size={16} className="mr-2.5" />
                  <span>Вход</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
