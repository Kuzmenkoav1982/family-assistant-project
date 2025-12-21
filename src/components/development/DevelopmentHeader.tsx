import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';

interface DevelopmentHeaderProps {
  onNavigateBack: () => void;
  testsCount: number;
  isInstructionOpen: boolean;
  onInstructionToggle: (open: boolean) => void;
}

export function DevelopmentHeader({
  onNavigateBack,
  testsCount,
  isInstructionOpen,
  onInstructionToggle
}: DevelopmentHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Button onClick={onNavigateBack} variant="outline" className="gap-2">
          <Icon name="ArrowLeft" size={16} />
          Назад
        </Button>
        <Badge variant="outline" className="bg-white gap-1">
          <Icon name="Target" size={14} />
          Доступно тестов: {testsCount}
        </Badge>
      </div>

      <Collapsible open={isInstructionOpen} onOpenChange={onInstructionToggle}>
        <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-start gap-3">
            <Icon name="Info" className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                <h3 className="font-semibold text-purple-900 text-lg">
                  О разделе Развитие
                </h3>
                <Icon 
                  name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                  className="h-5 w-5 text-purple-600 transition-transform group-hover:scale-110" 
                />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-3">
                <AlertDescription className="text-purple-800">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">🎯 Зачем нужны тесты развития?</p>
                      <p className="text-sm">
                        Тесты помогают лучше понять себя и членов семьи: эмоциональный интеллект, 
                        стили общения, подходы к воспитанию детей и многое другое. Это основа для 
                        улучшения взаимопонимания и развития семейных отношений.
                      </p>
                    </div>

                    <div>
                      <p className="font-medium mb-2">📊 Категории тестов</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li><strong>Психология:</strong> Эмоциональный интеллект, управление стрессом</li>
                        <li><strong>Отношения:</strong> Языки любви, разрешение конфликтов</li>
                        <li><strong>Воспитание:</strong> Стили воспитания детей</li>
                        <li><strong>Продуктивность:</strong> Управление временем</li>
                        <li><strong>Финансы:</strong> Финансовая грамотность семьи</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium mb-2">💡 Как использовать</p>
                      <ol className="text-sm space-y-1 list-decimal list-inside">
                        <li>Выберите член семьи из списка</li>
                        <li>Выберите интересующий тест из категории</li>
                        <li>Пройдите тест честно — это поможет получить точные результаты</li>
                        <li>Изучите результаты и рекомендации</li>
                        <li>Обсудите результаты с семьёй для улучшения взаимопонимания</li>
                      </ol>
                    </div>

                    <div>
                      <p className="font-medium mb-2">🔒 Конфиденциальность</p>
                      <p className="text-sm">
                        Все результаты тестов сохраняются локально и доступны только вам. 
                        Никакая информация не передаётся третьим лицам.
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </CollapsibleContent>
            </div>
          </div>
        </Alert>
      </Collapsible>
    </>
  );
}
