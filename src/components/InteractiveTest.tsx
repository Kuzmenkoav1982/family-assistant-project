import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface TestQuestion {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
    score: number;
  }[];
}

export interface TestResult {
  score: number;
  maxScore: number;
  category: string;
  interpretation: string;
  recommendations: string[];
}

interface InteractiveTestProps {
  testId: string;
  testName: string;
  description: string;
  questions: TestQuestion[];
  onComplete: (result: TestResult) => void;
  onCancel: () => void;
  getResults: (answers: Record<string, string>) => TestResult;
}

export default function InteractiveTest({
  testId,
  testName,
  description,
  questions,
  onComplete,
  onCancel,
  getResults
}: InteractiveTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const currentAnswer = answers[questions[currentQuestion].id];

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: value
    });
  };

  const handleNext = () => {
    if (!currentAnswer) return;

    if (isLastQuestion) {
      const testResults = getResults(answers);
      setResults(testResults);
      setShowResults(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = () => {
    if (results) {
      onComplete(results);
    }
  };

  if (showResults && results) {
    const percentage = Math.round((results.score / results.maxScore) * 100);
    
    return (
      <div className="space-y-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="p-3 bg-green-500 rounded-full">
                  <Icon name="Award" size={28} className="text-white" />
                </div>
                Тест завершен!
              </CardTitle>
              <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                {results.score} / {results.maxScore}
              </Badge>
            </div>
            <CardDescription className="text-lg">
              Результат: <span className="font-bold text-green-700">{results.category}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Общий балл</span>
                <span className="text-sm font-bold text-gray-900">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-green-100">
              <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Lightbulb" size={20} className="text-yellow-500" />
                Интерпретация результатов
              </h3>
              <p className="text-gray-700 leading-relaxed">{results.interpretation}</p>
            </div>

            {results.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-100">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="Target" size={20} className="text-blue-600" />
                  Рекомендации для развития
                </h3>
                <ul className="space-y-3">
                  {results.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 p-1 bg-blue-500 rounded-full flex-shrink-0">
                        <Icon name="Check" size={12} className="text-white" />
                      </div>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleComplete} className="flex-1" size="lg">
                <Icon name="Save" size={20} className="mr-2" />
                Сохранить результаты
              </Button>
              <Button onClick={onCancel} variant="outline" size="lg">
                Закрыть
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-sm">
              Вопрос {currentQuestion + 1} из {questions.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <Icon name="X" size={20} />
            </Button>
          </div>
          <CardTitle className="text-xl">{testName}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-sm text-gray-500 text-center">{Math.round(progress)}% завершено</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
            
            <RadioGroup value={currentAnswer} onValueChange={handleAnswer}>
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      currentAnswer === option.value
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleAnswer(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer text-gray-700">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex-1"
            >
              <Icon name="ChevronLeft" size={20} className="mr-2" />
              Назад
            </Button>
            <Button
              onClick={handleNext}
              disabled={!currentAnswer}
              className="flex-1"
            >
              {isLastQuestion ? 'Завершить тест' : 'Следующий вопрос'}
              <Icon name={isLastQuestion ? 'Check' : 'ChevronRight'} size={20} className="ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
