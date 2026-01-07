import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ForgotPasswordModal from './ForgotPasswordModal';

const AUTH_URL = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';

interface AuthPageProps {
  onSuccess: (token: string, userData: any) => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        action: isLogin ? 'login' : 'register',
        phone,
        password
      };

      if (!isLogin) {
        if (inviteCode) {
          payload.invite_code = inviteCode;
          payload.member_name = memberName || undefined;
        } else {
          // Всегда добавляем "Наша семья" в начало
          const fullFamilyName = familyName 
            ? `Наша семья "${familyName}"`
            : 'Наша семья';
          payload.family_name = fullFamilyName;
          payload.member_name = memberName || undefined;
        }
      }

      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Ошибка',
          description: data.error || 'Что-то пошло не так',
          variant: 'destructive'
        });
        return;
      }

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));

      toast({
        title: 'Успешно!',
        description: isLogin ? 'Вы вошли в систему' : 'Регистрация завершена'
      });

      onSuccess(data.token, data.user);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Icon name="Users" size={32} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {isLogin ? 'Вход' : 'Регистрация'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? 'Войдите в свой семейный аккаунт' 
              : 'Создайте семейный аккаунт'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Код приглашения (опционально)</Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    placeholder="Введите код, если вас пригласили"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  />
                </div>

                {!inviteCode && (
                  <div className="space-y-2">
                    <Label htmlFor="familyName">Название вашей семьи (опционально)</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 whitespace-nowrap">Наша семья</span>
                      <Input
                        id="familyName"
                        type="text"
                        placeholder='"Ивановы"'
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Отображается: <strong>Наша семья{familyName ? ` "${familyName}"` : ''}</strong>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="memberName">Ваше имя (опционально)</Label>
                  <Input
                    id="memberName"
                    type="text"
                    placeholder="Как вас называть?"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Icon name="Loader2" size={20} className="animate-spin mr-2" />
              ) : (
                <Icon name={isLogin ? 'LogIn' : 'UserPlus'} size={20} className="mr-2" />
              )}
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </Button>

            {isLogin && (
              <Button 
                type="button" 
                variant="link" 
                className="w-full text-sm text-blue-600 hover:text-blue-700"
                onClick={() => setShowForgotPassword(true)}
              >
                Забыли пароль?
              </Button>
            )}

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setInviteCode('');
                  setFamilyName('');
                  setMemberName('');
                }}
                className="text-blue-600 hover:underline"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
}