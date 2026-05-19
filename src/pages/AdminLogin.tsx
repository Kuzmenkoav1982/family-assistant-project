import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { adminLogin } from '@/lib/adminAuth';

// SEC-1.3: hardcoded credentials УДАЛЕНЫ. Проверка email/password идёт через
// backend.admin-auth (bcrypt-хеш в secret ADMIN_PASSWORD_HASH). Plain-токен
// сессии возвращается с сервера, хранится только в localStorage у клиента.

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md p-4 sm:p-8 shadow-2xl border-slate-700">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4">
            <Icon name="Shield" size={32} className="sm:w-10 sm:h-10 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
            Админ-панель
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Вход для администратора сайта
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Icon name="Mail" size={16} aria-hidden="true" />
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
              <Icon name="Lock" size={16} aria-hidden="true" />
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
            <div
              role="alert"
              aria-live="assertive"
              className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-800 text-sm"
            >
              <Icon name="AlertCircle" size={16} aria-hidden="true" />
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
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" aria-hidden="true" />
                Вход…
              </>
            ) : (
              <>
                <Icon name="LogIn" size={20} className="mr-2" aria-hidden="true" />
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
            <Icon name="ArrowLeft" size={16} className="mr-2" aria-hidden="true" />
            Вернуться на сайт
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Icon name="Info" size={14} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Эта страница доступна только администратору сайта. Для доступа
              к семейным функциям войдите через основную страницу.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
