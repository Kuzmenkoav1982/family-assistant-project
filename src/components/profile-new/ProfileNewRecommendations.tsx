import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ProfileNewRecommendationsProps {
  stage1Completed?: boolean;
  stage2Completed?: boolean;
  stage3Completed?: boolean;
  onOpenRecommendations: () => void;
}

export default function ProfileNewRecommendations({
  stage1Completed,
  stage2Completed,
  stage3Completed,
  onOpenRecommendations,
}: ProfileNewRecommendationsProps) {
  if (!stage1Completed) {
    return null;
  }

  const allCompleted = stage2Completed && stage3Completed;

  return (
    <Card className={`mt-8 animate-fade-in ${
      allCompleted
        ? 'border-2 border-primary shadow-lg'
        : 'border-2 border-yellow-500/50 shadow-md'
    }`}>
      <CardHeader className={`${
        allCompleted
          ? 'bg-gradient-to-r from-primary/10 to-primary/5'
          : 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5'
      }`}>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Icon name="Sparkles" size={28} className={
            allCompleted
              ? 'text-primary'
              : 'text-yellow-600'
          } />
          Ваши персональные рекомендации
        </CardTitle>
        <CardDescription className="text-base">
          {allCompleted
            ? 'Комплексный анализ на основе всех заполненных анкет'
            : 'Предварительные рекомендации на основе заполненных этапов'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Индикаторы заполненности */}
          <div className="grid gap-3 md:grid-cols-3 mb-4">
            <div className={`p-3 rounded-lg text-center ${
              stage1Completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}>
              <Icon
                name={stage1Completed ? 'CheckCircle2' : 'Circle'}
                size={24}
                className={`mx-auto mb-2 ${stage1Completed ? 'text-green-600' : 'text-gray-400'}`}
              />
              <p className="text-sm font-medium">Ваши цели</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stage1Completed ? 'Заполнено' : 'Не заполнено'}
              </p>
            </div>
            <div className={`p-3 rounded-lg text-center ${
              stage2Completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}>
              <Icon
                name={stage2Completed ? 'CheckCircle2' : 'Circle'}
                size={24}
                className={`mx-auto mb-2 ${stage2Completed ? 'text-green-600' : 'text-gray-400'}`}
              />
              <p className="text-sm font-medium">Образ жизни</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stage2Completed ? 'Заполнено' : 'Не заполнено'}
              </p>
            </div>
            <div className={`p-3 rounded-lg text-center ${
              stage3Completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}>
              <Icon
                name={stage3Completed ? 'CheckCircle2' : 'Circle'}
                size={24}
                className={`mx-auto mb-2 ${stage3Completed ? 'text-green-600' : 'text-gray-400'}`}
              />
              <p className="text-sm font-medium">Питание</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stage3Completed ? 'Заполнено' : 'Не заполнено'}
              </p>
            </div>
          </div>

          {/* Уведомление о точности */}
          {(!stage2Completed || !stage3Completed) && (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-4">
              <div className="flex gap-3">
                <Icon name="AlertCircle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900 mb-1">
                    Повысьте точность рекомендаций
                  </p>
                  <p className="text-sm text-yellow-800">
                    Чем больше информации мы знаем о вас, тем точнее будут подобраны витамины.
                    Заполните {!stage2Completed && 'Этап 2'}
                    {!stage2Completed && !stage3Completed && ' и '}
                    {!stage3Completed && 'Этап 3'} для максимально персонализированных рекомендаций.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={onOpenRecommendations}
            variant={allCompleted ? 'default' : 'outline'}
          >
            <Icon name="Eye" size={20} className="mr-2" />
            {allCompleted
              ? 'Посмотреть полные рекомендации'
              : 'Посмотреть предварительные рекомендации'
            }
          </Button>

          {allCompleted && (
            <p className="text-xs text-center text-green-600 flex items-center justify-center gap-1">
              <Icon name="CheckCircle2" size={14} />
              Все анкеты заполнены - рекомендации максимально точные
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
