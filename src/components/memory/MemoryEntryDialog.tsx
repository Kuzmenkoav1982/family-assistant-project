import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMemoryEntryForm } from './useMemoryEntryForm';
import MemoryEntryMediaSection from './MemoryEntryMediaSection';
import MemoryEntryParticipantsSection from './MemoryEntryParticipantsSection';
import type { MemoryEntry } from './types';

interface MemoryEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEntry?: MemoryEntry | null;
  initialMemberId?: number;
  initialEventId?: string;
  initialAlbumId?: string;
  suggestedTitle?: string;
  suggestedDate?: string;
  suggestedLocation?: string;
  onSaved: (entry: MemoryEntry) => void;
}

export default function MemoryEntryDialog({
  open,
  onOpenChange,
  initialEntry,
  initialMemberId,
  initialEventId,
  initialAlbumId,
  suggestedTitle,
  suggestedDate,
  suggestedLocation,
  onSaved,
}: MemoryEntryDialogProps) {
  const form = useMemoryEntryForm({
    open,
    initialEntry,
    initialMemberId,
    initialEventId,
    initialAlbumId,
    suggestedTitle,
    suggestedDate,
    suggestedLocation,
    onSaved,
    onClose: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) form.handleClose(); }}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {form.isEdit ? 'Редактировать память' : 'Новая карточка памяти'}
          </DialogTitle>
          <DialogDescription>
            Сохраните важный момент: фото, кто на них, когда это было и почему важно.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="memory-title">Название *</Label>
            <Input
              id="memory-title"
              value={form.title}
              onChange={e => form.setTitle(e.target.value)}
              placeholder="Например: Свадьба бабушки и дедушки"
              className="mt-1"
            />
          </div>

          <MemoryEntryMediaSection
            assets={form.assets}
            coverId={form.entry?.cover_asset_id}
            photosLeft={form.photosLeft}
            uploading={form.uploading}
            progress={form.progress}
            onFiles={form.handleFiles}
            onRemove={form.handleRemoveAsset}
            onSetCover={form.handleSetCover}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="memory-date">Точная дата</Label>
              <Input
                id="memory-date"
                type="date"
                value={form.memoryDate || ''}
                onChange={e => form.setMemoryDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="memory-period">Период</Label>
              <Input
                id="memory-period"
                value={form.periodLabel || ''}
                onChange={e => form.setPeriodLabel(e.target.value)}
                placeholder="1950-е, Детство"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="memory-location">Место</Label>
            <Input
              id="memory-location"
              value={form.location || ''}
              onChange={e => form.setLocation(e.target.value)}
              placeholder="Москва, дача, школа №7..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="memory-caption">Подпись</Label>
            <Input
              id="memory-caption"
              value={form.caption || ''}
              onChange={e => form.setCaption(e.target.value)}
              placeholder="Короткая фраза: что это был за момент"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="memory-story">История</Label>
            <Textarea
              id="memory-story"
              value={form.story || ''}
              onChange={e => form.setStory(e.target.value)}
              placeholder="Расскажите, почему этот момент важен — детям и внукам будет ценно прочитать"
              rows={4}
              className="mt-1"
            />
          </div>

          <MemoryEntryParticipantsSection
            members={form.members}
            filteredMembers={form.filteredMembers}
            memberIds={form.memberIds}
            memberSearch={form.memberSearch}
            events={form.events}
            eventId={form.eventId}
            albums={form.albums}
            albumIds={form.albumIds}
            onMemberSearch={form.setMemberSearch}
            onToggleMember={form.toggleMember}
            onEventChange={form.setEventId}
            onAlbumToggle={(id, checked) =>
              form.setAlbumIds(prev => checked ? prev.filter(x => x !== id) : [...prev, id])
            }
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={form.handleClose} disabled={form.saving}>
            Отмена
          </Button>
          <Button onClick={form.handleSave} disabled={form.saving || form.uploading}>
            {form.saving ? 'Сохранение...' : form.isEdit ? 'Сохранить' : 'Создать память'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
