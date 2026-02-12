import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface WelcomeHeaderProps {
  isLoggedIn: boolean;
}

export default function WelcomeHeader({ isLoggedIn }: WelcomeHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Icon name="Home" className="text-white" size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Наша Семья
              </h1>
              <p className="hidden md:block text-[10px] sm:text-xs text-gray-500 truncate">Управление семьёй</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <a
              href="https://t.me/Nasha7iya"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all shadow-md hover:shadow-lg group"
              title="Наш Telegram канал"
            >
              <Icon name="Send" size={16} className="group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-xs font-medium">Telegram</span>
            </a>
            <a
              href="https://max.ru/id231805288780_biz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all shadow-md hover:shadow-lg group"
              title="Наш канал в MAX"
            >
              <Icon name="MessageCircle" size={16} className="group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-xs font-medium">MAX</span>
            </a>
            
            <Button
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                localStorage.removeItem('familyId');
                localStorage.setItem('isDemoMode', 'true');
                localStorage.setItem('demoStartTime', Date.now().toString());
                navigate('/');
              }}
              variant="outline"
              size="sm"
              className="border-orange-300 hover:bg-orange-50 text-orange-600 font-semibold text-xs sm:text-sm"
            >
              <Icon name="Sparkles" size={16} className="mr-1" />
              <span className="hidden sm:inline">Демо-режим</span>
              <span className="sm:hidden">Демо</span>
            </Button>
            {isLoggedIn ? (
              <Button
                onClick={() => navigate('/')}
                size="sm"
                className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-xs sm:text-sm"
              >
                <Icon name="Home" size={16} className="mr-1" />
                Главная
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/register')}
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg text-xs sm:text-sm"
                >
                  <Icon name="UserPlus" size={16} className="mr-1" />
                  <span className="hidden sm:inline">Создать семью</span>
                  <span className="sm:hidden">Создать</span>
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm"
                >
                  <Icon name="LogIn" size={16} className="mr-1" />
                  Войти
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
