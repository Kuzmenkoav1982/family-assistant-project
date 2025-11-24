import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import FamilyManager from '@/components/auth/FamilyManager';

export default function FamilySettings() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');

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
