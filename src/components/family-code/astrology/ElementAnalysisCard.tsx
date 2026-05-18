import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { getElementLabel } from '@/lib/astrology';
import type { AstrologyProfile } from '@/types/family-code.types';
import { ELEMENT_BG, ELEMENT_EMOJI } from './constants';

export default function ElementAnalysisCard({ profile }: { profile: AstrologyProfile }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Icon name="Leaf" size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Анализ стихий</h3>
            <p className="text-xs text-gray-500">Западные и восточные элементы</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 bg-gradient-to-br ${ELEMENT_BG[profile.zodiacElement]} text-white`}>
            <p className="text-[10px] uppercase tracking-wide opacity-80">Западная стихия</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{ELEMENT_EMOJI[profile.zodiacElement]}</span>
              <span className="text-lg font-bold">{getElementLabel(profile.zodiacElement)}</span>
            </div>
          </div>
          <div className={`rounded-xl p-3 bg-gradient-to-br ${ELEMENT_BG[profile.chineseElement]} text-white`}>
            <p className="text-[10px] uppercase tracking-wide opacity-80">Восточная стихия</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{ELEMENT_EMOJI[profile.chineseElement]}</span>
              <span className="text-lg font-bold">{getElementLabel(profile.chineseElement)}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">{profile.chineseYinYang === 'yin' ? '🌙' : '☀️'}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {profile.chineseYinYang === 'yin' ? 'Инь — женская энергия' : 'Ян — мужская энергия'}
            </p>
            <p className="text-xs text-gray-600">
              {profile.chineseYinYang === 'yin'
                ? 'Спокойствие, мудрость, интуиция. Сила в мягкости и принятии.'
                : 'Активность, сила, инициатива. Энергия созидания и движения.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
