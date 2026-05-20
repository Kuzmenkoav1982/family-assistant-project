// Status Banner — domain types (B1).
//
// Контракты используются:
//   - resolveActiveBanner.ts          (pure resolver)
//   - GlobalStatusBanner.tsx          (UI consumer)
//   - admin pages / backend payloads  (CRUD)
//   - smoke tests                     (fixtures + assertions)
//
// Источник истины — таблица public.status_banners (миграция V0309).
// Поля camelCase в TS — преобразование snake_case ↔ camelCase делает backend.

// ---------- enums ----------

export const BANNER_TYPES = [
  'info',
  'maintenance',
  'warning',
  'critical',
  'update',
] as const;
export type BannerType = (typeof BANNER_TYPES)[number];

export const BANNER_AUDIENCES = [
  'public',
  'authenticated',
  'admin',
] as const;
export type BannerAudience = (typeof BANNER_AUDIENCES)[number];

export const BANNER_SEGMENTS = ['registered_last_7d'] as const;
export type BannerSegment = (typeof BANNER_SEGMENTS)[number] | null;

// ---------- entity ----------

/**
 * Полная запись из БД (то, что возвращает GET /admin-status-banner).
 * Все даты — ISO-8601 строки (бэк сериализует TIMESTAMPTZ → ISO).
 */
export interface StatusBanner {
  id: string;
  type: BannerType;
  title: string;
  message: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  enabled: boolean;
  dismissible: boolean;
  startsAt: string | null;
  endsAt: string | null;
  audience: BannerAudience;
  segment: BannerSegment;
  /** Пустой массив = global. Иначе массив URL-префиксов, например ["/portfolio"]. */
  routeScope: string[];
  priority: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  unpublishedAt: string | null;
}

/**
 * Что админка отправляет в backend на create/update (B3).
 * Поля createdBy/updatedBy/publishedAt бэк проставляет сам.
 */
export interface StatusBannerDraft {
  id?: string;
  type: BannerType;
  title: string;
  message: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  enabled?: boolean;
  dismissible?: boolean | null; // null = «применить дефолт по типу»
  startsAt?: string | null;
  endsAt?: string | null;
  audience?: BannerAudience;
  segment?: BannerSegment;
  routeScope?: string[];
  priority?: number;
}

// ---------- resolution ----------

export type ViewerKind = 'public' | 'authenticated' | 'admin';

export interface ResolveContext {
  /** Текущее время. По умолчанию — Date.now(). Параметризовано для тестов. */
  now?: Date | number;
  /** Текущий URL-путь, например '/portfolio/abc/sphere/intellect'. */
  pathname: string;
  /** Кто смотрит. Для public/anon → 'public'. */
  viewer: ViewerKind;
  /** Список id баннеров, которые пользователь локально dismiss-нул. */
  dismissedIds?: ReadonlyArray<string>;
}

/**
 * Что resolver отдаёт UI. null → не показывать.
 * Сам объект баннера + почему именно он выбран (для smoke/debug overlay).
 */
export interface ResolvedBanner {
  banner: StatusBanner;
  /** Эффективное значение dismissible после применения правила по type. */
  effectiveDismissible: boolean;
  reason: 'selected';
}

/** Причина, по которой кандидат отброшен (для debug). */
export type RejectReason =
  | 'invalid'
  | 'disabled'
  | 'not-started'
  | 'expired'
  | 'audience-mismatch'
  | 'route-mismatch'
  | 'locally-dismissed';

export interface RejectedCandidate {
  id: string;
  reason: RejectReason;
}

export interface ResolveResult {
  active: ResolvedBanner | null;
  rejected: RejectedCandidate[];
}

// ---------- defaults ----------

/**
 * Рекомендуемые дефолты priority по типу — применяются админкой
 * при создании баннера, если админ не задал явно.
 */
export const DEFAULT_PRIORITY_BY_TYPE: Record<BannerType, number> = {
  critical: 100,
  warning: 50,
  maintenance: 30,
  update: 20,
  info: 10,
};

/**
 * Дефолт dismissible по типу. critical по умолчанию НЕ закрывается без явного
 * решения админа. Применяется в resolver-е, если dismissible === null/undefined.
 */
export const DEFAULT_DISMISSIBLE_BY_TYPE: Record<BannerType, boolean> = {
  critical: false,
  warning: true,
  maintenance: true,
  update: true,
  info: true,
};