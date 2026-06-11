import { MONTSERRAT } from "@/components/children/ui";

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

export function getNote(role: string): string {
  return ROLE_NOTES[role] ?? "Важный человек в жизни";
}

// ─── Аватар члена семьи ───────────────────────────────────────────────────────

export function MemberCard({
  member,
  isChild,
}: {
  member: { id: string; name: string; role: string; avatar: string; avatar_type?: string; photo_url?: string };
  isChild?: boolean;
}) {
  const isPhoto = member.avatar_type === "photo" && member.photo_url;
  return (
    <div className={`flex-shrink-0 w-[140px] rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100/80 ${isChild ? "opacity-40" : ""}`}>
      <div className="relative w-full aspect-square bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center overflow-hidden">
        {isPhoto ? (
          <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl select-none">{member.avatar || "👤"}</span>
        )}
      </div>
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

const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export function MemoryCard({
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
  const dateStr = date
    ? (() => { const d = new Date(date); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; })()
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

export function TraditionCard({ icon, name, description }: { icon: string; name: string; description: string }) {
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
