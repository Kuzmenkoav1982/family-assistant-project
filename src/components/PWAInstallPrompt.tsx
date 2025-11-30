import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const lastDismissed = localStorage.getItem('pwa-install-dismissed');
      const daysSinceDismissed = lastDismissed 
        ? (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)
        : 999;
      
      if (daysSinceDismissed > 7) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md animate-in slide-in-from-bottom">
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-2xl">
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl flex items-center justify-center">
              <img 
                src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/af75848c-cafe-48ea-887e-ede248ec2817.jpg" 
                alt="App Icon"
                className="w-12 h-12 rounded-lg"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1">Установите приложение</h3>
              <p className="text-sm text-white/90 mb-3">
                Получите быстрый доступ с домашнего экрана и работайте офлайн
              </p>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleInstall}
                  className="bg-white text-blue-600 hover:bg-white/90 flex-1"
                  size="sm"
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Установить
                </Button>
                <Button 
                  onClick={handleDismiss}
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  size="sm"
                >
                  Позже
                </Button>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
