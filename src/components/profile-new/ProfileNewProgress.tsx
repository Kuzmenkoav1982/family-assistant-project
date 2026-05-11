import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface ProfileNewProgressProps {
  totalProgress: number;
}

export default function ProfileNewProgress({ totalProgress }: ProfileNewProgressProps) {
  return (
    <Card className="mb-8 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="TrendingUp" size={24} className="text-primary" />
          Прогресс заполнения анкет
        </CardTitle>
        <CardDescription>
          Заполните все анкеты для получения точных рекомендаций
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Общий прогресс</span>
            <span className="font-medium">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
}
