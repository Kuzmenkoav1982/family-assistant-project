import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MealsHeaderProps {
  onNavigateBack: () => void;
  onNavigateHome?: () => void;
  selectedAuthor: string;
  onAuthorChange: (value: string) => void;
  totalMeals: number;
  filteredMealsCount: number;
  uniqueAuthors: { id: string; name: string }[];
  isInstructionOpen: boolean;
  onInstructionToggle: (open: boolean) => void;
}

export function MealsHeader({
  onNavigateBack,
  onNavigateHome,
  selectedAuthor,
  onAuthorChange,
  totalMeals,
  filteredMealsCount,
  uniqueAuthors,
  isInstructionOpen,
  onInstructionToggle
}: MealsHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={onNavigateBack} variant="outline">
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Питание
          </Button>
          {onNavigateHome && (
            <Button onClick={onNavigateHome} variant="outline" size="icon">
              <Icon name="Home" size={16} />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-white">
            <Icon name="UtensilsCrossed" size={14} className="mr-1" />
            {selectedAuthor === 'all' 
              ? `Блюд на неделю: ${totalMeals}`
              : `Блюд автора: ${filteredMealsCount}`
            }
          </Badge>
        </div>
      </div>

      <Collapsible open={isInstructionOpen} onOpenChange={onInstructionToggle}>
        <Alert className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-start gap-3">
            <Icon name="Info" className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                <h3 className="font-semibold text-orange-900 text-lg">
                  Как планировать питание семьи
                </h3>
                <Icon 
                  name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                  className="h-5 w-5 text-orange-600 transition-transform group-hover:scale-110" 
                />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-3">
                <AlertDescription className="text-orange-800">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">🍽️ Для чего нужен раздел Питание?</p>
                      <p className="text-sm">
                        Раздел помогает планировать меню на неделю для всей семьи. Это экономит время на решение "что приготовить", 
                        упрощает покупки продуктов и помогает питаться разнообразно и сбалансированно.
                      </p>
                    </div>

                    <div>
                      <p className="font-medium mb-2">✨ Возможности раздела</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li><strong>Недельное меню:</strong> Планируйте завтрак, обед и ужин на каждый день</li>
                        <li><strong>Эмодзи блюд:</strong> Визуально различайте блюда</li>
                        <li><strong>Фильтр по автору:</strong> Смотрите, кто что добавил</li>
                        <li><strong>Два режима просмотра:</strong> Неделя целиком или отдельный день</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium mb-2">🎯 Как использовать</p>
                      <ol className="text-sm space-y-1 list-decimal list-inside">
                        <li>Добавьте блюда на неделю через кнопку "+ Добавить блюдо"</li>
                        <li>Используйте эмодзи для визуального оформления</li>
                        <li>Переключайтесь между неделей и днём для удобства</li>
                        <li>Фильтруйте блюда по авторам, если планируете по очереди</li>
                      </ol>
                    </div>
                  </div>
                </AlertDescription>
              </CollapsibleContent>
            </div>
          </div>
        </Alert>
      </Collapsible>

      <Card className="bg-gradient-to-r from-orange-100 to-amber-100 border-orange-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Icon name="UtensilsCrossed" size={28} />
            Планирование питания семьи
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedAuthor} onValueChange={onAuthorChange}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Фильтр по автору" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все авторы</SelectItem>
                {uniqueAuthors.map(author => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </>
  );
}