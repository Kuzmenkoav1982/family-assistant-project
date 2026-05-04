import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface WelcomeHeroProps {
  isLoggedIn: boolean;
}

const PHONE_SCREENS = [
  {
    src: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/aa6e2960-f72f-442b-b816-7c68cfb7f050.jpeg',
    alt: 'Профили членов семьи',
    rotate: '-rotate-6',
    z: 'z-10',
    offset: 'translate-y-6',
  },
  {
    src: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/af5b9876-ae34-4026-81ff-e56e94dfac3c.jpeg',
    alt: 'Дашборд «Наша Семья» с 12 хабами',
    rotate: 'rotate-0',
    z: 'z-20',
    offset: '',
  },
  {
    src: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/11abe1e4-5fcf-4a9b-b26f-076fa5403010.jpeg',
    alt: 'Раздел «Развитие» — психолог и навыки',
    rotate: 'rotate-6',
    z: 'z-10',
    offset: 'translate-y-6',
  },
];

const MOBILE_HERO_SCREEN = {
  src: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/a56446e2-ef59-4c50-aecf-9ed9fb67b67c.jpeg',
  alt: 'Дашборд «Наша Семья» с 12 хабами',
};

export default function WelcomeHero({ isLoggedIn }: WelcomeHeroProps) {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-24 sm:pt-28 pb-16 sm:pb-24">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 -z-10" />
      <div className="absolute top-20 right-0 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Icon name="Sparkles" size={16} />
              Единственная платформа для всей семьи
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.08] tracking-tight text-gray-900">
              Вся семейная жизнь<br />
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                в одном приложении
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0">
              Дела, дети, здоровье, бюджет и AI-помощник — для всей семьи.
              Один сервис вместо десяти разрозненных приложений.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
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
              <div className="text-center lg:text-left">
                <button
                  onClick={() => navigate('/login')}
                  className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Уже есть аккаунт? Войти
                </button>
              </div>
            )}

            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto lg:mx-0">
              {[
                { icon: 'Gift', text: 'Бесплатно для семьи' },
                { icon: 'ShieldCheck', text: 'Данные хранятся в России' },
                { icon: 'Smartphone', text: 'В браузере и на телефоне' },
                { icon: 'Mic', text: 'Поддержка Яндекс Алисы' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-orange-100 rounded-xl px-3 py-2.5 text-left"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-600">
                    <Icon name={item.icon} size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full max-w-md mx-auto lg:max-w-none lg:ml-auto">
            <div className="absolute -inset-8 bg-gradient-to-br from-orange-300/30 via-pink-300/30 to-purple-300/30 rounded-full blur-3xl -z-10" />

            <div className="hidden md:flex items-center justify-center gap-2 lg:gap-3 py-8">
              {PHONE_SCREENS.map((screen, idx) => (
                <div
                  key={idx}
                  className={`relative ${screen.rotate} ${screen.z} ${screen.offset} transition-transform duration-300 hover:scale-105 hover:-translate-y-2 hover:rotate-0`}
                >
                  <div className="bg-gray-900 rounded-[2rem] p-2 shadow-2xl shadow-orange-300/40 border-4 border-gray-800">
                    <div className="bg-white rounded-[1.6rem] overflow-hidden w-32 lg:w-40 aspect-[9/19] relative">
                      <img
                        src={screen.src}
                        alt={screen.alt}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:hidden flex items-center justify-center py-4">
              <div className="relative">
                <div className="bg-gray-900 rounded-[2.5rem] p-2.5 shadow-2xl shadow-orange-300/40 border-4 border-gray-800">
                  <div className="bg-white rounded-[2rem] overflow-hidden w-48 aspect-[9/19] relative">
                    <img
                      src={MOBILE_HERO_SCREEN.src}
                      alt={MOBILE_HERO_SCREEN.alt}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                </div>
                <div className="absolute -right-3 -top-3 bg-gradient-to-br from-orange-400 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg rotate-12">
                  ✨ Это реально
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center gap-6 mt-6 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Реальные экраны приложения
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}