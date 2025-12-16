import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface MoodEntry {
  id: string;
  mood: string;
  note?: string;
  date: string;
}

interface MoodDiaryProps {
  childId: string;
}

export function MoodDiary({ childId }: MoodDiaryProps) {
  const [entries, setEntries] = useState<MoodEntry[]>([
    {
      id: '1',
      mood: '😊',
      note: 'Сегодня был отличный день! Играл с друзьями в парке',
      date: new Date().toISOString(),
    },
    {
      id: '2',
      mood: '🤔',
      note: 'Задумчивое настроение, много думал о школе',
      date: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [addEntryDialog, setAddEntryDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState('😊');
  const [note, setNote] = useState('');

  const moodOptions = [
    { emoji: '😊', label: 'Счастлив' },
    { emoji: '😄', label: 'Радостный' },
    { emoji: '🥳', label: 'Восторг' },
    { emoji: '😎', label: 'Крутой' },
    { emoji: '🤔', label: 'Задумчивый' },
    { emoji: '😐', label: 'Нормально' },
    { emoji: '😔', label: 'Грустный' },
    { emoji: '😢', label: 'Печальный' },
    { emoji: '😡', label: 'Сердитый' },
    { emoji: '😰', label: 'Беспокойный' },
    { emoji: '😴', label: 'Уставший' },
    { emoji: '🤗', label: 'Обнимашки' },
  ];

  const handleAddEntry = () => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      note: note,
      date: new Date().toISOString(),
    };

    setEntries([newEntry, ...entries]);
    setNote('');
    setAddEntryDialog(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Heart" size={20} className="text-pink-600" />
              Дневник эмоций
            </CardTitle>
            <Dialog open={addEntryDialog} onOpenChange={setAddEntryDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500">
                  <Icon name="Plus" size={16} />
                  Добавить запись
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Как твоё настроение сегодня?</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Выбери настроение</label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {moodOptions.map((mood) => (
                        <button
                          key={mood.emoji}
                          onClick={() => setSelectedMood(mood.emoji)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                            selectedMood === mood.emoji
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <span className="text-4xl">{mood.emoji}</span>
                          <span className="text-xs text-gray-600">{mood.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Расскажи о своём дне (необязательно)
                    </label>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Что интересного произошло сегодня?..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <Button onClick={handleAddEntry} className="w-full bg-gradient-to-r from-blue-500 to-purple-500">
                    <Icon name="Check" className="mr-2" size={16} />
                    Сохранить запись
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600 mb-4">Дневник пока пуст</p>
              <p className="text-sm text-gray-500">Начни записывать свои эмоции каждый день!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card key={entry.id} className="border-2 border-purple-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{entry.mood}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-700">{formatDate(entry.date)}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleTimeString('ru-RU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-gray-700 leading-relaxed">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Статистика настроения за неделю */}
      {entries.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-green-600" />
              Статистика настроения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
                <div className="text-sm text-gray-600">Записей</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl mb-2">😊</div>
                <div className="text-2xl font-bold text-green-600">
                  {entries.filter(e => ['😊', '😄', '🥳', '😎'].includes(e.mood)).length}
                </div>
                <div className="text-sm text-gray-600">Хороших</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl mb-2">🤔</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {entries.filter(e => ['🤔', '😐'].includes(e.mood)).length}
                </div>
                <div className="text-sm text-gray-600">Спокойных</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl mb-2">💪</div>
                <div className="text-2xl font-bold text-purple-600">7</div>
                <div className="text-sm text-gray-600">Дней подряд</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
