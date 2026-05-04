import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

interface EditVaccinationDialogProps {
  vaccination: {
    id: string;
    profileId: string;
    name: string;
    date: string;
    nextDate?: string;
    clinic: string;
    doctor?: string;
    batchNumber?: string;
    notes?: string;
  };
  onSuccess: () => void;
}

export function EditVaccinationDialog({ vaccination, onSuccess }: EditVaccinationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: vaccination.name,
    date: vaccination.date.split('T')[0],
    nextDate: vaccination.nextDate ? vaccination.nextDate.split('T')[0] : '',
    clinic: vaccination.clinic,
    doctor: vaccination.doctor || '',
    batchNumber: vaccination.batchNumber || '',
    notes: vaccination.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(func2url['health-vaccinations'], {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': vaccination.profileId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          id: vaccination.id,
          profileId: vaccination.profileId,
          ...formData,
          nextDate: formData.nextDate || null
        })
      });

      if (response.ok) {
        toast({
          title: 'Прививка обновлена',
          description: 'Информация о прививке сохранена'
        });
        setOpen(false);
        onSuccess();
      } else {
        throw new Error('Ошибка при обновлении прививки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить прививку',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту прививку?')) return;
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${func2url['health-vaccinations']}?id=${vaccination.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': vaccination.profileId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        toast({
          title: 'Прививка удалена',
          description: 'Информация о прививке удалена'
        });
        setOpen(false);
        onSuccess();
      } else {
        throw new Error('Ошибка при удалении прививки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить прививку',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Icon name="Edit" size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать прививку</DialogTitle>
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

          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              <Icon name="Trash" size={16} />
              Удалить
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
