import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { NationalityHeader } from './NationalityHeader';
import { NationalityContent } from './NationalityContent';
import type { NationalityData } from '@/data/nationalitiesData';

interface NationalityDetailLayoutProps {
  nationality: NationalityData | null;
}

export function NationalityDetailLayout({ nationality }: NationalityDetailLayoutProps) {
  const navigate = useNavigate();

  if (!nationality) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Национальность не найдена</h2>
          <p className="text-gray-600 mb-6">Попробуйте выбрать другую национальность из списка</p>
          <Button onClick={() => navigate('/nationalities')} className="gap-2">
            <Icon name="ArrowLeft" size={18} />
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/nationalities')}
          className="gap-2"
        >
          <Icon name="ArrowLeft" size={18} />
          Назад к списку
        </Button>

        <NationalityHeader 
          name={nationality.name}
          population={nationality.population}
          region={nationality.region}
          image={nationality.image}
        />

        <NationalityContent nationality={nationality} />
      </div>
    </div>
  );
}
