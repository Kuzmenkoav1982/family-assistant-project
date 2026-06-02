import { useState } from "react";
import { ChevronRight, Plus, TrendingUp, BookOpen, Dumbbell, Palette, Users, Music, Shield, Heart, CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";
import Icon from "@/components/ui/icon";
import { useFamilyMembersContext } from "@/contexts/FamilyMembersContext";

interface Dream {
  id: string;
  title: string;
  description?: string;
  created_date: string;
  achieved?: boolean;
}

interface Development {
  id: string;
  area: string;
  current_level: number;
  target_level: number;
}

interface ChildMasterScreenProps {
  child: {
    id: string;
    name: string;
    avatar: string;
    avatar_type?: string;
    photo_url?: string;
    age?: number;
    points?: number;
    level?: number;
    piggyBank?: number;
    dreams?: Dream[];
    development?: Development[];
    achievements?: string[];
    [key: string]: unknown;
  };
  childData?: {
    development?: Development[];
    dreams?: Dream[];
    piggyBank?: { balance: number };
  };
  onTabChange?: (tab: string) => void;
  onGrowthOpen?: () => void;
}

const AREA_CONFIG: Record<string, {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  bar: string;
}> = {
  education:  { label: "Учёба",      icon: BookOpen, color: "text-sky-500",    bg: "bg-sky-50",    bar: "bg-sky-300" },
  sport:      { label: "Спорт",      icon: Dumbbell, color: "text-teal-500",   bg: "bg-teal-50",   bar: "bg-teal-300" },
  creativity: { label: "Творчество", icon: Palette,  color: "text-violet-500", bg: "bg-violet-50", bar: "bg-violet-300" },
  social:     { label: "Общение",    icon: Users,    color: "text-rose-400",   bg: "bg-rose-50",   bar: "bg-rose-300" },
  music:      { label: "Музыка",     icon: Music,    color: "text-amber-500",  bg: "bg-amber-50",  bar: "bg-amber-300" },
};

const SAFETY_TIPS = [
  "Не говори никому свой PIN — даже лучшему другу",
  "Перед крупной покупкой спроси маму или папу",
  "Хочу прямо сейчас — или это настоящая цель?",
  "Подозрительная ссылка? Спроси взрослого",
];

const WEEKLY_STEPS = [
  { id: "1", text: "Добавить фото с занятия или тренировки" },
  { id: "2", text: "Сделать один шаг к своей мечте" },
  { id: "3", text: "Рассказать семье о маленькой победе" },
];

function MemberAvatar({ member }: {
  member: { name: string; avatar: string; avatar_type?: string; photo_url?: string }
}) {
  const isPhoto = member.avatar_type === "photo" && member.photo_url;
  if (isPhoto) {
    return (
      <img
        src={member.photo_url}
        alt={member.name}
        className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-lg select-none">
      {member.avatar || "👤"}
    </div>
  );
}

export default function ChildMasterScreen({
  child,
  childData,
  onTabChange,
  onGrowthOpen,
}: ChildMasterScreenProps) {
  const tipIndex = useState(() => Math.floor(Math.random() * SAFETY_TIPS.length))[0];
  const [weekSteps, setWeekSteps] = useState(() =>
    WEEKLY_STEPS.map(s => ({ ...s, done: false }))
  );

  const { members } = useFamilyMembersContext();

  const name = child.name || "Ребёнок";
  const firstName = name.split(" ")[0];
  const piggyBalance = childData?.piggyBank?.balance ?? (child.piggyBank as number) ?? 0;
  const development = childData?.development ?? child.development ?? [];
  const dreams = (childData?.dreams ?? child.dreams ?? []) as Dream[];
  const activeDream = dreams.find(d => !d.achieved) ?? dreams[0];

  const topAreas = (development as Development[])
    .filter(d => AREA_CONFIG[d.area])
    .sort((a, b) => b.current_level - a.current_level)
    .slice(0, 4);

  const strongestArea = topAreas[0];

  const familyMembers = members
    .filter(m => m.id !== child.id)
    .slice(0, 3);

  const extraFamilyCount = Math.max(0, members.filter(m => m.id !== child.id).length - 3);
  const doneCount = weekSteps.filter(s => s.done).length;

  const toggleStep = (id: string) => {
    setWeekSteps(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const getChildAvatar = () => {
    const isPhoto = child.avatar_type === "photo" && child.photo_url;
    if (isPhoto) {
      return (
        <img
          src={child.photo_url as string}
          alt={name}
          className="w-[72px] h-[72px] rounded-full object-cover border-4 border-white shadow-md"
        />
      );
    }
    return (
      <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-amber-50 to-orange-100 border-4 border-white shadow-md flex items-center justify-center text-4xl select-none">
        {child.avatar || "🧒"}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">

      {/* ── БЛОК 1: HERO — ребёнок, имя, возраст. Очки — вторичный слой ── */}
      <div className="bg-white px-4 pt-5 pb-6 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">{getChildAvatar()}</div>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-400 mb-0.5 font-medium tracking-widest uppercase">
              Пространство роста
            </p>
            <h1
              className="text-[22px] font-bold text-slate-800 leading-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {firstName}
            </h1>
            {child.age && (
              <p className="text-sm text-slate-500 mt-0.5">{child.age} лет</p>
            )}
          </div>

          {/* Очки — маленький вторичный блок справа */}
          {(child.points as number) > 0 && (
            <div className="flex-shrink-0 flex flex-col items-end">
              <span className="text-[11px] text-slate-400">очков</span>
              <span className="text-base font-bold text-amber-500">{child.points as number}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-3 space-y-3 pb-20">

        {/* ── БЛОК 2: МОЯ МЕЧТА — тёплый песочный, не "золотой" ── */}
        <section>
          <button
            onClick={() => onTabChange?.("money")}
            className="w-full text-left relative overflow-hidden rounded-2xl p-5 border border-amber-100/80"
            style={{ background: "linear-gradient(135deg, #fff9f0 0%, #fef3dc 100%)" }}
          >
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-amber-100/30 -translate-y-10 translate-x-10" />
            <div className="relative">
              <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-widest mb-2">
                ✦ &nbsp;Моя мечта
              </p>
              {activeDream ? (
                <>
                  <h2
                    className="text-[18px] font-bold text-slate-800 leading-snug mb-1"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {activeDream.title}
                  </h2>
                  {activeDream.description && (
                    <p className="text-sm text-slate-500 mb-4 line-clamp-1">{activeDream.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-amber-200/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400/70 transition-all"
                        style={{ width: `${Math.min(piggyBalance, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-amber-600 flex-shrink-0">
                      {piggyBalance > 0 ? `${piggyBalance}%` : "Начнём?"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-amber-600/80 flex items-center gap-1">
                    Сделать шаг <ArrowRight size={11} />
                  </p>
                </>
              ) : (
                <>
                  <h2
                    className="text-[17px] font-bold text-slate-800 mb-1"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    О чём мечтаешь?
                  </h2>
                  <p className="text-sm text-slate-500 mb-3">Добавь первую цель или мечту</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100/60 rounded-xl px-3 py-1.5">
                    <Plus size={12} /> Добавить мечту
                  </span>
                </>
              )}
            </div>
          </button>
        </section>

        {/* ── БЛОК 3: МОЙ РОСТ — спокойный, монохромные бары, не пёстрый ── */}
        <section>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100/80">
            <div className="px-4 pt-4 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                  <TrendingUp size={14} className="text-teal-500" />
                </div>
                <h2
                  className="text-[15px] font-bold text-slate-800"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Мой рост
                </h2>
              </div>
              <button
                onClick={onGrowthOpen}
                className="text-xs text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-0.5"
              >
                Подробнее <ChevronRight size={12} />
              </button>
            </div>

            {strongestArea && (
              <div className="mx-4 mb-3 px-3 py-2 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600">
                  Сильнее всего сейчас — <strong className="text-teal-600">{AREA_CONFIG[strongestArea.area]?.label}</strong>
                </p>
              </div>
            )}

            {topAreas.length > 0 ? (
              <div className="px-4 pb-4 space-y-2.5">
                {topAreas.map(area => {
                  const cfg = AREA_CONFIG[area.area];
                  if (!cfg) return null;
                  const AreaIcon = cfg.icon;
                  const pct = Math.round(area.current_level);
                  return (
                    <div key={area.id} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <AreaIcon size={13} className={cfg.color} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-600">{cfg.label}</span>
                          <span className="text-xs text-slate-400">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-slate-300 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 pb-5 text-center">
                <div className="text-2xl mb-1.5">🌱</div>
                <p className="text-sm text-slate-400">Добавь занятия — начнём отслеживать рост</p>
              </div>
            )}
          </div>
        </section>

        {/* ── БЛОК 4: ШАГИ НЕДЕЛИ ── */}
        <section>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Icon name="Target" size={14} className="text-violet-500" />
                </div>
                <h2
                  className="text-[15px] font-bold text-slate-800"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Шаги недели
                </h2>
              </div>
              {doneCount > 0 && (
                <span className="text-[11px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                  {doneCount}/{weekSteps.length}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {weekSteps.map(step => (
                <button
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className="w-full flex items-start gap-2.5 text-left group"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {step.done
                      ? <CheckCircle2 size={18} className="text-violet-400" />
                      : <Circle size={18} className="text-slate-200 group-hover:text-violet-200 transition-colors" />
                    }
                  </div>
                  <span className={`text-sm leading-snug ${step.done ? "line-through text-slate-300" : "text-slate-600"}`}>
                    {step.text}
                  </span>
                </button>
              ))}
            </div>

            {doneCount === weekSteps.length && (
              <div className="mt-3 rounded-xl bg-violet-50 px-3 py-2 text-center">
                <p className="text-xs font-semibold text-violet-600">Отличная неделя! 🎉</p>
              </div>
            )}
          </div>
        </section>

        {/* ── БЛОК 5: МОИ ЗАНЯТИЯ ── */}
        {topAreas.length > 0 && (
          <section>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
                    <Sparkles size={14} className="text-sky-500" />
                  </div>
                  <h2
                    className="text-[15px] font-bold text-slate-800"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    Мои занятия
                  </h2>
                </div>
                <button className="text-xs text-slate-400 flex items-center gap-0.5">
                  Все <ChevronRight size={12} />
                </button>
              </div>

              <div className="space-y-2">
                {topAreas.slice(0, 3).map(area => {
                  const cfg = AREA_CONFIG[area.area];
                  if (!cfg) return null;
                  const AreaIcon = cfg.icon;
                  return (
                    <div
                      key={area.id}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <AreaIcon size={15} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">{cfg.label}</p>
                        <p className="text-xs text-slate-400">Прогресс {area.current_level}%</p>
                      </div>
                      <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── БЛОК 6: МОИ ДОСТИЖЕНИЯ ── */}
        <section>
          <button
            onClick={() => onTabChange?.("achievements")}
            className="w-full text-left relative overflow-hidden rounded-2xl p-5 border border-sky-100/80"
            style={{ background: "linear-gradient(135deg, #f7fbff 0%, #eef6ff 100%)" }}
          >
            <div className="absolute bottom-0 right-0 w-20 h-20 rounded-full bg-sky-100/30 translate-y-6 translate-x-6" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-sky-500 uppercase tracking-widest mb-2">
                  ✦ &nbsp;Достижения
                </p>
                {child.achievements && (child.achievements as string[]).length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(child.achievements as string[]).slice(0, 3).map((ach, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs bg-white/80 text-slate-700 rounded-lg px-2 py-1 border border-sky-100"
                        >
                          🏅 <span className="max-w-[72px] truncate">{ach}</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {(child.achievements as string[]).length} наград
                    </p>
                  </>
                ) : (
                  <>
                    <h2
                      className="text-[17px] font-bold text-slate-800 mb-1"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Первые победы ждут
                    </h2>
                    <p className="text-sm text-slate-500 mb-2">Добавь грамоту или маленький успех</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 bg-white/80 rounded-xl px-2.5 py-1">
                      <Plus size={11} /> Добавить
                    </span>
                  </>
                )}
              </div>
              <ChevronRight size={14} className="text-sky-300 flex-shrink-0 mt-1" />
            </div>
          </button>
        </section>

        {/* ── БЛОК 7: МОЯ СЕМЬЯ — реальные аватары из контекста ── */}
        <section>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                <Heart size={14} className="text-rose-400" />
              </div>
              <h2
                className="text-[15px] font-bold text-slate-800"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Моя семья
              </h2>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2.5">
                {familyMembers.length > 0 ? (
                  <>
                    {familyMembers.map(m => (
                      <MemberAvatar key={m.id} member={m} />
                    ))}
                    {extraFamilyCount > 0 && (
                      <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center">
                        <span className="text-[11px] font-semibold text-slate-500">+{extraFamilyCount}</span>
                      </div>
                    )}
                  </>
                ) : (
                  ["bg-rose-100", "bg-sky-100", "bg-amber-100"].map((bg, i) => (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-full ${bg} border-2 border-white shadow-sm flex items-center justify-center`}
                    >
                      <Icon name="User" size={15} className="text-slate-400" />
                    </div>
                  ))
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Семья рядом</p>
                <p className="text-xs text-slate-400">История и воспоминания</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Альбом",   icon: "Camera",   color: "text-rose-400",   bg: "bg-rose-50/60" },
                { label: "Истории",  icon: "BookOpen", color: "text-amber-500",  bg: "bg-amber-50/60" },
                { label: "Традиции", icon: "Star",     color: "text-violet-400", bg: "bg-violet-50/60" },
              ].map(item => (
                <div
                  key={item.label}
                  className={`${item.bg} rounded-xl px-2 py-2.5 flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  <Icon name={item.icon} size={14} className={item.color} />
                  <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── БЛОК 8: БЕЗОПАСНОСТЬ — статичная, без ротации ── */}
        <section>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Shield size={15} className="text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-1.5">
                  Цифровая безопасность
                </p>
                <p className="text-sm text-slate-700 leading-snug">
                  {SAFETY_TIPS[tipIndex]}
                </p>
                <button
                  onClick={() => onTabChange?.("money")}
                  className="mt-2 text-xs text-emerald-600 flex items-center gap-1 hover:text-emerald-700 transition-colors"
                >
                  Узнать больше <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
