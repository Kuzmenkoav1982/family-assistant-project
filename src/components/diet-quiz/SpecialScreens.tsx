import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface GeneratingScreenProps {
  durationDays: string;
}

export function GeneratingScreen({ durationDays }: GeneratingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto p-6">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
          <Icon name="Brain" size={36} className="text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">ИИ составляет план</h2>
        <p className="text-muted-foreground text-sm mb-4">Анализирую ваши данные и подбираю блюда на {durationDays} дней...</p>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-3 h-3 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6">Это может занять до 2 минут</p>
      </div>
    </div>
  );
}

interface RawTextScreenProps {
  rawText: string;
  onBack: () => void;
}

export function RawTextScreen({ rawText, onBack }: RawTextScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-5">
        <div className="flex items-center gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <h1 className="text-lg font-bold">Рекомендации ИИ</h1>
        </div>
        <Card>
          <CardContent className="p-5">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{rawText}</div>
          </CardContent>
        </Card>
        <Button className="w-full" onClick={onBack}>
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Попробовать снова
        </Button>
      </div>
    </div>
  );
}

interface ErrorScreenProps {
  error: string;
  onBack: () => void;
  onRetry: () => void;
  navigate: (path: string) => void;
}

export function ErrorScreen({ error, onBack, onRetry, navigate }: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-5">
        <div className="flex items-center gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <h1 className="text-lg font-bold">Ошибка</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-5 text-center">
            <Icon name="AlertTriangle" size={40} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
        {error.includes('Недостаточно средств') ? (
          <div className="space-y-2">
            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => navigate('/wallet')}>
              <Icon name="Wallet" size={16} className="mr-2" />
              Пополнить кошелёк
            </Button>
            <Button variant="outline" className="w-full" onClick={onBack}>Назад к анкете</Button>
          </div>
        ) : (
          <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600" onClick={onRetry}>
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Попробовать снова
          </Button>
        )}
      </div>
    </div>
  );
}
