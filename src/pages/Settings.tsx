import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { NotificationsSettings } from '@/components/NotificationsSettings';

export default function Settings() {
  const navigate = useNavigate();

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
