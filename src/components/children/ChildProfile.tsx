import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { MoodDiary } from './MoodDiary';
import { AchievementsBadges } from './AchievementsBadges';
import { RewardsShop } from './RewardsShop';
import { RealMoneyPiggyBank } from './RealMoneyPiggyBank';
import { getDailyFact } from '@/data/interestingFacts';

interface ChildProfileProps {
  child: {
    id: string;
    name: string;
    avatar: string;
    piggyBank?: number;
    [key: string]: any;
  };
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

export function ChildProfile({ child }: ChildProfileProps) {
  const piggyBank = child.piggyBank || 0;
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
  const [editGameDialog, setEditGameDialog] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [newGameData, setNewGameData] = useState({ name: '', type: 'video' as const, favorite: false });
  
  const [newBookDialog, setNewBookDialog] = useState(false);
  const [editBookDialog, setEditBookDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [newBookData, setNewBookData] = useState({ title: '', author: '', status: 'planned' as const, rating: undefined as number | undefined });
  
  const [newDreamDialog, setNewDreamDialog] = useState(false);
  const [editDreamDialog, setEditDreamDialog] = useState(false);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [newDreamData, setNewDreamData] = useState({ dream: '', category: 'other' as const, priority: 'medium' as const, notes: '' });
  
  const [moodDialog, setMoodDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState('😊');
  const [challengeCompleted, setChallengeCompleted] = useState(false);

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

  const currentStreak = 5;
  const todayChallenge = 'Прочитай 10 страниц любимой книги 📖';
  const dailyFact = getDailyFact();
  
  const moodOptions = ['😊', '😄', '🥳', '😎', '🤔', '😔', '😢', '😡'];

  // Функции для работы с играми
  const handleAddGame = () => {
    if (!newGameData.name) return;
    const newGame: Game = {
      id: Date.now().toString(),
      ...newGameData,
    };
    setGames([...games, newGame]);
    setNewGameData({ name: '', type: 'video', favorite: false });
    setNewGameDialog(false);
  };

  const handleEditGame = (game: Game) => {
    setSelectedGame(game);
    setNewGameData({ name: game.name, type: game.type, favorite: game.favorite });
    setEditGameDialog(true);
  };

  const handleUpdateGame = () => {
    if (!selectedGame || !newGameData.name) return;
    setGames(games.map(g => g.id === selectedGame.id ? { ...selectedGame, ...newGameData } : g));
    setSelectedGame(null);
    setNewGameData({ name: '', type: 'video', favorite: false });
    setEditGameDialog(false);
  };

  const handleDeleteGame = (id: string) => {
    if (confirm('Удалить эту игру?')) {
      setGames(games.filter(g => g.id !== id));
    }
  };

  // Функции для работы с книгами
  const handleAddBook = () => {
    if (!newBookData.title) return;
    const newBook: Book = {
      id: Date.now().toString(),
      ...newBookData,
    };
    setBooks([...books, newBook]);
    setNewBookData({ title: '', author: '', status: 'planned', rating: undefined });
    setNewBookDialog(false);
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setNewBookData({ title: book.title, author: book.author, status: book.status, rating: book.rating });
    setEditBookDialog(true);
  };

  const handleUpdateBook = () => {
    if (!selectedBook || !newBookData.title) return;
    setBooks(books.map(b => b.id === selectedBook.id ? { ...selectedBook, ...newBookData } : b));
    setSelectedBook(null);
    setNewBookData({ title: '', author: '', status: 'planned', rating: undefined });
    setEditBookDialog(false);
  };

  const handleDeleteBook = (id: string) => {
    if (confirm('Удалить эту книгу?')) {
      setBooks(books.filter(b => b.id !== id));
    }
  };

  // Функции для работы с мечтами
  const handleAddDream = () => {
    if (!newDreamData.dream) return;
    const newDream: Dream = {
      id: Date.now().toString(),
      ...newDreamData,
    };
    setDreams([...dreams, newDream]);
    setNewDreamData({ dream: '', category: 'other', priority: 'medium', notes: '' });
    setNewDreamDialog(false);
  };

  const handleEditDream = (dream: Dream) => {
    setSelectedDream(dream);
    setNewDreamData({ dream: dream.dream, category: dream.category, priority: dream.priority, notes: dream.notes || '' });
    setEditDreamDialog(true);
  };

  const handleUpdateDream = () => {
    if (!selectedDream || !newDreamData.dream) return;
    setDreams(dreams.map(d => d.id === selectedDream.id ? { ...selectedDream, ...newDreamData } : d));
    setSelectedDream(null);
    setNewDreamData({ dream: '', category: 'other', priority: 'medium', notes: '' });
    setEditDreamDialog(false);
  };

  const handleDeleteDream = (id: string) => {
    if (confirm('Удалить эту мечту?')) {
      setDreams(dreams.filter(d => d.id !== id));
    }
  };

  return (
    <Tabs defaultValue="home" className="space-y-6">
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="home" className="gap-2">
          <Icon name="Home" size={16} />
          Главная
        </TabsTrigger>
        <TabsTrigger value="diary" className="gap-2">
          <Icon name="Heart" size={16} />
          Дневник
        </TabsTrigger>
        <TabsTrigger value="achievements" className="gap-2">
          <Icon name="Award" size={16} />
          Достижения
        </TabsTrigger>
        <TabsTrigger value="shop" className="gap-2">
          <Icon name="ShoppingCart" size={16} />
          Магазин
        </TabsTrigger>
        <TabsTrigger value="money" className="gap-2">
          <Icon name="Wallet" size={16} />
          Копилка
        </TabsTrigger>
      </TabsList>

      <TabsContent value="home" className="space-y-6">
      {/* Приветственная карточка с настроением и стриком */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Настроение дня */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-3">{selectedMood}</div>
              <h3 className="font-bold text-lg mb-2">Моё настроение</h3>
              <p className="text-sm text-gray-600">Сегодня</p>
              <Dialog open={moodDialog} onOpenChange={setMoodDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="mt-3" variant="outline">
                    Изменить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Как твоё настроение?</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood}
                        onClick={() => {
                          setSelectedMood(mood);
                          setMoodDialog(false);
                        }}
                        className="text-6xl hover:scale-125 transition-transform p-4 rounded-lg hover:bg-gray-100"
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Стрик */}
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-3">🔥</div>
              <h3 className="font-bold text-lg mb-2">Серия</h3>
              <div className="text-4xl font-bold text-orange-600 mb-1">{currentStreak}</div>
              <p className="text-sm text-gray-600">дней подряд</p>
            </div>
          </CardContent>
        </Card>

        {/* Копилка-превью */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-3">🪙</div>
              <h3 className="font-bold text-lg mb-2">Копилка</h3>
              <div className="text-4xl font-bold text-green-600 mb-1">{piggyBank}</div>
              <p className="text-sm text-gray-600">монет</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Задание дня */}
      <Card className="bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 border-2 border-purple-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🎯</div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2">Задание дня</h3>
              <p className="text-lg mb-4">{todayChallenge}</p>
              {challengeCompleted ? (
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <Icon name="CheckCircle2" size={24} />
                  Отлично! Задание выполнено! 🎉
                </div>
              ) : (
                <Button 
                  onClick={() => setChallengeCompleted(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Icon name="Check" className="mr-2" size={16} />
                  Выполнено!
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Интересный факт */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{dailyFact.emoji}</div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2">Интересный факт дня</h3>
              <p className="text-lg">{dailyFact.text}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <Input 
                      value={newGameData.name}
                      onChange={(e) => setNewGameData({...newGameData, name: e.target.value})}
                      placeholder="Например: Minecraft" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Тип игры</label>
                    <select 
                      value={newGameData.type}
                      onChange={(e) => setNewGameData({...newGameData, type: e.target.value as any})}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="video">Видеоигра</option>
                      <option value="board">Настольная игра</option>
                      <option value="outdoor">Игра на улице</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="favorite" 
                      checked={newGameData.favorite}
                      onChange={(e) => setNewGameData({...newGameData, favorite: e.target.checked})}
                      className="w-4 h-4" 
                    />
                    <label htmlFor="favorite" className="text-sm">Любимая игра</label>
                  </div>
                  <Button onClick={handleAddGame} className="w-full">Сохранить</Button>
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
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEditGame(game)}>
                    <Icon name="Edit" size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteGame(game.id)}>
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Диалог редактирования игры */}
      <Dialog open={editGameDialog} onOpenChange={setEditGameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать игру</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Название игры</label>
              <Input 
                value={newGameData.name}
                onChange={(e) => setNewGameData({...newGameData, name: e.target.value})}
                placeholder="Например: Minecraft" 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Тип игры</label>
              <select 
                value={newGameData.type}
                onChange={(e) => setNewGameData({...newGameData, type: e.target.value as any})}
                className="w-full border rounded-md p-2"
              >
                <option value="video">Видеоигра</option>
                <option value="board">Настольная игра</option>
                <option value="outdoor">Игра на улице</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="edit-favorite" 
                checked={newGameData.favorite}
                onChange={(e) => setNewGameData({...newGameData, favorite: e.target.checked})}
                className="w-4 h-4" 
              />
              <label htmlFor="edit-favorite" className="text-sm">Любимая игра</label>
            </div>
            <Button onClick={handleUpdateGame} className="w-full">Сохранить изменения</Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    <Input 
                      placeholder="Например: Гарри Поттер"
                      value={newBookData.title}
                      onChange={(e) => setNewBookData({ ...newBookData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Автор</label>
                    <Input 
                      placeholder="Например: Дж.К. Роулинг"
                      value={newBookData.author}
                      onChange={(e) => setNewBookData({ ...newBookData, author: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Статус</label>
                    <select 
                      className="w-full border rounded-md p-2"
                      value={newBookData.status}
                      onChange={(e) => setNewBookData({ ...newBookData, status: e.target.value as 'planned' | 'reading' | 'completed' })}
                    >
                      <option value="planned">Запланировано</option>
                      <option value="reading">Читает сейчас</option>
                      <option value="completed">Прочитано</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Оценка (1-5)</label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="5" 
                      placeholder="5"
                      value={newBookData.rating || ''}
                      onChange={(e) => setNewBookData({ ...newBookData, rating: parseInt(e.target.value) || undefined })}
                    />
                  </div>
                  <Button onClick={handleAddBook} className="w-full">Сохранить</Button>
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
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleEditBook(book)}>
                  <Icon name="Edit" size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteBook(book.id)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Edit Book Dialog */}
      <Dialog open={editBookDialog} onOpenChange={setEditBookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать книгу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                id="edit-book-title"
                value={selectedBook?.title || ''}
                onChange={(e) => setSelectedBook(selectedBook ? { ...selectedBook, title: e.target.value } : null)}
                className="w-full"
              />
              <label htmlFor="edit-book-title" className="text-sm">Название книги</label>
            </div>
            <div>
              <Input
                id="edit-book-author"
                value={selectedBook?.author || ''}
                onChange={(e) => setSelectedBook(selectedBook ? { ...selectedBook, author: e.target.value } : null)}
                className="w-full"
              />
              <label htmlFor="edit-book-author" className="text-sm">Автор</label>
            </div>
            <div>
              <select
                id="edit-book-status"
                value={selectedBook?.status || 'planned'}
                onChange={(e) => setSelectedBook(selectedBook ? { ...selectedBook, status: e.target.value as 'planned' | 'reading' | 'completed' } : null)}
                className="w-full border rounded-md p-2"
              >
                <option value="planned">Запланировано</option>
                <option value="reading">Читает сейчас</option>
                <option value="completed">Прочитано</option>
              </select>
              <label htmlFor="edit-book-status" className="text-sm">Статус</label>
            </div>
            <div>
              <Input
                id="edit-book-rating"
                type="number"
                min="1"
                max="5"
                value={selectedBook?.rating || ''}
                onChange={(e) => setSelectedBook(selectedBook ? { ...selectedBook, rating: parseInt(e.target.value) || undefined } : null)}
                className="w-full"
              />
              <label htmlFor="edit-book-rating" className="text-sm">Оценка (1-5)</label>
            </div>
            <Button onClick={handleUpdateBook} className="w-full">Сохранить изменения</Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    <Input 
                      placeholder="Например: Стать космонавтом"
                      value={newDreamData.dream}
                      onChange={(e) => setNewDreamData({ ...newDreamData, dream: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Категория</label>
                    <select 
                      className="w-full border rounded-md p-2"
                      value={newDreamData.category}
                      onChange={(e) => setNewDreamData({ ...newDreamData, category: e.target.value as 'career' | 'travel' | 'achievement' | 'other' })}
                    >
                      <option value="career">Карьера</option>
                      <option value="travel">Путешествия</option>
                      <option value="achievement">Достижение</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Приоритет</label>
                    <select 
                      className="w-full border rounded-md p-2"
                      value={newDreamData.priority}
                      onChange={(e) => setNewDreamData({ ...newDreamData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    >
                      <option value="high">Высокий</option>
                      <option value="medium">Средний</option>
                      <option value="low">Низкий</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Заметки</label>
                    <Textarea 
                      placeholder="Дополнительная информация"
                      value={newDreamData.notes}
                      onChange={(e) => setNewDreamData({ ...newDreamData, notes: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddDream} className="w-full">Сохранить</Button>
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
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleEditDream(dream)}>
                  <Icon name="Edit" size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteDream(dream.id)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Edit Dream Dialog */}
      <Dialog open={editDreamDialog} onOpenChange={setEditDreamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать мечту</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                id="edit-dream-text"
                value={selectedDream?.dream || ''}
                onChange={(e) => setSelectedDream(selectedDream ? { ...selectedDream, dream: e.target.value } : null)}
                className="w-full"
              />
              <label htmlFor="edit-dream-text" className="text-sm">Мечта</label>
            </div>
            <div>
              <select
                id="edit-dream-category"
                value={selectedDream?.category || 'other'}
                onChange={(e) => setSelectedDream(selectedDream ? { ...selectedDream, category: e.target.value as 'career' | 'travel' | 'achievement' | 'other' } : null)}
                className="w-full border rounded-md p-2"
              >
                <option value="career">Карьера</option>
                <option value="travel">Путешествия</option>
                <option value="achievement">Достижение</option>
                <option value="other">Другое</option>
              </select>
              <label htmlFor="edit-dream-category" className="text-sm">Категория</label>
            </div>
            <div>
              <select
                id="edit-dream-priority"
                value={selectedDream?.priority || 'medium'}
                onChange={(e) => setSelectedDream(selectedDream ? { ...selectedDream, priority: e.target.value as 'high' | 'medium' | 'low' } : null)}
                className="w-full border rounded-md p-2"
              >
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
              <label htmlFor="edit-dream-priority" className="text-sm">Приоритет</label>
            </div>
            <div>
              <Textarea
                id="edit-dream-notes"
                value={selectedDream?.notes || ''}
                onChange={(e) => setSelectedDream(selectedDream ? { ...selectedDream, notes: e.target.value } : null)}
                className="w-full"
              />
              <label htmlFor="edit-dream-notes" className="text-sm">Заметки</label>
            </div>
            <Button onClick={handleUpdateDream} className="w-full">Сохранить изменения</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Копилка */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-4xl">🪙</span>
            <div>
              <div className="text-2xl font-bold">Моя копилка</div>
              <div className="text-sm font-normal text-gray-600">Накоплено монет</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl mb-4 animate-bounce-slow">
              <span className="text-6xl">🏦</span>
            </div>
            <div className="text-6xl font-bold text-orange-600 mb-2">
              {piggyBank}
            </div>
            <p className="text-lg text-gray-700 mb-6">
              {piggyBank === 0 && 'Пока пусто, но скоро здесь будут твои заслуженные монетки! 🌟'}
              {piggyBank > 0 && piggyBank < 50 && 'Отличное начало! Продолжай в том же духе! 💪'}
              {piggyBank >= 50 && piggyBank < 100 && 'Ого! Копилка растёт! Ты молодец! 🎉'}
              {piggyBank >= 100 && 'Вау! Настоящее богатство! Ты супер! 🏆'}
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-sm text-gray-600">Цель</div>
                <div className="text-xl font-bold text-blue-600">100</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-sm text-gray-600">Прогресс</div>
                <div className="text-xl font-bold text-green-600">{Math.min(100, Math.round((piggyBank / 100) * 100))}%</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border-2 border-dashed border-yellow-300">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Icon name="Info" size={16} className="text-blue-500" />
                <p>Монетки можно заработать за выполнение заданий и хорошее поведение! Спроси у родителей 😊</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="diary">
        <MoodDiary childId={child.id} />
      </TabsContent>

      <TabsContent value="achievements">
        <AchievementsBadges childId={child.id} />
      </TabsContent>

      <TabsContent value="shop">
        <RewardsShop childId={child.id} balance={piggyBank} />
      </TabsContent>

      <TabsContent value="money" className="space-y-6">
        <RealMoneyPiggyBank childId={child.id} />
      </TabsContent>
    </Tabs>
  );
}