import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface CommandCategory {
  category: string;
  count: number;
  color: string;
}

interface AdminAliceStatisticsTabProps {
  commandsByCategory: CommandCategory[];
  avgResponseTime: number;
  errorRate: number;
}

export function AdminAliceStatisticsTab({
  commandsByCategory,
  avgResponseTime,
  errorRate
}: AdminAliceStatisticsTabProps) {
  if (commandsByCategory.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Icon name="BarChart3" size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">Пока нет данных</h3>
          <p className="text-gray-600">Статистика появится после первых использований навыка</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="PieChart" size={20} className="text-purple-600" />
              Команды по категориям
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={commandsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {commandsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Zap" size={20} className="text-yellow-600" />
              Среднее время ответа
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">{avgResponseTime}ms</div>
              <p className="text-sm text-gray-600">
                {avgResponseTime < 500 ? '✅ Отлично' : avgResponseTime < 1000 ? '⚠️ Приемлемо' : '🔴 Медленно'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="AlertCircle" size={20} className="text-red-600" />
              Уровень ошибок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">{errorRate}%</div>
              <p className="text-sm text-gray-600">
                {errorRate < 3 ? '✅ Отлично' : errorRate < 5 ? '⚠️ Норма' : '🔴 Требует внимания'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
