import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function NewsSubscriptionCard() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Bell" size={24} className="text-blue-600" />
          Подписка на новости
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">
          Хотите первыми узнавать о новых мерах поддержки семей? Подпишитесь на официальные каналы Правительства РФ:
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start" onClick={() => window.open('https://government.ru', '_blank')}>
            <Icon name="Globe" size={16} className="mr-2" />
            Сайт Правительства РФ
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => window.open('https://t.me/governmentru', '_blank')}>
            <Icon name="Send" size={16} className="mr-2" />
            Telegram Правительства
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => window.open('https://www.gosuslugi.ru', '_blank')}>
            <Icon name="Smartphone" size={16} className="mr-2" />
            Госуслуги
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => window.open('http://www.kremlin.ru', '_blank')}>
            <Icon name="Flag" size={16} className="mr-2" />
            Официальный сайт Кремля
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
