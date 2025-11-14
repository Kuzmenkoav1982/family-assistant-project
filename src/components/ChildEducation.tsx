import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { FamilyMember, TestQuestion, TestResult, LearningMaterial, AIRecommendationForChild } from '@/types/family.types';
import { useFamilyData } from '@/hooks/useFamilyData';

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

    // Сохраняем на сервер
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
      // Продолжаем работу даже при ошибке - данные сохранены локально
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

  const getLatestResult = () => testResults[testResults.length - 1];

  const getRadarData = () => {
    const latest = getLatestResult();
    if (!latest) return [];

    return [
      { category: 'Логика', value: latest.scores.logic, fullMark: 100 },
      { category: 'Математика', value: latest.scores.math, fullMark: 100 },
      { category: 'Язык', value: latest.scores.language, fullMark: 100 },
      { category: 'Память', value: latest.scores.memory, fullMark: 100 },
      { category: 'Внимание', value: latest.scores.attention, fullMark: 100 },
      { category: 'Творчество', value: latest.scores.creativity, fullMark: 100 }
    ];
  };

  const getProgressData = () => {
    return testResults.map((result, idx) => ({
      test: `Тест ${idx + 1}`,
      date: new Date(result.date).toLocaleDateString('ru-RU'),
      общий: Math.round((result.totalScore / result.maxScore) * 100),
      логика: result.scores.logic,
      математика: result.scores.math,
      язык: result.scores.language
    }));
  };

  const getWeakAreas = () => {
    const latest = getLatestResult();
    if (!latest) return [];

    const areas = Object.entries(latest.scores)
      .map(([key, value]) => ({ category: key, score: value }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);

    return areas;
  };

  const getRecommendations = () => {
    const weakAreas = getWeakAreas();
    const recommendations: AIRecommendationForChild[] = [];

    weakAreas.forEach(area => {
      const categoryMap: Record<string, string> = {
        logic: 'Логическое мышление',
        math: 'Математические навыки',
        language: 'Языковые способности',
        memory: 'Память',
        attention: 'Внимание',
        creativity: 'Творчество'
      };

      const rec: AIRecommendationForChild = {
        id: Date.now().toString() + area.category,
        childId: child.id,
        category: categoryMap[area.category] || area.category,
        weakArea: area.category,
        currentLevel: area.score,
        targetLevel: 80,
        recommendations: [
          `Уделите 15-20 минут в день на развитие ${categoryMap[area.category]?.toLowerCase()}`,
          'Используйте игровые методики для повышения интереса',
          'Постепенно увеличивайте сложность заданий',
          'Поощряйте каждый успех ребёнка'
        ],
        suggestedMaterials: learningMaterials
          .filter(m => m.category === area.category)
          .map(m => m.id),
        estimatedTimeToImprove: '2-3 недели',
        createdAt: new Date().toISOString()
      };

      recommendations.push(rec);
    });

    return recommendations;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      logic: '🧩',
      math: '🔢',
      language: '📚',
      memory: '🧠',
      attention: '🎯',
      creativity: '🎨'
    };
    return icons[category] || '📖';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-500',
      medium: 'bg-yellow-500',
      hard: 'bg-red-500'
    };
    return colors[difficulty] || 'bg-gray-500';
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
          {!activeTest && !showResults && (
            <Card>
              <CardHeader>
                <CardTitle>Доступные тесты</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">🧠 IQ Тест</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Комплексный тест для оценки развития ребёнка
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          <Icon name="Clock" className="mr-1" size={12} />
                          ~10 мин
                        </Badge>
                        <Badge variant="outline">
                          <Icon name="Layers" className="mr-1" size={12} />
                          {testQuestions.length} вопросов
                        </Badge>
                      </div>
                    </div>
                    <Button onClick={startTest} size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                      <Icon name="Play" className="mr-2" size={18} />
                      Начать тест
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-white/60 p-3 rounded-lg text-center">
                      <div className="text-2xl mb-1">🧩</div>
                      <div className="text-xs font-medium">Логика</div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg text-center">
                      <div className="text-2xl mb-1">🔢</div>
                      <div className="text-xs font-medium">Математика</div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg text-center">
                      <div className="text-2xl mb-1">📚</div>
                      <div className="text-xs font-medium">Язык</div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg text-center">
                      <div className="text-2xl mb-1">🧠</div>
                      <div className="text-xs font-medium">Память</div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg text-center">
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="text-xs font-medium">Внимание</div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg text-center">
                      <div className="text-2xl mb-1">🎨</div>
                      <div className="text-xs font-medium">Творчество</div>
                    </div>
                  </div>
                </div>

                {testResults.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="CheckCircle2" className="text-green-600" size={20} />
                      <span className="font-semibold text-green-900">
                        Пройдено тестов: {testResults.length}
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      Последний тест: {new Date(testResults[testResults.length - 1].date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTest && (
            <Card className="border-2 border-purple-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Вопрос {currentQuestion + 1} из {testQuestions.length}
                  </CardTitle>
                  <Badge className="bg-purple-600">
                    {getCategoryIcon(currentQuestionData.category)} {currentQuestionData.category}
                  </Badge>
                </div>
                <Progress value={((currentQuestion + 1) / testQuestions.length) * 100} className="mt-2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-lg font-medium mb-4">{currentQuestionData.question}</p>
                  <div className="space-y-3">
                    {currentQuestionData.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedAnswer === index
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-gray-300 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswer === index ? 'border-purple-500 bg-purple-500' : 'border-gray-400'
                          }`}>
                            {selectedAnswer === index && (
                              <Icon name="Check" className="text-white" size={16} />
                            )}
                          </div>
                          <span className="font-medium">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveTest(false);
                      setCurrentQuestion(0);
                      setTestAnswers([]);
                    }}
                  >
                    <Icon name="X" className="mr-2" size={16} />
                    Отменить
                  </Button>
                  <Button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswer === null}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {currentQuestion < testQuestions.length - 1 ? 'Следующий' : 'Завершить'}
                    <Icon name="ArrowRight" className="ml-2" size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results">
          {testResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Icon name="BarChart3" className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-lg text-muted-foreground mb-4">
                  Результатов пока нет
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Пройдите первый тест, чтобы увидеть статистику развития
                </p>
                <Button onClick={() => startTest()} className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Icon name="Play" className="mr-2" size={16} />
                  Пройти тест
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" className="text-green-600" size={24} />
                    Текущий уровень развития
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={getRadarData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name={child.name}
                          dataKey="value"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {testResults.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="LineChart" className="text-blue-600" size={24} />
                      Прогресс по тестам
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getProgressData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="общий" stroke="#8b5cf6" strokeWidth={2} />
                          <Line type="monotone" dataKey="логика" stroke="#3b82f6" />
                          <Line type="monotone" dataKey="математика" stroke="#10b981" />
                          <Line type="monotone" dataKey="язык" stroke="#f59e0b" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(getLatestResult().scores).map(([category, score]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(category)}</span>
                        {category === 'logic' && 'Логика'}
                        {category === 'math' && 'Математика'}
                        {category === 'language' && 'Язык'}
                        {category === 'memory' && 'Память'}
                        {category === 'attention' && 'Внимание'}
                        {category === 'creativity' && 'Творчество'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold">{score}%</span>
                        <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}>
                          {score >= 80 ? 'Отлично' : score >= 60 ? 'Хорошо' : 'Нужно улучшить'}
                        </Badge>
                      </div>
                      <Progress value={score} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="materials">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningMaterials.map((material) => (
              <Card key={material.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-4xl mb-2">{material.icon}</div>
                    <Badge className={getDifficultyColor(material.difficulty)}>
                      {material.difficulty === 'easy' && 'Легко'}
                      {material.difficulty === 'medium' && 'Средне'}
                      {material.difficulty === 'hard' && 'Сложно'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{material.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{material.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <Icon name="Users" className="mr-1" size={12} />
                      {material.ageRange} лет
                    </Badge>
                    <Badge variant="outline">
                      <Icon name="Clock" className="mr-1" size={12} />
                      {material.duration}
                    </Badge>
                    <Badge variant="outline">
                      {material.type === 'video' && '🎥 Видео'}
                      {material.type === 'article' && '📄 Статья'}
                      {material.type === 'exercise' && '✏️ Упражнение'}
                      {material.type === 'game' && '🎮 Игра'}
                    </Badge>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Icon name="Play" className="mr-2" size={16} />
                    Начать
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          {testResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Icon name="Lightbulb" className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-lg text-muted-foreground mb-4">
                  Рекомендации появятся после первого теста
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  ИИ-помощник проанализирует результаты и даст персональные советы
                </p>
                <Button onClick={() => startTest()} className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Icon name="Play" className="mr-2" size={16} />
                  Пройти тест
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Sparkles" className="text-yellow-600" size={24} />
                    ИИ-рекомендации для {child.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    На основе анализа результатов теста, ИИ-помощник выявил области для развития
                  </p>
                  
                  {getWeakAreas().length > 0 && (
                    <div className="bg-white/60 border border-yellow-300 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="Target" className="text-orange-600" size={20} />
                        <span className="font-semibold">Области для улучшения:</span>
                      </div>
                      <div className="flex gap-2">
                        {getWeakAreas().map((area) => (
                          <Badge key={area.category} variant="outline" className="bg-orange-100">
                            {getCategoryIcon(area.category)} {area.category} ({area.score}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {getRecommendations().map((rec) => (
                <Card key={rec.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-2">{rec.category}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            Текущий: {rec.currentLevel}%
                          </Badge>
                          <Badge className="bg-green-600">
                            Цель: {rec.targetLevel}%
                          </Badge>
                        </div>
                      </div>
                      <Icon name="TrendingUp" className="text-blue-600" size={32} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Progress value={rec.currentLevel} className="mb-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        До цели: {rec.targetLevel - rec.currentLevel}%
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="Lightbulb" className="text-blue-600" size={18} />
                        <span className="font-semibold text-sm">Рекомендации:</span>
                      </div>
                      <ul className="space-y-2">
                        {rec.recommendations.map((recommendation, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Icon name="CheckCircle2" className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="BookOpen" className="text-purple-600" size={18} />
                        <span className="font-semibold text-sm">Рекомендуемые материалы:</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {learningMaterials
                          .filter(m => rec.suggestedMaterials.includes(m.id))
                          .map(material => (
                            <button
                              key={material.id}
                              className="flex items-center gap-3 p-3 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-all text-left"
                            >
                              <span className="text-2xl">{material.icon}</span>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{material.title}</p>
                                <p className="text-xs text-muted-foreground">{material.duration}</p>
                              </div>
                              <Icon name="ChevronRight" className="text-purple-600" size={18} />
                            </button>
                          ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" className="text-green-600" size={18} />
                        <span className="text-sm font-medium">Время до улучшения:</span>
                      </div>
                      <Badge className="bg-green-600">{rec.estimatedTimeToImprove}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}