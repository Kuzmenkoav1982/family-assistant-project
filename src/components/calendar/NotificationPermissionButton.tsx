import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { NotificationService } from '@/services/notificationService';

export function NotificationPermissionButton() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    setHasPermission(NotificationService.hasPermission());
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    const granted = await NotificationService.requestPermission();
    setHasPermission(granted);
    setIsRequesting(false);
    
    if (granted) {
      NotificationService.showNotification(
        'Уведомления включены! 🔔',
        'Теперь вы будете получать напоминания о событиях'
      );
    }
  };

  if (hasPermission) {
    return (
      <Badge variant="secondary" className="flex items-center gap-2">
        <Icon name="Bell" size={14} />
        Уведомления включены
      </Badge>
    );
  }

  return (
    <Button
      onClick={handleRequestPermission}
      disabled={isRequesting}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Icon name="BellOff" size={16} />
      {isRequesting ? 'Запрашиваем...' : 'Включить уведомления'}
    </Button>
  );
}
