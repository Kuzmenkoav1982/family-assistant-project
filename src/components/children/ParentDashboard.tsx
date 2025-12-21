import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { HealthSection } from './HealthSection';
import { DevelopmentSection } from './DevelopmentSection';
import { SchoolSection } from './SchoolSection';
import { GiftsSection } from './GiftsSection';
import { PurchasesSection } from './PurchasesSection';
import { SectionHelp } from './SectionHelp';
import { DevelopmentAssessment } from './DevelopmentAssessment';
import { ActivePlanSection } from './ActivePlanSection';
import { AssessmentsArchive } from './AssessmentsArchive';
import { useChildrenDataQuery, useChildDataMutation } from '@/hooks/useChildrenDataQuery';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import type { FamilyMember } from '@/types/family.types';

interface ParentDashboardProps {
  child: FamilyMember;
}

export function ParentDashboard({ child }: ParentDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAssessment, setShowAssessment] = useState(false);
  const assessmentChildRef = useRef(child);
  const { data, isLoading: loading, error, refetch: fetchChildData } = useChildrenDataQuery(child.id, 'all', !showAssessment);
  const mutation = useChildDataMutation(child.id);

  useEffect(() => {
    assessmentChildRef.current = child;
  }, [child]);



  const addItem = useCallback(async (type: string, itemData: any) => {
    return mutation.mutateAsync({
      action: 'add',
      child_id: child.id,
      type,
      data: itemData,
    });
  }, [mutation, child.id]);

  const updateItem = useCallback(async (type: string, itemId: string, itemData: any) => {
    return mutation.mutateAsync({
      action: 'update',
      child_id: child.id,
      type,
      item_id: itemId,
      data: itemData,
    });
  }, [mutation, child.id]);

  const deleteItem = useCallback(async (type: string, itemId: string) => {
    return mutation.mutateAsync({
      action: 'delete',
      child_id: child.id,
      type,
      item_id: itemId,
    });
  }, [mutation, child.id]);

  const age = child.age || 10;
  
  const healthScore = useMemo(() => {
    if (!data?.health) return 85;
    return Math.round((data.health.vaccinations.length * 10 + data.health.doctorVisits.length * 5) / 2);
  }, [data?.health]);
  
  const developmentScore = useMemo(() => {
    if (!data?.development?.length) return 78;
    return Math.round(data.development.reduce((acc, d) => acc + d.current_level, 0) / data.development.length);
  }, [data?.development]);
  
  const schoolScore = useMemo(() => {
    if (!data?.school?.grades?.length) return 82;
    return Math.round(data.school.grades.reduce((acc, g) => acc + (g.grade || 0), 0) / data.school.grades.length * 20);
  }, [data?.school?.grades]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <SectionHelp
        emoji="🎯"
        title="Добро пожаловать в родительский дашборд!"
        description="Отслеживайте все аспекты развития ребёнка: здоровье, учёбу, хобби и планы. Используйте ИИ-оценку развития для анализа навыков и получения персональных рекомендаций."
        tips={[
          "🧠 Кнопка 'Оценка развития' запускает ИИ-анализ навыков ребёнка по возрастным нормам",
          "📊 Активный план развития отображается в профиле до полного выполнения",
          "📈 Архив оценок показывает динамику развития с графиками прогресса",
          "✅ Отмечайте выполненные упражнения — прогресс обновляется автоматически",
          "💾 Все данные сохраняются в реальном времени и доступны всей семье"
        ]}
      />

      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            {child.avatarType === 'photo' && child.photoUrl ? (
              <img 
                src={child.photoUrl} 
                alt={child.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="text-6xl">{child.avatar}</div>
            )}
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
            <div className="flex gap-3">
              <Button 
                variant="default" 
                className="gap-2 bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => setShowAssessment(true)}
              >
                <Icon name="Brain" size={18} />
                Оценка развития
              </Button>
              <Button variant="secondary" className="gap-2">
                <Icon name="Download" size={18} />
                Экспорт отчёта
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showAssessment && (
        <DevelopmentAssessment
          key={`assessment-${child.id}`}
          child={assessmentChildRef.current}
          open={showAssessment}
          onClose={() => setShowAssessment(false)}
          onComplete={(assessmentId, planId) => {
            setShowAssessment(false);
            navigate(`/children/assessment-report?assessmentId=${assessmentId}&planId=${planId}&childId=${child.id}&returnMode=parent`);
          }}
        />
      )}

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

      <ActivePlanSection child={child} onPlanDeleted={fetchChildData} />

      <AssessmentsArchive child={child} onPlanDeleted={fetchChildData} />

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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={20} />
                  Календарь событий
                </div>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/calendar')}
                  className="gap-2"
                >
                  <Icon name="Plus" size={16} />
                  Добавить событие
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert className="bg-blue-50 border-blue-200">
                <Icon name="Info" className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  <p className="mb-2">Используйте <strong>семейный календарь</strong> для планирования:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Визиты к врачу и прививки</li>
                    <li>Контрольные и экзамены</li>
                    <li>Секции и кружки</li>
                    <li>Дни рождения и праздники</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => navigate('/calendar')}
              >
                <Icon name="Calendar" size={16} />
                Открыть семейный календарь
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <SectionHelp
            emoji="❤️"
            title="Раздел Здоровье"
            description="Отслеживайте медицинскую историю ребёнка: прививки, визиты к врачам, анализы и лекарства"
            tips={[
              "Добавляйте напоминания о прививках и визитах к врачам",
              "Прикрепляйте фото рецептов и результатов анализов",
              "Ведите график приёма лекарств с напоминаниями"
            ]}
          />
          <HealthSection child={child} />
        </TabsContent>

        <TabsContent value="development" className="space-y-6">
          <SectionHelp
            emoji="🎯"
            title="Раздел Развитие"
            description="Планируйте развитие ребёнка в разных областях: спорт, творчество, образование, soft skills"
            tips={[
              "Установите цели и отслеживайте прогресс",
              "Добавьте кружки, секции и их расписание",
              "Сохраняйте результаты тестов и конкурсов"
            ]}
          />
          <DevelopmentSection child={child} />
        </TabsContent>

        <TabsContent value="school" className="space-y-6">
          <SectionHelp
            emoji="📚"
            title="Раздел Школа"
            description="Отслеживайте успеваемость, домашние задания и достижения в учёбе"
            tips={[
              "Подключите интеграцию с электронным дневником",
              "Отмечайте домашние задания и сроки сдачи",
              "Анализируйте динамику оценок по предметам"
            ]}
          />
          <SchoolSection child={child} />
        </TabsContent>

        <TabsContent value="other" className="space-y-6">
          <SectionHelp
            emoji="🎁"
            title="Раздел Подарки и Покупки"
            description="Планируйте подарки на праздники и покупки для ребёнка по сезонам"
            tips={[
              "Составьте список желаемых подарков на праздники",
              "Планируйте покупки одежды и вещей по сезонам",
              "Оценивайте бюджет и приоритеты покупок"
            ]}
          />
          <GiftsSection child={child} />
          <PurchasesSection child={child} />
        </TabsContent>
      </Tabs>
    </div>
  );
}