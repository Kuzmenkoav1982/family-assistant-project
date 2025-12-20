import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import SkillsRadarChart from './SkillsRadarChart';
import { Test } from '@/types/family.types';

interface DevelopmentInsightsProps {
  tests: Test[];
  memberName?: string;
}

const TEST_CATEGORIES = {
  'emotional-intelligence': {
    name: 'Эмоциональный интеллект',
    color: '#ec4899',
    icon: 'Heart'
  },
  'communication-style': {
    name: 'Стиль общения',
    color: '#3b82f6',
    icon: 'MessageCircle'
  },
  'conflict-resolution': {
    name: 'Разрешение конфликтов',
    color: '#a855f7',
    icon: 'Users'
  },
  'stress-management': {
    name: 'Управление стрессом',
    color: '#f97316',
    icon: 'Brain'
  },
  'love-languages': {
    name: 'Языки любви',
    color: '#ef4444',
    icon: 'Heart'
  },
  'parenting-style': {
    name: 'Стиль воспитания',
    color: '#10b981',
    icon: 'Baby'
  },
  'time-management': {
    name: 'Управление временем',
    color: '#eab308',
    icon: 'Clock'
  },
  'financial-literacy': {
    name: 'Финансовая грамотность',
    color: '#059669',
    icon: 'Wallet'
  }
};

export default function DevelopmentInsights({ tests, memberName }: DevelopmentInsightsProps) {
  if (!tests || tests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mb-4 text-6xl">🎯</div>
          <p className="text-gray-500 text-lg mb-2">Пока нет пройденных тестов</p>
          <p className="text-gray-400 text-sm">Пройдите первый тест, чтобы увидеть анализ</p>
        </CardContent>
      </Card>
    );
  }

  const radarData = tests
    .filter(test => test.score !== undefined && test.score !== null)
    .map(test => {
      const category = TEST_CATEGORIES[test.id as keyof typeof TEST_CATEGORIES];
      const maxScore = getMaxScoreForTest(test.id);
      
      return {
        skill: category?.name || test.name,
        score: test.score || 0,
        maxScore: maxScore,
        color: category?.color || '#3b82f6'
      };
    });

  const averageScore = radarData.length > 0
    ? Math.round((radarData.reduce((sum, item) => sum + (item.score / item.maxScore) * 100, 0) / radarData.length))
    : 0;

  const strengths = radarData
    .filter(item => (item.score / item.maxScore) >= 0.7)
    .sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore))
    .slice(0, 3);

  const needsWork = radarData
    .filter(item => (item.score / item.maxScore) < 0.6)
    .sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore))
    .slice(0, 3);

  const latestTest = tests
    .filter(t => t.completed_date)
    .sort((a, b) => new Date(b.completed_date!).getTime() - new Date(a.completed_date!).getTime())[0];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={24} className="text-blue-600" />
              Общий прогресс {memberName ? `— ${memberName}` : ''}
            </CardTitle>
            <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
              {averageScore}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Средний балл</span>
                <span className="text-sm text-gray-600">{radarData.length} {getTestWord(radarData.length)}</span>
              </div>
              <Progress value={averageScore} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{strengths.length}</div>
                <div className="text-xs text-gray-600 mt-1">Сильные стороны</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{radarData.length}</div>
                <div className="text-xs text-gray-600 mt-1">Пройдено тестов</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">{needsWork.length}</div>
                <div className="text-xs text-gray-600 mt-1">Области роста</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {radarData.length >= 3 && (
        <SkillsRadarChart
          skills={radarData}
          title="Визуализация навыков"
          size={350}
        />
      )}

      {strengths.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Icon name="Trophy" size={24} />
              Ваши сильные стороны
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strengths.map((item, index) => {
                const percentage = Math.round((item.score / item.maxScore) * 100);
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.skill}</div>
                      <div className="text-sm text-gray-600">Результат: {item.score} из {item.maxScore}</div>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      {percentage}%
                    </Badge>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm text-gray-700">
                <Icon name="Lightbulb" size={16} className="inline mr-2 text-yellow-500" />
                Отличные результаты! Продолжайте развивать эти навыки и используйте их как основу для помощи другим членам семьи.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {needsWork.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Icon name="Target" size={24} />
              Области для развития
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsWork.map((item, index) => {
                const percentage = Math.round((item.score / item.maxScore) * 100);
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                      !
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.skill}</div>
                      <div className="text-sm text-gray-600">Результат: {item.score} из {item.maxScore}</div>
                    </div>
                    <Badge className="bg-orange-600 text-white">
                      {percentage}%
                    </Badge>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
              <p className="text-sm text-gray-700 mb-2">
                <Icon name="Zap" size={16} className="inline mr-2 text-orange-500" />
                <strong>Рекомендации:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-6 list-disc">
                <li>Пересмотрите результаты тестов и изучите рекомендации</li>
                <li>Пройдите тесты повторно через 3-6 месяцев, чтобы отследить прогресс</li>
                <li>Сосредоточьтесь на одной области за раз — так эффективнее</li>
                <li>Обсудите результаты с близкими для взаимной поддержки</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {latestTest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Clock" size={24} />
              Последний пройденный тест
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-lg text-gray-900">{latestTest.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(latestTest.completed_date!).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                {latestTest.score !== undefined && (
                  <Badge className="bg-blue-600 text-white">
                    {latestTest.score} баллов
                  </Badge>
                )}
              </div>
              {latestTest.description && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {latestTest.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getMaxScoreForTest(testId: string): number {
  const scoreMap: Record<string, number> = {
    'emotional-intelligence': 25,
    'communication-style': 25,
    'conflict-resolution': 25,
    'stress-management': 25,
    'love-languages': 30,
    'parenting-style': 50,
    'time-management': 25,
    'financial-literacy': 50
  };
  return scoreMap[testId] || 100;
}

function getTestWord(count: number): string {
  if (count === 1) return 'тест';
  if (count >= 2 && count <= 4) return 'теста';
  return 'тестов';
}