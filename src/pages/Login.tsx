import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const AUTH_URL = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';
const FRONTEND_URL = window.location.origin;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      } catch (e) {
        console.error('Ошибка парсинга user:', e);
      }
    }
  }, [searchParams, navigate]);

  const handleYandexLogin = () => {
    const callbackUrl = `${AUTH_URL}?oauth=yandex_callback`;
    
    const loginUrl = `${AUTH_URL}?oauth=yandex&callback_url=${encodeURIComponent(callbackUrl)}&frontend_url=${encodeURIComponent(FRONTEND_URL + '/login')}`;
    
    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="max-w-md w-full shadow-2xl border-2 border-purple-200">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <img 
              src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
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
          <Button
            onClick={handleYandexLogin}
            className="w-full h-12 bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white font-semibold text-base"
          >
            <Icon name="LogIn" className="mr-2" size={20} />
            Войти через Яндекс ID
          </Button>

          <div className="text-center text-sm text-gray-500 pt-4">
            <p>
              Нажимая кнопку, вы соглашаетесь с{' '}
              <a href="/terms-of-service" className="text-purple-600 hover:underline">
                условиями использования
              </a>
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Первый вход:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Автоматически создается семья</li>
                  <li>Вы становитесь владельцем</li>
                  <li>Можно пригласить родственников</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}