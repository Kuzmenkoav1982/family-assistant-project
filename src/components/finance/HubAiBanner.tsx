import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Props {
  onClick: () => void;
}

export default function HubAiBanner({ onClick }: Props) {
  return (
    <Card
      className="bg-gradient-to-r from-violet-600 to-purple-700 text-white border-0 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.01]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Icon name="BrainCircuit" size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">ИИ-советник</h3>
            <p className="text-violet-200 text-sm">Анализ бюджета, рекомендации по долгам и накоплениям</p>
          </div>
          <Icon name="ChevronRight" size={24} className="text-white/60" />
        </div>
      </CardContent>
    </Card>
  );
}
