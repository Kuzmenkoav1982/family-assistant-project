import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { FRAMEWORKS, GOAL_SPHERES } from './frameworks';
import type { LifeGoal } from './types';
import SmartProgressDisplay from '@/components/goals/SmartProgressDisplay';

interface Props {
  goals: LifeGoal[];
  onEdit: (g: LifeGoal) => void;
  onDelete: (g: LifeGoal) => void;
  onUpdateProgress: (g: LifeGoal, progress: number) => void;
  onAdd: () => void;
}

export default function LifeGoalsList({ goals, onEdit, onDelete, onUpdateProgress, onAdd }: Props) {
  const navigate = useNavigate();
  if (goals.length === 0) {
    return (
      <div className="text-center py-12 bg-white/60 rounded-2xl border-2 border-dashed border-purple-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-3">
          <Icon name="Target" size={28} className="text-purple-600" />
        </div>
        <h4 className="font-bold text-gray-800 mb-1">У тебя пока нет целей</h4>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Выбери методику и поставь первую цель — Домовой подскажет, с чего начать.
        </p>
        <Button onClick={onAdd} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <Icon name="Plus" size={14} className="mr-1.5" /> Создать цель
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {goals.map((g) => {
        const fw = FRAMEWORKS.find((f) => f.id === g.framework);
        const sphere = GOAL_SPHERES.find((s) => s.id === g.sphere);
        const stepsDone = g.steps.filter((s) => s.done).length;
        const stepsTotal = g.steps.length;
        // SMART-обнаружение с учётом legacy-целей (framework как строка вместо frameworkType).
        const isSmart =
          g.frameworkType === 'smart' ||
          (g.framework === 'smart' && g.frameworkType !== 'okr' && g.frameworkType !== 'wheel');
        return (
          <div key={g.id} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start gap-3">
              {sphere && (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: sphere.color }}
                >
                  <Icon name={sphere.icon} size={18} />
                </div>
              )}
              <button
                type="button"
                className="flex-1 min-w-0 text-left"
                onClick={() => navigate(`/workshop/goal/${g.id}`)}
                title="Открыть страницу цели"
              >
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  {sphere && <Badge variant="secondary" className="text-[10px]">{sphere.label}</Badge>}
                  {fw && (
                    <Badge variant="outline" className="text-[10px] border-purple-300 text-purple-700">
                      {fw.title}
                    </Badge>
                  )}
                  {g.status === 'done' && (
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-700">Достигнуто</Badge>
                  )}
                </div>
                <h4 className="font-bold text-gray-900 leading-snug break-words hover:text-purple-700 transition-colors">{g.title}</h4>
                {g.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{g.description}</p>}
              </button>

              <div className="flex flex-col gap-1 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => navigate(`/workshop/goal/${g.id}`)} title="Открыть">
                  <Icon name="ArrowUpRight" size={13} />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(g)} title="Редактировать">
                  <Icon name="Pencil" size={13} />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600" onClick={() => onDelete(g)} title="Удалить">
                  <Icon name="Trash2" size={13} />
                </Button>
              </div>
            </div>

            {/* SMART — живая панель прогресса по метрике прямо на карточке */}
            {isSmart && (
              <div className="mt-3">
                <SmartProgressDisplay goal={g} variant="compact" />
                {g.deadline && (
                  <div className="flex items-center justify-end gap-1 text-[11px] text-gray-500 mt-1">
                    <Icon name="Calendar" size={11} />
                    {new Date(g.deadline).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </div>
            )}

            {/* Не-SMART: общий бар (сервер-кэш с локальным fallback) */}
            {!isSmart && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                  {stepsTotal > 0 ? (
                    <span>Шаги: {stepsDone} / {stepsTotal}</span>
                  ) : (
                    <span className="text-gray-400">прогресс</span>
                  )}
                  {g.deadline && (
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={11} />
                      {new Date(g.deadline).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{
                      width: `${
                        typeof g.executionProgress === 'number'
                          ? g.executionProgress
                          : stepsTotal
                            ? (stepsDone / stepsTotal) * 100
                            : g.progress
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Ручной ползунок — только для generic-целей без структуры. */}
            {g.frameworkType === 'generic' && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={g.progress}
                  onChange={(e) => onUpdateProgress(g, Number(e.target.value))}
                  className="flex-1 accent-purple-600 h-1"
                  title="Прогресс"
                />
                <span className="text-xs font-bold text-purple-700 w-10 text-right">{g.progress}%</span>
              </div>
            )}
            {g.frameworkType !== 'generic' && !isSmart && (
              <div className="mt-2 text-[10px] text-gray-400 italic">
                Прогресс считается из методики. Открой цель для редактирования.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}