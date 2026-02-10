import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useChildrenData } from '@/hooks/useChildrenData';
import type { FamilyMember } from '@/types/family.types';

export function GiftsSection({ child }: { child: FamilyMember }) {
  const { data, loading, addItem, updateItem, deleteItem } = useChildrenData(child.id);
  const [newGiftDialog, setNewGiftDialog] = useState(false);
  const [newGiftData, setNewGiftData] = useState({ event: '', date: '', gift: '', notes: '' });
  
  const gifts = data?.gifts || [];
  const upcomingGifts = gifts.filter((g: any) => !g.given && new Date(g.date) > new Date());
  const givenGifts = gifts.filter((g: any) => g.given);
  
  const handleAddGift = async () => {
    if (!newGiftData.event || !newGiftData.date || !newGiftData.gift) {
      alert('Заполните обязательные поля');
      return;
    }

    const result = await addItem('gift', {
      event: newGiftData.event,
      date: newGiftData.date,
      gift: newGiftData.gift,
      notes: newGiftData.notes,
      given: false,
      family_id: localStorage.getItem('familyId') || '',
    });

    if (result.success) {
      setNewGiftDialog(false);
      setNewGiftData({ event: '', date: '', gift: '', notes: '' });
    } else {
      alert(result.error || 'Ошибка добавления');
    }
  };
  
  const handleMarkAsGiven = async (giftId: string) => {
    const result = await updateItem('gift', giftId, { given: true });
    if (!result.success) {
      alert(result.error || 'Ошибка обновления');
    }
  };
  
  const handleDeleteGift = async (giftId: string) => {
    if (!confirm('Удалить этот подарок?')) return;
    
    const result = await deleteItem('gift', giftId);
    if (!result.success) {
      alert(result.error || 'Ошибка удаления');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Gift" size={24} />
              Предстоящие подарки
            </CardTitle>
            <Dialog open={newGiftDialog} onOpenChange={setNewGiftDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-pink-600 to-purple-600 w-full sm:w-auto whitespace-nowrap">
                  <Icon name="Plus" size={16} />
                  <span className="hidden sm:inline">Добавить подарок</span>
                  <span className="sm:hidden">Добавить</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить подарок</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Событие *</label>
                    <Input 
                      placeholder="Например: День рождения" 
                      value={newGiftData.event}
                      onChange={(e) => setNewGiftData(prev => ({ ...prev, event: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Дата *</label>
                    <Input 
                      type="date" 
                      value={newGiftData.date}
                      onChange={(e) => setNewGiftData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Подарок *</label>
                    <Input 
                      placeholder="Например: Велосипед" 
                      value={newGiftData.gift}
                      onChange={(e) => setNewGiftData(prev => ({ ...prev, gift: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Примечания</label>
                    <Textarea 
                      placeholder="Дополнительная информация..." 
                      value={newGiftData.notes}
                      onChange={(e) => setNewGiftData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddGift}>Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Загрузка...</div>
          ) : upcomingGifts.length > 0 ? (
            upcomingGifts.map((gift: any) => (
              <div key={gift.id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
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
                    <Button 
                      size="sm" 
                      className="gap-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleMarkAsGiven(gift.id)}
                    >
                      <Icon name="Check" size={14} />
                      Подарен
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteGift(gift.id)}
                    >
                      <Icon name="Trash2" size={14} />
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