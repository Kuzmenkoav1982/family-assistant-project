import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface Place {
  name: string;
  description: string;
  duration: string;
  tips: string;
}

interface DayPlan {
  day: number;
  theme: string;
  places: Place[];
}

interface Itinerary {
  title: string;
  description: string;
  days: DayPlan[];
  generalTips: string[];
  metadata?: {
    location: string;
    duration: number;
    interests: string[];
    budget: string;
  };
}

const INTERESTS_OPTIONS = [
  'Культура и искусство',
  'История',
  'Природа и пейзажи',
  'Еда и гастрономия',
  'Шопинг',
  'Ночная жизнь',
  'Архитектура',
  'Музеи',
  'Активный отдых',
  'Пляжный отдых'
];

export default function ItineraryGenerator() {
  const { toast } = useToast();

  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('3');
  const [interests, setInterests] = useState<string[]>([]);
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>('medium');
  const [customInterest, setCustomInterest] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests([...interests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const generateItinerary = async () => {
    if (!location.trim()) {
      setError('Пожалуйста, укажите место назначения');
      return;
    }

    setLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const response = await fetch('https://functions.poehali.dev/b035a0b5-d08d-40dc-b958-c2676d5f848d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location.trim(),
          duration: parseInt(duration),
          interests,
          budget
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при генерации маршрута');
      }

      const data = await response.json();
      setItinerary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Sparkles" size={24} />
                Генератор маршрутов путешествий
              </CardTitle>
              <CardDescription>
                Создайте персональный маршрут путешествия с помощью искусственного интеллекта
              </CardDescription>
            </div>

          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location">Место назначения</Label>
            <Input
              id="location"
              placeholder="Например: Париж, Токио, Барселона..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Длительность поездки (дней)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 10, 14].map(days => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} {days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ваши интересы</Label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map(interest => (
                <Badge
                  key={interest}
                  variant={interests.includes(interest) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
              {interests.filter(i => !INTERESTS_OPTIONS.includes(i)).map(interest => (
                <Badge
                  key={interest}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Добавить свой интерес..."
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomInterest()}
              />
              <Button variant="outline" onClick={addCustomInterest}>
                Добавить
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Бюджет</Label>
            <Select value={budget} onValueChange={(v) => setBudget(v as typeof budget)}>
              <SelectTrigger id="budget">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">💰 Экономный</SelectItem>
                <SelectItem value="medium">💰💰 Средний</SelectItem>
                <SelectItem value="high">💰💰💰 Неограниченный</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={generateItinerary}
            disabled={loading || !location.trim()}
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                Создаём маршрут...
              </>
            ) : (
              <>
                <Icon name="Sparkles" className="mr-2" size={20} />
                Сгенерировать маршрут
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" size={20} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {itinerary && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{itinerary.title}</CardTitle>
              <CardDescription>{itinerary.description}</CardDescription>
            </CardHeader>
          </Card>

          {itinerary.days.map((day) => (
            <Card key={day.day}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">День {day.day}</Badge>
                  {day.theme}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {day.places.map((place, idx) => (
                  <div key={idx} className="border-l-2 border-primary pl-4 py-2">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg">{place.name}</h4>
                      <Badge variant="secondary">{place.duration}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">{place.description}</p>
                    {place.tips && (
                      <div className="flex items-start gap-2 text-sm bg-muted p-2 rounded">
                        <Icon name="Lightbulb" size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{place.tips}</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {itinerary.generalTips && itinerary.generalTips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Info" size={24} />
                  Общие советы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {itinerary.generalTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Icon name="Check" size={16} className="mt-1 flex-shrink-0 text-primary" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setItinerary(null)}
            >
              <Icon name="RotateCcw" className="mr-2" size={20} />
              Создать новый маршрут
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                const text = JSON.stringify(itinerary, null, 2);
                navigator.clipboard.writeText(text);
              }}
            >
              <Icon name="Copy" className="mr-2" size={20} />
              Копировать
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}