import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AUTH_URL = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Ошибка',
        description: 'Введите email',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reset_password',
          email: email
        })
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        toast({
          title: 'Письмо отправлено! 📧',
          description: 'Проверьте email для восстановления пароля'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить письмо',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка сети',
        description: 'Не удалось связаться с сервером',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="max-w-md w-full shadow-2xl border-2 border-purple-200">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
              <Icon name="KeyRound" size={40} className="text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Восстановление пароля
          </CardTitle>
          <p className="text-gray-600">
            {emailSent 
              ? 'Письмо с инструкцией отправлено на ваш email'
              : 'Введите email для восстановления доступа'
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4 pb-8">
          {!emailSent ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Icon name="Mail" className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ваш@email.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" className="animate-spin mr-2" size={18} />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" className="mr-2" size={18} />
                    Отправить инструкцию
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" size={20} className="text-green-600 mt-0.5" />
                  <div className="space-y-1 text-sm text-green-800">
                    <p className="font-semibold">Письмо отправлено!</p>
                    <p>Проверьте email и введите код из письма</p>
                    <p className="text-xs text-green-600 mt-2">
                      Не пришло письмо? Проверьте папку "Спам"
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => navigate(`/reset-password/confirm?email=${encodeURIComponent(email)}`)}
                className="w-full"
              >
                <Icon name="ArrowRight" className="mr-2" size={18} />
                Ввести код из письма
              </Button>

              <Button 
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                <Icon name="RotateCcw" className="mr-2" size={18} />
                Отправить повторно
              </Button>
            </div>
          )}

          <div className="text-center text-sm pt-4">
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center gap-1">
              <Icon name="ArrowLeft" size={14} />
              Вернуться к входу
            </Link>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
              <div className="space-y-1 text-sm text-blue-800">
                <p className="font-semibold">Не можете восстановить доступ?</p>
                <p>Свяжитесь с поддержкой: support@nasha-semya.ru</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}