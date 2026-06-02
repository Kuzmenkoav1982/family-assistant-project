import { useState } from "react";
import { ChevronLeft, Plus, X, Heart, MapPin, BookOpen, Sparkles } from "lucide-react";
import Icon from "@/components/ui/icon";
import { useFamilyMembersContext } from "@/contexts/FamilyMembersContext";
import { useMemoryEntries } from "@/components/memory/useMemoryEntries";
import { useFamilyTraditions } from "@/hooks/useFamilyTraditions";

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface FamilyRootsScreenProps {
  child: { id: string; name: string };
  onBack?: () => void;
}

interface LocalStory {
  id: string;
  title: string;
  text: string;
  emoji: string;
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
        <p className="text-sm font-bold text-slate-800 leading-tight truncate" style={{ fontFamily: "Montserrat, sans-serif" }}>
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
  const dateStr = date ? (() => { const d = new Date(date); return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`; })() : "";

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
        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
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

// ─── Диалог добавления истории ────────────────────────────────────────────────

function AddStoryDialog({ onClose, onSave }: { onClose: () => void; onSave: (s: LocalStory) => void }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const EMOJIS = ["📖", "🏖️", "🏔️", "🎉", "🍕", "🌲", "🎭", "🎨", "⭐", "🚂", "🌅", "🏡"];
  const [emoji, setEmoji] = useState("📖");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 pb-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>Добавить историю</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Обложка</p>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-xl text-xl border transition-colors ${emoji === e ? "border-amber-300 bg-amber-50" : "border-slate-100 bg-slate-50"}`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Название *</p>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: Как мы ездили к морю"
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-rose-300 focus:bg-white transition-colors" />
        </div>

        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">История</p>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Расскажи немного об этом моменте…"
            rows={3}
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-rose-300 focus:bg-white transition-colors resize-none" />
        </div>

        <button
          onClick={() => { if (title.trim()) { onSave({ id: Date.now().toString(), title: title.trim(), text: text.trim(), emoji }); onClose(); }}}
          disabled={!title.trim()}
          className="w-full py-3 rounded-2xl text-sm font-bold bg-rose-50 text-rose-800 border border-rose-100 disabled:opacity-40 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
        >
          Сохранить историю
        </button>
      </div>
    </div>
  );
}

// ─── Диалог добавления места ──────────────────────────────────────────────────

function AddPlaceDialog({ onClose, onSave }: { onClose: () => void; onSave: (p: LocalPlace) => void }) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const EMOJIS = ["🏡", "🌲", "🏖️", "🏔️", "🌊", "🌸", "🏙️", "🛖", "⛺", "🌾", "🏛️", "🎡"];
  const [emoji, setEmoji] = useState("🏡");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 pb-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>Добавить место</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Значок</p>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-xl text-xl border transition-colors ${emoji === e ? "border-teal-300 bg-teal-50" : "border-slate-100 bg-slate-50"}`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Название *</p>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Например: Дача у бабушки"
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-teal-300 focus:bg-white transition-colors" />
        </div>

        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Почему это место важно</p>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Там всегда пахнет пирогами и летом"
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-teal-300 focus:bg-white transition-colors" />
        </div>

        <button
          onClick={() => { if (name.trim()) { onSave({ id: Date.now().toString(), name: name.trim(), note: note.trim(), emoji }); onClose(); }}}
          disabled={!name.trim()}
          className="w-full py-3 rounded-2xl text-sm font-bold bg-teal-50 text-teal-800 border border-teal-100 disabled:opacity-40 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
        >
          Сохранить место
        </button>
      </div>
    </div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

const WARMTH_PHRASES = [
  "Рядом те, кто любит и поддерживает",
  "Семья — это люди, истории и традиции",
  "Вот то, что важно сохранить навсегда",
];

export default function FamilyRootsScreen({ child, onBack }: FamilyRootsScreenProps) {
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

  // Локальный стейт для историй и мест (пока нет отдельного API)
  const [localStories, setLocalStories] = useState<LocalStory[]>([]);
  const [localPlaces, setLocalPlaces] = useState<LocalPlace[]>([]);
  const [showAddStory, setShowAddStory] = useState(false);
  const [showAddPlace, setShowAddPlace] = useState(false);

  // Тёплые слова — берём из первого члена семьи с ролью Мама/Папа
  const parentMember = familyMembers.find(m => ["Мама", "Папа", "Мать", "Отец"].includes(m.role));

  // ─── Empty state ─────────────────────────────────────────────────────────

  if (familyMembers.length === 0 && recentMemories.length === 0 && activeTraditions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
        <div className="bg-white px-4 pt-5 pb-4 rounded-b-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <ChevronLeft size={16} className="text-slate-500" />
            </button>
            <h1 className="text-[18px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>Моя семья</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-24">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-[17px] font-bold text-slate-700 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Начните собирать тёплую карту семьи
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Добавьте важного человека, семейную историю или традицию — и здесь появится ваше особенное пространство
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button onClick={() => setShowAddStory(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-100">
              <BookOpen size={14} /> Добавить историю
            </button>
            <button onClick={() => setShowAddPlace(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-100">
              <MapPin size={14} /> Добавить место
            </button>
          </div>
        </div>
        {showAddStory && <AddStoryDialog onClose={() => setShowAddStory(false)} onSave={s => setLocalStories(p => [s, ...p])} />}
        {showAddPlace && <AddPlaceDialog onClose={() => setShowAddPlace(false)} onSave={p => setLocalPlaces(prev => [p, ...prev])} />}
      </div>
    );
  }

  // ─── Основной экран ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f8f9fb]">

      {/* Хедер */}
      <div
        className="relative overflow-hidden px-4 pt-5 pb-8 rounded-b-3xl shadow-sm"
        style={{ background: "linear-gradient(135deg, #fff1f2 0%, #fff7ed 60%, #fef9f0 100%)" }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-rose-100/30 -translate-y-10 translate-x-10 blur-xl" />
        <div className="relative flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-8 h-8 rounded-xl bg-white/70 border border-rose-100 flex items-center justify-center flex-shrink-0">
            <ChevronLeft size={16} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-[18px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Моя семья
            </h1>
            <p className="text-xs text-slate-400">{firstName}</p>
          </div>
        </div>
        {/* Тёплая фраза */}
        <div className="relative flex items-start gap-3">
          <span className="text-3xl flex-shrink-0">🌿</span>
          <div>
            <p className="text-[15px] font-semibold text-slate-800 leading-snug" style={{ fontFamily: "Montserrat, sans-serif" }}>
              {phrase}
            </p>
            {parentMember && (
              <p className="text-xs text-slate-500 mt-1">
                {parentMember.name.split(" ")[0]} и {familyMembers.length > 1 ? `ещё ${familyMembers.length - 1}` : ""} рядом
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-4 pb-20">

        {/* ── БЛОК 1: ВАЖНЫЕ ЛЮДИ ─────────────────────────────────────────── */}
        {familyMembers.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-rose-400" />
                <p className="text-[15px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Важные люди
                </p>
              </div>
              <span className="text-xs text-slate-400">{familyMembers.length} человек</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {familyMembers.map(m => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          </section>
        )}

        {/* ── БЛОК 2: ТЁПЛЫЕ СЛОВА ────────────────────────────────────────── */}
        {parentMember && (
          <section>
            <div
              className="rounded-2xl p-4 border border-rose-100/60"
              style={{ background: "linear-gradient(135deg, #fff1f2 0%, #fef9f0 100%)" }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💬</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-snug italic">
                    «Мы всегда рядом и очень тобой гордимся»
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {parentMember.name.split(" ")[0]} и вся семья
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── БЛОК 3: СЕМЕЙНЫЕ ИСТОРИИ ────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-amber-500" />
              <p className="text-[15px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Наши истории
              </p>
            </div>
            <button
              onClick={() => setShowAddStory(true)}
              className="text-xs text-slate-400 hover:text-amber-600 transition-colors flex items-center gap-0.5"
            >
              <Plus size={11} /> Добавить
            </button>
          </div>

          {/* Воспоминания из реального API + локальные истории */}
          {memoriesLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-shrink-0 w-[200px] h-[180px] rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : recentMemories.length > 0 || localStories.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {localStories.map(s => (
                <MemoryCard key={s.id} title={s.title} text={s.text} />
              ))}
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
            <div className="bg-white rounded-2xl p-5 text-center border border-dashed border-slate-200 shadow-sm">
              <div className="text-2xl mb-1.5">📖</div>
              <p className="text-sm text-slate-500 mb-1">Здесь появятся ваши семейные истории</p>
              <button onClick={() => setShowAddStory(true)} className="mt-1 text-xs text-amber-600 font-medium flex items-center gap-1 mx-auto">
                <Plus size={11} /> Добавить первую
              </button>
            </div>
          )}
        </section>

        {/* ── БЛОК 4: НАШИ МЕСТА ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-teal-500" />
              <p className="text-[15px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Наши места
              </p>
            </div>
            <button
              onClick={() => setShowAddPlace(true)}
              className="text-xs text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-0.5"
            >
              <Plus size={11} /> Добавить
            </button>
          </div>

          {/* Места — берём из memory location_label + локальные */}
          {(() => {
            const apiPlaces = Array.from(
              new Set(
                memoryEntries
                  .filter(e => e.location_label)
                  .map(e => e.location_label as string)
              )
            ).slice(0, 4);

            const hasPlaces = localPlaces.length > 0 || apiPlaces.length > 0;

            if (!hasPlaces) {
              return (
                <div className="bg-white rounded-2xl p-4 text-center border border-dashed border-slate-200 shadow-sm">
                  <div className="text-2xl mb-1">🗺️</div>
                  <p className="text-sm text-slate-400 mb-1">Добавьте любимые места семьи</p>
                  <button onClick={() => setShowAddPlace(true)} className="text-xs text-teal-600 font-medium flex items-center gap-1 mx-auto">
                    <Plus size={11} /> Добавить место
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-2 gap-2">
                {localPlaces.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100/80 flex items-start gap-2">
                    <span className="text-xl flex-shrink-0">{p.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">{p.note}</p>
                    </div>
                  </div>
                ))}
                {apiPlaces.map((loc, i) => (
                  <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100/80 flex items-start gap-2">
                    <MapPin size={16} className="text-teal-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{loc}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Место из воспоминаний</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>

        {/* ── БЛОК 5: НАШИ ТРАДИЦИИ ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-violet-400" />
              <p className="text-[15px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Наши традиции
              </p>
            </div>
          </div>

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
            <div className="bg-white rounded-2xl p-4 text-center border border-dashed border-slate-200 shadow-sm">
              <div className="text-2xl mb-1">✨</div>
              <p className="text-sm text-slate-400">Традиции ещё не добавлены</p>
              <p className="text-xs text-slate-300 mt-0.5">Добавьте их в разделе «Семья»</p>
            </div>
          )}
        </section>

        {/* ── БЛОК 6: БЫСТРЫЕ ДЕЙСТВИЯ ────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowAddStory(true)}
              className="flex items-center gap-2 bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100/80 hover:shadow-md hover:border-amber-200 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Plus size={14} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">История</p>
                <p className="text-[11px] text-slate-400">Памятный момент</p>
              </div>
            </button>

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

      </div>

      {showAddStory && <AddStoryDialog onClose={() => setShowAddStory(false)} onSave={s => setLocalStories(p => [s, ...p])} />}
      {showAddPlace && <AddPlaceDialog onClose={() => setShowAddPlace(false)} onSave={p => setLocalPlaces(prev => [p, ...prev])} />}
    </div>
  );
}
