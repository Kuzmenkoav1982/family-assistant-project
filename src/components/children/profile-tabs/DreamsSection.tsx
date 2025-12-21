import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export interface Dream {
  id: string;
  dream: string;
  category: 'career' | 'travel' | 'achievement' | 'other';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

interface DreamsSectionProps {
  dreams: Dream[];
  newDreamDialog: boolean;
  editDreamDialog: boolean;
  selectedDream: Dream | null;
  newDreamData: { dream: string; category: 'career' | 'travel' | 'achievement' | 'other'; priority: 'high' | 'medium' | 'low'; notes: string };
  onNewDreamDialogChange: (open: boolean) => void;
  onEditDreamDialogChange: (open: boolean) => void;
  onSelectedDreamChange: (dream: Dream | null) => void;
  onNewDreamDataChange: (data: { dream: string; category: 'career' | 'travel' | 'achievement' | 'other'; priority: 'high' | 'medium' | 'low'; notes: string }) => void;
  onAddDream: () => void;
  onEditDream: (dream: Dream) => void;
  onUpdateDream: () => void;
  onDeleteDream: (id: string) => void;
}

const categoryNames: Record<string, string> = {
  career: 'Карьера',
  travel: 'Путешествия',
  achievement: 'Достижение',
  other: 'Другое',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const priorityNames: Record<string, string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

export function DreamsSection({
  dreams,
  newDreamDialog,
  editDreamDialog,
  selectedDream,
  newDreamData,
  onNewDreamDialogChange,
  onEditDreamDialogChange,
  onSelectedDreamChange,
  onNewDreamDataChange,
  onAddDream,
  onEditDream,
  onUpdateDream,
  onDeleteDream,
}: DreamsSectionProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Sparkles" size={20} />
              Мечты и цели
            </CardTitle>
            <Dialog open={newDreamDialog} onOpenChange={onNewDreamDialogChange}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить мечту
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить мечту</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Мечта</label>
                    <Input
                      placeholder="Например: Стать космонавтом"
                      value={newDreamData.dream}
                      onChange={(e) => onNewDreamDataChange({ ...newDreamData, dream: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Категория</label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={newDreamData.category}
                      onChange={(e) => onNewDreamDataChange({ ...newDreamData, category: e.target.value as 'career' | 'travel' | 'achievement' | 'other' })}
                    >
                      <option value="career">Карьера</option>
                      <option value="travel">Путешествия</option>
                      <option value="achievement">Достижение</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Приоритет</label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={newDreamData.priority}
                      onChange={(e) => onNewDreamDataChange({ ...newDreamData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    >
                      <option value="high">Высокий</option>
                      <option value="medium">Средний</option>
                      <option value="low">Низкий</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Заметки</label>
                    <Textarea
                      placeholder="Дополнительная информация"
                      value={newDreamData.notes}
                      onChange={(e) => onNewDreamDataChange({ ...newDreamData, notes: e.target.value })}
                    />
                  </div>
                  <Button onClick={onAddDream} className="w-full">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {dreams.map((dream) => (
            <div key={dream.id} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
              <div className="text-2xl mt-1">✨</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-lg">{dream.dream}</h4>
                  <Badge className={priorityColors[dream.priority]}>
                    {priorityNames[dream.priority]}
                  </Badge>
                </div>
                <Badge variant="outline" className="mb-2">
                  {categoryNames[dream.category]}
                </Badge>
                {dream.notes && (
                  <p className="text-sm text-gray-600 mt-2">{dream.notes}</p>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => onEditDream(dream)}>
                  <Icon name="Edit" size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDeleteDream(dream.id)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={editDreamDialog} onOpenChange={onEditDreamDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать мечту</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                id="edit-dream-text"
                value={selectedDream?.dream || ''}
                onChange={(e) => onSelectedDreamChange(selectedDream ? { ...selectedDream, dream: e.target.value } : null)}
                className="w-full"
              />
              <label htmlFor="edit-dream-text" className="text-sm">Мечта</label>
            </div>
            <div>
              <select
                id="edit-dream-category"
                value={selectedDream?.category || 'other'}
                onChange={(e) => onSelectedDreamChange(selectedDream ? { ...selectedDream, category: e.target.value as 'career' | 'travel' | 'achievement' | 'other' } : null)}
                className="w-full border rounded-md p-2"
              >
                <option value="career">Карьера</option>
                <option value="travel">Путешествия</option>
                <option value="achievement">Достижение</option>
                <option value="other">Другое</option>
              </select>
              <label htmlFor="edit-dream-category" className="text-sm">Категория</label>
            </div>
            <div>
              <select
                id="edit-dream-priority"
                value={selectedDream?.priority || 'medium'}
                onChange={(e) => onSelectedDreamChange(selectedDream ? { ...selectedDream, priority: e.target.value as 'high' | 'medium' | 'low' } : null)}
                className="w-full border rounded-md p-2"
              >
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
              <label htmlFor="edit-dream-priority" className="text-sm">Приоритет</label>
            </div>
            <div>
              <Textarea
                id="edit-dream-notes"
                value={selectedDream?.notes || ''}
                onChange={(e) => onSelectedDreamChange(selectedDream ? { ...selectedDream, notes: e.target.value } : null)}
                className="w-full"
              />
              <label htmlFor="edit-dream-notes" className="text-sm">Заметки</label>
            </div>
            <Button onClick={onUpdateDream} className="w-full">Сохранить изменения</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
