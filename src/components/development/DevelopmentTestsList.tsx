import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { Test } from '@/types/family.types';

interface DevelopmentTest {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  questions: number;
  icon: string;
  color: string;
}

interface DevelopmentTestsListProps {
  tests: DevelopmentTest[];
  selectedMember: string;
  onStartTest: (testId: string) => void;
  getMemberProgress: (memberId: string, testId: string) => Test | null | undefined;
  getMaxScoreForTest: (testId: string) => number;
}

export function DevelopmentTestsList({
  tests,
  selectedMember,
  onStartTest,
  getMemberProgress,
  getMaxScoreForTest
}: DevelopmentTestsListProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tests.filter(test => test && test.id && test.color).map(test => {
        const progress = selectedMember !== 'all' ? getMemberProgress(selectedMember, test.id) : null;
        const maxScore = getMaxScoreForTest(test.id);
        const progressPercent = progress ? Math.round((progress.score / maxScore) * 100) : 0;

        return (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className={`w-12 h-12 rounded-xl ${test.color || 'bg-gray-100 text-gray-700 border-gray-300'} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={test.icon as any} size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg mb-1 line-clamp-2">{test.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">{test.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs gap-1">
                  <Icon name="Clock" size={12} />
                  {test.duration}
                </Badge>
                <Badge variant="outline" className="text-xs gap-1">
                  <Icon name="ListChecks" size={12} />
                  {test.questions} вопросов
                </Badge>
              </div>

              {progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Пройден</span>
                    <span className="font-semibold">{progress.score}/{maxScore} баллов</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {new Date(progress.completed_date).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              )}

              <Button
                onClick={() => onStartTest(test.id)}
                className="w-full"
                variant={progress ? 'outline' : 'default'}
              >
                <Icon name={progress ? 'RefreshCw' : 'Play'} size={16} className="mr-2" />
                {progress ? 'Пройти заново' : 'Начать тест'}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {tests.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Icon name="Search" size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Тесты не найдены</p>
        </div>
      )}
    </div>
  );
}