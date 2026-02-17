import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { getDailyMotto } from '@/utils/dailyMottos';

interface HomeHeroProps {
  familyName: string;
  familyLogo: string;
  syncing: boolean;
}

const DEFAULT_BG = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/394bc3ee-c247-4349-b0e0-657e6c902d6f.jpg';
const DEFAULT_LOGO = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/90f87bac-e708-4551-b2dc-061dd3d7b0ed.JPG';

export default function HomeHero({ familyName, familyLogo, syncing }: HomeHeroProps) {
  return (
    <div className="relative -mx-4 mb-4 rounded-b-2xl overflow-hidden">
      <img
        src={DEFAULT_BG}
        alt={familyName}
        className="w-full h-56 sm:h-64 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
        <div className="flex items-end gap-4">
          <Link to="/settings" className="group flex-shrink-0">
            <img
              src={familyLogo}
              alt={familyName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/80 shadow-lg group-hover:brightness-90 transition-all"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_LOGO;
              }}
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg truncate">
                {familyName}
              </h1>
              {syncing && (
                <Badge className="bg-blue-600/80 text-white text-[10px] backdrop-blur-sm">
                  <Icon name="RefreshCw" className="mr-1 animate-spin" size={10} />
                  Синхронизация
                </Badge>
              )}
            </div>
            <p className="text-sm sm:text-base text-white/85 mt-1 drop-shadow line-clamp-1">
              {getDailyMotto()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}