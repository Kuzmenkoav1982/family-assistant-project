import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

export function PurchasesSection({ child }: { child: FamilyMember }) {
  const seasons = [
    {
      season: 'Зима',
      icon: '❄️',
      color: 'blue',
      items: [
        { name: 'Зимняя куртка', priority: 'high', cost: 8000, purchased: false },
        { name: 'Зимние ботинки', priority: 'high', cost: 5000, purchased: false },
        { name: 'Термобелье', priority: 'medium', cost: 2000, purchased: true }
      ]
    },
    {
      season: 'Весна',
      icon: '🌸',
      color: 'green',
      items: [
        { name: 'Весенние кроссовки', priority: 'medium', cost: 4000, purchased: false },
        { name: 'Ветровка', priority: 'low', cost: 3000, purchased: false }
      ]
    },
    {
      season: 'Лето',
      icon: '☀️',
      color: 'yellow',
      items: [
        { name: 'Летние сандалии', priority: 'medium', cost: 2500, purchased: false },
        { name: 'Купальник/плавки', priority: 'medium', cost: 1500, purchased: false }
      ]
    },
    {
      season: 'Осень',
      icon: '🍂',
      color: 'orange',
      items: [
        { name: 'Школьная форма', priority: 'high', cost: 7000, purchased: false },
        { name: 'Ранец', priority: 'high', cost: 5000, purchased: false },
        { name: 'Канцелярия', priority: 'high', cost: 3000, purchased: true },
        { name: 'Осенняя обувь', priority: 'medium', cost: 4000, purchased: false }
      ]
    }
  ];

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

            {seasons.map((seasonData, seasonIdx) => (
              <TabsContent 
                key={seasonIdx} 
                value={seasonData.season.toLowerCase() === 'зима' ? 'winter' : 
                       seasonData.season.toLowerCase() === 'весна' ? 'spring' :
                       seasonData.season.toLowerCase() === 'лето' ? 'summer' : 'autumn'}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{seasonData.icon}</span>
                    <h3 className="text-xl font-bold">{seasonData.season}</h3>
                  </div>
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                    <Icon name="Plus" size={16} />
                    Добавить покупку
                  </Button>
                </div>

                <div className="space-y-3">
                  {seasonData.items.map((item, itemIdx) => (
                    <div 
                      key={itemIdx} 
                      className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                        item.purchased 
                          ? 'bg-gray-50 border-gray-200 opacity-60' 
                          : 'bg-white border-blue-200'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={item.purchased}
                        className="mt-1 w-5 h-5"
                        readOnly
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-semibold ${item.purchased ? 'line-through text-gray-500' : ''}`}>
                            {item.name}
                          </h4>
                          {!item.purchased && getPriorityBadge(item.priority)}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Icon name="Wallet" size={14} />
                            {item.cost.toLocaleString()} ₽
                          </span>
                          {item.purchased && (
                            <Badge className="bg-green-100 text-green-700">
                              <Icon name="Check" size={14} className="mr-1" />
                              Куплено
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!item.purchased && (
                        <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                          <Icon name="Check" size={14} />
                          Куплено
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-900">Итого:</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {seasonData.items.reduce((sum, item) => sum + (item.purchased ? 0 : item.cost), 0).toLocaleString()} ₽
                      </div>
                      <div className="text-sm text-gray-600">
                        Осталось купить: {seasonData.items.filter(i => !i.purchased).length} из {seasonData.items.length}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
