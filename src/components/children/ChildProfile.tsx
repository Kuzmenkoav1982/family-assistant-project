import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { MoodDiary } from './MoodDiary';
import { AchievementsBadges } from './AchievementsBadges';
import { RewardsShop } from './RewardsShop';
import { RealMoneyPiggyBank } from './RealMoneyPiggyBank';
import { ChildCalendar } from './ChildCalendar';
import { HomeTabContent } from './profile-tabs/HomeTabContent';
import { Game } from './profile-tabs/GamesSection';
import { Book } from './profile-tabs/BooksSection';
import { Dream } from './profile-tabs/DreamsSection';
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

  const currentStreak = 5;
  const todayChallenge = 'Прочитай 10 страниц любимой книги 📖';
  const dailyFact = getDailyFact();
  
  const moodOptions = ['😊', '😄', '🥳', '😎', '🤔', '😔', '😢', '😡'];

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
        <TabsTrigger value="calendar" className="gap-2">
          <Icon name="Calendar" size={16} />
          Календарь
        </TabsTrigger>
      </TabsList>

      <TabsContent value="home">
        <HomeTabContent
          selectedMood={selectedMood}
          currentStreak={currentStreak}
          piggyBank={piggyBank}
          moodOptions={moodOptions}
          moodDialog={moodDialog}
          todayChallenge={todayChallenge}
          challengeCompleted={challengeCompleted}
          dailyFact={dailyFact}
          games={games}
          books={books}
          dreams={dreams}
          newGameDialog={newGameDialog}
          editGameDialog={editGameDialog}
          newGameData={newGameData}
          newBookDialog={newBookDialog}
          editBookDialog={editBookDialog}
          selectedBook={selectedBook}
          newBookData={newBookData}
          newDreamDialog={newDreamDialog}
          editDreamDialog={editDreamDialog}
          selectedDream={selectedDream}
          newDreamData={newDreamData}
          onMoodDialogChange={setMoodDialog}
          onMoodChange={setSelectedMood}
          onChallengeComplete={() => setChallengeCompleted(true)}
          onNewGameDialogChange={setNewGameDialog}
          onEditGameDialogChange={setEditGameDialog}
          onNewGameDataChange={setNewGameData}
          onAddGame={handleAddGame}
          onEditGame={handleEditGame}
          onUpdateGame={handleUpdateGame}
          onDeleteGame={handleDeleteGame}
          onNewBookDialogChange={setNewBookDialog}
          onEditBookDialogChange={setEditBookDialog}
          onSelectedBookChange={setSelectedBook}
          onNewBookDataChange={setNewBookData}
          onAddBook={handleAddBook}
          onEditBook={handleEditBook}
          onUpdateBook={handleUpdateBook}
          onDeleteBook={handleDeleteBook}
          onNewDreamDialogChange={setNewDreamDialog}
          onEditDreamDialogChange={setEditDreamDialog}
          onSelectedDreamChange={setSelectedDream}
          onNewDreamDataChange={setNewDreamData}
          onAddDream={handleAddDream}
          onEditDream={handleEditDream}
          onUpdateDream={handleUpdateDream}
          onDeleteDream={handleDeleteDream}
        />
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

      <TabsContent value="calendar" className="space-y-6">
        <ChildCalendar child={child} />
      </TabsContent>
    </Tabs>
  );
}