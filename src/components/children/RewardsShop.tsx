import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  category: 'treat' | 'activity' | 'privilege' | 'toy';
  available: boolean;
}

interface Purchase {
  id: string;
  rewardId: string;
  rewardTitle: string;
  cost: number;
  date: string;
  status: 'pending' | 'approved' | 'used';
}

interface RewardsShopProps {
  childId: string;
  balance: number;
}

export function RewardsShop({ childId, balance }: RewardsShopProps) {
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: '1',
      title: 'Мороженое',
      description: 'Любимое мороженое в кафе',
      cost: 20,
      icon: '🍦',
      category: 'treat',
      available: true,
    },
    {
      id: '2',
      title: 'Кино с семьёй',
      description: 'Поход в кинотеатр на новый фильм',
      cost: 50,
      icon: '🎬',
      category: 'activity',
      available: true,
    },
    {
      id: '3',
      title: '+30 минут игр',
      description: 'Дополнительное время для видеоигр',
      cost: 15,
      icon: '🎮',
      category: 'privilege',
      available: true,
    },
    {
      id: '4',
      title: 'Пицца на ужин',
      description: 'Заказываем любимую пиццу',
      cost: 30,
      icon: '🍕',
      category: 'treat',
      available: true,
    },
    {
      id: '5',
      title: 'Новая игрушка',
      description: 'Небольшая игрушка на выбор',
      cost: 100,
      icon: '🧸',
      category: 'toy',
      available: true,
    },
    {
      id: '6',
      title: 'Поход в парк',
      description: 'День в парке развлечений',
      cost: 80,
      icon: '🎡',
      category: 'activity',
      available: true,
    },
  ]);

  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: '1',
      rewardId: '1',
      rewardTitle: 'Мороженое',
      cost: 20,
      date: new Date().toISOString(),
      status: 'pending',
    },
  ]);

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [addRewardDialog, setAddRewardDialog] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    cost: 10,
    icon: '🎁',
    category: 'treat' as const,
  });

  const categoryNames = {
    treat: 'Лакомство',
    activity: 'Активность',
    privilege: 'Привилегия',
    toy: 'Игрушка',
  };

  const categoryColors = {
    treat: 'from-pink-500 to-red-500',
    activity: 'from-blue-500 to-purple-500',
    privilege: 'from-green-500 to-emerald-500',
    toy: 'from-yellow-500 to-orange-500',
  };

  const iconOptions = ['🍦', '🍕', '🍰', '🎮', '🎬', '📱', '⏰', '🎡', '🏊', '🚴', '🧸', '🎁', '📚', '🎨', '🎸', '⚽'];

  const handlePurchase = (reward: Reward) => {
    if (balance < reward.cost) {
      alert('Недостаточно монет! Продолжай выполнять задания 💪');
      return;
    }

    const purchase: Purchase = {
      id: Date.now().toString(),
      rewardId: reward.id,
      rewardTitle: reward.title,
      cost: reward.cost,
      date: new Date().toISOString(),
      status: 'pending',
    };

    setPurchases([purchase, ...purchases]);
    setSelectedReward(null);
    alert(`✨ Награда "${reward.title}" куплена! Покажи родителям для получения 🎉`);
  };

  const handleAddReward = () => {
    if (!newReward.title) return;

    const reward: Reward = {
      id: Date.now().toString(),
      ...newReward,
      available: true,
    };

    setRewards([...rewards, reward]);
    setNewReward({ title: '', description: '', cost: 10, icon: '🎁', category: 'treat' });
    setAddRewardDialog(false);
  };

  const pendingPurchases = purchases.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Баланс */}
      <Card className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-100 border-2 border-yellow-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl">💰</div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Твой баланс</p>
                <div className="flex items-center gap-2">
                  <span className="text-5xl font-bold text-yellow-600">{balance}</span>
                  <span className="text-2xl text-gray-600">монет</span>
                </div>
              </div>
            </div>
            {pendingPurchases.length > 0 && (
              <Badge className="bg-orange-500 text-white text-lg px-4 py-2">
                {pendingPurchases.length} покупок ожидают
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Магазин наград */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="ShoppingCart" size={20} className="text-purple-600" />
              Магазин наград
            </CardTitle>
            <Dialog open={addRewardDialog} onOpenChange={setAddRewardDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить награду (Родители)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать новую награду</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название *</label>
                    <Input
                      value={newReward.title}
                      onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                      placeholder="Например: Мороженое"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Описание</label>
                    <Textarea
                      value={newReward.description}
                      onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                      placeholder="Подробнее о награде"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Стоимость (монеты)</label>
                    <Input
                      type="number"
                      value={newReward.cost}
                      onChange={(e) => setNewReward({ ...newReward, cost: parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Категория</label>
                    <select
                      value={newReward.category}
                      onChange={(e) => setNewReward({ ...newReward, category: e.target.value as any })}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="treat">Лакомство</option>
                      <option value="activity">Активность</option>
                      <option value="privilege">Привилегия</option>
                      <option value="toy">Игрушка</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Иконка</label>
                    <div className="grid grid-cols-8 gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setNewReward({ ...newReward, icon })}
                          className={`text-3xl p-2 rounded-lg border-2 transition-all ${
                            newReward.icon === icon ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddReward} className="w-full">
                    Добавить награду
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => {
              const canAfford = balance >= reward.cost;
              return (
                <Card
                  key={reward.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    canAfford ? 'hover:scale-105' : 'opacity-60'
                  }`}
                  onClick={() => canAfford && setSelectedReward(reward)}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-6xl mb-3">{reward.icon}</div>
                      <h4 className="font-bold text-lg mb-1">{reward.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{reward.description}</p>
                      <Badge className={`bg-gradient-to-r ${categoryColors[reward.category]} text-white mb-2`}>
                        {categoryNames[reward.category]}
                      </Badge>
                      <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-600">
                        <Icon name="Coins" size={20} />
                        {reward.cost}
                      </div>
                      {!canAfford && (
                        <p className="text-xs text-red-600 mt-2">Недостаточно монет</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Диалог покупки */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent className="max-w-md">
          {selectedReward && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">
                  <div className="text-8xl mb-4">{selectedReward.icon}</div>
                  <h2 className="text-2xl font-bold">{selectedReward.title}</h2>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-center text-gray-600">{selectedReward.description}</p>
                
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Стоимость:</span>
                    <div className="flex items-center gap-1 text-2xl font-bold text-yellow-600">
                      <Icon name="Coins" size={24} />
                      {selectedReward.cost}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Твой баланс:</span>
                    <span className="text-xl font-bold text-green-600">{balance}</span>
                  </div>
                  <div className="border-t border-yellow-300 my-2 pt-2 flex items-center justify-between">
                    <span className="font-semibold">Останется:</span>
                    <span className="text-xl font-bold">{balance - selectedReward.cost}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(selectedReward)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-lg py-6"
                >
                  <Icon name="ShoppingCart" className="mr-2" size={20} />
                  Купить награду!
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* История покупок */}
      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="History" size={20} className="text-blue-600" />
              Мои покупки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                    purchase.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                    purchase.status === 'approved' ? 'bg-green-50 border-green-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div>
                    <h4 className="font-semibold">{purchase.rewardTitle}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(purchase.date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-600 font-bold">
                      <Icon name="Coins" size={16} />
                      {purchase.cost}
                    </div>
                    <Badge className={
                      purchase.status === 'pending' ? 'bg-yellow-500' :
                      purchase.status === 'approved' ? 'bg-green-500' :
                      'bg-gray-500'
                    }>
                      {purchase.status === 'pending' && 'Ожидает'}
                      {purchase.status === 'approved' && 'Одобрено'}
                      {purchase.status === 'used' && 'Использовано'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
