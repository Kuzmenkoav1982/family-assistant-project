import { BookOpen, Dumbbell, Palette, Users, Music } from "lucide-react";
import {
  ScreenPage,
  ScreenHeader,
  ScreenBody,
  SectionCard,
  AccentCard,
  InsightBanner,
  ProgressBar,
  NextStepBlock,
  InlineEmpty,
  MONTSERRAT,
} from "@/components/children/ui";

// ─── Типы ────────────────────────────────────────────────────────────────────

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

// ─── Конфиг областей ─────────────────────────────────────────────────────────

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

// ─── Пулы текстов ─────────────────────────────────────────────────────────────

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

// ─── Главный компонент ────────────────────────────────────────────────────────

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
    <ScreenPage>
      <ScreenHeader title="Мой рост" subtitle={name} onBack={onBack} />

      <ScreenBody>

        {/* Верхняя сводка */}
        <section>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
            <p className="text-[15px] font-bold text-slate-800 mb-1" style={MONTSERRAT}>
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
          <SectionCard title="Области развития" noPad>
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
                    {/* Прогресс-бар */}
                    <div className="ml-11">
                      <ProgressBar value={pct} barClass={cfg.bar} />
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
          </SectionCard>
        ) : (
          <SectionCard title="Области развития">
            <InlineEmpty
              emoji="🌱"
              text="Добавь занятия в раздел развития — и мы начнём отслеживать"
            />
          </SectionCard>
        )}

        {/* Сильнее всего сейчас */}
        {strongestArea && (
          <section>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
              <InsightBanner
                text="Сильнее всего сейчас — "
                highlight={AREA_CONFIG[strongestArea.area]?.label}
              />
            </div>
          </section>
        )}

        {/* Сильные стороны */}
        <SectionCard title="Сильные стороны">
          <div className="space-y-2">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-teal-400 mt-0.5 flex-shrink-0 text-base">✓</span>
                <p className="text-sm text-slate-700 leading-snug">{s}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Что можно поддержать */}
        <AccentCard gradient="warm">
          <p className="text-[15px] font-bold text-slate-800 mb-1" style={MONTSERRAT}>
            Что сейчас можно поддержать
          </p>
          <p className="text-xs text-slate-400 mb-3">Небольшие шаги, которые помогут расти дальше</p>
          <div className="space-y-2">
            {supports.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 bg-white/60 rounded-xl border border-amber-100/50">
                <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>
                <p className="text-sm text-slate-700 leading-snug">{s}</p>
              </div>
            ))}
          </div>
        </AccentCard>

        {/* Что влияет на рост */}
        {areas.length > 0 && (
          <SectionCard title="Что влияет на рост">
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
          </SectionCard>
        )}

        {/* Следующий шаг */}
        <NextStepBlock
          items={[
            {
              icon: "Users",
              iconColor: "text-sky-400",
              text: "Добавить результат последнего занятия",
            },
            {
              icon: "Target",
              iconColor: "text-violet-400",
              text: "Выбрать фокус на эту неделю",
            },
          ]}
        />

      </ScreenBody>
    </ScreenPage>
  );
}
