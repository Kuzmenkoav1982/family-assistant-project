import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { RELAXATION_TECHNIQUES } from '../data/relaxation';
import { formatTimer } from '../utils';

interface Props {
  activeTimer: string | null;
  timerSeconds: number;
  startTimer: (techniqueId: string, minutes: number) => void;
  stopTimer: () => void;
  getTechniqueCompletionCount: (id: string) => number;
}

export default function RelaxationTab({
  activeTimer, timerSeconds, startTimer, stopTimer, getTechniqueCompletionCount,
}: Props) {
  const [expandedTechnique, setExpandedTechnique] = useState<string | null>(null);

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
          <Icon name="Flower2" size={16} className="text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Техники релаксации</h3>
          <p className="text-xs text-gray-500">Научно обоснованные методы снятия стресса</p>
        </div>
      </div>

      {RELAXATION_TECHNIQUES.map((tech) => {
        const isExpanded = expandedTechnique === tech.id;
        const isTimerActive = activeTimer === tech.id;
        const completions = getTechniqueCompletionCount(tech.id);
        const durationMinutes = parseInt(tech.duration);

        return (
          <Card key={tech.id} className={`border-violet-200/60 transition-all ${isTimerActive ? 'bg-violet-50/80 border-violet-300' : 'bg-white/80 backdrop-blur-sm'}`}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandedTechnique(isExpanded ? null : tech.id)}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  <Icon name={tech.icon} size={20} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-800 text-sm">{tech.title}</h4>
                    {completions > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{completions}x</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Icon name="Clock" size={10} />
                      {tech.duration}
                    </span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-gray-500">{tech.difficulty}</span>
                  </div>
                </div>
                <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-gray-400 flex-shrink-0" />
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-violet-100">
                  <p className="text-sm text-gray-600 mb-3">{tech.description}</p>
                  <ol className="space-y-2 mb-4">
                    {tech.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>

                  {isTimerActive ? (
                    <div className="flex flex-col items-center gap-3 py-3">
                      <div className="text-3xl font-mono font-bold text-violet-700">{formatTimer(timerSeconds)}</div>
                      <p className="text-xs text-gray-500">Следуйте инструкциям выше</p>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); stopTimer(); }} className="border-violet-300 text-violet-700">
                        <Icon name="Square" size={14} className="mr-1" />
                        Остановить
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={(e) => { e.stopPropagation(); startTimer(tech.id, durationMinutes || 5); }}
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                      size="sm"
                    >
                      <Icon name="Play" size={14} className="mr-1" />
                      Начать практику ({tech.duration})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
