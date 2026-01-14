import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';

interface ItineraryDay {
  id: number;
  day_number: number;
  date: string;
  title?: string;
  description?: string;
  places?: string;
  notes?: string;
}

interface TripItineraryProps {
  tripId: number;
  itinerary: ItineraryDay[];
  onUpdate: () => void;
}

export function TripItinerary({ tripId, itinerary, onUpdate }: TripItineraryProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDay, setNewDay] = useState({
    day_number: itinerary.length + 1,
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    places: '',
    notes: ''
  });

  const handleAddDay = async () => {
    if (!newDay.date) {
      alert('Укажите дату дня');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'add_day',
          trip_id: tripId,
          ...newDay
        })
      });

      if (response.ok) {
        onUpdate();
        setIsAddOpen(false);
        setNewDay({
          day_number: itinerary.length + 2,
          date: new Date().toISOString().split('T')[0],
          title: '',
          description: '',
          places: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error adding day:', error);
      alert('Ошибка при добавлении дня');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const sortedItinerary = [...itinerary].sort((a, b) => a.day_number - b.day_number);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Маршрут по дням</h3>
        <Button onClick={() => setIsAddOpen(true)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить день
        </Button>
      </div>

      {sortedItinerary.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="MapPin" size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">Маршрут не составлен</p>
            <Button onClick={() => setIsAddOpen(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить первый день
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedItinerary.map((day) => (
            <Card key={day.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{day.day_number}</span>
                      </div>
                      <CardTitle className="text-lg">{day.title || `День ${day.day_number}`}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(day.date)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {day.description && (
                  <p className="text-gray-700">{day.description}</p>
                )}
                {day.places && (
                  <div className="flex items-start gap-2">
                    <Icon name="MapPin" size={16} className="mt-1 text-gray-400" />
                    <p className="text-sm text-gray-600">{day.places}</p>
                  </div>
                )}
                {day.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500 italic">{day.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить день в маршрут</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="day_number">День №</Label>
                <Input
                  id="day_number"
                  type="number"
                  value={newDay.day_number}
                  onChange={(e) => setNewDay({ ...newDay, day_number: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="date">Дата *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newDay.date}
                  onChange={(e) => setNewDay({ ...newDay, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="title">Название дня</Label>
              <Input
                id="title"
                value={newDay.title}
                onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
                placeholder="Например: Прибытие и заселение"
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={newDay.description}
                onChange={(e) => setNewDay({ ...newDay, description: e.target.value })}
                placeholder="Что планируете делать в этот день?"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="places">Места для посещения</Label>
              <Input
                id="places"
                value={newDay.places}
                onChange={(e) => setNewDay({ ...newDay, places: e.target.value })}
                placeholder="Парк Ривьера, Олимпийский парк..."
              />
            </div>
            <div>
              <Label htmlFor="notes">Заметки</Label>
              <Textarea
                id="notes"
                value={newDay.notes}
                onChange={(e) => setNewDay({ ...newDay, notes: e.target.value })}
                placeholder="Важные детали, напоминания..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddDay}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}