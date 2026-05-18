import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export function AppUpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onUpdate = () => setShow(true);
    window.addEventListener('app-update-available', onUpdate);
    return () => window.removeEventListener('app-update-available', onUpdate);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-top">
      <div className="bg-background border border-border rounded-xl shadow-lg p-4 flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name="RefreshCw" size={16} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">Доступна новая версия</p>
          <p className="text-xs text-muted-foreground mt-0.5">Обновите страницу, чтобы получить последние изменения</p>
        </div>
        <div className="flex-shrink-0 flex gap-2">
          <Button size="sm" onClick={handleRefresh} className="h-7 text-xs px-3">
            Обновить
          </Button>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Закрыть"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
