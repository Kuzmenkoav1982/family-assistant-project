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
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) return null;
  if (!data || !data.code) return null;

  const settings = data.settings;
  const refLink = `${window.location.origin}/register?ref=${data.code}`;
  const message = `Привет! Я в семейном помощнике "Наша Семья" — он реально помогает. Регистрируйся по моей ссылке и получи ${settings.reward_invitee_welcome}₽ бонусом: ${refLink}`;

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
        await navigator.share({
          title: 'Наша Семья — приглашение',
          text: message,
          url: refLink,
        });
      } catch {
        // User cancelled or error — silent
      }
    } else {
      copyText(refLink, 'Ссылка скопирована');
    }
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(message)}`,
      '_blank',
    );
  };

  const visibleInvites = showAll ? data.invites : data.invites.slice(0, 5);
  const hasShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const statusLabel = (inv: Invite) => {
    if (inv.status === 'activated') {
      const total = (inv.signup_reward_amount || 0) + (inv.active_reward_amount || 0);
      return total > 0 ? `Активирован — +${total}₽` : 'Активирован';
    }
    if (inv.status === 'signed_up') {
      const r = inv.signup_reward_amount || 0;
      return r > 0 ? `Зарегистрировался — +${r}₽` : 'Зарегистрировался';
    }
    if (inv.status === 'fraud') return 'Заблокирован';
    return 'Ожидает';
  };

  const statusColor = (status: string) => {
    if (status === 'activated') return 'bg-green-100 text-green-700';
    if (status === 'signed_up') return 'bg-blue-100 text-blue-700';
    if (status === 'fraud') return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-[1.5px] shadow-[0_8px_30px_-6px_rgba(168,85,247,0.4)]">
      <div className="rounded-2xl bg-white/95 backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              💎
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                Реферальная программа
              </div>
              <div className="text-base font-extrabold leading-tight">Приглашай — зарабатывай</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 py-3 text-xs text-slate-600 bg-violet-50/40">
          За регистрацию друга — <strong className="text-violet-700">{settings.reward_inviter_on_signup}₽</strong>,
          за активацию (от {settings.active_min_members} членов и {settings.active_min_progress}%+ прогресса) — ещё{' '}
          <strong className="text-fuchsia-700">{settings.reward_inviter_on_active}₽</strong>.
          Друг получит <strong className="text-pink-700">{settings.reward_invitee_welcome}₽</strong> приветственного бонуса.
        </div>

        {/* Code */}
        <div className="px-4 py-3 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Ваш код
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 font-mono text-lg font-extrabold text-violet-700 tracking-wider text-center select-all">
              {data.code}
            </div>
            <button
              onClick={() => copyText(data.code, 'Код скопирован')}
              className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Icon name="Copy" size={14} />
              <span className="hidden sm:inline">Копировать</span>
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="px-4 py-3 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Поделиться
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={openWhatsApp}
              className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl bg-green-500 text-white text-xs font-semibold shadow hover:bg-green-600 active:scale-95 transition-all"
            >
              <Icon name="MessageCircle" size={14} />
              WhatsApp
            </button>
            <button
              onClick={openTelegram}
              className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-semibold shadow hover:bg-sky-600 active:scale-95 transition-all"
            >
              <Icon name="Send" size={14} />
              Telegram
            </button>
            <button
              onClick={() => copyText(refLink, 'Ссылка скопирована')}
              className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 active:scale-95 transition-all"
            >
              <Icon name="Link" size={14} />
              Ссылка
            </button>
            {hasShare ? (
              <button
                onClick={shareNative}
                className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-semibold shadow hover:shadow-lg active:scale-95 transition-all"
              >
                <Icon name="Share2" size={14} />
                Ещё
              </button>
            ) : (
              <button
                onClick={() => copyText(message, 'Сообщение скопировано')}
                className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Icon name="ClipboardCopy" size={14} />
                Текст
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 border-t border-slate-100 bg-gradient-to-b from-fuchsia-50/40 to-transparent">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-lg font-extrabold text-violet-700 tabular-nums">{data.uses_count}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Использовали</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-extrabold text-fuchsia-700 tabular-nums">{data.successful_count}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Активировали</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-extrabold text-pink-700 tabular-nums">{data.total_earned_rub}₽</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Заработано</div>
            </div>
          </div>
        </div>

        {/* Invites list */}
        <div className="px-4 py-3 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Приглашения
          </div>
          {data.invites.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-violet-50/60 rounded-xl text-sm text-slate-600">
              <Icon name="UserPlus" size={18} className="text-violet-500" />
              Пока никого не пригласили. Поделитесь ссылкой!
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                {visibleInvites.map((inv) => {
                  const date = inv.activated_at || inv.signed_up_at;
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-50"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(inv.invitee_family_name || 'А').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-700 truncate">
                          {inv.invitee_family_name || 'Анонимная семья'}
                        </div>
                        {date && (
                          <div className="text-[10px] text-slate-400">
                            {new Date(date).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap ${statusColor(
                          inv.status,
                        )}`}
                      >
                        {statusLabel(inv)}
                      </span>
                    </div>
                  );
                })}
              </div>
              {data.invites.length > 5 && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="mt-2 w-full text-xs font-semibold text-violet-600 hover:text-violet-700 py-1.5 rounded-lg hover:bg-violet-50 flex items-center justify-center gap-1"
                >
                  {showAll ? (
                    <>
                      Свернуть <Icon name="ChevronUp" size={14} />
                    </>
                  ) : (
                    <>
                      Показать все ({data.invites.length}) <Icon name="ChevronDown" size={14} />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
