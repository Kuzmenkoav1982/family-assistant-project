import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { NotificationsSettings } from '@/components/NotificationsSettings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import func2url from '../../backend/func2url.json';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [familyName, setFamilyName] = useState('');
  const [familyLogo, setFamilyLogo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const token = localStorage.getItem('authToken');
  
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.family_name) setFamilyName(user.family_name);
      if (user.logo_url) setFamilyLogo(user.logo_url);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ⚙️ Настройки
            </h1>
            <p className="text-gray-600 mt-2">Управление приложением и уведомлениями</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
            <Icon name="ArrowLeft" size={18} />
            На главную
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={24} className="text-orange-600" />
              Информация о семье
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Название семьи</Label>
              <Input
                id="familyName"
                placeholder="Например: Семья Ивановых"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Логотип семьи</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        title: 'Ошибка',
                        description: 'Размер файла не должен превышать 5 МБ',
                        variant: 'destructive'
                      });
                      return;
                    }
                    
                    setIsUploading(true);
                    try {
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      const response = await fetch(func2url['upload-file'], {
                        method: 'POST',
                        headers: {
                          'X-Auth-Token': token || ''
                        },
                        body: formData
                      });
                      
                      const data = await response.json();
                      
                      if (response.ok && data.url) {
                        setFamilyLogo(data.url);
                        toast({
                          title: 'Успешно!',
                          description: 'Логотип загружен'
                        });
                      } else {
                        throw new Error(data.error || 'Ошибка загрузки');
                      }
                    } catch (error) {
                      toast({
                        title: 'Ошибка',
                        description: String(error),
                        variant: 'destructive'
                      });
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  disabled={isUploading}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500">Или вставьте URL изображения:</p>
              <Input
                id="familyLogo"
                placeholder="https://example.com/logo.png"
                value={familyLogo}
                onChange={(e) => setFamilyLogo(e.target.value)}
                disabled={isUploading}
              />
              {familyLogo && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Предпросмотр:</p>
                  <img 
                    src={familyLogo} 
                    alt="Логотип семьи" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
            </div>
            
            <Button 
              onClick={async () => {
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
                    
                    const userData = localStorage.getItem('userData');
                    if (userData) {
                      const user = JSON.parse(userData);
                      user.family_name = familyName;
                      user.logo_url = familyLogo;
                      localStorage.setItem('userData', JSON.stringify(user));
                    }
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
              }} 
              disabled={isLoading || isUploading}
              className="w-full"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить информацию о семье'}
            </Button>
          </CardContent>
        </Card>

        <NotificationsSettings />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="User" size={24} className="text-purple-600" />
              Профиль и безопасность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icon name="Lock" size={18} />
              Изменить пароль
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icon name="Shield" size={18} />
              Двухфакторная аутентификация
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icon name="Download" size={18} />
              Экспорт данных
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Palette" size={24} className="text-pink-600" />
              Внешний вид
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icon name="Moon" size={18} />
              Темная тема
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icon name="Languages" size={18} />
              Язык интерфейса
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" size={24} className="text-blue-600" />
              О приложении
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Версия</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icon name="FileText" size={18} />
              Политика конфиденциальности
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icon name="HelpCircle" size={18} />
              Справка и поддержка
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}