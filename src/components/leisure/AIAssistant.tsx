import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const LEISURE_AI_URL = 'https://functions.poehali.dev/69dba587-f145-4cdc-bba4-3c78ae65fcb5';

interface AIRecommendation {
  title: string;
  category: string;
  description: string;
  price_range?: string;
  age_suitable?: string;
  address?: string;
}

interface AIAssistantProps {
  onAddPlace: (place: AIRecommendation) => void;
}

const INTERESTS = [
  { value: 'культура', label: 'Культура', icon: 'Theater' },
  { value: 'развлечения', label: 'Развлечения', icon: 'Gamepad2' },
  { value: 'спорт', label: 'Спорт', icon: 'Dumbbell' },
  { value: 'еда', label: 'Рестораны', icon: 'UtensilsCrossed' },
  { value: 'природа', label: 'Природа', icon: 'TreePine' },
  { value: 'образование', label: 'Образование', icon: 'GraduationCap' },
];

const AGE_GROUPS = [
  'младенцы 0-2 года',
  'дети 3-6 лет',
  'дети 7-12 лет',
  'подростки 13-17 лет',
  'взрослые',
];

export function AIAssistant({ onAddPlace }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [city, setCity] = useState('Москва');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['культура']);
  const [selectedAges, setSelectedAges] = useState<string[]>(['дети 7-12 лет']);
  const [budget, setBudget] = useState('средний');

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(LEISURE_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recommend',
          city,
          interests: selectedInterests,
          age_groups: selectedAges,
          budget
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

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleAge = (age: string) => {
    setSelectedAges(prev =>
      prev.includes(age)
        ? prev.filter(a => a !== age)
        : [...prev, age]
    );
  };

  const getCategoryIcon = (category: string): string => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('ресторан') || lowerCategory.includes('еда')) return 'UtensilsCrossed';
    if (lowerCategory.includes('музей') || lowerCategory.includes('культура')) return 'Theater';
    if (lowerCategory.includes('парк') || lowerCategory.includes('природа')) return 'TreePine';
    if (lowerCategory.includes('развлечение')) return 'Gamepad2';
    if (lowerCategory.includes('спорт')) return 'Dumbbell';
    return 'MapPin';
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2" variant="outline">
        <Icon name="Sparkles" size={20} />
        ИИ-помощник
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Sparkles" size={24} className="text-purple-600" />
              ИИ-помощник для поиска мест
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Фильтры */}
            <div className="space-y-4">
              <div>
                <Label>Город</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Москва"
                />
              </div>

              <div>
                <Label>Интересы</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {INTERESTS.map((interest) => (
                    <Badge
                      key={interest.value}
                      variant={selectedInterests.includes(interest.value) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleInterest(interest.value)}
                    >
                      <Icon name={interest.icon} size={14} className="mr-1" />
                      {interest.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Возраст</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AGE_GROUPS.map((age) => (
                    <Badge
                      key={age}
                      variant={selectedAges.includes(age) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleAge(age)}
                    >
                      {age}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Бюджет</Label>
                <div className="flex gap-2 mt-2">
                  {['низкий', 'средний', 'высокий', 'не ограничен'].map((b) => (
                    <Badge
                      key={b}
                      variant={budget === b ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setBudget(b)}
                    >
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleGetRecommendations} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Ищу места...
                  </>
                ) : (
                  <>
                    <Icon name="Search" size={16} className="mr-2" />
                    Найти места
                  </>
                )}
              </Button>
            </div>

            {/* Рекомендации */}
            {recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Рекомендации</h3>
                <div className="grid grid-cols-1 gap-3">
                  {recommendations.map((rec, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name={getCategoryIcon(rec.category)} size={18} className="text-purple-600" />
                            <h4 className="font-semibold">{rec.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {rec.price_range && (
                              <span className="flex items-center gap-1">
                                <Icon name="Wallet" size={12} />
                                {rec.price_range}
                              </span>
                            )}
                            {rec.age_suitable && (
                              <span className="flex items-center gap-1">
                                <Icon name="Users" size={12} />
                                {rec.age_suitable}
                              </span>
                            )}
                            {rec.address && (
                              <span className="flex items-center gap-1">
                                <Icon name="MapPin" size={12} />
                                {rec.address}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            onAddPlace(rec);
                            setIsOpen(false);
                          }}
                        >
                          <Icon name="Plus" size={14} className="mr-1" />
                          Добавить
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-12">
                <Icon name="Loader2" size={32} className="animate-spin text-purple-600" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
