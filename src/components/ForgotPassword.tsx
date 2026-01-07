import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const AUTH_API = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function ForgotPassword({ onBack, onSuccess }: ForgotPasswordProps) {
  const [step, setStep] = useState<'phone' | 'code' | 'newPassword'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${AUTH_API}?action=forgot_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setStep('code');
        alert('📧 Код подтверждения отправлен на ваш телефон!');
      }
    } catch (err) {
      setError('Ошибка при отправке кода: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${AUTH_API}?action=verify_reset_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, code })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResetToken(data.reset_token);
        setStep('newPassword');
      }
    } catch (err) {
      setError('Ошибка при проверке кода: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${AUTH_API}?action=reset_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reset_token: resetToken,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        alert('✅ Пароль успешно изменён! Теперь войдите с новым паролем.');
        onSuccess();
      }
    } catch (err) {
      setError('Ошибка при сбросе пароля: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md border-2 border-purple-200">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Icon name="KeyRound" className="text-white" size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Восстановление пароля</CardTitle>
          <CardDescription className="text-center">
            {step === 'phone' && 'Введите номер телефона для получения кода'}
            {step === 'code' && 'Введите код из SMS'}
            {step === 'newPassword' && 'Придумайте новый пароль'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Шаг 1: Ввод телефона */}
          {step === 'phone' && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+79991234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icon name="Loader" className="mr-2 animate-spin" size={18} />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" className="mr-2" size={18} />
                    Отправить код
                  </>
                )}
              </Button>

              <Button type="button" variant="outline" className="w-full" onClick={onBack}>
                <Icon name="ArrowLeft" className="mr-2" size={18} />
                Назад ко входу
              </Button>
            </form>
          )}

          {/* Шаг 2: Ввод кода */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="flex items-center gap-2 font-medium mb-1">
                  <Icon name="Info" size={16} />
                  Код отправлен на {phone}
                </p>
                <p className="text-gray-600">Проверьте SMS с кодом подтверждения</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Код подтверждения</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Введите код из SMS"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icon name="Loader" className="mr-2 animate-spin" size={18} />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="Check" className="mr-2" size={18} />
                    Подтвердить код
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep('phone')}
              >
                Изменить номер
              </Button>
            </form>
          )}

          {/* Шаг 3: Новый пароль */}
          {step === 'newPassword' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                <p className="flex items-center gap-2 font-medium text-green-700">
                  <Icon name="CheckCircle" size={16} />
                  Код подтверждён!
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Минимум 6 символов"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Повторите пароль</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={20} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icon name="Loader" className="mr-2 animate-spin" size={18} />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" className="mr-2" size={18} />
                    Изменить пароль
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p className="flex items-center justify-center gap-1">
              <Icon name="Shield" size={14} />
              Ваши данные защищены
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}