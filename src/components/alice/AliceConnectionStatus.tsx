import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface AliceConnectionStatusProps {
  isLinked: boolean;
}

export function AliceConnectionStatus({ isLinked }: AliceConnectionStatusProps) {
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-full ${isLinked ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Icon name={isLinked ? 'CheckCircle' : 'AlertCircle'} size={32} className={isLinked ? 'text-green-600' : 'text-gray-400'} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {isLinked ? 'Алиса подключена' : 'Алиса не подключена'}
              </h3>
              <p className="text-sm text-gray-600">
                {isLinked 
                  ? 'Вы можете управлять делами через голосовые команды'
                  : 'Привяжите аккаунт для голосового управления'
                }
              </p>
            </div>
          </div>
          {isLinked && (
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <Icon name="Wifi" size={16} className="mr-2" />
              Активна
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
