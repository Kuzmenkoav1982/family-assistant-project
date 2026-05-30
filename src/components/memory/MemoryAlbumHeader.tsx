import type React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import type { MemoryAlbum } from './types';

interface MemoryAlbumHeaderProps {
  album: MemoryAlbum;
  coverUrl: string | null;
  canSelect: boolean;
  onClear: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onBulkAdd: () => void;
  onPickCover: () => void;
  onStartSelection: () => void;
  onQuickUpload?: () => void;
  quickUploading?: boolean;
  quickUploadInputProps?: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> };
}

export default function MemoryAlbumHeader({
  album,
  coverUrl,
  canSelect,
  onClear,
  onEdit,
  onArchive,
  onBulkAdd,
  onPickCover,
  onStartSelection,
  onQuickUpload,
  quickUploading,
  quickUploadInputProps,
}: MemoryAlbumHeaderProps) {
  return (
    <div className="mb-4 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {coverUrl && (
            <button
              type="button"
              onClick={onPickCover}
              className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 border-amber-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary sm:h-20 sm:w-20"
              title="Сменить обложку"
            >
              <img src={coverUrl} alt={album.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                <Icon name="Pencil" size={14} className="text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </button>
          )}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Icon name="BookHeart" size={16} className="text-amber-700" />
              <span className="text-xs font-medium uppercase tracking-wide text-amber-700">Альбом</span>
            </div>
            <h2 className="text-xl font-bold text-amber-950">{album.title}</h2>
            {album.description && (
              <p className="mt-1 text-sm text-amber-900/80">{album.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Icon name="MoreHorizontal" size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Icon name="Pencil" size={14} className="mr-2" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPickCover}>
                <Icon name="Image" size={14} className="mr-2" />
                Выбрать обложку
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive} className="text-destructive">
                <Icon name="Archive" size={14} className="mr-2" />
                В архив
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1 px-2 text-xs">
            <Icon name="X" size={12} />
            Закрыть
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {quickUploadInputProps && <input {...quickUploadInputProps} />}
        <Button
          size="sm"
          onClick={onQuickUpload}
          disabled={quickUploading}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          {quickUploading ? (
            <Icon name="Loader" size={14} className="mr-1.5 animate-spin" />
          ) : (
            <Icon name="ImagePlus" size={14} className="mr-1.5" />
          )}
          {quickUploading ? 'Загружаем…' : 'Добавить фото'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onBulkAdd}
          className="border-amber-300 bg-white text-amber-900 hover:bg-amber-50"
        >
          <Icon name="FolderPlus" size={14} className="mr-1.5" />
          Существующие
        </Button>
        {canSelect && (
          <Button
            size="sm"
            variant="outline"
            onClick={onStartSelection}
            className="border-amber-300 bg-white text-amber-900 hover:bg-amber-50"
          >
            <Icon name="CheckSquare" size={14} className="mr-1.5" />
            Выбрать
          </Button>
        )}
        <Badge variant="secondary" className="bg-white">
          <Icon name="Images" size={11} className="mr-1" />
          Новая память здесь автоматически попадёт в этот альбом
        </Badge>
      </div>
    </div>
  );
}