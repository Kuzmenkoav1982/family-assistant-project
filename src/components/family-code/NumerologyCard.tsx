import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { NumerologyNumber } from '@/types/family-code.types';

interface NumerologyCardProps {
  label: string;
  icon: string;
  number: NumerologyNumber;
}

export default function NumerologyCard({ label, icon, number }: NumerologyCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-200 overflow-hidden"
      onClick={() => setExpanded(!expanded)}
    >
      <div className={`h-1.5 bg-gradient-to-r ${number.color}`} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`bg-gradient-to-br ${number.color} w-10 h-10 rounded-xl flex items-center justify-center shadow-md`}>
              <span className="text-white font-bold text-lg">{number.value}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Icon name={icon} size={12} />
                {label}
              </p>
              <p className="font-bold text-gray-900">{number.title}</p>
            </div>
          </div>
          <Icon
            name={expanded ? 'ChevronUp' : 'ChevronDown'}
            size={18}
            className="text-gray-400 group-hover:text-purple-500 transition-colors"
          />
        </div>

        <p className="text-sm text-gray-600 mb-2">{number.shortMeaning}</p>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-sm text-gray-700 leading-relaxed">{number.fullDescription}</p>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 rounded-lg p-2.5">
                <p className="text-xs font-semibold text-green-800 mb-1.5 flex items-center gap-1">
                  <Icon name="ThumbsUp" size={12} /> Сильные стороны
                </p>
                <div className="flex flex-wrap gap-1">
                  {number.strengths.map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px] border-green-200 text-green-700 bg-white">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-2.5">
                <p className="text-xs font-semibold text-amber-800 mb-1.5 flex items-center gap-1">
                  <Icon name="AlertTriangle" size={12} /> Зоны роста
                </p>
                <div className="flex flex-wrap gap-1">
                  {number.weaknesses.map((w) => (
                    <Badge key={w} variant="outline" className="text-[10px] border-amber-200 text-amber-700 bg-white">
                      {w}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-2.5">
              <p className="text-xs font-semibold text-purple-800 mb-1 flex items-center gap-1">
                <Icon name="Lightbulb" size={12} /> Совет
              </p>
              <p className="text-xs text-purple-700 leading-relaxed">{number.advice}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500">Совместимые числа:</span>
              {number.compatibleNumbers.map((n) => (
                <span key={n} className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center">
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
