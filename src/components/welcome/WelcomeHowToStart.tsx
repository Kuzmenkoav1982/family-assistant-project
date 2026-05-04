import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface WelcomeHowToStartProps {
  isLoggedIn: boolean;
}

const STEPS = [
  {
    number: '1',
    icon: 'UserPlus',
    title: 'Зарегистрируйтесь',
    desc: 'Создайте аккаунт за 30 секунд — без карты и подписок. Достаточно email или номера телефона.',
    time: '30 секунд',
    color: 'from-orange-400 to-pink-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  {
    number: '2',
    icon: 'Home',
    title: 'Создайте семью',
    desc: 'Назовите свою семью и настройте, что вам важнее: дети, здоровье, бюджет или всё сразу.',
    time: '1 минута',
    color: 'from-purple-400 to-pink-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    number: '3',
    icon: 'Users',
    title: 'Добавьте близких',
    desc: 'Пригласите супруга, детей и бабушек по ссылке — у каждого будет своя роль и доступ.',
    time: '2 минуты',
    color: 'from-blue-400 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
];

export default function WelcomeHowToStart({ isLoggedIn }: WelcomeHowToStartProps) {
  const navigate = useNavigate();

  if (isLoggedIn) return null;

  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Icon name="Rocket" size={16} />
            Старт за 3 минуты
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Начать{' '}
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              проще, чем кажется
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Три коротких шага — и вся семья в одном приложении. Без обучения и сложных настроек.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative">
          <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-orange-200 via-purple-200 to-blue-200" />

          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className={`relative ${step.bg} border-2 ${step.border} rounded-3xl p-6 sm:p-7 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`relative flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md`}
                >
                  <Icon name={step.icon} size={26} className="text-white" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                    <span className="font-bold text-gray-700 text-sm">{step.number}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{step.title}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Icon name="Clock" size={12} />
                    {step.time}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 border border-orange-200 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-200">
                <Icon name="Sparkles" size={28} className="text-white" />
              </div>
              <div className="md:hidden text-center">
                <p className="font-bold text-gray-900 text-lg">Готовы начать?</p>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <p className="hidden md:block font-bold text-gray-900 text-lg mb-1">Готовы начать?</p>
              <p className="text-sm text-gray-600">
                Регистрация бесплатная и занимает меньше минуты. Без карты, без подписок.
                Если не понравится — просто закройте приложение.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                onClick={() => navigate('/register')}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200/50 px-8"
              >
                <Icon name="Rocket" size={18} className="mr-2" />
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
                className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 font-semibold rounded-2xl"
              >
                <Icon name="Eye" size={18} className="mr-2" />
                Сначала демо
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
