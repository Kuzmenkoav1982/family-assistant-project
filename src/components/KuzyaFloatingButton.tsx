import { useState, useEffect, useRef } from 'react';
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
    e.preventDefault();
    e.stopPropagation();
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    longPressTimer.current = window.setTimeout(() => {
      setIsDragging(true);
    }, 500);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();

    const deltaX = dragStartPos.current.x - e.clientX;
    const deltaY = e.clientY - dragStartPos.current.y;

    const newBottom = Math.max(20, Math.min(window.innerHeight - 140, position.bottom + deltaY));
    const newRight = Math.max(20, Math.min(window.innerWidth - 140, position.right + deltaX));
    
    const newPos = { bottom: newBottom, right: newRight };
    setPosition(newPos);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newPos));

    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (isDragging) {
      setIsDragging(false);
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
        className="fixed z-50 flex items-end gap-3 transition-none select-none"
        style={{
          bottom: `${position.bottom}px`,
          right: `${position.right}px`,
          cursor: isDragging ? 'grabbing' : 'pointer',
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {showPhrase && !isDragging && (
          <div className="bg-white rounded-2xl shadow-lg px-4 py-3 animate-in slide-in-from-right-5 fade-in duration-300 max-w-[200px] pointer-events-none">
            <p className="text-sm font-medium text-gray-800">{phrase}</p>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white rotate-45 shadow-lg" />
          </div>
        )}
        
        <div
          className={`relative w-20 h-24 rounded-2xl shadow-2xl transition-all duration-200 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 overflow-hidden border-4 border-white ${
            isDragging ? 'scale-105' : ''
          }`}
          title="Кузя - ваш помощник (удерживайте чтобы перемещать)"
          style={{
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
        >
          <div className="absolute inset-0 bg-white/10 transition-colors" />
          
          <img 
            src="https://cdn.poehali.dev/files/4d510211-47b5-4233-b503-3bd902bba10a.png"
            alt="Кузя"
            className="w-full h-full object-cover relative z-10 pointer-events-none select-none"
            draggable="false"
            style={{
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              objectPosition: 'center'
            }}
          />
          
          <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </div>
      </div>

      <KuzyaHelperDialog 
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}