import { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface SectionHelpProps {
  title: string;
  description: string;
  tips: string[];
  emoji?: string;
}

export const SectionHelp = memo(function SectionHelp({ title, description, tips, emoji = '💡' }: SectionHelpProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start gap-3">
          <div className="text-3xl">{emoji}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
              <Icon name="Info" size={16} />
              {title}
              <Icon 
                name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                size={18} 
                className="ml-auto text-blue-600"
              />
            </h4>
            {isExpanded && (
              <>
                <p className="text-sm text-blue-800 mb-3">{description}</p>
                {tips.length > 0 && (
                  <div className="space-y-1">
                    {tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-blue-700">
                        <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});