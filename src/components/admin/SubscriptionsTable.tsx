import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  family_id: string;
  family_name: string;
  owner_name: string;
  owner_email: string;
  plan_type: string;
  status: string;
  amount: number;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

interface Props {
  apiUrl: string;
}

const PLAN_NAMES: Record<string, string> = {
  basic: 'Базовый',
  standard: 'Семейный',
  premium: 'Премиум',
  full: 'Полный пакет',
  ai_assistant: 'AI-помощник'
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Активна',
  pending: 'Ожидает оплаты',
  cancelled: 'Отменена',
  expired: 'Истекла'
};

export default function SubscriptionsTable({ apiUrl }: Props) {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extendDays, setExtendDays] = useState('30');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [subscriptions, searchQuery, statusFilter, planFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}?action=subscriptions`, {
        headers: {
          'X-Admin-Token': 'admin_authenticated'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить подписки',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...subscriptions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.family_name.toLowerCase().includes(query) ||
        sub.owner_email.toLowerCase().includes(query) ||
        sub.owner_name.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter(sub => sub.plan_type === planFilter);
    }

    setFilteredSubs(filtered);
  };

  const handleExtendSubscription = async () => {
    if (!selectedSub) return;

    try {
      const response = await fetch(`${apiUrl}?action=extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_authenticated'
        },
        body: JSON.stringify({
          subscription_id: selectedSub.id,
          days: parseInt(extendDays),
          admin_email: 'admin@family.com'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Подписка продлена',
          description: `Добавлено ${extendDays} дней`
        });
        setShowExtendDialog(false);
        fetchSubscriptions();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось продлить подписку',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {STATUS_LABELS[status] || status}
      </Badge>
    );
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
                <Icon name="Users" size={20} />
                Все подписки ({filteredSubs.length})
              </CardTitle>
              <CardDescription>Управление и мониторинг подписок</CardDescription>
            </div>
            <Button onClick={fetchSubscriptions} variant="outline" size="sm">
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Поиск</Label>
              <Input
                placeholder="Имя семьи или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Статус</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активна</SelectItem>
                  <SelectItem value="pending">Ожидает оплаты</SelectItem>
                  <SelectItem value="cancelled">Отменена</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Тариф</Label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все тарифы</SelectItem>
                  <SelectItem value="basic">Базовый</SelectItem>
                  <SelectItem value="standard">Семейный</SelectItem>
                  <SelectItem value="premium">Премиум</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Семья</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тариф</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">До окончания</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubs.length > 0 ? (
                    filteredSubs.map(sub => {
                      const daysRemaining = getDaysRemaining(sub.end_date);
                      const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0;

                      return (
                        <tr key={sub.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{sub.family_name}</p>
                              <p className="text-sm text-gray-500">{sub.owner_email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">{PLAN_NAMES[sub.plan_type]}</Badge>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                          <td className="px-4 py-3 font-semibold">₽{sub.amount}</td>
                          <td className="px-4 py-3">
                            {sub.status === 'active' ? (
                              <div className={isExpiringSoon ? 'text-orange-600 font-semibold' : ''}>
                                {daysRemaining > 0 ? `${daysRemaining} дн.` : 'Истекла'}
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSub(sub);
                                setShowExtendDialog(true);
                              }}
                            >
                              <Icon name="Plus" size={14} className="mr-1" />
                              Продлить
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        {subscriptions.length === 0
                          ? 'Пока нет подписок'
                          : 'Ничего не найдено по заданным фильтрам'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extend Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Продлить подписку</DialogTitle>
            <DialogDescription>
              Бесплатное продление для {selectedSub?.family_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Количество дней</Label>
              <Input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                className="mt-1"
                min="1"
                max="365"
              />
              <p className="text-xs text-gray-500 mt-1">
                Текущее окончание: {selectedSub && new Date(selectedSub.end_date).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleExtendSubscription}>
              <Icon name="Check" size={16} className="mr-2" />
              Продлить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}