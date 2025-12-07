import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { toast } from 'sonner';
import { Development as DevelopmentType, Test } from '@/types/family.types';
import InteractiveTest, { TestResult } from '@/components/InteractiveTest';
import TestHistory from '@/components/TestHistory';
import {
  emotionalIntelligenceQuestions,
  getEmotionalIntelligenceResults,
  communicationStyleQuestions,
  getCommunicationStyleResults,
  loveLanguagesQuestions,
  getLoveLanguagesResults
} from '@/data/testQuestions';
import {
  conflictResolutionQuestions,
  getConflictResolutionResults,
  stressManagementQuestions,
  getStressManagementResults
} from '@/data/additionalTests';

const DEVELOPMENT_TESTS = [
  {
    id: 'emotional-intelligence',
    name: 'Эмоциональный интеллект',
    description: 'Оценка способности понимать и управлять эмоциями',
    category: 'psychology',
    duration: '15 мин',
    questions: 20,
    icon: 'Heart',
    color: 'bg-pink-100 text-pink-700 border-pink-300'
  },
  {
    id: 'communication-style',
    name: 'Стиль общения',
    description: 'Определение предпочтительного стиля коммуникации в семье',
    category: 'psychology',
    duration: '10 мин',
    questions: 15,
    icon: 'MessageCircle',
    color: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  {
    id: 'conflict-resolution',
    name: 'Разрешение конфликтов',
    description: 'Навыки управления и разрешения семейных конфликтов',
    category: 'psychology',
    duration: '12 мин',
    questions: 18,
    icon: 'Users',
    color: 'bg-purple-100 text-purple-700 border-purple-300'
  },
  {
    id: 'stress-management',
    name: 'Управление стрессом',
    description: 'Оценка устойчивости к стрессу и методов совладания',
    category: 'psychology',
    duration: '10 мин',
    questions: 15,
    icon: 'Brain',
    color: 'bg-orange-100 text-orange-700 border-orange-300'
  },
  {
    id: 'love-languages',
    name: 'Языки любви',
    description: 'Определение основных способов выражения и восприятия любви',
    category: 'relationship',
    duration: '8 мин',
    questions: 12,
    icon: 'Heart',
    color: 'bg-red-100 text-red-700 border-red-300'
  },
  {
    id: 'parenting-style',
    name: 'Стиль воспитания',
    description: 'Анализ подходов к воспитанию детей',
    category: 'parenting',
    duration: '15 мин',
    questions: 20,
    icon: 'Baby',
    color: 'bg-green-100 text-green-700 border-green-300'
  },
  {
    id: 'time-management',
    name: 'Управление временем',
    description: 'Оценка навыков планирования и организации времени',
    category: 'productivity',
    duration: '10 мин',
    questions: 15,
    icon: 'Clock',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  },
  {
    id: 'financial-literacy',
    name: 'Финансовая грамотность',
    description: 'Проверка знаний в области управления семейными финансами',
    category: 'finance',
    duration: '12 мин',
    questions: 18,
    icon: 'Wallet',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300'
  }
];

export default function Development() {
  const navigate = useNavigate();
  const { members: familyMembers, loading: isLoading, updateMember } = useFamilyMembersContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [savingResult, setSavingResult] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'Все категории', icon: 'Grid' },
    { id: 'psychology', label: 'Психология', icon: 'Brain' },
    { id: 'relationship', label: 'Отношения', icon: 'Heart' },
    { id: 'parenting', label: 'Воспитание', icon: 'Baby' },
    { id: 'productivity', label: 'Продуктивность', icon: 'Zap' },
    { id: 'finance', label: 'Финансы', icon: 'Wallet' }
  ];

  const filteredTests = DEVELOPMENT_TESTS.filter(test => 
    selectedCategory === 'all' || test.category === selectedCategory
  );

  const getMemberProgress = (memberId: string, testId: string) => {
    if (!familyMembers || familyMembers.length === 0) return null;
    const member = familyMembers.find(m => m.id === memberId);
    if (!member?.development) return null;
    
    const dev = member.development.find(d => 
      d.tests.some(t => t.id === testId)
    );
    return dev?.tests.find(t => t.id === testId);
  };

  const handleStartTest = (testId: string) => {
    setActiveTest(testId);
  };

  const handleTestComplete = async (testId: string, result: TestResult) => {
    console.log('Test completed:', testId, result);
    
    if (selectedMember === 'all') {
      setActiveTest(null);
      return;
    }

    setSavingResult(true);
    
    try {
      const member = familyMembers?.find(m => m.id === selectedMember);
      if (!member) {
        console.error('Member not found');
        setActiveTest(null);
        setSavingResult(false);
        return;
      }

      const testData: Test = {
        id: testId,
        name: DEVELOPMENT_TESTS.find(t => t.id === testId)?.name || testId,
        description: result.interpretation,
        completed_date: new Date().toISOString(),
        score: result.score,
        status: 'completed'
      };

      const currentDevelopment = member.development || [];
      
      // Находим область "psychology" или создаём новую
      let psychologyDev = currentDevelopment.find(d => d.area === 'education');
      
      if (psychologyDev) {
        // Обновляем существующий тест или добавляем новый
        const existingTestIndex = psychologyDev.tests.findIndex(t => t.id === testId);
        if (existingTestIndex >= 0) {
          psychologyDev.tests[existingTestIndex] = testData;
        } else {
          psychologyDev.tests.push(testData);
        }
      } else {
        // Создаём новую область развития
        psychologyDev = {
          id: 'psychology-' + Date.now(),
          area: 'education',
          current_level: 1,
          target_level: 10,
          activities: [],
          tests: [testData]
        };
        currentDevelopment.push(psychologyDev);
      }

      // Сохраняем обновлённые данные
      const updateResult = await updateMember({
        id: selectedMember,
        development: currentDevelopment
      });

      if (updateResult.success) {
        console.log('Test result saved successfully');
        toast.success('Результаты сохранены!', {
          description: 'Результаты теста успешно добавлены в профиль',
          duration: 4000,
        });
      } else {
        console.error('Failed to save test result:', updateResult.error);
        toast.error('Ошибка сохранения', {
          description: updateResult.error || 'Не удалось сохранить результаты теста',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error saving test result:', error);
      toast.error('Ошибка', {
        description: 'Произошла ошибка при сохранении результатов',
        duration: 5000,
      });
    } finally {
      setSavingResult(false);
      setActiveTest(null);
    }
  };

  const handleTestCancel = () => {
    setActiveTest(null);
  };

  const getTestQuestions = (testId: string) => {
    switch (testId) {
      case 'emotional-intelligence':
        return emotionalIntelligenceQuestions;
      case 'communication-style':
        return communicationStyleQuestions;
      case 'love-languages':
        return loveLanguagesQuestions;
      case 'conflict-resolution':
        return conflictResolutionQuestions;
      case 'stress-management':
        return stressManagementQuestions;
      default:
        return [];
    }
  };

  const getTestResultsCalculator = (testId: string) => {
    switch (testId) {
      case 'emotional-intelligence':
        return getEmotionalIntelligenceResults;
      case 'communication-style':
        return getCommunicationStyleResults;
      case 'love-languages':
        return getLoveLanguagesResults;
      case 'conflict-resolution':
        return getConflictResolutionResults;
      case 'stress-management':
        return getStressManagementResults;
      default:
        return () => ({
          score: 0,
          maxScore: 0,
          category: '',
          interpretation: '',
          recommendations: []
        });
    }
  };

  if (isLoading || !familyMembers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
              <Icon name="Brain" size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Развитие</h1>
              <p className="text-gray-600">Психологические тесты для всей семьи</p>
            </div>
          </div>

          {/* Инструкция */}
          <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen} className="mt-6">
            <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-start gap-3">
                <Icon name="Info" className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                    <h3 className="font-semibold text-purple-900 text-lg">
                      Как пользоваться разделом "Развитие"
                    </h3>
                    <Icon 
                      name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                      className="h-5 w-5 text-purple-600 transition-transform group-hover:scale-110" 
                    />
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-3 space-y-3">
                    <AlertDescription className="text-purple-800">
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium mb-2">🎯 Для чего нужен этот раздел?</p>
                          <p className="text-sm">
                            Раздел "Развитие" помогает каждому члену семьи лучше понять себя и друг друга через научно обоснованные психологические тесты. 
                            Это инструмент для личностного роста, улучшения коммуникации и укрепления семейных отношений.
                          </p>
                        </div>

                        <div>
                          <p className="font-medium mb-2">✨ Какая польза от тестов?</p>
                          <ul className="text-sm space-y-1 list-disc list-inside">
                            <li>Определите свой эмоциональный интеллект и стиль общения</li>
                            <li>Узнайте, как каждый член семьи воспринимает любовь и заботу</li>
                            <li>Научитесь эффективно разрешать конфликты и управлять стрессом</li>
                            <li>Поймите свой стиль воспитания и финансовую грамотность</li>
                            <li>Улучшите управление временем и семейную продуктивность</li>
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium mb-2">📋 Как пройти тест?</p>
                          <ol className="text-sm space-y-1 list-decimal list-inside">
                            <li>Выберите интересующий тест из списка ниже</li>
                            <li>Укажите, для кого вы проходите тест (себя или члена семьи)</li>
                            <li>Отвечайте честно — здесь нет правильных или неправильных ответов</li>
                            <li>Получите персональную интерпретацию результатов с рекомендациями</li>
                            <li>Результаты сохраняются в профиле и доступны в истории</li>
                          </ol>
                        </div>

                        <div>
                          <p className="font-medium mb-2">🔐 Как используются результаты?</p>
                          <p className="text-sm">
                            Все результаты тестов хранятся конфиденциально в профиле члена семьи. Они помогают:
                          </p>
                          <ul className="text-sm space-y-1 list-disc list-inside mt-2">
                            <li>Видеть динамику личностного развития со временем</li>
                            <li>Получать персонализированные рекомендации для семьи</li>
                            <li>Анализировать совместимость и сильные стороны каждого</li>
                            <li>Планировать семейные активности с учётом особенностей всех</li>
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-purple-200">
                          <p className="text-sm italic">
                            💡 <strong>Совет:</strong> Проходите тесты регулярно (раз в 3-6 месяцев), чтобы отслеживать свой прогресс и изменения в семейной динамике.
                          </p>
                        </div>
                      </div>
                    </AlertDescription>
                  </CollapsibleContent>
                </div>
              </div>
            </Alert>
          </Collapsible>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon name="FileText" size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{DEVELOPMENT_TESTS.length}</p>
                  <p className="text-sm text-gray-600">Доступно тестов</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Icon name="CheckCircle2" size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {familyMembers?.reduce((total, member) => {
                      const tests = member.development?.flatMap(d => d.tests.filter(t => t.status === 'completed')) || [];
                      return total + tests.length;
                    }, 0) || 0}
                  </p>
                  <p className="text-sm text-gray-600">Пройдено тестов</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Icon name="Users" size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{familyMembers?.length || 0}</p>
                  <p className="text-sm text-gray-600">Участников</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Icon name="TrendingUp" size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">0%</p>
                  <p className="text-sm text-gray-600">Средний прогресс</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Test */}
        {activeTest && (
          <InteractiveTest
            testId={activeTest}
            testName={DEVELOPMENT_TESTS.find(t => t.id === activeTest)?.name || ''}
            description={DEVELOPMENT_TESTS.find(t => t.id === activeTest)?.description || ''}
            questions={getTestQuestions(activeTest)}
            onComplete={(result) => handleTestComplete(activeTest, result)}
            onCancel={handleTestCancel}
            getResults={getTestResultsCalculator(activeTest)}
          />
        )}

        {/* Filters */}
        {!activeTest && (
          <div className="mb-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Категория</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="gap-2"
                >
                  <Icon name={cat.icon as any} size={16} />
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Член семьи
              {selectedMember === 'all' && (
                <span className="ml-2 text-xs text-orange-600 font-normal">
                  (выберите конкретного человека для прохождения теста)
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMember === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMember('all')}
              >
                Все члены
              </Button>
              {familyMembers?.map(member => (
                <Button
                  key={member.id}
                  variant={selectedMember === member.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMember(member.id)}
                >
                  {member.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Tests Grid */}
        {!activeTest && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map(test => {
            const completedCount = familyMembers?.filter(member => 
              getMemberProgress(member.id, test.id)?.status === 'completed'
            ).length || 0;
            const totalMembers = selectedMember === 'all' ? (familyMembers?.length || 0) : 1;
            const progress = totalMembers > 0 ? (completedCount / totalMembers) * 100 : 0;

            // Получаем историю тестов для выбранного пользователя
            const memberTestHistory = selectedMember !== 'all' 
              ? familyMembers?.find(m => m.id === selectedMember)?.development
                  ?.flatMap(d => d.tests.filter(t => t.id === test.id)) || []
              : [];

            return (
              <div key={test.id}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg ${test.color} border`}>
                        <Icon name={test.icon as any} size={24} />
                      </div>
                      {progress > 0 && (
                        <Badge variant="outline" className="bg-green-50">
                          <Icon name="CheckCircle2" size={14} className="mr-1" />
                          {completedCount}/{totalMembers}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Icon name="Clock" size={16} />
                        {test.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="FileText" size={16} />
                        {test.questions} вопросов
                      </div>
                    </div>

                    {progress > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Прогресс</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      onClick={() => handleStartTest(test.id)}
                      disabled={savingResult || selectedMember === 'all'}
                    >
                      {savingResult ? 'Сохранение...' : (progress > 0 ? 'Пройти ещё раз' : 'Начать тест')}
                      <Icon name="ArrowRight" size={16} className="ml-2" />
                    </Button>
                  </CardContent>
                </Card>
                
                {selectedMember !== 'all' && memberTestHistory.length > 0 && (
                  <TestHistory tests={memberTestHistory} testName={test.name} />
                )}
              </div>
            );
          })}
        </div>
        )}

        {!activeTest && filteredTests.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Icon name="Search" size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg text-gray-600">Тесты не найдены</p>
              <p className="text-sm text-gray-500 mt-2">Попробуйте изменить фильтры</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}