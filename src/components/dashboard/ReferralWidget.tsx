import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const REFERRALS_API = 'https://functions.poehali.dev/f7e5b7b2-225c-43f5-b399-5b5201594228';

interface ReferralSettings {
  reward_inviter_on_signup: number;
  reward_inviter_on_active: number;
  reward_invitee_welcome: number;
  active_min_members: number;
  active_min_progress: number;
  active_window_days: number;
}

interface Invite {
  id: string;
  status: string;
  signed_up_at?: string | null;
  activated_at?: string | null;
  signup_reward_amount?: number;
  active_reward_amount?: number;
  invitee_family_name?: string | null;
}

interface MyCodeResponse {
  code: string;
  is_active: boolean;
  uses_count: number;
  successful_count: number;
  total_earned_rub: number;
  settings: ReferralSettings;
  invites: Invite[];
}

interface Props {
  userId: string;
}

const NEXT_BONUS_TARGET = 3;

export default function ReferralWidget({ userId }: Props) {
  const { toast } = useToast();
  const [data, setData] = useState<MyCodeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${REFERRALS_API}?action=my_code`, {
      headers: { 'X-User-Id': String(userId) },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: MyCodeResponse | null) => {
        if (!cancelled) setData(j);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-48 rounded-3xl bg-amber-100/60" />
        <div className="h-20 rounded-2xl bg-orange-100/40" />
        <div className="h-32 rounded-2xl bg-rose-100/40" />
      </div>
    );
  }

  if (!data || !data.code) return null;

  const settings: ReferralSettings = data.settings || {
    reward_inviter_on_signup: 500,
    reward_inviter_on_active: 1500,
    reward_invitee_welcome: 300,
    active_min_members: 3,
    active_min_progress: 30,
    active_window_days: 7,
  };

  const invites: Invite[] = Array.isArray(data.invites) ? data.invites : [];
  const refLink = `${window.location.origin}/register?ref=${data.code}`;
  const message = `Привет! 👋\n\nПользуюсь приложением «Наша Семья» — это семейный помощник, который реально помогает наладить здоровье, финансы, питание и развитие детей в одном месте.\n\nРегистрируйся по моему коду ${data.code} — и получишь ${settings.reward_invitee_welcome}₽ приветственного бонуса на семейный кошелёк 💎\n\nСсылка для регистрации: ${refLink}`;

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: label });
    } catch {
      toast({ title: 'Не удалось скопировать', variant: 'destructive' });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Наша Семья — приглашение', text: message, url: refLink });
      } catch { /* silent */ }
    } else {
      copyText(message, 'Сообщение скопировано — вставь в чат другу');
    }
  };


  const visibleInvites = showAll ? invites : invites.slice(0, 5);

  const statusLabel = (inv: Invite) => {
    if (inv.status === 'activated') {
      const total = (inv.signup_reward_amount || 0) + (inv.active_reward_amount || 0);
      return total > 0 ? `+${total}₽` : 'Активирован';
    }
    if (inv.status === 'signed_up') {
      const r = inv.signup_reward_amount || 0;
      return r > 0 ? `+${r}₽` : 'Зарегистрирован';
    }
    if (inv.status === 'fraud') return 'Заблокирован';
    return 'Ожидает';
  };

  const statusText = (status: string) => {
    if (status === 'activated') return 'Активирован';
    if (status === 'signed_up') return 'Зарегистрирован';
    if (status === 'fraud') return 'Заблокирован';
    return 'Ожидает';
  };

  const statusDot = (status: string) => {
    if (status === 'activated') return 'bg-emerald-400';
    if (status === 'signed_up') return 'bg-amber-400';
    if (status === 'fraud') return 'bg-red-400';
    return 'bg-slate-300';
  };

  const progressValue = Math.min(data.uses_count, NEXT_BONUS_TARGET);
  const progressPct = Math.round((progressValue / NEXT_BONUS_TARGET) * 100);
  const toNext = Math.max(0, NEXT_BONUS_TARGET - data.uses_count);

  return (
    <div className="space-y-3">

      {/* Hero block */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 shadow-sm border border-white/60">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-rose-200/30 blur-xl" />
        </div>
        <div className="relative px-5 pt-5 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm flex items-center justify-center shrink-0">
              <span className="text-3xl">🎁</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700/80 mb-0.5">
                Реферальная программа
              </div>
              <div className="text-lg font-extrabold text-slate-800 leading-tight">
                Приглашайте семьи и зарабатывайте бонусы вместе
              </div>
            </div>
          </div>

          {data.total_earned_rub > 0 && (
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Заработано</span>
              <span className="text-3xl font-extrabold text-amber-600 tracking-tight">{data.total_earned_rub}₽</span>
            </div>
          )}

          {data.total_earned_rub === 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200/50 border border-amber-300/40">
              <Icon name="Gift" size={13} className="text-amber-700" />
              <span className="text-xs font-semibold text-amber-800">
                Бонус за друга: {settings.reward_invitee_welcome}₽ + {settings.reward_inviter_on_signup}₽
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Referral code */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-sm border border-white/70 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Личный реферальный код
          </div>
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60">
            <button
              onClick={() => copyText(data.code, 'Код скопирован')}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-2.5 rounded-xl bg-white/80 border border-white/60 shadow-sm hover:shadow active:scale-95 transition-all min-w-[56px]"
            >
              <Icon name="Copy" size={16} className="text-amber-600" />
              <span className="text-[9px] font-semibold text-slate-500">Скопировать</span>
            </button>
            <div className="flex-1 text-center font-mono text-xl font-extrabold text-slate-700 tracking-widest select-all py-1">
              {data.code}
            </div>
            <button
              onClick={shareNative}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-2.5 rounded-xl bg-white/80 border border-white/60 shadow-sm hover:shadow active:scale-95 transition-all min-w-[56px]"
            >
              <Icon name="Share2" size={16} className="text-amber-600" />
              <span className="text-[9px] font-semibold text-slate-500">Поделиться</span>
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="px-4 pt-3 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '👨‍👩‍👧', step: '1', title: 'Пригласите', desc: `Семья: ${settings.reward_inviter_on_signup}₽` },
              { icon: '✅', step: '2', title: 'Активируйте', desc: 'Подтвердите участие' },
              { icon: '💰', step: '3', title: 'Получите', desc: `Вы: +${settings.reward_inviter_on_active}₽` },
            ].map((s) => (
              <div
                key={s.step}
                className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-gradient-to-b from-amber-50/80 to-orange-50/40 border border-amber-100/60"
              >
                <div className="w-10 h-10 rounded-xl bg-white/80 border border-white/60 shadow-sm flex items-center justify-center mb-1.5 text-xl">
                  {s.icon}
                </div>
                <div className="text-[11px] font-bold text-slate-700 leading-tight">{s.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-100/60 p-3 flex flex-col items-center text-center shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-100/80 border border-blue-200/40 flex items-center justify-center mb-2">
            <Icon name="Users" size={16} className="text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-blue-700 tabular-nums leading-none">{data.uses_count}</div>
          <div className="text-[10px] text-blue-500/80 font-medium mt-0.5 uppercase tracking-wide">Приглашено</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/60 border border-orange-100/60 p-3 flex flex-col items-center text-center shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-orange-100/80 border border-orange-200/40 flex items-center justify-center mb-2">
            <Icon name="CheckCircle" size={16} className="text-orange-500" />
          </div>
          <div className="text-xl font-extrabold text-orange-600 tabular-nums leading-none">{data.successful_count}</div>
          <div className="text-[10px] text-orange-500/80 font-medium mt-0.5 uppercase tracking-wide">Активировано</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50/60 border border-rose-100/60 p-3 flex flex-col items-center text-center shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-rose-100/80 border border-rose-200/40 flex items-center justify-center mb-2">
            <Icon name="Wallet" size={16} className="text-rose-500" />
          </div>
          <div className="text-xl font-extrabold text-rose-600 tabular-nums leading-none">{data.total_earned_rub}₽</div>
          <div className="text-[10px] text-rose-500/80 font-medium mt-0.5 uppercase tracking-wide">Заработано</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/70 shadow-sm px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-600">
            {toNext > 0
              ? `Ещё ${toNext} ${toNext === 1 ? 'приглашение' : toNext < 5 ? 'приглашения' : 'приглашений'} до следующего бонуса`
              : 'Бонус за следующих друзей открыт!'}
          </span>
          <span className="text-xs font-bold text-amber-600">{progressValue}/{NEXT_BONUS_TARGET}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Share buttons */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-sm border border-white/70 shadow-sm px-4 py-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Поделиться</div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => copyText(refLink, 'Ссылка скопирована')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 active:scale-95 transition-all"
          >
            <Icon name="Link" size={15} />
            Скопировать ссылку
          </button>
          <button
            onClick={shareNative}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-100 text-amber-700 text-sm font-semibold hover:bg-amber-200 active:scale-95 transition-all"
          >
            <Icon name="Share2" size={15} />
            Ещё
          </button>
        </div>
      </div>

      {/* Invitations history */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-sm border border-white/70 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            История приглашений
          </div>
        </div>
        {invites.length === 0 ? (
          <div className="px-4 pb-4">
            <div className="flex flex-col items-center text-center py-6 px-4 rounded-2xl bg-amber-50/60 border border-amber-100/50">
              <span className="text-3xl mb-2">👨‍👩‍👧‍👦</span>
              <div className="text-sm font-semibold text-slate-600 mb-1">Список ваших приглашений появится здесь</div>
              <div className="text-xs text-slate-400">Делитесь кодом!</div>
            </div>
          </div>
        ) : (
          <div className="px-3 pb-3">
            <div className="space-y-1.5">
              {visibleInvites.map((inv) => {
                const date = inv.activated_at || inv.signed_up_at;
                return (
                  <div
                    key={inv.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                      {(inv.invitee_family_name || 'С').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700 truncate">
                        {inv.invitee_family_name || 'Семья Ивановых'}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot(inv.status)} shrink-0`} />
                        <span className="text-[11px] text-slate-400">{statusText(inv.status)}</span>
                        {date && (
                          <>
                            <span className="text-slate-200">·</span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-emerald-600 shrink-0">
                      {statusLabel(inv)}
                    </div>
                  </div>
                );
              })}
            </div>
            {invites.length > 5 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="mt-2 w-full text-xs font-semibold text-amber-600 hover:text-amber-700 py-2 rounded-xl hover:bg-amber-50 flex items-center justify-center gap-1 transition-colors"
              >
                {showAll ? (
                  <>Свернуть <Icon name="ChevronUp" size={14} /></>
                ) : (
                  <>Показать все ({invites.length}) <Icon name="ChevronDown" size={14} /></>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}