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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

const API_URL = func2url['event-expenses'];

interface AddExpenseDialogProps {
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

const categoryLabels: Record<string, string> = {
  venue: 'Место проведения',
  food: 'Еда и напитки',
  decorations: 'Декор',
  entertainment: 'Развлечения',
  gifts: 'Подарки',
  other: 'Прочее'
};

export default function AddExpenseDialog({ open, onOpenChange, eventId, onSuccess }: AddExpenseDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'other',
    title: '',
    amount: '',
    paidBy: ''
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
          category: formData.category,
          title: formData.title,
          amount: parseFloat(formData.amount),
          paidBy: formData.paidBy || userId
        })
      });

      if (response.ok) {
        toast({
          title: 'Расход добавлен!',
          description: 'Расход успешно добавлен в бюджет'
        });
        setFormData({
          category: 'other',
          title: '',
          amount: '',
          paidBy: ''
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error('Failed to add expense');
      }
    } catch (error) {
      console.error('[AddExpense] Error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить расход',
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
          <DialogTitle>Добавить расход</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Категория *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Аренда зала"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Сумма (₽) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="5000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidBy">Оплатил</Label>
            <Input
              id="paidBy"
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
              placeholder="Имя члена семьи (необязательно)"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Добавление...' : 'Добавить расход'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
