import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { NumerologyProfile, PythagorasSquare, AstrologyProfile, DestinyMatrix } from '@/types/family-code.types';

interface PersonalSummaryProps {
  memberName: string;
  numerology: NumerologyProfile;
  pythagoras: PythagorasSquare;
  astrology?: AstrologyProfile | null;
  destinyMatrix?: DestinyMatrix | null;
}

export default function PersonalSummary({ memberName, numerology, pythagoras, astrology, destinyMatrix }: PersonalSummaryProps) {
  const topTraits = [
    ...pythagoras.dominantTraits.map(t => ({ label: t, type: 'strong' as const })),
    ...pythagoras.weakTraits.map(t => ({ label: t, type: 'weak' as const })),
  ];

  const mainNumber = numerology.lifePath;

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${mainNumber.color}`} />
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`bg-gradient-to-br ${mainNumber.color} w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-xl sm:text-2xl">{mainNumber.value}</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">{memberName}</h2>
            <p className="text-xs sm:text-sm text-purple-700 font-medium leading-snug">
              {mainNumber.title} • Число {mainNumber.value}
              {astrology && ` • ${astrology.zodiacEmoji} ${astrology.zodiacSignLabel}`}
              {astrology && ` • ${astrology.chineseAnimalEmoji} ${astrology.chineseAnimalLabel}`}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed mb-4">{mainNumber.shortMeaning}</p>

        <div className="grid grid-cols-5 gap-1 sm:gap-1.5 mb-4">
          {[
            { label: 'Судьба', num: numerology.destiny },
            { label: 'Душа', num: numerology.soul },
            { label: 'Личность', num: numerology.personality },
            { label: 'День', num: numerology.birthDay },
            { label: 'Экспрессия', num: numerology.expression },
          ].map(item => (
            <div key={item.label} className="text-center bg-white/60 rounded-lg p-1.5 sm:p-2 border border-purple-100">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded-lg bg-gradient-to-br ${item.num.color} flex items-center justify-center mb-1`}>
                <span className="text-white text-[10px] sm:text-xs font-bold">{item.num.value}</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-gray-600 font-medium leading-tight">{item.label}</p>
            </div>
          ))}
        </div>

        {topTraits.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {topTraits.map(trait => (
              <Badge
                key={trait.label}
                className={trait.type === 'strong'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
                }
              >
                <Icon
                  name={trait.type === 'strong' ? 'TrendingUp' : 'TrendingDown'}
                  size={10}
                  className="mr-1"
                />
                {trait.label}
              </Badge>
            ))}
          </div>
        )}

        <div className="bg-white/60 rounded-lg p-3 border border-purple-100">
          <p className="text-xs font-semibold text-purple-800 mb-1 flex items-center gap-1">
            <Icon name="FileText" size={12} /> Сводка квадрата Пифагора
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">{pythagoras.summary}</p>
        </div>

        {destinyMatrix && (
          <div className="mt-3 p-3 bg-amber-50/60 rounded-lg border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
              <Icon name="Wand2" size={12} /> Миссия жизни
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">{destinyMatrix.mission}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}