import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImageBase64: string) => void;
}

export function ImageCropDialog({ open, onOpenChange, imageSrc, onCropComplete }: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [scale, setScale] = useState(1);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Устанавливаем размер canvas как квадрат
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Рисуем круглую маску
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.clip();

    // Рисуем изображение
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      size,
      size
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  }, [completedCrop]);

  const handleSave = () => {
    const croppedImage = getCroppedImg();
    if (croppedImage) {
      onCropComplete(croppedImage);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Crop" size={24} />
            Кадрирование логотипа
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative" style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop"
                  style={{ maxHeight: '400px', maxWidth: '100%' }}
                />
              </ReactCrop>
            </div>

            <div className="w-full max-w-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Масштаб</span>
                <span className="text-sm text-muted-foreground">{Math.round(scale * 100)}%</span>
              </div>
              <div className="flex items-center gap-4">
                <Icon name="ZoomOut" size={18} className="text-muted-foreground" />
                <Slider
                  value={[scale]}
                  onValueChange={(value) => setScale(value[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="flex-1"
                />
                <Icon name="ZoomIn" size={18} className="text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              <Icon name="Check" size={16} className="mr-2" />
              Применить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
