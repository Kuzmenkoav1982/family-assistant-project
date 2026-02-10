import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

export default function Purchases() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Icon name="ShoppingBag" size={32} className="text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">План покупок</h1>
            <p className="text-gray-600">Планируйте покупки для всей семьи по сезонам</p>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">💡</div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                  <Icon name="Info" size={16} />
                  Как работает План покупок
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  Здесь вы можете планировать покупки для всей семьи: одежду, обувь, технику и другие необходимые вещи.
                </p>
                <div className="space-y-1">
                  <div className="flex items-start gap-2 text-sm text-blue-700">
                    <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0" />
                    <span>Планируйте покупки по сезонам: зима, весна, лето, осень</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-blue-700">
                    <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0" />
                    <span>Оценивайте стоимость и приоритет каждой покупки</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-blue-700">
                    <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0" />
                    <span>Отмечайте купленные вещи, чтобы не забыть ничего важного</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="winter" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="winter" className="gap-2">
              ❄️ Зима
            </TabsTrigger>
            <TabsTrigger value="spring" className="gap-2">
              🌸 Весна
            </TabsTrigger>
            <TabsTrigger value="summer" className="gap-2">
              ☀️ Лето
            </TabsTrigger>
            <TabsTrigger value="autumn" className="gap-2">
              🍂 Осень
            </TabsTrigger>
          </TabsList>

          {['winter', 'spring', 'summer', 'autumn'].map((season) => (
            <TabsContent key={season} value={season} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="ShoppingCart" size={24} />
                      План на {season === 'winter' ? 'зиму' : season === 'spring' ? 'весну' : season === 'summer' ? 'лето' : 'осень'}
                    </CardTitle>
                    <Button className="gap-2">
                      <Icon name="Plus" size={16} />
                      Добавить покупку
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="ShoppingBag" size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>Покупок на этот сезон пока нет</p>
                    <p className="text-sm">Добавьте первую покупку в план</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="CheckCircle2" size={24} className="text-green-600" />
                    Куплено
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 text-center py-4">
                    Пока ничего не куплено
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
