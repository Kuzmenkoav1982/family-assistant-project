import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import {
  SCENARIO_REGISTRY,
  saveScenarioProgress,
  loadScenarioProgress,
  clearScenarioProgress,
} from '@/components/domovoy/registry/scenarioRegistry';

interface DomovoyGuideProps {
  scenarioId: string;
  initialStep?: number;
  onClose: () => void;
  onComplete: () => void;
  onNavigate?: (href: string) => void;
}

const DomovoyGuide: React.FC<DomovoyGuideProps> = ({
  scenarioId,
  initialStep,
  onClose,
  onComplete,
  onNavigate,
}) => {
  const scenario = SCENARIO_REGISTRY[scenarioId];

  const resolveInitialStep = useCallback((): number => {
    if (typeof initialStep === 'number') return initialStep;
    const saved = loadScenarioProgress(scenarioId);
    return saved ? saved.stepIndex : 0;
  }, [scenarioId, initialStep]);

  const [currentStep, setCurrentStep] = useState<number>(resolveInitialStep);
  const [expandedExplanation, setExpandedExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCurrentStep(resolveInitialStep());
    setExpandedExplanation(false);
    setCompleted(false);
  }, [scenarioId, resolveInitialStep]);

  if (!scenario) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <Icon name="AlertCircle" size={32} className="text-slate-300" />
        <p className="text-sm text-slate-500">Сценарий не найден: {scenarioId}</p>
        <button
          onClick={onClose}
          className="text-xs text-indigo-600 font-medium hover:underline"
        >
          Закрыть
        </button>
      </div>
    );
  }

  const step = scenario.steps[currentStep];
  const isLast = currentStep === scenario.totalSteps - 1;
  const progress = Math.round(((currentStep) / scenario.totalSteps) * 100);

  const goToStep = (idx: number) => {
    const nextIdx = Math.min(idx, scenario.totalSteps - 1);
    setCurrentStep(nextIdx);
    saveScenarioProgress(scenarioId, nextIdx);
    setExpandedExplanation(false);
  };

  const handleCta = () => {
    if (step.href && onNavigate) {
      onNavigate(step.href);
    } else if (step.href) {
      window.location.href = step.href;
    }

    if (isLast) {
      clearScenarioProgress(scenarioId);
      setCompleted(true);
    } else {
      goToStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    if (isLast) {
      clearScenarioProgress(scenarioId);
      setCompleted(true);
    } else {
      goToStep(currentStep + 1);
    }
  };

  const handleDefer = () => {
    saveScenarioProgress(scenarioId, currentStep);
    onClose();
  };

  const handleComplete = () => {
    clearScenarioProgress(scenarioId);
    onComplete();
  };

  // ── Экран завершения ─────────────────────────────────────────────────────
  if (completed) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
              <Icon name="Check" size={36} className="text-emerald-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
              <Icon name="Sparkles" size={12} className="text-white" />
            </div>
          </div>

          <div>
            <h2
              className="text-xl font-bold text-slate-800 leading-snug"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Готово!
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
              {scenario.completionMessage}
            </p>
          </div>

          <button
            onClick={handleComplete}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl px-6 py-3 transition-colors"
          >
            <Icon name="ArrowRight" size={15} />
            Продолжить
          </button>
        </div>

        {/* Прогресс — 100% */}
        <div className="h-1.5 bg-slate-100">
          <div className="h-full bg-emerald-400 transition-all duration-500 w-full" />
        </div>
      </div>
    );
  }

  // ── Основной экран шага ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white">

      {/* Хедер */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl leading-none shrink-0">{scenario.emoji}</span>
          <span
            className="text-sm font-semibold text-slate-800 truncate"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {scenario.title}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ml-2"
        >
          <Icon name="X" size={15} />
        </button>
      </div>

      {/* Stepper */}
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-1 mb-1.5">
          {scenario.steps.map((_, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <React.Fragment key={idx}>
                <button
                  onClick={() => idx < currentStep && goToStep(idx)}
                  className={[
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                    isDone
                      ? 'bg-indigo-500 text-white cursor-pointer hover:bg-indigo-600'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 cursor-default'
                      : 'bg-slate-100 text-slate-400 cursor-default',
                  ].join(' ')}
                >
                  {isDone ? (
                    <Icon name="Check" size={11} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </button>
                {idx < scenario.totalSteps - 1 && (
                  <div
                    className={[
                      'flex-1 h-0.5 rounded-full transition-colors',
                      idx < currentStep ? 'bg-indigo-400' : 'bg-slate-200',
                    ].join(' ')}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <p className="text-xs text-slate-400">
          Шаг {currentStep + 1} из {scenario.totalSteps}
        </p>
      </div>

      {/* Тело шага */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0">

        <div>
          <h3
            className="text-lg font-bold text-slate-800 leading-snug"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {step.title}
          </h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Benefit */}
        {step.benefit && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-3 flex items-start gap-2">
            <Icon name="Sparkles" size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-700 mb-0.5">Что вы получите</p>
              <p className="text-xs text-emerald-700 leading-relaxed">{step.benefit}</p>
            </div>
          </div>
        )}

        {/* Expandable объяснение */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandedExplanation((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Icon name="HelpCircle" size={14} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-600">Объяснить подробнее</span>
            </div>
            <Icon
              name={expandedExplanation ? 'ChevronUp' : 'ChevronDown'}
              size={13}
              className="text-slate-400"
            />
          </button>
          {expandedExplanation && (
            <div className="px-3 pb-3 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-500 leading-relaxed pt-2">
                {step.description}
                {step.benefit && ` ${step.benefit}`}
                {' '}Вы всегда можете вернуться к этому шагу или отложить его.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="px-4 py-4 border-t border-slate-100 flex flex-col gap-2 shrink-0">
        <button
          onClick={handleCta}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl py-3 transition-colors"
        >
          {step.href && <Icon name="ExternalLink" size={14} />}
          {step.cta}
        </button>

        {step.ctaSecondary && (
          <button
            onClick={handleSkip}
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl py-2.5 transition-colors"
          >
            {step.ctaSecondary}
          </button>
        )}

        <button
          onClick={handleDefer}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-600 py-1.5 transition-colors"
        >
          <Icon name="Bookmark" size={12} />
          Отложить — сохраню прогресс
        </button>
      </div>

      {/* Прогресс-бар */}
      <div className="h-1.5 bg-slate-100 shrink-0">
        <div
          className="h-full bg-indigo-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default DomovoyGuide;
