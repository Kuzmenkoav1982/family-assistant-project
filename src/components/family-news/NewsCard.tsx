import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { NewsItem } from './newsData';

interface NewsCardProps {
  item: NewsItem;
  isExpanded: boolean;
  categoryColor: string;
  formattedDate: string;
  onToggle: (id: string) => void;
}

export default function NewsCard({ item, isExpanded, categoryColor, formattedDate, onToggle }: NewsCardProps) {
  return (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onToggle(item.id)}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className={`bg-${categoryColor}-100 p-3 rounded-lg flex-shrink-0`}>
            <Icon name={item.icon as any} size={24} className={`text-${categoryColor}-600`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">{formattedDate}</Badge>
              <Badge className={`bg-${categoryColor}-100 text-${categoryColor}-700 hover:bg-${categoryColor}-200`}>
                {item.category}
              </Badge>
            </div>
            <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
            <CardDescription className="text-sm">{item.summary}</CardDescription>
          </div>
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={20} className="text-gray-400 flex-shrink-0" />
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="border-t pt-4 space-y-4">
          <p className="text-gray-700 leading-relaxed">{item.content}</p>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="Building2" size={16} />
              <span>Источник: {item.source}</span>
            </div>
            {item.sourceLink !== '#' && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(item.sourceLink, '_blank');
                }}
              >
                <Icon name="ExternalLink" size={14} className="mr-2" />
                Читать полностью
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
