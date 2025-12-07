import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface LifeRoadHeaderProps {
  isInstructionOpen: boolean;
  setIsInstructionOpen: (open: boolean) => void;
}

export function LifeRoadHeader({ isInstructionOpen, setIsInstructionOpen }: LifeRoadHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-4"
      >
        <Icon name="ArrowLeft" size={20} className="mr-2" />
        Назад
      </Button>

      {/* Инструкция */}
      <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen} className="mb-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Info" size={20} className="text-blue-600" />
                Как пользоваться разделом "Дорога жизни"
              </CardTitle>
              <Icon 
                name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                className="text-blue-600"
              />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-start gap-2">
                <Icon name="Calendar" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Добавляйте события:</strong> Нажмите "Добавить событие" чтобы записать важные моменты жизни семьи
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="MapPin" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Визуализация:</strong> События отображаются на дороге в хронологическом порядке - от прошлого к будущему
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Monitor" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Категории:</strong> Рождение, свадьба, образование, карьера, достижения, путешествия, семейные события
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Star" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Важность:</strong> Отмечайте значимость события - от обычного до ключевого момента жизни
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Users" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Участники:</strong> Указывайте членов семьи, связанных с событием
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Filter" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Фильтрация:</strong> Используйте фильтры по категориям и годам для удобного просмотра
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Дорога жизни
          </h1>
          <p className="text-gray-600">
            Хронология важных событий вашей семьи
          </p>
        </div>
      </div>
    </div>
  );
}
