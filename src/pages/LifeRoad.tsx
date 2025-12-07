import { useState } from 'react';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { LifeRoadHeader } from '@/components/life-road/LifeRoadHeader';
import { LifeRoadFilters } from '@/components/life-road/LifeRoadFilters';
import { LifeRoadEventsList } from '@/components/life-road/LifeRoadEventsList';
import { LifeRoadAddDialog } from '@/components/life-road/LifeRoadAddDialog';

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
  const { members, loading } = useFamilyMembersContext();
  const [events, setEvents] = useState<LifeEvent[]>(
    JSON.parse(localStorage.getItem('lifeRoadEvents') || JSON.stringify(INITIAL_EVENTS))
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
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
        <LifeRoadHeader
          isInstructionOpen={isInstructionOpen}
          setIsInstructionOpen={setIsInstructionOpen}
        />

        <LifeRoadFilters
          events={events}
          filteredEvents={filteredEvents}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          years={years}
          categoryConfig={categoryConfig}
          setShowAddDialog={setShowAddDialog}
        />

        <LifeRoadEventsList
          filteredEvents={filteredEvents}
          categoryConfig={categoryConfig}
          importanceConfig={importanceConfig}
          handleDeleteEvent={handleDeleteEvent}
          getEventAge={getEventAge}
        />

        <LifeRoadAddDialog
          showAddDialog={showAddDialog}
          setShowAddDialog={setShowAddDialog}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          handleAddEvent={handleAddEvent}
          categoryConfig={categoryConfig}
          importanceConfig={importanceConfig}
        />
      </div>
    </div>
  );
}
