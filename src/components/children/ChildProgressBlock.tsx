import { useMemo } from "react";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { readSafetyProgress, readRegionProgress, hasAnyProgress } from "@/lib/childProgress";

interface ChildProgressBlockProps {
  onOpenTests: () => void;
  onOpenRegion: () => void;
  childAge?: number;
}

// ─── Первый вход — онбординг «С чего начать» ─────────────────────────────────

function OnboardingBlock({ onOpenTests, onOpenRegion, childAge }: ChildProgressBlockProps) {
  const hasAge = !!childAge;

  const steps = [
    {
      id: "age",
      done: hasAge,
      emoji: "👤",
      label: "Укажи свой возраст",
      sub: hasAge ? `${childAge} лет — группа определена` : "Нужно для подбора заданий",
      action: null,
    },
    {
      id: "test",
      done: false,
      emoji: "🧠",
      label: "Пройди первый тест",
      sub: "Пожар, мошенники или интернет — выбирай",
      action: onOpenTests,
    },
    {
      id: "region",
      done: false,
      emoji: "🐻",
      label: "Открой «Мой край»",
      sub: "Факты о Ярославской области и квиз",
      action: onOpenRegion,
    },
  ];

  return (
    <section className="mx-4">
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 mb-3">
          ✦ &nbsp;С чего начать
        </p>
        <div className="flex flex-col gap-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition
                ${step.done
                  ? "bg-emerald-50 border border-emerald-100"
                  : step.action
                    ? "bg-white border border-violet-100 cursor-pointer hover:border-violet-300 hover:shadow-sm active:scale-[0.99]"
                    : "bg-white/60 border border-slate-100"
                }`}
              onClick={step.action ?? undefined}
            >
              <span className="text-lg shrink-0">{step.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-none ${step.done ? "text-emerald-700" : "text-slate-800"}`}>
                  {step.label}
                </p>
                <p className={`text-[11px] mt-0.5 leading-snug ${step.done ? "text-emerald-500" : "text-slate-400"}`}>
                  {step.sub}
                </p>
              </div>
              {step.done
                ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                : step.action
                  ? <ArrowRight size={14} className="text-violet-300 shrink-0" />
                  : <Circle size={16} className="text-slate-200 shrink-0" />
              }
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Есть прогресс — блок «Мой прогресс» ────────────────────────────────────

function ProgressBlock({ onOpenTests, onOpenRegion }: ChildProgressBlockProps) {
  const safety = useMemo(() => readSafetyProgress(), []);
  const region = useMemo(() => readRegionProgress(), []);

  const ageLabel = safety.ageGroup === "7_10" ? "7–10 лет" : safety.ageGroup === "11_15" ? "11–15 лет" : null;
  const safetyPct = safety.overallPct;
  const safetyBar = safety.doneCount > 0 ? Math.round((safety.doneCount / safety.totalCount) * 100) : 0;

  return (
    <section className="mx-4">
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500">
            ✦ &nbsp;Мой прогресс
          </p>
          {ageLabel && (
            <span className="text-[10px] bg-violet-100 text-violet-600 font-semibold px-2 py-0.5 rounded-full">
              👤 {ageLabel}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Safety tests */}
          <button
            onClick={onOpenTests}
            className="w-full bg-white border border-violet-100 rounded-xl px-3 py-2.5 flex items-center gap-3 hover:border-violet-300 hover:shadow-sm transition text-left active:scale-[0.99]"
          >
            <span className="text-xl shrink-0">🧠</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-sm font-semibold text-slate-800 leading-none">Безопасность</p>
                {safety.bestLevelEmoji && safety.bestLevel && (
                  <span className="text-[10px] bg-amber-50 text-amber-600 font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {safety.bestLevelEmoji} {safety.bestLevel}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-violet-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-400 transition-all"
                    style={{ width: `${safetyBar}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                  {safety.doneCount}/{safety.totalCount} тестов
                  {safetyPct !== null && ` · ${safetyPct}%`}
                </span>
              </div>
            </div>
            <ArrowRight size={14} className="text-violet-300 shrink-0" />
          </button>

          {/* Region */}
          <button
            onClick={onOpenRegion}
            className="w-full bg-white border border-amber-100 rounded-xl px-3 py-2.5 flex items-center gap-3 hover:border-amber-300 hover:shadow-sm transition text-left active:scale-[0.99]"
          >
            <span className="text-xl shrink-0">🐻</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-sm font-semibold text-slate-800 leading-none">Мой край</p>
                {region.levelTitle && (
                  <span className="text-[10px] bg-amber-50 text-amber-600 font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {region.levelTitle}
                  </span>
                )}
              </div>
              {region.bestScore !== null ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${region.bestScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                    Лучший результат {region.bestScore}%
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">Ещё не начато</p>
              )}
            </div>
            <ArrowRight size={14} className="text-amber-300 shrink-0" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Основной экспорт ─────────────────────────────────────────────────────────

export default function ChildProgressBlock(props: ChildProgressBlockProps) {
  const hasProgress = useMemo(() => hasAnyProgress(), []);
  return hasProgress
    ? <ProgressBlock {...props} />
    : <OnboardingBlock {...props} />;
}
