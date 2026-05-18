import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { FAMILY_EXERCISES } from '../data/exercises';

interface Props {
  markExerciseComplete: (id: string) => void;
  getExerciseCompletionCount: (id: string) => number;
}

export default function ExercisesTab({ markExerciseComplete, getExerciseCompletionCount }: Props) {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
          <Icon name="Target" size={16} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Упражнения для семьи</h3>
          <p className="text-xs text-gray-500">Практики для укрепления семейных связей</p>
        </div>
      </div>

      {FAMILY_EXERCISES.map((ex) => {
        const isExpanded = expandedExercise === ex.id;
        const completions = getExerciseCompletionCount(ex.id);

        return (
          <Card key={ex.id} className="border-amber-200/60 bg-white/80 backdrop-blur-sm">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                  <Icon name={ex.icon} size={20} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-800 text-sm">{ex.title}</h4>
                    {completions > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{completions}x</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Icon name="Clock" size={10} />
                      {ex.duration}
                    </span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-gray-500">{ex.frequency}</span>
                  </div>
                </div>
                <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-gray-400 flex-shrink-0" />
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-amber-100">
                  <p className="text-sm text-gray-600 mb-3">{ex.description}</p>

                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">Польза:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ex.benefits.map((b, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200/60">{b}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">Как выполнять:</p>
                    <ol className="space-y-2">
                      {ex.steps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Icon name="Repeat" size={12} />
                      {ex.frequency}
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); markExerciseComplete(ex.id); }}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Icon name="Check" size={14} className="mr-1" />
                      Выполнено
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
