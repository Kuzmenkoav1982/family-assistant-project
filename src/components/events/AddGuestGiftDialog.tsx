import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

const API_URL = func2url['guest-gifts'];

interface AddGuestGiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onSuccess: () => void;
}

function getUserId(): string {
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      return userData.member_id || '1';
    } catch (e) {
      console.error('[getUserId] Failed to parse userData:', e);
    }
  }
  return '1';
}

export default function AddGuestGiftDialog({ open, onOpenChange, eventId, onSuccess }: AddGuestGiftDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    pricePerItem: '',
    quantityNeeded: '1',
    category: 'all'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          eventId,
          title: formData.title,
          description: formData.description || null,
          link: formData.link || null,
          pricePerItem: formData.pricePerItem ? parseFloat(formData.pricePerItem) : null,
          quantityNeeded: parseInt(formData.quantityNeeded),
          category: formData.category
        })
      });

      if (response.ok) {
        toast({
          title: 'Подарок добавлен!',
          description: 'Подарок для гостей добавлен в список'
        });
        setFormData({
          title: '',
          description: '',
          link: '',
          pricePerItem: '',
          quantityNeeded: '1',
          category: 'all'
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error('Failed to add guest gift');
      }
    } catch (error) {
      console.error('[AddGuestGift] Error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить подарок',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить подарок для гостей</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Магниты с фото"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Детали, размер, особенности..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Ссылка</Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://example.com/product"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerItem">Цена за шт. (₽)</Label>
              <Input
                id="pricePerItem"
                type="number"
                step="0.01"
                min="0"
                value={formData.pricePerItem}
                onChange={(e) => setFormData({ ...formData, pricePerItem: e.target.value })}
                placeholder="150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantityNeeded">Количество</Label>
              <Input
                id="quantityNeeded"
                type="number"
                min="1"
                value={formData.quantityNeeded}
                onChange={(e) => setFormData({ ...formData, quantityNeeded: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Категория</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Для всех</SelectItem>
                <SelectItem value="kids">Для детей</SelectItem>
                <SelectItem value="adults">Для взрослых</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Добавление...' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
