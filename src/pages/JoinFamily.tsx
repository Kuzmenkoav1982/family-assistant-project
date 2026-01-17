import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const INVITE_API = 'https://functions.poehali.dev/c30902b1-40c9-48c1-9d81-b0fab5788b9d';

const RELATIONSHIPS = [
  'Отец', 'Мать', 'Сын', 'Дочь',
  'Муж', 'Жена', 
  'Дедушка', 'Бабушка', 'Внук', 'Внучка',
  'Брат', 'Сестра',
  'Дядя', 'Тётя', 'Племянник', 'Племянница',
  'Двоюродный брат', 'Двоюродная сестра',
  'Другое'
];

export default function JoinFamily() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [familyInfo, setFamilyInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    inviteCode: searchParams.get('code') || '',
    memberName: '',
    relationship: '',
    customRelationship: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);

    if (token && formData.inviteCode) {
      fetchFamilyInfo(formData.inviteCode);
    }
  }, [formData.inviteCode]);

  const fetchFamilyInfo = async (code: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${INVITE_API}?action=validate&code=${code}`, {
        headers: {
          'X-Auth-Token': token || ''
        }
      });
      const data = await response.json();
      
      if (data.success && data.family) {
        setFamilyInfo(data.family);
      }
    } catch (error) {
      console.error('Error fetching family info:', error);
    }
  };

  const handleJoin = async (forceLeave = false) => {
    if (!formData.inviteCode) {
      toast({
        title: 'Ошибка',
        description: 'Введите код приглашения',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.memberName) {
      toast({
        title: 'Ошибка',
        description: 'Введите ваше имя',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.relationship) {
      toast({
        title: 'Ошибка',
        description: 'Выберите степень родства',
        variant: 'destructive'
      });
      return;
    }

    if (formData.relationship === 'Другое' && !formData.customRelationship) {
      toast({
        title: 'Ошибка',
        description: 'Укажите степень родства',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const relationship = formData.relationship === 'Другое' 
        ? formData.customRelationship 
        : formData.relationship;

      const response = await fetch(INVITE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'join',
          invite_code: formData.inviteCode.toUpperCase(),
          member_name: formData.memberName,
          relationship: relationship,
          force_leave: forceLeave
        })
      });

      const data = await response.json();

      if (data.warning) {
        const confirmed = confirm(
          `⚠️ ${data.message}\n\n` +
          `Текущая семья: "${data.current_family}"\n\n` +
          `Вы уверены что хотите покинуть текущую семью и присоединиться к новой?`
        );

        if (confirmed) {
          await handleJoin(true);
        } else {
          setIsLoading(false);
        }
        return;
      }

      if (data.success) {
        toast({
          title: 'Добро пожаловать! 🎉',
          description: `Вы присоединились к семье: ${data.family.name}`
        });

        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          user.family_id = data.family.id;
          user.family_name = data.family.name;
          user.member_id = data.family.member_id;
          localStorage.setItem('userData', JSON.stringify(user));
        }

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось присоединиться к семье',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка сети',
        description: 'Проверьте интернет-соединение',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Icon name="Users" size={40} className="text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Приглашение в семью
            </CardTitle>
            <p className="text-gray-600">
              {familyInfo 
                ? `Вас пригласили в семью "${familyInfo.name}"`
                : 'Вас пригласили присоединиться к семье'
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">👋 Почти готово!</p>
                  <p>Чтобы присоединиться к семье, нужно войти или создать аккаунт</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/login?redirect=/join?code=${formData.inviteCode}`)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-14 text-base"
                title="Войти в существующий аккаунт"
              >
                <Icon name="LogIn" size={20} className="mr-2" />
                Войти
              </Button>

              <Button
                onClick={() => navigate(`/register?redirect=/join?code=${formData.inviteCode}`)}
                variant="outline"
                className="w-full border-2 border-purple-300 hover:bg-purple-50 h-14 text-base"
                title="Создать новый аккаунт для присоединения"
              >
                <Icon name="UserPlus" size={20} className="mr-2" />
                Создать аккаунт
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              <Link to="/" className="text-purple-600 hover:text-purple-700 font-medium">
                ← Вернуться на главную
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Icon name="Users" size={40} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Присоединиться к семье
          </CardTitle>
          {familyInfo && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
              <p className="text-lg font-semibold text-gray-900 mb-1">
                {familyInfo.name}
              </p>
              <p className="text-sm text-gray-600">
                {familyInfo.members_count} {familyInfo.members_count === 1 ? 'член' : 'членов'} семьи
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          <form onSubmit={(e) => { e.preventDefault(); handleJoin(); }} className="space-y-4">
            <div>
              <Label htmlFor="inviteCode">
                Код приглашения
                <span className="text-xs text-gray-500 ml-2">(если не заполнен автоматически)</span>
              </Label>
              <div className="relative">
                <Icon name="Key" className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="ABC123"
                  value={formData.inviteCode}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase();
                    setFormData({ ...formData, inviteCode: code });
                    if (code.length >= 6) {
                      fetchFamilyInfo(code);
                    }
                  }}
                  className="pl-10 uppercase font-mono"
                  disabled={isLoading}
                  maxLength={10}
                  title="Введите код из приглашения"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="memberName">
                Ваше имя
                <span className="text-xs text-gray-500 ml-2">(как вас будут видеть в семье)</span>
              </Label>
              <div className="relative">
                <Icon name="User" className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="memberName"
                  type="text"
                  placeholder="Иван"
                  value={formData.memberName}
                  onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                  className="pl-10"
                  disabled={isLoading}
                  title="Введите ваше имя"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="relationship">
                Степень родства
                <span className="text-xs text-gray-500 ml-2">(кем вы приходитесь владельцу)</span>
              </Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                disabled={isLoading}
              >
                <SelectTrigger title="Выберите вашу степень родства">
                  <SelectValue placeholder="Выберите..." />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((rel) => (
                    <SelectItem key={rel} value={rel}>
                      {rel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.relationship === 'Другое' && (
              <div>
                <Label htmlFor="customRelationship">Укажите степень родства</Label>
                <Input
                  id="customRelationship"
                  type="text"
                  placeholder="Например: Друг семьи"
                  value={formData.customRelationship}
                  onChange={(e) => setFormData({ ...formData, customRelationship: e.target.value })}
                  disabled={isLoading}
                  title="Укажите вашу степень родства"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-14 text-base"
              disabled={isLoading}
              title="Подтвердить присоединение к семье"
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Присоединяюсь...
                </>
              ) : (
                <>
                  <Icon name="CheckCircle" size={20} className="mr-2" />
                  Присоединиться к семье
                </>
              )}
            </Button>
          </form>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Shield" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">🔒 Безопасность</p>
                <p>Только владелец семьи может видеть и управлять всеми данными</p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <Link to="/" className="text-purple-600 hover:text-purple-700 font-medium">
              ← Вернуться на главную
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
