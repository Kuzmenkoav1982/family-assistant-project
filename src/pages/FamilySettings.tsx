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
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');

    if (!storedToken) {
      navigate('/');
      return;
    }

    setToken(storedToken);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      
      // Загружаем данные семьи из localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (userData.family_name) {
        setFamilyName(userData.family_name);
      }
      if (userData.logo_url) {
        setFamilyLogo(userData.logo_url);
      }
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
              <Label htmlFor="familyName">Название семьи</Label>
              <Input
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Например: Семья Ивановых"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyLogo">Эмблема семьи</Label>
              {familyLogo && (
                <div className="mb-4">
                  <img src={familyLogo} alt="Эмблема" className="w-32 h-32 rounded-full object-cover border-4 border-purple-200" />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    // Проверка размера (максимум 5МБ)
                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        title: 'Ошибка',
                        description: 'Размер файла не должен превышать 5МБ',
                        variant: 'destructive'
                      });
                      return;
                    }
                    
                    setIsLoading(true);
                    try {
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      // Загружаем файл
                      const uploadResponse = await fetch(func2url['upload-file'], {
                        method: 'POST',
                        headers: {
                          'X-Auth-Token': token || ''
                        },
                        body: formData
                      });
                      
                      const uploadData = await uploadResponse.json();
                      
                      if (!uploadResponse.ok || !uploadData.success) {
                        throw new Error(uploadData.error || 'Ошибка загрузки файла');
                      }
                      
                      const logoUrl = uploadData.url;
                      setFamilyLogo(logoUrl);
                      
                      // Сразу сохраняем в БД
                      const updateResponse = await fetch(func2url['family-data'], {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'X-Auth-Token': token || ''
                        },
                        body: JSON.stringify({
                          logoUrl: logoUrl
                        })
                      });
                      
                      const updateData = await updateResponse.json();
                      
                      if (updateResponse.ok && updateData.success) {
                        toast({
                          title: 'Успешно!',
                          description: 'Эмблема семьи обновлена'
                        });
                        
                        // Обновляем localStorage
                        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                        userData.logo_url = logoUrl;
                        localStorage.setItem('userData', JSON.stringify(userData));
                      } else {
                        throw new Error(updateData.error || 'Ошибка сохранения');
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
                  }}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFamilyLogo('')}
                  disabled={!familyLogo || isLoading}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Загрузите изображение (максимум 5МБ). Поддерживаются JPG, PNG, GIF.
              </p>
            </div>
            <Button onClick={async () => {
              if (!familyName && !familyLogo) {
                toast({
                  title: 'Ошибка',
                  description: 'Заполните хотя бы одно поле',
                  variant: 'destructive'
                });
                return;
              }

              setIsLoading(true);
              try {
                const response = await fetch(func2url['family-data'], {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': token || ''
                  },
                  body: JSON.stringify({
                    name: familyName || undefined,
                    logoUrl: familyLogo || undefined
                  })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                  toast({
                    title: 'Успешно!',
                    description: 'Информация о семье обновлена'
                  });
                  
                  // Обновляем localStorage
                  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                  if (familyName) userData.family_name = familyName;
                  if (familyLogo) userData.logo_url = familyLogo;
                  localStorage.setItem('userData', JSON.stringify(userData));
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