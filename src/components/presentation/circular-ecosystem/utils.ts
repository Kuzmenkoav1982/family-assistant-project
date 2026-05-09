import { MODULES, type ModuleDetail, type ModuleStatus } from '../moduleData';

// Светофор: насыщенные градиенты + лёгкая прозрачность = сочный 3D-эффект
export const STATUS_FILL: Record<
  ModuleStatus,
  { gradId: string; hoverGradId: string; stroke: string; text: string }
> = {
  live: { gradId: 'ecoLive', hoverGradId: 'ecoLiveH', stroke: '#047857', text: '#ffffff' },
  dev: { gradId: 'ecoDev', hoverGradId: 'ecoDevH', stroke: '#b45309', text: '#3a1d03' },
  planned: { gradId: 'ecoPlanned', hoverGradId: 'ecoPlannedH', stroke: '#b91c1c', text: '#ffffff' },
};

export const innerIds = [
  'family-tree',
  'calendar',
  'tasks',
  'budget',
  'chat',
  'children',
  'health',
  'documents',
  'places',
  'shopping',
  'memories',
  'ai-assistant',
];

export const outerIds = [
  'support-navigator',
  'large-family',
  'pregnancy',
  'case-manager',
  'svo-family',
  'student-family',
  'social-contract',
  'zog',
  'nannies',
  'rental',
  'after-school',
  'mediation',
  'tourism',
  'b2b2c',
  'region-api',
  'compatriots',
];

// Размер viewBox: широкий, с местом под подписи слоёв слева/справа
export const VB_W = 1080;
export const VB_H = 820;
export const CX = VB_W / 2;
export const CY = VB_H / 2;
export const CENTER_R = 70;
export const INNER_OUTER_R = 175;
export const OUTER_OUTER_R = 305;

// Цвета слоёв — для обводки кольца и подписей
export const LAYER_FAMILY = '#059669';
export const LAYER_STRATEGY = '#b91c1c';

export interface SegmentDef {
  module: ModuleDetail;
  d: string;
  iconX: number;
  iconY: number;
  textX: number;
  textY: number;
  deg: number;
}

export function buildRing(
  ids: string[],
  rIn: number,
  rOut: number,
  iconRadius: number,
  textRadius: number,
): SegmentDef[] {
  const total = ids.length;
  const gap = 0.012;

  return ids.map((id, i) => {
    const startAngle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;

    const x1 = CX + rOut * Math.cos(startAngle + gap);
    const y1 = CY + rOut * Math.sin(startAngle + gap);
    const x2 = CX + rOut * Math.cos(endAngle - gap);
    const y2 = CY + rOut * Math.sin(endAngle - gap);
    const x3 = CX + rIn * Math.cos(endAngle - gap);
    const y3 = CY + rIn * Math.sin(endAngle - gap);
    const x4 = CX + rIn * Math.cos(startAngle + gap);
    const y4 = CY + rIn * Math.sin(startAngle + gap);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    const midAngle = (startAngle + endAngle) / 2;
    const iconX = CX + iconRadius * Math.cos(midAngle);
    const iconY = CY + iconRadius * Math.sin(midAngle);
    const textX = CX + textRadius * Math.cos(midAngle);
    const textY = CY + textRadius * Math.sin(midAngle);

    let deg = (midAngle * 180) / Math.PI + 90;
    if (deg > 90 && deg < 270) {
      deg += 180;
    }

    const module = MODULES[id];
    return { module, d, iconX, iconY, textX, textY, deg };
  });
}

// Разбиваем название на до 4 строк. Слова стараемся не резать —
// допускаем небольшое превышение maxLen, чтобы не отрывать одну букву.
export function wrapName(name: string, maxLen: number): string[] {
  const MAX_LINES = 4;
  // Допустимое превышение длины строки (чтобы слова не разрывались)
  const HARD_LIMIT = maxLen + 4;

  // Сначала разбиваем по пробелам
  const words = name.split(' ');
  const tokens: string[] = [];
  for (const w of words) {
    if (w.length <= HARD_LIMIT) {
      tokens.push(w);
      continue;
    }
    // Если слово очень длинное и содержит дефис — режем по дефису, дефис остаётся в первой части
    if (w.includes('-')) {
      const parts = w.split('-');
      let acc = '';
      for (let i = 0; i < parts.length; i++) {
        const piece = parts[i] + (i < parts.length - 1 ? '-' : '');
        if ((acc + piece).length <= HARD_LIMIT) {
          acc += piece;
        } else {
          if (acc) tokens.push(acc);
          acc = piece;
        }
      }
      if (acc) tokens.push(acc);
    } else {
      // Иначе режем грубо по символам
      for (let i = 0; i < w.length; i += maxLen) tokens.push(w.slice(i, i + maxLen));
    }
  }
  const lines: string[] = [];
  let cur = '';
  for (const t of tokens) {
    if (!cur) cur = t;
    else if ((cur + ' ' + t).length <= maxLen) cur += ' ' + t;
    else {
      lines.push(cur);
      cur = t;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > MAX_LINES) {
    const last = lines.slice(MAX_LINES - 1).join(' ');
    lines.length = MAX_LINES - 1;
    lines.push(last.length > maxLen ? last.slice(0, maxLen - 1) + '…' : last);
  }
  return lines;
}
