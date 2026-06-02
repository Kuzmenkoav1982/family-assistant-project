import { useState } from "react";
import { ChevronLeft, Plus, X, Camera } from "lucide-react";
import Icon from "@/components/ui/icon";

// ─── Типы ────────────────────────────────────────────────────────────────────

type AchievementType = "big" | "small" | "moment";
type AchievementCategory = "all" | "sport" | "education" | "creativity" | "self" | "family";

interface Achievement {
  id: string;
  type: AchievementType;
  category: AchievementCategory;
  title: string;
  description?: string;
  date: string;       // ISO YYYY-MM-DD
  emoji: string;
  familyNote?: string;
}

interface AchievementsScreenProps {
  child: { id: string; name: string; achievements?: string[] };
  onBack?: () => void;
}

// ─── Конфиг категорий ────────────────────────────────────────────────────────

const CAT_CONFIG: Record<AchievementCategory, { label: string; icon: string }> = {
  all:        { label: "Все",           icon: "Sparkles" },
  sport:      { label: "Спорт",         icon: "Dumbbell" },
  education:  { label: "Учёба",         icon: "BookOpen" },
  creativity: { label: "Творчество",    icon: "Palette" },
  self:       { label: "Самостоятельность", icon: "Star" },
  family:     { label: "Семья",         icon: "Heart" },
};

// ─── Demo-данные (пока API не реализован) ────────────────────────────────────

const DEMO_ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    type: "big",
    category: "sport",
    title: "Первое место на соревнованиях",
    description: "Занял первое место на районных соревнованиях по плаванию",
    date: "2024-03-15",
    emoji: "🥇",
    familyNote: "Мы так тобой гордимся!",
  },
  {
    id: "2",
    type: "small",
    category: "self",
    title: "Три недели без пропусков",
    description: "Ходил на тренировки каждую неделю без пропусков",
    date: "2024-04-01",
    emoji: "🔥",
  },
  {
    id: "3",
    type: "big",
    category: "education",
    title: "Победитель олимпиады по математике",
    description: "Призовое место на школьной олимпиаде",
    date: "2024-02-20",
    emoji: "🏆",
    familyNote: "Умница! Мы верили в тебя.",
  },
  {
    id: "4",
    type: "moment",
    category: "family",
    title: "Наш первый поход",
    description: "Всей семьёй дошли до вершины горы",
    date: "2024-05-10",
    emoji: "🏔️",
    familyNote: "Это был незабываемый день",
  },
  {
    id: "5",
    type: "small",
    category: "creativity",
    title: "Прочитал 5 книг за месяц",
    date: "2024-03-31",
    emoji: "📚",
  },
  {
    id: "6",
    type: "small",
    category: "self",
    title: "Сам собирал рюкзак всю неделю",
    date: "2024-04-14",
    emoji: "🎒",
  },
];

// ─── Утилиты ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Компонент карточки "Большое достижение" ─────────────────────────────────

function BigAchievementCard({ item }: { item: Achievement }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 border border-amber-100/80"
      style={{ background: "linear-gradient(135deg, #fffdf5 0%, #fef9e8 100%)" }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-100/30 -translate-y-8 translate-x-8" />
      <div className="relative flex gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/80 border border-amber-100 flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
          {item.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-widest mb-1">
            ✦ &nbsp;Большое достижение
          </p>
          <h3
            className="text-[16px] font-bold text-slate-800 leading-snug mb-1"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {item.title}
          </h3>
          {item.description && (
            <p className="text-sm text-slate-500 leading-snug mb-2">{item.description}</p>
          )}
          <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
        </div>
      </div>
      {item.familyNote && (
        <div className="relative mt-4 flex items-start gap-2 bg-white/70 rounded-xl px-3 py-2.5 border border-amber-100/60">
          <span className="text-base flex-shrink-0">💬</span>
          <p className="text-sm text-slate-700 leading-snug italic">«{item.familyNote}»</p>
        </div>
      )}
    </div>
  );
}

// ─── Компонент карточки "Маленькая победа" ───────────────────────────────────

function SmallAchievementCard({ item }: { item: Achievement }) {
  return (
    <div className="bg-white rounded-xl p-3.5 border border-slate-100/80 shadow-sm flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
        {item.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{item.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{formatDate(item.date)}</p>
      </div>
    </div>
  );
}

// ─── Компонент карточки "Памятный момент" ────────────────────────────────────

function MomentCard({ item }: { item: Achievement }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 border border-sky-100/80"
      style={{ background: "linear-gradient(135deg, #f7fbff 0%, #eef6ff 100%)" }}
    >
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/80 border border-sky-100 flex items-center justify-center text-2xl flex-shrink-0">
          {item.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-sky-500 uppercase tracking-wider mb-1">
            Памятный момент
          </p>
          <p
            className="text-[15px] font-bold text-slate-800 leading-snug"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {item.title}
          </p>
          {item.description && (
            <p className="text-sm text-slate-500 mt-1 leading-snug">{item.description}</p>
          )}
          <p className="text-xs text-slate-400 mt-1.5">{formatDate(item.date)}</p>
        </div>
      </div>
      {item.familyNote && (
        <div className="mt-3 flex items-start gap-2 bg-white/70 rounded-xl px-3 py-2 border border-sky-100/60">
          <span className="text-sm flex-shrink-0">💬</span>
          <p className="text-xs text-slate-600 leading-snug italic">«{item.familyNote}»</p>
        </div>
      )}
    </div>
  );
}

// ─── Диалог добавления достижения ────────────────────────────────────────────

const EMOJI_OPTIONS = ["🥇", "🏆", "🎖️", "⭐", "🔥", "🎯", "📚", "🎨", "⚽", "🎵", "🏅", "🎒", "💪", "🌟", "🏔️", "🎪"];

function AddAchievementDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (a: Omit<Achievement, "id">) => void;
}) {
  const [type, setType] = useState<AchievementType>("small");
  const [category, setCategory] = useState<AchievementCategory>("self");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [familyNote, setFamilyNote] = useState("");
  const [emoji, setEmoji] = useState("⭐");
  const today = new Date().toISOString().split("T")[0];

  const canSubmit = title.trim().length >= 2;

  const handleAdd = () => {
    if (!canSubmit) return;
    onAdd({ type, category: category as Exclude<AchievementCategory, "all">, title: title.trim(), description: description.trim() || undefined, date: today, emoji, familyNote: familyNote.trim() || undefined });
    onClose();
  };

  const TYPE_OPTS: { value: AchievementType; label: string; desc: string }[] = [
    { value: "big",    label: "Большое",  desc: "Диплом, медаль, серьёзный результат" },
    { value: "small",  label: "Маленькая победа", desc: "Привычка, усилие, шаг вперёд" },
    { value: "moment", label: "Момент",   desc: "Памятное событие или семейный опыт" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-[17px] font-bold text-slate-800"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Добавить достижение
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"
          >
            <X size={15} className="text-slate-500" />
          </button>
        </div>

        {/* Тип */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Тип</p>
          <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={`rounded-xl p-2.5 text-left border transition-colors ${
                  type === opt.value
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <p className={`text-xs font-semibold mb-0.5 ${type === opt.value ? "text-amber-700" : "text-slate-700"}`}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Категория */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Категория</p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(CAT_CONFIG) as AchievementCategory[]).filter(k => k !== "all").map(k => (
              <button
                key={k}
                onClick={() => setCategory(k)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors ${
                  category === k
                    ? "border-sky-300 bg-sky-50 text-sky-700"
                    : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {CAT_CONFIG[k].label}
              </button>
            ))}
          </div>
        </div>

        {/* Эмодзи */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Значок</p>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-xl text-xl border transition-colors ${
                  emoji === e
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Название */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Название *</p>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Например: Первое место на соревновании"
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-sky-300 focus:bg-white transition-colors"
          />
        </div>

        {/* Описание */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Подробности</p>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Расскажи, что произошло..."
            rows={2}
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-sky-300 focus:bg-white transition-colors resize-none"
          />
        </div>

        {/* Слово семьи */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Слово семьи</p>
          <input
            value={familyNote}
            onChange={e => setFamilyNote(e.target.value)}
            placeholder="Мы тобой гордимся!"
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-sky-300 focus:bg-white transition-colors"
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!canSubmit}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-colors disabled:opacity-40"
          style={{
            background: canSubmit ? "linear-gradient(135deg, #fef9e8 0%, #fde8b8 100%)" : undefined,
            backgroundColor: canSubmit ? undefined : "#f1f5f9",
            color: canSubmit ? "#92400e" : "#94a3b8",
          }}
        >
          Сохранить достижение
        </button>
      </div>
    </div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function AchievementsScreen({ child, onBack }: AchievementsScreenProps) {
  const firstName = (child.name || "Ребёнок").split(" ")[0];

  const [items, setItems] = useState<Achievement[]>(DEMO_ACHIEVEMENTS);
  const [activeCategory, setActiveCategory] = useState<AchievementCategory>("all");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (data: Omit<Achievement, "id">) => {
    setItems(prev => [{ ...data, id: Date.now().toString() }, ...prev]);
  };

  const filtered = activeCategory === "all"
    ? items
    : items.filter(a => a.category === activeCategory);

  // Топовое достижение для hero-блока (самое свежее "big")
  const hero = items.find(a => a.type === "big") ?? items[0];
  const rest = filtered.filter(a => a.id !== hero?.id);

  const bigItems  = rest.filter(a => a.type === "big");
  const smallItems = rest.filter(a => a.type === "small");
  const momentItems = rest.filter(a => a.type === "moment");

  // ─── Empty state ─────────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
        <div className="bg-white px-4 pt-5 pb-4 rounded-b-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center"
            >
              <ChevronLeft size={16} className="text-slate-500" />
            </button>
            <h1
              className="text-[18px] font-bold text-slate-800"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Мои достижения
            </h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-24">
          <div className="text-5xl mb-4">🌟</div>
          <h2
            className="text-[17px] font-bold text-slate-700 mb-2"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Здесь появятся первые успехи
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Добавьте маленькую победу, грамоту или памятный момент — и начнётся история роста
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-amber-800 border border-amber-200"
            style={{ background: "linear-gradient(135deg, #fffdf5 0%, #fef9e8 100%)" }}
          >
            <Plus size={15} />
            Добавить первое достижение
          </button>
        </div>

        {showAdd && (
          <AddAchievementDialog onClose={() => setShowAdd(false)} onAdd={handleAdd} />
        )}
      </div>
    );
  }

  // ─── Основной экран ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f8f9fb]">

      {/* Хедер */}
      <div className="bg-white px-4 pt-5 pb-4 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between">
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
                Достижения
              </h1>
              <p className="text-xs text-slate-400">{firstName} · {items.length} побед</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <Plus size={13} />
            Добавить
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-3 pb-20">

        {/* Hero — главное достижение */}
        {hero && activeCategory === "all" && (
          <section>
            <BigAchievementCard item={hero} />
          </section>
        )}

        {/* Фильтры-чипы */}
        <section>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            {(Object.keys(CAT_CONFIG) as AchievementCategory[]).map(k => {
              const isActive = activeCategory === k;
              return (
                <button
                  key={k}
                  onClick={() => setActiveCategory(k)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <Icon name={CAT_CONFIG[k].icon} size={12} />
                  {CAT_CONFIG[k].label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Блок «Чем я горжусь» — 2–3 ключевых, только при "все" */}
        {activeCategory === "all" && items.filter(a => a.type === "big").length > 1 && (
          <section>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80">
              <p
                className="text-[15px] font-bold text-slate-800 mb-3"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Чем я горжусь
              </p>
              <div className="flex gap-2 flex-wrap">
                {items.filter(a => a.type === "big").slice(0, 3).map(a => (
                  <div
                    key={a.id}
                    className="flex items-center gap-1.5 bg-amber-50/70 border border-amber-100 rounded-xl px-2.5 py-1.5"
                  >
                    <span className="text-base">{a.emoji}</span>
                    <span className="text-xs font-medium text-slate-700 max-w-[110px] truncate">{a.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Лента достижений */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100/80">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm text-slate-500">В этой категории пока нет достижений</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-3 text-xs text-amber-600 font-medium flex items-center gap-1 mx-auto"
            >
              <Plus size={12} /> Добавить
            </button>
          </div>
        ) : (
          <>
            {/* Большие достижения (кроме hero) */}
            {bigItems.length > 0 && (
              <section className="space-y-3">
                {bigItems.map(item => <BigAchievementCard key={item.id} item={item} />)}
              </section>
            )}

            {/* Памятные моменты */}
            {momentItems.length > 0 && (
              <section className="space-y-3">
                {momentItems.map(item => <MomentCard key={item.id} item={item} />)}
              </section>
            )}

            {/* Маленькие победы */}
            {smallItems.length > 0 && (
              <section>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100/80">
                  <div className="px-4 pt-4 pb-2">
                    <p
                      className="text-[15px] font-bold text-slate-800"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Маленькие победы
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Каждая из них — шаг вперёд
                    </p>
                  </div>
                  <div className="px-4 pb-4 space-y-2">
                    {smallItems.map(item => (
                      <SmallAchievementCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* Добавить фото / документ */}
        <section>
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-dashed border-slate-200 hover:border-amber-200 hover:bg-amber-50/30 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
              <Camera size={15} className="text-slate-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-700">Добавить достижение</p>
              <p className="text-xs text-slate-400">Диплом, победа или памятный момент</p>
            </div>
            <Plus size={14} className="text-slate-300 flex-shrink-0" />
          </button>
        </section>

      </div>

      {showAdd && (
        <AddAchievementDialog onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
