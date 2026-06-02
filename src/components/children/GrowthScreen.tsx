import { BookOpen, Dumbbell, Palette, Users, Music, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface Development {
  id: string;
  area: string;
  current_level: number;
  target_level: number;
}

interface GrowthScreenProps {
  child: {
    id: string;
    name: string;
    development?: Development[];
  };
  childData?: {
    development?: Development[];
  };
  onBack?: () => void;
}

const AREA_CONFIG: Record<string, {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  bar: string;
  description: string;
  skills: string[];
  insight: string;
}> = {
  education: {
    label: "Учёба",
    icon: BookOpen,
    color: "text-sky-600",
    bg: "bg-sky-50",
    bar: "bg-sky-300",
    description: "Познание, внимание и мышление",
    skills: ["Чтение", "Логика", "Внимание"],
    insight: "Регулярное чтение помогает развивать концентрацию",
  },
  sport: {
    label: "Спорт",
    icon: Dumbbell,
    color: "text-teal-600",
    bg: "bg-teal-50",
    bar: "bg-teal-300",
    description: "Физическое развитие и дисциплина",
    skills: ["Выносливость", "Координация", "Режим"],
    insight: "Тренировки 2–3 раза в неделю заметно укрепляют тело",
  },
  creativity: {
    label: "Творчество",
    icon: Palette,
    color: "text-violet-600",
    bg: "bg-violet-50",
    bar: "bg-violet-300",
    description: "Воображение и самовыражение",
    skills: ["Воображение", "Концентрация", "Самовыражение"],
    insight: "Творческий кружок поддерживает уверенность в себе",
  },
  social: {
    label: "Общение",
    icon: Users,
    color: "text-rose-500",
    bg: "bg-rose-50",
    bar: "bg-rose-300",
    description: "Уверенность и навыки общения",
    skills: ["Уверенность", "Эмпатия", "Командная работа"],
    insight: "Совместные игры и проекты помогают расти вместе с другими",
  },
  music: {
    label: "Музыка",
    icon: Music,
    color: "text-amber-600",
    bg: "bg-amber-50",
    bar: "bg-amber-300",
    description: "Слух, ритм и усидчивость",
    skills: ["Слух", "Ритм", "Терпение"],
    insight: "Регулярные занятия помогают развить усидчивость и память",
  },
};

const STRENGTHS_POOL = [
  "Быстро включается в новые задачи",
  "Хорошо держит ритм занятий",
  "Смело пробует что-то новое",
  "Старательно доводит дело до конца",
  "Умеет радоваться своим успехам",
];

const SUPPORT_POOL = [
  "Уделить немного времени чтению по вечерам",
  "Поддержать ритм тренировок — важна регулярность",
  "Попробовать вместе новое творческое занятие",
  "Больше разговаривать об интересах и делах",
];

export default function GrowthScreen({ child, childData, onBack }: GrowthScreenProps) {
  const development = (childData?.development ?? child.development ?? []) as Development[];
  const name = (child.name || "Ребёнок").split(" ")[0];

  const areas = development
    .filter(d => AREA_CONFIG[d.area])
    .sort((a, b) => b.current_level - a.current_level);

  const strongestArea = areas[0];
  const weakestArea = areas[areas.length - 1];

  const overallAvg = areas.length > 0
    ? Math.round(areas.reduce((s, a) => s + a.current_level, 0) / areas.length)
    : 0;

  const strengths = STRENGTHS_POOL.slice(0, Math.min(3, areas.length > 0 ? 3 : 1));
  const supports = SUPPORT_POOL.slice(0, weakestArea ? 2 : 1);

  const getInsight = () => {
    if (!strongestArea) return `${name} только начинает свой путь роста`;
    const cfg = AREA_CONFIG[strongestArea.area];
    if (strongestArea.current_level >= 70) return `Отличная динамика — ${cfg?.label.toLowerCase()} идёт вперёд`;
    if (strongestArea.current_level >= 40) return `Стабильный рост — ${cfg?.label.toLowerCase()} развивается хорошо`;
    return `${name} делает первые шаги в ${cfg?.label.toLowerCase()}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">

      {/* Хедер */}
      <div className="bg-white px-4 pt-5 pb-4 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center"
          >
            <ChevronLeft size={16} className="text-slate-500" />
          </button>
          <div>
            <h1
              className="text-[18px] font-bold text-slate-800"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Мой рост
            </h1>
            <p className="text-xs text-slate-400">{name}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-3 pb-20">

        {/* Верхняя сводка */}
        <section>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
            <p
              className="text-[15px] font-bold text-slate-800 mb-1"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {getInsight()}
            </p>
            {overallAvg > 0 && (
              <p className="text-sm text-slate-500">
                Общий прогресс — <span className="font-semibold text-teal-600">{overallAvg}%</span>
              </p>
            )}
          </div>
        </section>

        {/* Области развития */}
        {areas.length > 0 ? (
          <section>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100/80">
              <div className="px-4 pt-4 pb-2 flex items-center gap-2.5">
                <p
                  className="text-[15px] font-bold text-slate-800"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Области развития
                </p>
              </div>

              <div className="px-4 pb-4 space-y-1">
                {areas.map((area, idx) => {
                  const cfg = AREA_CONFIG[area.area];
                  if (!cfg) return null;
                  const AreaIcon = cfg.icon;
                  const pct = Math.round(area.current_level);
                  const isStrongest = idx === 0 && pct >= 50;
                  return (
                    <div
                      key={area.id}
                      className="rounded-xl px-3 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                          <AreaIcon size={15} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-sm font-semibold text-slate-700">{cfg.label}</span>
                            <div className="flex items-center gap-1.5">
                              {isStrongest && (
                                <span className="text-[10px] bg-teal-50 text-teal-600 font-semibold px-1.5 py-0.5 rounded-md">
                                  Сильная
                                </span>
                              )}
                              <span className="text-xs text-slate-400">{pct}%</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400">{cfg.description}</p>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-11">
                        <div
                          className="h-full rounded-full bg-slate-300 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {/* Навыки */}
                      <div className="flex gap-1.5 mt-2 ml-11">
                        {cfg.skills.map(skill => (
                          <span
                            key={skill}
                            className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          <section>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100/80">
              <div className="text-3xl mb-2">🌱</div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Рост только начинается</p>
              <p className="text-xs text-slate-400">Добавь занятия в раздел развития — и мы начнём отслеживать</p>
            </div>
          </section>
        )}

        {/* Сильные стороны */}
        <section>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
            <p
              className="text-[15px] font-bold text-slate-800 mb-3"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Сильные стороны
            </p>
            <div className="space-y-2">
              {strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-teal-400 mt-0.5 flex-shrink-0 text-base">✓</span>
                  <p className="text-sm text-slate-700 leading-snug">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Что можно поддержать */}
        <section>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
            <p
              className="text-[15px] font-bold text-slate-800 mb-1"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Что сейчас можно поддержать
            </p>
            <p className="text-xs text-slate-400 mb-3">Небольшие шаги, которые помогут расти дальше</p>
            <div className="space-y-2">
              {supports.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 bg-amber-50/50 rounded-xl border border-amber-100/50">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>
                  <p className="text-sm text-slate-700 leading-snug">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Что влияет на рост */}
        {areas.length > 0 && (
          <section>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
              <p
                className="text-[15px] font-bold text-slate-800 mb-3"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Что влияет на рост
              </p>
              <div className="space-y-2">
                {areas.slice(0, 3).map(area => {
                  const cfg = AREA_CONFIG[area.area];
                  if (!cfg) return null;
                  return (
                    <div key={area.id} className="flex items-start gap-2.5">
                      <span className="text-slate-300 mt-0.5 flex-shrink-0 text-xs">●</span>
                      <p className="text-sm text-slate-600 leading-snug">{cfg.insight}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Следующий шаг */}
        <section>
          <div
            className="rounded-2xl p-4 border border-slate-100/80"
            style={{ background: "linear-gradient(135deg, #f7fbff 0%, #eef6ff 100%)" }}
          >
            <p
              className="text-[15px] font-bold text-slate-800 mb-3"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Следующий шаг
            </p>
            <div className="space-y-2">
              {[
                { who: "Родитель", text: "Добавить результат последнего занятия", icon: "👨‍👩‍👧" },
                { who: "Ребёнок",  text: "Выбрать фокус на эту неделю",           icon: "🎯" },
              ].map(step => (
                <div
                  key={step.who}
                  className="flex items-center gap-3 bg-white/80 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white transition-colors"
                >
                  <span className="text-lg flex-shrink-0">{step.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-400 font-medium">{step.who}</p>
                    <p className="text-sm text-slate-700 leading-snug">{step.text}</p>
                  </div>
                  <ArrowRight size={13} className="text-slate-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
