import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { formatCurrencyOptions } from '@/data/currencies';
import { ParticipantsPicker } from '@/components/leisure/ParticipantsPicker';
import Icon from '@/components/ui/icon';
import type { LeisureActivity, NewActivityForm } from '@/data/leisureTypes';
import { CATEGORIES } from '@/data/leisureTypes';

interface LeisureDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (v: boolean) => void;
  newActivity: NewActivityForm;
  setNewActivity: (v: NewActivityForm) => void;
  tagInput: string;
  setTagInput: (v: string) => void;
  handleCreateActivity: () => void;

  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (v: boolean) => void;
  editingActivity: LeisureActivity | null;
  setEditingActivity: (v: LeisureActivity | null) => void;
  handleUpdateActivity: () => void;
}

function TagsInput({
  tags, tagInput, setTagInput,
  onAddTag, onRemoveTag,
}: {
  tags: string[]; tagInput: string; setTagInput: (v: string) => void;
  onAddTag: (tag: string) => void; onRemoveTag: (idx: number) => void;
}) {
  return (
    <div>
      <Label>Теги</Label>
      <div className="flex gap-2 mb-2">
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Введите тег и нажмите Enter"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && tagInput.trim()) {
              e.preventDefault();
              if (!tags.includes(tagInput.trim())) {
                onAddTag(tagInput.trim());
              }
              setTagInput('');
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => {
          if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            onAddTag(tagInput.trim());
            setTagInput('');
          }
        }}>
          <Icon name="Plus" size={14} />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="gap-1">
              <Icon name="Tag" size={10} />
              {tag}
              <button type="button" onClick={() => onRemoveTag(idx)} className="ml-1 hover:text-red-600">
                <Icon name="X" size={10} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarVisibility({
  showInCalendar, visibleTo,
  onToggle, onVisibleChange,
}: {
  showInCalendar: boolean; visibleTo: string[];
  onToggle: (v: boolean) => void; onVisibleChange: (ids: string[]) => void;
}) {
  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <Label className="flex items-center gap-2">
          <Icon name="CalendarDays" size={16} />
          Показать в общем календаре семьи
        </Label>
        <input type="checkbox" checked={showInCalendar} onChange={(e) => onToggle(e.target.checked)} className="w-4 h-4 rounded" />
      </div>
      {showInCalendar && (
        <div className="ml-6 space-y-2">
          <Label className="text-sm text-gray-600">Кто увидит в календаре?</Label>
          <ParticipantsPicker selectedIds={visibleTo} onChange={onVisibleChange} />
          <p className="text-xs text-gray-500">Если никого не выбрать — увидят все члены семьи</p>
        </div>
      )}
    </div>
  );
}

export default function LeisureDialogs({
  isAddDialogOpen, setIsAddDialogOpen,
  newActivity, setNewActivity,
  tagInput, setTagInput,
  handleCreateActivity,
  isEditDialogOpen, setIsEditDialogOpen,
  editingActivity, setEditingActivity,
  handleUpdateActivity,
}: LeisureDialogsProps) {
  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Добавить активность</DialogTitle>
            <DialogDescription>Создайте новую активность для досуга с деталями и местоположением</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название *</Label>
              <Input value={newActivity.title} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} placeholder="Например: Поход в Большой театр" />
            </div>
            <div>
              <Label>Категория *</Label>
              <Select value={newActivity.category} onValueChange={(val) => setNewActivity({ ...newActivity, category: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Статус</Label>
              <Select value={newActivity.status} onValueChange={(val) => setNewActivity({ ...newActivity, status: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="want_to_go">Хочу посетить</SelectItem>
                  <SelectItem value="planned">Запланировано</SelectItem>
                  <SelectItem value="visited">Посещено</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Место</Label>
              <Input value={newActivity.location} onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })} placeholder="Москва, Театральная площадь, 1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Дата</Label><Input type="date" value={newActivity.date} onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })} /></div>
              <div><Label>Время</Label><Input type="time" value={newActivity.time} onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Цена</Label><Input type="number" value={newActivity.price} onChange={(e) => setNewActivity({ ...newActivity, price: e.target.value })} placeholder="5000" /></div>
              <div>
                <Label>Валюта</Label>
                <Combobox value={newActivity.currency} onValueChange={(val) => setNewActivity({ ...newActivity, currency: val })} options={formatCurrencyOptions()} placeholder="Выберите валюту" searchPlaceholder="Поиск валюты..." emptyText="Валюта не найдена" />
              </div>
            </div>
            <div><Label>Заметки</Label><Textarea value={newActivity.notes} onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })} placeholder="Дополнительная информация..." rows={3} /></div>
            <TagsInput
              tags={newActivity.tags} tagInput={tagInput} setTagInput={setTagInput}
              onAddTag={(tag) => setNewActivity({ ...newActivity, tags: [...newActivity.tags, tag] })}
              onRemoveTag={(idx) => setNewActivity({ ...newActivity, tags: newActivity.tags.filter((_, i) => i !== idx) })}
            />
            <div><Label>Участники</Label><ParticipantsPicker selectedIds={newActivity.participants} onChange={(ids) => setNewActivity({ ...newActivity, participants: ids })} /></div>
            <CalendarVisibility
              showInCalendar={newActivity.show_in_calendar} visibleTo={newActivity.visible_to}
              onToggle={(v) => setNewActivity({ ...newActivity, show_in_calendar: v })}
              onVisibleChange={(ids) => setNewActivity({ ...newActivity, visible_to: ids })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleCreateActivity}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingActivity && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setTagInput(''); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Редактировать активность</DialogTitle>
              <DialogDescription>Измените информацию о выбранной активности</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Название *</Label><Input value={editingActivity.title} onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })} /></div>
              <div>
                <Label>Категория *</Label>
                <Select value={editingActivity.category} onValueChange={(val) => setEditingActivity({ ...editingActivity, category: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Статус</Label>
                <Select value={editingActivity.status} onValueChange={(val) => setEditingActivity({ ...editingActivity, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="want_to_go">Хочу посетить</SelectItem>
                    <SelectItem value="planned">Запланировано</SelectItem>
                    <SelectItem value="visited">Посещено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Место</Label><Input value={editingActivity.location || ''} onChange={(e) => setEditingActivity({ ...editingActivity, location: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Дата</Label><Input type="date" value={editingActivity.date || ''} onChange={(e) => setEditingActivity({ ...editingActivity, date: e.target.value })} /></div>
                <div><Label>Время</Label><Input type="time" value={editingActivity.time || ''} onChange={(e) => setEditingActivity({ ...editingActivity, time: e.target.value })} /></div>
              </div>
              {editingActivity.date && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <Label className="flex items-center gap-2 mb-2"><Icon name="Bell" size={14} />Напомнить за...</Label>
                  <div className="flex gap-2">
                    {[{ label: '1 час', hours: 1 }, { label: '1 день', days: 1 }, { label: '1 неделя', days: 7 }].map((r, i) => (
                      <Button key={i} type="button" variant="outline" size="sm" onClick={() => {
                        const rd = new Date(`${editingActivity.date}T${editingActivity.time || '12:00'}`);
                        if ('hours' in r) rd.setHours(rd.getHours() - r.hours!);
                        else rd.setDate(rd.getDate() - r.days!);
                        alert(`Напоминание установлено на ${rd.toLocaleString('ru-RU')}`);
                      }}>{r.label}</Button>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Цена</Label><Input type="number" value={editingActivity.price || ''} onChange={(e) => setEditingActivity({ ...editingActivity, price: parseFloat(e.target.value) })} /></div>
                <div>
                  <Label>Валюта</Label>
                  <Combobox value={editingActivity.currency} onValueChange={(val) => setEditingActivity({ ...editingActivity, currency: val })} options={formatCurrencyOptions()} placeholder="Выберите валюту" searchPlaceholder="Поиск валюты..." emptyText="Валюта не найдена" />
                </div>
              </div>
              {editingActivity.status === 'visited' && (
                <div>
                  <Label>Оценка</Label>
                  <Select value={editingActivity.rating?.toString() || ''} onValueChange={(val) => setEditingActivity({ ...editingActivity, rating: parseInt(val) })}>
                    <SelectTrigger><SelectValue placeholder="Поставьте оценку" /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4, 5].map((rating) => (<SelectItem key={rating} value={rating.toString()}>{'\u2B50'.repeat(rating)}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              )}
              <div><Label>Заметки</Label><Textarea value={editingActivity.notes || ''} onChange={(e) => setEditingActivity({ ...editingActivity, notes: e.target.value })} rows={3} /></div>
              <TagsInput
                tags={editingActivity.tags || []} tagInput={tagInput} setTagInput={setTagInput}
                onAddTag={(tag) => setEditingActivity({ ...editingActivity, tags: [...(editingActivity.tags || []), tag] })}
                onRemoveTag={(idx) => setEditingActivity({ ...editingActivity, tags: (editingActivity.tags || []).filter((_, i) => i !== idx) })}
              />
              <div><Label>Участники</Label><ParticipantsPicker selectedIds={editingActivity.participants || []} onChange={(ids) => setEditingActivity({ ...editingActivity, participants: ids })} /></div>
              <CalendarVisibility
                showInCalendar={editingActivity.show_in_calendar || false} visibleTo={editingActivity.visible_to || []}
                onToggle={(v) => setEditingActivity({ ...editingActivity, show_in_calendar: v })}
                onVisibleChange={(ids) => setEditingActivity({ ...editingActivity, visible_to: ids })}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
              <Button onClick={handleUpdateActivity}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}