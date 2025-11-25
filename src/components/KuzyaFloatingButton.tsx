import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import KuzyaHelperDialog from '@/components/KuzyaHelperDialog';

const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
};

export default function KuzyaFloatingButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [showPhrase, setShowPhrase] = useState(false);
  const [mobile] = useState(isMobile());

  const phrases = [
    '👋 Привет! Нужна помощь?',
    '✨ Я здесь, если что!',
    '🎯 Чем могу помочь?',
    '💡 Есть вопросы?',
    '🌟 Давай поболтаем!',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!showDialog && Math.random() > 0.7) {
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setPhrase(randomPhrase);
        setShowPhrase(true);
        
        setTimeout(() => {
          setShowPhrase(false);
        }, 4000);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [showDialog]);

  if (mobile) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
        {showPhrase && (
          <div className="bg-white rounded-2xl shadow-lg px-4 py-3 animate-in slide-in-from-right-5 fade-in duration-300 max-w-[200px]">
            <p className="text-sm font-medium text-gray-800">{phrase}</p>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white rotate-45 shadow-lg" />
          </div>
        )}
        
        <Button
          onClick={() => setShowDialog(true)}
          className="relative w-28 h-28 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:scale-110 p-0 overflow-hidden group border-4 border-white"
          title="Кузя - ваш помощник"
        >
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
          
          <img 
            src="https://cdn.poehali.dev/files/4d510211-47b5-4233-b503-3bd902bba10a.png"
            alt="Кузя"
            className="w-20 h-20 object-contain relative z-10"
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