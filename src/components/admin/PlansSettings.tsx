import { useState, useEffect } from 'react';
import func2url from '@/../backend/func2url.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PlanFeature {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
  category: 'basic' | 'family' | 'ai' | 'analytics' | 'support';
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  periodMonths: number;
  description: string;
  visible: boolean;
  popular?: boolean;
  features: PlanFeature[];
  functionsCount: number;
  discount?: number;
  activeFrom?: string;
}

const AVAILABLE_FEATURES: PlanFeature[] = [
  { id: 'members_5', name: 'До 5 членов семьи', enabled: false, category: 'basic', description: 'Базовый лимит участников' },
  { id: 'members_10', name: 'До 10 членов семьи', enabled: false, category: 'basic', description: 'Расширенный лимит' },
  { id: 'members_unlimited', name: 'Неограниченное число членов', enabled: false, category: 'basic', description: 'Без ограничений' },
  { id: 'calendar', name: 'Календарь событий (базовый)', enabled: false, category: 'basic', description: 'Планирование событий' },
  { id: 'shopping', name: 'Списки покупок', enabled: false, category: 'basic', description: 'Совместные списки' },
  { id: 'finance', name: 'Финансовый учет', enabled: false, category: 'basic', description: 'Учёт доходов и расходов' },
  { id: 'tasks', name: 'Рецепты (до 50 рецептов)', enabled: false, category: 'family', description: 'Семейная кулинарная книга' },
  { id: 'family_chat', name: 'Семейный чат', enabled: false, category: 'family', description: 'Общение внутри семьи' },
  { id: 'voting', name: 'Комментарии 1ТБ', enabled: false, category: 'family', description: 'Совместные решения' },
  { id: 'children_health', name: 'Здоровье детей', enabled: false, category: 'family', description: 'Медицинские записи детей' },
  { id: 'medical', name: 'Медицинские записи', enabled: false, category: 'family', description: 'Карты всех членов семьи' },
  { id: 'ai_assistant', name: 'ИИ-помощник "Домовой"', enabled: false, category: 'ai', description: 'Умный семейный ассистент' },
  { id: 'ai_recommendations', name: 'Автоматические напоминания', enabled: false, category: 'ai', description: 'Персональные рекомендации' },
  { id: 'ai_analysis', name: 'Подбор решений по продуктам', enabled: false, category: 'ai', description: 'Автоматический анализ' },
  { id: 'ai_budget', name: 'Анализ семейного бюджета', enabled: false, category: 'ai', description: 'Финансовые инсайты' },
  { id: 'trips', name: 'Путешествия и поездки', enabled: false, category: 'family', description: 'Планирование путешествий' },
  { id: 'analytics', name: 'Аналитика и отчеты', enabled: false, category: 'analytics', description: 'Детальная статистика' },
  { id: 'export', name: 'Экспорт данных', enabled: false, category: 'analytics', description: 'Выгрузка в Excel/PDF' },
  { id: 'family_tree', name: 'Семейное древо', enabled: false, category: 'family', description: 'Генеалогическое древо' },
  { id: 'support_basic', name: 'Техподдержка', enabled: false, category: 'support', description: 'Email-поддержка' },
  { id: 'support_priority', name: 'Приоритетная поддержка', enabled: false, category: 'support', description: 'Быстрый ответ' },
  { id: 'support_vip', name: 'VIP поддержка 24/7', enabled: false, category: 'support', description: 'Круглосуточная помощь' },
  { id: 'no_ai', name: 'Нет AI-помощника', enabled: false, category: 'ai', description: 'Без ИИ-функций' },
  { id: 'unlimited_storage', name: 'Безлимитная история', enabled: false, category: 'analytics', description: 'Вечное хранение' },
  { id: 'alice', name: 'Интеграция с Алисой', enabled: false, category: 'ai', description: 'Голосовое управление' },
];

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Базовый',
    price: 299,
    period: '1 месяц',
    periodMonths: 1,
    description: 'Гибкая оплата',
    visible: true,
    functionsCount: 6,
    features: [
      { id: 'members_5', name: 'До 5 членов семьи', enabled: true, category: 'basic' },
      { id: 'calendar', name: 'Календарь событий (базовый)', enabled: true, category: 'basic' },
      { id: 'shopping', name: 'Списки покупок', enabled: true, category: 'basic' },
      { id: 'finance', name: 'Финансовый учет', enabled: true, category: 'basic' },
      { id: 'family_chat', name: 'Семейный чат', enabled: true, category: 'family' },
      { id: 'support_basic', name: 'Техподдержка', enabled: true, category: 'support' },
    ]
  },
  {
    id: 'standard',
    name: 'Семейный',
    price: 799,
    period: '3 месяца',
    periodMonths: 3,
    description: 'Все функции Базового',
    popular: true,
    visible: true,
    functionsCount: 8,
    discount: 20,
    features: [
      { id: 'members_10', name: 'До 10 членов семьи', enabled: true, category: 'basic' },
      { id: 'tasks', name: 'Рецепты (до 50 рецептов)', enabled: true, category: 'family' },
      { id: 'voting', name: 'Комментарии 1ТБ', enabled: true, category: 'family' },
      { id: 'children_health', name: 'Здоровье детей', enabled: true, category: 'family' },
      { id: 'medical', name: 'Медицинские записи', enabled: true, category: 'family' },
      { id: 'ai_recommendations', name: 'Автоматические напоминания', enabled: true, category: 'ai' },
      { id: 'support_priority', name: 'Приоритетная поддержка', enabled: true, category: 'support' },
      { id: 'alice', name: 'Интеграция с Алисой', enabled: true, category: 'ai' },
    ]
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 2499,
    period: '12 месяцев',
    periodMonths: 12,
    description: 'Все функции Семейного',
    visible: true,
    functionsCount: 9,
    discount: 50,
    features: [
      { id: 'members_unlimited', name: 'Неограниченное число членов', enabled: true, category: 'basic' },
      { id: 'ai_assistant', name: 'ИИ-помощник "Домовой"', enabled: true, category: 'ai' },
      { id: 'ai_analysis', name: 'Подбор решений по продуктам', enabled: true, category: 'ai' },
      { id: 'ai_budget', name: 'Анализ семейного бюджета', enabled: true, category: 'ai' },
      { id: 'trips', name: 'Путешествия и поездки', enabled: true, category: 'family' },
      { id: 'analytics', name: 'Аналитика и отчеты', enabled: true, category: 'analytics' },
      { id: 'export', name: 'Экспорт данных', enabled: true, category: 'analytics' },
      { id: 'family_tree', name: 'Семейное древо', enabled: true, category: 'family' },
      { id: 'support_vip', name: 'VIP поддержка 24/7', enabled: true, category: 'support' },
    ]
  }
];

const CATEGORY_LABELS = {
  basic: 'Базовые функции',
  family: 'Семейные функции',
  ai: 'ИИ и автоматизация',
  analytics: 'Аналитика и отчёты',
  support: 'Поддержка'
};

const CATEGORY_COLORS = {
  basic: 'bg-blue-100 text-blue-800',
  family: 'bg-purple-100 text-purple-800',
  ai: 'bg-green-100 text-green-800',
  analytics: 'bg-orange-100 text-orange-800',
  support: 'bg-gray-100 text-gray-800'
};

export default function PlansSettings() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<PlanFeature[]>([]);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [instructionOpen, setInstructionOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiUrl = func2url['subscription-plans'] || '';

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      // Если API не задеплоен, используем дефолтные планы
      if (!apiUrl) {
        console.log('subscription-plans API not deployed, using default plans');
        setPlans(DEFAULT_PLANS);
        setAvailableFeatures(AVAILABLE_FEATURES);
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}?action=all`, {
        headers: {
          'X-Admin-Token': 'admin_authenticated'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        const mappedPlans = data.plans.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.price),
          period: p.period,
          periodMonths: p.period_months,
          description: p.description,
          visible: p.visible,
          popular: p.popular,
          discount: p.discount,
          functionsCount: p.functions_count,
          features: p.features || [],
          activeFrom: p.active_from
        }));

        setPlans(mappedPlans);
        setAvailableFeatures(data.available_features || []);
      } else {
        // Fallback на дефолтные планы при ошибке
        setPlans(DEFAULT_PLANS);
        setAvailableFeatures(AVAILABLE_FEATURES);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
      // Fallback на дефолтные планы
      setPlans(DEFAULT_PLANS);
      setAvailableFeatures(AVAILABLE_FEATURES);
      toast({
        title: 'Используются локальные данные',
        description: 'Подключение к API недоступно. Показаны локальные тарифы.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (!apiUrl) {
      toast({
        title: 'API недоступен',
        description: 'Сохранение невозможно. Функция subscription-plans не задеплоена.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_authenticated'
        },
        body: JSON.stringify({
          plan_id: plan.id,
          name: plan.name,
          price: plan.price,
          period: plan.period,
          period_months: plan.periodMonths,
          description: plan.description,
          visible: plan.visible,
          popular: plan.popular,
          discount: plan.discount,
          functions_count: plan.functionsCount,
          features: plan.features,
          active_from: plan.activeFrom
        })
      });

      if (response.ok) {
        toast({
          title: 'Тариф сохранён',
          description: 'Изменения успешно применены'
        });
        setEditingPlan(null);
        loadPlans();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive'
      });
    }
  };

  const toggleFeature = (planId: string, featureId: string) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        const newFeatures = p.features.map(f => 
          f.id === featureId ? { ...f, enabled: !f.enabled } : f
        );
        return { ...p, features: newFeatures, functionsCount: newFeatures.filter(f => f.enabled).length };
      }
      return p;
    }));
  };

  const addFeatureToPlan = (planId: string, feature: PlanFeature) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        const exists = p.features.find(f => f.id === feature.id);
        if (!exists) {
          const newFeatures = [...p.features, { ...feature, enabled: true }];
          return { ...p, features: newFeatures, functionsCount: newFeatures.filter(f => f.enabled).length };
        }
      }
      return p;
    }));
  };

  const removeFeatureFromPlan = (planId: string, featureId: string) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        const newFeatures = p.features.filter(f => f.id !== featureId);
        return { ...p, features: newFeatures, functionsCount: newFeatures.filter(f => f.enabled).length };
      }
      return p;
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icon name="Loader2" className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Инструкция */}
      <Collapsible open={instructionOpen} onOpenChange={setInstructionOpen}>
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-blue-100/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Icon name="Info" size={20} className="text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Инструкция по управлению тарифами</CardTitle>
                    <CardDescription>Как настроить тарифные планы для пользователей</CardDescription>
                  </div>
                </div>
                <Icon 
                  name={instructionOpen ? "ChevronUp" : "ChevronDown"} 
                  size={24} 
                  className="text-blue-600"
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Icon name="Edit2" size={16} />
                    Как редактировать тариф
                  </h4>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Нажмите "Редактировать" на нужном тарифе</li>
                    <li>Измените название, цену, период или описание</li>
                    <li>Включите/выключите нужные функции</li>
                    <li>Нажмите "Сохранить изменения"</li>
                  </ol>
                </div>

                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Icon name="Plus" size={16} />
                    Как добавить функции
                  </h4>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Откройте режим редактирования тарифа</li>
                    <li>Найдите раздел "Добавить функцию"</li>
                    <li>Выберите нужные функции из списка</li>
                    <li>Они автоматически добавятся в тариф</li>
                  </ol>
                </div>

                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Icon name="Eye" size={16} />
                    Видимость тарифа
                  </h4>
                  <p className="text-sm text-gray-700">
                    Переключатель "Видимость" управляет отображением тарифа на сайте. 
                    Выключенные тарифы не показываются пользователям, но активные подписки продолжают работать.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Icon name="Tag" size={16} />
                    Скидки и периоды
                  </h4>
                  <p className="text-sm text-gray-700">
                    Укажите процент скидки для длинных периодов подписки (например, 20% за 3 месяца, 50% за год). 
                    Это мотивирует пользователей покупать долгие подписки.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Icon name="Calendar" size={16} />
                    Планирование запуска
                  </h4>
                  <p className="text-sm text-gray-700">
                    Поле "Активен с даты" позволяет запланировать появление тарифа на сайте. 
                    До указанной даты тариф не будет виден пользователям, даже если он включён. 
                    Используйте для предзапуска акций и новых тарифов.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <Icon name="AlertTriangle" size={16} />
                  Важно помнить
                </h4>
                <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                  <li>Изменение цены не влияет на уже активные подписки</li>
                  <li>Удаление функции из тарифа не отключит её у текущих пользователей</li>
                  <li>Сохраняйте изменения после каждого редактирования</li>
                  <li>Тарифы с будущей датой "Активен с" не отображаются на сайте до этой даты</li>
                  <li>Рекомендуем не менять цены чаще 1 раза в квартал</li>
                </ul>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Настройки тарифов */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" size={20} />
                Настройки тарифных планов
              </CardTitle>
              <CardDescription>Редактирование цен, описаний и видимости тарифов</CardDescription>
            </div>
            <Button
              onClick={() => {
                toast({
                  title: 'Функция в разработке',
                  description: 'Создание новых тарифов скоро будет доступно'
                });
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Создать тариф
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {plans.map(plan => (
            <div key={plan.id} className="border-2 rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    {plan.popular && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        🔥 Популярный
                      </Badge>
                    )}
                    {plan.discount && (
                      <Badge className="bg-green-100 text-green-800">
                        Экономия {plan.discount}%
                      </Badge>
                    )}
                    {plan.activeFrom && new Date(plan.activeFrom) > new Date() && (
                      <Badge className="bg-blue-100 text-blue-800">
                        📅 Запуск {new Date(plan.activeFrom).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{plan.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Видимость</Label>
                    <Switch checked={plan.visible} onCheckedChange={(checked) => {
                      setPlans(plans.map(p => p.id === plan.id ? { ...p, visible: checked } : p));
                    }} />
                  </div>
                  <Button
                    size="sm"
                    variant={editingPlan === plan.id ? 'destructive' : 'default'}
                    onClick={() => setEditingPlan(editingPlan === plan.id ? null : plan.id)}
                  >
                    <Icon name={editingPlan === plan.id ? 'X' : 'Edit2'} size={14} className="mr-1" />
                    {editingPlan === plan.id ? 'Закрыть' : 'Редактировать'}
                  </Button>
                </div>
              </div>

              {editingPlan === plan.id ? (
                <div className="space-y-6 pt-4 border-t-2">
                  {/* Основные параметры */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Название тарифа</Label>
                      <Input
                        value={plan.name}
                        onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? { ...p, name: e.target.value } : p))}
                        className="mt-1"
                        placeholder="Например: Семейный"
                      />
                    </div>
                    <div>
                      <Label>Цена (₽)</Label>
                      <Input
                        type="number"
                        value={plan.price}
                        onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? { ...p, price: parseInt(e.target.value) || 0 } : p))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Период действия</Label>
                      <Input
                        value={plan.period}
                        onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? { ...p, period: e.target.value } : p))}
                        className="mt-1"
                        placeholder="Например: 3 месяца"
                      />
                    </div>
                    <div>
                      <Label>Скидка (%)</Label>
                      <Input
                        type="number"
                        value={plan.discount || 0}
                        onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? { ...p, discount: parseInt(e.target.value) || undefined } : p))}
                        className="mt-1"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="flex items-center gap-2">
                        Активен с даты
                        <Badge variant="outline" className="text-xs">
                          Планирование запуска
                        </Badge>
                      </Label>
                      <Input
                        type="datetime-local"
                        value={plan.activeFrom ? new Date(plan.activeFrom).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? { ...p, activeFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined } : p))}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Тариф появится на сайте с этой даты. Оставьте пустым для немедленной активации.
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label>Описание</Label>
                      <Textarea
                        value={plan.description}
                        onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? { ...p, description: e.target.value } : p))}
                        className="mt-1"
                        rows={2}
                        placeholder="Краткое описание тарифа"
                      />
                    </div>
                  </div>

                  {/* Функции тарифа */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">Функции тарифа ({plan.functionsCount})</h4>
                      <Badge variant="outline">{plan.features.filter(f => f.enabled).length} активных</Badge>
                    </div>

                    {/* Группировка по категориям */}
                    {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
                      const categoryFeatures = plan.features.filter(f => f.category === category);
                      if (categoryFeatures.length === 0) return null;

                      return (
                        <div key={category} className="space-y-2">
                          <Badge className={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}>
                            {label}
                          </Badge>
                          <div className="grid grid-cols-1 gap-2">
                            {categoryFeatures.map(feature => (
                              <div
                                key={feature.id}
                                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-start gap-3 flex-1">
                                  <Switch
                                    checked={feature.enabled}
                                    onCheckedChange={() => toggleFeature(plan.id, feature.id)}
                                  />
                                  <div>
                                    <p className="font-medium text-sm">{feature.name}</p>
                                    {feature.description && (
                                      <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFeatureFromPlan(plan.id, feature.id)}
                                >
                                  <Icon name="Trash2" size={14} className="text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Добавление новых функций */}
                    <div className="pt-4 border-t">
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        <Icon name="Plus" size={16} />
                        Добавить функцию
                      </h5>
                      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                        {availableFeatures.filter(f => !plan.features.find(pf => pf.id === f.id)).map(feature => (
                          <Button
                            key={feature.id}
                            variant="outline"
                            size="sm"
                            onClick={() => addFeatureToPlan(plan.id, feature)}
                            className="justify-start text-left h-auto py-2"
                          >
                            <Icon name="Plus" size={14} className="mr-2 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm">{feature.name}</p>
                              {feature.description && (
                                <p className="text-xs text-gray-500">{feature.description}</p>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex gap-2">
                    <Button onClick={() => handleSavePlan(plan.id)} className="flex-1">
                      <Icon name="Save" size={16} className="mr-2" />
                      Сохранить изменения
                    </Button>
                    <Button variant="outline" onClick={() => setEditingPlan(null)}>
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Цена</p>
                      <p className="text-2xl font-bold text-purple-600">₽{plan.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Период</p>
                      <p className="font-semibold">{plan.period}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Функций</p>
                      <p className="font-semibold">{plan.functionsCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Статус</p>
                      <Badge variant={plan.visible ? "default" : "secondary"}>
                        {plan.visible ? 'Виден' : 'Скрыт'}
                      </Badge>
                    </div>
                  </div>

                  {/* Краткий список функций */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Включенные функции:</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.features.filter(f => f.enabled).slice(0, 6).map(feature => (
                        <Badge key={feature.id} variant="outline" className="text-xs">
                          {feature.name}
                        </Badge>
                      ))}
                      {plan.features.filter(f => f.enabled).length > 6 && (
                        <Badge variant="secondary" className="text-xs">
                          +{plan.features.filter(f => f.enabled).length - 6} ещё
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Финансовые настройки */}
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

      {/* Уведомления */}
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