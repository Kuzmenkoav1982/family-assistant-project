import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface Props {
  value?: string;
  onApply: (url: string) => void;
  species?: string;
  folder?: string;
}

function speciesEmoji(s?: string): string {
  const map: Record<string, string> = {
    'Собака': '🐕', 'Кошка': '🐈', 'Птица': '🦜', 'Грызун': '🐹',
    'Рыбка': '🐠', 'Рептилия': '🦎', 'Другое': '🐾',
  };
  return map[s || ''] || '🐾';
}

export default function PetPhotoUpload({ value, onApply, species, folder = 'pets' }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [tempSrc, setTempSrc] = useState('');
  const [pendingUrl, setPendingUrl] = useState(value || '');
  const { upload, uploading } = useFileUpload();
  const { toast } = useToast();

  const pickFile = () => fileRef.current?.click();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Ошибка', description: 'Выберите изображение', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Файл слишком большой', description: 'Максимальный размер — 5 МБ', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setTempSrc(reader.result as string);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onCropDone = async (base64: string) => {
    try {
      const blob = await fetch(base64).then(r => r.blob());
      const file = new File([blob], `pet-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const url = await upload(file, folder);
      setPendingUrl(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить фото';
      toast({ title: 'Ошибка загрузки', description: msg, variant: 'destructive' });
    }
  };

  const handleApply = () => {
    onApply(pendingUrl);
    toast({ title: 'Фото применено' });
  };

  const handleDelete = () => {
    setPendingUrl('');
    onApply('');
  };

  return (
    <div className="border-2 border-dashed border-violet-200 rounded-xl bg-violet-50/50 p-4 flex flex-col items-center gap-3">
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 flex items-center justify-center shadow-md ring-4 ring-violet-300/50">
        {pendingUrl ? (
          <img src={pendingUrl} alt="Питомец" className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{speciesEmoji(species)}</span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Icon name="Loader2" size={28} className="text-white animate-spin" />
          </div>
        )}
      </div>

      {pendingUrl ? (
        <>
          <Button type="button" onClick={handleApply} disabled={uploading} className="w-full bg-green-600 hover:bg-green-700 text-white">
            <Icon name="Check" size={16} className="mr-2" />
            Применить фото
          </Button>
          <Button type="button" variant="outline" onClick={pickFile} disabled={uploading} className="w-full">
            <Icon name="Upload" size={16} className="mr-2" />
            Изменить
          </Button>
          <Button type="button" variant="outline" onClick={handleDelete} disabled={uploading} className="w-full text-rose-500 hover:text-rose-600 border-rose-200 hover:border-rose-300">
            <Icon name="Trash2" size={16} className="mr-2" />
            Удалить
          </Button>
        </>
      ) : (
        <Button type="button" variant="outline" onClick={pickFile} disabled={uploading} className="w-full border-violet-300 text-violet-700 hover:bg-violet-50">
          <Icon name="Camera" size={16} className="mr-2" />
          Выбрать фото
        </Button>
      )}

      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

      <ImageCropDialog
        open={cropOpen}
        onOpenChange={setCropOpen}
        imageSrc={tempSrc}
        onCropComplete={onCropDone}
      />
    </div>
  );
}
