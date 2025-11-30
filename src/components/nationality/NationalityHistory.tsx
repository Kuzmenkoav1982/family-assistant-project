import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface NationalityHistoryProps {
  history: string;
}

export function NationalityHistory({ history }: NationalityHistoryProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="BookOpen" size={24} className="text-amber-600" />
          История народа
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 leading-relaxed">{history}</p>
      </CardContent>
    </Card>
  );
}
