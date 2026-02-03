import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

interface AddVitalRecordDialogProps {
  profileId: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function AddVitalRecordDialog({ profileId, onSuccess, trigger }: AddVitalRecordDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: 'weight',
    value: '',
    unit: 'кг',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: ''
  });

  const getUnitByType = (type: string) => {
    const units: Record<string, string> = {
      weight: 'кг',
      height: 'см',
      temperature: '°C',
      pressure: 'мм рт.ст.',
      pulse: 'уд/мин',
      glucose: 'ммоль/л',
      oxygen: '%'
    };
    return units[type] || '';
  };

  const handleTypeChange = (newType: string) => {
    setFormData({
      ...formData,
      type: newType,
      unit: getUnitByType(newType)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(func2url['health-vitals'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': profileId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          profileId,
          ...formData
        })
      });

      if (response.ok) {
        toast({
          title: 'Показатель добавлен',
          description: 'Данные о здоровье сохранены'
        });
        setOpen(false);
        setFormData({
          type: 'weight',
          value: '',
          unit: 'кг',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          notes: ''
        });
        onSuccess();
      } else {
        throw new Error('Ошибка при добавлении показателя');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить показатель',
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
            Добавить запись
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новый показатель здоровья</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Тип показателя</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">Вес</SelectItem>
                <SelectItem value="height">Рост</SelectItem>
                <SelectItem value="temperature">Температура</SelectItem>
                <SelectItem value="pressure">Давление</SelectItem>
                <SelectItem value="pulse">Пульс</SelectItem>
                <SelectItem value="glucose">Сахар в крови</SelectItem>
                <SelectItem value="oxygen">Уровень кислорода</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Значение *</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={formData.type === 'pressure' ? '120/80' : '0'}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Единица измерения</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Дата *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Время *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
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
              {loading ? 'Сохранение...' : 'Добавить показатель'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
