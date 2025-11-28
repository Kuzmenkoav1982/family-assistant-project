import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const ADMIN_EMAIL = 'kuzmenkoav1982@yandex.ru';
const ADMIN_PASSWORD = 'Anastasiya87kuz';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminToken', 'admin_authenticated');
        navigate('/admin/support');
      } else {
        setError('Неверный логин или пароль');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 shadow-2xl border-slate-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4">
            <Icon name="Shield" size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Админ-панель
          </h1>
          <p className="text-gray-600">
            Вход для администратора сайта
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Icon name="Mail" size={16} />
              Email администратора
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="mt-2"
              autoComplete="username"
            />
          </div>

          <div>
            <Label htmlFor="password" className="flex items-center gap-2">
              <Icon name="Lock" size={16} />
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-2"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-800 text-sm">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-12 text-lg"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Вход...
              </>
            ) : (
              <>
                <Icon name="LogIn" size={20} className="mr-2" />
                Войти в админку
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/')}
            className="w-full"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Вернуться на сайт
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Icon name="Info" size={14} className="flex-shrink-0 mt-0.5" />
            <p>
              Эта страница доступна только администратору сайта. 
              Для доступа к семейным функциям войдите через основную страницу.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
