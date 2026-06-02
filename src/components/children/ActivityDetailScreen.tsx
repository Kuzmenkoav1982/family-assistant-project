import { useState } from "react";
import { Plus } from "lucide-react";
import Icon from "@/components/ui/icon";
import {
  ScreenPage,
  ScreenHeader,
  ScreenBody,
  SectionCard,
  AccentCard,
  MetaRow,
  WarmQuote,
  NextStepBlock,
  AdaptiveDialog,
  DialogSubmit,
  FormField,
  FormInput,
  FormTextarea,
  EmojiPicker,
  InlineEmpty,
  MONTSERRAT,
} from "@/components/children/ui";

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
  sport:      { label: "Спорт",      icon: "Dumbbell",       color: "text-teal-600",   bg: "bg-teal-50",   benefit: "Развивает выносливость, координацию и режим" },
  education:  { label: "Учёба",      icon: "BookOpen",       color: "text-sky-600",    bg: "bg-sky-50",    benefit: "Тренирует внимание, логику и концентрацию" },
  creativity: { label: "Творчество", icon: "Palette",        color: "text-violet-600", bg: "bg-violet-50", benefit: "Развивает воображение и уверенность в себе" },
  social:     { label: "Общение",    icon: "Users",          color: "text-rose-500",   bg: "bg-rose-50",   benefit: "Учит работать в команде и находить общий язык" },
  music:      { label: "Музыка",     icon: "Music",          color: "text-amber-600",  bg: "bg-amber-50",  benefit: "Развивает слух, ритм и усидчивость" },
  hobby:      { label: "Хобби",      icon: "Star",           color: "text-orange-500", bg: "bg-orange-50", benefit: "Поддерживает интересы и радость от занятий" },
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

  const canSubmit = result.trim().length > 0;

  const handleSave = () => {
    if (!canSubmit) return;
    onSave(result.trim(), mood, note.trim());
    onClose();
  };

  return (
    <AdaptiveDialog
      title="Добавить результат"
      onClose={onClose}
      footer={
        <DialogSubmit
          label="Сохранить"
          disabled={!canSubmit}
          onClick={handleSave}
          variant="teal"
        />
      }
    >
      <FormField label="Настроение после занятия">
        <EmojiPicker
          options={MOOD_OPTIONS}
          value={mood}
          onChange={setMood}
          activeClass="border-teal-300 bg-teal-50"
        />
      </FormField>

      <FormField label="Что получилось" required>
        <FormInput
          value={result}
          onChange={setResult}
          placeholder="Например: сделал сальто, получил 5 за диктант…"
          focusColor="focus:border-teal-300"
        />
      </FormField>

      <FormField label="Заметка">
        <FormTextarea
          value={note}
          onChange={setNote}
          placeholder="Любые подробности или ощущения…"
          rows={2}
          focusColor="focus:border-teal-300"
        />
      </FormField>
    </AdaptiveDialog>
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
    <ScreenPage>
      <ScreenHeader
        title={data.name}
        subtitle={`${statusCfg.label} · ${data.type}`}
        onBack={onBack}
      />

      <ScreenBody>

        {/* Что даёт ребёнку */}
        <section>
          <div className={`rounded-2xl p-4 border ${areaCfg.bg} border-opacity-60`} style={{ borderColor: "rgba(0,0,0,0.05)" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0">
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
        <SectionCard title="Ритм">
          {data.schedule || data.started || data.cost ? (
            <div className="space-y-2">
              {data.schedule && (
                <MetaRow icon="Clock" label="Расписание" value={data.schedule} />
              )}
              {data.started && (
                <MetaRow icon="Calendar" label="Занимается с" value={formatDate(data.started)} />
              )}
              {data.cost && (
                <MetaRow icon="Wallet" label="Стоимость" value={`${data.cost.toLocaleString("ru")} ₽/мес`} />
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Расписание ещё не добавлено</p>
          )}
        </SectionCard>

        {/* Что уже получилось */}
        <SectionCard
          title="Что уже получилось"
          action={
            isActive ? (
              <button
                onClick={() => setShowAddResult(true)}
                className="flex items-center gap-1 text-xs text-teal-600 font-medium hover:text-teal-700 transition-colors"
              >
                <Plus size={12} /> Добавить
              </button>
            ) : undefined
          }
        >
          {data.lastResult ? (
            <div>
              <AccentCard gradient="mint">
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
              </AccentCard>
              {data.familyComment && (
                <div className="mt-2">
                  <WarmQuote text={data.familyComment} gradient="warm" />
                </div>
              )}
            </div>
          ) : (
            <InlineEmpty
              emoji="🌱"
              text="Результатов пока нет"
              action={isActive ? "Добавить первый" : undefined}
              onAction={isActive ? () => setShowAddResult(true) : undefined}
            />
          )}
        </SectionCard>

        {/* Настроение — если есть */}
        {data.childMood && (
          <SectionCard title="Как ребёнку">
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
          </SectionCard>
        )}

        {/* На паузе / завершено — мягкое сообщение */}
        {(data.status === "paused" || data.status === "completed") && (
          <section>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 text-center">
              <p className="text-2xl mb-1.5">{data.status === "paused" ? "⏸" : "🎓"}</p>
              <p className="text-sm font-semibold text-slate-700 mb-1" style={MONTSERRAT}>
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
          <NextStepBlock
            items={[
              {
                icon: "Camera",
                iconColor: "text-sky-400",
                text: "Добавить фото с занятия",
              },
              {
                icon: "Star",
                iconColor: "text-amber-500",
                text: "Отметить маленькую победу",
                onClick: () => setShowAddResult(true),
              },
              {
                icon: "MessageCircle",
                iconColor: "text-rose-400",
                text: "Написать комментарий семьи",
              },
            ]}
          />
        )}

      </ScreenBody>

      {showAddResult && (
        <AddResultDialog onClose={() => setShowAddResult(false)} onSave={handleSaveResult} />
      )}
    </ScreenPage>
  );
}
