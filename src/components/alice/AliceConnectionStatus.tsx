import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface AliceConnectionStatusProps {
  isLinked: boolean;
}

export function AliceConnectionStatus({ isLinked }: AliceConnectionStatusProps) {
  return (
    <Card className={`border-2 transition-all duration-300 ${
      isLinked 
        ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' 
        : 'border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50'
    }`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-full transition-all duration-300 ${
              isLinked ? 'bg-green-100 animate-pulse' : 'bg-gray-100'
            }`}>
              <Icon 
                name={isLinked ? 'CheckCircle' : 'AlertCircle'} 
                size={32} 
                className={`transition-colors duration-300 ${
                  isLinked ? 'text-green-600' : 'text-gray-400'
                }`} 
              />
            </div>
            <div>
              <h3 className={`font-semibold text-lg flex items-center gap-2 ${
                isLinked ? 'text-green-700' : 'text-gray-700'
              }`}>
                {isLinked ? (
                  <>
                    ✅ Алиса подключена
                  </>
                ) : (
                  'Алиса не подключена'
                )}
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
            <Badge className="bg-green-500 text-white px-4 py-2 animate-pulse shadow-lg">
              <Icon name="Wifi" size={16} className="mr-2" />
              Активна
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}