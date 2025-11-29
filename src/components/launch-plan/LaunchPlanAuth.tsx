import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface LaunchPlanAuthProps {
  correctPassword: string;
  onAuthenticate: () => void;
}

export function LaunchPlanAuth({ correctPassword, onAuthenticate }: LaunchPlanAuthProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === correctPassword) {
      onAuthenticate();
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Icon name="Lock" size={32} className="text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            План запуска проекта
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Введите пароль для доступа к плану
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Введите пароль"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={passwordError ? 'border-red-500' : ''}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">
                  Неверный пароль. Попробуйте снова.
                </p>
              )}
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
              <Icon name="Unlock" size={18} className="mr-2" />
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
