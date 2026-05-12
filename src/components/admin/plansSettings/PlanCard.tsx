import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { Plan, PlanFeature } from './types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from './types';

interface PlanCardProps {
  plan: Plan;
  plans: Plan[];
  setPlans: (plans: Plan[]) => void;
  editingPlan: string | null;
  setEditingPlan: (id: string | null) => void;
  availableFeatures: PlanFeature[];
  onSavePlan: (planId: string) => void;
  toggleFeature: (planId: string, featureId: string) => void;
  addFeatureToPlan: (planId: string, feature: PlanFeature) => void;
  removeFeatureFromPlan: (planId: string, featureId: string) => void;
}

export default function PlanCard({
  plan,
  plans,
  setPlans,
  editingPlan,
  setEditingPlan,
  availableFeatures,
  onSavePlan,
  toggleFeature,
  addFeatureToPlan,
  removeFeatureFromPlan,
}: PlanCardProps) {
  return (
    <div className="border-2 rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow">
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
            {plan.activeUntil && new Date(plan.activeUntil) > new Date() && (
              <Badge className="bg-orange-100 text-orange-800">
                ⏰ До {new Date(plan.activeUntil).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </Badge>
            )}
            {plan.activeUntil && new Date(plan.activeUntil) <= new Date() && (
              <Badge className="bg-red-100 text-red-800">
                ⏱️ Истёк {new Date(plan.activeUntil).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
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
              <Label className="flex items-center gap-2">
                Активен до даты
                <Badge variant="outline" className="text-xs">
                  Автоархивирование
                </Badge>
              </Label>
              <Input
                type="datetime-local"
                value={plan.activeUntil ? new Date(plan.activeUntil).toISOString().slice(0, 16) : ''}
                onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? { ...p, activeUntil: e.target.value ? new Date(e.target.value).toISOString() : undefined } : p))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                После этой даты тариф автоматически скроется. Подходит для временных акций.
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
            <Button onClick={() => onSavePlan(plan.id)} className="flex-1">
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
          <div className="grid grid-cols-5 gap-4">
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
              <p className="text-sm text-gray-500">Активен с</p>
              <p className="font-semibold text-sm">
                {plan.activeFrom
                  ? new Date(plan.activeFrom).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Сейчас'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Статус</p>
              <Badge variant={plan.visible ? 'default' : 'secondary'}>
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
  );
}
