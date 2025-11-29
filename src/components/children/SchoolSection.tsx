import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

export function SchoolSection({ child }: { child: FamilyMember }) {
  const grades = [
    { subject: 'Математика', grade: 5, trend: 'up' },
    { subject: 'Русский язык', grade: 4, trend: 'stable' },
    { subject: 'Литература', grade: 5, trend: 'up' },
    { subject: 'Английский', grade: 4, trend: 'down' },
    { subject: 'История', grade: 5, trend: 'up' },
    { subject: 'Физкультура', grade: 5, trend: 'stable' }
  ];

  const averageGrade = (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(1);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="GraduationCap" size={24} />
              Успеваемость
            </CardTitle>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{averageGrade}</div>
              <div className="text-sm text-gray-600">Средний балл</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BookOpen" size={24} />
            Оценки по предметам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {grades.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">{item.grade}</span>
                  </div>
                  <span className="font-medium">{item.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.trend === 'up' && (
                    <Badge className="bg-green-100 text-green-700">
                      <Icon name="TrendingUp" size={14} className="mr-1" />
                      Растёт
                    </Badge>
                  )}
                  {item.trend === 'down' && (
                    <Badge className="bg-red-100 text-red-700">
                      <Icon name="TrendingDown" size={14} className="mr-1" />
                      Снижается
                    </Badge>
                  )}
                  {item.trend === 'stable' && (
                    <Badge variant="outline">
                      <Icon name="Minus" size={14} className="mr-1" />
                      Стабильно
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Link" size={24} />
              Интеграция с МЭШ
            </CardTitle>
            <Badge variant="outline" className="bg-gray-100">
              Не подключено
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm">
            Подключите интеграцию с Московской электронной школой для автоматической синхронизации оценок и домашних заданий
          </p>
          <Button className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
            <Icon name="Link" size={16} />
            Подключить МЭШ
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="CalendarCheck" size={24} />
            Домашние задания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Icon name="CheckCircle2" size={48} className="mx-auto mb-4 text-green-300" />
            <p>Все задания выполнены! 🎉</p>
            <p className="text-sm mt-2">Отличная работа!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
