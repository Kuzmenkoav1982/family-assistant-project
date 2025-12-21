import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface LaunchPlanHeaderProps {
  isAuthenticated: boolean;
  passwordInput: string;
  passwordError: boolean;
  onPasswordInputChange: (value: string) => void;
  onPasswordSubmit: (e: React.FormEvent) => void;
  onNavigateBack: () => void;
}

export function LaunchPlanHeader({
  isAuthenticated,
  passwordInput,
  passwordError,
  onPasswordInputChange,
  onPasswordSubmit,
  onNavigateBack
}: LaunchPlanHeaderProps) {
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Icon name="Lock" size={32} className="text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">План Запуска</h1>
              <p className="text-gray-600">Введите пароль для доступа</p>
            </div>
            
            <form onSubmit={onPasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Введите пароль"
                  value={passwordInput}
                  onChange={(e) => onPasswordInputChange(e.target.value)}
                  className={passwordError ? 'border-red-500' : ''}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <Icon name="AlertCircle" size={14} />
                    Неверный пароль
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full">
                <Icon name="Unlock" size={16} className="mr-2" />
                Открыть
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
          <Icon name="Rocket" size={36} />
          План Запуска
        </h1>
        <p className="text-gray-600 mt-2">Полный план разработки и запуска Семейного Органайзера</p>
      </div>
      <Button onClick={onNavigateBack} variant="outline" className="gap-2">
        <Icon name="ArrowLeft" size={18} />
        Админка
      </Button>
    </div>
  );
}
