import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface WelcomeHeaderProps {
  isLoggedIn: boolean;
}

export default function WelcomeHeader({ isLoggedIn }: WelcomeHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200/50">
              <Icon name="Home" className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-gray-900 font-[Montserrat]">
                Наша Семья
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <a
              href="https://t.me/Nasha7iya"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition-colors"
              title="Telegram"
            >
              <Icon name="Send" size={16} />
            </a>
            <a
              href="https://max.ru/id231805288780_biz"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-500 flex items-center justify-center transition-colors"
              title="MAX"
            >
              <Icon name="MessageCircle" size={16} />
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
              className="border-orange-200 hover:bg-orange-50 text-orange-600 font-semibold text-xs rounded-xl h-9"
            >
              <Icon name="Sparkles" size={14} className="mr-1" />
              Демо
            </Button>
            {isLoggedIn ? (
              <Button
                onClick={() => navigate('/')}
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs rounded-xl h-9 font-semibold"
              >
                <Icon name="Home" size={14} className="mr-1" />
                Главная
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/register')}
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-xs rounded-xl h-9"
                >
                  <Icon name="UserPlus" size={14} className="mr-1" />
                  <span className="hidden sm:inline">Создать</span>
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-900 text-xs h-9"
                >
                  <Icon name="LogIn" size={14} className="mr-1" />
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
