import { Card, CardContent } from '@/components/ui/card';

interface DailyFact {
  emoji: string;
  text: string;
}

interface DailyFactCardProps {
  dailyFact: DailyFact;
}

export function DailyFactCard({ dailyFact }: DailyFactCardProps) {
  return (
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
  );
}
