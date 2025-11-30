import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Culture {
  language: string;
  religion: string;
  crafts: string[];
}

interface NationalityCultureProps {
  culture: Culture;
}

export function NationalityCulture({ culture }: NationalityCultureProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Globe" size={24} className="text-blue-600" />
          Культура и быт
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Icon name="MessageCircle" size={18} className="text-blue-600" />
              Язык
            </h3>
            <p className="text-gray-700">{culture.language}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Icon name="Heart" size={18} className="text-red-600" />
              Религия
            </h3>
            <p className="text-gray-700">{culture.religion}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Palette" size={18} className="text-purple-600" />
              Народные промыслы и ремёсла
            </h3>
            <div className="flex flex-wrap gap-2">
              {culture.crafts.map((craft, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {craft}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
