import { useState, useMemo } from "react";
import { ChevronRight, Plus } from "lucide-react";
import Icon from "@/components/ui/icon";
import { useChildrenData } from "@/hooks/useChildrenData";
import ActivityDetailScreen, { ActivityFull, ActivityStatus } from "./ActivityDetailScreen";
import {
  ScreenPage,
  ScreenHeader,
  ScreenBody,
  AccentCard,
  InsightBanner,
  AdaptiveDialog,
  DialogSubmit,
  FormField,
  FormInput,
  EmptyState,
  AddRowButton,
  MONTSERRAT,
} from "@/components/children/ui";

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
  days_of_week?: number[];
  time_of_day?: string;
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
  active:    { label: "Активно",   bg: "bg-teal-50",   color: "text-teal-700" },
  planned:   { label: "Скоро",     bg: "bg-sky-50",    color: "text-sky-700" },
  completed: { label: "Завершено", bg: "bg-slate-100", color: "text-slate-500" },
  paused:    { label: "На паузе",  bg: "bg-amber-50",  color: "text-amber-700" },
};

const ACTIVITY_TYPES = ["Секция", "Кружок", "Репетитор", "Онлайн-курс", "Самостоятельно"];
const AREAS_LIST = Object.keys(AREA_CONFIG);
const WEEKDAYS = [
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
  { value: 0, label: "Вс" },
];

// ─── Выбор дней недели ─────────────────────────────────────────────────────────

function WeekdayPicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (days: number[]) => void;
}) {
  const toggle = (day: number) => {
    onChange(value.includes(day) ? value.filter(d => d !== day) : [...value, day]);
  };
  return (
    <div className="flex gap-1.5">
      {WEEKDAYS.map(d => (
        <button
          key={d.value}
          type="button"
          onClick={() => toggle(d.value)}
          className={`flex-1 h-9 rounded-lg text-xs font-semibold border transition-colors ${
            value.includes(d.value)
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

// ─── Диалог добавления/редактирования занятия ─────────────────────────────────

function AddActivityDialog({
  developments,
  initial,
  onClose,
  onSubmit,
}: {
  developments: Development[];
  initial?: ActivityFull;
  onClose: () => void;
  onSubmit: (activity: Omit<ActivityFull, "id" | "development_id"> & { development_id?: string }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "Секция");
  const [area, setArea] = useState(initial?.area ?? "sport");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initial?.daysOfWeek ?? []);
  const [timeOfDay, setTimeOfDay] = useState(initial?.timeOfDay ?? "");
  const [cost, setCost] = useState(initial?.cost ? String(initial.cost) : "");

  const canSubmit = name.trim().length >= 2;
  const isEdit = !!initial;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const dev = developments.find(d => d.area === area);
    onSubmit({
      development_id: dev?.id,
      name: name.trim(),
      type,
      area,
      daysOfWeek,
      timeOfDay: timeOfDay.trim() || undefined,
      schedule: undefined,
      cost: cost ? parseInt(cost) : undefined,
      status: initial?.status ?? "active",
    });
    onClose();
  };

  return (
    <AdaptiveDialog
      title={isEdit ? "Изменить занятие" : "Добавить занятие"}
      onClose={onClose}
      footer={
        <DialogSubmit
          label={isEdit ? "Сохранить изменения" : "Добавить занятие"}
          disabled={!canSubmit}
          onClick={handleSubmit}
          variant="dark"
        />
      }
    >
      {/* Направление */}
      <FormField label="Направление">
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
      </FormField>

      {/* Тип */}
      <FormField label="Тип">
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
      </FormField>

      {/* Название */}
      <FormField label="Название" required>
        <FormInput
          value={name}
          onChange={setName}
          placeholder="Например: Плавание, Английский, Рисование…"
          focusColor="focus:border-sky-300"
        />
      </FormField>

      {/* Дни недели */}
      <FormField label="Дни занятий">
        <WeekdayPicker value={daysOfWeek} onChange={setDaysOfWeek} />
      </FormField>

      {/* Время */}
      <FormField label="Время">
        <input
          type="time"
          value={timeOfDay}
          onChange={e => setTimeOfDay(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-sky-300"
        />
      </FormField>

      {/* Стоимость */}
      <FormField label="Стоимость в месяц, ₽">
        <FormInput
          value={cost}
          onChange={v => setCost(v.replace(/\D/g, ""))}
          placeholder="5000"
          focusColor="focus:border-sky-300"
          inputMode="numeric"
        />
      </FormField>

      {daysOfWeek.length > 0 && (
        <p className="text-xs text-slate-400 -mt-1 mb-1">
          Занятие появится в общем календаре семьи каждую неделю по выбранным дням
        </p>
      )}
    </AdaptiveDialog>
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
  const areaCfg   = AREA_CONFIG[activity.area] ?? AREA_CONFIG["hobby"];
  const statusCfg = STATUS_CONFIG[activity.status] ?? STATUS_CONFIG["active"];
  const isNew     = !activity.lastResult && activity.status === "active";

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
              <p
                className="text-[15px] font-bold text-slate-800 leading-tight truncate"
                style={MONTSERRAT}
              >
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

export default function ActivitiesScreen({ child, onBack }: ActivitiesScreenProps) {
  const firstName = (child.name || "Ребёнок").split(" ")[0];
  const { data, loading, addItem, updateItem, deleteItem } = useChildrenData(child.id);
  const devs = (data?.development ?? []) as unknown as Development[];

  // Разворачиваем все активности в плоский список с данными об области
  const activities = useMemo<ActivityFull[]>(() =>
    devs.flatMap(dev =>
      (dev.activities ?? []).map(a => ({
        id: a.id,
        development_id: dev.id,
        name: a.name,
        type: a.type,
        area: dev.area,
        schedule: a.schedule,
        daysOfWeek: a.days_of_week,
        timeOfDay: a.time_of_day,
        cost: a.cost,
        status: (a.status ?? "active") as ActivityStatus,
      }))
    ),
    [devs]
  );

  const [openActivityId, setOpenActivityId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editActivity, setEditActivity] = useState<ActivityFull | null>(null);

  const openActivity = activities.find(a => a.id === openActivityId) ?? null;
  const activeCount = activities.filter(a => a.status === "active").length;

  const handleAdd = async (payload: Omit<ActivityFull, "id" | "development_id"> & { development_id?: string }) => {
    let developmentId = payload.development_id;

    // Для выбранного направления ещё нет области развития — создаём её сначала
    if (!developmentId) {
      const areaResult = await addItem("development_area", {
        area: payload.area,
        current_level: 0,
        target_level: 100,
        family_id: localStorage.getItem("familyId") || "",
      });
      if (!areaResult.success || !areaResult.id) {
        alert(areaResult.error || "Не удалось создать область развития");
        return;
      }
      developmentId = String(areaResult.id);
    }

    const result = await addItem("activity", {
      development_id: developmentId,
      area: payload.area,
      type: payload.type,
      name: payload.name,
      days_of_week: payload.daysOfWeek,
      time_of_day: payload.timeOfDay,
      cost: payload.cost,
      status: payload.status,
    });
    if (!result.success) {
      alert(result.error || "Не удалось сохранить занятие");
    }
  };

  const handleUpdate = async (id: string, payload: Omit<ActivityFull, "id" | "development_id"> & { development_id?: string }) => {
    const result = await updateItem("activity", id, {
      area: payload.area,
      type: payload.type,
      name: payload.name,
      days_of_week: payload.daysOfWeek,
      time_of_day: payload.timeOfDay,
      cost: payload.cost,
      status: payload.status,
    });
    if (!result.success) {
      alert(result.error || "Не удалось сохранить изменения");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить это занятие? Оно также пропадёт из общего календаря семьи.")) return;
    const result = await deleteItem("activity", id);
    if (!result.success) {
      alert(result.error || "Не удалось удалить занятие");
    } else {
      setOpenActivityId(null);
    }
  };

  // Открыта карточка занятия — рендерим отдельный экран
  if (openActivity) {
    return (
      <>
        <ActivityDetailScreen
          activity={openActivity}
          onBack={() => setOpenActivityId(null)}
          onEdit={() => setEditActivity(openActivity)}
          onDelete={() => handleDelete(openActivity.id)}
        />
        {editActivity && (
          <AddActivityDialog
            developments={devs}
            initial={editActivity}
            onClose={() => setEditActivity(null)}
            onSubmit={payload => handleUpdate(editActivity.id, payload)}
          />
        )}
      </>
    );
  }

  // Кнопка «Добавить» в хедере
  const headerRight = (
    <button
      onClick={() => setShowAdd(true)}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
    >
      <Plus size={13} />
      Добавить
    </button>
  );

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <ScreenPage>
        <ScreenHeader title="Мои занятия" onBack={onBack} />
        <ScreenBody>
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400" />
          </div>
        </ScreenBody>
      </ScreenPage>
    );
  }

  // ─── Empty state ────────────────────────────────────────────────────────────

  if (activities.length === 0) {
    return (
      <ScreenPage>
        <ScreenHeader title="Мои занятия" onBack={onBack} />
        <EmptyState
          emoji="🌱"
          title="Здесь появятся кружки, секции и любимые активности"
          description="Добавьте первое занятие — и начнём собирать историю роста"
          action="Добавить занятие"
          onAction={() => setShowAdd(true)}
        />
        {showAdd && (
          <AddActivityDialog developments={devs} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />
        )}
      </ScreenPage>
    );
  }

  // ─── Основной экран ─────────────────────────────────────────────────────────

  const activeActivities  = activities.filter(a => a.status === "active");
  const plannedActivities = activities.filter(a => a.status === "planned");
  const pausedActivities  = activities.filter(a => a.status === "paused" || a.status === "completed");

  // Инсайт — что занимает больше времени
  const topArea = activeActivities
    .reduce<Record<string, number>>((acc, a) => ({ ...acc, [a.area]: (acc[a.area] ?? 0) + 1 }), {});
  const topAreaKey = Object.entries(topArea).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topAreaCfg = topAreaKey ? AREA_CONFIG[topAreaKey] : null;

  return (
    <ScreenPage>
      <ScreenHeader
        title="Мои занятия"
        subtitle={`${firstName} · ${activeCount} активных`}
        onBack={onBack}
        right={headerRight}
      />

      <ScreenBody>

        {/* Инсайт */}
        {topAreaCfg && (
          <section>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100/80">
              <InsightBanner
                text="Больше всего сейчас — "
                highlight={topAreaCfg.label}
              />
              <p className="text-xs text-slate-400 -mt-1">
                Это развивает {topAreaCfg.shortBenefit}
              </p>
            </div>
          </section>
        )}

        {/* Активные занятия */}
        {activeActivities.length > 0 && (
          <section className="space-y-2.5">
            {activeActivities.map(a => (
              <ActivityListCard key={a.id} activity={a} onClick={() => setOpenActivityId(a.id)} />
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
                <ActivityListCard key={a.id} activity={a} onClick={() => setOpenActivityId(a.id)} />
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
                <ActivityListCard key={a.id} activity={a} onClick={() => setOpenActivityId(a.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Что можно сделать — занятия без результата */}
        {activeActivities.some(a => !a.lastResult) && (
          <AccentCard gradient="sky">
            <p className="text-sm font-semibold text-slate-700 mb-2">Что можно сделать сейчас</p>
            <div className="space-y-1.5">
              {activeActivities.filter(a => !a.lastResult).slice(0, 2).map(a => (
                <button
                  key={a.id}
                  onClick={() => setOpenActivityId(a.id)}
                  className="w-full flex items-center gap-2.5 bg-white/80 rounded-xl px-3 py-2 hover:bg-white transition-colors text-left"
                >
                  <Icon name="Plus" size={12} className="text-sky-400 flex-shrink-0" />
                  <p className="text-sm text-slate-700">Добавить результат — <strong>{a.name}</strong></p>
                </button>
              ))}
            </div>
          </AccentCard>
        )}

        {/* Кнопка добавить занятие */}
        <AddRowButton
          label="Добавить занятие"
          sublabel="Кружок, секция или любая активность"
          onClick={() => setShowAdd(true)}
        />

      </ScreenBody>

      {showAdd && (
        <AddActivityDialog developments={devs} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />
      )}
    </ScreenPage>
  );
}