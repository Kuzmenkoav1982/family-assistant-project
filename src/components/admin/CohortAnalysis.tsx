import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Props {
  apiUrl: string;
}

export default function CohortAnalysis({ apiUrl }: Props) {
  const [cohortData, setCohortData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCohortData();
  }, []);

  const fetchCohortData = async () => {
    try {
      const response = await fetch(`${apiUrl}?action=cohort-analysis`, {
        headers: {
          'X-Admin-Token': 'admin_authenticated'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCohortData(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Icon name="Loader2" className="animate-spin" size={40} />
        </CardContent>
      </Card>
    );
  }

  // Моковые данные для демонстрации концепции
  const mockCohorts = [
    {
      month: '2024-09',
      users: 5,
      retention: {
        month0: 100,
        month1: 80,
        month2: 60,
        month3: 60
      }
    },
    {
      month: '2024-10',
      users: 3,
      retention: {
        month0: 100,
        month1: 67,
        month2: 67
      }
    },
    {
      month: '2024-11',
      users: 4,
      retention: {
        month0: 100,
        month1: 75
      }
    },
    {
      month: '2024-12',
      users: 3,
      retention: {
        month0: 100
      }
    }
  ];

  const getRetentionColor = (retention: number) => {
    if (retention >= 80) return 'bg-green-500';
    if (retention >= 60) return 'bg-yellow-500';
    if (retention >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const avgRetention = {
    month1: 74,
    month2: 64,
    month3: 60
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Retention 1 месяц</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{avgRetention.month1}%</div>
            <p className="text-xs text-gray-500 mt-1">Остаются после 1-го месяца</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Retention 3 месяца</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{avgRetention.month2}%</div>
            <p className="text-xs text-gray-500 mt-1">Остаются после 3-х месяцев</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{100 - avgRetention.month1}%</div>
            <p className="text-xs text-gray-500 mt-1">Уходят в первый месяц</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Стабильность</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500">Высокая</Badge>
            <p className="text-xs text-gray-500 mt-2">Retention > 60% — отлично</p>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={20} />
            Когортный анализ по месяцам
          </CardTitle>
          <CardDescription>
            Процент пользователей, оставшихся активными через N месяцев после регистрации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold">Когорта</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Пользователей</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Месяц 0</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Месяц 1</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Месяц 2</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Месяц 3</th>
                </tr>
              </thead>
              <tbody>
                {mockCohorts.map((cohort, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold">
                        {new Date(cohort.month).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="outline">{cohort.users} чел.</Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className={`inline-block px-4 py-2 rounded text-white font-semibold ${getRetentionColor(cohort.retention.month0)}`}>
                        {cohort.retention.month0}%
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      {cohort.retention.month1 !== undefined ? (
                        <div className={`inline-block px-4 py-2 rounded text-white font-semibold ${getRetentionColor(cohort.retention.month1)}`}>
                          {cohort.retention.month1}%
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {cohort.retention.month2 !== undefined ? (
                        <div className={`inline-block px-4 py-2 rounded text-white font-semibold ${getRetentionColor(cohort.retention.month2)}`}>
                          {cohort.retention.month2}%
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {cohort.retention.month3 !== undefined ? (
                        <div className={`inline-block px-4 py-2 rounded text-white font-semibold ${getRetentionColor(cohort.retention.month3)}`}>
                          {cohort.retention.month3}%
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Icon name="Lightbulb" size={18} />
              Интерпретация данных:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Зелёный (80-100%)</strong> — отличный retention, пользователи довольны</li>
              <li>• <strong>Жёлтый (60-79%)</strong> — хороший retention, есть потенциал роста</li>
              <li>• <strong>Оранжевый (40-59%)</strong> — средний retention, нужно улучшать продукт</li>
              <li>• <strong>Красный (&lt;40%)</strong> — низкий retention, критично</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" size={20} />
            Выводы и рекомендации
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle" className="text-green-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-green-900">Высокий retention</h4>
                <p className="text-sm text-green-800 mt-1">
                  74% пользователей остаются после первого месяца — это отличный показатель! 
                  Продукт решает реальную проблему.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" className="text-yellow-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-yellow-900">Падение на 3-м месяце</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  С 74% до 64% через 3 месяца. Возможные причины: заканчивается пробный период, 
                  не хватает функций для долгосрочного использования.
                </p>
                <p className="text-sm text-yellow-800 mt-2 font-semibold">
                  💡 Рекомендация: внедрить email-рассылку с полезными советами на 2-3 месяце.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Target" className="text-blue-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-blue-900">Цель на квартал</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Повысить retention 3-го месяца с 64% до 75%+ через улучшение онбординга 
                  и добавление персональных рекомендаций.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
