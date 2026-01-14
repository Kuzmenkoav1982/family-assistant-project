import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface NewTripData {
  title: string;
  destination: string;
  country: string;
  start_date: string;
  end_date: string;
  budget: string;
  description: string;
}

interface CreateTripDialogProps {
  isOpen: boolean;
  newTrip: NewTripData;
  onOpenChange: (open: boolean) => void;
  onNewTripChange: (trip: NewTripData) => void;
  onCreateTrip: () => void;
}

export function CreateTripDialog({
  isOpen,
  newTrip,
  onOpenChange,
  onNewTripChange,
  onCreateTrip,
}: CreateTripDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg gap-2" size="icon">
          <Icon name="Plus" size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Создать новую поездку</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Название поездки *</Label>
            <Input
              value={newTrip.title}
              onChange={(e) => onNewTripChange({ ...newTrip, title: e.target.value })}
              placeholder="Летний отдых в Сочи"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Место назначения *</Label>
              <Input
                value={newTrip.destination}
                onChange={(e) => onNewTripChange({ ...newTrip, destination: e.target.value })}
                placeholder="Сочи"
              />
            </div>
            <div>
              <Label>Страна</Label>
              <Input
                value={newTrip.country}
                onChange={(e) => onNewTripChange({ ...newTrip, country: e.target.value })}
                placeholder="Россия"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Дата начала *</Label>
              <Input
                type="date"
                value={newTrip.start_date}
                onChange={(e) => onNewTripChange({ ...newTrip, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Дата окончания *</Label>
              <Input
                type="date"
                value={newTrip.end_date}
                onChange={(e) => onNewTripChange({ ...newTrip, end_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Бюджет (₽)</Label>
            <Input
              type="number"
              value={newTrip.budget}
              onChange={(e) => onNewTripChange({ ...newTrip, budget: e.target.value })}
              placeholder="150000"
            />
          </div>

          <div>
            <Label>Описание</Label>
            <Textarea
              value={newTrip.description}
              onChange={(e) => onNewTripChange({ ...newTrip, description: e.target.value })}
              placeholder="Семейный отдых на море..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Create button clicked');
              onCreateTrip();
            }}
          >
            Создать поездку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}