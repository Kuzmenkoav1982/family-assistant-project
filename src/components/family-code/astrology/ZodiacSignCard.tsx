import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ZODIAC_DATA, getElementLabel } from '@/lib/astrology';
import type { AstrologyProfile } from '@/types/family-code.types';
import { ELEMENT_COLORS, ELEMENT_EMOJI, PLANET_ICONS } from './constants';

export default function ZodiacSignCard({ profile }: { profile: AstrologyProfile }) {
  const zodiacData = ZODIAC_DATA.find(z => z.id === profile.zodiacSign);
  return (
    <Card className="overflow-hidden border-2 border-indigo-200">
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Icon name="Star" size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Знак Зодиака</h3>
            <p className="text-xs text-gray-500">Западная астрология</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{profile.zodiacEmoji}</span>
          <div>
            <h4 className="text-xl font-bold text-gray-900">{profile.zodiacSignLabel}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{zodiacData?.dateRange}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge className={ELEMENT_COLORS[profile.zodiacElement]}>
                {ELEMENT_EMOJI[profile.zodiacElement]} {getElementLabel(profile.zodiacElement)}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                <Icon name={PLANET_ICONS[profile.zodiacPlanet] || 'Circle'} size={10} className="mr-1" />
                {profile.zodiacPlanet}
              </Badge>
            </div>
          </div>
        </div>
        {zodiacData && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {zodiacData.traits.map(t => (
              <Badge key={t} variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700">
                {t}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-700 leading-relaxed">{profile.zodiacDescription}</p>
      </CardContent>
    </Card>
  );
}
