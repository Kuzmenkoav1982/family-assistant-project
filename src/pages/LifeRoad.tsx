import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { RoadVisualization } from '@/components/RoadVisualization';

interface LifeEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'birth' | 'wedding' | 'education' | 'career' | 'achievement' | 'travel' | 'family' | 'health' | 'other';
  importance: 'low' | 'medium' | 'high' | 'critical';
  participants: string[];
  photos?: string[];
  createdBy: string;
  createdAt: string;
}

const INITIAL_EVENTS: LifeEvent[] = [
  {
    id: '1',
    date: '2010-05-15',
    title: 'Свадьба',
    description: 'Самый счастливый день - начало нашей семьи',
    category: 'wedding',
    importance: 'critical',
    participants: ['mom', 'dad'],
    createdBy: 'mom',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    date: '2015-08-20',
    title: 'Рождение первого ребёнка',
    description: 'Появление на свет нашего чуда',
    category: 'birth',
    importance: 'critical',
    participants: ['mom', 'dad', 'child1'],
    createdBy: 'mom',
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    date: '2020-09-01',
    title: 'Первый класс',
    description: 'Начало школьной жизни',
    category: 'education',
    importance: 'high',
    participants: ['child1'],
    createdBy: 'dad',
    createdAt: '2024-01-01'
  }
];

export default function LifeRoad() {
  const navigate = useNavigate();
  const { members, loading } = useFamilyMembers();
  const [events, setEvents] = useState<LifeEvent[]>(
    JSON.parse(localStorage.getItem('lifeRoadEvents') || JSON.stringify(INITIAL_EVENTS))
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: '',
    title: '',
    description: '',
    category: 'other' as LifeEvent['category'],
    importance: 'medium' as LifeEvent['importance'],
    participants: [] as string[]
  });

  const categoryConfig = {
    birth: { label: 'Рождение', icon: 'Baby', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    wedding: { label: 'Свадьба', icon: 'Heart', color: 'bg-red-100 text-red-700 border-red-300' },
    education: { label: 'Образование', icon: 'GraduationCap', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    career: { label: 'Карьера', icon: 'Briefcase', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    achievement: { label: 'Достижение', icon: 'Trophy', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    travel: { label: 'Путешествие', icon: 'Plane', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    family: { label: 'Семейное', icon: 'Users', color: 'bg-green-100 text-green-700 border-green-300' },
    health: { label: 'Здоровье', icon: 'Heart', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    other: { label: 'Другое', icon: 'Star', color: 'bg-gray-100 text-gray-700 border-gray-300' }
  };

  const importanceConfig = {
    low: { label: 'Обычное', color: 'bg-gray-100 text-gray-600' },
    medium: { label: 'Важное', color: 'bg-blue-100 text-blue-600' },
    high: { label: 'Очень важное', color: 'bg-orange-100 text-orange-600' },
    critical: { label: 'Ключевое', color: 'bg-red-100 text-red-600' }
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const filteredEvents = sortedEvents.filter(event => {
    const matchCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchYear = selectedYear === 'all' || new Date(event.date).getFullYear().toString() === selectedYear;
    return matchCategory && matchYear;
  });

  const years = Array.from(new Set(events.map(e => new Date(e.date).getFullYear()))).sort();

  const handleAddEvent = () => {
    if (!newEvent.date || !newEvent.title) return;

    const event: LifeEvent = {
      id: Date.now().toString(),
      ...newEvent,
      createdBy: (members && members[0]?.id) || 'unknown',
      createdAt: new Date().toISOString()
    };

    const updatedEvents = [...events, event];
    setEvents(updatedEvents);
    localStorage.setItem('lifeRoadEvents', JSON.stringify(updatedEvents));
    
    setShowAddDialog(false);
    setNewEvent({
      date: '',
      title: '',
      description: '',
      category: 'other',
      importance: 'medium',
      participants: []
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(e => e.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem('lifeRoadEvents', JSON.stringify(updatedEvents));
  };

  const getEventAge = (date: string) => {
    const years = new Date().getFullYear() - new Date(date).getFullYear();
    return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'} назад`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl">
                <Icon name="MapPin" size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Дорога жизни</h1>
                <p className="text-gray-600">История нашей семьи в событиях</p>
              </div>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Icon name="Plus" size={20} />
                  Добавить событие
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Новое событие</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Дата события *</Label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Название *</Label>
                    <Input
                      placeholder="Например: Окончание школы"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Описание</Label>
                    <Textarea
                      placeholder="Расскажите подробнее о событии..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Категория</Label>
                      <Select
                        value={newEvent.category}
                        onValueChange={(value) => setNewEvent({ ...newEvent, category: value as LifeEvent['category'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <Icon name={config.icon as any} size={16} />
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Важность</Label>
                      <Select
                        value={newEvent.importance}
                        onValueChange={(value) => setNewEvent({ ...newEvent, importance: value as LifeEvent['importance'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(importanceConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleAddEvent} className="w-full" disabled={!newEvent.date || !newEvent.title}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить событие
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon name="Calendar" size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                  <p className="text-sm text-gray-600">Всего событий</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Icon name="Star" size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => e.importance === 'critical').length}
                  </p>
                  <p className="text-sm text-gray-600">Ключевых</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Icon name="Clock" size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{years.length}</p>
                  <p className="text-sm text-gray-600">Лет истории</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Icon name="TrendingUp" size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => new Date(e.date).getFullYear() === new Date().getFullYear()).length}
                  </p>
                  <p className="text-sm text-gray-600">В этом году</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Визуализация дороги */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="MapPin" size={20} />
              Визуализация дороги жизни
            </CardTitle>
            <CardDescription>
              Водитель: {familyMembers.find(m => m.role?.toLowerCase().includes('владел') || m.role?.toLowerCase().includes('папа'))?.name || familyMembers[0]?.name || 'Семья'} 
              {familyMembers.length > 1 && ` | Пассажиры: ${familyMembers.slice(1).map(m => m.name).join(', ')}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoadVisualization 
              events={sortedEvents}
              familyMembers={familyMembers}
              driverName={familyMembers.find(m => m.role?.toLowerCase().includes('владел') || m.role?.toLowerCase().includes('папа'))?.name || familyMembers[0]?.name || 'Семья'}
            />
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Категория</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                Все категории
              </Button>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="gap-2"
                >
                  <Icon name={config.icon as any} size={16} />
                  {config.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Год</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedYear === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedYear('all')}
              >
                Все годы
              </Button>
              {years.map(year => (
                <Button
                  key={year}
                  variant={selectedYear === year.toString() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedYear(year.toString())}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400"></div>

          <div className="space-y-8">
            {filteredEvents.map((event, index) => {
              const config = categoryConfig[event.category];
              const importanceStyle = importanceConfig[event.importance];

              return (
                <div key={event.id} className="relative pl-20">
                  <div className={`absolute left-4 w-8 h-8 rounded-full border-4 border-white ${config.color} flex items-center justify-center shadow-lg z-10`}>
                    <Icon name={config.icon as any} size={16} />
                  </div>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={config.color}>{config.label}</Badge>
                            <Badge className={importanceStyle.color}>{importanceStyle.label}</Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(event.date).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription className="mt-2">{event.description}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Icon name="Clock" size={16} />
                          {getEventAge(event.date)}
                        </div>
                        {event.participants.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Icon name="Users" size={16} />
                            {event.participants.length} участников
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Icon name="Calendar" size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg text-gray-600">События не найдены</p>
                <p className="text-sm text-gray-500 mt-2">Попробуйте изменить фильтры или добавьте первое событие</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}