import { useState, useCallback } from "react";
import { ChevronRight, Plus, BookOpen, Dumbbell, Palette, Users, Music, Shield, ArrowRight } from "lucide-react";
import Icon from "@/components/ui/icon";
import { useFamilyMembersContext } from "@/contexts/FamilyMembersContext";
import SafetyTests from "@/components/children/SafetyTests";
import MyRegionYaroslavl from "@/components/children/MyRegionYaroslavl";
import ChildProgressBlock from "@/components/children/ChildProgressBlock";
import { track } from "@/lib/analytics";
import {
  ScreenPage,
  ScreenBody,
  SectionCard,
  InsightBanner,
  ProgressBar,
  StepItem,
  InlineEmpty,
  MONTSERRAT,
} from "@/components/children/ui";

// ─── Типы ─────────────────────────────────────────────────────────────────────

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
  onAchievementsOpen?: () => void;
  onActivitiesOpen?: () => void;
  onFamilyOpen?: () => void;
}

// ─── Конфиг областей ─────────────────────────────────────────────────────────

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

// ─── Статичные данные ─────────────────────────────────────────────────────────

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

// ─── Аватар члена семьи ───────────────────────────────────────────────────────

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

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function ChildMasterScreen({
  child,
  childData,
  onTabChange,
  onGrowthOpen,
  onAchievementsOpen,
  onActivitiesOpen,
  onFamilyOpen,
}: ChildMasterScreenProps) {
  const tipIndex = useState(() => Math.floor(Math.random() * SAFETY_TIPS.length))[0];
  const [weekSteps, setWeekSteps] = useState(() =>
    WEEKLY_STEPS.map(s => ({ ...s, done: false }))
  );
  const [showSafetyTests, setShowSafetyTests] = useState(false);
  const [showMyRegion, setShowMyRegion] = useState(false);
  // Инкрементируется при закрытии SafetyTests/MyRegion → ChildProgressBlock перечитывает LS
  const [progressKey, setProgressKey] = useState(0);
  const closeTests = useCallback(() => { setShowSafetyTests(false); setProgressKey(k => k + 1); }, []);
  const closeRegion = useCallback(() => { setShowMyRegion(false); setProgressKey(k => k + 1); }, []);

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

  if (showSafetyTests) {
    return (
      <ScreenPage>
        <ScreenBody>
          <SafetyTests onBack={closeTests} childAge={child.age} />
        </ScreenBody>
      </ScreenPage>
    );
  }

  if (showMyRegion) {
    return (
      <ScreenPage>
        <ScreenBody>
          <MyRegionYaroslavl onBack={closeRegion} />
        </ScreenBody>
      </ScreenPage>
    );
  }

  return (
    <ScreenPage>

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
              style={MONTSERRAT}
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

      <ScreenBody>

        {/* ── БЛОК: МОЙ ПРОГРЕСС / С ЧЕГО НАЧАТЬ ── */}
        {/* key={progressKey} — перемонтируется после возврата из тестов/квиза, перечитывая LS */}
        <ChildProgressBlock
          key={progressKey}
          onOpenTests={() => setShowSafetyTests(true)}
          onOpenRegion={() => { setShowMyRegion(true); track('kids_region_open', { page: '/children' }); }}
          childAge={child.age}
        />

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
                    style={MONTSERRAT}
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
                    style={MONTSERRAT}
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

        {/* ── БЛОК 3: МОЙ РОСТ ── */}
        <SectionCard
          title="Мой рост"
          icon="TrendingUp"
          iconBg="bg-teal-50"
          noPad
          action={
            <button
              onClick={onGrowthOpen}
              className="text-xs text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-0.5"
            >
              Подробнее <ChevronRight size={12} />
            </button>
          }
        >
          <div className="px-4 pb-4">
            {strongestArea && (
              <InsightBanner
                text="Сильнее всего сейчас — "
                highlight={AREA_CONFIG[strongestArea.area]?.label}
              />
            )}

            {topAreas.length > 0 ? (
              <div className="space-y-2.5">
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
                        <ProgressBar value={pct} barClass={cfg.bar} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <InlineEmpty
                emoji="🌱"
                text="Добавь занятия — начнём отслеживать рост"
              />
            )}
          </div>
        </SectionCard>

        {/* ── БЛОК 4: ШАГИ НЕДЕЛИ ── */}
        <SectionCard
          title="Шаги недели"
          icon="Target"
          iconBg="bg-violet-50"
          action={
            doneCount > 0 ? (
              <span className="text-[11px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                {doneCount}/{weekSteps.length}
              </span>
            ) : undefined
          }
        >
          <div className="space-y-2">
            {weekSteps.map(step => (
              <StepItem
                key={step.id}
                text={step.text}
                done={step.done}
                onToggle={() => toggleStep(step.id)}
              />
            ))}
          </div>

          {doneCount === weekSteps.length && (
            <div className="mt-3 rounded-xl bg-violet-50 px-3 py-2 text-center">
              <p className="text-xs font-semibold text-violet-600">Отличная неделя! 🎉</p>
            </div>
          )}
        </SectionCard>

        {/* ── БЛОК 5: МОИ ЗАНЯТИЯ ── */}
        {topAreas.length > 0 && (
          <SectionCard
            title="Мои занятия"
            icon="Sparkles"
            iconBg="bg-sky-50"
            action={
              <button
                onClick={() => onActivitiesOpen ? onActivitiesOpen() : onTabChange?.("activities")}
                className="text-xs text-slate-400 hover:text-sky-600 transition-colors flex items-center gap-0.5"
              >
                Все <ChevronRight size={12} />
              </button>
            }
          >
            <div className="space-y-2">
              {topAreas.slice(0, 3).map(area => {
                const cfg = AREA_CONFIG[area.area];
                if (!cfg) return null;
                const AreaIcon = cfg.icon;
                return (
                  <div
                    key={area.id}
                    onClick={() => onActivitiesOpen ? onActivitiesOpen() : onTabChange?.("activities")}
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
          </SectionCard>
        )}

        {/* ── БЛОК 6: МОИ ДОСТИЖЕНИЯ ── */}
        <section>
          <button
            onClick={() => onAchievementsOpen ? onAchievementsOpen() : onTabChange?.("achievements")}
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
                      style={MONTSERRAT}
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
        <SectionCard
          title="Моя семья"
          icon="Heart"
          iconBg="bg-rose-50"
          action={
            <button
              onClick={() => onFamilyOpen ? onFamilyOpen() : onTabChange?.("family")}
              className="text-xs text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-0.5"
            >
              Открыть <ChevronRight size={12} />
            </button>
          }
        >
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
        </SectionCard>

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

        {/* ── БЛОК 9: МОЙ КРАЙ ── */}
        <section>
          <button
            onClick={() => { setShowMyRegion(true); track('kids_region_open', { page: '/children' }); }}
            className="w-full text-left rounded-2xl overflow-hidden border border-amber-200 shadow-sm hover:shadow-md transition group"
          >
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-3 flex items-center gap-3">
              <span className="text-2xl shrink-0">🐻</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-none">Мой край</p>
                <p className="text-amber-100 text-[11px] mt-0.5">Ярославская область — факты, квиз и прогулки</p>
              </div>
              <ArrowRight size={16} className="text-white/70 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </section>

        {/* ── БЛОК 10: ЧТО ДЕЛАТЬ, ЕСЛИ… ── */}
        <section>
          <div className="rounded-2xl overflow-hidden border border-rose-200 shadow-sm">
            {/* Заголовок — клик открывает блок (событие) */}
            <div
              className="bg-gradient-to-r from-rose-500 to-red-500 px-4 py-3 flex items-center gap-3 cursor-default"
              onClick={() => track('kids_safety_block_open', { page: '/children' })}
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Shield size={15} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">Что делать, если…</p>
                <p className="text-rose-100 text-[11px] mt-0.5">Помощь в важной ситуации</p>
              </div>
            </div>

            <div className="bg-rose-50/60 p-3 flex flex-col gap-2.5">
              {/* Главный детский месседж */}
              <div className="bg-white rounded-xl px-3 py-2.5 border border-rose-100">
                <p className="text-[12px] text-slate-600 leading-snug">
                  Если страшно, непонятно или кто-то просит деньги —{" "}
                  <span className="font-semibold text-rose-600">сначала позови взрослого</span>
                </p>
              </div>

              {/* МЧС */}
              <a
                href="https://www.mchs.gov.ru/deyatelnost/rabota-s-det-mi"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('kids_safety_mchs_click', { page: '/children' })}
                className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-rose-100 hover:border-rose-300 hover:shadow-sm transition group"
              >
                <span className="text-xl shrink-0">🚒</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">Пожар и ЧС</p>
                  <p className="text-[11px] text-slate-500">Детский раздел МЧС России</p>
                </div>
                <ArrowRight size={14} className="text-rose-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Антимошенник */}
              <a
                href="/anti-scam?mode=kids"
                onClick={() => track('kids_safety_antiscam_click', { page: '/children' })}
                className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-orange-100 hover:border-orange-300 hover:shadow-sm transition group"
              >
                <span className="text-xl shrink-0">🛡️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">Звонок с просьбой денег</p>
                  <p className="text-[11px] text-slate-500">Что делать при мошенничестве</p>
                </div>
                <ArrowRight size={14} className="text-orange-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* 112 — главная большая кнопка */}
              <a
                href="tel:112"
                onClick={() => track('kids_safety_call_112', { page: '/children' })}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl py-3 transition group"
              >
                <span className="text-2xl font-black text-white leading-none">112</span>
                <span className="text-red-100 text-xs font-medium">— единый номер экстренных служб</span>
              </a>

              {/* Вторичные номера */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { num: "101", label: "Пожар", color: "bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-400", event: "kids_safety_call_101" as const },
                  { num: "102", label: "Полиция", color: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400", event: "kids_safety_call_102" as const },
                  { num: "103", label: "Скорая", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400", event: "kids_safety_call_103" as const },
                ].map(item => (
                  <a
                    key={item.num}
                    href={`tel:${item.num}`}
                    onClick={() => track(item.event, { page: '/children' })}
                    className={`${item.color} border rounded-xl py-2 flex flex-col items-center gap-0.5 transition`}
                  >
                    <span className="text-sm font-black leading-none">{item.num}</span>
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </a>
                ))}
              </div>

              {/* Desktop-подсказка */}
              <p className="text-center text-[10px] text-slate-400 hidden sm:block">
                На телефоне кнопки выше сразу наберут номер
              </p>

              {/* Тесты по безопасности */}
              <button
                onClick={() => { setShowSafetyTests(true); }}
                className="w-full flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-violet-100 hover:border-violet-300 hover:shadow-sm transition group"
              >
                <span className="text-xl shrink-0">🧠</span>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">Тесты по безопасности</p>
                  <p className="text-[11px] text-slate-500">Проверь свои знания — пожар, мошенники, интернет</p>
                </div>
                <ArrowRight size={14} className="text-violet-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </section>

      </ScreenBody>
    </ScreenPage>
  );
}