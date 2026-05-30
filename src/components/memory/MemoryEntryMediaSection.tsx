import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { MAX_PHOTOS_PER_MEMORY, type MemoryAsset } from './types';

interface MemoryEntryMediaSectionProps {
  assets: MemoryAsset[];
  coverId: string | null | undefined;
  photosLeft: number;
  uploading: boolean;
  progress: number;
  onFiles: (files: FileList | null) => void;
  onRemove: (assetId: string) => void;
  onSetCover: (assetId: string) => void;
}

export default function MemoryEntryMediaSection({
  assets,
  coverId,
  photosLeft,
  uploading,
  progress,
  onFiles,
  onRemove,
  onSetCover,
}: MemoryEntryMediaSectionProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label>Фото ({assets.length}/{MAX_PHOTOS_PER_MEMORY})</Label>
        {assets.length > 0 && photosLeft > 0 && (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => { onFiles(e.target.files); e.target.value = ''; }}
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
            const isCover = coverId === asset.id;
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
                      onClick={() => onRemove(asset.id)}
                      className="rounded-full bg-red-500/90 p-1 text-white hover:bg-red-600"
                      aria-label="Удалить"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                  {!isCover && (
                    <button
                      type="button"
                      onClick={() => onSetCover(asset.id)}
                      className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-foreground"
                    >
                      Сделать обложкой
                    </button>
                  )}
                </div>
                {isCover && (
                  <Badge className="absolute left-1 top-1 bg-primary text-[10px]">Обложка</Badge>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <label className="cursor-pointer block">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => { onFiles(e.target.files); e.target.value = ''; }}
            disabled={uploading}
          />
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground hover:bg-muted/50 hover:border-primary/40 transition-colors">
            {uploading ? (
              <>
                <Icon name="Loader2" size={24} className="mx-auto mb-2 animate-spin opacity-60" />
                Загрузка {progress}%
              </>
            ) : (
              <>
                <Icon name="ImagePlus" size={24} className="mx-auto mb-2 opacity-50" />
                Нажмите, чтобы добавить фото
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}