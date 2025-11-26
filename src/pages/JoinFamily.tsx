import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

const INVITE_API = 'https://functions.poehali.dev/c30902b1-40c9-48c1-9d81-b0fab5788b9d';
const AUTH_URL = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteCode = searchParams.get('code') || '';
  
  const [step, setStep] = useState<'auth' | 'join'>('auth');
  const [authType, setAuthType] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  
  const [authData, setAuthData] = useState({
    phone: '',
    password: ''
  });
  
  const [joinData, setJoinData] = useState({
    memberName: '',
    relationship: '',
    customRelationship: ''
  });

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    if (!inviteCode) {
      alert('❌ Неверная ссылка приглашения');
      navigate('/login');
      return;
    }

    if (authToken) {
      setStep('join');
    }
  }, [inviteCode, authToken, navigate]);

  const handleAuth = async () => {
    if (!authData.phone || !authData.password) {
      alert('⚠️ Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authType,
          phone: authData.phone,
          password: authData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setStep('join');
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (forceLeave = false) => {
    if (!joinData.memberName || !joinData.relationship) {
      alert('⚠️ Заполните все поля');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('❌ Требуется авторизация');
      setStep('auth');
      return;
    }

    setLoading(true);
    try {
      const relationship = joinData.relationship === 'Другое' 
        ? joinData.customRelationship 
        : joinData.relationship;

      const response = await fetch(INVITE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'join',
          invite_code: inviteCode.toUpperCase(),
          member_name: joinData.memberName,
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
          setLoading(false);
        }
        return;
      }

      if (data.success) {
        alert(`✅ Вы присоединились к семье: ${data.family.name}`);
        localStorage.setItem('user', JSON.stringify({
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          family_id: data.family.id,
          family_name: data.family.name,
          member_id: data.family.member_id
        }));
        navigate('/');
        window.location.reload();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка присоединения к семье');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Icon name="Users" size={32} className="text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Присоединение к семье</CardTitle>
            <CardDescription>
              Код приглашения: <span className="font-bold text-purple-600">{inviteCode}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={authType === 'register' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setAuthType('register')}
              >
                Регистрация
              </Button>
              <Button
                variant={authType === 'login' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setAuthType('login')}
              >
                Вход
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input
                type="tel"
                placeholder="+79991234567"
                value={authData.phone}
                onChange={(e) => setAuthData({ ...authData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Пароль</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
              />
            </div>

            <Button 
              onClick={handleAuth} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {loading ? 'Загрузка...' : authType === 'register' ? 'Зарегистрироваться' : 'Войти'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Icon name="UserPlus" size={32} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Расскажите о себе</CardTitle>
          <CardDescription>
            Код приглашения: <span className="font-bold text-purple-600">{inviteCode}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ваше имя</Label>
            <Input
              placeholder="Как вас называть?"
              value={joinData.memberName}
              onChange={(e) => setJoinData({ ...joinData, memberName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Степень родства</Label>
            <Select 
              value={joinData.relationship} 
              onValueChange={(value) => setJoinData({ ...joinData, relationship: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите родство" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map(rel => (
                  <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {joinData.relationship === 'Другое' && (
            <div className="space-y-2">
              <Label>Укажите родство</Label>
              <Input
                placeholder="Например: Племянница"
                value={joinData.customRelationship}
                onChange={(e) => setJoinData({ ...joinData, customRelationship: e.target.value })}
              />
            </div>
          )}

          <Button 
            onClick={() => handleJoin(false)} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {loading ? 'Присоединяюсь...' : 'Присоединиться к семье'}
          </Button>

          <Button 
            onClick={() => navigate('/login')} 
            variant="ghost"
            className="w-full"
          >
            Отменить
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
