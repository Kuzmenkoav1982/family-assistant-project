import { useRef, useState } from 'react';
import type React from 'react';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';
import { memoryApi } from './api';
import type { MemoryEntry } from './types';

interface UseQuickPhotoUploadOptions {
  albumId?: string;
  onDone: (entries: MemoryEntry[]) => void;
}

export function useQuickPhotoUpload({ albumId, onDone }: UseQuickPhotoUploadOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { upload } = useFileUpload();

  function openPicker() {
    inputRef.current?.click();
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    const created: MemoryEntry[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const title = file.name.replace(/\.[^.]+$/, '') || today;

        const entry = await memoryApi.createEntry({
          title,
          memory_date: today,
          status: 'draft',
        } as Parameters<typeof memoryApi.createEntry>[0]);

        const fileUrl = await upload(file, 'memory');
        await memoryApi.addAsset(entry.id, { file_url: fileUrl });

        if (albumId) {
          await memoryApi.setEntryAlbums(entry.id, [albumId]).catch(() => {});
        }

        await memoryApi.publishEntry(entry.id);
        created.push(entry);
      } catch {
        toast.error(`Не удалось загрузить ${file.name}`);
      }
    }

    setUploading(false);

    if (created.length > 0) {
      toast.success(
        created.length === 1 ? 'Фото добавлено' : `Добавлено фото: ${created.length}`
      );
      onDone(created);
    }
  }

  const inputProps = {
    ref: inputRef,
    type: 'file' as const,
    accept: 'image/*',
    multiple: true,
    className: 'hidden',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files),
    onClick: (e: React.MouseEvent<HTMLInputElement>) => {
      (e.target as HTMLInputElement).value = '';
    },
  };

  return { openPicker, uploading, inputProps };
}
