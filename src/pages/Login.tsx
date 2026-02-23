import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';

const AUTH_URL = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';
const RATE_LIMITER_URL = 'https://functions.poehali.dev/23dfd616-ea1a-480a-8c72-4702c42ac121';
const FRONTEND_URL = window.location.origin;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    blocked: boolean;
    resetAt: string | null;
  } | null>(null);

  // Если уже авторизован, редирект на главную
  useEffect(() => {
    const existingToken = storage.getItem('authToken');
    if (existingToken && !searchParams.get('token')) {
      window.location.href = '/';
      return;
    }
  }, [searchParams]);

  // Обработка OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      alert(`Ошибка авторизации: ${error}`);
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        storage.setItem('authToken', token);
        storage.setItem('userData', JSON.stringify(user));
        
        // Небольшая задержка, чтобы storage точно успел записаться
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } catch (e) {
        console.error('Ошибка парсинга user:', e);
        alert(`Ошибка обработки данных: ${e}`);
      }
    }
  }, [searchParams, navigate]);

  const checkRateLimit = async () => {
    try {
      const response = await fetch(RATE_LIMITER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action_type: 'auth',
          log_attempt: false
        })
      });

      const data = await response.json();
      
      setRateLimitInfo({
        remaining: data.remaining || 0,
        blocked: !data.allowed,
        resetAt: data.reset_at || null
      });

      return data.allowed;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true;
    }
  };

  useEffect(() => {
    checkRateLimit();
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    const isAllowed = await checkRateLimit();
    
    if (!isAllowed) {
      const resetDate = rateLimitInfo?.resetAt ? new Date(rateLimitInfo.resetAt) : null;
      const minutesLeft = resetDate ? Math.ceil((resetDate.getTime() - Date.now()) / 60000) : 15;
      
      toast({
        title: '🔒 Слишком много попыток',
        description: `Попробуйте снова через ${minutesLeft} минут`,
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
          action: 'login',
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success && data.token) {
        storage.setItem('authToken', data.token);
        storage.setItem('userData', JSON.stringify(data.user));
        
        toast({
          title: 'Добро пожаловать! 👋',
          description: 'Вход выполнен успешно'
        });

        setTimeout(() => {
          window.location.replace('/');
        }, 500);
      } else {
        await checkRateLimit();
        
        toast({
          title: 'Неверный email или пароль',
          description: 'Проверьте правильность введенных данных и попробуйте снова',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: 'Ошибка подключения',
        description: 'Проверьте интернет-соединение и попробуйте снова',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleYandexLogin = () => {
    const callbackUrl = `${AUTH_URL}?oauth=yandex_callback`;
    
    const loginUrl = `${AUTH_URL}?oauth=yandex&callback_url=${encodeURIComponent(callbackUrl)}&frontend_url=${encodeURIComponent(FRONTEND_URL + '/login')}`;
    
    // Проверяем, находимся ли мы внутри iframe (preview-режим poehali.dev)
    if (window.top !== window.self) {
      // Открываем в родительском окне (выходим из iframe)
      window.top!.location.href = loginUrl;
    } else {
      // Обычный редирект для прямого доступа
      window.location.href = loginUrl;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="max-w-md w-full shadow-2xl border-2 border-purple-200">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <img 
              src="https://cdn.poehali.dev/files/Логотип Наша Семья.JPG" 
              alt="Наша семья"
              className="w-32 h-32 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Наша семья
          </CardTitle>
          <p className="text-gray-600">
            Войдите, чтобы управлять семейными делами
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4 pb-8">
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
                <Link 
                  to="/reset-password" 
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Забыли пароль?
                </Link>
              </div>
              <div className="relative">
                <Icon name="Lock" className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  disabled={loading}
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

            {rateLimitInfo && !rateLimitInfo.blocked && rateLimitInfo.remaining <= 2 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                <Icon name="AlertTriangle" size={16} />
                <span>
                  Осталось попыток: <strong>{rateLimitInfo.remaining}</strong>
                </span>
              </div>
            )}

            {rateLimitInfo?.blocked && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <Icon name="Lock" size={16} />
                <span>
                  Вход заблокирован. Попробуйте через {rateLimitInfo.resetAt ? 
                    Math.ceil((new Date(rateLimitInfo.resetAt).getTime() - Date.now()) / 60000) : 15} минут
                </span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || rateLimitInfo?.blocked}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" className="animate-spin mr-2" size={18} />
                  Вход...
                </>
              ) : rateLimitInfo?.blocked ? (
                <>
                  <Icon name="Lock" className="mr-2" size={18} />
                  Заблокировано
                </>
              ) : (
                <>
                  <Icon name="LogIn" className="mr-2" size={18} />
                  Войти
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Или</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleYandexLogin}
              variant="outline"
              className="w-full h-12 border-2"
              type="button"
            >
              <Icon name="LogIn" className="mr-2" size={20} />
              Войти через Яндекс ID
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Нет аккаунта? </span>
            <Link to="/register" className="text-purple-600 hover:text-purple-700 font-semibold">
              Зарегистрироваться
            </Link>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4">
            <p>
              Нажимая кнопку, вы соглашаетесь с{' '}
              <a href="/terms-of-service" className="text-purple-600 hover:underline">
                условиями использования
              </a>
            </p>
          </div>


        </CardContent>
      </Card>
    </div>
  );
}