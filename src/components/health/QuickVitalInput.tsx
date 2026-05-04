import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

interface QuickVitalInputProps {
  profileId: string;
  onSuccess: () => void;
}

export function QuickVitalInput({ profileId, onSuccess }: QuickVitalInputProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [type, setType] = useState<'pressure' | 'pulse' | 'temperature' | 'weight'>('pressure');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let value = '';
    let unit = '';

    switch (type) {
      case 'pressure':
        if (!systolic || !diastolic) {
          toast({
            title: 'Ошибка',
            description: 'Укажите систолическое и диастолическое давление',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        value = `${systolic}/${diastolic}`;
        unit = 'мм рт.ст.';
        break;
      case 'pulse':
        if (!pulse) {
          toast({
            title: 'Ошибка',
            description: 'Укажите пульс',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        value = pulse;
        unit = 'уд/мин';
        break;
      case 'temperature':
        if (!temperature) {
          toast({
            title: 'Ошибка',
            description: 'Укажите температуру',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        value = temperature;
        unit = '°C';
        break;
      case 'weight':
        if (!weight) {
          toast({
            title: 'Ошибка',
            description: 'Укажите вес',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        value = weight;
        unit = 'кг';
        break;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const now = new Date();
      
      const response = await fetch(func2url['health-vitals'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': profileId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          profileId,
          type,
          value,
          unit,
          date: now.toISOString().split('T')[0],
          time: now.toTimeString().slice(0, 5),
          notes
        })
      });

      if (response.ok) {
        toast({
          title: '✅ Сохранено',
          description: 'Показатель успешно добавлен'
        });
        setOpen(false);
        setSystolic('');
        setDiastolic('');
        setPulse('');
        setTemperature('');
        setWeight('');
        setNotes('');
        onSuccess();
      } else {
        throw new Error('Ошибка при сохранении');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить показатель',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
          <Icon name="Plus" size={14} className="mr-1" />
          Добавить показатель
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Быстрое внесение показателей</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Тип показателя</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pressure">🩺 Артериальное давление</SelectItem>
                <SelectItem value="pulse">❤️ Пульс</SelectItem>
                <SelectItem value="temperature">🌡️ Температура</SelectItem>
                <SelectItem value="weight">⚖️ Вес</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'pressure' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systolic">Систолическое (верхнее)</Label>
                <Input
                  id="systolic"
                  type="number"
                  placeholder="120"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  min="60"
                  max="250"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diastolic">Диастолическое (нижнее)</Label>
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="80"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  min="40"
                  max="150"
                />
              </div>
            </div>
          )}

          {type === 'pulse' && (
            <div className="space-y-2">
              <Label htmlFor="pulse">Пульс (уд/мин)</Label>
              <Input
                id="pulse"
                type="number"
                placeholder="70"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                min="40"
                max="200"
              />
            </div>
          )}

          {type === 'temperature' && (
            <div className="space-y-2">
              <Label htmlFor="temperature">Температура (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="36.6"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                min="34"
                max="43"
              />
            </div>
          )}

          {type === 'weight' && (
            <div className="space-y-2">
              <Label htmlFor="weight">Вес (кг)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="2"
                max="300"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания (необязательно)</Label>
            <Textarea
              id="notes"
              placeholder="Самочувствие, обстоятельства измерения..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
