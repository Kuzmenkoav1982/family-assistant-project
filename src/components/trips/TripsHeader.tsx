import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';

interface TripsHeaderProps {
  activeTab: string;
  isInstructionOpen: boolean;
  onTabChange: (tab: string) => void;
  onInstructionToggle: (open: boolean) => void;
  onNavigateBack: () => void;
  onNavigateToWishlist: () => void;
  getTabCount: (status: string) => number;
}

export function TripsHeader({
  activeTab,
  isInstructionOpen,
  onTabChange,
  onInstructionToggle,
  onNavigateBack,
  onNavigateToWishlist,
  getTabCount,
}: TripsHeaderProps) {
  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onNavigateBack}>
              <Icon name="ArrowLeft" size={24} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Путешествия</h1>
              <p className="text-sm text-gray-500">Планируйте незабываемые поездки</p>
            </div>
          </div>
          <Button onClick={onNavigateToWishlist} variant="outline" className="gap-2">
            <Icon name="Star" size={18} />
            Wish List
          </Button>
        </div>

        <Collapsible open={isInstructionOpen} onOpenChange={onInstructionToggle}>
          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                  <h3 className="font-semibold text-blue-900 text-lg">
                    Как планировать путешествия
                  </h3>
                  <Icon
                    name={isInstructionOpen ? 'ChevronUp' : 'ChevronDown'}
                    className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110"
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-blue-800">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">🗺️ Для чего нужен раздел Путешествия?</p>
                        <p className="text-sm">
                          Раздел помогает планировать семейные поездки: куда, когда, бюджет.
                          Храните билеты, маршруты, дневник впечатлений и фото в одном месте.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">✈️ Как создать поездку?</p>
                        <ol className="text-sm space-y-1 ml-4 list-decimal">
                          <li>Нажмите кнопку "+" внизу справа</li>
                          <li>Укажите название и место назначения</li>
                          <li>Выберите даты начала и окончания</li>
                          <li>Установите бюджет (необязательно)</li>
                          <li>Нажмите "Создать" — поездка добавится в список</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📋 Что можно добавить в поездку?</p>
                        <ul className="text-sm space-y-1 ml-4 list-disc">
                          <li>
                            <strong>⭐ Wish List мест:</strong> планируйте какие места хотите посетить с приоритетами
                          </li>
                          <li>
                            <strong>🤖 AI-рекомендации:</strong> получите список лучших мест от YandexGPT
                          </li>
                          <li>
                            <strong>✅ Отметки посещений:</strong> отмечайте места как посещённые прямо в поездке
                          </li>
                          <li>
                            <strong>🎫 Билеты и брони:</strong> авиа, отели, транспорт с номерами
                          </li>
                          <li>
                            <strong>🗺️ Маршрут:</strong> план по дням с местами и временем
                          </li>
                          <li>
                            <strong>📝 Дневник:</strong> записывайте впечатления прямо в поездке
                          </li>
                          <li>
                            <strong>📸 Фото:</strong> создайте альбом из путешествия (требуется подписка "Полный пакет")
                          </li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">⭐ Как работает Wish List мест?</p>
                        <ol className="text-sm space-y-1 ml-4 list-decimal">
                          <li>Откройте поездку → вкладка "Wish List"</li>
                          <li>Нажмите "Добавить место" или "AI-рекомендации"</li>
                          <li>AI предложит 7-10 лучших мест для посещения в вашем направлении</li>
                          <li>Добавьте понравившиеся места одной кнопкой</li>
                          <li>Установите приоритеты: 🔥 высокий, ⭐ средний, 💤 низкий</li>
                          <li>В поездке отмечайте посещённые места — они перейдут в раздел "Посещено"</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🌍 Общий Wish List — места мечты</p>
                        <p className="text-sm">
                          Нажмите "Wish List" вверху — добавьте туда места, куда мечтаете поехать.
                          Когда придёт время — превратите мечту в реальную поездку одной кнопкой!
                        </p>
                      </div>

                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="font-medium mb-1 text-sm">💡 Совет:</p>
                        <p className="text-sm">
                          Используйте AI-рекомендации для поиска интересных мест! YandexGPT знает все популярные 
                          достопримечательности, музеи и рестораны. Загружайте фото сразу (подписка "Полный пакет") — 
                          потом будет приятно вспоминать. Все поездки архивируются автоматически.
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="w-full grid grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="all">Все ({getTabCount('all')})</TabsTrigger>
            <TabsTrigger value="planning">План ({getTabCount('planning')})</TabsTrigger>
            <TabsTrigger value="booked">Брони ({getTabCount('booked')})</TabsTrigger>
            <TabsTrigger value="ongoing" className="hidden lg:block">
              В пути ({getTabCount('ongoing')})
            </TabsTrigger>
            <TabsTrigger value="completed">Архив ({getTabCount('completed')})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}