import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

export default function DebugAuth() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testVerify = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Токен не найден в localStorage. Пожалуйста, авторизуйтесь сначала.');
        setLoading(false);
        return;
      }

      const response = await fetch('https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0?action=verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(`Ошибка ${response.status}: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(`Ошибка сети: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async (phone: string, password: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: phone,
          password: password
        })
      });

      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);
        if (!response.ok) {
          setError(`Ошибка ${response.status}: ${JSON.stringify(data, null, 2)}`);
        } else {
          setResult(data);
          if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        }
      } catch (parseErr) {
        setError(`Ошибка ${response.status}: Сервер вернул не JSON:\n${responseText.substring(0, 500)}`);
      }
    } catch (err: any) {
      setError(`Ошибка сети: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async (phone: string, password: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          password: password,
          family_name: 'Тестовая семья'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(`Ошибка ${response.status}: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(data);
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
    } catch (err: any) {
      setError(`Ошибка сети: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentToken = () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return { token, user: user ? JSON.parse(user) : null };
  };

  const currentData = getCurrentToken();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Bug" className="text-red-500" />
              Отладка авторизации
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">ℹ️ Инструкция:</p>
              <p className="text-sm text-gray-700">
                1. Эта страница для отладки функции авторизации<br/>
                2. Нажми кнопки ниже чтобы протестировать<br/>
                3. Юра увидит все логи в системе и сможет найти ошибку
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">Текущий токен:</p>
              <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                {currentData.token || 'Токен отсутствует'}
              </pre>
              {currentData.user && (
                <>
                  <p className="text-sm font-semibold mt-3 mb-2">Текущий пользователь:</p>
                  <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                    {JSON.stringify(currentData.user, null, 2)}
                  </pre>
                </>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                onClick={testVerify}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600"
                size="lg"
              >
                {loading ? (
                  <>
                    <Icon name="Loader" className="mr-2 animate-spin" />
                    Отправка запроса...
                  </>
                ) : (
                  <>
                    <Icon name="ShieldCheck" className="mr-2" />
                    Тест: Проверить токен (verify)
                  </>
                )}
              </Button>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-2">Сначала зарегистрируй пользователя:</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  testRegister(
                    formData.get('phone') as string,
                    formData.get('password') as string
                  );
                }}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input 
                      name="phone" 
                      placeholder="+79001234567" 
                      defaultValue="+79001234567"
                      required 
                    />
                    <Input 
                      name="password" 
                      type="password"
                      placeholder="Пароль" 
                      defaultValue="123456"
                      required 
                    />
                  </div>
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    <Icon name="UserPlus" className="mr-2" />
                    Зарегистрировать
                  </Button>
                </form>

                <p className="text-sm font-semibold mt-4 mb-2">Потом войди:</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  testLogin(
                    formData.get('phone') as string,
                    formData.get('password') as string
                  );
                }}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input 
                      name="phone" 
                      placeholder="+79001234567" 
                      defaultValue="+79001234567"
                      required 
                    />
                    <Input 
                      name="password" 
                      type="password"
                      placeholder="Пароль" 
                      defaultValue="123456"
                      required 
                    />
                  </div>
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    <Icon name="LogIn" className="mr-2" />
                    Войти
                  </Button>
                </form>
              </div>
            </div>

            {error && (
              <Card className="border-red-300 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold text-red-900 mb-2">❌ Ошибка:</p>
                  <pre className="text-xs text-red-800 bg-white p-3 rounded overflow-x-auto whitespace-pre-wrap">
                    {error}
                  </pre>
                </CardContent>
              </Card>
            )}

            {result && (
              <Card className="border-green-300 bg-green-50">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold text-green-900 mb-2">✅ Успешно:</p>
                  <pre className="text-xs text-green-800 bg-white p-3 rounded overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            <div className="pt-4 border-t">
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                <Icon name="Home" className="mr-2" />
                Вернуться на главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}