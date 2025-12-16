import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

export function AliceGuideTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Smartphone" size={24} className="text-purple-600" />
            Как установить навык?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-gray-700">
              Откройте приложение <strong>Яндекс</strong> или <strong>Алиса</strong>
            </li>
            <li className="text-gray-700">
              Скажите: <strong>"Алиса, включи навык Семейный помощник"</strong>
            </li>
            <li className="text-gray-700">
              Следуйте инструкциям для активации навыка
            </li>
            <li className="text-gray-700">
              Вернитесь на эту страницу и привяжите аккаунт кодом
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Settings" size={24} className="text-blue-600" />
            Настройка голосового управления
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon name="Mic" size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Голосовая активация</h4>
                <p className="text-sm text-gray-600">
                  Говорите естественно, как будто разговариваете с человеком. 
                  Алиса поймёт вас даже без строгих формулировок.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon name="Users" size={20} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">Семейный контекст</h4>
                <p className="text-sm text-gray-600">
                  Алиса учитывает состав вашей семьи. Можно назначать задачи 
                  конкретным членам семьи по имени.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon name="Calendar" size={20} className="text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold">Умное планирование</h4>
                <p className="text-sm text-gray-600">
                  Называйте даты естественным языком: "завтра", "послезавтра", 
                  "в следующую среду", "через неделю".
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Shield" size={24} className="text-green-600" />
            Приватность и безопасность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <Icon name="Lock" className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Ваши данные защищены:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Код привязки действует только 15 минут</li>
                <li>• Алиса получает доступ только к вашим задачам и событиям</li>
                <li>• Вы можете отключить интеграцию в любой момент</li>
                <li>• Данные передаются по защищённому соединению</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="HelpCircle" size={24} className="text-orange-600" />
            Частые вопросы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">Алиса не понимает команды</h4>
              <p className="text-sm text-gray-600 mt-1">
                Убедитесь, что навык "Семейный помощник" активирован и аккаунт привязан. 
                Попробуйте сказать: "Алиса, запусти навык Семейный помощник".
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900">Код привязки не работает</h4>
              <p className="text-sm text-gray-600 mt-1">
                Код действителен только 15 минут. Создайте новый код и сразу назовите его Алисе.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900">Можно ли использовать на умной колонке?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Да! Навык работает на всех устройствах с Яндекс.Алисой: смартфоны, планшеты, 
                Яндекс.Станция и другие умные колонки.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
