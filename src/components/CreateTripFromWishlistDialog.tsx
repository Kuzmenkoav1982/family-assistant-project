import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';

interface WishlistItem {
  id: number;
  destination: string;
  country: string;
  description?: string;
  estimated_budget?: number;
  currency: string;
  duration_days?: number;
}

interface CreateTripFromWishlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: WishlistItem | null;
}

export default function CreateTripFromWishlistDialog({ 
  open, 
  onOpenChange, 
  item 
}: CreateTripFromWishlistDialogProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.start_date || !formData.end_date || !item) {
      alert('Укажите даты поездки');
      return;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (endDate < startDate) {
      alert('Дата окончания не может быть раньше даты начала');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'create_trip',
          title: formData.title || `${item.destination}, ${item.country}`,
          destination: item.destination,
          country: item.country,
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description || item.description || '',
          budget: item.estimated_budget || 0,
          currency: item.currency || 'RUB',
          status: 'planning',
        }),
      });

      const result = await response.json();
      
      if (result.success && result.trip_id) {
        // Опционально: удаляем из Wish List после создания поездки
        await fetch(TRIPS_API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Auth-Token': token || ''
          },
          body: JSON.stringify({
            action: 'delete_wishlist',
            wishlist_id: item.id,
          }),
        });

        onOpenChange(false);
        // Переходим на страницу новой поездки
        navigate(`/trips/${result.trip_id}`);
      } else {
        alert(result.error || 'Ошибка при создании поездки');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Ошибка при создании поездки');
    } finally {
      setLoading(false);
    }
  };

  // Автоматически рассчитываем конечную дату на основе duration_days
  const handleStartDateChange = (date: string) => {
    setFormData({ ...formData, start_date: date });
    
    if (date && item?.duration_days && !formData.end_date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + item.duration_days);
      setFormData({ 
        ...formData, 
        start_date: date,
        end_date: endDate.toISOString().split('T')[0]
      });
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={24} className="text-orange-500" />
            Создать поездку
          </DialogTitle>
          <p className="text-sm text-gray-500 pt-2">
            {item.destination}, {item.country}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Название поездки
            </label>
            <Input
              placeholder={`${item.destination}, ${item.country}`}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Оставьте пустым для автоматического названия
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Дата начала *
              </label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleStartDateChange(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Дата окончания *
              </label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          {item.duration_days && (
            <p className="text-xs text-gray-500">
              Рекомендуемая длительность: {item.duration_days} дней
            </p>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Описание
            </label>
            <Textarea
              placeholder="Дополнительная информация о поездке"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {item.estimated_budget && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Wallet" size={16} className="text-blue-600" />
                <span className="text-gray-700">
                  Бюджет: <strong>{item.estimated_budget.toLocaleString()} {item.currency}</strong>
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Icon name="Plus" size={16} />
                  Создать поездку
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
