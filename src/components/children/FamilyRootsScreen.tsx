import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import Icon from "@/components/ui/icon";
import { useFamilyMembersContext } from "@/contexts/FamilyMembersContext";
import { useMemoryEntries } from "@/components/memory/useMemoryEntries";
import { useFamilyTraditions } from "@/hooks/useFamilyTraditions";
import {
  ScreenPage,
  ScreenHeader,
  ScreenBody,
  SectionCard,
  WarmQuote,
  EmptyState,
  InlineEmpty,
  AdaptiveDialog,
  DialogSubmit,
  FormField,
  FormInput,
  FormTextarea,
  EmojiPicker,
  MONTSERRAT,
} from "@/components/children/ui";

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface FamilyRootsScreenProps {
  child: { id: string; name: string };
  onBack?: () => void;
  onNavigateToMemory?: () => void;
}

interface LocalPlace {
  id: string;
  name: string;
  note: string;
  emoji: string;
}

// ─── Роли → тёплые подписи ────────────────────────────────────────────────────

const ROLE_NOTES: Record<string, string> = {
  "Мама":    "Всегда поддерживает и любит",
  "Папа":    "Учит и вдохновляет",
  "Мать":    "Всегда поддерживает и любит",
  "Отец":    "Учит и вдохновляет",
  "Жена":    "Любовь и тепло семьи",
  "Муж":     "Опора и поддержка",
  "Бабушка": "Бесконечная забота и уют",
  "Дедушка": "Мудрость и добрые истории",
  "Брат":    "Верный товарищ по играм",
  "Сестра":  "Лучшая подруга дома",
  "Сын":     "Радость и гордость семьи",
  "Дочь":    "Радость и гордость семьи",
};

function getNote(role: string): string {
  return ROLE_NOTES[role] ?? "Важный человек в жизни";
}

// ─── Аватар члена семьи ───────────────────────────────────────────────────────

function MemberCard({
  member,
  isChild,
}: {
  member: { id: string; name: string; role: string; avatar: string; avatar_type?: string; photo_url?: string };
  isChild?: boolean;
}) {
  const isPhoto = member.avatar_type === "photo" && member.photo_url;
  return (
    <div className={`flex-shrink-0 w-[140px] rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100/80 ${isChild ? "opacity-40" : ""}`}>
      {/* Фото / аватар */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center overflow-hidden">
        {isPhoto ? (
          <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl select-none">{member.avatar || "👤"}</span>
        )}
      </div>
      {/* Имя и роль */}
      <div className="px-2.5 py-2.5">
        <p className="text-sm font-bold text-slate-800 leading-tight truncate" style={MONTSERRAT}>
          {member.name.split(" ")[0]}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{member.role}</p>
        <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">{getNote(member.role)}</p>
      </div>
    </div>
  );
}

// ─── Карточка воспоминания ────────────────────────────────────────────────────

function MemoryCard({
  title,
  text,
  photoUrl,
  date,
}: {
  title: string;
  text?: string;
  photoUrl?: string;
  date?: string;
}) {
  const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const dateStr = date
    ? (() => { const d = new Date(date); return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`; })()
    : "";

  return (
    <div className="flex-shrink-0 w-[200px] rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100/80">
      {photoUrl ? (
        <div className="w-full h-[110px] overflow-hidden">
          <img src={photoUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-[80px] bg-gradient-to-br from-amber-50 to-rose-50 flex items-center justify-center">
          <span className="text-3xl">📖</span>
        </div>
      )}
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2" style={MONTSERRAT}>
          {title}
        </p>
        {text && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">{text}</p>}
        {dateStr && <p className="text-[10px] text-slate-300 mt-1.5">{dateStr}</p>}
      </div>
    </div>
  );
}

// ─── Карточка традиции ────────────────────────────────────────────────────────

function TraditionCard({ icon, name, description }: { icon: string; name: string; description: string }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100/80">
      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100/60 flex items-center justify-center text-xl flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-tight">{name}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">{description}</p>
      </div>
    </div>
  );
}

// ─── Диалог добавления места ──────────────────────────────────────────────────

const PLACE_EMOJIS = ["🏡", "🌲", "🏖️", "🏔️", "🌊", "🌸", "🏙️", "🛖", "⛺", "🌾", "🏛️", "🎡"];

function AddPlaceDialog({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (p: LocalPlace) => void;
}) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [emoji, setEmoji] = useState("🏡");

  const canSubmit = name.trim().length >= 1;

  const handleSave = () => {
    if (!canSubmit) return;
    onSave({ id: Date.now().toString(), name: name.trim(), note: note.trim(), emoji });
    onClose();
  };

  return (
    <AdaptiveDialog
      title="Добавить место"
      onClose={onClose}
      footer={
        <DialogSubmit
          label="Сохранить место"
          disabled={!canSubmit}
          onClick={handleSave}
          variant="teal"
        />
      }
    >
      <FormField label="Значок">
        <EmojiPicker
          options={PLACE_EMOJIS}
          value={emoji}
          onChange={setEmoji}
          activeClass="border-teal-300 bg-teal-50"
        />
      </FormField>

      <FormField label="Название" required>
        <FormInput
          value={name}
          onChange={setName}
          placeholder="Например: Дача у бабушки"
          focusColor="focus:border-teal-300"
        />
      </FormField>

      <FormField label="Почему это место важно">
        <FormInput
          value={note}
          onChange={setNote}
          placeholder="Там всегда пахнет пирогами и летом"
          focusColor="focus:border-teal-300"
        />
      </FormField>
    </AdaptiveDialog>
  );
}

// ─── Константы ────────────────────────────────────────────────────────────────

const WARMTH_PHRASES = [
  "Рядом те, кто любит и поддерживает",
  "Семья — это люди, истории и традиции",
  "Вот то, что важно сохранить навсегда",
];

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function FamilyRootsScreen({ child, onBack, onNavigateToMemory }: FamilyRootsScreenProps) {
  const firstName = (child.name || "Ребёнок").split(" ")[0];
  const phrase = WARMTH_PHRASES[child.id.charCodeAt(0) % WARMTH_PHRASES.length];

  // Реальные данные
  const { members } = useFamilyMembersContext();
  const { entries: memoryEntries, loading: memoriesLoading } = useMemoryEntries({ sort: "memory_date_desc" });
  const { traditions, loading: traditionsLoading } = useFamilyTraditions();

  // Семья — исключаем текущего ребёнка, берём до 6 человек
  const familyMembers = members
    .filter(m => m.id !== child.id)
    .slice(0, 6);

  // Воспоминания — берём 5 последних
  const recentMemories = memoryEntries.slice(0, 5);

  // Традиции — берём активные, до 4
  const activeTraditions = (traditions as Array<{ id: string; name: string; description: string; icon: string; isActive?: boolean }>)
    .filter(t => t.isActive !== false)
    .slice(0, 4);

  // Локальные места (истории убраны — перенаправляем в Воспоминания)
  const [localPlaces, setLocalPlaces] = useState<LocalPlace[]>([]);
  const [showAddPlace, setShowAddPlace] = useState(false);

  // Тёплые слова — берём из первого члена семьи с ролью Мама/Папа
  const parentMember = familyMembers.find(m => ["Мама", "Папа", "Мать", "Отец"].includes(m.role));

  // Обработчик кнопки «Добавить историю» — ведёт в раздел Воспоминания
  const handleAddStory = () => {
    if (onNavigateToMemory) {
      onNavigateToMemory();
    }
    // Если пропс не передан — кнопка просто неактивна визуально (см. рендер)
  };

  // ─── Empty state ─────────────────────────────────────────────────────────

  if (familyMembers.length === 0 && recentMemories.length === 0 && activeTraditions.length === 0) {
    return (
      <ScreenPage>
        <ScreenHeader title="Моя семья" subtitle={firstName} onBack={onBack} accent="rose" />
        <EmptyState
          emoji="🌿"
          title="Начните собирать тёплую карту семьи"
          description="Добавьте важного человека, семейную историю или традицию — и здесь появится ваше особенное пространство"
          action={onNavigateToMemory ? "Добавить историю" : undefined}
          onAction={onNavigateToMemory}
        />
        {/* Кнопка добавить место даже в empty state */}
        <div className="px-8 pb-6">
          <button
            onClick={() => setShowAddPlace(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-100 hover:bg-teal-100 transition-colors"
          >
            <MapPin size={14} />
            Добавить место
          </button>
        </div>
        {showAddPlace && (
          <AddPlaceDialog onClose={() => setShowAddPlace(false)} onSave={p => setLocalPlaces(prev => [p, ...prev])} />
        )}
      </ScreenPage>
    );
  }

  // ─── Основной экран ───────────────────────────────────────────────────────

  return (
    <ScreenPage>
      {/* Хедер с rose-акцентом */}
      <ScreenHeader
        title="Моя семья"
        subtitle={firstName}
        onBack={onBack}
        accent="rose"
      />

      <ScreenBody>

        {/* Тёплая фраза под хедером */}
        <section>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🌿</span>
            <div>
              <p className="text-[15px] font-semibold text-slate-800 leading-snug" style={MONTSERRAT}>
                {phrase}
              </p>
              {parentMember && (
                <p className="text-xs text-slate-400 mt-1">
                  {parentMember.name.split(" ")[0]}{familyMembers.length > 1 ? ` и ещё ${familyMembers.length - 1}` : ""} рядом
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── БЛОК 1: ВАЖНЫЕ ЛЮДИ ─────────────────────────────────────────── */}
        {familyMembers.length > 0 && (
          <SectionCard
            title="Важные люди"
            icon="Heart"
            iconBg="bg-rose-50"
            action={
              <span className="text-xs text-slate-400">{familyMembers.length} человек</span>
            }
            noPad
          >
            <div className="px-4 pb-4">
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {familyMembers.map(m => (
                  <MemberCard key={m.id} member={m} />
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── БЛОК 2: ТЁПЛЫЕ СЛОВА ────────────────────────────────────────── */}
        {parentMember && (
          <section>
            <WarmQuote
              text="Мы всегда рядом и очень тобой гордимся"
              author={`${parentMember.name.split(" ")[0]} и вся семья`}
              gradient="warm"
            />
          </section>
        )}

        {/* ── БЛОК 3: СЕМЕЙНЫЕ ИСТОРИИ ────────────────────────────────────── */}
        <SectionCard
          title="Наши истории"
          icon="BookOpen"
          iconBg="bg-amber-50"
          action={
            <button
              onClick={handleAddStory}
              className={`text-xs flex items-center gap-0.5 transition-colors ${
                onNavigateToMemory
                  ? "text-slate-400 hover:text-amber-600"
                  : "text-slate-300 cursor-default"
              }`}
              disabled={!onNavigateToMemory}
              title={onNavigateToMemory ? "Перейти в Воспоминания" : "Добавить историю можно в разделе Воспоминания"}
            >
              <Plus size={11} />
              {onNavigateToMemory ? "Добавить" : "В разделе Воспоминания"}
            </button>
          }
          noPad
        >
          <div className="px-4 pb-4">
            {memoriesLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex-shrink-0 w-[200px] h-[180px] rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : recentMemories.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {recentMemories.map(entry => (
                  <MemoryCard
                    key={entry.id}
                    title={entry.title}
                    text={entry.story ?? entry.caption ?? undefined}
                    photoUrl={entry.assets[0]?.file_url}
                    date={entry.memory_date ?? undefined}
                  />
                ))}
              </div>
            ) : (
              <InlineEmpty
                emoji="📖"
                text="Здесь появятся ваши семейные истории"
                action={onNavigateToMemory ? "Добавить в Воспоминания" : undefined}
                onAction={onNavigateToMemory}
              />
            )}

            {/* Подсказка-ссылка для перехода в раздел, если есть воспоминания */}
            {recentMemories.length > 0 && onNavigateToMemory && (
              <button
                onClick={onNavigateToMemory}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-50/60 border border-amber-100/60 text-xs text-amber-700 font-medium hover:bg-amber-50 transition-colors"
              >
                <Icon name="BookOpen" size={12} />
                Добавить историю в Воспоминания
              </button>
            )}
          </div>
        </SectionCard>

        {/* ── БЛОК 4: НАШИ МЕСТА ──────────────────────────────────────────── */}
        {(() => {
          const apiPlaces = Array.from(
            new Set(
              memoryEntries
                .filter(e => e.location_label)
                .map(e => e.location_label as string)
            )
          ).slice(0, 4);

          const hasPlaces = localPlaces.length > 0 || apiPlaces.length > 0;

          return (
            <SectionCard
              title="Наши места"
              icon="MapPin"
              iconBg="bg-teal-50"
              action={
                <button
                  onClick={() => setShowAddPlace(true)}
                  className="text-xs text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-0.5"
                >
                  <Plus size={11} /> Добавить
                </button>
              }
            >
              {!hasPlaces ? (
                <InlineEmpty
                  emoji="🗺️"
                  text="Добавьте любимые места семьи"
                  action="Добавить место"
                  onAction={() => setShowAddPlace(true)}
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {localPlaces.map(p => (
                    <div key={p.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-2">
                      <span className="text-xl flex-shrink-0">{p.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{p.name}</p>
                        {p.note && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">{p.note}</p>}
                      </div>
                    </div>
                  ))}
                  {apiPlaces.map((loc, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-2">
                      <MapPin size={16} className="text-teal-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{loc}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Место из воспоминаний</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          );
        })()}

        {/* ── БЛОК 5: НАШИ ТРАДИЦИИ ───────────────────────────────────────── */}
        <SectionCard title="Наши традиции" icon="Sparkles" iconBg="bg-violet-50">
          {traditionsLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : activeTraditions.length > 0 ? (
            <div className="space-y-2">
              {activeTraditions.map(t => (
                <TraditionCard key={t.id} icon={t.icon} name={t.name} description={t.description} />
              ))}
            </div>
          ) : (
            <InlineEmpty
              emoji="✨"
              text="Традиции ещё не добавлены. Добавьте их в разделе «Семья»"
            />
          )}
        </SectionCard>

        {/* ── БЛОК 6: БЫСТРЫЕ ДЕЙСТВИЯ ────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-2 gap-2">
            {/* История — ведёт в раздел Воспоминания */}
            <button
              onClick={handleAddStory}
              disabled={!onNavigateToMemory}
              className={`flex items-center gap-2 bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100/80 text-left transition-all ${
                onNavigateToMemory
                  ? "hover:shadow-md hover:border-amber-200 cursor-pointer"
                  : "opacity-50 cursor-default"
              }`}
              title={!onNavigateToMemory ? "Добавить историю можно в разделе Воспоминания" : undefined}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Icon name="BookOpen" size={14} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">История</p>
                <p className="text-[11px] text-slate-400">
                  {onNavigateToMemory ? "Памятный момент" : "В Воспоминаниях"}
                </p>
              </div>
            </button>

            {/* Место — открывает локальный диалог */}
            <button
              onClick={() => setShowAddPlace(true)}
              className="flex items-center gap-2 bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100/80 hover:shadow-md hover:border-teal-200 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <MapPin size={14} className="text-teal-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Место</p>
                <p className="text-[11px] text-slate-400">Важный адрес</p>
              </div>
            </button>
          </div>
        </section>

      </ScreenBody>

      {showAddPlace && (
        <AddPlaceDialog
          onClose={() => setShowAddPlace(false)}
          onSave={p => setLocalPlaces(prev => [p, ...prev])}
        />
      )}
    </ScreenPage>
  );
}
