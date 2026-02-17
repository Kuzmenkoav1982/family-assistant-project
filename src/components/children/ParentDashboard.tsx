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
import { GiftsSection } from './GiftsSection';
import { SectionHelp } from './SectionHelp';
import { DevelopmentAssessment } from './DevelopmentAssessment';
import { ActivePlanSection } from './ActivePlanSection';
import { AssessmentsArchive } from './AssessmentsArchive';
import { ChildCalendar } from './ChildCalendar';
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
        emoji="👨‍👩‍👧"
        title="Как работает родительский дашборд"
        description="Здесь собрана вся важная информация о ребёнке — здоровье, развитие, школа и планы. Переключайтесь между разделами через вкладки сверху."
        tips={[
          "📋 ОБЗОР — краткая сводка по всем разделам, быстрый доступ к последним записям",
          "🏥 ЗДОРОВЬЕ — медкарта с прививками, анализами, осмотрами и записями к врачам",
          "🎯 РАЗВИТИЕ — области развития (спорт, творчество), занятия с расписанием и результаты тестов",
          "🎓 ШКОЛА — домашние задания, оценки, успеваемость и расписание уроков",
          "📅 ПРОЧЕЕ — планы, важные даты, заметки и всё остальное",
          "🧠 Кнопка 'Оценка развития' — ИИ анализирует навыки и предлагает персональный план",
          "👨‍👩‍👧 Все члены семьи видят актуальную информацию в реальном времени"
        ]}
      />

      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {child.avatarType === 'photo' && child.photoUrl ? (
              <img 
                src={child.photoUrl} 
                alt={child.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="text-6xl">{child.avatar}</div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{child.name}</h2>
              <div className="flex flex-wrap gap-2 sm:gap-4 text-sm">
                <span>Возраст: {age} лет</span>
                <span className="hidden sm:inline">•</span>
                <span>Уровень: {child.level}</span>
                <span className="hidden sm:inline">•</span>
                <span>Баллы: {child.points}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                variant="default" 
                className="gap-2 bg-white text-purple-600 hover:bg-gray-100 whitespace-nowrap"
                onClick={() => setShowAssessment(true)}
              >
                <Icon name="Brain" size={18} />
                <span className="hidden sm:inline">Оценка развития</span>
                <span className="sm:hidden">Оценка</span>
              </Button>
              <Button variant="secondary" className="gap-2 whitespace-nowrap">
                <Icon name="Download" size={18} />
                <span className="hidden sm:inline">Экспорт отчёта</span>
                <span className="sm:hidden">Экспорт</span>
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
        <TabsList className="grid grid-cols-4 w-full">
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
          <TabsTrigger value="gifts" className="gap-2">
            <Icon name="Gift" size={16} />
            Подарки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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

          <ChildCalendar child={child} />
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
          <DevelopmentSection child={child} />
        </TabsContent>

        <TabsContent value="gifts" className="space-y-6">
          <SectionHelp
            emoji="🎁"
            title="Раздел Подарки"
            description="Планируйте подарки ребёнку на праздники и важные даты"
            tips={[
              "Составьте список желаемых подарков на день рождения, Новый год и другие праздники",
              "Отмечайте приоритеты и бюджет для каждого подарка",
              "Следите за историей подаренных подарков"
            ]}
          />
          <GiftsSection child={child} />
        </TabsContent>
      </Tabs>
    </div>
  );
}