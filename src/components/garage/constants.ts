export const EXPENSE_CATEGORIES: Record<string, string> = {
  fuel: '⛽ Топливо', repair: '🔧 Ремонт', insurance: '📋 Страховка',
  tax: '💳 Налог', parking: '🅿️ Парковка', fines: '🚨 Штрафы',
  wash: '🧽 Мойка', tires: '🛞 Шины', other: '📦 Прочее',
};

export const SERVICE_TYPES: Record<string, string> = {
  maintenance: '🔧 ТО', repair: '🛠️ Ремонт', tire_change: '🛞 Замена шин',
  wash: '🧽 Мойка', inspection: '🔍 Диагностика', insurance: '📋 Страховка', other: '📦 Прочее',
};

export const REMINDER_TYPES: Record<string, string> = {
  oil_change: '🛢️ Замена масла', tire_change: '🛞 Замена шин', insurance: '📋 ОСАГО/КАСКО',
  inspection: '🔍 Техосмотр', maintenance: '🔧 Плановое ТО', custom: '📝 Другое',
};

export function fmt(n: number) { return n.toLocaleString('ru-RU') + ' ₽'; }
export function fmtDate(d: string) { return new Date(d).toLocaleDateString('ru-RU'); }
