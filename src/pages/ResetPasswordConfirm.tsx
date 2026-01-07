import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AUTH_URL = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';

export default function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    code: searchParams.get('code') || '',
    email: searchParams.get('email') || '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.email || !formData.newPassword) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive'
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 6 символов',
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
          email: formData.email,
          reset_code: formData.code,
          new_password: formData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Пароль изменён! ✅',
          description: 'Теперь можете войти с новым паролем'
        });

        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Неверный код или email',
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
              <Icon name="Lock" size={40} className="text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Новый пароль
          </CardTitle>
          <p className="text-gray-600">
            Введите код из письма и новый пароль
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Icon name="Mail" className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="ваш@email.ru"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="code">Код из письма</Label>
              <div className="relative">
                <Icon name="Hash" className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="pl-10 text-center text-2xl tracking-widest"
                  maxLength={6}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">Новый пароль</Label>
              <div className="relative">
                <Icon name="Lock" className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Минимум 6 символов"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="pl-10 pr-10"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <div className="relative">
                <Icon name="Lock" className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10 pr-10"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={18} />
                </button>
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
                  Изменение...
                </>
              ) : (
                <>
                  <Icon name="Check" className="mr-2" size={18} />
                  Изменить пароль
                </>
              )}
            </Button>
          </form>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
              <div className="space-y-1 text-sm text-blue-800">
                <p className="font-semibold">Код действителен 15 минут</p>
                <p>Проверьте правильность email и кода из письма</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
