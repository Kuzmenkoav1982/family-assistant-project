import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BannerPositionerProps {
  imageSrc: string;
  onPositionChange: (objectPosition: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BannerPositioner({ imageSrc, onPositionChange, onConfirm, onCancel }: BannerPositionerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  // position in % (0-100)
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 50, posY: 50 });

  // Высота баннера на главной (в пикселях, ~224px = h-56)
  const PREVIEW_HEIGHT = 128;

  const onImgLoad = () => {
    const img = imgRef.current;
    if (img) setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
  };

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const startDrag = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { mouseX: clientX, mouseY: clientY, posX: pos.x, posY: pos.y };
  }, [pos]);

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = clientX - dragStart.current.mouseX;
    const dy = clientY - dragStart.current.mouseY;
    // Инвертируем направление — тянем изображение, а не viewport
    const newX = clamp(dragStart.current.posX - (dx / rect.width) * 100, 0, 100);
    const newY = clamp(dragStart.current.posY - (dy / rect.height) * 100, 0, 100);
    setPos({ x: newX, y: newY });
  }, [isDragging]);

  const endDrag = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(`${pos.x.toFixed(1)}% ${pos.y.toFixed(1)}%`);
    }
  }, [isDragging, pos, onPositionChange]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => endDrag();
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); };
    const onTouchEnd = () => endDrag();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [moveDrag, endDrag]);

  // Синхронизируем позицию с родителем при изменении
  useEffect(() => {
    onPositionChange(`${pos.x.toFixed(1)}% ${pos.y.toFixed(1)}%`);
  }, [pos]);

  const objectPosition = `${pos.x.toFixed(1)}% ${pos.y.toFixed(1)}%`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
        <Icon name="Move" size={16} />
        <span>Перетащите фото чтобы выбрать нужный ракурс</span>
      </div>

      {/* Превью — точно как на главной */}
      <div
        ref={containerRef}
        className={`relative w-full rounded-xl overflow-hidden border-2 border-orange-400 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ height: PREVIEW_HEIGHT }}
        onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
        onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
      >
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Banner preview"
          onLoad={onImgLoad}
          draggable={false}
          className="w-full h-full object-cover pointer-events-none"
          style={{ objectPosition }}
        />
        {/* Затемнение как на главной */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
        {/* Метка "Так будет выглядеть" */}
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-lg font-medium pointer-events-none">
          Так будет выглядеть
        </div>
        {/* Пример текста как на главной */}
        <div className="absolute bottom-3 left-4 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white/60" />
            <div>
              <div className="text-white font-bold text-sm drop-shadow">Наша Семья</div>
              <div className="text-white/80 text-xs drop-shadow">Главная страница</div>
            </div>
          </div>
        </div>
      </div>

      {imgSize.w > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Изображение {imgSize.w}×{imgSize.h}px · Позиция: {pos.x.toFixed(0)}% {pos.y.toFixed(0)}%
        </p>
      )}

      <div className="flex gap-2">
        <Button onClick={onConfirm} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
          <Icon name="Check" size={16} className="mr-2" />
          Применить
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <Icon name="X" size={16} className="mr-2" />
          Отмена
        </Button>
      </div>
    </div>
  );
}
