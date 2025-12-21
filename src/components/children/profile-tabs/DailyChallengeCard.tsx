import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DailyChallengeCardProps {
  todayChallenge: string;
  challengeCompleted: boolean;
  onChallengeComplete: () => void;
}

export function DailyChallengeCard({
  todayChallenge,
  challengeCompleted,
  onChallengeComplete,
}: DailyChallengeCardProps) {
  return (
    <Card className="bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 border-2 border-purple-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">🎯</div>
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-2">Задание дня</h3>
            <p className="text-lg mb-4">{todayChallenge}</p>
            {challengeCompleted ? (
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <Icon name="CheckCircle2" size={24} />
                Отлично! Задание выполнено! 🎉
              </div>
            ) : (
              <Button
                onClick={onChallengeComplete}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Icon name="Check" className="mr-2" size={16} />
                Выполнено!
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
