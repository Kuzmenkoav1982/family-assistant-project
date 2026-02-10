import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface CreateInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  onCreate: (data: { maxUses: number; daysValid: number }) => Promise<void>;
}

export function CreateInviteDialog({ open, onOpenChange, isLoading, onCreate }: CreateInviteDialogProps) {
  const [maxUses, setMaxUses] = useState(1);
  const [daysValid, setDaysValid] = useState(7);

  const handleCreate = async () => {
    await onCreate({ maxUses, daysValid });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Icon name="Plus" size={16} />
          Создать приглашение
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новое приглашение</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="maxUses">Максимум использований</Label>
            <Input
              id="maxUses"
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
            />
          </div>
          <div>
            <Label htmlFor="daysValid">Действителен (дней)</Label>
            <Input
              id="daysValid"
              type="number"
              min="1"
              value={daysValid}
              onChange={(e) => setDaysValid(parseInt(e.target.value) || 1)}
            />
          </div>
          <Button onClick={handleCreate} disabled={isLoading} className="w-full">
            {isLoading ? 'Создание...' : 'Создать'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
