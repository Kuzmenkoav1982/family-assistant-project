import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { AGE_LABELS, DIFF_LABELS, type Course, type Lesson, type Test, type TestResult } from './types';

interface CourseDetailProps {
  course: Course;
  lessons: Lesson[];
  tests: Test[];
  onBack: () => void;
  onOpenLesson: (lesson: Lesson) => void;
  onOpenTest: (test: Test) => void;
  isLessonCompleted: (lid: string) => boolean;
  getTestBest: (tid: string) => TestResult | null;
}

export default function CourseDetail({
  course,
  lessons,
  tests,
  onBack,
  onOpenLesson,
  onOpenTest,
  isLessonCompleted,
  getTestBest,
}: CourseDetailProps) {
  const completedLessons = lessons.filter(l => isLessonCompleted(l.id)).length;
  const courseProgress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <h1 className="text-lg font-bold flex-1 truncate">{course.title}</h1>
        </div>

        <Card className="overflow-hidden">
          <div className="h-2" style={{ backgroundColor: course.color }} />
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: course.color }}>
                <Icon name={course.icon || 'BookOpen'} size={24} className="text-white" />
              </div>
              <div>
                <Badge variant="outline" className="text-[10px]">{AGE_LABELS[course.age_group] || course.age_group}</Badge>
                <Badge className={`text-[10px] ml-1 ${DIFF_LABELS[course.difficulty]?.color || ''}`}>
                  {DIFF_LABELS[course.difficulty]?.label || course.difficulty}
                </Badge>
              </div>
            </div>
            {course.description && (
              <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
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
                    onClick={() => onOpenLesson(lesson)}>
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
                    onClick={() => onOpenTest(test)}>
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
