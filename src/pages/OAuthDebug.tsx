import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const AUTH_URL = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';

export default function OAuthDebug() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<string>('Не авторизован');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    setToken(storedToken);
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setAuthStatus('✅ Авторизован через OAuth');
      } catch (e) {
        setAuthStatus('❌ Ошибка парсинга user');
      }
    } else {
      setAuthStatus('⚠️ Не авторизован');
    }
  }, []);

  const testAuthEndpoint = async () => {
    if (!token) {
      setTestResult({ error: 'Нет токена' });
      return;
    }

    try {
      const response = await fetch(AUTH_URL, {
        headers: {
          'X-Auth-Token': token
        }
      });
      
      const data = await response.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({ error: error.message });
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setAuthStatus('⚠️ Не авторизован');
    setTestResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Bug" size={24} />
              OAuth Debug Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Статус:</p>
                <p className="font-bold text-lg">{authStatus}</p>
              </div>
              <Button onClick={() => window.location.href = '/login'} className="bg-gradient-to-r from-red-500 to-yellow-500">
                <Icon name="LogIn" className="mr-2" size={16} />
                Авторизоваться
              </Button>
            </div>

            {token && (
              <div className="space-y-2">
                <Badge className="bg-green-600">Token найден</Badge>
                <div className="p-3 bg-green-50 rounded border border-green-200 font-mono text-xs break-all">
                  {token}
                </div>
              </div>
            )}

            {user && (
              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <h3 className="font-bold mb-2">Данные пользователя:</h3>
                <pre className="text-xs bg-white p-3 rounded overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={testAuthEndpoint} disabled={!token}>
                <Icon name="Play" className="mr-2" size={16} />
                Проверить токен
              </Button>
              <Button onClick={clearAuth} variant="destructive">
                <Icon name="Trash2" className="mr-2" size={16} />
                Очистить Auth
              </Button>
            </div>

            {testResult && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h3 className="font-bold mb-2">Результат проверки:</h3>
                <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-96">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-50 rounded border">
              <p className="font-mono text-xs mb-1">GET {AUTH_URL}?oauth=yandex&callback_url=...</p>
              <p className="text-xs text-gray-600">Инициализация OAuth flow</p>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <p className="font-mono text-xs mb-1">GET {AUTH_URL}?oauth=yandex_callback&code=...</p>
              <p className="text-xs text-gray-600">Обработка callback от Yandex</p>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <p className="font-mono text-xs mb-1">GET {AUTH_URL}</p>
              <p className="text-xs text-gray-600 mb-1">Headers: X-Auth-Token: TOKEN</p>
              <p className="text-xs text-gray-600">Получение текущего пользователя</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yandex OAuth Config</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Client ID:</p>
              <p className="font-mono text-xs bg-gray-50 p-2 rounded">7e0f89d2248a4f6cbecc79103c2553b8</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Callback URL:</p>
              <p className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                {AUTH_URL}?oauth=yandex_callback
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
