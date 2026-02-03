import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

interface AddMedicationDialogProps {
  profileId: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function AddMedicationDialog({ profileId, onSuccess, trigger }: AddMedicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: '',
    purpose: '',
    sideEffects: '',
    prescribedBy: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(func2url['health-medications'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': profileId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          profileId,
          ...formData,
          status: 'active'
        })
      });

      if (response.ok) {
        toast({
          title: 'Лекарство добавлено',
          description: 'Информация о лекарстве сохранена'
        });
        setOpen(false);
        setFormData({
          name: '',
          dosage: '',
          frequency: '',
          startDate: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endDate: '',
          purpose: '',
          sideEffects: '',
          prescribedBy: ''
        });
        onSuccess();
      } else {
        throw new Error('Ошибка при добавлении лекарства');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить лекарство',
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
            Добавить лекарство
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новое лекарство</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название препарата *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Парацетамол"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Дозировка *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="500 мг"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Частота приёма *</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="2 раза в день"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Время приёма *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Дата окончания</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Назначение</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Для чего назначено"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescribedBy">Назначил врач</Label>
            <Input
              id="prescribedBy"
              value={formData.prescribedBy}
              onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
              placeholder="ФИО врача"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sideEffects">Побочные эффекты</Label>
            <Textarea
              id="sideEffects"
              value={formData.sideEffects}
              onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
              placeholder="Возможные побочные эффекты"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Добавить лекарство'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}