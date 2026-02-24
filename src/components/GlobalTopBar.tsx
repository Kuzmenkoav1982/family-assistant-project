import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const HIDDEN_ROUTES = [
  '/welcome', '/login', '/register', '/reset-password', '/presentation',
  '/onboarding', '/demo-mode', '/admin-login', '/investor-deck',
];

const WALLET_API = 'https://functions.poehali.dev/26de1854-01bd-4700-bb2d-6e59cebab238';

export default function GlobalTopBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem('globalTopBarVisible');
    return saved !== null ? saved === 'true' : true;
  });

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const { unreadCount } = useNotificationCenter();

  const authToken = localStorage.getItem('authToken');
  const isAuthenticated = !!authToken;
  const isDemoMode = !isAuthenticated && localStorage.getItem('isDemoMode') === 'true';

  const fetchBalance = useCallback(() => {
    if (!authToken) return;
    fetch(`${WALLET_API}?action=balance`, { headers: { 'X-Auth-Token': authToken } })
      .then(r => r.json())
      .then(j => { if (j.balance !== undefined) setWalletBalance(j.balance); })
      .catch(() => { /* ignore */ });
  }, [authToken]);

  useEffect(() => {
    localStorage.setItem('globalTopBarVisible', String(isVisible));
  }, [isVisible]);

  useEffect(() => {
    fetchBalance();
    const iv = setInterval(fetchBalance, 60000);
    return () => clearInterval(iv);
  }, [fetchBalance]);

  const shouldHide = HIDDEN_ROUTES.some(r => location.pathname.startsWith(r));
  if (shouldHide) return null;

  const getUserName = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user.name || user.email || 'Пользователь';
      }
    } catch {
      return 'Пользователь';
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

  const handleMenuClick = () => {
    window.dispatchEvent(new Event('toggleGlobalSidebar'));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/login';
  };

  const handleResetDemo = () => {
    if (confirm('Сбросить все демо-данные и начать заново?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="px-4 h-16 flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Icon name="Menu" size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              {isDemoMode && (
                <div className="absolute top-full left-0 mt-2 whitespace-nowrap z-50 animate-fade-in pointer-events-none">
                  <div className="relative bg-orange-500 text-white px-3 py-1.5 rounded-xl text-sm font-medium shadow-lg">
                    <div className="absolute -top-1.5 left-4 w-3 h-3 bg-orange-500 rotate-45 rounded-sm" />
                    Все разделы тут
                  </div>
                </div>
              )}
            </div>

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
            {isAuthenticated && (
              <button
                onClick={() => navigate('/notifications')}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Icon name="Bell" size={18} className="text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}
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
                <DropdownMenuItem onClick={() => window.open('https://t.me/Nasha7iya', '_blank')} className="rounded-lg">
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
                <DropdownMenuItem onClick={handleResetDemo} className="rounded-lg">
                  <Icon name="RotateCcw" size={16} className="mr-2.5 text-gray-500" />
                  <span>Сбросить демо</span>
                </DropdownMenuItem>
                {isAuthenticated ? (
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-red-600">
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

      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isVisible ? 'top-[63px]' : 'top-0'
        }`}
      >
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-b-xl px-6 py-1 shadow-sm hover:shadow-md transition-shadow">
          <Icon
            name={isVisible ? "ChevronUp" : "ChevronDown"}
            size={16}
            className="text-gray-400"
          />
        </div>
      </button>
    </>
  );
}