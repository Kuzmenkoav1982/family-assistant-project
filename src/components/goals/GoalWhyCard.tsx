import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import type { LifeGoal } from '@/components/life-road/types';

interface Props {
  goal: LifeGoal;
}

const HORIZON_LABEL: Record<string, string> = {
  quarter: 'квартал',
  season: 'сезон',
  year: 'год',
  long: 'длинный путь',
};

export default function GoalWhyCard({ goal }: Props) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 text-white flex items-center justify-center">
          <Icon name="Heart" size={16} />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">Смысл</div>
          <div className="text-[11px] text-gray-500">Зачем мне эта цель</div>
        </div>
      </div>

      {goal.whyText ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{goal.whyText}</p>
      ) : goal.description ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{goal.description}</p>
      ) : (
        <p className="text-xs text-gray-400 italic">
          Запиши, зачем ты идёшь к этой цели. Это поможет вернуться к ней, когда станет трудно.
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-3">
        {goal.horizon && (
          <Badge variant="secondary" className="text-[10px]">
            <Icon name="CalendarClock" size={10} className="mr-1" />
            {HORIZON_LABEL[goal.horizon] ?? goal.horizon}
          </Badge>
        )}
        {goal.season && (
          <Badge variant="secondary" className="text-[10px]">
            <Icon name="Leaf" size={10} className="mr-1" />
            {goal.season}
          </Badge>
        )}
        {goal.scope === 'family' && (
          <Badge variant="secondary" className="text-[10px]">
            <Icon name="Users" size={10} className="mr-1" />
            семейная
          </Badge>
        )}
        {goal.createdFrom === 'portfolio' && (
          <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
            <Icon name="Compass" size={10} className="mr-1" />
            пришла из Портфолио
          </Badge>
        )}
      </div>
    </div>
  );
}
