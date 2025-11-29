import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { HealthSection } from './HealthSection';
import { DevelopmentSection } from './DevelopmentSection';
import { SchoolSection } from './SchoolSection';
import { GiftsSection } from './GiftsSection';
import { PurchasesSection } from './PurchasesSection';
import type { FamilyMember } from '@/types/family.types';

interface ParentDashboardProps {
  child: FamilyMember;
}

export function ParentDashboard({ child }: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const age = child.age || 10;
  const healthScore = 85;
  const developmentScore = 78;
  const schoolScore = 82;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="text-6xl">{child.avatar}</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{child.name}</h2>
              <div className="flex gap-4 text-sm">
                <span>Возраст: {age} лет</span>
                <span>•</span>
                <span>Уровень: {child.level}</span>
                <span>•</span>
                <span>Баллы: {child.points}</span>
              </div>
            </div>
            <Button variant="secondary" className="gap-2">
              <Icon name="Download" size={18} />
              Экспорт отчёта
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Здоровье
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl">❤️</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{healthScore}%</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Отлично
                  </Badge>
                </div>
                <Progress value={healthScore} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Развитие
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎯</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{developmentScore}%</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Хорошо
                  </Badge>
                </div>
                <Progress value={developmentScore} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Успеваемость
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl">📚</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{schoolScore}%</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Хорошо
                  </Badge>
                </div>
                <Progress value={schoolScore} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="text-3xl">🤖</div>
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">Рекомендации ИИ</CardTitle>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Рекомендуется уделить больше внимания развитию математических навыков</p>
                <p>• Отличные результаты в творческих заданиях - поддержите интерес к рисованию</p>
                <p>• Назначьте визит к окулисту - последняя проверка была 8 месяцев назад</p>
              </div>
              <Button variant="link" className="mt-2 p-0 h-auto text-blue-600">
                Посмотреть все рекомендации →
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" className="gap-2">
            <Icon name="LayoutDashboard" size={16} />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-2">
            <Icon name="Heart" size={16} />
            Здоровье
          </TabsTrigger>
          <TabsTrigger value="development" className="gap-2">
            <Icon name="TrendingUp" size={16} />
            Развитие
          </TabsTrigger>
          <TabsTrigger value="school" className="gap-2">
            <Icon name="GraduationCap" size={16} />
            Школа
          </TabsTrigger>
          <TabsTrigger value="other" className="gap-2">
            <Icon name="Gift" size={16} />
            Прочее
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Target" size={20} />
                  Краткосрочные цели
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">Выучить таблицу умножения</p>
                    <p className="text-sm text-gray-500">До 15 декабря</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">Записаться в секцию плавания</p>
                    <p className="text-sm text-gray-500">До конца месяца</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2 mt-4">
                  <Icon name="Plus" size={16} />
                  Добавить цель
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Trophy" size={20} />
                  Последние достижения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {child.achievements?.slice(0, 3).map((achievement, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                    <div className="text-2xl">🏆</div>
                    <span className="text-sm">{achievement}</span>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">Пока нет достижений</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Calendar" size={20} />
                Ближайшие события
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-600">ДЕК</div>
                  <div className="text-2xl font-bold">15</div>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Прием у окулиста</p>
                  <p className="text-sm text-gray-500">10:00, Клиника "Здоровье"</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Icon name="Calendar" size={16} />
                </Button>
              </div>

              <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-600">ДЕК</div>
                  <div className="text-2xl font-bold">20</div>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Контрольная по математике</p>
                  <p className="text-sm text-gray-500">Школа № 25</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Icon name="Calendar" size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <HealthSection childId={child.id} />
        </TabsContent>

        <TabsContent value="development">
          <DevelopmentSection childId={child.id} />
        </TabsContent>

        <TabsContent value="school">
          <SchoolSection childId={child.id} />
        </TabsContent>

        <TabsContent value="other" className="space-y-6">
          <GiftsSection childId={child.id} />
          <PurchasesSection childId={child.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
