import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface LifeEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  participants: string[];
}

interface RoadVisualizationProps {
  events: LifeEvent[];
  familyMembers: any[];
  driverName: string;
}

const categoryIcons: Record<string, string> = {
  birth: 'Baby',
  wedding: 'Heart',
  education: 'GraduationCap',
  career: 'Briefcase',
  achievement: 'Trophy',
  travel: 'Plane',
  family: 'Users',
  health: 'Heart',
  other: 'Star'
};

const importanceColors: Record<string, string> = {
  low: '#94a3b8',
  medium: '#3b82f6',
  high: '#f97316',
  critical: '#ef4444'
};

export function RoadVisualization({ events, familyMembers, driverName }: RoadVisualizationProps) {
  const sortedEvents = useMemo(() => 
    [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );

  const roadSegments = useMemo(() => {
    const now = new Date();
    const segments = [];
    
    sortedEvents.forEach((event, index) => {
      const eventDate = new Date(event.date);
      const isPast = eventDate < now;
      const progress = index / Math.max(sortedEvents.length - 1, 1);
      
      // Определяем тип дорожного знака
      let signType: 'warning' | 'info' | 'success' | 'milestone' = 'info';
      if (event.importance === 'critical') signType = 'milestone';
      else if (event.importance === 'high') signType = 'warning';
      else if (event.category === 'achievement') signType = 'success';
      
      segments.push({
        event,
        isPast,
        progress,
        signType,
        position: 20 + (progress * 60) // От 20% до 80% по вертикали
      });
    });
    
    return segments;
  }, [sortedEvents]);

  const currentEventIndex = useMemo(() => {
    const now = new Date();
    for (let i = 0; i < sortedEvents.length; i++) {
      if (new Date(sortedEvents[i].date) > now) {
        return Math.max(0, i - 1);
      }
    }
    return sortedEvents.length - 1;
  }, [sortedEvents]);

  return (
    <div className="relative w-full min-h-[800px] bg-gradient-to-b from-sky-200 via-green-100 to-yellow-100 rounded-lg overflow-hidden">
      {/* Облака */}
      <div className="absolute top-10 left-10 text-4xl opacity-70 animate-float">☁️</div>
      <div className="absolute top-20 right-20 text-5xl opacity-60 animate-float" style={{ animationDelay: '1s' }}>☁️</div>
      <div className="absolute top-40 left-1/3 text-3xl opacity-50 animate-float" style={{ animationDelay: '2s' }}>☁️</div>

      {/* Дорога */}
      <div className="absolute left-1/2 top-0 bottom-0 w-32 -translate-x-1/2 bg-gray-700">
        {/* Разметка дороги */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 border-l-4 border-dashed border-yellow-300"></div>
        
        {/* Обочины */}
        <div className="absolute -left-2 top-0 bottom-0 w-2 bg-green-600"></div>
        <div className="absolute -right-2 top-0 bottom-0 w-2 bg-green-600"></div>
      </div>

      {/* Автомобиль (текущая позиция) */}
      {sortedEvents.length > 0 && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out z-20"
          style={{ top: `${roadSegments[currentEventIndex]?.position || 50}%` }}
        >
          <div className="relative animate-car-bounce">
            {/* Машина */}
            <div className="text-6xl transform -rotate-90">🚗</div>
            {/* Водитель */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white rounded-lg px-2 py-1 shadow-lg text-xs font-bold text-purple-700 whitespace-nowrap">
              {driverName}
            </div>
            {/* Пассажиры */}
            {familyMembers.length > 1 && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
                {familyMembers.slice(0, 3).map((member, i) => (
                  <div key={i} className="text-xl">👤</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* События как дорожные знаки */}
      {roadSegments.map((segment, index) => {
        const isLeft = index % 2 === 0;
        const iconName = categoryIcons[segment.event.category] || 'Star';
        
        return (
          <div
            key={segment.event.id}
            className="absolute transition-all duration-500"
            style={{
              top: `${segment.position}%`,
              [isLeft ? 'right' : 'left']: isLeft ? 'calc(50% + 80px)' : 'calc(50% + 80px)'
            }}
          >
            {/* Линия к дороге */}
            <div 
              className={`absolute top-1/2 ${isLeft ? 'left-full' : 'right-full'} w-8 h-0.5 bg-gray-400`}
            ></div>

            {/* Дорожный знак */}
            <Card 
              className={`w-64 ${segment.isPast ? 'opacity-70' : 'opacity-100'} hover:scale-105 transition-transform cursor-pointer`}
              style={{
                borderColor: importanceColors[segment.event.importance],
                borderWidth: '3px'
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Иконка знака */}
                  <div 
                    className="p-3 rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: `${importanceColors[segment.event.importance]}20`,
                      color: importanceColors[segment.event.importance]
                    }}
                  >
                    <Icon name={iconName as any} size={24} />
                  </div>

                  {/* Контент */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: importanceColors[segment.event.importance],
                          color: importanceColors[segment.event.importance]
                        }}
                      >
                        {new Date(segment.event.date).toLocaleDateString('ru-RU', { 
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Badge>
                      {!segment.isPast && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Будущее
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-bold text-sm mb-1">{segment.event.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{segment.event.description}</p>
                  </div>
                </div>

                {/* Индикатор важности */}
                {segment.event.importance === 'critical' && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-red-600 font-semibold">
                    <Icon name="Star" size={12} />
                    Ключевое событие
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Дорожный знак треугольник/круг */}
            <div 
              className={`absolute ${isLeft ? '-left-16' : '-right-16'} top-0 w-12 h-12 flex items-center justify-center rounded-full shadow-lg`}
              style={{ backgroundColor: importanceColors[segment.event.importance] }}
            >
              <Icon name={iconName as any} size={20} className="text-white" />
            </div>
          </div>
        );
      })}

      {/* Точка старта */}
      <div className="absolute left-1/2 top-2 -translate-x-1/2">
        <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
          <Icon name="Flag" size={20} />
          СТАРТ
        </div>
      </div>

      {/* Точка финиша (будущее) */}
      <div className="absolute left-1/2 bottom-2 -translate-x-1/2">
        <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
          <Icon name="Target" size={20} />
          ЦЕЛЬ
        </div>
      </div>

      {/* Элементы пейзажа */}
      <div className="absolute left-10 top-1/4 text-4xl">🌳</div>
      <div className="absolute right-10 top-1/3 text-3xl">🏠</div>
      <div className="absolute left-20 top-1/2 text-2xl">🌲</div>
      <div className="absolute right-16 top-2/3 text-3xl">🏔️</div>
      <div className="absolute left-16 bottom-20 text-3xl">🌻</div>
      <div className="absolute right-20 bottom-32 text-2xl">🌳</div>

      {/* Солнце/Луна в зависимости от времени */}
      <div className="absolute top-8 right-8 text-5xl animate-pulse">☀️</div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes car-bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-car-bounce {
          animation: car-bounce 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
