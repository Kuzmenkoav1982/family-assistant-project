import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface AdminAliceHeaderProps {
  isDeployed: boolean;
  webhookUrl: string;
  onCopyWebhook: () => void;
  onNavigateBack: () => void;
}

export function AdminAliceHeader({
  isDeployed,
  webhookUrl,
  onCopyWebhook,
  onNavigateBack
}: AdminAliceHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Icon name="Mic" size={36} />
            Управление Алисой
          </h1>
          <p className="text-gray-600 mt-2">Статистика, настройки и модерация навыка</p>
        </div>
        <Button onClick={onNavigateBack} variant="outline" className="gap-2">
          <Icon name="ArrowLeft" size={18} />
          Админка
        </Button>
      </div>

      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${isDeployed ? 'bg-green-100' : 'bg-red-100'}`}>
                <Icon 
                  name={isDeployed ? 'CheckCircle' : 'XCircle'} 
                  size={32} 
                  className={isDeployed ? 'text-green-600' : 'text-red-600'} 
                />
              </div>
              <div>
                <h3 className="font-semibold text-xl">
                  {isDeployed ? 'Навык активен и работает' : 'Навык не активен'}
                </h3>
                <p className="text-sm text-gray-600">
                  Webhook: <code className="text-xs bg-white px-2 py-1 rounded">{webhookUrl}</code>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onCopyWebhook} variant="outline" size="sm">
                <Icon name="Copy" size={16} className="mr-2" />
                Копировать URL
              </Button>
              <Badge className="bg-green-100 text-green-800 px-4 py-2">
                <Icon name="Activity" size={16} className="mr-2" />
                Online
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
