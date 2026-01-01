import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AUTH_API = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 6 символов',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(AUTH_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'register',
          email: formData.email,
          password: formData.password,
          name: formData.name
        })
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        toast({
          title: 'Добро пожаловать! 🎉',
          description: 'Регистрация успешна! Ваша семья создана.'
        });

        setTimeout(() => window.location.href = '/', 500);
      } else {
        toast({
          title: 'Ошибка регистрации',
          description: data.error || 'Не удалось создать аккаунт',
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://cdn.poehali.dev/files/Логотип Наша Семья.JPG" 
              alt="Наша семья"
              className="h-16 w-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>
            Создайте аккаунт и начните управлять семейными делами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Имя</Label>
              <div className="relative">
                <Icon name="User" className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="name"
                  type="text"
                  placeholder="Ваше имя"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  disabled={loading}
                  required
                />
              </div>
            </div>

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
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Icon name="Lock" className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <div className="relative">
                <Icon name="Lock" className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10"
                  disabled={loading}
                  required
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
                  Регистрация...
                </>
              ) : (
                <>
                  <Icon name="UserPlus" className="mr-2" size={18} />
                  Зарегистрироваться
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                Войти
              </Link>
            </p>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Icon name="Home" className="mr-2" size={18} />
              На главную
            </Button>
          </div>

          <div className="mt-4 text-xs text-center text-gray-500">
            <p>
              Регистрируясь, вы соглашаетесь с{' '}
              <Link to="/terms-of-service" className="text-purple-600 hover:underline">
                условиями использования
              </Link>
              {' '}и{' '}
              <Link to="/privacy-policy" className="text-purple-600 hover:underline">
                политикой конфиденциальности
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
