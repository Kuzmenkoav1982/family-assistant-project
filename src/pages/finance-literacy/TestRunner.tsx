import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { Question, Test, TestResultSummary } from './types';

interface TestRunnerProps {
  test: Test;
  questions: Question[];
  answers: Record<string, string>;
  setAnswers: (a: Record<string, string>) => void;
  submitting: boolean;
  testResult: TestResultSummary | null;
  onBack: () => void;
  onSubmit: () => void;
  onCloseResult: () => void;
  onRetake: () => void;
}

export default function TestRunner({
  test,
  questions,
  answers,
  setAnswers,
  submitting,
  testResult,
  onBack,
  onSubmit,
  onCloseResult,
  onRetake,
}: TestRunnerProps) {
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
            <Button variant="outline" className="flex-1" onClick={onCloseResult}>
              Назад к курсу
            </Button>
            {!testResult.passed && (
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={onRetake}>
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
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <h1 className="text-lg font-bold flex-1 truncate">{test.title}</h1>
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
            onClick={onSubmit}>
            {submitting ? 'Проверяю...' : `Завершить тест (${Object.keys(answers).length}/${questions.length})`}
          </Button>
        )}

        {questions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="FileQuestion" size={40} className="mx-auto mb-2 text-gray-300" />
            <p>Вопросы для этого теста ещё готовятся</p>
            <Button variant="outline" className="mt-3" onClick={onBack}>Назад</Button>
          </div>
        )}
      </div>
    </div>
  );
}
