import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { NumerologyProfile, PythagorasSquare } from '@/types/family-code.types';

interface PersonalSummaryProps {
  memberName: string;
  numerology: NumerologyProfile;
  pythagoras: PythagorasSquare;
}

export default function PersonalSummary({ memberName, numerology, pythagoras }: PersonalSummaryProps) {
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
          <div className={`bg-gradient-to-br ${mainNumber.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-2xl">{mainNumber.value}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{memberName}</h2>
            <p className="text-sm text-purple-700 font-medium">
              {mainNumber.title} • Число жизненного пути {mainNumber.value}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed mb-4">{mainNumber.shortMeaning}</p>

        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {[
            { label: 'Судьба', num: numerology.destiny },
            { label: 'Душа', num: numerology.soul },
            { label: 'Личность', num: numerology.personality },
            { label: 'День', num: numerology.birthDay },
            { label: 'Экспрессия', num: numerology.expression },
          ].map(item => (
            <div key={item.label} className="text-center bg-white/60 rounded-lg p-2 border border-purple-100">
              <div className={`w-7 h-7 mx-auto rounded-lg bg-gradient-to-br ${item.num.color} flex items-center justify-center mb-1`}>
                <span className="text-white text-xs font-bold">{item.num.value}</span>
              </div>
              <p className="text-[10px] text-gray-600 font-medium leading-tight">{item.label}</p>
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

        <div className="mt-3 p-3 bg-violet-100/60 rounded-lg border border-violet-200">
          <p className="text-xs font-semibold text-violet-800 mb-1 flex items-center gap-1">
            <Icon name="Clock" size={12} /> Следующие этапы
          </p>
          <p className="text-xs text-violet-700 leading-relaxed">
            В ближайших обновлениях добавим: западную и восточную астрологию, арканы Таро, детальный психопортрет
            и совместимость с другими членами семьи.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
