import type { PortfolioData } from '@/types/portfolio.types';

export function buildPortfolioChatMessage(data: PortfolioData, baseUrl: string = ''): string {
  const lines: string[] = [];
  const name = data.member?.name || 'Участник';
  lines.push(`📊 Паспорт развития: ${name}`);

  if (data.member?.age) lines.push(`👤 ${data.member.age} лет`);
  lines.push(`✅ Заполненность: ${data.completeness}%`);
  lines.push('');

  if (data.strengths?.length) {
    lines.push('⭐ Сильные стороны:');
    data.strengths.slice(0, 3).forEach((s) => {
      lines.push(`  • ${s.label} — ${Math.round(s.score)}/100`);
    });
    lines.push('');
  }

  if (data.growth_zones?.length) {
    lines.push('🎯 Точки внимания:');
    data.growth_zones.slice(0, 2).forEach((g) => {
      lines.push(`  • ${g.label} — ${Math.round(g.score)}/100`);
    });
    lines.push('');
  }

  const topAction = data.next_actions?.[0];
  if (topAction?.action) {
    lines.push(`👉 Следующий шаг: ${topAction.action}`);
    lines.push('');
  }

  const url = `${baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')}/portfolio/${data.member.id}`;
  lines.push(`🔗 ${url}`);

  return lines.join('\n');
}
