import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface WelcomeHeroProps {
  isLoggedIn: boolean;
}

export default function WelcomeHero({ isLoggedIn }: WelcomeHeroProps) {
  const navigate = useNavigate();

  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight text-gray-900">
          Семейные дела —{' '}
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            под контролем
          </span>
        </h2>
        <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Задачи, покупки, события, здоровье — всё в одном месте. Бесплатно для семьи до 4 человек.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isLoggedIn ? (
            <Button
              onClick={() => navigate('/')}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg px-10 py-7 font-bold shadow-xl shadow-orange-200/50 rounded-2xl w-full sm:w-auto"
            >
              <Icon name="Home" size={22} className="mr-3" />
              Перейти в приложение
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/register')}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg px-10 py-7 font-bold shadow-xl shadow-orange-200/50 rounded-2xl w-full sm:w-auto"
            >
              Начать бесплатно
            </Button>
          )}
          {!isLoggedIn && (
            <>
              <Button
                onClick={() => {
                  localStorage.setItem('isDemoMode', 'true');
                  localStorage.setItem('demoStartTime', Date.now().toString());
                  navigate('/');
                }}
                size="lg"
                variant="outline"
                className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 text-lg px-8 py-7 font-semibold rounded-2xl w-full sm:w-auto"
              >
                <Icon name="Eye" size={20} className="mr-2" />
                Попробовать без регистрации
              </Button>
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                variant="ghost"
                className="text-gray-500 hover:text-gray-900 text-base"
              >
                Уже есть аккаунт? Войти
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}