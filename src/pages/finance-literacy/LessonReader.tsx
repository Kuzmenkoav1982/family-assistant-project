import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { Lesson } from './types';

interface LessonReaderProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: (lessonId: string) => void;
}

export default function LessonReader({ lesson, onBack, onComplete }: LessonReaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <h1 className="text-lg font-bold flex-1 truncate">{lesson.title}</h1>
        </div>
        <Card>
          <CardContent className="p-4 prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{lesson.content}</div>
          </CardContent>
        </Card>
        <Button className="w-full bg-purple-600 hover:bg-purple-700"
          onClick={() => onComplete(lesson.id)}>
          <Icon name="Check" size={16} className="mr-2" /> Урок пройден
        </Button>
      </div>
    </div>
  );
}
