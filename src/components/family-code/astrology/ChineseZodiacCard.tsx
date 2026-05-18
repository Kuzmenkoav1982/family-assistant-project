import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { CHINESE_ANIMALS, getElementLabel } from '@/lib/astrology';
import type { AstrologyProfile } from '@/types/family-code.types';
import { ELEMENT_COLORS, ELEMENT_EMOJI } from './constants';

export default function ChineseZodiacCard({ profile }: { profile: AstrologyProfile }) {
  const animal = CHINESE_ANIMALS.find(a => a.id === profile.chineseAnimal);
  return (
    <Card className="overflow-hidden border-2 border-rose-200">
      <div className="h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500" />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-rose-100 p-2 rounded-lg">
            <Icon name="Compass" size={20} className="text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Китайский гороскоп</h3>
            <p className="text-xs text-gray-500">Восточная астрология</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{profile.chineseAnimalEmoji}</span>
          <div>
            <h4 className="text-xl font-bold text-gray-900">{profile.chineseAnimalLabel}</h4>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge className={ELEMENT_COLORS[profile.chineseElement]}>
                {ELEMENT_EMOJI[profile.chineseElement]} {getElementLabel(profile.chineseElement)}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {profile.chineseYinYang === 'yin' ? '☯ Инь' : '☯ Ян'}
              </Badge>
            </div>
          </div>
        </div>
        {animal && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {animal.traits.map(t => (
              <Badge key={t} variant="secondary" className="text-[10px] bg-rose-50 text-rose-700">
                {t}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-700 leading-relaxed">{profile.chineseDescription}</p>
      </CardContent>
    </Card>
  );
}
