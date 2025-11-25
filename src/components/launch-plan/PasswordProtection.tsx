import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface PasswordProtectionProps {
  correctPassword: string;
  onAuthenticated: () => void;
}

export function PasswordProtection({ correctPassword, onAuthenticated }: PasswordProtectionProps) {
  const navigate = useNavigate();
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === correctPassword) {
      onAuthenticated();
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-purple-300 shadow-2xl">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            <Icon name="Lock" size={32} className="text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            План запуска
          </CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Этот раздел защищён паролем
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="Введите пароль"
                className={`text-center text-lg ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-2 flex items-center justify-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  Неверный пароль
                </p>
              )}
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
              <Icon name="Unlock" className="mr-2" size={18} />
              Войти
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/')}
            >
              <Icon name="ArrowLeft" className="mr-2" size={16} />
              Вернуться на главную
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
