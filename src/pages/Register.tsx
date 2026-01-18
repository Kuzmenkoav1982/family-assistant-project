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
    confirmPassword: '',
    acceptedPolicy: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!formData.acceptedPolicy) {
      toast({
        title: 'Требуется согласие',
        description: 'Необходимо принять политику конфиденциальности',
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
        
        // Show appropriate welcome message based on context
        if (inviteCode) {
          // Registration with invite code - don't show success message yet
          // Success will be shown on /join page after actual joining
          toast({
            title: 'Регистрация успешна',
            description: 'Завершите присоединение к семье',
            duration: 2000
          });
        } else {
          // Regular registration - family was created
          toast({
            title: 'Добро пожаловать! 🎉',
            description: 'Регистрация успешна! Ваша семья создана.',
            duration: 3000
          });
        }

        // Redirect based on context
        if (redirectUrl) {
          setTimeout(() => window.location.href = redirectUrl, 1000);
        } else if (inviteCode) {
          // If registered with invite code, redirect to join page
          setTimeout(() => window.location.href = `/join?code=${inviteCode}`, 1000);
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

            <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <input
                type="checkbox"
                id="acceptPolicy"
                checked={formData.acceptedPolicy}
                onChange={(e) => setFormData({ ...formData, acceptedPolicy: e.target.checked })}
                className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                disabled={loading}
                required
              />
              <label htmlFor="acceptPolicy" className="text-sm text-gray-700">
                Я прочитал(а) и принимаю{' '}
                <Link to="/privacy-policy" target="_blank" className="text-purple-600 hover:underline font-medium">
                  политику конфиденциальности
                </Link>
                {' '}и{' '}
                <Link to="/terms-of-service" target="_blank" className="text-purple-600 hover:underline font-medium">
                  условия использования
                </Link>
              </label>
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
                  Регистрация заблокирована. Попробуйте через {rateLimitInfo.resetAt ? 
                    Math.ceil((new Date(rateLimitInfo.resetAt).getTime() - Date.now()) / 60000) : 15} минут
                </span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || rateLimitInfo?.blocked || !formData.acceptedPolicy}
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