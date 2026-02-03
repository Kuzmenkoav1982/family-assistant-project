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

interface EditInsuranceDialogProps {
  insurance: {
    id: string;
    profileId: string;
    provider: string;
    policyNumber: string;
    type: string;
    validFrom: string;
    validUntil?: string;
    coverage?: string;
    notes?: string;
  };
  onSuccess: () => void;
}

export function EditInsuranceDialog({ insurance, onSuccess }: EditInsuranceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    provider: insurance.provider,
    policyNumber: insurance.policyNumber,
    type: insurance.type,
    validFrom: insurance.validFrom.split('T')[0],
    validUntil: insurance.validUntil ? insurance.validUntil.split('T')[0] : '',
    coverage: insurance.coverage || '',
    notes: insurance.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(func2url['health-insurance'], {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': insurance.profileId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          id: insurance.id,
          profileId: insurance.profileId,
          ...formData,
          status: 'active'
        })
      });

      if (response.ok) {
        toast({
          title: 'Страховка обновлена',
          description: 'Информация о страховке сохранена'
        });
        setOpen(false);
        onSuccess();
      } else {
        throw new Error('Ошибка при обновлении страховки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить страховку',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту страховку?')) return;
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${func2url['health-insurance']}?id=${insurance.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': insurance.profileId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        toast({
          title: 'Страховка удалена',
          description: 'Информация о страховке удалена'
        });
        setOpen(false);
        onSuccess();
      } else {
        throw new Error('Ошибка при удалении страховки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить страховку',
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
          <DialogTitle>Редактировать страховку</DialogTitle>
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
                <SelectItem value="oms">ОМС (обязательное)</SelectItem>
                <SelectItem value="dms">ДМС (добровольное)</SelectItem>
                <SelectItem value="travel">Туристическое</SelectItem>
                <SelectItem value="life">Страхование жизни</SelectItem>
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
