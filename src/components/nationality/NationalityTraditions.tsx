import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Tradition {
  title: string;
  description: string;
  icon: string;
}

interface Ritual {
  title: string;
  description: string;
  season?: string;
}

interface NationalityTraditionsProps {
  traditions: Tradition[];
  rituals: Ritual[];
}

export function NationalityTraditions({ traditions, rituals }: NationalityTraditionsProps) {
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Sparkles" size={24} className="text-purple-600" />
            Традиции и праздники
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {traditions.map((tradition, index) => (
              <div key={index} className="flex gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-4xl">{tradition.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{tradition.title}</h3>
                  <p className="text-gray-700">{tradition.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Flame" size={24} className="text-orange-600" />
            Обряды и ритуалы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {rituals.map((ritual, index) => (
              <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{ritual.title}</h3>
                  {ritual.season && (
                    <Badge variant="outline" className="bg-white">
                      {ritual.season}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-700 text-sm">{ritual.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
