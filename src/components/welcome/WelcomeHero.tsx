import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface WelcomeHeroProps {
  isLoggedIn: boolean;
}

export default function WelcomeHero({ isLoggedIn }: WelcomeHeroProps) {
  const navigate = useNavigate();

  return (
    <div className="pt-24 sm:pt-20 pb-16">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 mb-6">
          <Icon name="Sparkles" size={14} className="text-orange-500" />
          <span className="text-xs font-semibold text-orange-700">Всё для семьи в одном приложении</span>
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.1] font-[Montserrat] text-gray-900">
          Управляйте семьёй
          <br />
          <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">как настоящей командой</span>
        </h2>
        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-[Rubik]">
          Задачи, питание, здоровье, развитие детей, AI-ассистент — всё в одном месте
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {!isLoggedIn && (
            <Button
              onClick={() => navigate('/register')}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg px-10 py-7 font-bold shadow-xl shadow-orange-200/50 transform hover:scale-105 transition-all rounded-2xl"
            >
              <Icon name="UserPlus" size={22} className="mr-3" />
              Создать семью бесплатно
            </Button>
          )}
          <Button
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('authUser');
              localStorage.removeItem('familyId');
              localStorage.setItem('isDemoMode', 'true');
              localStorage.setItem('demoStartTime', Date.now().toString());
              navigate('/');
            }}
            size="lg"
            variant="outline"
            className="border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 font-semibold text-lg px-8 py-7 rounded-2xl transition-all"
          >
            <Icon name="Play" size={20} className="mr-2 text-orange-500" />
            Попробовать демо
          </Button>
        </div>
      </div>
    </div>
  );
}
