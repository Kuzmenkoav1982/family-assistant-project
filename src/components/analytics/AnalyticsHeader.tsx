import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';

type Period = 'week' | 'month' | 'quarter' | 'half-year' | 'year';

interface AnalyticsHeaderProps {
  isInstructionOpen: boolean;
  onInstructionToggle: (open: boolean) => void;
  period: Period;
  onPeriodChange: (period: Period) => void;
  onNavigateHome: () => void;
}

export function AnalyticsHeader({
  isInstructionOpen,
  onInstructionToggle,
  period,
  onPeriodChange,
  onNavigateHome
}: AnalyticsHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📊 Аналитика семьи
          </h1>
          <p className="text-gray-600 mt-2">Отслеживайте активность и развитие вашей семьи</p>
        </div>
        <Button onClick={onNavigateHome} variant="outline" className="gap-2">
          <Icon name="ArrowLeft" size={18} />
          На главную
        </Button>
      </div>

      <Collapsible open={isInstructionOpen} onOpenChange={onInstructionToggle}>
        <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                <h3 className="font-semibold text-blue-900 text-lg">
                  Как работает раздел Аналитика
                </h3>
                <Icon 
                  name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                  className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" 
                />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-3">
                <AlertDescription className="text-blue-800">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">📊 Для чего нужна аналитика?</p>
                      <p className="text-sm">
                        Раздел аналитики помогает отслеживать активность семьи, видеть общую картину выполнения задач, 
                        участия в событиях и развития детей. Все данные обновляются автоматически.
                      </p>
                    </div>

                    <div>
                      <p className="font-medium mb-2">📈 Что можно отслеживать?</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li><strong>Активность членов семьи:</strong> Кто сколько выполнил задач и посетил событий</li>
                        <li><strong>Выполнение задач:</strong> Процент завершённых задач и динамика</li>
                        <li><strong>События:</strong> Предстоящие и прошедшие семейные мероприятия</li>
                        <li><strong>Статистика по месяцам:</strong> Тренды активности вашей семьи</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium mb-2">🎯 Как использовать аналитику?</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Следите за балансом нагрузки между членами семьи</li>
                        <li>Планируйте задачи на основе статистики выполнения</li>
                        <li>Отмечайте самых активных участников семейной жизни</li>
                        <li>Анализируйте, кому нужна помощь с задачами</li>
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-sm italic">
                        💡 <strong>Совет:</strong> Регулярно просматривайте аналитику, чтобы справедливо 
                        распределять задачи и обязанности между всеми членами семьи.
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </CollapsibleContent>
            </div>
          </div>
        </Alert>
      </Collapsible>

      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Calendar" className="text-blue-600" size={20} />
              <span className="font-semibold text-gray-700">Период отображения:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={period === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange('week')}
              >
                Неделя
              </Button>
              <Button
                variant={period === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange('month')}
              >
                Месяц
              </Button>
              <Button
                variant={period === 'quarter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange('quarter')}
              >
                Квартал
              </Button>
              <Button
                variant={period === 'half-year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange('half-year')}
              >
                Полугодие
              </Button>
              <Button
                variant={period === 'year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange('year')}
              >
                Год
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
