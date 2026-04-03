import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import useDietQuiz from '@/hooks/useDietQuiz';
import QuizSteps from '@/components/diet-quiz/QuizSteps';
import PlanResult from '@/components/diet-quiz/PlanResult';
import { GeneratingScreen, RawTextScreen, ErrorScreen } from '@/components/diet-quiz/SpecialScreens';
import { steps } from '@/data/dietQuizData';

export default function DietQuiz() {
  const q = useDietQuiz();

  if (q.isGenerating) {
    return <GeneratingScreen durationDays={q.data.duration_days} />;
  }

  if (q.generatedPlan) {
    return (
      <PlanResult
        plan={q.generatedPlan}
        selectedDay={q.selectedDay}
        setSelectedDay={q.setSelectedDay}
        isSaving={q.isSaving}
        saved={q.saved}
        savedPlanId={q.savedPlanId}
        onSaveToMenu={q.handleSaveToMenu}
        onBack={() => { q.setGeneratedPlan(null); q.setSaved(false); q.setCurrentStep(4); }}
        navigate={q.navigate}
      />
    );
  }

  if (q.rawText) {
    return (
      <RawTextScreen
        rawText={q.rawText}
        onBack={() => { q.setRawText(null); q.setCurrentStep(4); }}
      />
    );
  }

  if (q.error) {
    return (
      <ErrorScreen
        error={q.error}
        onBack={() => { q.setError(null); q.setCurrentStep(4); }}
        onRetry={() => { q.setError(null); q.handleSubmit(); }}
        navigate={q.navigate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-5">
        <SectionHero
          title="ИИ-Диета: Анкета"
          subtitle="Персональный план питания на основе ваших данных"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/d7c58841-84f0-499f-8586-6f01ffa25f4d.jpg"
          backPath="/nutrition"
        />

        <div className="flex items-center gap-3">
          {q.currentStep > 0 && (
            <Button variant="ghost" size="sm" onClick={() => q.setCurrentStep(q.currentStep - 1)}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="text-xs">{q.currentStep + 1}/{steps.length}</Badge>
            </div>
            <Progress value={q.progress} className="h-1.5" />
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <button
              key={step.id}
              onClick={() => i <= q.currentStep && q.setCurrentStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                i === q.currentStep
                  ? 'bg-violet-600 text-white'
                  : i < q.currentStep
                  ? 'bg-violet-100 text-violet-700 cursor-pointer'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Icon name={i < q.currentStep ? 'SquareCheck' : step.icon} size={14} />
              {step.title}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4">
              <h2 className="font-bold text-lg">{steps[q.currentStep].title}</h2>
              <p className="text-sm text-muted-foreground">{steps[q.currentStep].description}</p>
            </div>
            <QuizSteps
              step={q.currentStep}
              data={q.data}
              update={q.update}
              toggleArrayItem={q.toggleArrayItem}
              detectedTables={q.detectedTables}
              walletBalance={q.walletBalance}
              navigate={q.navigate}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {q.currentStep > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => q.setCurrentStep(q.currentStep - 1)}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
          )}
          {q.currentStep < steps.length - 1 ? (
            <Button className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600" disabled={!q.canNext()} onClick={() => q.setCurrentStep(q.currentStep + 1)}>
              Далее
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          ) : (
            <Button className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600" onClick={q.handleSubmit}>
              <Icon name="Sparkles" size={16} className="mr-2" />
              Запустить ИИ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
