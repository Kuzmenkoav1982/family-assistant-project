import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { AstrologyProfile } from '@/types/family-code.types';
import { getDailyForecast } from './dailyForecast';

export default function DailyForecastCard({ profile }: { profile: AstrologyProfile }) {
  const forecast = getDailyForecast(profile.zodiacSign);
  const today = new Date();
  const dayStr = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  return (
    <Card className="overflow-hidden border-2 border-amber-200">
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Icon name="Sparkles" size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Прогноз дня</h3>
              <p className="text-xs text-gray-500">{dayStr}</p>
            </div>
          </div>
          <span className="text-2xl">{profile.zodiacEmoji}</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-purple-50 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-purple-600 mb-1">Настроение</p>
            <p className="text-xs font-bold text-purple-900">{forecast.mood}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-orange-600 mb-1">Энергия</p>
            <div className="flex justify-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  key={i}
                  name="Star"
                  size={12}
                  className={i < forecast.energy ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>
          <div className="bg-teal-50 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-teal-600 mb-1">Цвет дня</p>
            <p className="text-xs font-bold text-teal-900">{forecast.color}</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 flex items-start gap-2">
          <Icon name="Lightbulb" size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-800 leading-relaxed">{forecast.advice}</p>
        </div>
      </CardContent>
    </Card>
  );
}
