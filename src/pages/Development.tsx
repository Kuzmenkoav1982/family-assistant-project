import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { toast } from 'sonner';
import { Development as DevelopmentType, Test } from '@/types/family.types';
import InteractiveTest, { TestResult } from '@/components/InteractiveTest';
import TestHistory from '@/components/TestHistory';
import DevelopmentInsights from '@/components/DevelopmentInsights';
import { DevelopmentHeader } from '@/components/development/DevelopmentHeader';
import { DevelopmentFilters } from '@/components/development/DevelopmentFilters';
import { DevelopmentTestsList } from '@/components/development/DevelopmentTestsList';
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
import {
  financialLiteracyQuestions,
  getFinancialLiteracyResults,
  parentingStyleQuestions,
  getParentingStyleResults,
  timeManagementQuestions,
  getTimeManagementResults
} from '@/data/financialTests';

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
      
      let psychologyDev = currentDevelopment.find(d => d.area === 'education');
      
      if (psychologyDev) {
        const existingTestIndex = psychologyDev.tests.findIndex(t => t.id === testId);
        if (existingTestIndex >= 0) {
          psychologyDev.tests[existingTestIndex] = testData;
        } else {
          psychologyDev.tests.push(testData);
        }
      } else {
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

  const getTestConfig = (testId: string) => {
    const configs: Record<string, { questions: any[]; getResults: (answers: any[]) => TestResult }> = {
      'emotional-intelligence': {
        questions: emotionalIntelligenceQuestions,
        getResults: getEmotionalIntelligenceResults
      },
      'communication-style': {
        questions: communicationStyleQuestions,
        getResults: getCommunicationStyleResults
      },
      'conflict-resolution': {
        questions: conflictResolutionQuestions,
        getResults: getConflictResolutionResults
      },
      'stress-management': {
        questions: stressManagementQuestions,
        getResults: getStressManagementResults
      },
      'love-languages': {
        questions: loveLanguagesQuestions,
        getResults: getLoveLanguagesResults
      },
      'parenting-style': {
        questions: parentingStyleQuestions,
        getResults: getParentingStyleResults
      },
      'time-management': {
        questions: timeManagementQuestions,
        getResults: getTimeManagementResults
      },
      'financial-literacy': {
        questions: financialLiteracyQuestions,
        getResults: getFinancialLiteracyResults
      }
    };
    
    return configs[testId];
  };

  const activeTestInfo = DEVELOPMENT_TESTS.find(t => t.id === activeTest);
  const testConfig = activeTest ? getTestConfig(activeTest) : null;

  if (activeTest && testConfig && activeTestInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <InteractiveTest
              testId={activeTest}
              testName={activeTestInfo.name}
              questions={testConfig.questions}
              getResults={testConfig.getResults}
              onComplete={(result) => handleTestComplete(activeTest, result)}
              onCancel={() => setActiveTest(null)}
              isSaving={savingResult}
            />
          </Card>
        </div>
      </div>
    );
  }

  const selectedMemberData = familyMembers?.find(m => m.id === selectedMember);
  const allTests = selectedMemberData?.development?.flatMap(d => d.tests) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <DevelopmentHeader
          onNavigateBack={() => navigate('/')}
          testsCount={DEVELOPMENT_TESTS.length}
          isInstructionOpen={isInstructionOpen}
          onInstructionToggle={setIsInstructionOpen}
        />

        <DevelopmentFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          familyMembers={familyMembers || []}
          selectedMember={selectedMember}
          onMemberChange={setSelectedMember}
          isLoading={isLoading}
        />

        {selectedMember !== 'all' && selectedMemberData && (
          <>
            {allTests.length > 0 && (
              <TestHistory 
                tests={allTests}
                getMaxScore={getMaxScoreForTest}
              />
            )}
            
            {selectedMemberData.development && selectedMemberData.development.length > 0 && (
              <DevelopmentInsights 
                development={selectedMemberData.development}
                memberName={selectedMemberData.name}
              />
            )}
          </>
        )}

        <DevelopmentTestsList
          tests={filteredTests}
          selectedMember={selectedMember}
          onStartTest={handleStartTest}
          getMemberProgress={getMemberProgress}
          getMaxScoreForTest={getMaxScoreForTest}
        />
      </div>
    </div>
  );
}
