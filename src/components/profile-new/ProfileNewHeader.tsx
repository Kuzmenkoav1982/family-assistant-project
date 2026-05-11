import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ProfileNewHeaderProps {
  userName?: string;
  userEmail?: string;
  refreshing: boolean;
  onBack: () => void;
}

export default function ProfileNewHeader({ userName, userEmail, refreshing, onBack }: ProfileNewHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="rounded-full">
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Личный кабинет</h1>
          <p className="text-muted-foreground mt-1">
            {userName} • {userEmail}
          </p>
        </div>
      </div>

      {/* Индикатор обновления */}
      {refreshing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <Icon name="RefreshCw" size={16} className="animate-spin" />
          <span>Обновление данных...</span>
        </div>
      )}
    </div>
  );
}
