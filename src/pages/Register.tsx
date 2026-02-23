import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { sendMetrikaGoal, METRIKA_GOALS } from '@/utils/metrika';

const AUTH_API = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';
const RATE_LIMITER_URL = 'https://functions.poehali.dev/23dfd616-ea1a-480a-8c72-4702c42ac121';
const FRONTEND_URL = window.location.origin;

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const inviteCode = searchParams.get('code');
  const redirectUrl = searchParams.get('redirect');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleOAuthRedirect = (url: string) => {
    if (window.top !== window.self) {
      window.top!.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  const handleVKLogin = () => {
    const loginUrl = `${AUTH_API}?oauth=vk&frontend_url=${encodeURIComponent(FRONTEND_URL + '/login')}`;
    handleOAuthRedirect(loginUrl);
  };

  const handleYandexLogin = () => {
    const callbackUrl = `${AUTH_API}?oauth=yandex_callback`;
    const loginUrl = `${AUTH_API}?oauth=yandex&callback_url=${encodeURIComponent(callbackUrl)}&frontend_url=${encodeURIComponent(FRONTEND_URL + '/login')}`;
    handleOAuthRedirect(loginUrl);
  };

  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    blocked: boolean;
    resetAt: string | null;
  } | null>(null);

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

    if (formData.password.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 6 символов',
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
      const response = await fetch(AUTH_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'register',
          email: formData.email,
          password: formData.password,
          name: formData.name,
          invite_code: inviteCode,
          member_name: inviteCode ? formData.name : undefined,
          relationship: inviteCode ? 'Член семьи' : undefined
        })
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Отправка события в Яндекс.Метрику
        sendMetrikaGoal(METRIKA_GOALS.REGISTRATION, {
          email: formData.email,
          name: formData.name
        });
        
        // Show success message only for regular registration
        if (!inviteCode) {
          toast({
            title: 'Добро пожаловать! 🎉',
            description: 'Регистрация успешна! Ваша семья создана.',
            duration: 3000
          });
        }

        // Redirect based on context
        if (redirectUrl) {
          setTimeout(() => window.location.href = redirectUrl, inviteCode ? 0 : 1000);
        } else if (inviteCode) {
          // If registered with invite code, redirect immediately to join page
          window.location.href = `/join?code=${inviteCode}`;
        } else {
          // New user without invite - show onboarding
          setTimeout(() => window.location.href = '/onboarding', 1000);
        }
      } else {
        await checkRateLimit();
        
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Минимум 6 символов"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            <p className="text-xs text-gray-400 text-center">
              Нажимая «Зарегистрироваться», вы принимаете{' '}
              <Link to="/privacy-policy" target="_blank" className="text-purple-600 hover:underline">
                политику конфиденциальности
              </Link>
              {' '}и{' '}
              <Link to="/terms-of-service" target="_blank" className="text-purple-600 hover:underline">
                условия использования
              </Link>
            </p>

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
                  Регистрация заблокирована. Попробуйте через {rateLimitInfo.resetAt ? 
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
                  Регистрация...
                </>
              ) : rateLimitInfo?.blocked ? (
                <>
                  <Icon name="Lock" className="mr-2" size={18} />
                  Заблокировано
                </>
              ) : (
                <>
                  <Icon name="UserPlus" className="mr-2" size={18} />
                  Зарегистрироваться
                </>
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">или</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleVKLogin}
              variant="outline"
              className="w-full h-12 border-2 hover:bg-blue-50 hover:border-blue-300"
              type="button"
            >
              <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="#0077FF">
                <path d="M21.547 7h-3.29a.743.743 0 0 0-.655.392s-1.312 2.416-1.734 3.23C14.734 12.813 14 12.126 14 11.11V7.603A1.104 1.104 0 0 0 12.896 6.5h-2.474a1.982 1.982 0 0 0-1.75.813s1.255-.204 1.255 1.49c0 .42.022 1.626.04 2.64a.73.73 0 0 1-1.272.503 21.54 21.54 0 0 1-2.498-4.543.693.693 0 0 0-.63-.403h-2.99a.508.508 0 0 0-.48.685C3.005 10.175 6.918 18 11.38 18h1.878a.742.742 0 0 0 .742-.742v-1.135a.73.73 0 0 1 1.23-.53l2.247 2.112a1.09 1.09 0 0 0 .746.295h2.953c1.424 0 1.424-.988.647-1.753-.546-.538-2.518-2.617-2.518-2.617a1.02 1.02 0 0 1-.078-1.323c.637-.84 1.68-2.212 2.122-2.8.603-.804 1.697-2.507.197-2.507z"/>
              </svg>
              Войти через VK ID
            </Button>
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


        </CardContent>
      </Card>
    </div>
  );
}