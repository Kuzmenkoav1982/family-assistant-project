import { useEffect, useState } from 'react';
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
import { toast } from 'sonner';
import { memoryApi } from './api';
import type { MemoryAlbum } from './types';

interface MemoryAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAlbum?: MemoryAlbum | null;
  onSaved: (album: MemoryAlbum) => void;
}

export default function MemoryAlbumDialog({
  open,
  onOpenChange,
  initialAlbum,
  onSaved,
}: MemoryAlbumDialogProps) {
  const isEdit = Boolean(initialAlbum);
  const [title, setTitle] = useState(initialAlbum?.title ?? '');
  const [description, setDescription] = useState(initialAlbum?.description ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(initialAlbum?.title ?? '');
    setDescription(initialAlbum?.description ?? '');
  }, [open, initialAlbum]);

  async function handleSave() {
    if (!title.trim()) {
      toast.error('Укажите название альбома');
      return;
    }
    setSaving(true);
    try {
      const saved = initialAlbum
        ? await memoryApi.updateAlbum(initialAlbum.id, {
            title: title.trim(),
            description: description.trim() || null,
          })
        : await memoryApi.createAlbum({
            title: title.trim(),
            description: description.trim() || null,
          });
      onSaved(saved);
      toast.success(isEdit ? 'Альбом обновлён' : 'Альбом создан');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать альбом' : 'Новый альбом'}</DialogTitle>
          <DialogDescription>
            Тематический альбом — это коллекция уже созданных карточек памяти.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="album-title">Название *</Label>
            <Input
              id="album-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Например: Предки, Наша семья в 90-е, Детство Матвея"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="album-desc">Описание</Label>
            <Textarea
              id="album-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="О чём этот альбом — какую часть истории семьи он собирает"
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать альбом'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
