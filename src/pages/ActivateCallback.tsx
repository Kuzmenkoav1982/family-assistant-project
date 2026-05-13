import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../backend/func2url.json';
import { saveAuthSession } from '@/lib/authStorage';

export default function ActivateCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Активируем ваш аккаунт...');
  const [memberName, setMemberName] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const inviteToken = localStorage.getItem('pending_invite_token');

    if (!code || state !== 'activate_child' || !inviteToken) {
      setStatus('error');
      setMessage('Неверные параметры активации');
      return;
    }

    activateAccount(code, inviteToken);
  }, [searchParams]);

  const activateAccount = async (code: string, inviteToken: string) => {
    try {
      // 1. Обмениваем code на токен и получаем user_id
      const authResponse = await fetch(func2url['auth'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const authData = await authResponse.json();

      if (!authResponse.ok || !authData.success) {
        throw new Error('Не удалось авторизоваться через Яндекс');
      }

      const yandexUserId = authData.user_id;

      // 2. Активируем детский аккаунт
      const activateResponse = await fetch(func2url['child-invite'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'activate',
          invite_token: inviteToken,
          yandex_user_id: yandexUserId
        })
      });

      const activateData = await activateResponse.json();

      if (!activateResponse.ok || !activateData.success) {
        throw new Error(activateData.error || 'Не удалось активировать аккаунт');
      }

      // 3. Сохраняем токен и данные пользователя
      saveAuthSession({
        token: authData.token,
        user: {
          ...authData.user,
          family_id: activateData.family_id,
          member_id: activateData.member_id,
        },
      });
      localStorage.removeItem('pending_invite_token');
      // Очищаем флаги демо-режима при активации
      localStorage.removeItem('isDemoMode');
      localStorage.removeItem('demoStartTime');

      setMemberName(activateData.member_name);
      setStatus('success');
      setMessage(`Аккаунт успешно активирован!`);

      // Через 2 секунды перенаправляем на главную
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Ошибка активации аккаунта');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            {status === 'loading' && (
              <Icon name="Loader2" size={40} className="text-purple-600 animate-spin" />
            )}
            {status === 'success' && (
              <Icon name="CheckCircle2" size={40} className="text-green-600" />
            )}
            {status === 'error' && (
              <Icon name="XCircle" size={40} className="text-red-600" />
            )}
          </div>
          <CardTitle className="text-center text-2xl">
            {status === 'loading' && 'Активация аккаунта'}
            {status === 'success' && '🎉 Готово!'}
            {status === 'error' && 'Ошибка'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {message}
          </p>

          {status === 'success' && memberName && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-900 font-medium">
                Добро пожаловать, {memberName}! 👋
              </p>
              <p className="text-sm text-green-700 mt-1">
                Сейчас перенаправим тебя в приложение...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} className="w-full">
                На главную
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="w-full"
              >
                Попробовать снова
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}