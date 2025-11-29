import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ChildProfileProps {
  childId: string;
}

interface Game {
  id: string;
  name: string;
  type: 'video' | 'board' | 'outdoor';
  favorite: boolean;
}

interface Book {
  id: string;
  title: string;
  author: string;
  status: 'reading' | 'completed' | 'planned';
  rating?: number;
}

interface Dream {
  id: string;
  dream: string;
  category: 'career' | 'travel' | 'achievement' | 'other';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export function ChildProfile({ childId }: ChildProfileProps) {
  const [games, setGames] = useState<Game[]>([
    { id: '1', name: 'Minecraft', type: 'video', favorite: true },
    { id: '2', name: 'Монополия', type: 'board', favorite: true },
    { id: '3', name: 'Футбол', type: 'outdoor', favorite: true },
    { id: '4', name: 'Roblox', type: 'video', favorite: false },
  ]);

  const [books, setBooks] = useState<Book[]>([
    {
      id: '1',
      title: 'Гарри Поттер и Философский камень',
      author: 'Дж.К. Роулинг',
      status: 'completed',
      rating: 5,
    },
    {
      id: '2',
      title: 'Маленький принц',
      author: 'Антуан де Сент-Экзюпери',
      status: 'reading',
    },
    {
      id: '3',
      title: 'Хроники Нарнии',
      author: 'К.С. Льюис',
      status: 'planned',
    },
  ]);

  const [dreams, setDreams] = useState<Dream[]>([
    {
      id: '1',
      dream: 'Стать программистом',
      category: 'career',
      priority: 'high',
      notes: 'Интересуется созданием игр',
    },
    {
      id: '2',
      dream: 'Посетить Японию',
      category: 'travel',
      priority: 'high',
      notes: 'Любит аниме и японскую культуру',
    },
    {
      id: '3',
      dream: 'Научиться играть на гитаре',
      category: 'achievement',
      priority: 'medium',
    },
  ]);

  const [newGameDialog, setNewGameDialog] = useState(false);
  const [newBookDialog, setNewBookDialog] = useState(false);
  const [newDreamDialog, setNewDreamDialog] = useState(false);

  const gameTypeNames: Record<string, string> = {
    video: 'Видеоигра',
    board: 'Настольная',
    outdoor: 'На улице',
  };

  const gameTypeIcons: Record<string, string> = {
    video: 'Gamepad2',
    board: 'Dices',
    outdoor: 'TreePine',
  };

  const categoryNames: Record<string, string> = {
    career: 'Карьера',
    travel: 'Путешествия',
    achievement: 'Достижение',
    other: 'Другое',
  };

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  };

  const priorityNames: Record<string, string> = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Gamepad2" size={20} />
              Любимые игры
            </CardTitle>
            <Dialog open={newGameDialog} onOpenChange={setNewGameDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить игру
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить игру</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название игры</label>
                    <Input placeholder="Например: Minecraft" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Тип игры</label>
                    <select className="w-full border rounded-md p-2">
                      <option value="video">Видеоигра</option>
                      <option value="board">Настольная игра</option>
                      <option value="outdoor">Игра на улице</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="favorite" className="w-4 h-4" />
                    <label htmlFor="favorite" className="text-sm">Любимая игра</label>
                  </div>
                  <Button className="w-full">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {games.map((game) => (
              <div key={game.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Icon name={gameTypeIcons[game.type]} size={24} className="text-blue-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{game.name}</p>
                    {game.favorite && <span className="text-yellow-500">⭐</span>}
                  </div>
                  <p className="text-xs text-gray-500">{gameTypeNames[game.type]}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Icon name="Edit" size={16} />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="BookOpen" size={20} />
              Библиотека
            </CardTitle>
            <Dialog open={newBookDialog} onOpenChange={setNewBookDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить книгу
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить книгу</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название книги</label>
                    <Input placeholder="Например: Гарри Поттер" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Автор</label>
                    <Input placeholder="Например: Дж.К. Роулинг" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Статус</label>
                    <select className="w-full border rounded-md p-2">
                      <option value="planned">Запланировано</option>
                      <option value="reading">Читает сейчас</option>
                      <option value="completed">Прочитано</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Оценка (1-5)</label>
                    <Input type="number" min="1" max="5" placeholder="5" />
                  </div>
                  <Button className="w-full">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {books.map((book) => (
            <div key={book.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Icon name="Book" size={24} className="text-purple-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="font-medium">{book.title}</h4>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </div>
                  <div className="flex gap-2">
                    {book.status === 'reading' && (
                      <Badge className="bg-blue-100 text-blue-700">Читает</Badge>
                    )}
                    {book.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-700">Прочитано</Badge>
                    )}
                    {book.status === 'planned' && (
                      <Badge variant="outline">Планируется</Badge>
                    )}
                  </div>
                </div>
                {book.rating && (
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < book.rating! ? 'text-yellow-500' : 'text-gray-300'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button size="sm" variant="ghost">
                <Icon name="Edit" size={16} />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Sparkles" size={20} />
              Мечты и цели
            </CardTitle>
            <Dialog open={newDreamDialog} onOpenChange={setNewDreamDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить мечту
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить мечту</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Мечта</label>
                    <Input placeholder="Например: Стать космонавтом" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Категория</label>
                    <select className="w-full border rounded-md p-2">
                      <option value="career">Карьера</option>
                      <option value="travel">Путешествия</option>
                      <option value="achievement">Достижение</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Приоритет</label>
                    <select className="w-full border rounded-md p-2">
                      <option value="high">Высокий</option>
                      <option value="medium">Средний</option>
                      <option value="low">Низкий</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Заметки</label>
                    <Textarea placeholder="Дополнительная информация" />
                  </div>
                  <Button className="w-full">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {dreams.map((dream) => (
            <div key={dream.id} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
              <div className="text-2xl mt-1">✨</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-lg">{dream.dream}</h4>
                  <Badge className={priorityColors[dream.priority]}>
                    {priorityNames[dream.priority]}
                  </Badge>
                </div>
                <Badge variant="outline" className="mb-2">
                  {categoryNames[dream.category]}
                </Badge>
                {dream.notes && (
                  <p className="text-sm text-gray-600 mt-2">{dream.notes}</p>
                )}
              </div>
              <Button size="sm" variant="ghost">
                <Icon name="Edit" size={16} />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
