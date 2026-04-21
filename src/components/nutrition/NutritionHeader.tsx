import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';

interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
}

interface NutritionHeaderProps {
  members: FamilyMember[];
  selectedMemberId: string;
  onMemberSelect: (memberId: string) => void;
  isInstructionOpen: boolean;
  onInstructionToggle: (open: boolean) => void;
}

export function NutritionHeader({
  members,
  selectedMemberId,
  onMemberSelect,
  isInstructionOpen,
  onInstructionToggle
}: NutritionHeaderProps) {
  return (
    <>
      <Collapsible open={isInstructionOpen} onOpenChange={onInstructionToggle}>
        <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start gap-3">
            <Icon name="Info" className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                <h3 className="font-semibold text-green-900 text-lg">
                  Как пользоваться Счётчиком БЖУ
                </h3>
                <Icon 
                  name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                  className="h-5 w-5 text-green-600 transition-transform group-hover:scale-110" 
                />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-3">
                <AlertDescription className="text-green-800">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">🍎 Для чего нужен Счётчик БЖУ?</p>
                      <p className="text-sm">
                        Счётчик помогает вести дневник питания: записывайте что съели за день, 
                        а система автоматически подсчитает калории, белки, жиры и углеводы.
                      </p>
                    </div>

                    <div>
                      <p className="font-medium mb-2">📝 Как добавить приём пищи?</p>
                      <ol className="text-sm space-y-1 ml-4 list-decimal">
                        <li>Нажмите кнопку "Добавить приём пищи"</li>
                        <li>Выберите тип приёма: завтрак, обед, ужин или перекус</li>
                        <li>Введите название продукта в поиск (например, "молоко")</li>
                        <li>Выберите продукт из списка или введите свой</li>
                        <li>Укажите количество в граммах</li>
                        <li>Нажмите "Добавить" — данные автоматически пересчитаются</li>
                      </ol>
                    </div>

                    <div>
                      <p className="font-medium mb-2">👨‍👩‍👧‍👦 Как отслеживать питание семьи?</p>
                      <p className="text-sm">
                        Переключайтесь между членами семьи с помощью кнопок с аватарами. 
                        У каждого свой дневник питания и индивидуальные нормы калорий.
                      </p>
                    </div>

                    <div>
                      <p className="font-medium mb-2">📊 Контроль нормы</p>
                      <p className="text-sm">
                        Вверху отображается прогресс по калориям и БЖУ за день. 
                        Зелёный — всё в норме, жёлтый — приближаетесь к лимиту, красный — превышение.
                      </p>
                    </div>

                    <div className="bg-white/50 p-3 rounded-lg">
                      <p className="font-medium mb-1 text-sm">💡 Совет:</p>
                      <p className="text-sm">
                        Заполняйте дневник сразу после еды — так проще не забыть. 
                        В базе уже 60+ популярных продуктов с точными данными по КБЖУ.
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </CollapsibleContent>
            </div>
          </div>
        </Alert>
      </Collapsible>

      {members.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
              <Button
                variant={selectedMemberId === 'all' ? 'default' : 'outline'}
                onClick={() => onMemberSelect('all')}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon name="Users" size={20} />
                Все авторы
              </Button>
              {members.map((member) => (
                <Button
                  key={member.id}
                  variant={selectedMemberId === String(member.id) ? 'default' : 'outline'}
                  onClick={() => onMemberSelect(String(member.id))}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  {member.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}