import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
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

interface LifeRoadFiltersProps {
  events: LifeEvent[];
  filteredEvents: LifeEvent[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  years: number[];
  categoryConfig: {
    [key: string]: { label: string; icon: string; color: string };
  };
  setShowAddDialog: (show: boolean) => void;
}

export function LifeRoadFilters({
  events,
  filteredEvents,
  selectedCategory,
  setSelectedCategory,
  selectedYear,
  setSelectedYear,
  years,
  categoryConfig,
  setShowAddDialog
}: LifeRoadFiltersProps) {
  return (
    <>
      {/* Filters & Add Button */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                Все события
                <Badge className="ml-2 bg-white text-gray-700">{events.length}</Badge>
              </Button>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className={selectedCategory === key ? config.color : ''}
                >
                  <Icon name={config.icon as any} size={14} className="mr-1" />
                  {config.label}
                </Button>
              ))}
            </div>

            <Button onClick={() => setShowAddDialog(true)} className="whitespace-nowrap">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить событие
            </Button>
          </div>

          {/* Year Filter */}
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
        </CardContent>
      </Card>

      {/* Road Visualization */}
      {filteredEvents.length > 0 && (
        <div className="mb-8">
          <RoadVisualization 
            events={filteredEvents.map(e => ({
              id: e.id,
              date: e.date,
              title: e.title,
              category: e.category,
              importance: e.importance
            }))}
            categoryConfig={categoryConfig}
          />
        </div>
      )}
    </>
  );
}
