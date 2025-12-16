import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface AliceSetupTabProps {
  isLinked: boolean;
  linkingCode: string;
  expiresAt: Date | null;
  isGenerating: boolean;
  onGenerateCode: () => void;
  onCopyCode: () => void;
  onUnlink: () => void;
}

export function AliceSetupTab({
  isLinked,
  linkingCode,
  expiresAt,
  isGenerating,
  onGenerateCode,
  onCopyCode,
  onUnlink
}: AliceSetupTabProps) {
  if (isLinked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Icon name="CheckCircle" size={24} />
            Алиса успешно подключена
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <Icon name="Info" className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Ваш аккаунт привязан к Яндекс.Алисе. Теперь вы можете управлять семейным органайзером голосом.
            </AlertDescription>
          </Alert>
          
          <div className="pt-4">
            <Button 
              onClick={onUnlink}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <Icon name="Unlink" size={18} className="mr-2" />
              Отключить Алису
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Link" size={24} className="text-purple-600" />
            Шаг 1: Получите код привязки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Создайте уникальный код для связи вашего аккаунта с Алисой. Код действует 15 минут.
          </p>
          
          {!linkingCode ? (
            <Button 
              onClick={onGenerateCode} 
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Icon name="Loader" size={20} className="mr-2 animate-spin" />
                  Создание кода...
                </>
              ) : (
                <>
                  <Icon name="Key" size={20} className="mr-2" />
                  Создать код привязки
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Ваш код:</p>
                  <div className="text-5xl font-bold text-purple-600 tracking-wider font-mono">
                    {linkingCode}
                  </div>
                  <p className="text-xs text-gray-500">
                    Действителен до {expiresAt?.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={onCopyCode}
                variant="outline"
                className="w-full"
              >
                <Icon name="Copy" size={18} className="mr-2" />
                Скопировать код
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Mic" size={24} className="text-blue-600" />
            Шаг 2: Скажите Алисе
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <p className="text-lg font-semibold text-blue-900 mb-3">
              💬 Запустите навык "Семейный помощник" и скажите:
            </p>
            <div className="bg-white p-4 rounded-lg border-2 border-blue-300 text-center">
              <p className="text-xl font-bold text-blue-600">
                "Алиса, привяжи аккаунт с кодом <span className="text-purple-600">{linkingCode || 'XXXX-XX'}</span>"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
