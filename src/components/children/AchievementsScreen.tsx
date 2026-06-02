import { useState } from "react";
import { Plus } from "lucide-react";
import Icon from "@/components/ui/icon";
import {
  ScreenPage,
  ScreenHeader,
  ScreenBody,
  SectionCard,
  AdaptiveDialog,
  DialogSubmit,
  FormField,
  FormInput,
  FormTextarea,
  EmojiPicker,
  FilterRow,
  FilterChip,
  WarmQuote,
  EmptyState,
  InlineEmpty,
  AddRowButton,
  MONTSERRAT,
} from "@/components/children/ui";

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
  all:        { label: "Все",               icon: "Sparkles" },
  sport:      { label: "Спорт",             icon: "Dumbbell" },
  education:  { label: "Учёба",             icon: "BookOpen" },
  creativity: { label: "Творчество",        icon: "Palette" },
  self:       { label: "Самостоятельность", icon: "Star" },
  family:     { label: "Семья",             icon: "Heart" },
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
            style={MONTSERRAT}
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
        <div className="relative mt-4">
          <WarmQuote text={item.familyNote} />
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
            style={MONTSERRAT}
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
        <div className="mt-3">
          <WarmQuote text={item.familyNote} gradient="sky" />
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
    onAdd({
      type,
      category: category as Exclude<AchievementCategory, "all">,
      title: title.trim(),
      description: description.trim() || undefined,
      date: today,
      emoji,
      familyNote: familyNote.trim() || undefined,
    });
    onClose();
  };

  const TYPE_OPTS: { value: AchievementType; label: string; desc: string }[] = [
    { value: "big",    label: "Большое",         desc: "Диплом, медаль, серьёзный результат" },
    { value: "small",  label: "Маленькая победа", desc: "Привычка, усилие, шаг вперёд" },
    { value: "moment", label: "Момент",           desc: "Памятное событие или семейный опыт" },
  ];

  return (
    <AdaptiveDialog
      title="Добавить достижение"
      onClose={onClose}
      footer={
        <DialogSubmit
          label="Сохранить достижение"
          disabled={!canSubmit}
          onClick={handleAdd}
          variant="warm"
        />
      }
    >
      {/* Тип */}
      <FormField label="Тип">
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
      </FormField>

      {/* Категория */}
      <FormField label="Категория">
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
      </FormField>

      {/* Эмодзи */}
      <FormField label="Значок">
        <EmojiPicker
          options={EMOJI_OPTIONS}
          value={emoji}
          onChange={setEmoji}
          activeClass="border-amber-300 bg-amber-50"
        />
      </FormField>

      {/* Название */}
      <FormField label="Название" required>
        <FormInput
          value={title}
          onChange={setTitle}
          placeholder="Например: Первое место на соревновании"
          focusColor="focus:border-sky-300"
        />
      </FormField>

      {/* Описание */}
      <FormField label="Подробности">
        <FormTextarea
          value={description}
          onChange={setDescription}
          placeholder="Расскажи, что произошло..."
          rows={2}
          focusColor="focus:border-sky-300"
        />
      </FormField>

      {/* Слово семьи */}
      <FormField label="Слово семьи">
        <FormInput
          value={familyNote}
          onChange={setFamilyNote}
          placeholder="Мы тобой гордимся!"
          focusColor="focus:border-sky-300"
        />
      </FormField>
    </AdaptiveDialog>
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

  const bigItems    = rest.filter(a => a.type === "big");
  const smallItems  = rest.filter(a => a.type === "small");
  const momentItems = rest.filter(a => a.type === "moment");

  // Кнопка «Добавить» в хедере
  const headerRight = (
    <button
      onClick={() => setShowAdd(true)}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
    >
      <Plus size={13} />
      Добавить
    </button>
  );

  // ─── Empty state ─────────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <ScreenPage>
        <ScreenHeader title="Достижения" onBack={onBack} />
        <EmptyState
          emoji="🌟"
          title="Здесь появятся первые успехи"
          description="Добавьте маленькую победу, грамоту или памятный момент — и начнётся история роста"
          action="Добавить первое достижение"
          onAction={() => setShowAdd(true)}
        />
        {showAdd && (
          <AddAchievementDialog onClose={() => setShowAdd(false)} onAdd={handleAdd} />
        )}
      </ScreenPage>
    );
  }

  // ─── Основной экран ───────────────────────────────────────────────────────

  return (
    <ScreenPage>
      <ScreenHeader
        title="Достижения"
        subtitle={`${firstName} · ${items.length} побед`}
        onBack={onBack}
        right={headerRight}
      />

      <ScreenBody>

        {/* Hero — главное достижение */}
        {hero && activeCategory === "all" && (
          <section>
            <BigAchievementCard item={hero} />
          </section>
        )}

        {/* Фильтры-чипы */}
        <section>
          <FilterRow>
            {(Object.keys(CAT_CONFIG) as AchievementCategory[]).map(k => (
              <FilterChip
                key={k}
                label={CAT_CONFIG[k].label}
                icon={CAT_CONFIG[k].icon}
                active={activeCategory === k}
                onClick={() => setActiveCategory(k)}
              />
            ))}
          </FilterRow>
        </section>

        {/* Блок «Чем я горжусь» — 2–3 ключевых, только при "все" */}
        {activeCategory === "all" && items.filter(a => a.type === "big").length > 1 && (
          <SectionCard title="Чем я горжусь">
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
          </SectionCard>
        )}

        {/* Лента достижений */}
        {filtered.length === 0 ? (
          <SectionCard title="Достижения">
            <InlineEmpty
              emoji="🔍"
              text="В этой категории пока нет достижений"
              action="Добавить"
              onAction={() => setShowAdd(true)}
            />
          </SectionCard>
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
              <SectionCard title="Маленькие победы" noPad>
                <div className="px-4 pb-4">
                  <p className="text-xs text-slate-400 mb-3">Каждая из них — шаг вперёд</p>
                  <div className="space-y-2">
                    {smallItems.map(item => (
                      <SmallAchievementCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}
          </>
        )}

        {/* Добавить достижение */}
        <AddRowButton
          icon="Camera"
          label="Добавить достижение"
          sublabel="Диплом, победа или памятный момент"
          onClick={() => setShowAdd(true)}
        />

      </ScreenBody>

      {showAdd && (
        <AddAchievementDialog onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
    </ScreenPage>
  );
}
