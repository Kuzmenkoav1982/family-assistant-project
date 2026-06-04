import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Minus, CheckCircle2, Sparkles, Trophy, PiggyBank, Edit2 } from "lucide-react";
import { MONTSERRAT } from "@/components/children/ui";
import { track } from "@/lib/analytics";

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface DreamGoal {
  targetAmount: number;
  savedAmount: number;
  dreamTitle: string;
  dreamEmoji: string;
}

const LS_KEY_PREFIX = "dream_goal_v1_";

function loadGoal(childId: string): DreamGoal | null {
  try {
    const raw = localStorage.getItem(LS_KEY_PREFIX + childId);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveGoal(childId: string, g: DreamGoal) {
  try {
    localStorage.setItem(LS_KEY_PREFIX + childId, JSON.stringify(g));
  } catch { /* ignore */ }
}

// ─── Экран поздравления ───────────────────────────────────────────────────────

function CelebrationScreen({ dreamTitle, onReset, onBack }: { dreamTitle: string; onReset: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-6">
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-amber-100 flex items-center justify-center">
          <Trophy size={52} className="text-amber-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center shadow-md">
          <CheckCircle2 size={20} className="text-white" />
        </div>
      </div>

      <div>
        <p className="text-[13px] font-bold uppercase tracking-widest text-amber-500 mb-2">Мечта сбылась!</p>
        <h2 className="text-2xl font-black text-slate-800 leading-snug mb-3" style={MONTSERRAT}>
          {dreamTitle}
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Ты копил — и добился. Это настоящая победа.
          <br />Теперь можно мечтать о следующем!
        </p>
      </div>

      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        <button
          onClick={onReset}
          className="w-full py-3 rounded-2xl bg-amber-400 text-white font-bold text-sm hover:bg-amber-500 transition active:scale-[0.98]"
        >
          Новая мечта
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition"
        >
          На главную
        </button>
      </div>
    </div>
  );
}

// ─── Экран настройки новой цели ───────────────────────────────────────────────

const DREAM_EMOJIS = ["✨", "🚲", "🎮", "📚", "⚽", "🎨", "🎸", "🏕️", "🐶", "🌍", "🎭", "💻"];
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

function NewGoalForm({ dreamTitle: defaultTitle, onSave }: { dreamTitle?: string; onSave: (g: DreamGoal) => void }) {
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [emoji, setEmoji] = useState("✨");
  const [amount, setAmount] = useState("");

  const canSave = title.trim().length > 0 && Number(amount) >= 50;

  return (
    <div className="flex flex-col gap-5 px-1">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-3">О чём мечтаешь?</p>

        {/* Эмодзи */}
        <div className="flex flex-wrap gap-2 mb-4">
          {DREAM_EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition
                ${emoji === e ? "bg-amber-100 ring-2 ring-amber-400" : "bg-slate-50 hover:bg-amber-50"}`}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Название */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Например: Велосипед"
          maxLength={40}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition"
        />
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Сколько нужно накопить?</p>
        {/* Быстрые суммы */}
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_AMOUNTS.map(q => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition
                ${amount === String(q) ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-600 hover:bg-amber-50"}`}
            >
              {q.toLocaleString("ru")} ₽
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Своя сумма"
            min={50}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition pr-10"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">₽</span>
        </div>
      </div>

      <button
        disabled={!canSave}
        onClick={() => onSave({ targetAmount: Number(amount), savedAmount: 0, dreamTitle: title.trim(), dreamEmoji: emoji })}
        className="w-full py-3.5 rounded-2xl bg-amber-400 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-500 transition active:scale-[0.98]"
      >
        Начать копить {emoji}
      </button>
    </div>
  );
}

// ─── Главный экран цели ───────────────────────────────────────────────────────

const ADD_AMOUNTS = [50, 100, 200, 500, 1000];

interface DreamGoalScreenProps {
  childId: string;
  dreamTitle?: string;
  onBack: () => void;
}

export default function DreamGoalScreen({ childId, dreamTitle, onBack }: DreamGoalScreenProps) {
  const [goal, setGoal] = useState<DreamGoal | null>(() => loadGoal(childId));
  const [showCelebration, setShowCelebration] = useState(false);
  const [addAmount, setAddAmount] = useState<number | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (goal) saveGoal(childId, goal);
  }, [goal, childId]);

  // Нет цели → форма создания
  if (!goal || editing) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button onClick={editing ? () => setEditing(false) : onBack} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <ArrowLeft size={16} className="text-slate-500" />
          </button>
          <div>
            <p className="font-bold text-slate-800 text-base leading-none">Коплю на мечту</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Поставь цель и начни копить</p>
          </div>
        </div>
        <NewGoalForm
          dreamTitle={dreamTitle}
          onSave={(g) => {
            setGoal(g);
            setEditing(false);
            track("kids_dream_goal_set", { props: { target: g.targetAmount } });
          }}
        />
      </div>
    );
  }

  // Экран поздравления
  if (showCelebration) {
    return (
      <CelebrationScreen
        dreamTitle={goal.dreamTitle}
        onReset={() => { setGoal(null); setShowCelebration(false); saveGoal(childId, null as unknown as DreamGoal); localStorage.removeItem(LS_KEY_PREFIX + childId); }}
        onBack={onBack}
      />
    );
  }

  const pct = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
  const isComplete = goal.savedAmount >= goal.targetAmount;

  function addSaving(amount: number) {
    if (!goal) return;
    const next = { ...goal, savedAmount: goal.savedAmount + amount };
    setGoal(next);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    track("kids_dream_saving_added", { props: { amount, total: next.savedAmount } });
    if (next.savedAmount >= next.targetAmount) {
      setTimeout(() => setShowCelebration(true), 800);
    }
  }

  const handleAdd = () => {
    const v = addAmount ?? Number(customInput);
    if (v > 0) { addSaving(v); setAddAmount(null); setCustomInput(""); }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Шапка */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
          <ArrowLeft size={16} className="text-slate-500" />
        </button>
        <div className="flex-1">
          <p className="font-bold text-slate-800 text-base leading-none">Коплю на мечту</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Каждый рубль приближает к цели</p>
        </div>
        <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
          <Edit2 size={14} className="text-slate-400" />
        </button>
      </div>

      {/* Карточка цели */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 border border-amber-100"
        style={{ background: "linear-gradient(135deg, #fff9f0 0%, #fef3dc 100%)" }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-100/40 -translate-y-12 translate-x-12 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{goal.dreamEmoji}</span>
            <div>
              <h2 className="font-black text-xl text-slate-800 leading-snug" style={MONTSERRAT}>
                {goal.dreamTitle}
              </h2>
              <p className="text-xs text-amber-600/80 mt-0.5">
                {isComplete ? "Цель достигнута! 🎉" : `Осталось собрать ${remaining.toLocaleString("ru")} ₽`}
              </p>
            </div>
          </div>

          {/* Прогресс-бар */}
          <div className="mb-3">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className={`${justAdded ? "text-emerald-600" : "text-amber-700"} transition-colors`}>
                {goal.savedAmount.toLocaleString("ru")} ₽
                {justAdded && <span className="ml-1 text-emerald-500 animate-pulse">+добавлено!</span>}
              </span>
              <span className="text-slate-400">{goal.targetAmount.toLocaleString("ru")} ₽</span>
            </div>
            <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: pct >= 100
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Накоплено {pct}%</span>
              {!isComplete && <span>До цели {100 - pct}%</span>}
            </div>
          </div>

          {/* Пополнить */}
          {!isComplete && (
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Пополнить копилку</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {ADD_AMOUNTS.map(a => (
                  <button
                    key={a}
                    onClick={() => setAddAmount(a === addAmount ? null : a)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95
                      ${addAmount === a ? "bg-amber-400 text-white shadow-sm" : "bg-white/80 text-amber-700 hover:bg-amber-50 border border-amber-100"}`}
                  >
                    +{a.toLocaleString("ru")} ₽
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={1}
                    value={customInput}
                    onChange={e => { setCustomInput(e.target.value); setAddAmount(null); }}
                    placeholder="Своя сумма"
                    className="w-full bg-white/80 border border-amber-100 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 placeholder:text-slate-300 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₽</span>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={!addAmount && !customInput}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 text-white font-bold text-sm disabled:opacity-40 hover:bg-amber-500 transition active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Кнопка когда цель достигнута */}
          {isComplete && (
            <button
              onClick={() => setShowCelebration(true)}
              className="w-full mt-3 py-3 rounded-2xl bg-emerald-400 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 transition active:scale-[0.98]"
            >
              <Sparkles size={16} /> Цель достигнута!
            </button>
          )}
        </div>
      </div>

      {/* История пополнений — заглушка */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Как копить быстрее</p>
        <div className="flex flex-col gap-1.5">
          {[
            { emoji: "🎂", text: "Попросить на день рождения" },
            { emoji: "🧹", text: "Заработать за помощь дома" },
            { emoji: "🎁", text: "Отложить часть подарка" },
          ].map(tip => (
            <div key={tip.text} className="flex items-center gap-2.5">
              <span className="text-base">{tip.emoji}</span>
              <span className="text-xs text-slate-500">{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Сбросить цель */}
      <button
        onClick={() => { localStorage.removeItem(LS_KEY_PREFIX + childId); setGoal(null); }}
        className="text-[11px] text-slate-300 hover:text-slate-400 transition text-center"
      >
        Сбросить и начать заново
      </button>
    </div>
  );
}
