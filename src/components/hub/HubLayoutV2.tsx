import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import ModalityBadge, { Modality } from './ModalityBadge';

export interface HubQuickFact {
  label: string;
  value: string | number;
  icon?: string;
}

export interface HubAttentionItem {
  id: string;
  icon: string;
  title: string;
  hint?: string;
  cta?: string;
  onAction?: () => void;
  iconColor?: string;
  iconBg?: string;
}

export interface HubNextStep {
  title: string;
  hint?: string;
  cta: string;
  onAction?: () => void;
}

export interface HubRelatedLink {
  label: string;
  icon?: string;
  path: string;
}

export interface HubLayoutV2Props {
  // Зона 1: Контекстный хедер
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  modalities?: Modality[];
  quickFacts?: HubQuickFact[];
  primaryAction?: { label: string; icon?: string; onClick?: () => void };
  secondaryAction?: { label: string; icon?: string; onClick?: () => void };
  cycleHint?: string; // например, «Цикл: Сбор» или «Цикл: Исполнение»
  backPath?: string;

  // Зона 2: Что важно сейчас (опционально)
  attention?: HubAttentionItem[];

  // Зона 3: Основные разделы — рендерятся как children
  children: ReactNode;

  // Зона 4: Следующий шаг (опционально)
  nextStep?: HubNextStep;

  // Зона 5: Связанные хабы (опционально)
  relatedLinks?: HubRelatedLink[];

  // Кастомизация фона
  backgroundClass?: string;
}

const HubLayoutV2 = ({
  title,
  subtitle,
  description,
  icon = 'LayoutGrid',
  iconColor = 'text-gray-600',
  iconBg = 'bg-gray-100 dark:bg-gray-800',
  modalities = [],
  quickFacts = [],
  primaryAction,
  secondaryAction,
  cycleHint,
  backPath,
  attention = [],
  children,
  nextStep,
  relatedLinks = [],
  backgroundClass = 'bg-gradient-to-br from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900',
}: HubLayoutV2Props) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-4 pb-24">
        {/* ───────── Зона 1. Контекстный хедер ───────── */}
        <div className="rounded-3xl border bg-white dark:bg-gray-900 p-4 sm:p-6 mb-4">
          {backPath && (
            <button
              onClick={() => navigate(backPath)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-3 transition-colors"
            >
              <Icon name="ChevronLeft" size={14} />
              Назад
            </button>
          )}

          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon name={icon} size={26} className={iconColor} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {title}
                </h1>
                {modalities.map(m => (
                  <ModalityBadge key={m} modality={m} />
                ))}
              </div>
              {subtitle && (
                <div className="text-[13px] text-gray-500 dark:text-gray-400 mb-1">
                  {subtitle}
                </div>
              )}
              {description && (
                <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-snug">
                  {description}
                </p>
              )}
              {cycleHint && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  <Icon name="RefreshCcw" size={11} />
                  {cycleHint}
                </div>
              )}
            </div>
          </div>

          {/* Quick facts */}
          {quickFacts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {quickFacts.map((fact, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-gray-50 dark:bg-gray-800/50 px-3 py-2"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {fact.icon && (
                      <Icon name={fact.icon} size={11} className="text-gray-400" />
                    )}
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                      {fact.label}
                    </span>
                  </div>
                  <div className="text-[15px] font-bold text-gray-900 dark:text-white truncate">
                    {fact.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Primary actions */}
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-wrap gap-2">
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
                >
                  {primaryAction.icon && <Icon name={primaryAction.icon} size={14} />}
                  {primaryAction.label}
                </button>
              )}
              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-[13px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {secondaryAction.icon && <Icon name={secondaryAction.icon} size={14} />}
                  {secondaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ───────── Зона 2. Что важно сейчас ───────── */}
        {attention.length > 0 && (
          <div className="rounded-2xl border bg-white dark:bg-gray-900 p-4 sm:p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <Icon name="Bell" size={14} className="text-orange-600" />
              </div>
              <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">
                Что важно сейчас
              </h3>
            </div>
            <div className="space-y-2">
              {attention.map(item => (
                <button
                  key={item.id}
                  onClick={item.onAction}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
                >
                  <div className={`w-9 h-9 rounded-xl ${item.iconBg || 'bg-orange-50 dark:bg-orange-950/40'} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={item.icon} fallback="Circle" size={16} className={item.iconColor || 'text-orange-600'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                      {item.title}
                    </div>
                    {item.hint && (
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {item.hint}
                      </div>
                    )}
                  </div>
                  {item.cta && (
                    <span className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:underline">
                      {item.cta}
                    </span>
                  )}
                  <Icon name="ChevronRight" size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ───────── Зона 3. Основные разделы (children) ───────── */}
        <div className="space-y-4">{children}</div>

        {/* ───────── Зона 4. Следующий шаг ───────── */}
        {nextStep && (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <Icon name="ArrowRight" size={16} className="text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-0.5">
                  Следующий шаг
                </div>
                <div className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight">
                  {nextStep.title}
                </div>
                {nextStep.hint && (
                  <div className="text-[12px] text-gray-600 dark:text-gray-400 mt-1">
                    {nextStep.hint}
                  </div>
                )}
              </div>
              {nextStep.onAction && (
                <button
                  onClick={nextStep.onAction}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  {nextStep.cta}
                  <Icon name="ArrowRight" size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ───────── Зона 5. Связанные хабы ───────── */}
        {relatedLinks.length > 0 && (
          <div className="mt-4">
            <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
              Связанные хабы
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedLinks.map((link, i) => (
                <button
                  key={i}
                  onClick={() => navigate(link.path)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-900 text-[12px] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {link.icon && <Icon name={link.icon} size={12} className="text-gray-500" />}
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HubLayoutV2;
