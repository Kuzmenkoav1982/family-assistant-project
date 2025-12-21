import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Trip {
  id: number;
  title: string;
  destination: string;
  country: string | { name: string };
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
  spent: number;
  currency: string;
  description: string;
  cover_image?: string;
  participants: string;
}

interface EditTripDialogProps {
  isOpen: boolean;
  editingTrip: Trip | null;
  onOpenChange: (open: boolean) => void;
  onEditingTripChange: (trip: Trip) => void;
  onUpdateTrip: () => void;
}

export function EditTripDialog({
  isOpen,
  editingTrip,
  onOpenChange,
  onEditingTripChange,
  onUpdateTrip,
}: EditTripDialogProps) {
  if (!editingTrip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать поездку</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Название *</Label>
              <Input
                value={editingTrip.title}
                onChange={(e) => onEditingTripChange({ ...editingTrip, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Место назначения *</Label>
              <Input
                value={editingTrip.destination}
                onChange={(e) => onEditingTripChange({ ...editingTrip, destination: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Страна</Label>
            <Input
              value={
                typeof editingTrip.country === 'object' ? editingTrip.country.name : editingTrip.country
              }
              onChange={(e) => onEditingTripChange({ ...editingTrip, country: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Дата начала *</Label>
              <Input
                type="date"
                value={editingTrip.start_date}
                onChange={(e) => onEditingTripChange({ ...editingTrip, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Дата окончания *</Label>
              <Input
                type="date"
                value={editingTrip.end_date}
                onChange={(e) => onEditingTripChange({ ...editingTrip, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Бюджет (₽)</Label>
              <Input
                type="number"
                value={editingTrip.budget}
                onChange={(e) =>
                  onEditingTripChange({ ...editingTrip, budget: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label>Потрачено (₽)</Label>
              <Input
                type="number"
                value={editingTrip.spent}
                onChange={(e) =>
                  onEditingTripChange({ ...editingTrip, spent: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div>
            <Label>Статус</Label>
            <Select
              value={editingTrip.status}
              onValueChange={(value) => onEditingTripChange({ ...editingTrip, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wishlist">Мечта</SelectItem>
                <SelectItem value="planning">Планируем</SelectItem>
                <SelectItem value="booked">Забронировано</SelectItem>
                <SelectItem value="ongoing">В пути</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Описание</Label>
            <Textarea
              value={editingTrip.description}
              onChange={(e) => onEditingTripChange({ ...editingTrip, description: e.target.value })}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onUpdateTrip}>Сохранить изменения</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
