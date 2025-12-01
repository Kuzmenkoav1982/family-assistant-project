import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';
import { useChildrenDataQuery, useChildDataMutation } from '@/hooks/useChildrenDataQuery';

export function PurchasesSection({ child }: { child: FamilyMember }) {
  const { data, isLoading } = useChildrenDataQuery(child.id, 'purchases');
  const mutation = useChildDataMutation(child.id);

  const seasonIcons = {
    winter: '❄️',
    spring: '🌸',
    summer: '☀️',
    autumn: '🍂'
  };

  const seasonLabels = {
    winter: 'Зима',
    spring: 'Весна',
    summer: 'Лето',
    autumn: 'Осень'
  };

  const handleTogglePurchased = async (planId: string, itemId: string, purchased: boolean) => {
    try {
      await mutation.mutateAsync({
        action: 'update',
        child_id: child.id,
        type: 'purchase_item',
        item_id: itemId,
        data: { purchased: !purchased }
      });
    } catch (error) {
      console.error('Ошибка при обновлении покупки:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Загрузка покупок...
        </CardContent>
      </Card>
    );
  }

  const purchases = data?.purchases || [];

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    };
    const labels = {
      high: 'Срочно',
      medium: 'Средний',
      low: 'Низкий'
    };
    return <Badge className={styles[priority as keyof typeof styles]}>{labels[priority as keyof typeof labels]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="ShoppingBag" size={24} />
            Сезонные покупки для {child.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="winter" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="winter">❄️ Зима</TabsTrigger>
              <TabsTrigger value="spring">🌸 Весна</TabsTrigger>
              <TabsTrigger value="summer">☀️ Лето</TabsTrigger>
              <TabsTrigger value="autumn">🍂 Осень</TabsTrigger>
            </TabsList>

            {(['winter', 'spring', 'summer', 'autumn'] as const).map((season) => {
              const seasonPlan = purchases.find(p => p.season === season);
              const items = seasonPlan?.items || [];
              
              return (
                <TabsContent key={season} value={season} className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{seasonIcons[season]}</span>
                      <h3 className="text-xl font-bold">{seasonLabels[season]}</h3>
                    </div>
                    <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                      <Icon name="Plus" size={16} />
                      Добавить покупку
                    </Button>
                  </div>

                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Пока нет запланированных покупок
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                            item.purchased 
                              ? 'bg-gray-50 border-gray-200 opacity-60' 
                              : 'bg-white border-blue-200'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={item.purchased}
                            onChange={() => handleTogglePurchased(seasonPlan!.id, item.id, item.purchased)}
                            className="mt-1 w-5 h-5 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className={`font-semibold ${item.purchased ? 'line-through text-gray-500' : ''}`}>
                                {item.name}
                              </h4>
                              {!item.purchased && getPriorityBadge(item.priority)}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              {item.estimated_cost && (
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Icon name="Wallet" size={14} />
                                  {item.estimated_cost.toLocaleString()} ₽
                                </span>
                              )}
                              {item.purchased && item.purchase_date && (
                                <Badge className="bg-green-100 text-green-700">
                                  <Icon name="Check" size={14} className="mr-1" />
                                  Куплено
                                </Badge>
                              )}
                            </div>
                          </div>
                          {!item.purchased && (
                            <Button 
                              size="sm" 
                              className="gap-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleTogglePurchased(seasonPlan!.id, item.id, item.purchased)}
                            >
                              <Icon name="Check" size={14} />
                              Куплено
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-900">Итого:</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {items
                            .filter(i => !i.purchased)
                            .reduce((sum, item) => sum + (item.estimated_cost || 0), 0)
                            .toLocaleString()} ₽
                        </div>
                        <div className="text-sm text-gray-600">
                          Осталось купить: {items.filter(i => !i.purchased).length} из {items.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}