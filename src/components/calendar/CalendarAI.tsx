import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const CALENDAR_AI_URL = 'https://functions.poehali.dev/69dba587-f145-4cdc-bba4-3c78ae65fcb5';

interface AIEventRecommendation {
  title: string;
  category: string;
  description: string;
  date?: string;
  time?: string;
}

interface CalendarAIProps {
  onAddEvent: (event: AIEventRecommendation) => void;
}

const EVENT_CATEGORIES = [
  { value: 'leisure', label: 'Досуг', icon: 'PartyPopper' },
  { value: 'family', label: 'Семейное', icon: 'Heart' },
  { value: 'health', label: 'Здоровье', icon: 'HeartPulse' },
  { value: 'education', label: 'Образование', icon: 'GraduationCap' },
  { value: 'work', label: 'Работа', icon: 'Briefcase' },
  { value: 'personal', label: 'Личное', icon: 'User' },
];

export function CalendarAI({ onAddEvent }: CalendarAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIEventRecommendation[]>([]);
  const [city, setCity] = useState('Москва');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['leisure']);
  const [period, setPeriod] = useState<string>('week');

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(CALENDAR_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recommend',
          city,
          interests: selectedCategories,
          period,
        })
      });

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      alert('Ошибка при получении рекомендаций');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecommendation = (rec: AIEventRecommendation) => {
    onAddEvent(rec);
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        size="sm"
        className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        <Icon name="Sparkles" size={16} />
        ИИ-помощник
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Icon name="Sparkles" className="text-purple-600" />
              ИИ-помощник мероприятий
            </DialogTitle>
            <DialogDescription>
              Получите персональные рекомендации для семейного календаря
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">Город</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Введите город"
                className="max-w-md"
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Категории мероприятий</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {EVENT_CATEGORIES.map(cat => (
                  <Button
                    key={cat.value}
                    variant={selectedCategories.includes(cat.value) ? 'default' : 'outline'}
                    onClick={() => toggleCategory(cat.value)}
                    className="justify-start gap-2 h-auto py-3"
                  >
                    <Icon name={cat.icon as any} size={18} />
                    <span>{cat.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Период</Label>
              <div className="flex gap-2">
                {['week', 'month'].map(p => (
                  <Button
                    key={p}
                    variant={period === p ? 'default' : 'outline'}
                    onClick={() => setPeriod(p)}
                  >
                    {p === 'week' ? 'Неделя' : 'Месяц'}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleGetRecommendations}
              disabled={loading || selectedCategories.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
              size="lg"
            >
              <Icon name="Sparkles" size={20} />
              {loading ? 'Ищу мероприятия...' : 'Найти мероприятия'}
            </Button>

            {recommendations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Icon name="Calendar" />
                  Рекомендации ({recommendations.length})
                </h3>
                <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
                  {recommendations.map((rec, idx) => (
                    <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-2">
                            <Badge variant="secondary" className="mt-1">
                              {rec.category}
                            </Badge>
                            <h4 className="font-semibold text-lg">{rec.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                          {rec.date && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Icon name="Calendar" size={14} />
                              {rec.date}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleAddRecommendation(rec)}
                          size="sm"
                          className="gap-2"
                        >
                          <Icon name="Plus" size={16} />
                          Добавить
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
