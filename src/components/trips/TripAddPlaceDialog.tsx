import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface NewPlaceForm {
  place_name: string;
  place_type: string;
  address: string;
  description: string;
  priority: string;
  estimated_cost: string;
}

interface TripAddPlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: NewPlaceForm;
  onChange: (form: NewPlaceForm) => void;
  onSubmit: () => void;
}

export function TripAddPlaceDialog({ open, onOpenChange, value, onChange, onSubmit }: TripAddPlaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить место в Wish List</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="place_name">Название места *</Label>
            <Input
              id="place_name"
              value={value.place_name}
              onChange={(e) => onChange({ ...value, place_name: e.target.value })}
              placeholder="Эйфелева башня"
            />
          </div>
          <div>
            <Label htmlFor="place_type">Тип места</Label>
            <Select value={value.place_type} onValueChange={(val) => onChange({ ...value, place_type: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attraction">🏛️ Достопримечательность</SelectItem>
                <SelectItem value="restaurant">🍽️ Ресторан</SelectItem>
                <SelectItem value="hotel">🏨 Отель</SelectItem>
                <SelectItem value="activity">🎭 Активность</SelectItem>
                <SelectItem value="other">📍 Другое</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              value={value.address}
              onChange={(e) => onChange({ ...value, address: e.target.value })}
              placeholder="Champ de Mars, Paris"
            />
          </div>
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={value.description}
              onChange={(e) => onChange({ ...value, description: e.target.value })}
              placeholder="Почему хотите посетить это место?"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Приоритет</Label>
              <Select value={value.priority} onValueChange={(val) => onChange({ ...value, priority: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔥 Высокий</SelectItem>
                  <SelectItem value="medium">⭐ Средний</SelectItem>
                  <SelectItem value="low">💤 Низкий</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cost">Примерная стоимость</Label>
              <Input
                id="cost"
                type="number"
                value={value.estimated_cost}
                onChange={(e) => onChange({ ...value, estimated_cost: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>Добавить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
