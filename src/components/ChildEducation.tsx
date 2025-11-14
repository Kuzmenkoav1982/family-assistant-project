import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { FamilyMember, TestQuestion, TestResult, LearningMaterial } from '@/types/family.types';
import { useFamilyData } from '@/hooks/useFamilyData';
import EducationTestTab from './education/EducationTestTab';
import EducationResultsTab from './education/EducationResultsTab';
import EducationMaterialsTab from './education/EducationMaterialsTab';
import EducationRecommendationsTab from './education/EducationRecommendationsTab';

interface ChildEducationProps {
  child: FamilyMember;
  onComplete?: () => void;
}

const testQuestions: TestQuestion[] = [
  {
    id: '1',
    question: 'Какое число продолжает последовательность: 2, 4, 8, 16, ?',
    options: ['24', '32', '20', '18'],
    correctAnswer: 1,
    category: 'logic',
    difficulty: 'medium',
    ageRange: '8-12',
    points: 10
  },
  {
    id: '2',
    question: 'Сколько будет 15 + 27?',
    options: ['42', '41', '43', '40'],
    correctAnswer: 0,
    category: 'math',
    difficulty: 'easy',
    ageRange: '7-10',
    points: 5
  },
  {
    id: '3',
    question: 'Выберите синоним слова "радостный":',
    options: ['грустный', 'весёлый', 'злой', 'спокойный'],
    correctAnswer: 1,
    category: 'language',
    difficulty: 'easy',
    ageRange: '7-12',
    points: 5
  },
  {
    id: '4',
    question: 'Запомните числа: 7, 3, 9, 1, 5. Какое число было третьим?',
    options: ['7', '3', '9', '1'],
    correctAnswer: 2,
    category: 'memory',
    difficulty: 'medium',
    ageRange: '8-14',
    points: 10
  },
  {
    id: '5',
    question: 'Если все кошки - животные, и Мурка - кошка, то:',
    options: ['Мурка не животное', 'Мурка - животное', 'Все животные - кошки', 'Ничего нельзя сказать'],
    correctAnswer: 1,
    category: 'logic',
    difficulty: 'medium',
    ageRange: '9-13',
    points: 10
  },
  {
    id: '6',
    question: 'Сколько слов можно составить из букв слова "КОТ"?',
    options: ['2', '3', '4', '5'],
    correctAnswer: 1,
    category: 'creativity',
    difficulty: 'medium',
    ageRange: '8-12',
    points: 10
  }
];

const learningMaterials: LearningMaterial[] = [
  {
    id: 'mat1',
    title: 'Логические задачи для начинающих',
    description: 'Развивайте логическое мышление с помощью интересных головоломок',
    category: 'logic',
    ageRange: '7-10',
    difficulty: 'easy',
    type: 'exercise',
    duration: '15 мин',
    icon: '🧩'
  },
  {
    id: 'mat2',
    title: 'Таблица умножения в игровой форме',
    description: 'Учите таблицу умножения играючи!',
    category: 'math',
    ageRange: '7-11',
    difficulty: 'medium',
    type: 'game',
    duration: '20 мин',
    icon: '🔢'
  },
  {
    id: 'mat3',
    title: 'Расширяем словарный запас',
    description: 'Изучайте новые слова каждый день',
    category: 'language',
    ageRange: '8-14',
    difficulty: 'easy',
    type: 'article',
    duration: '10 мин',
    icon: '📚'
  },
  {
    id: 'mat4',
    title: 'Тренировка памяти: игры и упражнения',
    description: 'Улучшайте память с помощью специальных техник',
    category: 'memory',
    ageRange: '7-15',
    difficulty: 'medium',
    type: 'exercise',
    duration: '15 мин',
    icon: '🧠'
  },
  {
    id: 'mat5',
    title: 'Развитие внимания и концентрации',
    description: 'Упражнения для улучшения концентрации внимания',
    category: 'attention',
    ageRange: '6-12',
    difficulty: 'easy',
    type: 'exercise',
    duration: '10 мин',
    icon: '🎯'
  },
  {
    id: 'mat6',
    title: 'Креативное мышление: рисуем и фантазируем',
    description: 'Развивайте творческие способности через искусство',
    category: 'creativity',
    ageRange: '5-12',
    difficulty: 'easy',
    type: 'video',
    duration: '25 мин',
    icon: '🎨'
  }
];

export function ChildEducation({ child, onComplete }: ChildEducationProps) {
  const { saveTestResult, syncing } = useFamilyData();
  const [activeTest, setActiveTest] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [testAnswers, setTestAnswers] = useState<{ questionId: string; userAnswer: number; correct: boolean }[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>(() => {
    const stored = localStorage.getItem(`test_results_${child.id}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [saving, setSaving] = useState(false);

  const currentQuestionData = testQuestions[currentQuestion];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestionData.correctAnswer;
    const newAnswer = {
      questionId: currentQuestionData.id,
      userAnswer: selectedAnswer,
      correct: isCorrect
    };

    setTestAnswers([...testAnswers, newAnswer]);
    setSelectedAnswer(null);

    if (currentQuestion < testQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTest([...testAnswers, newAnswer]);
    }
  };

  const finishTest = async (answers: { questionId: string; userAnswer: number; correct: boolean }[]) => {
    const categoryScores = {
      logic: 0,
      math: 0,
      language: 0,
      memory: 0,
      attention: 0,
      creativity: 0
    };

    const categoryMax = {
      logic: 0,
      math: 0,
      language: 0,
      memory: 0,
      attention: 0,
      creativity: 0
    };

    testQuestions.forEach((q, idx) => {
      categoryMax[q.category] += q.points;
      if (answers[idx]?.correct) {
        categoryScores[q.category] += q.points;
      }
    });

    const totalScore = Object.values(categoryScores).reduce((a, b) => a + b, 0);
    const maxScore = Object.values(categoryMax).reduce((a, b) => a + b, 0);

    const normalizedScores = {
      logic: categoryMax.logic > 0 ? Math.round((categoryScores.logic / categoryMax.logic) * 100) : 0,
      math: categoryMax.math > 0 ? Math.round((categoryScores.math / categoryMax.math) * 100) : 0,
      language: categoryMax.language > 0 ? Math.round((categoryScores.language / categoryMax.language) * 100) : 0,
      memory: categoryMax.memory > 0 ? Math.round((categoryScores.memory / categoryMax.memory) * 100) : 0,
      attention: categoryMax.attention > 0 ? Math.round((categoryScores.attention / categoryMax.attention) * 100) : 0,
      creativity: categoryMax.creativity > 0 ? Math.round((categoryScores.creativity / categoryMax.creativity) * 100) : 0
    };

    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    const result: TestResult = {
      id: Date.now().toString(),
      childId: child.id,
      testType: 'IQ Test',
      date: new Date().toISOString(),
      scores: normalizedScores,
      totalScore,
      maxScore,
      timeSpent,
      answers
    };

    const updatedResults = [...testResults, result];
    setTestResults(updatedResults);
    localStorage.setItem(`test_results_${child.id}`, JSON.stringify(updatedResults));

    setSaving(true);
    try {
      await saveTestResult(child.id, {
        testType: result.testType,
        scores: result.scores,
        totalScore: result.totalScore,
        maxScore: result.maxScore,
        timeSpent: result.timeSpent,
        answers: result.answers
      });
    } catch (err) {
      console.error('Ошибка сохранения на сервер:', err);
    } finally {
      setSaving(false);
    }

    setShowResults(true);
    setActiveTest(false);
  };

  const startTest = () => {
    setActiveTest(true);
    setCurrentQuestion(0);
    setTestAnswers([]);
    setSelectedAnswer(null);
    setShowResults(false);
  };

  const cancelTest = () => {
    setActiveTest(false);
    setCurrentQuestion(0);
    setTestAnswers([]);
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="text-4xl">{child.avatar}</div>
            <div>
              <div className="text-2xl">Обучение: {child.name}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {child.age ? `${child.age} лет` : 'Возраст не указан'}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3">
            Развивайте способности ребёнка с помощью тестов и обучающих материалов. 
            ИИ-помощник даст персональные рекомендации на основе результатов!
          </p>
          {(saving || syncing) && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
              <Icon name="Loader" className="animate-spin" size={16} />
              <span>Синхронизация с сервером...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="tests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tests">
            <Icon name="FileText" className="mr-2" size={16} />
            Тесты
          </TabsTrigger>
          <TabsTrigger value="results">
            <Icon name="TrendingUp" className="mr-2" size={16} />
            Результаты
          </TabsTrigger>
          <TabsTrigger value="materials">
            <Icon name="BookOpen" className="mr-2" size={16} />
            Материалы
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Icon name="Lightbulb" className="mr-2" size={16} />
            Рекомендации
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          <EducationTestTab
            activeTest={activeTest}
            showResults={showResults}
            currentQuestion={currentQuestion}
            selectedAnswer={selectedAnswer}
            testQuestions={testQuestions}
            testResults={testResults}
            onStartTest={startTest}
            onAnswerSelect={handleAnswerSelect}
            onNextQuestion={handleNextQuestion}
            onCancelTest={cancelTest}
          />
        </TabsContent>

        <TabsContent value="results">
          <EducationResultsTab
            child={child}
            testResults={testResults}
            onStartTest={startTest}
          />
        </TabsContent>

        <TabsContent value="materials">
          <EducationMaterialsTab materials={learningMaterials} />
        </TabsContent>

        <TabsContent value="recommendations">
          <EducationRecommendationsTab
            child={child}
            testResults={testResults}
            learningMaterials={learningMaterials}
            onStartTest={startTest}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
