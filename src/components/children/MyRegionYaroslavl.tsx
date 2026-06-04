import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, MapPin } from "lucide-react";
import {
  yaroslavlRegionFacts,
  yaroslavlRegionQuiz,
  yaroslavlFamilyIdeas,
  yaroslavlQuizLevels,
  yaroslavlRegionMeta,
  YAROSLAVL_REGION_STORAGE_KEY,
  type YaroslavlRegionProgress,
} from "@/data/yaroslavlRegionData";

// ─── Хелперы ──────────────────────────────────────────────────────────────────

function getLevel(score: number) {
  return (
    yaroslavlQuizLevels.find(l => score >= l.min && score <= l.max) ??
    yaroslavlQuizLevels[0]
  );
}

function loadProgress(): YaroslavlRegionProgress | null {
  try {
    const raw = localStorage.getItem(YAROSLAVL_REGION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProgress(p: YaroslavlRegionProgress) {
  try {
    localStorage.setItem(YAROSLAVL_REGION_STORAGE_KEY, JSON.stringify(p));
  } catch (e) {
    // ignore
  }
}

// ─── Блок фактов ──────────────────────────────────────────────────────────────

function FactsBlock() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
        {yaroslavlRegionMeta.factsTitle}
      </p>
      <div className="grid grid-cols-1 gap-2">
        {yaroslavlRegionFacts.map(fact => (
          <div
            key={fact.id}
            className="bg-white rounded-2xl border border-amber-100 px-4 py-3 flex items-start gap-3 shadow-sm"
          >
            <span className="text-2xl shrink-0 mt-0.5">{fact.icon}</span>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-snug">{fact.title}</p>
              <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">{fact.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Блок семейных идей ───────────────────────────────────────────────────────

function FamilyIdeasBlock() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600">
        {yaroslavlRegionMeta.familyTitle}
      </p>
      <div className="flex flex-col gap-2">
        {yaroslavlFamilyIdeas.map(idea => (
          <div
            key={idea.id}
            className="bg-white rounded-2xl border border-teal-100 px-4 py-3 flex items-start gap-3 shadow-sm"
          >
            <span className="text-2xl shrink-0 mt-0.5">{idea.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800 leading-snug">{idea.title}</p>
                <span className="shrink-0 text-[10px] bg-teal-50 text-teal-600 border border-teal-100 rounded-full px-2 py-0.5 font-medium whitespace-nowrap">
                  {idea.format}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 mb-1">
                <MapPin size={10} className="text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-400">{idea.place}</span>
              </div>
              <p className="text-[12px] text-slate-500 leading-snug">{idea.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Экран квиза ─────────────────────────────────────────────────────────────

interface QuizScreenProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

function QuizScreen({ onBack, onComplete }: QuizScreenProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExpl, setShowExpl] = useState(false);
  const [done, setDone] = useState(false);

  const questions = yaroslavlRegionQuiz;
  const q = questions[current];
  const selected = answers[current];
  const isAnswered = selected !== undefined;
  const isLast = current === questions.length - 1;

  const score = Object.entries(answers).filter(
    ([qi, ai]) => questions[Number(qi)].correctIndex === ai
  ).length;

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setAnswers(prev => ({ ...prev, [current]: idx }));
    setShowExpl(true);
  };

  const handleNext = () => {
    setShowExpl(false);
    if (isLast) {
      const finalScore = Object.entries({ ...answers }).filter(
        ([qi, ai]) => questions[Number(qi)].correctIndex === Number(ai)
      ).length;
      setDone(true);
      onComplete(finalScore);
    } else {
      setCurrent(c => c + 1);
    }
  };

  if (done) {
    const level = getLevel(score);
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center py-6 bg-gradient-to-b from-amber-50 to-white rounded-2xl border border-amber-100 px-4">
          <div className="text-5xl mb-2">{level.emoji}</div>
          <p className="font-bold text-base text-slate-800">{level.title}</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{score}/{questions.length}</p>
          <p className="text-[12px] text-slate-500 mt-1 leading-snug max-w-[260px] mx-auto">{level.subtitle}</p>
        </div>

        {/* Разбор */}
        <div className="flex flex-col gap-2">
          {questions.map((question, i) => {
            const userAns = answers[i];
            const isCorrect = userAns === question.correctIndex;
            return (
              <div key={i} className={`rounded-xl p-3 border text-sm ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">{isCorrect ? "✅" : "❌"}</span>
                  <div>
                    <p className="text-[12px] font-medium text-slate-700 leading-snug">{question.question}</p>
                    {!isCorrect && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Правильно: <span className="font-semibold text-emerald-700">{question.options[question.correctIndex]}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setCurrent(0); setAnswers({}); setShowExpl(false); setDone(false); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <RotateCcw size={14} /> Пройти снова
          </button>
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Прогресс */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
          <ArrowLeft size={16} className="text-slate-500" />
        </button>
        <div className="flex-1 flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i < current ? "bg-amber-400" : i === current ? "bg-amber-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium shrink-0">{current + 1}/{questions.length}</span>
      </div>

      {/* Вопрос */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🗺️</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            {yaroslavlRegionMeta.quizTitle}
          </span>
        </div>
        <p className="font-semibold text-slate-800 text-sm leading-snug">{q.question}</p>
      </div>

      {/* Варианты */}
      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          let style = "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50";
          if (isAnswered) {
            if (i === q.correctIndex) style = "border-emerald-400 bg-emerald-50 text-emerald-800";
            else if (i === selected) style = "border-rose-400 bg-rose-50 text-rose-700";
            else style = "border-slate-100 bg-white opacity-40";
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={isAnswered}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${style}`}
            >
              <span className="font-medium text-slate-400 mr-2">{["А", "Б", "В", "Г"][i]}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Объяснение */}
      {showExpl && (
        <div className={`rounded-xl px-3 py-2.5 text-[12px] leading-snug ${
          selected === q.correctIndex
            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
            : "bg-rose-50 border border-rose-200 text-rose-800"
        }`}>
          <span className="font-bold mr-1">{selected === q.correctIndex ? "Верно! " : "Не совсем. "}</span>
          {q.explanation}
        </div>
      )}

      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition"
        >
          {isLast ? "Узнать результат 🏆" : <>Следующий вопрос <ArrowRight size={14} /></>}
        </button>
      )}
    </div>
  );
}

// ─── Главный экран ────────────────────────────────────────────────────────────

type View = "home" | "facts" | "quiz" | "family";

interface MyRegionYaroslavlProps {
  onBack?: () => void;
}

export default function MyRegionYaroslavl({ onBack }: MyRegionYaroslavlProps) {
  const [view, setView] = useState<View>("home");
  const [progress, setProgress] = useState<YaroslavlRegionProgress | null>(loadProgress);

  useEffect(() => {
    if (progress) saveProgress(progress);
  }, [progress]);

  const handleQuizComplete = (score: number) => {
    const level = getLevel(score);
    const prev = progress;
    setProgress({
      completed: true,
      bestScore: Math.max(score, prev?.bestScore ?? 0),
      lastScore: score,
      levelTitle: level.title,
    });
  };

  if (view === "facts") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setView("home")} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <ArrowLeft size={16} className="text-slate-500" />
          </button>
          <p className="font-bold text-slate-800 text-sm">{yaroslavlRegionMeta.factsTitle}</p>
        </div>
        <FactsBlock />
      </div>
    );
  }

  if (view === "quiz") {
    return (
      <QuizScreen
        onBack={() => setView("home")}
        onComplete={handleQuizComplete}
      />
    );
  }

  if (view === "family") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setView("home")} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <ArrowLeft size={16} className="text-slate-500" />
          </button>
          <p className="font-bold text-slate-800 text-sm">{yaroslavlRegionMeta.familyTitle}</p>
        </div>
        <FamilyIdeasBlock />
      </div>
    );
  }

  // ── Главная ──

  const level = progress ? getLevel(progress.bestScore) : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Заголовок */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <ArrowLeft size={16} className="text-slate-500" />
          </button>
        )}
        <div>
          <p className="font-bold text-slate-800 text-base leading-none">{yaroslavlRegionMeta.title}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">{yaroslavlRegionMeta.subtitle}</p>
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden border border-amber-200 shadow-sm">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐻</span>
            <div>
              <p className="text-white font-bold text-sm leading-none">{yaroslavlRegionMeta.subtitle}</p>
              <p className="text-amber-100 text-[11px] mt-0.5">{yaroslavlRegionMeta.description}</p>
            </div>
          </div>
        </div>

        {/* Результат если есть */}
        {progress && level && (
          <div className="bg-amber-50/80 px-4 py-2.5 flex items-center gap-2 border-b border-amber-100">
            <span className="text-lg">{level.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-500">Твой уровень знаний о крае</p>
              <p className="text-sm font-bold text-amber-700">{level.title}</p>
            </div>
            <p className="text-xl font-black text-amber-600">{progress.bestScore}/10</p>
          </div>
        )}
      </div>

      {/* 3 раздела */}
      <div className="flex flex-col gap-2.5">
        {/* Факты */}
        <button
          onClick={() => setView("facts")}
          className="w-full text-left rounded-2xl border border-amber-100 bg-amber-50 hover:border-amber-300 hover:shadow-sm transition group px-4 py-3 flex items-center gap-3"
        >
          <span className="text-2xl shrink-0">🏛️</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-amber-800">{yaroslavlRegionMeta.factsTitle}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{yaroslavlRegionFacts.length} коротких карточек о крае</p>
          </div>
          <ArrowRight size={16} className="text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Квиз */}
        <button
          onClick={() => setView("quiz")}
          className="w-full text-left rounded-2xl border border-yellow-200 bg-yellow-50 hover:border-yellow-400 hover:shadow-sm transition group px-4 py-3 flex items-center gap-3"
        >
          <span className="text-2xl shrink-0">🗺️</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-yellow-800">{yaroslavlRegionMeta.quizTitle}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {yaroslavlRegionQuiz.length} вопросов · 2–4 минуты
            </p>
            {progress && (
              <span className="inline-block mt-1 text-[10px] bg-yellow-200 text-yellow-800 rounded-full px-2 py-0.5 font-semibold">
                Лучший результат: {progress.bestScore}/10
              </span>
            )}
          </div>
          <ArrowRight size={16} className="text-yellow-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Семейные идеи */}
        <button
          onClick={() => setView("family")}
          className="w-full text-left rounded-2xl border border-teal-100 bg-teal-50 hover:border-teal-300 hover:shadow-sm transition group px-4 py-3 flex items-center gap-3"
        >
          <span className="text-2xl shrink-0">🚶</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-teal-800">{yaroslavlRegionMeta.familyTitle}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{yaroslavlFamilyIdeas.length} идей для выходного дня</p>
          </div>
          <ArrowRight size={16} className="text-teal-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
