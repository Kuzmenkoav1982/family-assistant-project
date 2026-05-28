import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { memoryApi } from '@/components/memory/api';
import type { MemoryEntry } from '@/components/memory/types';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedUrls: string[];
  onSelect: (urls: string[]) => void;
}

export default function AlbumPhotoPicker({ open, onOpenChange, selectedUrls, onSelect }: Props) {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setPicked(new Set(selectedUrls));
    setLoading(true);
    memoryApi.listEntries({ sort: 'memory_date_desc' })
      .then((data) => { setEntries(data.filter((e) => e.assets.length > 0)); })
      .catch(console.error)
      .finally(() => { setLoading(false); });
  // selectedUrls намеренно не в deps — инициализируем только при открытии
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const allAssets = entries.flatMap((e) =>
    e.assets.map((a) => ({ url: a.file_url, title: e.title, date: e.memory_date }))
  );

  const toggle = (url: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onSelect(Array.from(picked));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[calc(100vw-1rem)] max-h-[85vh] flex flex-col p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="BookImage" size={20} />
            Выбрать из альбома поколений
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Icon name="Loader2" size={32} className="animate-spin text-purple-500" />
          </div>
        ) : allAssets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <Icon name="Images" size={40} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">В альбоме пока нет фотографий</p>
            <p className="text-xs text-gray-400 mt-1">Добавьте воспоминания в раздел «Память»</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-2">
              Выбрано: {picked.size} фото. Нажмите на фото чтобы выбрать или снять выбор.
            </p>
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {allAssets.map(({ url, title }, i) => {
                  const isSelected = picked.has(url);
                  return (
                    <button
                      key={url + i}
                      type="button"
                      onClick={() => toggle(url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 scale-[0.97] shadow-lg'
                          : 'border-transparent hover:border-purple-300'
                      }`}
                    >
                      <img
                        src={url}
                        alt={title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
                            <Icon name="Check" size={14} className="text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t mt-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                onClick={handleConfirm}
                disabled={picked.size === 0}
              >
                <Icon name="Check" size={16} className="mr-2" />
                Добавить {picked.size > 0 ? `(${picked.size})` : ''}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}