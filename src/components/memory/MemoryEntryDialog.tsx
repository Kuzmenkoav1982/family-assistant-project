import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { useLifeEvents } from '@/components/life-road/useLifeEvents';
import { useMemoryAlbums } from './useMemoryAlbums';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { memoryApi } from './api';
import { MAX_PHOTOS_PER_MEMORY, type MemoryEntry } from './types';

interface MemoryEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEntry?: MemoryEntry | null;
  initialMemberId?: number;
  initialEventId?: string;
  /** Альбом контекста (опционально предвыбирается для новой памяти). */
  initialAlbumId?: string;
  /** Мягкие подсказки для новой памяти (заполняют только пустые поля). */
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
  const isEdit = Boolean(initialEntry);
  const { upload, uploading, progress } = useFileUpload();
  const { members } = useFamilyTree();
  const { events } = useLifeEvents();
  const { albums } = useMemoryAlbums();

  const [entry, setEntry] = useState<MemoryEntry | null>(initialEntry ?? null);
  const [title, setTitle] = useState(initialEntry?.title ?? '');
  const [caption, setCaption] = useState(initialEntry?.caption ?? '');
  const [story, setStory] = useState(initialEntry?.story ?? '');
  const [memoryDate, setMemoryDate] = useState(initialEntry?.memory_date ?? '');
  const [periodLabel, setPeriodLabel] = useState(initialEntry?.memory_period_label ?? '');
  const [location, setLocation] = useState(initialEntry?.location_label ?? '');
  const [memberIds, setMemberIds] = useState<number[]>(
    initialEntry?.member_ids ?? (initialMemberId ? [initialMemberId] : []),
  );
  const [eventId, setEventId] = useState<string | null>(
    initialEntry?.event_id ?? initialEventId ?? null,
  );
  const [albumIds, setAlbumIds] = useState<string[]>(
    initialEntry?.album_ids ?? (initialAlbumId ? [initialAlbumId] : []),
  );

  const [saving, setSaving] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  // флаг легитимного закрытия (через Сохранить) — чтобы handleClose не пытался discard'нуть только что опубликованный draft
  const legitimateCloseRef = useRef(false);

  // Сброс при открытии: для новой памяти подставляем мягкие suggestions
  useEffect(() => {
    if (!open) return;
    setEntry(initialEntry ?? null);
    if (initialEntry) {
      setTitle(initialEntry.title ?? '');
      setCaption(initialEntry.caption ?? '');
      setStory(initialEntry.story ?? '');
      setMemoryDate(initialEntry.memory_date ?? '');
      setPeriodLabel(initialEntry.memory_period_label ?? '');
      setLocation(initialEntry.location_label ?? '');
      setMemberIds(initialEntry.member_ids ?? []);
      setEventId(initialEntry.event_id ?? null);
      setAlbumIds(initialEntry.album_ids ?? []);
    } else {
      setTitle(suggestedTitle ?? '');
      setCaption('');
      setStory('');
      setMemoryDate(suggestedDate ?? '');
      setPeriodLabel('');
      setLocation(suggestedLocation ?? '');
      setMemberIds(initialMemberId ? [initialMemberId] : []);
      setEventId(initialEventId ?? null);
      setAlbumIds(initialAlbumId ? [initialAlbumId] : []);
    }
    setMemberSearch('');
  }, [open, initialEntry, initialMemberId, initialEventId, initialAlbumId, suggestedTitle, suggestedDate, suggestedLocation]);

  const assets = useMemo(
    () => (entry ? [...entry.assets].sort((a, b) => a.sort_order - b.sort_order) : []),
    [entry],
  );

  const photosLeft = MAX_PHOTOS_PER_MEMORY - assets.length;

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m => m.name.toLowerCase().includes(q));
  }, [members, memberSearch]);

  // Создание черновика карточки при первой загрузке фото.
  // Статус draft — он не показывается ни в одном списке, пока пользователь явно не опубликует.
  async function ensureDraft(): Promise<MemoryEntry> {
    if (entry) return entry;
    if (!title.trim()) {
      throw new Error('Сначала укажите название памяти');
    }
    const created = await memoryApi.createEntry({
      title: title.trim(),
      caption: caption || null,
      story: story || null,
      memory_date: memoryDate || null,
      memory_period_label: periodLabel || null,
      location_label: location || null,
      event_id: eventId,
      member_ids: memberIds,
      status: 'draft',
    });
    setEntry(created);
    return created;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!title.trim()) {
      toast.error('Сначала укажите название памяти');
      return;
    }
    const arr = Array.from(files);
    if (arr.length > photosLeft) {
      toast.error(`Можно добавить ещё ${photosLeft} фото (лимит ${MAX_PHOTOS_PER_MEMORY})`);
      return;
    }
    try {
      const draft = await ensureDraft();
      let current = draft;
      for (const file of arr) {
        const url = await upload(file, `memory/${draft.id}`);
        const result = await memoryApi.addAsset(draft.id, {
          file_url: url,
          mime_type: file.type || undefined,
        });
        current = result.entry;
        setEntry(current);
      }
      toast.success(`Загружено фото: ${arr.length}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось загрузить фото');
    }
  }

  async function handleRemoveAsset(assetId: string) {
    try {
      const result = await memoryApi.removeAsset(assetId);
      setEntry(result.entry);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось удалить фото');
    }
  }

  async function handleSetCover(assetId: string) {
    if (!entry) return;
    try {
      const updated = await memoryApi.updateEntry(entry.id, { cover_asset_id: assetId });
      setEntry(updated);
      toast.success('Обложка обновлена');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось обновить обложку');
    }
  }

  function toggleMember(id: number) {
    setMemberIds(prev => (prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]));
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error('Укажите название памяти');
      return;
    }
    if (memberIds.length === 0 && !eventId) {
      toast.error('Привяжите хотя бы одного человека или событие');
      return;
    }
    setSaving(true);

    // Save-оркестратор: базовые поля → персоны+событие → альбомы → publish для draft
    let partial = false;
    try {
      // 1) Подготовка entry: либо updated existing, либо новый
      let workingEntry: MemoryEntry;
      const basePayload = {
        title: title.trim(),
        caption: caption || null,
        story: story || null,
        memory_date: memoryDate || null,
        memory_period_label: periodLabel || null,
        location_label: location || null,
        event_id: eventId,
        member_ids: memberIds,
      };
      if (entry) {
        workingEntry = await memoryApi.updateEntry(entry.id, basePayload);
      } else {
        // создаём как draft, чтобы при ошибке альбомов он не "вылез" опубликованным
        workingEntry = await memoryApi.createEntry({ ...basePayload, status: 'draft' });
      }

      // 2) Альбомы (полная синхронизация). Работает и для draft, и для published.
      try {
        await memoryApi.setEntryAlbums(workingEntry.id, albumIds);
      } catch (err) {
        partial = true;
        toast.error(
          'Не удалось обновить альбомы: ' +
            (err instanceof Error ? err.message : 'неизвестная ошибка'),
        );
      }

      // 3) Publish: только если все связи доехали успешно и это draft.
      let saved = workingEntry;
      if (!partial && workingEntry.status === 'draft') {
        saved = await memoryApi.publishEntry(workingEntry.id);
      } else if (partial && workingEntry.status === 'draft') {
        // оставляем как draft — пользователь увидит подсказку
        toast('Сохранено как черновик — исправьте альбомы и попробуйте снова');
      }

      onSaved(saved);

      if (!partial) {
        toast.success(isEdit ? 'Память обновлена' : 'Память сохранена');
        legitimateCloseRef.current = true;
        onOpenChange(false);
      } else {
        // оставляем диалог открытым, чтобы пользователь мог поправить альбомы
        setEntry(saved);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  async function handleClose(nextOpen: boolean) {
    if (!nextOpen && !legitimateCloseRef.current) {
      // Cancel / X / клик вне диалога — если был создан незавершённый draft, гасим его.
      if (entry && entry.status === 'draft') {
        try {
          await memoryApi.discardDraft(entry.id);
        } catch {
          // тихо — пользователь уже закрыл диалог
        }
      }
    }
    legitimateCloseRef.current = false;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать память' : 'Новая карточка памяти'}</DialogTitle>
          <DialogDescription>
            Сохраните важный момент: фото, кто на них, когда это было и почему важно.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="memory-title">Название *</Label>
            <Input
              id="memory-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Например: Свадьба бабушки и дедушки"
              className="mt-1"
            />
          </div>

          {/* Фото */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Фото ({assets.length}/{MAX_PHOTOS_PER_MEMORY})</Label>
              {photosLeft > 0 && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                      handleFiles(e.target.files);
                      e.target.value = '';
                    }}
                    disabled={uploading}
                  />
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed px-3 py-1.5 text-sm hover:bg-accent">
                    <Icon name="ImagePlus" size={14} />
                    {uploading ? `Загрузка ${progress}%` : 'Добавить фото'}
                  </span>
                </label>
              )}
            </div>

            {assets.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {assets.map(asset => {
                  const isCover = entry?.cover_asset_id === asset.id;
                  return (
                    <div
                      key={asset.id}
                      className={`group relative aspect-square overflow-hidden rounded-lg border-2 ${
                        isCover ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={asset.file_url} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveAsset(asset.id)}
                            className="rounded-full bg-red-500/90 p-1 text-white hover:bg-red-600"
                            aria-label="Удалить"
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </div>
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(asset.id)}
                            className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-foreground"
                          >
                            Сделать обложкой
                          </button>
                        )}
                      </div>
                      {isCover && (
                        <Badge className="absolute left-1 top-1 bg-primary text-[10px]">
                          Обложка
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                <Icon name="Image" size={24} className="mx-auto mb-2 opacity-50" />
                Добавьте 1–10 важных фото
              </div>
            )}
          </div>

          {/* Метаданные */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="memory-date">Точная дата</Label>
              <Input
                id="memory-date"
                type="date"
                value={memoryDate || ''}
                onChange={e => setMemoryDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="memory-period">Период</Label>
              <Input
                id="memory-period"
                value={periodLabel || ''}
                onChange={e => setPeriodLabel(e.target.value)}
                placeholder="1950-е, Детство"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="memory-location">Место</Label>
            <Input
              id="memory-location"
              value={location || ''}
              onChange={e => setLocation(e.target.value)}
              placeholder="Москва, дача, школа №7..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="memory-caption">Подпись</Label>
            <Input
              id="memory-caption"
              value={caption || ''}
              onChange={e => setCaption(e.target.value)}
              placeholder="Короткая фраза: что это был за момент"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="memory-story">История</Label>
            <Textarea
              id="memory-story"
              value={story || ''}
              onChange={e => setStory(e.target.value)}
              placeholder="Расскажите, почему этот момент важен — детям и внукам будет ценно прочитать"
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Люди */}
          <div>
            <Label>Кто на фото</Label>
            {members.length > 6 && (
              <Input
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                placeholder="Найти..."
                className="mt-1"
              />
            )}
            <ScrollArea className="mt-2 h-48 rounded-md border p-2">
              {filteredMembers.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Никто не найден. Добавьте людей в Древо семьи.
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredMembers.map(m => (
                    <label
                      key={m.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                    >
                      <Checkbox
                        checked={memberIds.includes(m.id)}
                        onCheckedChange={() => toggleMember(m.id)}
                      />
                      <span className="text-lg">{m.avatar || '👤'}</span>
                      <span className="text-sm">{m.name}</span>
                      {m.relation && (
                        <span className="text-xs text-muted-foreground">· {m.relation}</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Событие */}
          <div>
            <Label>Событие на Дороге жизни</Label>
            <Select
              value={eventId ?? '__none__'}
              onValueChange={v => setEventId(v === '__none__' ? null : v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Не привязано" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  <span className="text-muted-foreground">Без события</span>
                </SelectItem>
                {events.map(ev => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.title}
                    {ev.date && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        · {new Date(ev.date).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Альбомы */}
          <div>
            <Label>Альбомы ({albumIds.length})</Label>
            {albums.length === 0 ? (
              <p className="mt-1 rounded-md border border-dashed bg-muted/30 p-3 text-center text-xs text-muted-foreground">
                Альбомов пока нет. Создайте их в разделе «Альбом поколений».
              </p>
            ) : (
              <ScrollArea className="mt-1 h-32 rounded-md border p-2">
                <div className="space-y-1">
                  {albums.map(a => {
                    const checked = albumIds.includes(a.id);
                    return (
                      <label
                        key={a.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => {
                            setAlbumIds(prev =>
                              checked ? prev.filter(x => x !== a.id) : [...prev, a.id],
                            );
                          }}
                        />
                        <Icon name="BookHeart" size={14} className="text-amber-600" />
                        <span className="text-sm">{a.title}</span>
                      </label>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать память'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}