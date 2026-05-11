import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ProfileNewStagesProps {
  stage1Completed?: boolean;
  stage2Completed?: boolean;
  stage3Completed?: boolean;
  onOpenStage2: () => void;
  onOpenStage3: () => void;
}

export default function ProfileNewStages({
  stage1Completed,
  stage2Completed,
  stage3Completed,
  onOpenStage2,
  onOpenStage3,
}: ProfileNewStagesProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Этап 1 - Предварительная анкета */}
      <Card className="relative overflow-hidden animate-scale-in">
        <div className={`absolute top-0 left-0 w-full h-1 ${
          stage1Completed ? 'bg-green-500' : 'bg-gray-300'
        }`} />
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant={stage1Completed ? 'default' : 'secondary'}>
              Этап 1
            </Badge>
            {stage1Completed && (
              <Icon name="CheckCircle" size={20} className="text-green-500" />
            )}
          </div>
          <CardTitle className="text-xl">Предварительная анкета</CardTitle>
          <CardDescription className="text-sm">
            Базовая информация о вас (5 вопросов)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stage1Completed ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Icon name="Check" size={16} />
              <span>Завершено</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Уже заполнено
            </div>
          )}
        </CardContent>
      </Card>

      {/* Этап 2 - Расширенная анкета */}
      <Card className="relative overflow-hidden animate-scale-in" style={{ animationDelay: '0.1s' }}>
        <div className={`absolute top-0 left-0 w-full h-1 ${
          stage2Completed ? 'bg-green-500' : 'bg-primary'
        }`} />
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant={stage2Completed ? 'default' : 'outline'}>
              Этап 2
            </Badge>
            {stage2Completed && (
              <Icon name="CheckCircle" size={20} className="text-green-500" />
            )}
          </div>
          <CardTitle className="text-xl">Расширенная анкета</CardTitle>
          <CardDescription className="text-sm">
            Детальная информация о здоровье и образе жизни
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stage2Completed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                <Icon name="Check" size={16} />
                <span>Завершено</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onOpenStage2}
              >
                <Icon name="Edit" size={16} className="mr-2" />
                Редактировать
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={onOpenStage2}
            >
              <Icon name="Play" size={16} className="mr-2" />
              Начать заполнение
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Этап 3 - Анкета о питании */}
      <Card className="relative overflow-hidden animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <div className={`absolute top-0 left-0 w-full h-1 ${
          stage3Completed ? 'bg-green-500' : 'bg-primary'
        }`} />
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant={stage3Completed ? 'default' : 'outline'}>
              Этап 3
            </Badge>
            {stage3Completed && (
              <Icon name="CheckCircle" size={20} className="text-green-500" />
            )}
          </div>
          <CardTitle className="text-xl">Питание и микронутриенты</CardTitle>
          <CardDescription className="text-sm">
            Информация о рационе и пищевых привычках
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stage3Completed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                <Icon name="Check" size={16} />
                <span>Завершено</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onOpenStage3}
              >
                <Icon name="Edit" size={16} className="mr-2" />
                Редактировать
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={onOpenStage3}
            >
              <Icon name="Play" size={16} className="mr-2" />
              Начать заполнение
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
