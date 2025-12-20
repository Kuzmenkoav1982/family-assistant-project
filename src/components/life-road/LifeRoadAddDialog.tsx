import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { usePermissions } from '@/hooks/usePermissions';

interface LifeEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'birth' | 'wedding' | 'education' | 'career' | 'achievement' | 'travel' | 'family' | 'health' | 'other';
  importance: 'low' | 'medium' | 'high' | 'critical';
  participants: string[];
  photos?: string[];
  createdBy: string;
  createdAt: string;
}

interface LifeRoadAddDialogProps {
  showAddDialog: boolean;
  setShowAddDialog: (show: boolean) => void;
  newEvent: {
    date: string;
    title: string;
    description: string;
    category: LifeEvent['category'];
    importance: LifeEvent['importance'];
    participants: string[];
  };
  setNewEvent: (event: any) => void;
  handleAddEvent: () => void;
  categoryConfig: {
    [key: string]: { label: string; icon: string; color: string };
  };
  importanceConfig: {
    [key: string]: { label: string; color: string };
  };
}

export function LifeRoadAddDialog({
  showAddDialog,
  setShowAddDialog,
  newEvent,
  setNewEvent,
  handleAddEvent,
  categoryConfig,
  importanceConfig
}: LifeRoadAddDialogProps) {
  const { members } = useFamilyMembersContext();
  const { canDo } = usePermissions();

  const handleSubmit = () => {
    if (!canDo('events', 'add')) {
      alert('❌ У вас недостаточно прав для создания событий');
      return;
    }
    handleAddEvent();
  };

  if (!canDo('events', 'add')) {
    return null;
  }

  return (
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name="Plus" size={24} />
            Добавить событие
          </DialogTitle>
          <DialogDescription>
            Запишите важный момент в истории вашей семьи
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="date">
              Дата события <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Название события <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Например: Свадьба, Рождение ребёнка, Окончание школы"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Опишите событие подробнее..."
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select
                value={newEvent.category}
                onValueChange={(value) => setNewEvent({ ...newEvent, category: value as LifeEvent['category'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon name={config.icon as any} size={16} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Важность</Label>
              <Select
                value={newEvent.importance}
                onValueChange={(value) => setNewEvent({ ...newEvent, importance: value as LifeEvent['importance'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(importanceConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Участники события</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {members && members.length > 0 ? (
                members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`participant-${member.id}`}
                      checked={newEvent.participants.includes(member.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewEvent({
                            ...newEvent,
                            participants: [...newEvent.participants, member.id]
                          });
                        } else {
                          setNewEvent({
                            ...newEvent,
                            participants: newEvent.participants.filter(id => id !== member.id)
                          });
                        }
                      }}
                    />
                    <Label
                      htmlFor={`participant-${member.id}`}
                      className="text-sm font-normal cursor-pointer flex items-center gap-2"
                    >
                      {member.avatar && <span>{member.avatar}</span>}
                      {member.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Нет доступных членов семьи</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!newEvent.date || !newEvent.title}
            >
              <Icon name="Check" size={16} className="mr-2" />
              Добавить событие
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}