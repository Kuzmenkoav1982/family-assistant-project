import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { AstrologyProfile } from '@/types/family-code.types';
import { getElementLabel } from '@/lib/astrology';

interface AstrologyCardProps {
  profile: AstrologyProfile;
}

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'bg-red-100 text-red-700 border-red-200',
  earth: 'bg-amber-100 text-amber-700 border-amber-200',
  air: 'bg-sky-100 text-sky-700 border-sky-200',
  water: 'bg-blue-100 text-blue-700 border-blue-200',
  wood: 'bg-green-100 text-green-700 border-green-200',
  metal: 'bg-gray-100 text-gray-700 border-gray-200',
};

const ELEMENT_EMOJI: Record<string, string> = {
  fire: '🔥', earth: '🌍', air: '💨', water: '💧', wood: '🌳', metal: '⚔️',
};

export default function AstrologyCard({ profile }: AstrologyCardProps) {
  const [tab, setTab] = useState<'west' | 'east'>('west');

  return (
    <Card className="border-2 border-purple-200 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Icon name="Star" size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Астрологический профиль</h3>
            <p className="text-xs text-gray-500">Западная и восточная астрология</p>
          </div>
        </div>

        <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab('west')}
            className={`flex-1 text-xs font-medium py-2 px-3 rounded-md transition-all ${
              tab === 'west' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {profile.zodiacEmoji} Западная
          </button>
          <button
            onClick={() => setTab('east')}
            className={`flex-1 text-xs font-medium py-2 px-3 rounded-md transition-all ${
              tab === 'east' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {profile.chineseAnimalEmoji} Восточная
          </button>
        </div>

        {tab === 'west' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{profile.zodiacEmoji}</span>
              <div>
                <h4 className="text-lg font-bold text-gray-900">{profile.zodiacSignLabel}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={ELEMENT_COLORS[profile.zodiacElement]}>
                    {ELEMENT_EMOJI[profile.zodiacElement]} {getElementLabel(profile.zodiacElement)}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    <Icon name="Globe" size={10} className="inline mr-0.5" />
                    {profile.zodiacPlanet}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{profile.zodiacDescription}</p>
          </div>
        )}

        {tab === 'east' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{profile.chineseAnimalEmoji}</span>
              <div>
                <h4 className="text-lg font-bold text-gray-900">{profile.chineseAnimalLabel}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={ELEMENT_COLORS[profile.chineseElement]}>
                    {ELEMENT_EMOJI[profile.chineseElement]} {getElementLabel(profile.chineseElement)}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {profile.chineseYinYang === 'yin' ? '☯ Инь' : '☯ Ян'}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{profile.chineseDescription}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
