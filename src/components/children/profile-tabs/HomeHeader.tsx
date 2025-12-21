import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface HomeHeaderProps {
  selectedMood: string;
  currentStreak: number;
  piggyBank: number;
  moodOptions: string[];
  moodDialog: boolean;
  onMoodDialogChange: (open: boolean) => void;
  onMoodChange: (mood: string) => void;
}

export function HomeHeader({
  selectedMood,
  currentStreak,
  piggyBank,
  moodOptions,
  moodDialog,
  onMoodDialogChange,
  onMoodChange,
}: HomeHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-6xl mb-3">{selectedMood}</div>
            <h3 className="font-bold text-lg mb-2">Моё настроение</h3>
            <p className="text-sm text-gray-600">Сегодня</p>
            <Dialog open={moodDialog} onOpenChange={onMoodDialogChange}>
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
                        onMoodChange(mood);
                        onMoodDialogChange(false);
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
  );
}
