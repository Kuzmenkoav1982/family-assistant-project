import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import func2url from '../../../backend/func2url.json';

const TRIPS_API = (func2url as Record<string, string>)['trips'];

interface Wish {
  id: number;
  member_name: string;
  wish_text: string;
  category: string;
  created_at: string;
}

interface TripWishesProps {
  tripId: number;
}

export function TripWishes({ tripId }: TripWishesProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newWish, setNewWish] = useState({
    member_name: '',
    wish_text: '',
    category: 'general',
  });

  const wishCategories = [
    { value: 'general', label: '🌟 Общее', icon: 'Star' },
    { value: 'activity', label: '🎯 Активности', icon: 'Activity' },
    { value: 'food', label: '🍽️ Еда', icon: 'UtensilsCrossed' },
    { value: 'shopping', label: '🛍️ Шопинг', icon: 'ShoppingBag' },
    { value: 'relaxation', label: '🧘 Отдых', icon: 'Sparkles' },
  ];

  const loadWishes = useCallback(async () => {
    if (!TRIPS_API || !tripId) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const res = await fetch(`${TRIPS_API}?action=trip_wishes&trip_id=${tripId}`, {
        headers: { 'X-Auth-Token': token },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.wishes)) {
        setWishes(data.wishes);
      }
    } catch (e) {
      console.error('Load wishes error:', e);
    }
  }, [tripId]);

  useEffect(() => {
    loadWishes();
  }, [loadWishes]);

  const handleAddWish = async () => {
    if (!newWish.member_name || !newWish.wish_text) {
      alert('Заполните имя и пожелание');
      return;
    }
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Войдите в систему');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(TRIPS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({ action: 'add_trip_wish', trip_id: tripId, ...newWish }),
      });
      const data = await res.json();
      if (data.success && data.wish) {
        setWishes([data.wish, ...wishes]);
        setNewWish({ member_name: '', wish_text: '', category: 'general' });
        setIsAddDialogOpen(false);
      } else {
        alert(data.error || 'Не удалось сохранить пожелание');
      }
    } catch (e) {
      console.error('Add wish error:', e);
      alert('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWish = async (wishId: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const prev = wishes;
    setWishes(wishes.filter((w) => w.id !== wishId));
    try {
      await fetch(TRIPS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({ action: 'delete_trip_wish', wish_id: wishId }),
      });
    } catch (e) {
      console.error('Delete wish error:', e);
      setWishes(prev);
    }
  };

  const getCategoryInfo = (category: string) => {
    return wishCategories.find((c) => c.value === category) || wishCategories[0];
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Icon name="Heart" size={20} />
          Пожелания путешественников
        </h3>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-2">
          <Icon name="Plus" size={16} />
          Добавить
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Соберите пожелания от всех членов семьи! Это поможет спланировать поездку так,
            чтобы каждый получил удовольствие. Дети хотят аквапарк? Мама — в музей?
            Запишите всё здесь!
          </p>
        </div>
      </div>

      {wishes.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Heart" size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-3">Пока нет пожеланий</p>
          <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" size="sm">
            Добавить первое пожелание
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {wishes.map((wish) => {
            const categoryInfo = getCategoryInfo(wish.category);
            return (
              <div
                key={wish.id}
                className="flex gap-3 p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                  {wish.member_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{wish.member_name}</span>
                    <span className="text-xs text-gray-500">{categoryInfo.label}</span>
                  </div>
                  <p className="text-sm text-gray-700">{wish.wish_text}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteWish(wish.id)}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить пожелание</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Кто:</label>
              <Input
                placeholder="Имя члена семьи"
                value={newWish.member_name}
                onChange={(e) => setNewWish({ ...newWish, member_name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Категория:</label>
              <div className="grid grid-cols-2 gap-2">
                {wishCategories.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={newWish.category === cat.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewWish({ ...newWish, category: cat.value })}
                    className="justify-start"
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Пожелание:</label>
              <Textarea
                placeholder="Что хочется посетить или попробовать?"
                value={newWish.wish_text}
                onChange={(e) => setNewWish({ ...newWish, wish_text: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={loading}>
              Отмена
            </Button>
            <Button onClick={handleAddWish} disabled={loading}>
              {loading ? 'Сохранение…' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}