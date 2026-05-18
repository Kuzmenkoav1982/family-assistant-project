export const WALLET_API = 'https://functions.poehali.dev/26de1854-01bd-4700-bb2d-6e59cebab238';
export const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';

export interface Transaction {
  id: number;
  type: 'topup' | 'spend';
  amount: number;
  reason: string;
  description: string;
  created_at: string;
  user_name: string | null;
}

export interface SpendByReason {
  reason: string;
  total: number;
}

export interface WalletStats {
  total_topup: number;
  total_spent: number;
  total_transactions: number;
  spend_by_reason: SpendByReason[];
}

export const reasonLabels: Record<string, string> = {
  topup: 'Пополнение',
  manual: 'Вручную',
  ai_diet_plan: 'ИИ-диета',
  ai_photo: 'Фото ИИ',
  ai_recipe: 'Рецепт ИИ',
  ai_recipe_short: 'Рецепт (короткий)',
  ai_greeting: 'Открытка ИИ',
  ai_motivation: 'Мотивация ИИ',
  ai_assistant: 'AI-ассистент',
  ai_finance_advice: 'Финансовый совет',
  ai_trip_recommend: 'Маршрут поездки',
  ai_recommendation: 'Рекомендации досуга',
  ai_leisure_search: 'Поиск мест ИИ',
  ai_development_analysis: 'Анализ развития',
  ai_vet: 'ИИ-ветеринар',
  ai_event_ideas: 'Идеи для события',
  ai_child_assessment: 'Оценка развития ребёнка',
  ai_trip_tips: 'Советы для поездки',
  ai_life_coach: 'Домовой (наставник)',
};

export const reasonIcons: Record<string, string> = {
  topup: 'ArrowUpCircle',
  manual: 'HandCoins',
  ai_diet_plan: 'Brain',
  ai_photo: 'Image',
  ai_recipe: 'ChefHat',
  ai_recipe_short: 'BookOpen',
  ai_greeting: 'Gift',
  ai_motivation: 'Sparkles',
  ai_assistant: 'MessageSquare',
  ai_finance_advice: 'TrendingUp',
  ai_trip_recommend: 'Plane',
  ai_recommendation: 'MapPin',
  ai_leisure_search: 'Search',
  ai_development_analysis: 'Heart',
  ai_vet: 'Stethoscope',
  ai_event_ideas: 'Lightbulb',
  ai_child_assessment: 'Baby',
  ai_trip_tips: 'Compass',
  ai_life_coach: 'Sparkles',
};

export const SERVICE_COSTS = [
  { icon: 'Brain', label: 'Генерация ИИ-диеты', cost: '17 руб' },
  { icon: 'Image', label: 'Фото блюда от ИИ', cost: '7 руб' },
  { icon: 'ChefHat', label: 'Рецепт из продуктов', cost: '5 руб' },
  { icon: 'Gift', label: 'ИИ-открытка', cost: '7 руб' },
  { icon: 'Plane', label: 'Маршрут путешествия ИИ', cost: '5 руб' },
  { icon: 'MapPin', label: 'Рекомендации досуга', cost: '4 руб' },
  { icon: 'Heart', label: 'Анализ развития ребёнка', cost: '4 руб' },
  { icon: 'MessageSquare', label: 'AI-ассистент (запрос)', cost: '3 руб' },
  { icon: 'Sparkles', label: 'Домовой — наставник Мастерской жизни', cost: '3 руб' },
  { icon: 'Stethoscope', label: 'ИИ-ветеринар (запрос)', cost: '3 руб' },
  { icon: 'Lightbulb', label: 'Идеи для события ИИ', cost: '3 руб' },
  { icon: 'TrendingUp', label: 'Финансовый совет ИИ', cost: '3 руб' },
  { icon: 'Baby', label: 'Оценка развития ребёнка', cost: '3 руб' },
  { icon: 'Compass', label: 'Рекомендации для поездки', cost: '3 руб' },
  { icon: 'BookOpen', label: 'Рецепт (короткий)', cost: '2 руб' },
];

const DESCRIPTION_DICT: Array<[RegExp, string]> = [
  [/top.?up|topup|deposit|replenish/i, 'Пополнение'],
  [/withdrawal|withdraw/i, 'Снятие'],
  [/refund/i, 'Возврат'],
  [/ai\s*(assistant|chat|help|request)/i, 'ИИ-ассистент'],
  [/ai\s*photo|image\s*generation/i, 'Генерация фото'],
  [/ai\s*recipe/i, 'ИИ-рецепт'],
  [/diet\s*plan|meal\s*plan/i, 'План питания'],
  [/trip\s*(recommend|tips|route)/i, 'Путешествие ИИ'],
  [/subscription|renewal/i, 'Подписка'],
  [/donation/i, 'Пожертвование'],
  [/recommendation/i, 'Рекомендация'],
];

export const localizeReason = (reason: string, type: 'topup' | 'spend'): string => {
  if (reasonLabels[reason]) return reasonLabels[reason];
  if (!reason) return type === 'topup' ? 'Пополнение' : 'Списание';
  if (reason.startsWith('ai_')) return 'ИИ-сервис';
  return type === 'topup' ? 'Пополнение' : 'Списание';
};

export const localizeDescription = (description: string): string => {
  if (!description) return '';
  if (/[а-яА-ЯёЁ]/.test(description)) return description;
  for (const [pattern, ru] of DESCRIPTION_DICT) {
    if (pattern.test(description)) return ru;
  }
  return description;
};

export const formatWalletDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};
