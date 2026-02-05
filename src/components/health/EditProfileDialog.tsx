import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

interface EditProfileDialogProps {
  profile: {
    id: string;
    bloodType?: string;
    rhFactor?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    emergencyContact?: string;
  };
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function EditProfileDialog({ profile, onSuccess, trigger }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    bloodType: profile.bloodType || 'A',
    rhFactor: profile.rhFactor || '+',
    allergies: profile.allergies?.join(', ') || '',
    chronicDiseases: profile.chronicDiseases?.join(', ') || '',
    emergencyContact: profile.emergencyContact || ''
  });

  // Обновляем formData при изменении profile или открытии диалога
  useEffect(() => {
    if (open) {
      setFormData({
        bloodType: profile.bloodType || 'A',
        rhFactor: profile.rhFactor || '+',
        allergies: profile.allergies?.join(', ') || '',
        chronicDiseases: profile.chronicDiseases?.join(', ') || '',
        emergencyContact: profile.emergencyContact || ''
      });
    }
  }, [open, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userData')
        ? JSON.parse(localStorage.getItem('userData')!).member_id
        : '1';

      const response = await fetch(func2url['health-profiles'], {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          id: profile.id,
          bloodType: formData.bloodType,
          rhFactor: formData.rhFactor,
          allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
          chronicDiseases: formData.chronicDiseases.split(',').map(d => d.trim()).filter(Boolean),
          emergencyContact: formData.emergencyContact
        })
      });

      if (response.ok) {
        toast({
          title: 'Данные обновлены',
          description: 'Информация профиля сохранена'
        });
        setOpen(false);
        onSuccess();
      } else {
        throw new Error('Ошибка при обновлении профиля');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить данные',
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
          <Button variant="outline" size="sm">
            <Icon name="Edit" size={14} />
            Изменить
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать профиль здоровья</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Группа крови</Label>
              <Select value={formData.bloodType} onValueChange={(value) => setFormData({ ...formData, bloodType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A (II)</SelectItem>
                  <SelectItem value="B">B (III)</SelectItem>
                  <SelectItem value="AB">AB (IV)</SelectItem>
                  <SelectItem value="O">O (I)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rhFactor">Резус-фактор</Label>
              <Select value={formData.rhFactor} onValueChange={(value) => setFormData({ ...formData, rhFactor: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+">Положительный (+)</SelectItem>
                  <SelectItem value="-">Отрицательный (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Аллергии</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="Например: пыльца, орехи (через запятую)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chronicDiseases">Хронические заболевания</Label>
            <Input
              id="chronicDiseases"
              value={formData.chronicDiseases}
              onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
              placeholder="Например: астма, диабет (через запятую)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Экстренный контакт</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}