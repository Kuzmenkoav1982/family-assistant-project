import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { CompatibilityResult } from '@/types/family-code.types';

interface CompatibilityBreakdownProps {
  result: CompatibilityResult;
}

export default function CompatibilityBreakdown({ result }: CompatibilityBreakdownProps) {
  return (
    <div className="space-y-4">
      {result.strengths.length > 0 && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4">
            <h4 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
              <Icon name="ThumbsUp" size={16} className="text-emerald-600" />
              Сильные стороны пары
            </h4>
            <div className="space-y-1.5">
              {result.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Icon name="Check" size={12} className="text-emerald-500 mt-1 flex-shrink-0" />
                  <p className="text-xs text-emerald-800 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result.weaknesses.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-1.5">
              <Icon name="AlertTriangle" size={16} className="text-amber-600" />
              Зоны роста
            </h4>
            <div className="space-y-1.5">
              {result.weaknesses.map((w, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Icon name="ArrowRight" size={12} className="text-amber-500 mt-1 flex-shrink-0" />
                  <p className="text-xs text-amber-800 leading-relaxed">{w}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result.conflictZones.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-1.5">
              <Icon name="Zap" size={16} className="text-red-600" />
              Потенциальные конфликты
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {result.conflictZones.map((z, i) => (
                <Badge key={i} className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                  {z}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-1.5">
            <Icon name="Lightbulb" size={16} className="text-purple-600" />
            Рекомендации
          </h4>
          <div className="space-y-1.5">
            {result.advice.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs text-purple-400 mt-0.5 flex-shrink-0">{i + 1}.</span>
                <p className="text-xs text-purple-800 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {result.rituals.length > 0 && (
        <Card className="border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50">
          <CardContent className="p-4">
            <h4 className="text-sm font-bold text-rose-800 mb-2 flex items-center gap-1.5">
              <Icon name="Heart" size={16} className="text-rose-600" />
              Ритуалы для вашей пары
            </h4>
            <div className="space-y-1.5">
              {result.rituals.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Icon name="Flame" size={12} className="text-rose-500 mt-1 flex-shrink-0" />
                  <p className="text-xs text-rose-800 leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
