/**
 * Карта ролей ИИ-ассистента → изображения Домового.
 * Используется в SectionAIAdvisor и в чате Домового.
 *
 * Если у роли нет картинки — компонент использует fallback по умолчанию.
 */

export const DOMOVOY_ROLE_IMAGES: Record<string, string> = {
  cook:               'https://cdn.poehali.dev/files/88b0b0d1-84f6-4848-bf9c-93b9ce940095.jpg',
  mechanic:           'https://cdn.poehali.dev/files/86101a82-5be6-477d-bfe9-a1943e045c43.jpg',
  organizer:          'https://cdn.poehali.dev/files/38c9ca25-9c0f-4895-89e7-07859d1c391c.jpg',
  party:              'https://cdn.poehali.dev/files/bd49f3b3-cca9-4f2e-bab4-31fe256f0309.jpg',
  'child-educator':   'https://cdn.poehali.dev/files/7eebeb54-9d34-41a6-9387-20b7ba454da2.jpg',
  nutritionist:       'https://cdn.poehali.dev/files/7025b47b-a916-4119-afb8-4842d0d35a97.jpg',
  'fitness-trainer':  'https://cdn.poehali.dev/files/c2f1e818-8424-4180-a6f7-ff53974b01d5.jpg',
  'travel-planner':   'https://cdn.poehali.dev/files/a67ca132-38e3-4063-b1c4-2f2d21e6a6b5.jpg',
  vet:                'https://cdn.poehali.dev/files/913b8747-53e9-480f-b315-1e1227911862.jpg',
  psychologist:       'https://cdn.poehali.dev/files/8b102ef8-7799-48fc-98c0-e7f34033f7b9.jpg',
  artist:             'https://cdn.poehali.dev/files/b95d2735-80f4-49e4-8072-7a4d68a35d89.jpg',
  mentor:             'https://cdn.poehali.dev/files/724a6dc3-10f0-44de-ad67-7254220159b4.jpg',
  'financial-advisor':'https://cdn.poehali.dev/files/45d1924a-493d-462d-8daf-fffeef7da6d5.jpg',
  astrologer:         'https://cdn.poehali.dev/files/7e5c4a6c-ab5a-4418-afc3-29c44dddba1c.jpg',
  'family-assistant': 'https://cdn.poehali.dev/files/d404a167-ee74-4fd2-bd0f-edb33a7676a8.jpg',
};

/**
 * Роли, у которых Домовой нарисован во весь рост в широкой рамке (16:9)
 * с большим пустым пространством по бокам. Для них используем object-contain,
 * чтобы было видно фигуру целиком вместе с атрибутами и иконками.
 *
 * Пусто пока — все картинки используют стандартный crop с лёгким zoom.
 */
export const FULL_BODY_ROLES = new Set<string>([]);

// Дефолтная картинка Домового (если роль не указана или не нашлась)
// Семейный помощник — универсальный образ, наиболее «домовой» из всех.
export const DOMOVOY_DEFAULT_IMAGE =
  'https://cdn.poehali.dev/files/d404a167-ee74-4fd2-bd0f-edb33a7676a8.jpg';

export const getDomovoyImageByRole = (role?: string): string => {
  if (!role) return DOMOVOY_DEFAULT_IMAGE;
  return DOMOVOY_ROLE_IMAGES[role] || DOMOVOY_DEFAULT_IMAGE;
};

/**
 * Подбираем мягкий фоновый цвет под аватарку, чтобы object-contain
 * выглядел органично (без белых краёв). Цвет — пастельный тон,
 * близкий к фону соответствующей картинки.
 */
export const ROLE_AVATAR_BG: Record<string, string> = {
  cook:               'bg-stone-100',
  mechanic:           'bg-slate-200',
  organizer:          'bg-stone-50',
  party:              'bg-pink-100',
  'child-educator':   'bg-sky-100',
  nutritionist:       'bg-emerald-100',
  'fitness-trainer':  'bg-blue-100',
  'travel-planner':   'bg-sky-100',
  vet:                'bg-emerald-100',
  psychologist:       'bg-stone-100',
  artist:             'bg-pink-50',
  mentor:             'bg-slate-100',
  'financial-advisor':'bg-amber-50',
  astrologer:         'bg-indigo-100',
  'family-assistant': 'bg-orange-50',
};

export const getRoleAvatarBg = (role?: string): string => {
  if (!role) return 'bg-gray-100';
  return ROLE_AVATAR_BG[role] || 'bg-gray-100';
};

/**
 * Особый zoom для отдельных ролей, у которых фигура нарисована
 * в широкой рамке 16:9 и стандартный zoom даёт слишком мелкого Домового.
 */
const ROLE_IMAGE_ZOOM: Record<string, string> = {
  'family-assistant': 'scale-[1.8] origin-center',
};

/**
 * Возвращает CSS-класс для изображения Домового в аватарке.
 * - FULL_BODY_ROLES → object-contain без zoom (видна вся фигура)
 * - роли с особым zoom → cover + увеличение
 * - остальные → стандартный лёгкий zoom для крупного плана
 */
export const getRoleImageClass = (role?: string): string => {
  if (role && FULL_BODY_ROLES.has(role)) {
    return 'w-full h-full object-contain';
  }
  const customZoom = role ? ROLE_IMAGE_ZOOM[role] : undefined;
  if (customZoom) {
    return `w-full h-full object-cover ${customZoom}`;
  }
  return 'w-full h-full object-cover scale-[1.15] origin-center';
};