import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

const RATING_API = 'https://functions.poehali.dev/b68c0ded-e66e-40dc-87d7-e089543a79bf';

interface RatingData {
  rank: number | null;
  total: number;
  percentile: number | null;
  overall_progress: number;
  activity_score: number;
  top: Array<{
    family_id: string;
    family_name: string;
    overall_progress: number;
    activity_score: number;
    members_count: number;
    is_me: boolean;
  }>;
}

interface Props {
  userId: string;
}

export default function FamilyRatingWidget({ userId }: Props) {
  const [data, setData] = useState<RatingData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(RATING_API, { headers: { 'X-User-Id': String(userId) } })
      .then((r) => r.json())
      .then((j: RatingData) => {
        if (!cancelled) setData(j);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(168,85,247,0.15)] p-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
        <div className="h-8 bg-slate-200 rounded w-20" />
      </div>
    );
  }

  if (!data || data.total === 0) return null;

  const rank = data.rank;
  const total = data.total;
  const percentile = data.percentile;

  const tierLabel = (() => {
    if (!percentile) return 'Только начали';
    if (percentile >= 90) return 'Элита';
    if (percentile >= 70) return 'Топ-30%';
    if (percentile >= 50) return 'Выше среднего';
    return 'В пути';
  })();

  const tierColor = (() => {
    if (!percentile) return 'from-slate-400 to-slate-500';
    if (percentile >= 90) return 'from-amber-400 via-orange-500 to-pink-500';
    if (percentile >= 70) return 'from-purple-500 via-pink-500 to-rose-500';
    if (percentile >= 50) return 'from-blue-500 via-purple-500 to-pink-500';
    return 'from-slate-400 to-slate-500';
  })();

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(168,85,247,0.15)] overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/40 transition-colors"
      >
        <div
          className={`w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br ${tierColor} flex items-center justify-center shadow-lg`}
        >
          <Icon name="Trophy" size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Рейтинг семей
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md text-white bg-gradient-to-r ${tierColor}`}
            >
              {tierLabel}
            </span>
          </div>
          {rank ? (
            <div className="text-sm text-slate-700">
              <span className="font-extrabold text-lg text-slate-900">#{rank}</span>
              <span className="text-slate-500 ml-1">из {total}</span>
              {percentile !== null && (
                <span className="ml-2 text-xs text-slate-500">
                  лучше {percentile}% семей
                </span>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500">Заполни хабы — попади в рейтинг</div>
          )}
        </div>
        <Icon
          name="ChevronDown"
          size={18}
          className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && data.top.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-3 bg-gradient-to-b from-slate-50/50 to-transparent">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Топ-5 семей платформы
          </div>
          <div className="space-y-1.5">
            {data.top.map((f, i) => (
              <div
                key={f.family_id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                  f.is_me ? 'bg-purple-100/70 ring-1 ring-purple-200' : ''
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0
                      ? 'bg-amber-100 text-amber-700'
                      : i === 1
                        ? 'bg-slate-200 text-slate-700'
                        : i === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`flex-1 text-sm truncate ${
                    f.is_me ? 'font-bold text-purple-700' : 'text-slate-700'
                  }`}
                >
                  {f.family_name}
                  {f.is_me && <span className="text-[10px] ml-1 text-purple-500">(вы)</span>}
                </span>
                <span className="text-xs text-slate-400">{f.members_count} 👥</span>
                <span className="text-sm font-bold text-purple-600 w-10 text-right">
                  {f.overall_progress}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
