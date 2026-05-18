import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { getReligionEmoji, getReligionLabel } from '../constants';
import { formatDateRange } from '../api';
import type { FastingPeriod } from '../types';

export default function FastingTab({ fasting, religion }: { fasting: FastingPeriod[]; religion: string }) {
  if (fasting.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <Icon name="Flame" size={18} className="text-orange-600" />
          Посты — {getReligionEmoji(religion)} {getReligionLabel(religion)}
        </h3>
        <Card className="border-dashed border-amber-200">
          <CardContent className="py-10 text-center text-amber-600/60">
            <Icon name="Flame" size={36} className="mx-auto mb-2 text-amber-300" />
            <p className="text-sm">Нет данных о постах для этой конфессии</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 flex items-center gap-2">
        <Icon name="Flame" size={18} className="text-orange-600" />
        Посты — {getReligionEmoji(religion)} {getReligionLabel(religion)}
      </h3>

      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 via-orange-300 to-amber-200 rounded-full" />
        {fasting.map((f, i) => (
          <div key={i} className="relative mb-6 last:mb-0">
            <div className={`absolute -left-4 top-3 w-3 h-3 rounded-full border-2 ${f.is_active ? 'bg-orange-500 border-orange-300 ring-4 ring-orange-100' : 'bg-amber-200 border-amber-300'}`} />
            <Card className={`border-amber-100 ${f.is_active ? 'ring-2 ring-orange-300 shadow-lg' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-amber-900">{f.title}</h4>
                  {f.is_active && (
                    <Badge className="bg-orange-500 text-white animate-pulse text-[10px]">
                      <Icon name="Flame" size={10} className="mr-0.5" />
                      Сейчас
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-amber-700 flex items-center gap-1.5 mb-3">
                  <Icon name="Calendar" size={12} />
                  {formatDateRange(f.start_date, f.end_date)}
                </p>
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                  <div className="flex items-start gap-2">
                    <Icon name="UtensilsCrossed" size={14} className="text-orange-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-orange-800 mb-1">Правила питания</p>
                      <p className="text-xs text-orange-700/80 leading-relaxed">{f.rules}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/60 to-green-50/40">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Icon name="UtensilsCrossed" size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">Интеграция с меню на неделю</p>
              <p className="text-xs text-emerald-700/70 mt-1">
                Во время поста раздел «Меню на неделю» учитывает ограничения вашей конфессии и предлагает постные блюда
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
