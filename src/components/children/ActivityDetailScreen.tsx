import { useState } from "react";
import { ChevronLeft, Plus, X } from "lucide-react";
import Icon from "@/components/ui/icon";

// ─── Типы ────────────────────────────────────────────────────────────────────

export type ActivityStatus = "active" | "planned" | "completed" | "paused";

export interface ActivityFull {
  id: string;
  development_id: string;
  name: string;
  type: string;            // Секция / Кружок / Репетитор / Онлайн-курс
  area: string;            // sport / education / creativity / social / music
  schedule?: string;       // "Вт, Чт 17:00"
  cost?: number;
  status: ActivityStatus;
  description?: string;
  started?: string;        // ISO date "YYYY-MM-DD"
  // Живые следы — на фронте пока, потом API
  lastResult?: string;
  lastResultDate?: string;
  childMood?: string;      // emoji
  childMoodNote?: string;
  familyComment?: string;
}

interface ActivityDetailScreenProps {
  activity: ActivityFull;
  onBack: () => void;
  onUpdate?: (updated: ActivityFull) => void;
}

// ─── Конфиг областей ─────────────────────────────────────────────────────────

const AREA_CONFIG: Record<string, {
  label: string;
  icon: string;
  color: string;
  bg: string;
  benefit: string;
}> = {
  sport:      { label: "Спорт",          icon: "Dumbbell", color: "text-teal-600",   bg: "bg-teal-50",   benefit: "Развивает выносливость, координацию и режим" },
  education:  { label: "Учёба",          icon: "BookOpen", color: "text-sky-600",    bg: "bg-sky-50",    benefit: "Тренирует внимание, логику и концентрацию" },
  creativity: { label: "Творчество",     icon: "Palette",  color: "text-violet-600", bg: "bg-violet-50", benefit: "Развивает воображение и уверенность в себе" },
  social:     { label: "Общение",        icon: "Users",    color: "text-rose-500",   bg: "bg-rose-50",   benefit: "Учит работать в команде и находить общий язык" },
  music:      { label: "Музыка",         icon: "Music",    color: "text-amber-600",  bg: "bg-amber-50",  benefit: "Развивает слух, ритм и усидчивость" },
  hobby:      { label: "Хобби",          icon: "Star",     color: "text-orange-500", bg: "bg-orange-50", benefit: "Поддерживает интересы и радость от занятий" },
};

const STATUS_CONFIG: Record<ActivityStatus, { label: string; bg: string; color: string }> = {
  active:    { label: "Активно",       bg: "bg-teal-50",   color: "text-teal-700" },
  planned:   { label: "Запланировано", bg: "bg-sky-50",    color: "text-sky-700" },
  completed: { label: "Завершено",     bg: "bg-slate-100", color: "text-slate-500" },
  paused:    { label: "На паузе",      bg: "bg-amber-50",  color: "text-amber-700" },
};

const MOOD_OPTIONS = ["😄", "🙂", "😐", "😔", "😴", "🔥", "💪", "😊"];

// ─── Диалог «Добавить результат» ─────────────────────────────────────────────

function AddResultDialog({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (result: string, mood: string, note: string) => void;
}) {
  const [result, setResult] = useState("");
  const [mood, setMood] = useState("🙂");
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Добавить результат
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Настроение после занятия</p>
          <div className="flex gap-2 flex-wrap">
            {MOOD_OPTIONS.map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`w-9 h-9 rounded-xl text-xl border transition-colors ${
                  mood === m ? "border-teal-300 bg-teal-50" : "border-slate-100 bg-slate-50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Что получилось *</p>
          <input
            value={result}
            onChange={e => setResult(e.target.value)}
            placeholder="Например: сделал сальто, получил 5 за диктант…"
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-teal-300 focus:bg-white transition-colors"
          />
        </div>

        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Заметка</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Любые подробности или ощущения…"
            rows={2}
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-teal-300 focus:bg-white transition-colors resize-none"
          />
        </div>

        <button
          onClick={() => { if (result.trim()) { onSave(result.trim(), mood, note.trim()); onClose(); }}}
          disabled={!result.trim()}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-colors disabled:opacity-40 disabled:bg-slate-100 disabled:text-slate-400"
          style={{ background: result.trim() ? "linear-gradient(135deg, #f0fdf9 0%, #ccfbf1 100%)" : undefined, color: result.trim() ? "#115e59" : undefined }}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function ActivityDetailScreen({ activity, onBack, onUpdate }: ActivityDetailScreenProps) {
  const [data, setData] = useState<ActivityFull>(activity);
  const [showAddResult, setShowAddResult] = useState(false);

  const areaCfg = AREA_CONFIG[data.area] ?? AREA_CONFIG["hobby"];
  const statusCfg = STATUS_CONFIG[data.status] ?? STATUS_CONFIG["active"];

  const handleSaveResult = (result: string, mood: string, note: string) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = { ...data, lastResult: result, lastResultDate: today, childMood: mood, childMoodNote: note || undefined };
    setData(updated);
    onUpdate?.(updated);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  const isActive = data.status === "active";

  return (
    <div className="min-h-screen bg-[#f8f9fb]">

      {/* Хедер */}
      <div className="bg-white px-4 pt-5 pb-4 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft size={16} className="text-slate-500" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-bold text-slate-800 leading-tight truncate" style={{ fontFamily: "Montserrat, sans-serif" }}>
              {data.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${statusCfg.bg} ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
              <span className="text-xs text-slate-400">{data.type}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-3 pb-20">

        {/* Что даёт ребёнку */}
        <section>
          <div className={`rounded-2xl p-4 border ${areaCfg.bg} border-opacity-60`} style={{ borderColor: "rgba(0,0,0,0.05)" }}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0`}>
                <Icon name={areaCfg.icon} size={18} className={areaCfg.color} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "inherit", opacity: 0.6 }}>
                  {areaCfg.label}
                </p>
                <p className="text-sm font-semibold text-slate-800 leading-snug">
                  {areaCfg.benefit}
                </p>
                {data.description && (
                  <p className="text-sm text-slate-500 mt-1 leading-snug">{data.description}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Ритм и участие */}
        <section>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
            <p className="text-[15px] font-bold text-slate-800 mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Ритм
            </p>
            <div className="space-y-2">
              {data.schedule && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Icon name="Clock" size={13} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Расписание</p>
                    <p className="text-sm font-medium text-slate-700">{data.schedule}</p>
                  </div>
                </div>
              )}
              {data.started && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Icon name="Calendar" size={13} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Занимается с</p>
                    <p className="text-sm font-medium text-slate-700">{formatDate(data.started)}</p>
                  </div>
                </div>
              )}
              {data.cost && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Icon name="Wallet" size={13} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Стоимость</p>
                    <p className="text-sm font-medium text-slate-700">{data.cost.toLocaleString("ru")} ₽/мес</p>
                  </div>
                </div>
              )}
              {!data.schedule && !data.started && !data.cost && (
                <p className="text-sm text-slate-400">Расписание ещё не добавлено</p>
              )}
            </div>
          </div>
        </section>

        {/* Что уже получилось */}
        <section>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[15px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Что уже получилось
              </p>
              {isActive && (
                <button
                  onClick={() => setShowAddResult(true)}
                  className="flex items-center gap-1 text-xs text-teal-600 font-medium hover:text-teal-700 transition-colors"
                >
                  <Plus size={12} /> Добавить
                </button>
              )}
            </div>

            {data.lastResult ? (
              <div>
                <div
                  className="rounded-xl p-3.5 border border-teal-100/80"
                  style={{ background: "linear-gradient(135deg, #f0fdf9 0%, #f0fdfa 100%)" }}
                >
                  <div className="flex items-start gap-2.5">
                    {data.childMood && (
                      <span className="text-xl flex-shrink-0">{data.childMood}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{data.lastResult}</p>
                      {data.childMoodNote && (
                        <p className="text-xs text-slate-500 mt-1 leading-snug">{data.childMoodNote}</p>
                      )}
                      {data.lastResultDate && (
                        <p className="text-xs text-slate-400 mt-1.5">{formatDate(data.lastResultDate)}</p>
                      )}
                    </div>
                  </div>
                </div>
                {data.familyComment && (
                  <div className="mt-2 flex items-start gap-2 px-3 py-2.5 bg-amber-50/50 rounded-xl border border-amber-100/50">
                    <span className="text-base flex-shrink-0">💬</span>
                    <p className="text-xs text-slate-700 italic leading-snug">«{data.familyComment}»</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-2xl mb-1.5">🌱</div>
                <p className="text-sm text-slate-400 mb-1">Результатов пока нет</p>
                {isActive && (
                  <button
                    onClick={() => setShowAddResult(true)}
                    className="text-xs text-teal-600 font-medium flex items-center gap-1 mx-auto"
                  >
                    <Plus size={11} /> Добавить первый
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Настроение — если есть */}
        {data.childMood && (
          <section>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
              <p className="text-[15px] font-bold text-slate-800 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Как ребёнку
              </p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{data.childMood}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {["😄", "🔥", "💪", "😊"].includes(data.childMood) ? "С радостью ходит на занятие" :
                     ["🙂", "😐"].includes(data.childMood) ? "В целом нормально" :
                     "Иногда трудно, но старается"}
                  </p>
                  {data.childMoodNote && (
                    <p className="text-xs text-slate-400 mt-0.5">{data.childMoodNote}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* На паузе / завершено — мягкое сообщение */}
        {(data.status === "paused" || data.status === "completed") && (
          <section>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 text-center">
              <p className="text-2xl mb-1.5">{data.status === "paused" ? "⏸" : "🎓"}</p>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                {data.status === "paused" ? "Занятие на паузе" : "Занятие завершено"}
              </p>
              <p className="text-xs text-slate-400 leading-snug">
                {data.status === "paused"
                  ? "Всё, что было достигнуто — сохранено. Можно вернуться в любой момент."
                  : "Всё пройденное осталось в памяти и повлияло на рост."}
              </p>
            </div>
          </section>
        )}

        {/* Следующий шаг */}
        {isActive && (
          <section>
            <div
              className="rounded-2xl p-4 border border-slate-100/80"
              style={{ background: "linear-gradient(135deg, #f7fbff 0%, #eef6ff 100%)" }}
            >
              <p className="text-[15px] font-bold text-slate-800 mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Следующий шаг
              </p>
              <div className="space-y-2">
                {[
                  { icon: "Camera", text: "Добавить фото с занятия",   color: "text-sky-400" },
                  { icon: "Star",   text: "Отметить маленькую победу", color: "text-amber-500" },
                  { icon: "MessageCircle", text: "Написать комментарий семьи", color: "text-rose-400" },
                ].map(item => (
                  <div
                    key={item.text}
                    className="flex items-center gap-2.5 bg-white/80 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white transition-colors"
                    onClick={() => item.text.includes("победу") && setShowAddResult(true)}
                  >
                    <Icon name={item.icon} size={14} className={item.color} />
                    <p className="text-sm text-slate-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>

      {showAddResult && (
        <AddResultDialog onClose={() => setShowAddResult(false)} onSave={handleSaveResult} />
      )}
    </div>
  );
}
