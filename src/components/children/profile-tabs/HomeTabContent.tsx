import { HomeHeader } from './HomeHeader';
import { DailyChallengeCard } from './DailyChallengeCard';
import { DailyFactCard } from './DailyFactCard';
import { GamesSection, Game } from './GamesSection';
import { BooksSection, Book } from './BooksSection';
import { DreamsSection, Dream } from './DreamsSection';

interface HomeTabContentProps {
  selectedMood: string;
  currentStreak: number;
  piggyBank: number;
  moodOptions: string[];
  moodDialog: boolean;
  todayChallenge: string;
  challengeCompleted: boolean;
  dailyFact: { emoji: string; text: string };
  games: Game[];
  books: Book[];
  dreams: Dream[];
  newGameDialog: boolean;
  editGameDialog: boolean;
  newGameData: { name: string; type: 'video' | 'board' | 'outdoor'; favorite: boolean };
  newBookDialog: boolean;
  editBookDialog: boolean;
  selectedBook: Book | null;
  newBookData: { title: string; author: string; status: 'reading' | 'completed' | 'planned'; rating?: number };
  newDreamDialog: boolean;
  editDreamDialog: boolean;
  selectedDream: Dream | null;
  newDreamData: { dream: string; category: 'career' | 'travel' | 'achievement' | 'other'; priority: 'high' | 'medium' | 'low'; notes: string };
  onMoodDialogChange: (open: boolean) => void;
  onMoodChange: (mood: string) => void;
  onChallengeComplete: () => void;
  onNewGameDialogChange: (open: boolean) => void;
  onEditGameDialogChange: (open: boolean) => void;
  onNewGameDataChange: (data: { name: string; type: 'video' | 'board' | 'outdoor'; favorite: boolean }) => void;
  onAddGame: () => void;
  onEditGame: (game: Game) => void;
  onUpdateGame: () => void;
  onDeleteGame: (id: string) => void;
  onNewBookDialogChange: (open: boolean) => void;
  onEditBookDialogChange: (open: boolean) => void;
  onSelectedBookChange: (book: Book | null) => void;
  onNewBookDataChange: (data: { title: string; author: string; status: 'reading' | 'completed' | 'planned'; rating?: number }) => void;
  onAddBook: () => void;
  onEditBook: (book: Book) => void;
  onUpdateBook: () => void;
  onDeleteBook: (id: string) => void;
  onNewDreamDialogChange: (open: boolean) => void;
  onEditDreamDialogChange: (open: boolean) => void;
  onSelectedDreamChange: (dream: Dream | null) => void;
  onNewDreamDataChange: (data: { dream: string; category: 'career' | 'travel' | 'achievement' | 'other'; priority: 'high' | 'medium' | 'low'; notes: string }) => void;
  onAddDream: () => void;
  onEditDream: (dream: Dream) => void;
  onUpdateDream: () => void;
  onDeleteDream: (id: string) => void;
}

export function HomeTabContent(props: HomeTabContentProps) {
  return (
    <div className="space-y-6">
      <HomeHeader
        selectedMood={props.selectedMood}
        currentStreak={props.currentStreak}
        piggyBank={props.piggyBank}
        moodOptions={props.moodOptions}
        moodDialog={props.moodDialog}
        onMoodDialogChange={props.onMoodDialogChange}
        onMoodChange={props.onMoodChange}
      />

      <DailyChallengeCard
        todayChallenge={props.todayChallenge}
        challengeCompleted={props.challengeCompleted}
        onChallengeComplete={props.onChallengeComplete}
      />

      <DailyFactCard dailyFact={props.dailyFact} />

      <GamesSection
        games={props.games}
        newGameDialog={props.newGameDialog}
        editGameDialog={props.editGameDialog}
        newGameData={props.newGameData}
        onNewGameDialogChange={props.onNewGameDialogChange}
        onEditGameDialogChange={props.onEditGameDialogChange}
        onNewGameDataChange={props.onNewGameDataChange}
        onAddGame={props.onAddGame}
        onEditGame={props.onEditGame}
        onUpdateGame={props.onUpdateGame}
        onDeleteGame={props.onDeleteGame}
      />

      <BooksSection
        books={props.books}
        newBookDialog={props.newBookDialog}
        editBookDialog={props.editBookDialog}
        selectedBook={props.selectedBook}
        newBookData={props.newBookData}
        onNewBookDialogChange={props.onNewBookDialogChange}
        onEditBookDialogChange={props.onEditBookDialogChange}
        onSelectedBookChange={props.onSelectedBookChange}
        onNewBookDataChange={props.onNewBookDataChange}
        onAddBook={props.onAddBook}
        onEditBook={props.onEditBook}
        onUpdateBook={props.onUpdateBook}
        onDeleteBook={props.onDeleteBook}
      />

      <DreamsSection
        dreams={props.dreams}
        newDreamDialog={props.newDreamDialog}
        editDreamDialog={props.editDreamDialog}
        selectedDream={props.selectedDream}
        newDreamData={props.newDreamData}
        onNewDreamDialogChange={props.onNewDreamDialogChange}
        onEditDreamDialogChange={props.onEditDreamDialogChange}
        onSelectedDreamChange={props.onSelectedDreamChange}
        onNewDreamDataChange={props.onNewDreamDataChange}
        onAddDream={props.onAddDream}
        onEditDream={props.onEditDream}
        onUpdateDream={props.onUpdateDream}
        onDeleteDream={props.onDeleteDream}
      />
    </div>
  );
}
