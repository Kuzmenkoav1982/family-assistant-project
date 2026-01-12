import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';

interface AddWishlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddWishlistDialog({ open, onOpenChange, onSuccess }: AddWishlistDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    country: '',
    description: '',
    priority: 'medium',
    estimated_budget: '',
    currency: 'RUB',
    best_season: '',
    duration_days: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destination || !formData.country) {
      alert('Укажите место и страну');
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
          action: 'add_wishlist',
          destination: formData.destination,
          country: formData.country,
          description: formData.description || null,
          priority: formData.priority,
          estimated_budget: formData.estimated_budget ? parseInt(formData.estimated_budget) : null,
          currency: formData.currency,
          best_season: formData.best_season || null,
          duration_days: formData.duration_days ? parseInt(formData.duration_days) : null,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setFormData({
          destination: '',
          country: '',
          description: '',
          priority: 'medium',
          estimated_budget: '',
          currency: 'RUB',
          best_season: '',
          duration_days: '',
        });
        onSuccess();
        onOpenChange(false);
      } else {
        alert(result.error || 'Ошибка при добавлении места');
      }
    } catch (error) {
      console.error('Error adding wishlist:', error);
      alert('Ошибка при добавлении места');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Plus" size={24} className="text-orange-500" />
            Добавить место
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Место *
            </label>
            <Input
              placeholder="Например: Париж, Бали, Токио"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Страна *
            </label>
            <Input
              placeholder="Например: Франция, Индонезия"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Описание
            </label>
            <Textarea
              placeholder="Что хотите увидеть или сделать?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Приоритет
            </label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Бюджет
              </label>
              <Input
                type="number"
                placeholder="50000"
                value={formData.estimated_budget}
                onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Валюта
              </label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUB">RUB</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Длительность (дней)
              </label>
              <Input
                type="number"
                placeholder="7"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Лучший сезон
              </label>
              <Input
                placeholder="Лето, Зима"
                value={formData.best_season}
                onChange={(e) => setFormData({ ...formData, best_season: e.target.value })}
              />
            </div>
          </div>

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
                  Добавление...
                </>
              ) : (
                <>
                  <Icon name="Plus" size={16} />
                  Добавить
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}