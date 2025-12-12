import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import KuzyaHelperDialog from '@/components/KuzyaHelperDialog';

const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
};

const STORAGE_KEY = 'kuzyaPosition';

export default function KuzyaFloatingButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [showPhrase, setShowPhrase] = useState(false);
  const [mobile] = useState(isMobile());
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { bottom: 96, right: 24 };
  });
  
  const dragStartPos = useRef({ x: 0, y: 0 });
  const longPressTimer = useRef<number | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const phrases = [
    '👋 Привет! Нужна помощь?',
    '✨ Я здесь, если что!',
    '🎯 Чем могу помочь?',
    '💡 Есть вопросы?',
    '🌟 Давай поболтаем!',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!showDialog && !isDragging && Math.random() > 0.7) {
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setPhrase(randomPhrase);
        setShowPhrase(true);
        
        setTimeout(() => {
          setShowPhrase(false);
        }, 4000);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [showDialog, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    longPressTimer.current = window.setTimeout(() => {
      setIsDragging(true);
      if (buttonRef.current) {
        buttonRef.current.style.cursor = 'grabbing';
      }
    }, 500);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = dragStartPos.current.x - e.clientX;
    const deltaY = e.clientY - dragStartPos.current.y;

    setPosition(prev => {
      const newBottom = Math.max(20, Math.min(window.innerHeight - 140, prev.bottom + deltaY));
      const newRight = Math.max(20, Math.min(window.innerWidth - 140, prev.right + deltaX));
      
      const newPos = { bottom: newBottom, right: newRight };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newPos));
      
      return newPos;
    });

    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (isDragging) {
      setIsDragging(false);
      if (buttonRef.current) {
        buttonRef.current.style.cursor = 'pointer';
      }
    } else {
      setShowDialog(true);
    }
  };

  if (mobile) {
    return null;
  }

  return (
    <>
      <div 
        ref={buttonRef}
        className="fixed z-50 flex items-end gap-3 transition-none"
        style={{
          bottom: `${position.bottom}px`,
          right: `${position.right}px`,
          cursor: isDragging ? 'grabbing' : 'pointer',
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {showPhrase && !isDragging && (
          <div className="bg-white rounded-2xl shadow-lg px-4 py-3 animate-in slide-in-from-right-5 fade-in duration-300 max-w-[200px]">
            <p className="text-sm font-medium text-gray-800">{phrase}</p>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white rotate-45 shadow-lg" />
          </div>
        )}
        
        <Button
          className={`relative w-28 h-28 rounded-full shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0 overflow-hidden group border-4 border-white ${
            isDragging ? 'scale-110 shadow-3xl' : 'hover:scale-110 hover:shadow-3xl'
          }`}
          title="Кузя - ваш помощник (удерживайте чтобы перемещать)"
          onPointerDown={(e) => e.preventDefault()}
        >
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
          
          <img 
            src="https://cdn.poehali.dev/files/4d510211-47b5-4233-b503-3bd902bba10a.png"
            alt="Кузя"
            className="w-20 h-20 object-contain relative z-10 pointer-events-none"
          />
          
          <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </Button>
      </div>

      <KuzyaHelperDialog 
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}