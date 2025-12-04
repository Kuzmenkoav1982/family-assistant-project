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
      
      let signType: 'warning' | 'info' | 'success' | 'milestone' = 'info';
      if (event.importance === 'critical') signType = 'milestone';
      else if (event.importance === 'high') signType = 'warning';
      else if (event.category === 'achievement') signType = 'success';
      
      segments.push({
        event,
        isPast,
        progress,
        signType,
        position: 10 + (progress * 80)
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
    <>
      {/* Desktop: Горизонтальная дорога */}
      <div className="hidden md:block relative w-full h-[600px] bg-gradient-to-r from-sky-200 via-green-100 to-yellow-100 rounded-lg overflow-hidden">
        {/* Облака */}
        <div className="absolute top-10 left-10 text-4xl opacity-70 animate-float">☁️</div>
        <div className="absolute top-20 right-20 text-5xl opacity-60 animate-float" style={{ animationDelay: '1s' }}>☁️</div>
        <div className="absolute top-40 left-1/3 text-3xl opacity-50 animate-float" style={{ animationDelay: '2s' }}>☁️</div>

        {/* Дорога горизонтальная */}
        <div className="absolute left-0 right-0 top-1/2 h-32 -translate-y-1/2 bg-gray-700">
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 border-t-4 border-dashed border-yellow-300"></div>
          <div className="absolute left-0 right-0 -top-2 h-2 bg-green-600"></div>
          <div className="absolute left-0 right-0 -bottom-2 h-2 bg-green-600"></div>
        </div>

        {/* Машинка с боковым видом */}
        {sortedEvents.length > 0 && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out z-20"
            style={{ left: `${roadSegments[currentEventIndex]?.position || 50}%` }}
          >
            <div className="relative animate-car-bounce">
              <div className="text-6xl">🚗</div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white rounded-lg px-2 py-1 shadow-lg text-xs font-bold text-purple-700 whitespace-nowrap">
                {driverName}
              </div>
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

        {/* События */}
        {roadSegments.map((segment, index) => {
          const isTop = index % 2 === 0;
          const iconName = categoryIcons[segment.event.category] || 'Star';
          
          return (
            <div
              key={segment.event.id}
              className="absolute transition-all duration-500"
              style={{
                left: `${segment.position}%`,
                [isTop ? 'bottom' : 'top']: isTop ? 'calc(50% + 80px)' : 'calc(50% + 80px)'
              }}
            >
              <div 
                className={`absolute ${isTop ? 'bottom-0' : 'top-0'} left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gray-400`}
              ></div>

              <Card 
                className={`w-64 ${segment.isPast ? 'opacity-70' : 'opacity-100'} hover:scale-105 transition-transform cursor-pointer`}
                style={{
                  borderColor: importanceColors[segment.event.importance],
                  borderWidth: '3px'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-3 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: `${importanceColors[segment.event.importance]}20`,
                        color: importanceColors[segment.event.importance]
                      }}
                    >
                      <Icon name={iconName as any} size={24} />
                    </div>

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

                  {segment.event.importance === 'critical' && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-600 font-semibold">
                      <Icon name="Star" size={12} />
                      Ключевое событие
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}

        {/* Старт */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
            <Icon name="Flag" size={20} />
            СТАРТ
          </div>
        </div>

        {/* Финиш */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
            <Icon name="Flag" size={20} />
            ФИНИШ
          </div>
        </div>
      </div>

      {/* Mobile: Вертикальная дорога с видом сверху */}
      <div className="md:hidden relative w-full min-h-[800px] bg-gradient-to-b from-sky-200 via-green-100 to-yellow-100 rounded-lg overflow-hidden">
        {/* Облака */}
        <div className="absolute top-10 left-10 text-4xl opacity-70 animate-float">☁️</div>
        <div className="absolute top-20 right-20 text-5xl opacity-60 animate-float" style={{ animationDelay: '1s' }}>☁️</div>
        <div className="absolute top-40 left-1/3 text-3xl opacity-50 animate-float" style={{ animationDelay: '2s' }}>☁️</div>

        {/* Дорога вертикальная */}
        <div className="absolute left-1/2 top-0 bottom-0 w-32 -translate-x-1/2 bg-gray-700">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 border-l-4 border-dashed border-yellow-300"></div>
          <div className="absolute -left-2 top-0 bottom-0 w-2 bg-green-600"></div>
          <div className="absolute -right-2 top-0 bottom-0 w-2 bg-green-600"></div>
        </div>

        {/* Машинка с видом сверху */}
        {sortedEvents.length > 0 && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out z-20"
            style={{ top: `${roadSegments[currentEventIndex]?.position || 50}%` }}
          >
            <div className="relative animate-car-bounce">
              <div className="text-6xl">🚙</div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white rounded-lg px-2 py-1 shadow-lg text-xs font-bold text-purple-700 whitespace-nowrap">
                {driverName}
              </div>
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

        {/* События */}
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
              <div 
                className={`absolute top-1/2 ${isLeft ? 'left-full' : 'right-full'} w-8 h-0.5 bg-gray-400`}
              ></div>

              <Card 
                className={`w-64 ${segment.isPast ? 'opacity-70' : 'opacity-100'} hover:scale-105 transition-transform cursor-pointer`}
                style={{
                  borderColor: importanceColors[segment.event.importance],
                  borderWidth: '3px'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-3 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: `${importanceColors[segment.event.importance]}20`,
                        color: importanceColors[segment.event.importance]
                      }}
                    >
                      <Icon name={iconName as any} size={24} />
                    </div>

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

                  {segment.event.importance === 'critical' && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-600 font-semibold">
                      <Icon name="Star" size={12} />
                      Ключевое событие
                    </div>
                  )}
                </CardContent>
              </Card>

              <div 
                className={`absolute ${isLeft ? '-left-16' : '-right-16'} top-0 w-12 h-12 flex items-center justify-center rounded-full shadow-lg`}
                style={{ backgroundColor: importanceColors[segment.event.importance] }}
              >
                <Icon name={iconName as any} size={20} className="text-white" />
              </div>
            </div>
          );
        })}

        {/* Старт */}
        <div className="absolute left-1/2 top-2 -translate-x-1/2">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
            <Icon name="Flag" size={20} />
            СТАРТ
          </div>
        </div>

        {/* Финиш */}
        <div className="absolute left-1/2 bottom-2 -translate-x-1/2">
          <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
            <Icon name="Flag" size={20} />
            ФИНИШ
          </div>
        </div>
      </div>
    </>
  );
}
