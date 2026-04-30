import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface WelcomeHeroProps {
  isLoggedIn: boolean;
}

export default function WelcomeHero({ isLoggedIn }: WelcomeHeroProps) {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-24 sm:pt-28 pb-16 sm:pb-24">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 -z-10" />
      <div className="absolute top-20 right-0 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Icon name="Sparkles" size={16} />
              Единственная платформа для всей семьи
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.08] tracking-tight text-gray-900">
              Семейное приложение для планирования дел
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-xl mb-4 leading-relaxed mx-auto">
              Задачи, здоровье, питание, бюджет, развитие детей, AI-помощник и Яндекс Алиса — 
              всё для управления семейной жизнью.
            </p>

            <p className="text-sm text-gray-400 mb-8 mx-auto">
              Бесплатный тариф для пары — до 2 членов семьи. Работает на телефоне, планшете и компьютере.
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
                <>
                  <Button
                    onClick={() => navigate('/register')}
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg px-10 py-7 font-bold shadow-xl shadow-orange-200/50 rounded-2xl w-full sm:w-auto"
                  >
                    <Icon name="Rocket" size={20} className="mr-2" />
                    Начать бесплатно
                  </Button>
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
                    Смотреть демо
                  </Button>
                </>
              )}
            </div>

            {!isLoggedIn && (
              <button
                onClick={() => navigate('/login')}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Уже есть аккаунт? Войти
              </button>
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <img
            src="https://cdn.poehali.dev/files/4934b182-04ec-456b-814c-77b2704e0d2e.png"
            alt="Домовёнок — семейный помощник приложения Наша Семья"
            className="w-full max-w-2xl rounded-3xl shadow-2xl object-cover"
          />
        </div>
      </div>
    </section>
  );
}