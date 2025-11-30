import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LazyImage } from '@/components/ui/LazyImage';
import Icon from '@/components/ui/icon';

interface NationalityHeaderProps {
  name: string;
  nameRu: string;
  population: string;
  region: string;
  image: string;
}

export function NationalityHeader({ name, nameRu, population, region, image }: NationalityHeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate('/nationalities')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <Icon name="ArrowLeft" size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Назад к списку народов</span>
      </button>

      <Card className="overflow-hidden mb-6">
        <div className="h-64 relative overflow-hidden">
          <LazyImage 
            src={image} 
            alt={nameRu}
            className="w-full h-full object-cover"
            wrapperClassName="h-64"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-4xl font-bold text-white mb-3">{name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                <Icon name="Users" size={14} className="mr-1" />
                {population}
              </Badge>
              <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                <Icon name="MapPin" size={14} className="mr-1" />
                {region}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}