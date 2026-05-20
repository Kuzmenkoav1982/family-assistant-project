import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { adminFetch } from '@/lib/adminFetch';

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  applicable_plans: string[] | null;
  max_uses: number | null;
  current_uses: number;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  total_revenue_impact: number;
}

interface Props {
  apiUrl: string;
}

export default function PromoCodesManager({ apiUrl }: Props) {
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '10',
    applicable_plans: [] as string[],
    max_uses: '',
    valid_until: ''
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await adminFetch(`${apiUrl}?action=promo-codes`);

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setPromoCodes(data.promo_codes || []);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить промокоды',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPromo({ ...newPromo, code });
  };

  const handleCreatePromo = async () => {
    if (!newPromo.code) {
      toast({
        title: 'Ошибка',
        description: 'Введите код промокода',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await adminFetch(`${apiUrl}?action=create-promo`, {
        method: 'POST',
        body: JSON.stringify({
          code: newPromo.code,
          discount_type: newPromo.discount_type,
          discount_value: parseFloat(newPromo.discount_value),
          applicable_plans: newPromo.applicable_plans.length > 0 ? newPromo.applicable_plans : null,
          max_uses: newPromo.max_uses ? parseInt(newPromo.max_uses) : null,
          valid_until: newPromo.valid_until || null,
          admin_email: 'admin@family.com'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Промокод создан',
          description: `Код: ${newPromo.code}`
        });
        setShowCreateDialog(false);
        setNewPromo({
          code: '',
          discount_type: 'percent',
          discount_value: '10',
          applicable_plans: [],
          max_uses: '',
          valid_until: ''
        });
        fetchPromoCodes();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать промокод',
        variant: 'destructive'
      });
    }
  };

  const getDiscountLabel = (type: string, value: number) => {
    if (type === 'percent') return `${value}%`;
    if (type === 'fixed') return `₽${value}`;
    if (type === 'free_days') return `+${value} дн.`;
    return value.toString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Icon name="Loader2" className="animate-spin" size={40} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Tag" size={20} />
                Промокоды ({promoCodes.length})
              </CardTitle>
              <CardDescription>Создавайте и управляйте скидками</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Создать промокод
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {promoCodes.length > 0 ? (
              promoCodes.map(promo => (
                <div key={promo.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-lg font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded">
                        {promo.code}
                      </code>
                      {!promo.is_active && (
                        <Badge variant="outline" className="bg-gray-100">Деактивирован</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Icon name="Percent" size={14} />
                        Скидка: {getDiscountLabel(promo.discount_type, promo.discount_value)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Users" size={14} />
                        Использовано: {promo.current_uses}{promo.max_uses ? ` / ${promo.max_uses}` : ''}
                      </span>
                      {promo.valid_until && (
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" size={14} />
                          До: {new Date(promo.valid_until).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ₽{parseFloat(promo.total_revenue_impact.toString()).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Привлечено выручки</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Icon name="Tag" size={48} className="mx-auto mb-3 opacity-20" />
                <p>Промокодов пока нет</p>
                <p className="text-sm mt-1">Создайте первый промокод для привлечения клиентов</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Популярные шаблоны */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Sparkles" size={20} />
            Шаблоны акций
          </CardTitle>
          <CardDescription>Быстрое создание типовых промокодов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setNewPromo({
                  code: 'BLACKFRIDAY',
                  discount_type: 'percent',
                  discount_value: '50',
                  applicable_plans: ['premium'],
                  max_uses: '100',
                  valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
                setShowCreateDialog(true);
              }}
              className="p-4 border-2 border-dashed rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <h4 className="font-semibold mb-1">🔥 Чёрная пятница</h4>
              <p className="text-sm text-gray-600">50% скидка на Premium, 100 использований, 7 дней</p>
            </button>

            <button
              onClick={() => {
                setNewPromo({
                  code: 'WELCOME2024',
                  discount_type: 'percent',
                  discount_value: '20',
                  applicable_plans: [],
                  max_uses: '',
                  valid_until: ''
                });
                setShowCreateDialog(true);
              }}
              className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <h4 className="font-semibold mb-1">👋 Первая покупка</h4>
              <p className="text-sm text-gray-600">20% скидка для новых, без ограничений</p>
            </button>

            <button
              onClick={() => {
                setNewPromo({
                  code: 'GIFT30DAYS',
                  discount_type: 'free_days',
                  discount_value: '30',
                  applicable_plans: [],
                  max_uses: '50',
                  valid_until: ''
                });
                setShowCreateDialog(true);
              }}
              className="p-4 border-2 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
            >
              <h4 className="font-semibold mb-1">🎁 Подарок дней</h4>
              <p className="text-sm text-gray-600">+30 дней бесплатно, 50 использований</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Создать промокод</DialogTitle>
            <DialogDescription>Настройте параметры скидки или акции</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Код промокода</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newPromo.code}
                    onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                    placeholder="DISCOUNT2024"
                    className="font-mono"
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    <Icon name="Shuffle" size={16} />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Тип скидки</Label>
                <Select value={newPromo.discount_type} onValueChange={(v) => setNewPromo({ ...newPromo, discount_type: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Процент (%)</SelectItem>
                    <SelectItem value="fixed">Фикс. сумма (₽)</SelectItem>
                    <SelectItem value="free_days">Подарок дней</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Значение</Label>
                <Input
                  type="number"
                  value={newPromo.discount_value}
                  onChange={(e) => setNewPromo({ ...newPromo, discount_value: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Максимум использований (необязательно)</Label>
                <Input
                  type="number"
                  value={newPromo.max_uses}
                  onChange={(e) => setNewPromo({ ...newPromo, max_uses: e.target.value })}
                  placeholder="Без ограничений"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Действует до (необязательно)</Label>
                <Input
                  type="date"
                  value={newPromo.valid_until}
                  onChange={(e) => setNewPromo({ ...newPromo, valid_until: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label>Применим к тарифам (оставьте пустым для всех)</Label>
                <div className="flex gap-2 mt-2">
                  {['basic', 'standard', 'premium'].map(plan => (
                    <button
                      key={plan}
                      onClick={() => {
                        const plans = newPromo.applicable_plans.includes(plan)
                          ? newPromo.applicable_plans.filter(p => p !== plan)
                          : [...newPromo.applicable_plans, plan];
                        setNewPromo({ ...newPromo, applicable_plans: plans });
                      }}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        newPromo.applicable_plans.includes(plan)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {plan === 'basic' ? 'Базовый' : plan === 'standard' ? 'Семейный' : 'Премиум'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreatePromo}>
              <Icon name="Check" size={16} className="mr-2" />
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}