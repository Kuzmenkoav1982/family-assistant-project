import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  placeholderIcon?: string;
  folder?: string;
  label?: string;
}

const SIZES = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

export default function PetPhotoUpload({
  value,
  onChange,
  size = 'md',
  shape = 'circle',
  placeholderIcon = 'PawPrint',
  folder = 'pets',
  label = 'Загрузить фото',
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [tempSrc, setTempSrc] = useState<string>('');
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
      onChange(url);
      toast({ title: 'Фото загружено', description: 'Изображение успешно сохранено' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить фото';
      toast({ title: 'Ошибка загрузки', description: msg, variant: 'destructive' });
    }
  };

  const remove = () => onChange('');

  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${SIZES[size]} ${rounded} overflow-hidden bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 flex items-center justify-center shadow-md flex-shrink-0`}>
        {value ? (
          <img src={value} alt="Питомец" className="w-full h-full object-cover" />
        ) : (
          <Icon name={placeholderIcon} size={size === 'lg' ? 40 : size === 'md' ? 30 : 22} className="text-white" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Icon name="Loader2" size={24} className="text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Button type="button" size="sm" onClick={pickFile} disabled={uploading} className="bg-violet-600 hover:bg-violet-700">
          <Icon name={value ? 'RefreshCw' : 'Upload'} size={14} className="mr-1.5" />
          {value ? 'Заменить' : label}
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" onClick={remove} className="text-rose-500 hover:text-rose-600 h-7 text-xs">
            <Icon name="Trash2" size={12} className="mr-1" />
            Удалить фото
          </Button>
        )}
      </div>

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
