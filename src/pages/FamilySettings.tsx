import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import FamilyManager from '@/components/auth/FamilyManager';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../backend/func2url.json';

export default function FamilySettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [familyName, setFamilyName] = useState('');
  const [familyLogo, setFamilyLogo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('userData');

    if (!storedToken) {
      navigate('/');
      return;
    }

    setToken(storedToken);
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, [navigate]);

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm">
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold">Настройки семьи</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Home" size={24} />
              Информация о семье
            </CardTitle>
            <CardDescription>Название и эмблема вашей семьи</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Название вашей семьи (опционально)</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground whitespace-nowrap">Наша семья</span>
                <Input
                  id="familyName"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder='"Ивановы"'
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Будет отображаться: <strong>Наша семья{familyName ? ` "${familyName}"` : ''}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyLogo">URL эмблемы семьи</Label>
              <Input
                id="familyLogo"
                value={familyLogo}
                onChange={(e) => setFamilyLogo(e.target.value)}
                placeholder="https://..."
              />
              {familyLogo && (
                <div className="mt-2">
                  <img src={familyLogo} alt="Эмблема" className="w-20 h-20 rounded-full object-cover" />
                </div>
              )}
            </div>
            <Button onClick={async () => {
              // Название семьи опционально, но если не заполнено — сохраняем просто "Наша семья"
              // Логотип тоже опционален

              setIsLoading(true);
              try {
                // Всегда добавляем "Наша семья" в начало
                const fullFamilyName = familyName 
                  ? `Наша семья "${familyName}"`
                  : 'Наша семья';
                
                const response = await fetch(func2url['family-data'], {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': token || ''
                  },
                  body: JSON.stringify({
                    name: fullFamilyName,
                    logoUrl: familyLogo || undefined
                  })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                  // Обновляем localStorage с новыми данными
                  const currentUserData = localStorage.getItem('userData');
                  if (currentUserData) {
                    const parsedData = JSON.parse(currentUserData);
                    parsedData.family_name = fullFamilyName;
                    parsedData.logo_url = familyLogo || parsedData.logo_url;
                    localStorage.setItem('userData', JSON.stringify(parsedData));
                  }
                  
                  toast({
                    title: 'Успешно!',
                    description: 'Информация о семье обновлена. Страница обновится через 1 секунду...'
                  });
                  
                  // Перезагружаем страницу через 1 секунду для применения изменений
                  setTimeout(() => {
                    window.location.href = '/';
                  }, 1000);
                } else {
                  throw new Error(data.error || 'Ошибка обновления');
                }
              } catch (error) {
                toast({
                  title: 'Ошибка',
                  description: String(error),
                  variant: 'destructive'
                });
              } finally {
                setIsLoading(false);
              }
            }} disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="User" size={24} />
              Ваш профиль
            </CardTitle>
            <CardDescription>Информация о вашем аккаунте</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {userData && (
              <>
                {userData.email && (
                  <div className="flex items-center gap-2">
                    <Icon name="Mail" size={16} className="text-muted-foreground" />
                    <span>{userData.email}</span>
                  </div>
                )}
                {userData.phone && (
                  <div className="flex items-center gap-2">
                    <Icon name="Phone" size={16} className="text-muted-foreground" />
                    <span>{userData.phone}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <FamilyManager token={token} familyId={userData?.family_id} />
      </div>
    </div>
  );
}