import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const RESET_URL = 'https://functions.poehali.dev/987c3159-5bd3-42fe-9bd1-0c31937d977e';

interface PasswordResetProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function PasswordReset({ onBack, onSuccess }: PasswordResetProps) {
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState('');
  const { toast } = useToast();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone && !email) {
      toast({
        title: 'Ошибка',
        description: 'Укажите телефон или email',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(RESET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          phone: phone || undefined,
          email: email || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить код',
          variant: 'destructive'
        });
        return;
      }

      setContact(data.contact);
      setStep('verify');
      
      toast({
        title: 'Код отправлен!',
        description: `Код восстановления отправлен на ${data.contact}`
      });
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

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast({
        title: 'Ошибка',
        description: 'Код должен содержать 6 цифр',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(RESET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          phone: phone || undefined,
          email: email || undefined,
          code
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Ошибка',
          description: data.error || 'Неверный код',
          variant: 'destructive'
        });
        return;
      }

      setStep('reset');
      toast({
        title: 'Код подтвержден',
        description: 'Теперь введите новый пароль'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось проверить код',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть минимум 6 символов',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(RESET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          phone: phone || undefined,
          email: email || undefined,
          code,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось изменить пароль',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Успешно!',
        description: 'Пароль изменен. Теперь войдите с новым паролем'
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить пароль',
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
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Icon name="KeyRound" size={32} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Восстановление пароля
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'request' && 'Укажите телефон или email для получения кода'}
            {step === 'verify' && `Введите код, отправленный на ${contact}`}
            {step === 'reset' && 'Введите новый пароль'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setEmail('');
                  }}
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">или</div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setPhone('');
                  }}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || (!phone && !email)}>
                {loading ? (
                  <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                ) : (
                  <Icon name="Send" size={20} className="mr-2" />
                )}
                Отправить код
              </Button>

              <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
                <Icon name="ArrowLeft" size={20} className="mr-2" />
                Назад к входу
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Код подтверждения</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Код действителен 15 минут
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? (
                  <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                ) : (
                  <Icon name="Check" size={20} className="mr-2" />
                )}
                Подтвердить код
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setStep('request')}
              >
                <Icon name="ArrowLeft" size={20} className="mr-2" />
                Отправить код заново
              </Button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                ) : (
                  <Icon name="Save" size={20} className="mr-2" />
                )}
                Изменить пароль
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
