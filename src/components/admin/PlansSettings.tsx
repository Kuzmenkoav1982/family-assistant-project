import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_PLANS = [
  {
    id: 'basic',
    name: 'Базовый',
    price: 299,
    period: '1 месяц',
    description: 'Гибкая оплата',
    visible: true,
    features: ['До 5 членов семьи', 'Основные функции', 'Календарь событий', 'Списки покупок', 'Финансовый учет', 'Техподдержка']
  },
  {
    id: 'standard',
    name: 'Семейный',
    price: 799,
    period: '3 месяца',
    description: 'Все функции Базового',
    popular: true,
    visible: true,
    features: ['До 10 членов семьи', 'Все функции Базового', 'Рецепты и меню', 'Голосования', 'Здоровье детей', 'Медицинские записи', 'Приоритетная поддержка', 'Экономия 20%']
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 2499,
    period: '12 месяцев',
    description: 'Все функции Семейного',
    visible: true,
    features: ['Неограниченное число членов', 'Все функции Семейного', 'ИИ-помощник', 'Путешествия и поездки', 'Аналитика и отчеты', 'Экспорт данных', 'Семейное древо', 'VIP поддержка 24/7', 'Экономия 50%']
  }
];

export default function PlansSettings() {
  const { toast } = useToast();
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  const handleSavePlan = (planId: string) => {
    toast({
      title: 'Тариф сохранён',
      description: 'Изменения применятся после обновления страницы'
    });
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Настройки тарифных планов
          </CardTitle>
          <CardDescription>Редактирование цен, описаний и видимости тарифов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {plans.map(plan => (
            <div key={plan.id} className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label>Видимость</Label>
                    <Switch checked={plan.visible} onCheckedChange={(checked) => {
                      setPlans(plans.map(p => p.id === plan.id ? { ...p, visible: checked } : p));
                    }} />
                  </div>
                  <Button
                    size="sm"
                    variant={editingPlan === plan.id ? 'default' : 'outline'}
                    onClick={() => setEditingPlan(editingPlan === plan.id ? null : plan.id)}
                  >
                    <Icon name={editingPlan === plan.id ? 'X' : 'Edit2'} size={14} className="mr-1" />
                    {editingPlan === plan.id ? 'Отмена' : 'Редактировать'}
                  </Button>
                </div>
              </div>

              {editingPlan === plan.id ? (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label>Название</Label>
                    <Input
                      value={plan.name}
                      onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? { ...p, name: e.target.value } : p))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Цена (₽)</Label>
                    <Input
                      type="number"
                      value={plan.price}
                      onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? { ...p, price: parseInt(e.target.value) } : p))}
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Описание</Label>
                    <Textarea
                      value={plan.description}
                      onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? { ...p, description: e.target.value } : p))}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button onClick={() => handleSavePlan(plan.id)}>
                      <Icon name="Save" size={16} className="mr-2" />
                      Сохранить изменения
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Цена</p>
                    <p className="text-2xl font-bold">₽{plan.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Период</p>
                    <p className="font-semibold">{plan.period}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Функций</p>
                    <p className="font-semibold">{plan.features.length}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="DollarSign" size={20} />
            Финансовые настройки
          </CardTitle>
          <CardDescription>Реквизиты и настройки платёжной системы</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>ЮKassa Shop ID</Label>
            <Input placeholder="123456" className="mt-1 font-mono" />
          </div>
          <div>
            <Label>ЮKassa Secret Key</Label>
            <Input type="password" placeholder="live_***" className="mt-1 font-mono" />
          </div>
          <div>
            <Label>Email для уведомлений</Label>
            <Input type="email" placeholder="finance@family.com" className="mt-1" />
          </div>
          <div className="pt-4 border-t">
            <Button>
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить настройки
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Bell" size={20} />
            Уведомления пользователям
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold">Напоминание об истечении</h4>
              <p className="text-sm text-gray-600">За сколько дней предупреждать</p>
            </div>
            <Input type="number" defaultValue="3" className="w-20 text-center" min="1" max="30" />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold">Push-уведомления</h4>
              <p className="text-sm text-gray-600">Отправлять в браузер</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
