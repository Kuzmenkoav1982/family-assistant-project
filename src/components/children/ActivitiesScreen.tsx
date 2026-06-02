import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import Icon from "@/components/ui/icon";
import ActivityDetailScreen, { ActivityFull, ActivityStatus } from "./ActivityDetailScreen";

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface Development {
  id: string;
  area: string;
  current_level: number;
  target_level: number;
  activities?: RawActivity[];
}

interface RawActivity {
  id: string;
  development_id: string;
  name: string;
  type: string;
  schedule?: string;
  cost?: number;
  status: string;
}

interface ActivitiesScreenProps {
  child: { id: string; name: string; development?: Development[] };
  childData?: { development?: Development[] };
  onBack?: () => void;
}

// ─── Конфиг областей ─────────────────────────────────────────────────────────

const AREA_CONFIG: Record<string, {
  label: string;
  icon: string;
  color: string;
  bg: string;
  bar: string;
  shortBenefit: string;
}> = {
  sport:      { label: "Спорт",      icon: "Dumbbell", color: "text-teal-600",   bg: "bg-teal-50",   bar: "bg-teal-300",   shortBenefit: "выносливость и дисциплина" },
  education:  { label: "Учёба",      icon: "BookOpen", color: "text-sky-600",    bg: "bg-sky-50",    bar: "bg-sky-300",    shortBenefit: "внимание и мышление" },
  creativity: { label: "Творчество", icon: "Palette",  color: "text-violet-600", bg: "bg-violet-50", bar: "bg-violet-300", shortBenefit: "воображение и уверенность" },
  social:     { label: "Общение",    icon: "Users",    color: "text-rose-500",   bg: "bg-rose-50",   bar: "bg-rose-300",   shortBenefit: "командная работа и эмпатия" },
  music:      { label: "Музыка",     icon: "Music",    color: "text-amber-600",  bg: "bg-amber-50",  bar: "bg-amber-300",  shortBenefit: "слух и усидчивость" },
  hobby:      { label: "Хобби",      icon: "Star",     color: "text-orange-500", bg: "bg-orange-50", bar: "bg-orange-300", shortBenefit: "интересы и радость" },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: "Активно",       bg: "bg-teal-50",   color: "text-teal-700" },
  planned:   { label: "Скоро",         bg: "bg-sky-50",    color: "text-sky-700" },
  completed: { label: "Завершено",     bg: "bg-slate-100", color: "text-slate-500" },
  paused:    { label: "На паузе",      bg: "bg-amber-50",  color: "text-amber-700" },
};

const ACTIVITY_TYPES = ["Секция", "Кружок", "Репетитор", "Онлайн-курс", "Самостоятельно"];
const AREAS_LIST = Object.keys(AREA_CONFIG);

// ─── Диалог добавления занятия ────────────────────────────────────────────────

function AddActivityDialog({
  developments,
  onClose,
  onAdd,
}: {
  developments: Development[];
  onClose: () => void;
  onAdd: (activity: ActivityFull) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Секция");
  const [area, setArea] = useState("sport");
  const [schedule, setSchedule] = useState("");
  const [cost, setCost] = useState("");

  const canSubmit = name.trim().length >= 2;

  const handleAdd = () => {
    if (!canSubmit) return;
    // Находим или создаём development для этой области
    const dev = developments.find(d => d.area === area);
    const devId = dev?.id ?? `new-${area}`;
    onAdd({
      id: Date.now().toString(),
      development_id: devId,
      name: name.trim(),
      type,
      area,
      schedule: schedule.trim() || undefined,
      cost: cost ? parseInt(cost) : undefined,
      status: "active",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Добавить занятие
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        {/* Направление */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Направление</p>
          <div className="grid grid-cols-3 gap-1.5">
            {AREAS_LIST.map(a => {
              const cfg = AREA_CONFIG[a];
              const isActive = area === a;
              return (
                <button
                  key={a}
                  onClick={() => setArea(a)}
                  className={`rounded-xl px-2 py-2 flex items-center gap-1.5 border text-left transition-colors ${
                    isActive ? `border-slate-300 ${cfg.bg}` : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <Icon name={cfg.icon} size={13} className={isActive ? cfg.color : "text-slate-400"} />
                  <span className={`text-[11px] font-medium ${isActive ? "text-slate-800" : "text-slate-500"}`}>
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Тип */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Тип</p>
          <div className="flex flex-wrap gap-1.5">
            {ACTIVITY_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors ${
                  type === t
                    ? "border-slate-400 bg-slate-100 text-slate-800"
                    : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Название */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Название *</p>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Например: Плавание, Английский, Рисование…"
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-sky-300 focus:bg-white transition-colors"
          />
        </div>

        {/* Расписание */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Расписание</p>
          <input
            value={schedule}
            onChange={e => setSchedule(e.target.value)}
            placeholder="Вт, Чт 17:00 или По субботам 10:00"
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-sky-300 focus:bg-white transition-colors"
          />
        </div>

        {/* Стоимость */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Стоимость в месяц, ₽</p>
          <input
            value={cost}
            onChange={e => setCost(e.target.value.replace(/\D/g, ""))}
            placeholder="5000"
            inputMode="numeric"
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none focus:border-sky-300 focus:bg-white transition-colors"
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!canSubmit}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-colors disabled:opacity-40 disabled:bg-slate-100 disabled:text-slate-400 bg-slate-800 text-white"
        >
          Добавить занятие
        </button>
      </div>
    </div>
  );
}

// ─── Карточка занятия в списке ────────────────────────────────────────────────

function ActivityListCard({
  activity,
  onClick,
}: {
  activity: ActivityFull;
  onClick: () => void;
}) {
  const areaCfg = AREA_CONFIG[activity.area] ?? AREA_CONFIG["hobby"];
  const statusCfg = STATUS_CONFIG[activity.status] ?? STATUS_CONFIG["active"];
  const isNew = !activity.lastResult && activity.status === "active";

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 hover:shadow-md hover:border-slate-200 transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Иконка */}
        <div className={`w-10 h-10 rounded-xl ${areaCfg.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon name={areaCfg.icon} size={18} className={areaCfg.color} />
        </div>

        {/* Контент */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-slate-800 leading-tight truncate" style={{ fontFamily: "Montserrat, sans-serif" }}>
                {activity.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{areaCfg.shortBenefit}</p>
            </div>
            <span className={`flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-lg ${statusCfg.bg} ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>

          {/* Расписание */}
          {activity.schedule && (
            <div className="flex items-center gap-1.5 mt-2">
              <Icon name="Clock" size={11} className="text-slate-300" />
              <span className="text-xs text-slate-400">{activity.schedule}</span>
            </div>
          )}

          {/* Живой след или подсказка */}
          {activity.lastResult ? (
            <div className="mt-2 flex items-start gap-1.5">
              {activity.childMood && <span className="text-sm flex-shrink-0">{activity.childMood}</span>}
              <p className="text-xs text-slate-600 leading-snug line-clamp-1">{activity.lastResult}</p>
            </div>
          ) : isNew ? (
            <p className="mt-2 text-xs text-slate-300 italic">Добавьте первый результат →</p>
          ) : null}
        </div>

        <ChevronRight size={14} className="text-slate-200 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function ActivitiesScreen({ child, childData, onBack }: ActivitiesScreenProps) {
  const firstName = (child.name || "Ребёнок").split(" ")[0];
  const devs = (childData?.development ?? child.development ?? []) as Development[];

  // Разворачиваем все активности в плоский список с данными об области
  const [localActivities, setLocalActivities] = useState<ActivityFull[]>(() =>
    devs.flatMap(dev =>
      (dev.activities ?? []).map(a => ({
        id: a.id,
        development_id: dev.id,
        name: a.name,
        type: a.type,
        area: dev.area,
        schedule: a.schedule,
        cost: a.cost,
        status: (a.status ?? "active") as ActivityStatus,
      }))
    )
  );

  const [openActivity, setOpenActivity] = useState<ActivityFull | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const activeCount = localActivities.filter(a => a.status === "active").length;

  const handleAdd = (activity: ActivityFull) => {
    setLocalActivities(prev => [activity, ...prev]);
  };

  const handleUpdate = (updated: ActivityFull) => {
    setLocalActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  // Открыта карточка занятия
  if (openActivity) {
    return (
      <ActivityDetailScreen
        activity={openActivity}
        onBack={() => setOpenActivity(null)}
        onUpdate={updated => {
          handleUpdate(updated);
          setOpenActivity(updated);
        }}
      />
    );
  }

  // ─── Empty state ────────────────────────────────────────────────────────────

  if (localActivities.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
        <div className="bg-white px-4 pt-5 pb-4 rounded-b-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <ChevronLeft size={16} className="text-slate-500" />
            </button>
            <h1 className="text-[18px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Мои занятия
            </h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-24">
          <div className="text-5xl mb-4">🌱</div>
          <h2 className="text-[17px] font-bold text-slate-700 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Здесь появятся кружки, секции и любимые активности
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Добавьте первое занятие — и начнём собирать историю роста
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <Plus size={15} />
            Добавить занятие
          </button>
        </div>

        {showAdd && (
          <AddActivityDialog developments={devs} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
        )}
      </div>
    );
  }

  // ─── Основной экран ─────────────────────────────────────────────────────────

  const activeActivities  = localActivities.filter(a => a.status === "active");
  const plannedActivities = localActivities.filter(a => a.status === "planned");
  const pausedActivities  = localActivities.filter(a => a.status === "paused" || a.status === "completed");

  // Инсайт — что занимает больше времени
  const topArea = activeActivities
    .reduce<Record<string, number>>((acc, a) => ({ ...acc, [a.area]: (acc[a.area] ?? 0) + 1 }), {});
  const topAreaKey = Object.entries(topArea).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topAreaCfg = topAreaKey ? AREA_CONFIG[topAreaKey] : null;

  return (
    <div className="min-h-screen bg-[#f8f9fb]">

      {/* Хедер */}
      <div className="bg-white px-4 pt-5 pb-4 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <ChevronLeft size={16} className="text-slate-500" />
            </button>
            <div>
              <h1 className="text-[18px] font-bold text-slate-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Мои занятия
              </h1>
              <p className="text-xs text-slate-400">{firstName} · {activeCount} активных</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Plus size={13} />
            Добавить
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-3 pb-20">

        {/* Инсайт */}
        {topAreaCfg && (
          <section>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100/80">
              <p className="text-sm text-slate-700">
                Больше всего сейчас — <strong className={topAreaCfg.color}>{topAreaCfg.label}</strong>.{" "}
                <span className="text-slate-400">Это развивает {topAreaCfg.shortBenefit}</span>
              </p>
            </div>
          </section>
        )}

        {/* Активные занятия */}
        {activeActivities.length > 0 && (
          <section className="space-y-2.5">
            {activeActivities.map(a => (
              <ActivityListCard key={a.id} activity={a} onClick={() => setOpenActivity(a)} />
            ))}
          </section>
        )}

        {/* Запланированные */}
        {plannedActivities.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Запланированы
            </p>
            <div className="space-y-2.5">
              {plannedActivities.map(a => (
                <ActivityListCard key={a.id} activity={a} onClick={() => setOpenActivity(a)} />
              ))}
            </div>
          </section>
        )}

        {/* На паузе / завершённые */}
        {pausedActivities.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              На паузе и завершённые
            </p>
            <div className="space-y-2.5">
              {pausedActivities.map(a => (
                <ActivityListCard key={a.id} activity={a} onClick={() => setOpenActivity(a)} />
              ))}
            </div>
          </section>
        )}

        {/* Следующий шаг — добавить результат к занятию без следов */}
        {activeActivities.some(a => !a.lastResult) && (
          <section>
            <div
              className="rounded-2xl p-4 border border-slate-100/80"
              style={{ background: "linear-gradient(135deg, #f7fbff 0%, #eef6ff 100%)" }}
            >
              <p className="text-sm font-semibold text-slate-700 mb-2">Что можно сделать сейчас</p>
              <div className="space-y-1.5">
                {activeActivities.filter(a => !a.lastResult).slice(0, 2).map(a => (
                  <button
                    key={a.id}
                    onClick={() => setOpenActivity(a)}
                    className="w-full flex items-center gap-2.5 bg-white/80 rounded-xl px-3 py-2 hover:bg-white transition-colors text-left"
                  >
                    <Icon name="Plus" size={12} className="text-sky-400 flex-shrink-0" />
                    <p className="text-sm text-slate-700">Добавить результат — <strong>{a.name}</strong></p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Кнопка добавить ещё */}
        <section>
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
              <Plus size={15} className="text-slate-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-700">Добавить занятие</p>
              <p className="text-xs text-slate-400">Кружок, секция или любая активность</p>
            </div>
          </button>
        </section>

      </div>

      {showAdd && (
        <AddActivityDialog developments={devs} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
