import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

const CAMPAIGN_API = 'https://functions.poehali.dev/e6ccd99c-a165-48c7-83cf-946941114931';

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  banner_text?: string | null;
  starts_at: string;
  ends_at: string;
  days_left: number;
  hours_left: number;
  status: string;
}

interface Prize {
  place_from: number;
  place_to: number;
  amount_rub: number;
  prize_type: string;
  description?: string | null;
}

interface LeaderRow {
  place: number;
  family_id: string;
  family_name: string;
  score: number;
  overall_progress: number;
  members_count: number;
  is_me: boolean;
}

interface MyPosition {
  place: number;
  score: number;
  overall_progress: number;
}

interface Overview {
  campaign: Campaign | null;
  prizes: Prize[];
  leaderboard_top: LeaderRow[];
  my_position: MyPosition | null;
  total_families: number;
  weights?: { progress: number; activity: number; engagement: number; referrals: number };
}

// Бэкенд может возвращать поля под разными именами — нормализуем
function normalizeOverview(raw: unknown): Overview | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const campaignRaw = (r.campaign as Record<string, unknown> | null) || null;
  if (!campaignRaw) return null;

  const endsAt = String(campaignRaw.ends_at || '');
  const startsAt = String(campaignRaw.starts_at || '');
  const daysLeft = Number(campaignRaw.days_left ?? 0);
  let hoursLeft = Number(campaignRaw.hours_left ?? 0);
  if (!hoursLeft && campaignRaw.seconds_left != null) {
    hoursLeft = Math.floor(Number(campaignRaw.seconds_left) / 3600);
  }

  const campaign: Campaign = {
    id: String(campaignRaw.id ?? ''),
    slug: String(campaignRaw.slug ?? ''),
    title: String(campaignRaw.title ?? ''),
    description: (campaignRaw.description as string | null) ?? null,
    banner_text: (campaignRaw.banner_text as string | null) ?? null,
    starts_at: startsAt,
    ends_at: endsAt,
    days_left: daysLeft,
    hours_left: hoursLeft,
    status: String(campaignRaw.status ?? 'active'),
  };

  const prizesRaw = Array.isArray(r.prizes) ? (r.prizes as Record<string, unknown>[]) : [];
  const prizes: Prize[] = prizesRaw.map((p) => ({
    place_from: Number(p.place_from ?? 0),
    place_to: Number(p.place_to ?? 0),
    amount_rub: Number(p.amount_rub ?? 0),
    prize_type: String(p.prize_type ?? 'wallet'),
    description: (p.description as string | null) ?? null,
  }));

  const leaderRaw = (r.leaderboard_top || r.leaderboard) as Record<string, unknown>[] | undefined;
  const leaderboard_top: LeaderRow[] = Array.isArray(leaderRaw)
    ? leaderRaw.map((row) => ({
        place: Number(row.place ?? 0),
        family_id: String(row.family_id ?? ''),
        family_name: String(row.family_name ?? 'Семья'),
        score: Number(row.score ?? 0),
        overall_progress: Number(row.overall_progress ?? 0),
        members_count: Number(row.members_count ?? 0),
        is_me: Boolean(row.is_me),
      }))
    : [];

  const myPosRaw = r.my_position as Record<string, unknown> | null | undefined;
  let my_position: MyPosition | null = null;
  if (myPosRaw && typeof myPosRaw === 'object') {
    my_position = {
      place: Number(myPosRaw.place ?? 0),
      score: Number(myPosRaw.score ?? 0),
      overall_progress: Number(myPosRaw.overall_progress ?? 0),
    };
  } else if (r.my_place != null) {
    my_position = {
      place: Number(r.my_place ?? 0),
      score: Number(r.my_score ?? 0),
      overall_progress: 0,
    };
  }

  return {
    campaign,
    prizes,
    leaderboard_top,
    my_position,
    total_families: Number(r.total_families ?? leaderboard_top.length),
  };
}

interface Props {
  userId: string;
}

function formatTimeLeft(endsAt: string): { days: number; hours: number; minutes: number; seconds: number; finished: boolean } {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, finished: diff === 0 };
}

export default function RatingCampaignWidget({ userId }: Props) {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showAllLeaders, setShowAllLeaders] = useState(false);
  const [showPrizes, setShowPrizes] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`${CAMPAIGN_API}?action=overview`, {
      headers: { 'X-User-Id': String(userId) },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: unknown) => {
        if (!cancelled) setData(normalizeOverview(j));
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

  useEffect(() => {
    if (!data?.campaign) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [data?.campaign]);

  if (loading) return null;
  if (!data || !data.campaign) return null;

  const c = data.campaign;
  const timer = formatTimeLeft(c.ends_at);

  const top5 = data.leaderboard_top.slice(0, 5);
  const restLeaders = data.leaderboard_top.slice(5);
  const myInTop5 = top5.some((r) => r.is_me);

  const placeIcon = (place: number) => {
    if (place === 1) return '🥇';
    if (place === 2) return '🥈';
    if (place === 3) return '🥉';
    return null;
  };

  const formatRub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

  // Suppress unused tick var warning while ensuring re-render uses it
  void tick;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-[1.5px] shadow-[0_8px_30px_-6px_rgba(249,115,22,0.4)]">
      <div className="rounded-2xl bg-white/95 backdrop-blur-md overflow-hidden">
        {/* Compact header — always visible, toggles expanded */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-orange-50/40 transition-colors"
          aria-expanded={expanded}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shrink-0">
            <span className="text-xl" aria-hidden>🏆</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Семья месяца
            </div>
            <div className="flex items-baseline gap-1.5 leading-tight">
              {data.my_position ? (
                <>
                  <span className="text-lg font-extrabold text-slate-900">#{data.my_position.place}</span>
                  <span className="text-[11px] text-slate-500 truncate">из {data.total_families} семей</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-slate-700 truncate">Войди в рейтинг</span>
              )}
            </div>
          </div>
          {!timer.finished && (
            <div className="text-right shrink-0 mr-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-orange-500">осталось</div>
              <div className="text-xs font-bold text-slate-700 tabular-nums">
                {timer.days}д {timer.hours}ч
              </div>
            </div>
          )}
          <Icon
            name="ChevronDown"
            size={18}
            className={`text-slate-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {expanded && (
        <>
        {/* Title + banner */}
        <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 px-4 py-3 text-white">
          <div className="text-base font-extrabold leading-tight">{c.title}</div>
          {c.banner_text && (
            <div className="mt-1.5 text-xs font-medium bg-white/20 px-2 py-1 rounded-lg inline-block">
              {c.banner_text}
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="px-4 py-3 bg-gradient-to-b from-orange-50 to-white border-b border-orange-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-1.5">
            До конца акции
          </div>
          {timer.finished ? (
            <div className="text-sm font-bold text-slate-700">Акция завершена</div>
          ) : (
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{timer.days}</span>
                <span className="text-xs text-slate-500">дн</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{timer.hours}</span>
                <span className="text-xs text-slate-500">ч</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{timer.minutes}</span>
                <span className="text-xs text-slate-500">мин</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-orange-600 tabular-nums">{timer.seconds}</span>
                <span className="text-xs text-slate-500">сек</span>
              </div>
            </div>
          )}
        </div>

        {/* My Position */}
        <div className="px-4 py-3">
          {data.my_position ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
                <Icon name="Star" size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Ваше место
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">#{data.my_position.place}</span>
                  <span className="text-xs text-slate-500">из {data.total_families} семей</span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Очки: <span className="font-bold text-orange-600">{Math.round(data.my_position.score)}</span>
                  <span className="text-slate-400 ml-2">· прогресс {data.my_position.overall_progress}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
              <Icon name="Sparkles" size={20} className="text-orange-500" />
              <div className="text-sm text-slate-600">
                Заполняй разделы — попади в рейтинг
              </div>
            </div>
          )}
        </div>

        {/* Top 5 */}
        {top5.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Топ участников
            </div>
            <div className="space-y-1.5">
              {top5.map((row) => (
                <LeaderRowItem key={row.family_id} row={row} placeIcon={placeIcon} />
              ))}

              {/* Show my place if not in top5 */}
              {!myInTop5 && data.my_position && (
                <>
                  <div className="text-center text-slate-400 text-xs leading-3 select-none">···</div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-orange-100/70 ring-1 ring-orange-200">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-orange-200 text-orange-800">
                      {data.my_position.place}
                    </span>
                    <span className="flex-1 text-sm truncate font-bold text-orange-700">
                      Ваша семья <span className="text-[10px] text-orange-500">(вы)</span>
                    </span>
                    <span className="text-sm font-bold text-orange-700">
                      {Math.round(data.my_position.score)}
                    </span>
                  </div>
                </>
              )}

              {showAllLeaders && restLeaders.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 mt-2">
                  {restLeaders.map((row) => (
                    <LeaderRowItem key={row.family_id} row={row} placeIcon={placeIcon} />
                  ))}
                </div>
              )}
            </div>

            {data.leaderboard_top.length > 5 && (
              <button
                onClick={() => setShowAllLeaders((v) => !v)}
                className="mt-3 w-full text-xs font-semibold text-orange-600 hover:text-orange-700 py-1.5 rounded-lg hover:bg-orange-50 flex items-center justify-center gap-1"
              >
                {showAllLeaders ? (
                  <>
                    Свернуть <Icon name="ChevronUp" size={14} />
                  </>
                ) : (
                  <>
                    Посмотреть весь лидерборд ({data.leaderboard_top.length}) <Icon name="ChevronDown" size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Prizes */}
        {data.prizes.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-gradient-to-b from-amber-50/40 to-transparent">
            <button
              onClick={() => setShowPrizes((v) => !v)}
              className="w-full flex items-center justify-between gap-2 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden>
                  🎁
                </span>
                <span className="text-sm font-bold text-slate-800">Призовой фонд</span>
                <span className="text-xs text-slate-500">
                  до {formatRub(Math.max(...data.prizes.map((p) => p.amount_rub)))}
                </span>
              </div>
              <Icon
                name="ChevronDown"
                size={16}
                className={`text-slate-400 transition-transform ${showPrizes ? 'rotate-180' : ''}`}
              />
            </button>
            {showPrizes && (
              <div className="mt-2 space-y-1.5">
                {data.prizes.map((p, i) => {
                  const placeLabel =
                    p.place_from === p.place_to
                      ? `${p.place_from} место`
                      : `${p.place_from}–${p.place_to} места`;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/80 border border-amber-100"
                    >
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {p.place_from}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-700">{placeLabel}</div>
                        {p.description && (
                          <div className="text-[10px] text-slate-500 truncate">{p.description}</div>
                        )}
                      </div>
                      <div className="text-sm font-extrabold text-orange-600 tabular-nums">
                        {formatRub(p.amount_rub)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}

function LeaderRowItem({
  row,
  placeIcon,
}: {
  row: LeaderRow;
  placeIcon: (place: number) => string | null;
}) {
  const icon = placeIcon(row.place);
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
        row.is_me ? 'bg-orange-100/70 ring-1 ring-orange-200' : ''
      }`}
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          row.place === 1
            ? 'bg-amber-100 text-amber-700'
            : row.place === 2
              ? 'bg-slate-200 text-slate-700'
              : row.place === 3
                ? 'bg-orange-100 text-orange-700'
                : 'bg-slate-100 text-slate-500'
        }`}
      >
        {icon || row.place}
      </span>
      <span
        className={`flex-1 text-sm truncate ${
          row.is_me ? 'font-bold text-orange-700' : 'text-slate-700'
        }`}
      >
        {row.family_name}
        {row.is_me && <span className="text-[10px] ml-1 text-orange-500">(вы)</span>}
      </span>
      <span className="text-xs text-slate-400">{row.members_count} 👥</span>
      <span
        className={`text-sm font-bold w-12 text-right tabular-nums ${
          row.is_me ? 'text-orange-700' : 'text-slate-800'
        }`}
      >
        {Math.round(row.score)}
      </span>
    </div>
  );
}