import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { getDailyMotto } from '@/utils/dailyMottos';

interface FamilyHeaderBannerProps {
  familyName: string;
  familyLogo: string;
  syncing: boolean;
}

export function FamilyHeaderBanner({ familyName, familyLogo, syncing }: FamilyHeaderBannerProps) {
  return (
    <div 
      className="relative -mx-4 lg:-mx-8 mb-8 overflow-hidden rounded-2xl"
      style={{
        backgroundImage: 'url(https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '240px'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/75 to-white/65 backdrop-blur-[1px]"></div>
      <div className="relative h-full flex flex-col items-center justify-center px-6">
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center gap-4">
            <img 
              src={familyLogo} 
              alt={familyName}
              className="w-28 h-28 lg:w-36 lg:h-36 object-contain rounded-full"
              style={{ border: 'none', outline: 'none' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png';
              }}
            />
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 bg-clip-text text-transparent">
                {familyName}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 mt-4">
          <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-400 via-slate-500 via-slate-600 to-gray-700 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%] text-center px-4">
            {getDailyMotto()}
          </p>
          <div className="flex items-center gap-2">
            {localStorage.getItem('authToken') && (
              <Badge className="bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg">
                <Icon name="Shield" className="mr-1" size={12} />
                OAuth
              </Badge>
            )}
            {syncing && (
              <Badge className="bg-blue-600 animate-pulse shadow-lg">
                <Icon name="RefreshCw" className="mr-1 animate-spin" size={12} />
                Синхронизация
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
