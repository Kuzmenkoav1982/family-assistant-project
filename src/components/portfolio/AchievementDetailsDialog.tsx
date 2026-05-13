import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import AchievementLinkedGoals from './AchievementLinkedGoals';
import type { Achievement } from '@/types/portfolio.types';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  achievement: Achievement | null;
}

export default function AchievementDetailsDialog({ open, onOpenChange, achievement }: Props) {
  if (!achievement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100vw-1rem)] sm:w-auto max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Icon name={achievement.icon} size={20} className="text-white" />
            </div>
            <span className="truncate">{achievement.title}</span>
          </DialogTitle>
          {achievement.description && (
            <DialogDescription>{achievement.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {achievement.sphere_key && (
              <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700">
                {achievement.sphere_key}
              </Badge>
            )}
            {achievement.category && (
              <Badge variant="outline" className="text-[10px]">
                {achievement.category}
              </Badge>
            )}
            <span className="text-[11px] text-gray-500 ml-auto">
              <Icon name="Calendar" size={10} className="inline mr-0.5" />
              {new Date(achievement.earned_at).toLocaleDateString('ru-RU')}
            </span>
          </div>

          {/* Этап 3.3.2 — обратная сторона связи */}
          <AchievementLinkedGoals achievementId={achievement.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}