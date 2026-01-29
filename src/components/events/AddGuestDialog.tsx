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

const API_URL = func2url['event-guests'];

interface AddGuestDialogProps {
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

export default function AddGuestDialog({ open, onOpenChange, eventId, onSuccess }: AddGuestDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'invited',
    adultsCount: '1',
    childrenCount: '0',
    dietaryRestrictions: '',
    notes: ''
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
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email || null,
          status: formData.status,
          adultsCount: parseInt(formData.adultsCount),
          childrenCount: parseInt(formData.childrenCount),
          dietaryRestrictions: formData.dietaryRestrictions || null,
          notes: formData.notes || null
        })
      });

      if (response.ok) {
        toast({
          title: 'Гость добавлен!',
          description: 'Гость успешно добавлен в список'
        });
        setFormData({
          name: '',
          phone: '',
          email: '',
          status: 'invited',
          adultsCount: '1',
          childrenCount: '0',
          dietaryRestrictions: '',
          notes: ''
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error('Failed to add guest');
      }
    } catch (error) {
      console.error('[AddGuest] Error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить гостя',
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
          <DialogTitle>Добавить гостя</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Иван Петров"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (900) 123-45-67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invited">Приглашён</SelectItem>
                <SelectItem value="confirmed">Подтвердил</SelectItem>
                <SelectItem value="declined">Отказался</SelectItem>
                <SelectItem value="maybe">Возможно придёт</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adultsCount">Взрослых</Label>
              <Input
                id="adultsCount"
                type="number"
                min="0"
                value={formData.adultsCount}
                onChange={(e) => setFormData({ ...formData, adultsCount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="childrenCount">Детей</Label>
              <Input
                id="childrenCount"
                type="number"
                min="0"
                value={formData.childrenCount}
                onChange={(e) => setFormData({ ...formData, childrenCount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietaryRestrictions">Особенности питания</Label>
            <Input
              id="dietaryRestrictions"
              value={formData.dietaryRestrictions}
              onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              placeholder="Вегетарианец, аллергия на орехи..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Добавление...' : 'Добавить гостя'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
