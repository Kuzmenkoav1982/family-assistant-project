import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Test } from '@/types/family.types';

interface TestHistoryProps {
  tests: Test[];
  testName: string;
}

export default function TestHistory({ tests, testName }: TestHistoryProps) {
  const completedTests = tests.filter(t => t.status === 'completed');

  if (completedTests.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="History" size={20} />
          История прохождения
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {completedTests.map((test, index) => (
            <div key={test.id + '-' + index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="CheckCircle2" size={16} className="text-green-600" />
                  <span className="font-medium">{testName}</span>
                </div>
                {test.completed_date && (
                  <p className="text-sm text-gray-600">
                    {new Date(test.completed_date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
                {test.description && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{test.description}</p>
                )}
              </div>
              {test.score !== undefined && (
                <Badge variant="outline" className="ml-3">
                  {test.score} баллов
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
