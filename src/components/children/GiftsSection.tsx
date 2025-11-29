import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

export function GiftsSection({ child }: { child: FamilyMember }) {
  const gifts = [
    { event: 'День рождения', date: '2025-03-15', gift: 'Велосипед', given: false, notes: 'Хочет синий' },
    { event: 'Новый год', date: '2025-01-01', gift: 'Конструктор LEGO', given: true, notes: '' },
    { event: '8 марта', date: '2025-03-08', gift: 'Набор для рисования', given: false, notes: '' }
  ];

  const upcomingGifts = gifts.filter(g => !g.given && new Date(g.date) > new Date());
  const givenGifts = gifts.filter(g => g.given);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Gift" size={24} />
              Предстоящие подарки
            </CardTitle>
            <Button className="gap-2 bg-gradient-to-r from-pink-600 to-purple-600">
              <Icon name="Plus" size={16} />
              Добавить подарок
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingGifts.length > 0 ? (
            upcomingGifts.map((gift, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                <div className="text-4xl">🎁</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{gift.event}</h4>
                      <p className="text-sm text-gray-600">{new Date(gift.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <Badge className="bg-pink-100 text-pink-700">Запланирован</Badge>
                  </div>
                  <div className="mt-2 p-3 bg-white rounded border">
                    <p className="font-medium text-purple-600">{gift.gift}</p>
                    {gift.notes && (
                      <p className="text-sm text-gray-600 mt-1">💡 {gift.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Icon name="Edit" size={14} />
                      Изменить
                    </Button>
                    <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                      <Icon name="Check" size={14} />
                      Подарен
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Gift" size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Нет запланированных подарков</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="History" size={24} />
            История подарков
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {givenGifts.length > 0 ? (
            givenGifts.map((gift, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">✅</div>
                <div className="flex-1">
                  <p className="font-medium">{gift.gift}</p>
                  <p className="text-sm text-gray-600">{gift.event} • {new Date(gift.date).toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Пока нет подаренных подарков</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
