import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { portfolioApi } from '@/services/portfolioApi';
import type { FamilyPortfolioListItem } from '@/types/portfolio.types';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { isAdultMember } from '@/utils/familyRole';
import {
  buildHubSummary,
  formatLastAggregated,
  getMemberCardChips,
  getMemberCardState,
  pluralRu,
  sortMembersForHub,
  type MemberCardState,
} from '@/lib/portfolio/portfolioHubHelpers';

// Portfolio Hub V1 (Sprint A).
//
// Главный экран раздела «Зеркало» — список карточек участников семьи.
// Контракт Sprint A:
//   - 4 явных состояния: loading / error+retry / empty / success
//   - skeleton вместо центрального spinner'а
//   - единый visual-language с Goals Hub (карточки, бейджи, summary)
//   - mobile-first (375px)
//   - НЕ трогаем Member detail, sphere detail, snapshot-цикл
//   - НЕ выносим shared primitives заранее — только по факту нужды

function HubSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-hidden>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-2/3 rounded bg-slate-200 animate-pulse" />
              <div className="h-2.5 w-1/3 rounded bg-slate-100 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface MemberCardProps {
  item: FamilyPortfolioListItem;
  state: MemberCardState;
  onOpen: () => void;
}

function MemberCard({ item, state, onOpen }: MemberCardProps) {
  const initials = item.name?.slice(0, 2).toUpperCase() || '??';
  const chips = getMemberCardChips(item);
  const updated = formatLastAggregated(item.last_aggregated_at);

  // Visual-tone карточки в зависимости от состояния. По договорённости с
  // Goals Hub язык цветов: ready — спокойный тёплый, thin — нейтральный
  // янтарный, empty — серый dashed.
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
        <Icon
          name="ChevronRight"
          size={16}
          className="text-gray-400 shrink-0 group-hover:text-purple-500"
          aria-hidden
        />
      </div>

      {state === 'ready' && (
        <>
          <div className="mb-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                Заполненность
              </span>
              <span className="text-[11px] font-bold text-gray-900">
                {item.completeness}%
              </span>
            </div>
            <Progress value={item.completeness} className="h-1.5" />
          </div>

          {(chips.strengths.length > 0 || chips.growth.length > 0) && (
            <div className="space-y-1.5">
              {chips.strengths.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <Icon
                    name="Star"
                    size={11}
                    className="text-amber-500 mt-[3px] shrink-0"
                    aria-hidden
                  />
                  <div className="flex flex-wrap gap-1">
                    {chips.strengths.map((s) => (
                      <Badge
                        key={s.sphere}
                        variant="secondary"
                        className="text-[10px] bg-amber-100 text-amber-800 border-amber-200/60 hover:bg-amber-100"
                      >
                        {s.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {chips.growth.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <Icon
                    name="TrendingUp"
                    size={11}
                    className="text-blue-500 mt-[3px] shrink-0"
                    aria-hidden
                  />
                  <div className="flex flex-wrap gap-1">
                    {chips.growth.map((s) => (
                      <Badge
                        key={s.sphere}
                        variant="secondary"
                        className="text-[10px] bg-blue-100 text-blue-800 border-blue-200/60 hover:bg-blue-100"
                      >
                        {s.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {updated && (
            <div className="text-[10px] text-gray-400 mt-2.5">обновлено {updated}</div>
          )}
        </>
      )}

      {state === 'thin' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wide text-amber-700 font-semibold">
              Мало данных
            </span>
            <span className="text-[11px] font-bold text-amber-800">
              {item.completeness}%
            </span>
          </div>
          <Progress value={item.completeness} className="h-1.5" />
          <p className="text-[11px] text-amber-700">
            Откройте, чтобы добавить замеры и достижения.
          </p>
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

export default function FamilyPortfolio() {
  const navigate = useNavigate();
  const { familyId, members, currentMemberId } = useFamilyMembersContext();
  const [items, setItems] = useState<FamilyPortfolioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const compareEnabled = useFeatureFlag('portfolio_compare_enabled', false);
  const currentMember = members.find((m) => m.id === currentMemberId) || null;
  const isAdult = isAdultMember(currentMember);
  const showCompare = compareEnabled && isAdult;

  const load = useCallback(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    portfolioApi
      .list(familyId)
      .then((res) => {
        setItems(res.members);
        setError(null);
      })
      .catch((e) => setError((e as Error)?.message || String(e)))
      .finally(() => setLoading(false));
  }, [familyId]);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = sortMembersForHub(items);
  const summary = buildHubSummary(items);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <SEOHead
        title="Портфолио семьи"
        description="Паспорта развития всех членов семьи"
      />
      <div className="container mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        {/* Hero */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-8 px-2 text-gray-600"
            >
              <Icon name="ArrowLeft" size={14} className="mr-1" />
              Назад
            </Button>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0">
              <Icon name="LineChart" size={20} />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Портфолио семьи
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Где я сейчас. Паспорт развития каждого — без рейтингов и сравнений между людьми.
              </p>
            </div>
          </div>

          {!loading && !error && items.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                {summary.total} {pluralRu(summary.total, 'участник', 'участника', 'участников')}
              </span>
              {summary.withPortfolio > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  с активным портфолио: {summary.withPortfolio}
                </span>
              )}
              {summary.thin > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  мало данных: {summary.thin}
                </span>
              )}
              {summary.empty > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  без портфолио: {summary.empty}
                </span>
              )}
            </div>
          )}

          {showCompare && (
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/portfolio/compare')}
                className="h-8"
              >
                <Icon name="LayoutGrid" size={13} className="mr-1.5" />
                Семейный обзор
              </Button>
            </div>
          )}
        </div>

        {/* Body */}
        <div aria-live="polite" aria-busy={loading} className="min-h-[160px]">
          {/* Состояние «нет семьи» — отдельный кейс перед обычными состояниями */}
          {!loading && !familyId && (
            <div className="rounded-2xl border-2 border-dashed border-purple-200 bg-white/70 p-6 text-center">
              <Icon name="Users" size={32} className="mx-auto text-purple-400 mb-2" />
              <div className="text-sm font-semibold text-gray-800 mb-1">
                Сначала создайте семью
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Без семьи нечего складывать в портфолио.
              </p>
              <Button
                size="sm"
                onClick={() => navigate('/family-management')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                Создать семью
              </Button>
            </div>
          )}

          {familyId && loading && <HubSkeleton />}

          {familyId && !loading && error && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-2.5"
            >
              <Icon
                name="AlertCircle"
                size={16}
                className="text-rose-600 mt-0.5 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-rose-800 mb-0.5">
                  Не удалось загрузить портфолио
                </div>
                <div className="text-xs text-rose-700 mb-2 break-words">{error}</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={load}
                  className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-100"
                >
                  <Icon name="RefreshCw" size={12} className="mr-1" />
                  Повторить
                </Button>
              </div>
            </div>
          )}

          {familyId && !loading && !error && items.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-purple-200 bg-white/70 p-6 text-center">
              <Icon name="Users" size={32} className="mx-auto text-purple-400 mb-2" />
              <div className="text-sm font-semibold text-gray-800 mb-1">
                В семье пока нет участников с портфолио
              </div>
              <p className="text-xs text-gray-500">
                Добавьте члена семьи в управлении — карточка появится здесь автоматически.
              </p>
            </div>
          )}

          {familyId && !loading && !error && sorted.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sorted.map((m) => (
                <MemberCard
                  key={m.id}
                  item={m}
                  state={getMemberCardState(m)}
                  onOpen={() => navigate(`/portfolio/${m.id}`)}
                />
              ))}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}