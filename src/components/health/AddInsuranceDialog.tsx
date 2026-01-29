import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AddInsuranceDialogProps {
  profileId: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function AddInsuranceDialog({ profileId, onSuccess, trigger }: AddInsuranceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    provider: '',
    policyNumber: '',
    type: 'ОМС',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    coverage: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://functions.poehali.dev/933f7f2e-4542-437f-95ad-fdaee4f6dddc', {
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
          title: 'Страховка добавлена',
          description: 'Информация о страховке сохранена'
        });
        setOpen(false);
        setFormData({
          provider: '',
          policyNumber: '',
          type: 'ОМС',
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: '',
          coverage: '',
          notes: ''
        });
        onSuccess();
      } else {
        throw new Error('Ошибка при добавлении страховки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить страховку',
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
            Добавить страховку
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новая страховка</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Страховая компания *</Label>
            <Input
              id="provider"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              placeholder="Например: СОГАЗ"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Тип страховки</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ОМС">ОМС (обязательное)</SelectItem>
                <SelectItem value="ДМС">ДМС (добровольное)</SelectItem>
                <SelectItem value="VHI">VHI (международное)</SelectItem>
                <SelectItem value="Туристическое">Туристическое</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policyNumber">Номер полиса *</Label>
            <Input
              id="policyNumber"
              value={formData.policyNumber}
              onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
              placeholder="0000 0000 0000 0000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Действителен с *</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Действителен до</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverage">Покрытие</Label>
            <Textarea
              id="coverage"
              value={formData.coverage}
              onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
              placeholder="Что включено в страховку"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Добавить страховку'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
