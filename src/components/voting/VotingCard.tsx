import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface VotingCardProps {
  voting: any;
  progress: {
    votedCount: number;
    totalMembers: number;
    percentage: number;
  };
  longPressActive: boolean;
  onClick: () => void;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
}

export function VotingCard({
  voting,
  progress,
  longPressActive,
  onClick,
  onLongPressStart,
  onLongPressEnd,
}: VotingCardProps) {
  const getVotingIcon = (type: string) => {
    switch (type) {
      case 'meal': return 'Utensils';
      case 'rule': return 'Scale';
      default: return 'Vote';
    }
  };

  const getVotingColor = (type: string) => {
    switch (type) {
      case 'meal': return 'from-orange-500 to-red-500';
      case 'rule': return 'from-blue-500 to-indigo-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-300 select-none ${
        longPressActive ? 'long-press-hint scale-[0.98] border-purple-400' : ''
      }`}
      onClick={onClick}
      onTouchStart={onLongPressStart}
      onTouchEnd={onLongPressEnd}
      onTouchCancel={onLongPressEnd}
      onMouseDown={onLongPressStart}
      onMouseUp={onLongPressEnd}
      onMouseLeave={onLongPressEnd}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getVotingColor(voting.voting_type)} flex items-center justify-center flex-shrink-0`}>
            <Icon name={getVotingIcon(voting.voting_type)} size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1 truncate">{voting.title}</h4>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={12} />
                До {new Date(voting.end_date).toLocaleDateString('ru-RU')}
              </span>
              <Badge variant="outline" className="text-xs">
                {voting.options.length} вариантов
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Проголосовало: {progress.votedCount} из {progress.totalMembers}</span>
                <span className="font-semibold text-purple-600">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          </div>
          <Icon name="ChevronRight" size={20} className="text-gray-400 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
