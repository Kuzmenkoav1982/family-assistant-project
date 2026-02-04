import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

interface HealthRecord {
  id: string;
  type: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  doctor?: string;
  clinic?: string;
  diagnosis?: string;
  recommendations?: string;
}

interface EditHealthRecordDialogProps {
  record: HealthRecord;
  profileId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditHealthRecordDialog({ 
  record, 
  profileId, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditHealthRecordDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: record.type || 'visit',
    title: record.title || '',
    description: record.description || '',
    date: record.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0],
    time: record.time || new Date().toTimeString().slice(0, 5),
    doctor: record.doctor || '',
    clinic: record.clinic || '',
    diagnosis: record.diagnosis || '',
    recommendations: record.recommendations || ''
  });

  useEffect(() => {
    setFormData({
      type: record.type || 'visit',
      title: record.title || '',
      description: record.description || '',
      date: record.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0],
      time: record.time || new Date().toTimeString().slice(0, 5),
      doctor: record.doctor || '',
      clinic: record.clinic || '',
      diagnosis: record.diagnosis || '',
      recommendations: record.recommendations || ''
    });
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(func2url['health-records'], {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': profileId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          id: record.id,
          profileId,
          ...formData
        })
      });

      if (response.ok) {
        toast({
          title: 'Запись обновлена',
          description: 'Изменения успешно сохранены'
        });
        onOpenChange(false);
        onSuccess();
      } else {
        throw new Error('Ошибка при обновлении записи');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить запись',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать медицинскую запись</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Тип записи</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visit">Визит к врачу</SelectItem>
                <SelectItem value="analysis">Анализы</SelectItem>
                <SelectItem value="procedure">Процедура</SelectItem>
                <SelectItem value="hospitalization">Госпитализация</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Например: Плановый осмотр"
              required
            />
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
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Опишите визит или процедуру"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="clinic">Клиника</Label>
              <Input
                id="clinic"
                value={formData.clinic}
                onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                placeholder="Название клиники"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Диагноз</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Поставленный диагноз"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Рекомендации</Label>
            <Textarea
              id="recommendations"
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              placeholder="Рекомендации врача"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
