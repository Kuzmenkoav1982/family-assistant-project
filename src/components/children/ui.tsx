/**
 * Детское пространство — базовые UI-компоненты
 *
 * Дизайн-правила:
 *  • Фон страницы:  bg-[#f8f9fb]
 *  • Карточка:      bg-white rounded-2xl shadow-sm border border-slate-100/80
 *  • Тёплый акцент: #fff9f0 → #fef3dc  (мечта, достижения)
 *  • Голубой акцент: #f7fbff → #eef6ff (моменты, семья)
 *  • Заголовок секции: text-[15px] font-bold text-slate-800 Montserrat
 *  • Meta/caption:    text-xs text-slate-400
 *  • Хедер экрана:   bg-white px-4 pt-5 pb-4 rounded-b-3xl shadow-sm
 */

import { ReactNode } from "react";
import { ChevronLeft, X, CheckCircle2, Circle, Plus } from "lucide-react";
import Icon from "@/components/ui/icon";

// ─── Токены ──────────────────────────────────────────────────────────────────

export const MONTSERRAT = { fontFamily: "Montserrat, sans-serif" } as const;

/** Фоны акцентных блоков */
export const GRADIENTS = {
  warm:    "linear-gradient(135deg, #fff9f0 0%, #fef3dc 100%)",   // мечта, достижения
  sky:     "linear-gradient(135deg, #f7fbff 0%, #eef6ff 100%)",   // моменты, семья
  rose:    "linear-gradient(135deg, #fff1f2 0%, #fff7ed 100%)",   // семья hero
  mint:    "linear-gradient(135deg, #f0fdf9 0%, #f0fdfa 100%)",   // результат занятия
  success: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",   // безопасность
} as const;

// ─── ScreenPage ──────────────────────────────────────────────────────────────
/** Оболочка экрана: серый фон + нижний отступ */
export function ScreenPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {children}
    </div>
  );
}

// ─── ScreenHeader ─────────────────────────────────────────────────────────────
/** Верхняя полоса с кнопкой «назад», заголовком и опциональным правым слотом */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  accent,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  accent?: keyof typeof GRADIENTS;
}) {
  const style = accent ? { background: GRADIENTS[accent] } : undefined;

  return (
    <div
      className="relative overflow-hidden px-4 pt-5 pb-4 rounded-b-3xl shadow-sm"
      style={style ?? { background: "#fff" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-xl bg-white/70 border border-slate-100 flex items-center justify-center flex-shrink-0"
              aria-label="Назад"
            >
              <ChevronLeft size={16} className="text-slate-500" />
            </button>
          )}
          <div className="min-w-0">
            <h1
              className="text-[18px] font-bold text-slate-800 leading-tight truncate"
              style={MONTSERRAT}
            >
              {title}
            </h1>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    </div>
  );
}

// ─── ScreenBody ──────────────────────────────────────────────────────────────
/** Контент-зона с единым паддингом и отступом снизу */
export function ScreenBody({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 pt-3 space-y-3 pb-20">
      {children}
    </div>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────
/** Белая карточка-секция с заголовком и опциональным action */
export function SectionCard({
  title,
  icon,
  iconBg = "bg-slate-50",
  action,
  children,
  noPad = false,
}: {
  title: string;
  icon?: string;
  iconBg?: string;
  action?: ReactNode;
  children: ReactNode;
  noPad?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden">
      <div className={`flex items-center justify-between ${noPad ? "px-4 pt-4 pb-3" : "px-4 pt-4 pb-3"}`}>
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
              <Icon name={icon} size={14} className="text-slate-600" />
            </div>
          )}
          <h2 className="text-[15px] font-bold text-slate-800" style={MONTSERRAT}>
            {title}
          </h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={noPad ? "" : "px-4 pb-4"}>
        {children}
      </div>
    </div>
  );
}

// ─── AccentCard ──────────────────────────────────────────────────────────────
/** Акцентная карточка (мечта, достижения, моменты) с градиентным фоном */
export function AccentCard({
  gradient = "warm",
  label,
  labelColor = "text-amber-600",
  children,
  onClick,
}: {
  gradient?: keyof typeof GRADIENTS;
  label?: string;
  labelColor?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className="w-full text-left relative overflow-hidden rounded-2xl p-5 border border-slate-100/60"
      style={{ background: GRADIENTS[gradient] }}
    >
      {/* Декоративный круг */}
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/10 -translate-y-10 translate-x-10 pointer-events-none" />
      <div className="relative">
        {label && (
          <p className={`text-[11px] font-semibold uppercase tracking-widest mb-2 ${labelColor}`}>
            ✦ &nbsp;{label}
          </p>
        )}
        {children}
      </div>
    </Tag>
  );
}

// ─── InsightBanner ────────────────────────────────────────────────────────────
/** Однострочный инсайт внутри SectionCard */
export function InsightBanner({
  text,
  highlight,
  bg = "bg-slate-50",
}: {
  text: string;
  highlight?: string;
  bg?: string;
}) {
  return (
    <div className={`${bg} rounded-xl px-3 py-2 mb-3`}>
      <p className="text-xs text-slate-600 leading-snug">
        {text}
        {highlight && <strong className="text-teal-600"> {highlight}</strong>}
      </p>
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
/** Горизонтальный прогресс-бар */
export function ProgressBar({
  value,
  max = 100,
  barClass = "bg-slate-300",
  height = "h-1.5",
}: {
  value: number;
  max?: number;
  barClass?: string;
  height?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`${height} bg-slate-100 rounded-full overflow-hidden`}>
      <div
        className={`h-full rounded-full ${barClass} opacity-70 transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── MetaRow ──────────────────────────────────────────────────────────────────
/** Иконка + текст в одну строку — ритм, расписание, стоимость */
export function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon name={icon} size={13} className="text-slate-400" />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-700 leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ─── StepItem ─────────────────────────────────────────────────────────────────
/** Один шаг в блоке «Шаги недели» */
export function StepItem({
  text,
  done,
  onToggle,
}: {
  text: string;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className="w-full flex items-start gap-2.5 text-left group">
      <div className="flex-shrink-0 mt-0.5">
        {done
          ? <CheckCircle2 size={18} className="text-violet-400" />
          : <Circle size={18} className="text-slate-200 group-hover:text-violet-200 transition-colors" />
        }
      </div>
      <span className={`text-sm leading-snug ${done ? "line-through text-slate-300" : "text-slate-600"}`}>
        {text}
      </span>
    </button>
  );
}

// ─── FilterChip ───────────────────────────────────────────────────────────────
/** Один фильтр-чип */
export function FilterChip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
        active
          ? "bg-slate-800 text-white border-slate-800"
          : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
      }`}
    >
      {icon && <Icon name={icon} size={12} />}
      {label}
    </button>
  );
}

/** Горизонтальная лента фильтров */
export function FilterRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
      {children}
    </div>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
/** Тёплое пустое состояние */
export function EmptyState({
  emoji,
  title,
  description,
  action,
  onAction,
}: {
  emoji: string;
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="text-[15px] font-bold text-slate-700 mb-1.5" style={MONTSERRAT}>{title}</p>
      {description && <p className="text-sm text-slate-400 leading-relaxed mb-4">{description}</p>}
      {action && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all"
        >
          <Plus size={13} /> {action}
        </button>
      )}
    </div>
  );
}

/** Мини-версия empty state внутри карточки */
export function InlineEmpty({
  emoji,
  text,
  action,
  onAction,
}: {
  emoji: string;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-5">
      <div className="text-2xl mb-1.5">{emoji}</div>
      <p className="text-sm text-slate-400">{text}</p>
      {action && onAction && (
        <button onClick={onAction} className="mt-2 text-xs font-medium flex items-center gap-1 mx-auto text-sky-600">
          <Plus size={11} /> {action}
        </button>
      )}
    </div>
  );
}

// ─── WarmQuote ────────────────────────────────────────────────────────────────
/** Цитата/тёплое слово семьи */
export function WarmQuote({
  text,
  author,
  gradient = "warm",
}: {
  text: string;
  author?: string;
  gradient?: keyof typeof GRADIENTS;
}) {
  return (
    <div
      className="rounded-xl p-3.5 border border-amber-100/60 flex items-start gap-2.5"
      style={{ background: GRADIENTS[gradient] }}
    >
      <span className="text-base flex-shrink-0">💬</span>
      <div>
        <p className="text-sm text-slate-700 leading-snug italic">«{text}»</p>
        {author && <p className="text-xs text-slate-400 mt-1">{author}</p>}
      </div>
    </div>
  );
}

// ─── NextStepBlock ────────────────────────────────────────────────────────────
/** Блок «что делать дальше» */
export function NextStepBlock({
  items,
}: {
  items: Array<{ icon: string; iconColor: string; text: string; onClick?: () => void }>;
}) {
  return (
    <AccentCard gradient="sky">
      <p className="text-[15px] font-bold text-slate-800 mb-3" style={MONTSERRAT}>
        Следующий шаг
      </p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            onClick={item.onClick}
            className="flex items-center gap-2.5 bg-white/80 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white transition-colors"
          >
            <Icon name={item.icon} size={14} className={item.iconColor} />
            <p className="text-sm text-slate-700 flex-1">{item.text}</p>
            <Icon name="ArrowRight" size={12} className="text-slate-300 flex-shrink-0" />
          </div>
        ))}
      </div>
    </AccentCard>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
/** Маленькая метка статуса */
export function StatusBadge({
  label,
  bg,
  color,
}: {
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${bg} ${color}`}>
      {label}
    </span>
  );
}

// ─── AdaptiveDialog ───────────────────────────────────────────────────────────
/**
 * Адаптивный диалог: снизу на mobile, по центру на desktop.
 * Передай children — содержимое диалога.
 */
export function AdaptiveDialog({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-[16px] font-bold text-slate-800" style={MONTSERRAT}>{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"
            aria-label="Закрыть"
          >
            <X size={14} className="text-slate-500" />
          </button>
        </div>
        {/* Тело */}
        <div className="pb-safe">{children}</div>
        {/* Подвал */}
        {footer && <div className="pt-2">{footer}</div>}
      </div>
    </div>
  );
}

/** Кнопка-подтверждение для AdaptiveDialog */
export function DialogSubmit({
  label,
  disabled,
  onClick,
  variant = "warm",
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  variant?: "warm" | "teal" | "dark" | "rose";
}) {
  const styles: Record<string, string> = {
    warm: "bg-amber-50 text-amber-900 border border-amber-200 disabled:bg-slate-100 disabled:text-slate-400",
    teal: "bg-teal-50 text-teal-900 border border-teal-200 disabled:bg-slate-100 disabled:text-slate-400",
    dark: "bg-slate-800 text-white disabled:bg-slate-200 disabled:text-slate-400",
    rose: "bg-rose-50 text-rose-800 border border-rose-100 disabled:bg-slate-100 disabled:text-slate-400",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full mt-4 py-3 rounded-2xl text-sm font-bold transition-colors ${styles[variant]}`}
    >
      {label}
    </button>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────
/** Поле формы с меткой */
export function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {label}{required && " *"}
      </p>
      {children}
    </div>
  );
}

/** Текстовый инпут */
export function FormInput({
  value,
  onChange,
  placeholder,
  focusColor = "focus:border-sky-300",
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  focusColor?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none ${focusColor} focus:bg-white transition-colors`}
    />
  );
}

/** Текстовый textarea */
export function FormTextarea({
  value,
  onChange,
  placeholder,
  rows = 2,
  focusColor = "focus:border-sky-300",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  focusColor?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-300 focus:outline-none ${focusColor} focus:bg-white transition-colors resize-none`}
    />
  );
}

// ─── EmojiPicker ──────────────────────────────────────────────────────────────
/** Выбор эмодзи-значка */
export function EmojiPicker({
  options,
  value,
  onChange,
  activeClass = "border-amber-300 bg-amber-50",
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  activeClass?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(e => (
        <button
          key={e}
          onClick={() => onChange(e)}
          className={`w-9 h-9 rounded-xl text-xl border transition-colors ${
            value === e ? activeClass : "border-slate-100 bg-slate-50 hover:bg-slate-100"
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

// ─── AddRowButton ────────────────────────────────────────────────────────────
/** Кнопка «Добавить…» в виде пунктирной карточки */
export function AddRowButton({
  icon,
  label,
  sublabel,
  onClick,
}: {
  icon?: string;
  label: string;
  sublabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
    >
      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
        {icon ? <Icon name={icon} size={15} className="text-slate-400" /> : <Plus size={15} className="text-slate-400" />}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
      </div>
    </button>
  );
}
