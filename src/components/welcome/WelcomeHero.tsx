import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface WelcomeHeroProps {
  isLoggedIn: boolean;
}

export default function WelcomeHero({ isLoggedIn }: WelcomeHeroProps) {
  const navigate = useNavigate();

  return (
    <div className="pt-32 md:pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 bg-clip-text text-transparent">
            Управляйте семьёй<br />как настоящей командой
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Здоровье, путешествия, праздники, задачи, развитие детей — всё для организации семейной жизни в одном приложении
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isLoggedIn && (
              <Button
                onClick={() => navigate('/register')}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg px-10 py-7 font-bold shadow-xl transform hover:scale-105 transition-transform"
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
              className="border-2 border-orange-400 hover:bg-orange-50 text-orange-600 font-bold text-lg px-8 py-7"
            >
              <Icon name="Sparkles" size={20} className="mr-2" />
              Демо (10 минут)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
