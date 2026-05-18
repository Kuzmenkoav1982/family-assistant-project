import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import {
  formatLastAggregated,
  getMemberCardChips,
  getMemberCardState,
  pluralRu,
  type MemberCardState,
} from '@/lib/portfolio/portfolioHubHelpers';
import type { FamilyPortfolioListItem } from '@/types/portfolio.types';

interface PortfolioMemberCardProps {
  item: FamilyPortfolioListItem;
  state: MemberCardState;
  onOpen: () => void;
}

export default function PortfolioMemberCard({ item, state, onOpen }: PortfolioMemberCardProps) {
  const initials = item.name?.slice(0, 2).toUpperCase() || '??';
  const chips = getMemberCardChips(item);
  const updated = formatLastAggregated(item.last_aggregated_at);

  const tone =
    state === 'ready'
      ? 'border-white/60 hover:border-purple-200 bg-white/80'
      : state === 'thin'
        ? 'border-amber-200/80 hover:border-amber-300 bg-amber-50/40'
        : 'border-dashed border-slate-300 bg-white/60';

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group text-left rounded-2xl border ${tone} p-4 shadow-sm hover:shadow-md transition-all`}
      aria-label={`Открыть портфолио: ${item.name}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-12 h-12 border-2 border-white shadow-sm shrink-0">
          <AvatarImage src={item.photo_url || undefined} alt={item.name} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-900 truncate group-hover:text-purple-800">
            {item.name}
          </div>
          <div className="text-[11px] text-gray-500 truncate">
            {item.role}
            {item.age !== null ? ` · ${item.age} ${pluralRu(item.age, 'год', 'года', 'лет')}` : ''}
          </div>
        </div>
        <Icon name="ChevronRight" size={16} className="text-gray-400 shrink-0 group-hover:text-purple-500" aria-hidden />
      </div>

      {state === 'ready' && (
        <>
          <div className="mb-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Заполненность</span>
              <span className="text-[11px] font-bold text-gray-900">{item.completeness}%</span>
            </div>
            <Progress value={item.completeness} className="h-1.5" />
          </div>
          {(chips.strengths.length > 0 || chips.growth.length > 0) && (
            <div className="space-y-1.5">
              {chips.strengths.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <Icon name="Star" size={11} className="text-amber-500 mt-[3px] shrink-0" aria-hidden />
                  <div className="flex flex-wrap gap-1">
                    {chips.strengths.map((s) => (
                      <Badge key={s.sphere} variant="secondary" className="text-[10px] bg-amber-100 text-amber-800 border-amber-200/60 hover:bg-amber-100">
                        {s.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {chips.growth.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <Icon name="TrendingUp" size={11} className="text-blue-500 mt-[3px] shrink-0" aria-hidden />
                  <div className="flex flex-wrap gap-1">
                    {chips.growth.map((s) => (
                      <Badge key={s.sphere} variant="secondary" className="text-[10px] bg-blue-100 text-blue-800 border-blue-200/60 hover:bg-blue-100">
                        {s.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {updated && <div className="text-[10px] text-gray-400 mt-2.5">обновлено {updated}</div>}
        </>
      )}

      {state === 'thin' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wide text-amber-700 font-semibold">Мало данных</span>
            <span className="text-[11px] font-bold text-amber-800">{item.completeness}%</span>
          </div>
          <Progress value={item.completeness} className="h-1.5" />
          <p className="text-[11px] text-amber-700">Откройте, чтобы добавить замеры и достижения.</p>
        </div>
      )}

      {state === 'empty' && (
        <div className="flex items-center gap-2 text-[11px] text-gray-600">
          <Icon name="Sparkles" size={14} className="text-purple-500" aria-hidden />
          Откройте, чтобы создать портфолио
        </div>
      )}
    </button>
  );
}
