import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '@/config/func2url';

const YANDEX_CLIENT_ID = import.meta.env.VITE_YANDEX_CLIENT_ID || '9c4bbe74d2b74ad9b93aad4e3f1c8f4e';
const REDIRECT_URI = `${window.location.origin}/activate-callback`;

export default function ActivateChild() {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteToken) {
      setError('Неверная ссылка-приглашение');
      setLoading(false);
      return;
    }

    loadInviteInfo();
  }, [inviteToken]);

  const loadInviteInfo = async () => {
    try {
      const response = await fetch(func2url['child-invite'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'info',
          invite_token: inviteToken
        })
      });

      const data = await response.json();

      if (data.success) {
        setInviteInfo(data.invite);
      } else {
        setError(data.error || 'Приглашение недействительно');
      }
    } catch (err) {
      setError('Не удалось загрузить информацию о приглашении');
    } finally {
      setLoading(false);
    }
  };

  const handleYandexLogin = () => {
    // Сохраняем invite_token в localStorage для использования после редиректа
    localStorage.setItem('pending_invite_token', inviteToken || '');
    
    const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${YANDEX_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=activate_child`;
    window.location.href = authUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-muted-foreground">Загрузка информации...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <Icon name="AlertCircle" size={32} className="text-red-600" />
            </div>
            <CardTitle className="text-center">Ошибка активации</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              На главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <Icon name="UserCheck" size={40} className="text-purple-600" />
          </div>
          <CardTitle className="text-center text-2xl">Активация аккаунта</CardTitle>
          <CardDescription className="text-center">
            Привет, {inviteInfo?.child_name}! 👋
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Icon name="Info" size={16} className="text-blue-600" />
            <AlertDescription className="text-blue-900">
              <p className="font-medium mb-2">Что произойдет после активации:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>✅ Ты получишь полный доступ к приложению</li>
                <li>✅ Сможешь участвовать в семейных голосованиях</li>
                <li>✅ Все твои баллы и достижения сохранятся</li>
                <li>✅ Вся история задач и активностей останется</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              Семья: <strong>{inviteInfo?.family_name}</strong>
            </p>
            
            <Button 
              onClick={handleYandexLogin}
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Icon name="LogIn" size={20} className="mr-2" />
              Войти через Яндекс ID
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Используй тот же аккаунт Яндекс, который<br />
              будешь использовать для входа в приложение
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}