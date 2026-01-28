import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function DemoModeIndicator() {
  const navigate = useNavigate();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    const checkDemoMode = () => {
      const demoMode = localStorage.getItem('isDemoMode') === 'true';
      const startTime = parseInt(localStorage.getItem('demoStartTime') || '0');
      
      if (demoMode && startTime) {
        setIsDemoMode(true);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, 600 - elapsed);
        setTimeLeft(remaining);
      } else {
        setIsDemoMode(false);
      }
    };

    checkDemoMode();
    const interval = setInterval(checkDemoMode, 1000);
    return () => clearInterval(interval);
  }, []);

  const exitDemo = () => {
    localStorage.removeItem('isDemoMode');
    localStorage.removeItem('demoStartTime');
    setShowExitDialog(false);
    navigate('/welcome');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isDemoMode) return null;

  const isLowTime = timeLeft < 120; // меньше 2 минут

  return (
    <>
      <div className="fixed top-20 right-4 z-40 animate-fade-in">
        <div className={`bg-gradient-to-r ${
          isLowTime ? 'from-red-500 to-orange-500' : 'from-orange-500 to-amber-500'
        } text-white rounded-lg shadow-lg p-3 flex items-center gap-3`}>
          <div className="flex items-center gap-2">
            <Icon name="Sparkles" className="w-5 h-5" />
            <div>
              <div className="text-xs font-medium opacity-90">Песочница</div>
              <div className="text-lg font-bold">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              onClick={() => navigate('/login')}
              className="bg-white text-orange-600 hover:bg-gray-100 h-7 text-xs font-semibold"
            >
              <Icon name="UserPlus" size={14} className="mr-1" />
              Регистрация
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowExitDialog(true)}
              className="h-6 text-xs text-white hover:bg-white/20"
            >
              Выйти
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Выйти из песочницы?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы потеряете доступ к тестовым данным. Зарегистрируйтесь, чтобы создать 
              свою семью и сохранить данные навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={() => {
                navigate('/login');
                setShowExitDialog(false);
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500"
            >
              <Icon name="UserPlus" className="w-4 h-4 mr-2" />
              Зарегистрироваться
            </Button>
            <Button variant="ghost" onClick={exitDemo}>
              Просто выйти
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}