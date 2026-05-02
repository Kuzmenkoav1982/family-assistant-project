import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

const CAMPAIGN_API = 'https://functions.poehali.dev/e6ccd99c-a165-48c7-83cf-946941114931';
const DEFAULT_FAMILY_LOGO = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/90f87bac-e708-4551-b2dc-061dd3d7b0ed.JPG';

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
  const [familyLogo, setFamilyLogo] = useState<string>(() => localStorage.getItem('familyLogo') || DEFAULT_FAMILY_LOGO);
  const [familyName, setFamilyName] = useState<string>(() => localStorage.getItem('familyName') || 'Наша Семья');

  useEffect(() => {
    const sync = () => {
      setFamilyLogo(localStorage.getItem('familyLogo') || DEFAULT_FAMILY_LOGO);
      setFamilyName(localStorage.getItem('familyName') || 'Наша Семья');
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

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

  const placeMedalGradient = (place: number) => {
    if (place === 1) return 'from-amber-300 via-yellow-400 to-amber-500';
    if (place === 2) return 'from-slate-200 via-slate-300 to-slate-400';
    if (place === 3) return 'from-amber-700 via-orange-600 to-amber-800';
    return 'from-slate-100 to-slate-200';
  };

  const placeRowGradient = (place: number) => {
    if (place === 1) return 'bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-50 ring-1 ring-amber-300/60';
    if (place === 2) return 'bg-gradient-to-r from-slate-100 via-slate-50 to-white ring-1 ring-slate-300/60';
    if (place === 3) return 'bg-gradient-to-r from-orange-100 via-amber-50 to-white ring-1 ring-orange-300/60';
    return 'bg-white/70';
  };

  const formatRub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

  // Suppress unused tick var warning while ensuring re-render uses it
  void tick;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 p-[2px] shadow-[0_10px_40px_-8px_rgba(249,115,22,0.35)]">
      <div className="rounded-3xl bg-gradient-to-b from-orange-50/80 via-white to-rose-50/60 backdrop-blur-md overflow-hidden">
        {/* Compact header — always visible, toggles expanded */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-orange-50/60 transition-colors"
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
        {/* Hero banner — Семья Месяца #1 + countdown */}
        <div className="px-4 pt-4 pb-5">
          <div className="rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 ring-1 ring-orange-200/70 shadow-inner p-4">
            <div className="flex items-start gap-4 flex-wrap">
              {/* Left: crown + #place */}
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <div className="relative w-14 h-14 shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-lg" />
                  <div className="absolute inset-0 flex items-center justify-center text-white text-2xl drop-shadow">
                    👑
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-orange-600">
                    Семья месяца
                  </div>
                  <div className="flex items-baseline gap-2 leading-none mt-1">
                    {data.my_position ? (
                      <>
                        <span className="text-5xl font-black bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                          #{data.my_position.place}
                        </span>
                        <span className="text-xs text-slate-500 font-medium leading-tight">
                          из {data.total_families}<br />семей
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-bold text-slate-700">Войди в рейтинг</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: countdown digit cards */}
              {!timer.finished && (
                <div className="flex flex-col items-center gap-2 ml-auto">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    До конца месяца
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TimerCell value={timer.days} label="дн" />
                    <span className="text-amber-500 font-black text-lg">:</span>
                    <TimerCell value={timer.hours} label="ч" />
                    <span className="text-amber-500 font-black text-lg">:</span>
                    <TimerCell value={timer.minutes} label="мин" />
                    <span className="text-amber-500 font-black text-lg">:</span>
                    <TimerCell value={timer.seconds} label="сек" highlight />
                  </div>
                </div>
              )}
            </div>

            {/* Title under hero */}
            {(c.title || c.banner_text) && (
              <div className="mt-3 pt-3 border-t border-orange-200/60">
                <div className="text-sm font-extrabold text-slate-800">{c.title}</div>
                {c.banner_text && (
                  <div className="mt-1 text-xs text-slate-600">{c.banner_text}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* My Status card — with family logo, score, progress bar */}
        <div className="px-4 pb-4">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500 mb-2 px-1">
            Ваш статус
          </div>
          {data.my_position ? (
            <div className="rounded-2xl bg-gradient-to-br from-white via-orange-50/40 to-amber-50/60 ring-1 ring-orange-200/70 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={familyLogo}
                    alt={familyName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-300/70 shadow-md bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_FAMILY_LOGO;
                    }}
                  />
                  {data.my_position.place === 1 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md ring-2 ring-white">
                      <span className="text-xs">👑</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-2xl font-black text-slate-900">#{data.my_position.place}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {Math.round(data.my_position.score)} очков
                    </span>
                    <span className="ml-auto text-xs font-extrabold text-orange-600 tabular-nums">
                      {data.my_position.overall_progress}%
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-orange-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, data.my_position.overall_progress))}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-600 mt-1.5">
                    {data.my_position.place === 1 ? '🎉 Лидируете!' : `до лидера осталось — продолжайте!`}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4 flex items-center gap-3">
              <Icon name="Sparkles" size={20} className="text-orange-500" />
              <div className="text-sm text-slate-600">
                Заполняй разделы — попади в рейтинг
              </div>
            </div>
          )}
        </div>

        {/* Top 5 */}
        {top5.length > 0 && (
          <div className="px-4 pb-4">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500 mb-2 px-1">
              Топ участников
            </div>
            <div className="space-y-2">
              {top5.map((row) => (
                <LeaderRowItem
                  key={row.family_id}
                  row={row}
                  rowGradient={placeRowGradient(row.place)}
                  medalGradient={placeMedalGradient(row.place)}
                />
              ))}

              {/* Show my place if not in top5 */}
              {!myInTop5 && data.my_position && (
                <>
                  <div className="text-center text-slate-400 text-xs leading-3 select-none">···</div>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-100 to-amber-50 ring-1 ring-orange-300/60 shadow-sm">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow">
                      {data.my_position.place}
                    </span>
                    <span className="flex-1 text-sm truncate font-extrabold text-orange-700">
                      Ваша семья <span className="text-[10px] text-orange-500 font-medium">(вы)</span>
                    </span>
                    <span className="text-sm font-black text-orange-700 tabular-nums">
                      {Math.round(data.my_position.score)}
                    </span>
                  </div>
                </>
              )}

              {showAllLeaders && restLeaders.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 mt-2">
                  {restLeaders.map((row) => (
                    <LeaderRowItem
                      key={row.family_id}
                      row={row}
                      rowGradient={placeRowGradient(row.place)}
                      medalGradient={placeMedalGradient(row.place)}
                    />
                  ))}
                </div>
              )}
            </div>

            {data.leaderboard_top.length > 5 && (
              <button
                onClick={() => setShowAllLeaders((v) => !v)}
                className="mt-3 w-full text-xs font-bold text-orange-600 hover:text-orange-700 py-2 rounded-xl hover:bg-orange-50 flex items-center justify-center gap-1 ring-1 ring-orange-200/60"
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
          <div className="px-4 pb-5 pt-1">
            <button
              onClick={() => setShowPrizes((v) => !v)}
              className="w-full flex items-center justify-between gap-2 text-left px-1 mb-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden>🎁</span>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-600">Призовой фонд</span>
                <span className="text-[10px] text-slate-400 font-medium">
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
              <div className="space-y-2">
                {data.prizes.map((p, i) => {
                  const placeLabel =
                    p.place_from === p.place_to
                      ? `${p.place_from} место`
                      : `${p.place_from}–${p.place_to} места`;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 px-3 py-3 rounded-2xl shadow-sm ${placeRowGradient(p.place_from)}`}
                    >
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 shadow-md bg-gradient-to-br ${placeMedalGradient(p.place_from)}`}>
                        {p.place_from === 1 ? '🥇' : p.place_from === 2 ? '🥈' : p.place_from === 3 ? '🥉' : p.place_from}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-extrabold text-slate-800">{placeLabel}</div>
                        {p.description && (
                          <div className="text-xs text-slate-500 truncate">{p.description}</div>
                        )}
                      </div>
                      <div className="text-lg font-black text-orange-600 tabular-nums whitespace-nowrap">
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

function TimerCell({ value, label, highlight }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center min-w-[44px] rounded-xl px-2 py-1.5 shadow-sm ring-1 ${
      highlight
        ? 'bg-gradient-to-br from-amber-100 to-orange-100 ring-orange-300/70'
        : 'bg-white/90 ring-orange-200/60'
    }`}>
      <span className={`text-xl font-black tabular-nums leading-none ${highlight ? 'text-orange-600' : 'text-slate-900'}`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

function LeaderRowItem({
  row,
  rowGradient,
  medalGradient,
}: {
  row: LeaderRow;
  rowGradient: string;
  medalGradient: string;
}) {
  const medalEmoji = row.place === 1 ? '🥇' : row.place === 2 ? '🥈' : row.place === 3 ? '🥉' : null;
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl shadow-sm ${rowGradient} ${
        row.is_me ? 'ring-2 ring-orange-400' : ''
      }`}
    >
      <span
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-md bg-gradient-to-br ${medalGradient} ${
          row.place > 3 ? '!text-slate-600' : ''
        }`}
      >
        {medalEmoji || row.place}
      </span>
      <span
        className={`flex-1 text-sm truncate ${
          row.is_me ? 'font-extrabold text-orange-700' : 'font-semibold text-slate-700'
        }`}
      >
        {row.family_name}
        {row.is_me && (
          <span className="ml-1.5 text-[10px] bg-orange-200 text-orange-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            твоя
          </span>
        )}
      </span>
      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
        {row.members_count} <span aria-hidden>👥</span>
      </span>
      <span
        className={`text-sm font-black w-12 text-right tabular-nums ${
          row.is_me ? 'text-orange-700' : 'text-slate-800'
        }`}
      >
        {Math.round(row.score)}
      </span>
    </div>
  );
}
