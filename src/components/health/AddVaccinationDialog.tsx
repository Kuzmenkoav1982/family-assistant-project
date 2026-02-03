import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

interface AddVaccinationDialogProps {
  profileId: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function AddVaccinationDialog({ profileId, onSuccess, trigger }: AddVaccinationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    nextDate: '',
    clinic: '',
    doctor: '',
    batchNumber: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(func2url['health-vaccinations'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': profileId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          profileId,
          ...formData,
          nextDate: formData.nextDate || null
        })
      });

      if (response.ok) {
        toast({
          title: 'Прививка добавлена',
          description: 'Информация о прививке сохранена'
        });
        setOpen(false);
        setFormData({
          name: '',
          date: new Date().toISOString().split('T')[0],
          nextDate: '',
          clinic: '',
          doctor: '',
          batchNumber: '',
          notes: ''
        });
        onSuccess();
      } else {
        throw new Error('Ошибка при добавлении прививки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить прививку',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Icon name="Plus" size={14} />
            Добавить прививку
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новая прививка</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название прививки *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Вакцина против кори"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Дата прививки *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextDate">Следующая прививка</Label>
              <Input
                id="nextDate"
                type="date"
                value={formData.nextDate}
                onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinic">Клиника *</Label>
            <Input
              id="clinic"
              value={formData.clinic}
              onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
              placeholder="Название клиники"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Врач</Label>
            <Input
              id="doctor"
              value={formData.doctor}
              onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              placeholder="ФИО врача"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNumber">Серия препарата</Label>
            <Input
              id="batchNumber"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              placeholder="Серийный номер"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Добавить прививку'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
