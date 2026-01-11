import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';

interface DiaryEntry {
  id: number;
  date: string;
  title?: string;
  content: string;
  mood?: string;
  location?: string;
  weather?: string;
}

interface TripDiaryProps {
  tripId: number;
  diary: DiaryEntry[];
  onUpdate: () => void;
}

export function TripDiary({ tripId, diary, onUpdate }: TripDiaryProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    mood: 'good',
    location: '',
    weather: ''
  });

  const handleAddEntry = async () => {
    if (!newEntry.content) {
      alert('Напишите текст записи');
      return;
    }

    try {
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_diary',
          trip_id: tripId,
          user_id: 1,
          ...newEntry
        })
      });

      if (response.ok) {
        onUpdate();
        setIsAddOpen(false);
        setNewEntry({
          date: new Date().toISOString().split('T')[0],
          title: '',
          content: '',
          mood: 'good',
          location: '',
          weather: ''
        });
      }
    } catch (error) {
      console.error('Error adding diary entry:', error);
      alert('Ошибка при добавлении записи');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getMoodEmoji = (mood?: string) => {
    const moodMap: Record<string, string> = {
      amazing: '🤩',
      great: '😊',
      good: '🙂',
      neutral: '😐',
      bad: '😕'
    };
    return mood ? moodMap[mood] : '📝';
  };

  const getWeatherEmoji = (weather?: string) => {
    const weatherMap: Record<string, string> = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      snowy: '❄️',
      windy: '💨'
    };
    return weather ? weatherMap[weather] : '';
  };

  const sortedDiary = [...diary].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Дневник поездки</h3>
        <Button onClick={() => setIsAddOpen(true)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Новая запись
        </Button>
      </div>

      {sortedDiary.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="BookOpen" size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">Дневник пуст</p>
            <Button onClick={() => setIsAddOpen(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить первую запись
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDiary.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      <CardTitle className="text-lg">{entry.title || formatDate(entry.date)}</CardTitle>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{formatDate(entry.date)}</span>
                      {entry.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Icon name="MapPin" size={12} />
                            {entry.location}
                          </span>
                        </>
                      )}
                      {entry.weather && (
                        <>
                          <span>•</span>
                          <span>{getWeatherEmoji(entry.weather)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Новая запись в дневник</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Дата *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="mood">Настроение</Label>
                <Select value={newEntry.mood} onValueChange={(val) => setNewEntry({ ...newEntry, mood: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amazing">🤩 Потрясающе</SelectItem>
                    <SelectItem value="great">😊 Отлично</SelectItem>
                    <SelectItem value="good">🙂 Хорошо</SelectItem>
                    <SelectItem value="neutral">😐 Нормально</SelectItem>
                    <SelectItem value="bad">😕 Не очень</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder="Например: Первый день в Сочи"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Место</Label>
                <Input
                  id="location"
                  value={newEntry.location}
                  onChange={(e) => setNewEntry({ ...newEntry, location: e.target.value })}
                  placeholder="Парк Ривьера"
                />
              </div>
              <div>
                <Label htmlFor="weather">Погода</Label>
                <Select value={newEntry.weather} onValueChange={(val) => setNewEntry({ ...newEntry, weather: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Не выбрано" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">☀️ Солнечно</SelectItem>
                    <SelectItem value="cloudy">☁️ Облачно</SelectItem>
                    <SelectItem value="rainy">🌧️ Дождь</SelectItem>
                    <SelectItem value="snowy">❄️ Снег</SelectItem>
                    <SelectItem value="windy">💨 Ветрено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="content">Запись *</Label>
              <Textarea
                id="content"
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                placeholder="Опишите свои впечатления о дне, интересные моменты..."
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddEntry}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
