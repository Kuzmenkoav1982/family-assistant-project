import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import PasswordReset from './PasswordReset';

const AUTH_URL = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';

interface AuthPageProps {
  onSuccess: (token: string, userData: any) => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (showPasswordReset) {
    return (
      <PasswordReset
        onBack={() => setShowPasswordReset(false)}
        onSuccess={() => {
          setShowPasswordReset(false);
          toast({
            title: 'Пароль изменен',
            description: 'Войдите с новым паролем'
          });
        }}
      />
    );
  }

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
          payload.family_name = familyName || undefined;
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
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
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
                    <Label htmlFor="familyName">Название семьи (опционально)</Label>
                    <Input
                      id="familyName"
                      type="text"
                      placeholder="Например: Семья Ивановых"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                    />
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
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="text-sm text-orange-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Icon name="KeyRound" size={14} />
                  Забыли пароль?
                </button>
              </div>
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
    </div>
  );
}