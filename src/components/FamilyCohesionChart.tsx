import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import type { FamilyMember, Task } from '@/types/family.types';
import { calculateFamilyCohesion, calculateFamilyRank } from '@/utils/cohesionCalculator';

interface FamilyCohesionChartProps {
  familyMembers: FamilyMember[];
  tasks: Task[];
  chatMessagesCount?: number;
  albumPhotosCount?: number;
  lastActivityDays?: number;
  totalFamilies?: number;
}

export function FamilyCohesionChart({ 
  familyMembers,
  tasks,
  chatMessagesCount = 0,
  albumPhotosCount = 0,
  lastActivityDays = 0,
  totalFamilies = 1250 
}: FamilyCohesionChartProps) {
  const { metrics: cohesionMetrics, averageScore, totalPoints } = calculateFamilyCohesion(
    familyMembers,
    tasks,
    chatMessagesCount,
    albumPhotosCount,
    lastActivityDays
  );

  const familyRank = calculateFamilyRank(averageScore, totalPoints, totalFamilies);

  const radarData = cohesionMetrics.map(m => ({
    category: m.category,
    score: m.score,
    fullMark: m.maxScore
  }));

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { label: 'Отлично', color: 'bg-green-500', textColor: 'text-green-700' };
    if (score >= 75) return { label: 'Хорошо', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (score >= 60) return { label: 'Средне', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { label: 'Нужно улучшить', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const scoreLevel = getScoreLevel(averageScore);
  const rankPercentile = Math.round((1 - familyRank / totalFamilies) * 100);

  return (
    <div className="grid gap-4 md:gap-6">
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Icon name="TrendingUp" size={24} className="text-purple-600" />
                Сплочённость семьи
              </CardTitle>
              <CardDescription className="mt-2">
                Как ваша семья участвует в семейной жизни через органайзер
              </CardDescription>
            </div>
            <div className="text-center">
              <div className={`text-4xl md:text-5xl font-bold ${scoreLevel.textColor}`}>
                {averageScore}
              </div>
              <Badge className={`${scoreLevel.color} text-white mt-2`}>
                {scoreLevel.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#d1d5db" />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                <Radar
                  name="Уровень"
                  dataKey="score"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '2px solid #8b5cf6', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value} баллов`, 'Уровень']}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
            {cohesionMetrics.map((metric) => {
              const level = getScoreLevel(metric.score);
              return (
                <div
                  key={metric.category}
                  className="flex flex-col gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
                  title={metric.details}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-2 rounded-lg">
                      <Icon name={metric.icon as any} size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{metric.category}</p>
                      <p className={`text-lg font-bold ${level.textColor}`}>{metric.score}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{metric.details}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Icon name="Trophy" size={24} className="text-yellow-600" />
            Рейтинг семей
          </CardTitle>
          <CardDescription>
            Ваша позиция среди всех семей в органайзере
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-around gap-6">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-blue-600 mb-2">
                #{familyRank}
              </div>
              <p className="text-sm text-muted-foreground">Ваше место</p>
            </div>

            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45 * (rankPercentile / 100)} ${2 * Math.PI * 45}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl md:text-4xl font-bold text-blue-600">
                  {rankPercentile}%
                </span>
                <span className="text-xs text-muted-foreground">топ</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-gray-600 mb-2">
                {totalFamilies.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Всего семей</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <Icon name="Lightbulb" size={20} className="text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm mb-1">Как улучшить рейтинг?</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Выполняйте задачи вовремя</li>
                  <li>✓ Общайтесь в семейном чате</li>
                  <li>✓ Добавляйте фото в альбом</li>
                  <li>✓ Соблюдайте семейные традиции</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}