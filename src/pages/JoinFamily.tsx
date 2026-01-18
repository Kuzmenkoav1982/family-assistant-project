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
                onClick={() => navigate(`/register?redirect=/join?code=${formData.inviteCode}`)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-14 text-base"
              >
                <Icon name="UserPlus" size={20} className="mr-2" />
                Создать аккаунт
              </Button>

              <Button
                onClick={() => navigate(`/login?redirect=/join?code=${formData.inviteCode}`)}
                variant="outline"
                className="w-full border-2 border-purple-300 hover:bg-purple-50 h-14 text-base"
              >
                <Icon name="LogIn" size={20} className="mr-2" />
                Уже есть аккаунт? Войти
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
            Приглашение в семью
          </CardTitle>
          {familyInfo && (
            <p className="text-gray-600">
              Вас пригласили в семью <strong>"{familyInfo.name}"</strong>
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Ваше имя</Label>
              <div className="relative mt-2">
                <Icon name="User" size={18} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Как вас зовут?"
                  value={formData.memberName}
                  onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="inviteCode">Код приглашения</Label>
              <div className="relative mt-2">
                <Icon name="Key" size={18} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Введите код"
                  value={formData.inviteCode}
                  onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
                  className="pl-10 uppercase"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="relationship">Степень родства</Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                disabled={isLoading}
              >
                <SelectTrigger id="relationship" className="mt-2">
                  <SelectValue placeholder="Выберите родство" />
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
                <Label htmlFor="customRelationship">Укажите родство</Label>
                <Input
                  id="customRelationship"
                  type="text"
                  placeholder="Например: кузен, свекровь"
                  value={formData.customRelationship}
                  onChange={(e) => setFormData({ ...formData, customRelationship: e.target.value })}
                  className="mt-2"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <Button
            onClick={() => handleJoin()}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Присоединяюсь...
              </>
            ) : (
              <>
                <Icon name="UserPlus" size={20} className="mr-2" />
                Присоединиться к семье
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <Link to="/dashboard" className="text-purple-600 hover:text-purple-700 font-medium">
              ← На главную
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
