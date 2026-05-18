import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { AstrologyProfile } from '@/types/family-code.types';
import { PLANET_ICONS, PLANET_DESCRIPTIONS } from './constants';

export default function PlanetaryInfluenceCard({ profile }: { profile: AstrologyProfile }) {
  const planet = profile.zodiacPlanet;
  const iconName = PLANET_ICONS[planet] || 'Circle';
  const description = PLANET_DESCRIPTIONS[planet]
    || 'Влияние вашей управляющей планеты помогает раскрыть ваш потенциал и направляет к верным решениям.';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-violet-100 p-2 rounded-lg">
            <Icon name={iconName} size={20} className="text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Влияние планеты</h3>
            <p className="text-xs text-gray-500">Управляющая планета в этом месяце</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
              <Icon name={iconName} size={24} className="text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">{planet}</h4>
              <p className="text-xs text-violet-600">Управитель знака {profile.zodiacSignLabel}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
