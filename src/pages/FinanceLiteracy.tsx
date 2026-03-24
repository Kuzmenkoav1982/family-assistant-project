import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

interface Course {
  id: string;
  title: string;
  description: string;
  age_group: string;
  difficulty: string;
  icon: string;
  color: string;
  lessons_count: number;
  tests_count: number;
}

interface Lesson {
  id: string;
  title: string;
  summary: string;
  sort_order: number;
  duration: number;
  content?: string;
  course_id?: string;
}

interface Test {
  id: string;
  title: string;
  description: string;
  pass_threshold: number;
  time_limit: number;
}

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  correct: string | number;
  explanation: string;
  points: number;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

interface TestResult {
  test_id: string;
  score: number;
  max_score: number;
  passed: boolean;
}

function getHeaders() {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': localStorage.getItem('authToken') || '' };
}

const AGE_LABELS: Record<string, string> = {
  child_6_10: '6–10 лет',
  child_11_14: '11–14 лет',
  teen_15_17: '15–17 лет',
  adult: 'Взрослые',
};

const DIFF_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Начальный', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'Средний', color: 'bg-amber-100 text-amber-700' },
  advanced: { label: 'Продвинутый', color: 'bg-red-100 text-red-700' },
};

export default function FinanceLiteracy() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [lessonsProgress, setLessonsProgress] = useState<LessonProgress[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const [readingLesson, setReadingLesson] = useState<Lesson | null>(null);

  const [takingTest, setTakingTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{ score: number; max_score: number; passed: boolean; percentage: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadCourses = useCallback(async () => {
    const res = await fetch(`${API}?section=edu_courses`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setCourses(data.courses || []);
    }
  }, []);

  const loadProgress = useCallback(async () => {
    const res = await fetch(`${API}?section=edu_progress`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setLessonsProgress(data.lessons_progress || []);
      setTestResults(data.test_results || []);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadCourses(), loadProgress()]).finally(() => setLoading(false));
  }, [loadCourses, loadProgress]);

  const openCourse = async (course: Course) => {
    setSelectedCourse(course);
    const res = await fetch(`${API}?section=edu_course&course_id=${course.id}`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setLessons(data.lessons || []);
      setTests(data.tests || []);
    }
  };

  const openLesson = async (lesson: Lesson) => {
    const res = await fetch(`${API}?section=edu_lesson&lesson_id=${lesson.id}`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setReadingLesson(data.lesson);
    }
  };

  const completeLesson = async (lessonId: string) => {
    await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'complete_lesson', lesson_id: lessonId })
    });
    toast.success('Урок пройден!');
    setReadingLesson(null);
    loadProgress();
  };

  const openTest = async (test: Test) => {
    const res = await fetch(`${API}?section=edu_test&test_id=${test.id}`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setTakingTest(data.test);
      setQuestions(data.questions || []);
      setAnswers({});
      setTestResult(null);
    }
  };

  const submitTest = async () => {
    if (!takingTest) return;
    setSubmitting(true);
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'submit_test', test_id: takingTest.id, answers })
    });
    setSubmitting(false);
    if (res.ok) {
      const data = await res.json();
      setTestResult(data);
      loadProgress();
    }
  };

  const isLessonCompleted = (lid: string) => lessonsProgress.some(p => p.lesson_id === lid && p.completed);
  const getTestBest = (tid: string) => {
    const results = testResults.filter(r => r.test_id === tid);
    if (results.length === 0) return null;
    return results.reduce((best, r) => r.score > best.score ? r : best, results[0]);
  };

  const filteredCourses = filter === 'all' ? courses : courses.filter(c => c.age_group === filter);
  const ageGroups = [...new Set(courses.map(c => c.age_group))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  // === READING LESSON ===
  if (readingLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setReadingLesson(null)}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <h1 className="text-lg font-bold flex-1 truncate">{readingLesson.title}</h1>
          </div>
          <Card>
            <CardContent className="p-4 prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{readingLesson.content}</div>
            </CardContent>
          </Card>
          <Button className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => completeLesson(readingLesson.id)}>
            <Icon name="Check" size={16} className="mr-2" /> Урок пройден
          </Button>
        </div>
      </div>
    );
  }

  // === TAKING TEST ===
  if (takingTest) {
    if (testResult) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
          <div className="max-w-2xl mx-auto p-4 space-y-4">
            <div className="text-center py-8">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${testResult.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                <Icon name={testResult.passed ? 'Trophy' : 'RotateCcw'} size={36}
                  className={testResult.passed ? 'text-green-600' : 'text-red-600'} />
              </div>
              <h2 className="text-xl font-bold">{testResult.passed ? 'Тест пройден!' : 'Попробуйте ещё раз'}</h2>
              <p className="text-3xl font-bold mt-2">{testResult.score} / {testResult.max_score}</p>
              <p className="text-muted-foreground">{testResult.percentage}% правильных ответов</p>
              <Progress value={testResult.percentage} className="h-3 mt-4 max-w-xs mx-auto" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setTakingTest(null); setTestResult(null); }}>
                Назад к курсу
              </Button>
              {!testResult.passed && (
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => { setAnswers({}); setTestResult(null); }}>
                  Пройти заново
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setTakingTest(null)}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <h1 className="text-lg font-bold flex-1 truncate">{takingTest.title}</h1>
          </div>

          {questions.map((q, qi) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <p className="font-medium text-sm mb-3">{qi + 1}. {q.text}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button key={oi} onClick={() => setAnswers({ ...answers, [q.id]: String(oi) })}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                        answers[q.id] === String(oi)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {questions.length > 0 && (
            <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled={submitting}
              onClick={submitTest}>
              {submitting ? 'Проверяю...' : `Завершить тест (${Object.keys(answers).length}/${questions.length})`}
            </Button>
          )}

          {questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="FileQuestion" size={40} className="mx-auto mb-2 text-gray-300" />
              <p>Вопросы для этого теста ещё готовятся</p>
              <Button variant="outline" className="mt-3" onClick={() => setTakingTest(null)}>Назад</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === COURSE DETAIL ===
  if (selectedCourse) {
    const completedLessons = lessons.filter(l => isLessonCompleted(l.id)).length;
    const courseProgress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedCourse(null)}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <h1 className="text-lg font-bold flex-1 truncate">{selectedCourse.title}</h1>
          </div>

          <Card className="overflow-hidden">
            <div className="h-2" style={{ backgroundColor: selectedCourse.color }} />
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selectedCourse.color }}>
                  <Icon name={selectedCourse.icon || 'BookOpen'} size={24} className="text-white" />
                </div>
                <div>
                  <Badge variant="outline" className="text-[10px]">{AGE_LABELS[selectedCourse.age_group] || selectedCourse.age_group}</Badge>
                  <Badge className={`text-[10px] ml-1 ${DIFF_LABELS[selectedCourse.difficulty]?.color || ''}`}>
                    {DIFF_LABELS[selectedCourse.difficulty]?.label || selectedCourse.difficulty}
                  </Badge>
                </div>
              </div>
              {selectedCourse.description && (
                <p className="text-sm text-muted-foreground mb-3">{selectedCourse.description}</p>
              )}
              {lessons.length > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{completedLessons} из {lessons.length} уроков</span>
                    <span>{Math.round(courseProgress)}%</span>
                  </div>
                  <Progress value={courseProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {lessons.length > 0 && (
            <>
              <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Уроки</h2>
              <div className="space-y-2">
                {lessons.map((lesson, i) => {
                  const completed = isLessonCompleted(lesson.id);
                  return (
                    <Card key={lesson.id} className="cursor-pointer hover:shadow-md transition-all"
                      onClick={() => openLesson(lesson)}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          completed ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                          {completed ? <Icon name="Check" size={16} /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{lesson.title}</p>
                          {lesson.duration && <p className="text-xs text-muted-foreground">{lesson.duration} мин</p>}
                        </div>
                        <Icon name="ChevronRight" size={16} className="text-gray-400" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {tests.length > 0 && (
            <>
              <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mt-4">Тесты</h2>
              <div className="space-y-2">
                {tests.map(test => {
                  const best = getTestBest(test.id);
                  return (
                    <Card key={test.id} className="cursor-pointer hover:shadow-md transition-all"
                      onClick={() => openTest(test)}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          best?.passed ? 'bg-green-100' : 'bg-amber-100'
                        }`}>
                          <Icon name={best?.passed ? 'Trophy' : 'FileQuestion'} size={16}
                            className={best?.passed ? 'text-green-600' : 'text-amber-600'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{test.title}</p>
                          {best && <p className="text-xs text-muted-foreground">Лучший: {best.score}/{best.max_score}</p>}
                        </div>
                        <Icon name="ChevronRight" size={16} className="text-gray-400" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {lessons.length === 0 && tests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Clock" size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Уроки для этого курса готовятся</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === COURSES LIST ===
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/finance')}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <h1 className="text-xl font-bold">Финансовая грамотность</h1>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-purple-500/10 via-violet-500/5 to-transparent border border-purple-200/50 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Icon name="GraduationCap" size={16} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Обучение для всей семьи</p>
              <p className="text-xs text-purple-600/80 mt-0.5">
                Курсы по возрастам: от первых денег для детей до инвестиций для взрослых
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm"
            className={filter === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            onClick={() => setFilter('all')}>Все</Button>
          {ageGroups.map(ag => (
            <Button key={ag} variant={filter === ag ? 'default' : 'outline'} size="sm"
              className={`whitespace-nowrap ${filter === ag ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
              onClick={() => setFilter(ag)}>
              {AGE_LABELS[ag] || ag}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredCourses.map(course => (
            <Card key={course.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              onClick={() => openCourse(course)}>
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  <div className="w-16 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: course.color + '15' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: course.color }}>
                      <Icon name={course.icon || 'BookOpen'} size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm truncate">{course.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">{AGE_LABELS[course.age_group] || course.age_group}</Badge>
                      <Badge className={`text-[10px] ${DIFF_LABELS[course.difficulty]?.color || ''}`}>
                        {DIFF_LABELS[course.difficulty]?.label || course.difficulty}
                      </Badge>
                    </div>
                    {course.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      {course.lessons_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Icon name="BookOpen" size={12} /> {course.lessons_count} уроков
                        </span>
                      )}
                      {course.tests_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Icon name="FileQuestion" size={12} /> {course.tests_count} тестов
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center pr-3">
                    <Icon name="ChevronRight" size={18} className="text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
