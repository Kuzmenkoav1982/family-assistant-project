import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { FAMILY_EXERCISES } from '../data/exercises';
import { RELAXATION_TECHNIQUES } from '../data/relaxation';
import { formatDate } from '../utils';
import type { ConsultationRecord, ExerciseRecord, RelaxationRecord } from '../types';

interface Props {
  consultationHistory: ConsultationRecord[];
  exercisesCompleted: ExerciseRecord[];
  relaxationSessions: RelaxationRecord[];
  getStreak: () => number;
  getWeeklyActivity: () => boolean[];
  getDayLabel: (daysAgo: number) => string;
}

export default function ProgressTab({
  consultationHistory, exercisesCompleted, relaxationSessions,
  getStreak, getWeeklyActivity, getDayLabel,
}: Props) {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
          <Icon name="TrendingUp" size={16} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Ваш прогресс</h3>
          <p className="text-xs text-gray-500">Статистика использования инструментов психолога</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-teal-200/60 bg-white/80 backdrop-blur-sm">
          <CardContent className="py-3 px-3 text-center">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-1.5">
              <Icon name="MessageCircle" size={18} className="text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-teal-700">{consultationHistory.length}</p>
            <p className="text-xs text-gray-500">Консультаций</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200/60 bg-white/80 backdrop-blur-sm">
          <CardContent className="py-3 px-3 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-1.5">
              <Icon name="Target" size={18} className="text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-700">{exercisesCompleted.length}</p>
            <p className="text-xs text-gray-500">Упражнений</p>
          </CardContent>
        </Card>

        <Card className="border-violet-200/60 bg-white/80 backdrop-blur-sm">
          <CardContent className="py-3 px-3 text-center">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-1.5">
              <Icon name="Flower2" size={18} className="text-violet-600" />
            </div>
            <p className="text-2xl font-bold text-violet-700">{relaxationSessions.length}</p>
            <p className="text-xs text-gray-500">Релаксаций</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/60 bg-white/80 backdrop-blur-sm">
          <CardContent className="py-3 px-3 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-1.5">
              <Icon name="Flame" size={18} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">{getStreak()}</p>
            <p className="text-xs text-gray-500">Дней подряд</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200/60 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
            <Icon name="CalendarDays" size={14} />
            Активность за неделю
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-end justify-between gap-1 px-2">
            {getWeeklyActivity().map((active, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm' : 'bg-gray-100'}`}>
                  {active ? (
                    <Icon name="Check" size={14} className="text-white" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>
                <span className="text-[10px] text-gray-400 capitalize">{getDayLabel(6 - i)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {consultationHistory.length > 0 && (
        <Card className="border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
              <Icon name="History" size={14} />
              Последние действия
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            {consultationHistory.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="MessageCircle" size={12} className="text-teal-600" />
                </div>
                <span className="text-gray-700 truncate flex-1">{c.topic}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(c.date)}</span>
              </div>
            ))}
            {exercisesCompleted.slice(0, 3).map((e, i) => {
              const ex = FAMILY_EXERCISES.find((f) => f.id === e.exerciseId);
              return (
                <div key={`ex-${i}`} className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Target" size={12} className="text-amber-600" />
                  </div>
                  <span className="text-gray-700 truncate flex-1">{ex?.title || 'Упражнение'}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(e.completedDate)}</span>
                </div>
              );
            })}
            {relaxationSessions.slice(0, 3).map((r, i) => {
              const tech = RELAXATION_TECHNIQUES.find((t) => t.id === r.techniqueId);
              return (
                <div key={`rel-${i}`} className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="Flower2" size={12} className="text-violet-600" />
                  </div>
                  <span className="text-gray-700 truncate flex-1">{tech?.title || 'Релаксация'}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(r.completedDate)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {consultationHistory.length === 0 && exercisesCompleted.length === 0 && relaxationSessions.length === 0 && (
        <Card className="border-gray-200/60 bg-white/60 backdrop-blur-sm">
          <CardContent className="py-8 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Icon name="Sparkles" size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Здесь будет отображаться ваш прогресс.<br />
              Начните с первой консультации или упражнения.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
