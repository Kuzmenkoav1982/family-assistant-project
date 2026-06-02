import { useState } from "react";
import { ChevronRight, Plus, Star, Flame, Target, TrendingUp, Sparkles, BookOpen, Dumbbell, Palette, Users, Music, Shield, Heart, CheckCircle2, Circle, Camera, Gift, Wallet, ArrowRight, Zap } from "lucide-react";
import Icon from "@/components/ui/icon";

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
  };
  childData?: {
    development?: Development[];
    dreams?: Dream[];
    piggyBank?: { balance: number };
  };
  onTabChange?: (tab: string) => void;
}

const AREA_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }> = {
  education: { label: "Учёба", icon: BookOpen, color: "text-sky-600", bg: "bg-sky-50" },
  sport: { label: "Спорт", icon: Dumbbell, color: "text-emerald-600", bg: "bg-emerald-50" },
  creativity: { label: "Творчество", icon: Palette, color: "text-violet-600", bg: "bg-violet-50" },
  social: { label: "Общение", icon: Users, color: "text-orange-500", bg: "bg-orange-50" },
  music: { label: "Музыка", icon: Music, color: "text-pink-500", bg: "bg-pink-50" },
};

const SAFETY_TIPS = [
  { icon: "🔐", text: "Никогда не говори никому свой PIN-код, даже другу" },
  { icon: "💬", text: "Перед крупной покупкой всегда спроси маму или папу" },
  { icon: "🤔", text: "Хочу это прямо сейчас — или это моя настоящая цель?" },
  { icon: "🔗", text: "Не переходи по подозрительным ссылкам в интернете" },
];

const WEEKLY_STEPS = [
  { id: "1", text: "Добавить фото с тренировки или занятия", done: false },
  { id: "2", text: "Сделать шаг к своей мечте", done: false },
  { id: "3", text: "Рассказать семье о маленькой победе", done: false },
];

export default function ChildMasterScreen({ child, childData, onTabChange }: ChildMasterScreenProps) {
  const [tipIndex] = useState(() => Math.floor(Math.random() * SAFETY_TIPS.length));
  const [weekSteps, setWeekSteps] = useState(WEEKLY_STEPS);

  const name = child.name || "Ребёнок";
  const firstName = name.split(" ")[0];
  const level = child.level || 1;
  const points = child.points || 0;
  const piggyBalance = childData?.piggyBank?.balance ?? child.piggyBank ?? 0;
  const development = childData?.development ?? child.development ?? [];
  const dreams = childData?.dreams ?? child.dreams ?? [];
  const activeDream = dreams.find(d => !d.achieved) ?? dreams[0];

  const topAreas = development
    .filter(d => AREA_CONFIG[d.area])
    .sort((a, b) => b.current_level - a.current_level)
    .slice(0, 4);

  const strongestArea = topAreas[0];

  const toggleStep = (id: string) => {
    setWeekSteps(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const doneCount = weekSteps.filter(s => s.done).length;

  const getAvatarEl = () => {
    if (child.avatar_type === "photo" && child.photo_url) {
      return (
        <img
          src={child.photo_url}
          alt={name}
          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
        />
      );
    }
    const emoji = child.avatar || "🧒";
    return (
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-white shadow-lg flex items-center justify-center text-4xl">
        {emoji}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50/30">

      {/* ── БЛОК 1: HERO ── */}
      <div className="relative overflow-hidden">
        {/* Фоновые акценты */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gradient-to-br from-sky-100/60 to-teal-100/40 -translate-y-16 translate-x-16 blur-2xl" />
        <div className="absolute top-8 left-0 w-32 h-32 rounded-full bg-amber-100/50 -translate-x-10 blur-xl" />

        <div className="relative px-4 pt-6 pb-8">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              {getAvatarEl()}
              {/* Огонь — стрик активности */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-400 border-2 border-white flex items-center justify-center">
                <span className="text-xs">🔥</span>
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm text-slate-400 font-medium mb-0.5">Пространство роста</p>
              <h1 className="text-2xl font-bold text-slate-800 leading-tight truncate" style={{ fontFamily: "Montserrat, sans-serif" }}>
                {firstName}
              </h1>
              {child.age && (
                <p className="text-sm text-slate-500 mt-0.5">{child.age} лет</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                  <Star size={11} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-semibold text-amber-700">{points} очков</span>
                </div>
                <div className="flex items-center gap-1 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-0.5">
                  <Zap size={11} className="text-violet-500 fill-violet-400" />
                  <span className="text-xs font-semibold text-violet-700">Уровень {level}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onTabChange?.("calendar")}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/80 border border-slate-200 flex items-center justify-center shadow-sm"
            >
              <Icon name="Calendar" size={16} className="text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-24">

        {/* ── БЛОК 2: МОЯ МЕЧТА ── */}
        <section>
          <div
            onClick={() => onTabChange?.("money")}
            className="cursor-pointer relative overflow-hidden rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 40%, #fcd34d 100%)" }}
          >
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/20 -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-16 w-20 h-20 rounded-full bg-amber-300/30 translate-y-8" />

            <div className="relative">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-lg">✨</span>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Моя мечта</span>
              </div>

              {activeDream ? (
                <>
                  <h2 className="text-xl font-bold text-amber-900 mb-1 leading-tight" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    {activeDream.title}
                  </h2>
                  {activeDream.description && (
                    <p className="text-sm text-amber-800/70 mb-4 line-clamp-2">{activeDream.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 bg-amber-200/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all"
                          style={{ width: `${Math.min(piggyBalance, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 flex-shrink-0">
                      {piggyBalance > 0 ? `${piggyBalance}%` : "Начни!"}
                    </span>
                  </div>
                  <button className="mt-3 flex items-center gap-1 text-sm font-semibold text-amber-800 bg-white/50 hover:bg-white/70 transition-colors rounded-xl px-3 py-1.5">
                    <span>Сделать шаг</span>
                    <ArrowRight size={14} />
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-amber-900 mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    О чём мечтаешь?
                  </h2>
                  <p className="text-sm text-amber-800/70 mb-3">Добавь первую мечту или цель</p>
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-amber-800 bg-white/60 hover:bg-white/80 transition-colors rounded-xl px-3 py-1.5">
                    <Plus size={14} />
                    <span>Добавить мечту</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── БЛОК 3: МОЙ РОСТ ── */}
        <section>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                  <TrendingUp size={16} className="text-teal-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>Мой рост</h2>
              </div>
              <button
                onClick={() => onTabChange?.("achievements")}
                className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-0.5 transition-colors"
              >
                Все <ChevronRight size={12} />
              </button>
            </div>

            {strongestArea && (
              <div className="mb-4 px-3 py-2.5 bg-teal-50 rounded-xl border border-teal-100">
                <p className="text-xs text-teal-600 font-medium">
                  💪 Сильнее всего растёт — <strong>{AREA_CONFIG[strongestArea.area]?.label}</strong>
                </p>
              </div>
            )}

            {topAreas.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5">
                {topAreas.map(area => {
                  const cfg = AREA_CONFIG[area.area];
                  if (!cfg) return null;
                  const AreaIcon = cfg.icon;
                  const pct = Math.round(area.current_level);
                  return (
                    <div key={area.id} className={`rounded-xl p-3 ${cfg.bg} border border-white`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <AreaIcon size={13} className={cfg.color} />
                        <span className="text-xs font-semibold text-slate-700">{cfg.label}</span>
                      </div>
                      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full rounded-full bg-current opacity-60 transition-all"
                          style={{ width: `${pct}%`, color: cfg.color.replace("text-", "") }}
                        />
                      </div>
                      <p className="text-xs font-bold text-slate-600">{pct}%</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🌱</div>
                <p className="text-sm text-slate-500">Добавь первые занятия</p>
                <p className="text-xs text-slate-400 mt-0.5">и начни отслеживать рост</p>
              </div>
            )}
          </div>
        </section>

        {/* ── БЛОК 4: ШАГИ НЕДЕЛИ ── */}
        <section>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Target size={16} className="text-violet-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>Шаги недели</h2>
                </div>
              </div>
              <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full">
                {doneCount}/{weekSteps.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {weekSteps.map(step => (
                <button
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className="w-full flex items-start gap-3 text-left group"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {step.done
                      ? <CheckCircle2 size={20} className="text-violet-500 fill-violet-100" />
                      : <Circle size={20} className="text-slate-300 group-hover:text-violet-300 transition-colors" />
                    }
                  </div>
                  <span className={`text-sm leading-snug transition-colors ${step.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                    {step.text}
                  </span>
                </button>
              ))}
            </div>

            {doneCount === weekSteps.length && (
              <div className="mt-4 rounded-xl bg-violet-50 border border-violet-100 px-3 py-2 text-center">
                <p className="text-sm font-semibold text-violet-700">🎉 Все шаги выполнены! Отличная неделя!</p>
              </div>
            )}
          </div>
        </section>

        {/* ── БЛОК 5: МОИ ЗАНЯТИЯ ── */}
        <section>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                  <Flame size={16} className="text-sky-500" />
                </div>
                <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>Мои занятия</h2>
              </div>
              <button className="text-xs text-slate-400 hover:text-sky-600 flex items-center gap-0.5 transition-colors">
                Все <ChevronRight size={12} />
              </button>
            </div>

            {development.length > 0 ? (
              <div className="space-y-2.5">
                {development.slice(0, 3).map(area => {
                  const cfg = AREA_CONFIG[area.area];
                  if (!cfg) return null;
                  const AreaIcon = cfg.icon;
                  return (
                    <div key={area.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <AreaIcon size={16} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-teal-400"
                              style={{ width: `${area.current_level}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 flex-shrink-0">{area.current_level}%</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="text-3xl mb-2">📚</div>
                <p className="text-sm text-slate-500">Нет активных занятий</p>
                <button className="mt-2 text-xs text-sky-600 font-medium flex items-center gap-1 mx-auto">
                  <Plus size={12} />
                  Добавить занятие
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── БЛОК 6: МОИ ДОСТИЖЕНИЯ ── */}
        <section>
          <div
            onClick={() => onTabChange?.("achievements")}
            className="cursor-pointer relative overflow-hidden rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)" }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-sky-200/30 -translate-y-12 translate-x-12" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center">
                    <Star size={16} className="text-amber-500" />
                  </div>
                  <h2 className="text-base font-bold text-sky-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Мои достижения</h2>
                </div>
                <ChevronRight size={16} className="text-sky-400" />
              </div>

              {child.achievements && child.achievements.length > 0 ? (
                <>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {child.achievements.slice(0, 4).map((ach, i) => (
                      <div
                        key={i}
                        className="bg-white/70 rounded-xl px-2.5 py-1.5 text-xs font-medium text-sky-800 border border-sky-200/50 flex items-center gap-1"
                      >
                        <span>🏅</span>
                        <span className="truncate max-w-[80px]">{ach}</span>
                      </div>
                    ))}
                    {child.achievements.length > 4 && (
                      <div className="bg-white/50 rounded-xl px-2.5 py-1.5 text-xs text-sky-600">
                        +{child.achievements.length - 4}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-sky-800">Всего наград: <strong>{child.achievements.length}</strong></p>
                </>
              ) : (
                <>
                  <div className="flex gap-1.5 mb-3">
                    {["🥇", "🏅", "⭐", "🎖️"].map((em, i) => (
                      <div key={i} className="w-10 h-10 rounded-xl bg-white/50 border border-sky-200/50 flex items-center justify-center text-xl opacity-40">
                        {em}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-sky-800">Первые награды уже ждут тебя!</p>
                  <button className="mt-2 flex items-center gap-1 text-xs font-semibold text-sky-700 bg-white/60 hover:bg-white/80 transition-colors rounded-lg px-2.5 py-1">
                    <Plus size={11} />
                    Добавить достижение
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── БЛОК 7: МОЯ СЕМЬЯ / МОИ КОРНИ ── */}
        <section>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Heart size={16} className="text-rose-400" />
                </div>
                <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>Моя семья</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Заглушка — три аватара членов семьи */}
              <div className="flex -space-x-2">
                {["👩", "👨", "👴"].map((em, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 border-2 border-white flex items-center justify-center text-lg shadow-sm"
                  >
                    {em}
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">Твоя семья рядом</p>
                <p className="text-xs text-slate-400">Семейное дерево и воспоминания</p>
              </div>
              <button className="flex-shrink-0 w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                <ChevronRight size={14} className="text-rose-400" />
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <div className="flex-1 rounded-xl bg-rose-50 border border-rose-100 p-2.5 flex items-center gap-2 cursor-pointer hover:bg-rose-100 transition-colors">
                <Camera size={14} className="text-rose-400" />
                <span className="text-xs font-medium text-rose-700">Фото семьи</span>
              </div>
              <div className="flex-1 rounded-xl bg-orange-50 border border-orange-100 p-2.5 flex items-center gap-2 cursor-pointer hover:bg-orange-100 transition-colors">
                <BookOpen size={14} className="text-orange-400" />
                <span className="text-xs font-medium text-orange-700">Истории</span>
              </div>
              <div className="flex-1 rounded-xl bg-amber-50 border border-amber-100 p-2.5 flex items-center gap-2 cursor-pointer hover:bg-amber-100 transition-colors">
                <Gift size={14} className="text-amber-500" />
                <span className="text-xs font-medium text-amber-700">Традиции</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── БЛОК 8: БЕЗОПАСНЫЕ ДЕНЬГИ ── */}
        <section>
          <div
            onClick={() => onTabChange?.("money")}
            className="cursor-pointer relative overflow-hidden rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)" }}
          >
            <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-emerald-200/30 translate-y-8 translate-x-8" />

            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0 text-xl">
                {SAFETY_TIPS[tipIndex].icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield size={11} className="text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Цифровая безопасность</span>
                </div>
                <p className="text-sm font-medium text-emerald-900 leading-snug">
                  {SAFETY_TIPS[tipIndex].text}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5 bg-white/60 rounded-xl px-2.5 py-1.5">
                    <Wallet size={12} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Копилка: {piggyBalance}₽</span>
                  </div>
                  <span className="text-xs text-emerald-600 flex items-center gap-0.5 font-medium">
                    Узнать больше <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Нижняя быстрая навигация */}
        <section>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: BookOpen, label: "Дневник", tab: "diary", bg: "bg-violet-50", color: "text-violet-600", border: "border-violet-100" },
              { icon: Sparkles, label: "Магазин", tab: "shop", bg: "bg-amber-50", color: "text-amber-600", border: "border-amber-100" },
              { icon: Wallet, label: "Копилка", tab: "money", bg: "bg-emerald-50", color: "text-emerald-600", border: "border-emerald-100" },
            ].map(item => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.tab}
                  onClick={() => onTabChange?.(item.tab)}
                  className={`rounded-2xl p-3.5 ${item.bg} border ${item.border} flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity`}
                >
                  <ItemIcon size={20} className={item.color} />
                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
