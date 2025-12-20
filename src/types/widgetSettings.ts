/**
 * Настройки отображения виджета члена семьи
 */
export interface MemberWidgetSettings {
  showAge: boolean;
  showRole: boolean;
  showWorkload: boolean;
  showActiveTasks: boolean;
  showCompletedToday: boolean;
  showResponsibilities: boolean;
  showTodayEvents: boolean;
  showWeekAchievements: boolean;
  showQuickActions: boolean;
  widgetSize: 'compact' | 'normal' | 'detailed';
}

/**
 * Дефолтные настройки виджета
 */
export const DEFAULT_WIDGET_SETTINGS: MemberWidgetSettings = {
  showAge: false,
  showRole: false,
  showWorkload: true,
  showActiveTasks: true,
  showCompletedToday: true,
  showResponsibilities: false,
  showTodayEvents: true,
  showWeekAchievements: true,
  showQuickActions: true,
  widgetSize: 'normal'
};

/**
 * Пресеты настроек виджета
 */
export const WIDGET_PRESETS: Record<string, MemberWidgetSettings> = {
  minimalist: {
    showAge: false,
    showRole: false,
    showWorkload: true,
    showActiveTasks: true,
    showCompletedToday: false,
    showResponsibilities: false,
    showTodayEvents: false,
    showWeekAchievements: false,
    showQuickActions: false,
    widgetSize: 'compact'
  },
  detailed: {
    showAge: true,
    showRole: true,
    showWorkload: true,
    showActiveTasks: true,
    showCompletedToday: true,
    showResponsibilities: true,
    showTodayEvents: true,
    showWeekAchievements: true,
    showQuickActions: true,
    widgetSize: 'detailed'
  },
  standard: DEFAULT_WIDGET_SETTINGS
};

/**
 * Сохранение настроек виджета в localStorage
 */
export function saveWidgetSettings(settings: MemberWidgetSettings): void {
  localStorage.setItem('memberWidgetSettings', JSON.stringify(settings));
}

/**
 * Загрузка настроек виджета из localStorage
 */
export function loadWidgetSettings(): MemberWidgetSettings {
  const saved = localStorage.getItem('memberWidgetSettings');
  if (saved) {
    try {
      return { ...DEFAULT_WIDGET_SETTINGS, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_WIDGET_SETTINGS;
    }
  }
  return DEFAULT_WIDGET_SETTINGS;
}
