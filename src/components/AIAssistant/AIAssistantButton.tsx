import { useState, useEffect } from 'react';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { useLocation } from 'react-router-dom';

interface AIAssistantButtonProps {
  onClick: () => void;
  hasNewMessages?: boolean;
}

export const AIAssistantButton = ({ onClick, hasNewMessages }: AIAssistantButtonProps) => {
  const location = useLocation();
  const { assistantType, assistantName } = useAIAssistant();
  const isWelcomePage = location.pathname === '/welcome';

  const [buttonPosition, setButtonPosition] = useState(() => {
    const saved = localStorage.getItem('buttonPosition');
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 80, y: window.innerHeight - 180 };
  });
  const [isButtonDragging, setIsButtonDragging] = useState(false);
  const [buttonDragStart, setButtonDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDownButton = (e: React.MouseEvent) => {
    if (window.innerWidth >= 768) return;
    setIsButtonDragging(true);
    setButtonDragStart({
      x: e.clientX - buttonPosition.x,
      y: e.clientY - buttonPosition.y
    });
  };

  const handleMouseMoveButton = (e: MouseEvent) => {
    if (!isButtonDragging) return;
    const newX = e.clientX - buttonDragStart.x;
    const newY = e.clientY - buttonDragStart.y;
    const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 70));
    const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 70));
    setButtonPosition({ x: boundedX, y: boundedY });
  };

  const handleMouseUpButton = () => {
    if (isButtonDragging) {
      setIsButtonDragging(false);
      localStorage.setItem('buttonPosition', JSON.stringify(buttonPosition));
    }
  };

  useEffect(() => {
    if (isButtonDragging) {
      document.addEventListener('mousemove', handleMouseMoveButton);
      document.addEventListener('mouseup', handleMouseUpButton);
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveButton);
        document.removeEventListener('mouseup', handleMouseUpButton);
      };
    }
  }, [isButtonDragging, buttonDragStart]);

  if (isWelcomePage) return null;

  const displayName = assistantName || (assistantType === 'domovoy' ? 'Кузя' : 'AI');
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <button
      onClick={onClick}
      onMouseDown={handleMouseDownButton}
      style={{
        position: 'fixed',
        left: `${buttonPosition.x}px`,
        top: `${buttonPosition.y}px`,
        zIndex: 9998,
      }}
      className="md:hidden w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl flex items-center justify-center text-xl font-bold hover:scale-110 transition-all duration-200 active:scale-95 touch-none"
      aria-label="Открыть AI-помощника"
    >
      {hasNewMessages && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white" />
      )}
      {firstLetter}
    </button>
  );
};
