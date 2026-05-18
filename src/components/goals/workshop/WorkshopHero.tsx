import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export default function WorkshopHero() {
  const navigate = useNavigate();
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center">
          <Icon name="Compass" size={22} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Мастерская жизни</h1>
          <p className="text-xs text-gray-500">Куда и зачем я иду</p>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Это место, где смыслы становятся целями, а цели — живут с тобой. Не просто «список задач», а
        компас на сезон, год и длинный путь.
      </p>
      <div className="flex flex-wrap gap-2 mt-4">
        <Button onClick={() => navigate('/life-road')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <Icon name="ArrowRight" size={14} className="mr-1.5" /> Открыть «Дорогу жизни»
        </Button>
        <Button variant="outline" onClick={() => navigate('/portfolio')}>
          <Icon name="LineChart" size={14} className="mr-1.5" /> Где я сейчас (Портфолио)
        </Button>
        <Button variant="outline" onClick={() => navigate('/planning-hub')}>
          <Icon name="ListChecks" size={14} className="mr-1.5" /> Что делаю сейчас (План)
        </Button>
      </div>
    </div>
  );
}
