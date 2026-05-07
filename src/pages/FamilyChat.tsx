import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import SEOHead from '@/components/SEOHead';
import SectionHero from '@/components/ui/section-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

const API = (func2url as Record<string, string>)['family-chat'];

const HERO_IMAGE =
  'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/8e1ea98d-74bd-4232-979e-22fbb47b21db.jpg';

const QUICK_REACTIONS = ['❤️', '👍', '😂', '🎉', '🙏', '🔥'];
const EMOJI_LIST = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇',
  '🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚',
  '😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩',
  '🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣',
  '😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬',
  '❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💔',
  '💕','💞','💓','💗','💖','💘','💝','💟','♥️','💋',
  '👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉',
  '👆','🖕','👇','☝️','👋','🤚','🖐️','✋','🖖','👏',
  '🙌','🤝','🙏','✍️','💪','🦾','🦵','🦿','🦶','👂',
  '🎉','🎊','🎁','🎂','🎈','🎀','🎄','🎃','🎆','🎇',
  '🌟','⭐','✨','💫','🔥','💥','💯','💢','💦','💨',
  '🍕','🍔','🍟','🌭','🥪','🌮','🌯','🥗','🍿','🍰',
  '🍎','🍊','🍋','🍉','🍇','🍓','🍒','🍑','🥝','🍍',
  '⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸',
  '🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐',
  '☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','❄️',
];

const FALLBACK_COLORS = [
  'from-pink-500 to-rose-500',
  'from-blue-500 to-sky-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-fuchsia-500 to-pink-500',
];

function colorFor(idx: number): string {
  return FALLBACK_COLORS[Math.abs(idx) % FALLBACK_COLORS.length];
}

interface ChatMsg {
  id: string;
  conversation_id: string;
  sender_member_id: string;
  sender_name?: string;
  sender_photo?: string | null;
  sender_avatar?: string | null;
  content: string;
  reactions: Record<string, number>;
  created_at: string;
}

interface ChatItem {
  id: string;
  kind: 'family' | 'dm';
  title: string;
  subtitle: string;
  member_id: string | null;
  photo_url: string | null;
  avatar: string | null;
  unread: number;
}

interface MeInfo {
  member_id: string;
  name: string;
  photo_url: string | null;
  avatar: string | null;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((today - msgDay) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
}

const POLL_INTERVAL_MS = 3000;

export default function FamilyChat() {
  const [me, setMe] = useState<MeInfo | null>(null);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState('');
  const [reactionFor, setReactionFor] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const emojiBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastTsRef = useRef<string | null>(null);
  const activeChatRef = useRef<string | null>(null);

  const getToken = () => localStorage.getItem('authToken') || '';

  const apiGet = useCallback(async (qs: string) => {
    const token = getToken();
    if (!token) throw new Error('Требуется вход');
    const res = await fetch(`${API}?${qs}`, { headers: { 'X-Auth-Token': token } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
    return data;
  }, []);

  const apiPost = useCallback(async (body: Record<string, unknown>) => {
    const token = getToken();
    if (!token) throw new Error('Требуется вход');
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
    return data;
  }, []);

  // Загрузка списка чатов
  const loadChats = useCallback(async () => {
    try {
      const data = await apiGet('action=list');
      setMe(data.me);
      setChats(data.chats || []);
      if (!activeChatRef.current && data.chats?.length) {
        const familyChat = data.chats.find((c: ChatItem) => c.kind === 'family') || data.chats[0];
        activeChatRef.current = familyChat.id;
        setActiveChatId(familyChat.id);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить чаты');
    } finally {
      setLoading(false);
    }
  }, [apiGet]);

  // Загрузка сообщений конкретного чата (полная)
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await apiGet(`action=messages&conversation_id=${encodeURIComponent(conversationId)}`);
      const msgs: ChatMsg[] = data.messages || [];
      setMessages(msgs);
      lastTsRef.current = msgs.length ? msgs[msgs.length - 1].created_at : null;
      // Отметить как прочитанные
      apiPost({ action: 'mark_read', conversation_id: conversationId }).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить сообщения');
    }
  }, [apiGet, apiPost]);

  // Опрос новых сообщений (polling)
  const pollNew = useCallback(async () => {
    const convId = activeChatRef.current;
    if (!convId) return;
    try {
      const after = lastTsRef.current;
      const qs = after
        ? `action=messages&conversation_id=${encodeURIComponent(convId)}&after=${encodeURIComponent(after)}`
        : `action=messages&conversation_id=${encodeURIComponent(convId)}`;
      const data = await apiGet(qs);
      const newMsgs: ChatMsg[] = data.messages || [];
      if (newMsgs.length > 0) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const merged = [...prev];
          for (const m of newMsgs) {
            if (!ids.has(m.id)) merged.push(m);
          }
          return merged;
        });
        lastTsRef.current = newMsgs[newMsgs.length - 1].created_at;
        // Отметить прочитанным (мы открыли чат)
        apiPost({ action: 'mark_read', conversation_id: convId }).catch(() => {});
      }
    } catch {
      /* polling silent fail */
    }
  }, [apiGet, apiPost]);

  // Первая загрузка
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // При смене активного чата — загрузить сообщения
  useEffect(() => {
    if (!activeChatId) return;
    activeChatRef.current = activeChatId;
    setMessages([]);
    lastTsRef.current = null;
    setReactionFor(null);
    setShowEmoji(false);
    loadMessages(activeChatId);
  }, [activeChatId, loadMessages]);

  // Polling новых сообщений
  useEffect(() => {
    if (!activeChatId) return;
    const id = setInterval(pollNew, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [activeChatId, pollNew]);

  // Обновление списка чатов с непрочитанными — каждые 15 сек
  useEffect(() => {
    const id = setInterval(() => {
      apiGet('action=list').then((data) => {
        setChats(data.chats || []);
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [apiGet]);

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, activeChatId]);

  // Закрытие эмодзи-пикера по клику вне
  useEffect(() => {
    if (!showEmoji) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (emojiBtnRef.current && emojiBtnRef.current.contains(target)) return;
      const picker = document.getElementById('chat-emoji-picker');
      if (picker && picker.contains(target)) return;
      setShowEmoji(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showEmoji]);

  const grouped = useMemo(() => {
    const result: { dateLabel: string; items: ChatMsg[] }[] = [];
    for (const m of messages) {
      const label = formatDateLabel(m.created_at);
      const last = result[result.length - 1];
      if (!last || last.dateLabel !== label) {
        result.push({ dateLabel: label, items: [m] });
      } else {
        last.items.push(m);
      }
    }
    return result;
  }, [messages]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !activeChatId || !me) return;
    setDraft('');
    setShowEmoji(false);
    try {
      const data = await apiPost({ action: 'send', conversation_id: activeChatId, content: text });
      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        lastTsRef.current = data.message.created_at;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось отправить');
      setDraft(text);
    }
  };

  const addReaction = async (msgId: string, emoji: string) => {
    if (!activeChatId) return;
    setReactionFor(null);
    try {
      const data = await apiPost({
        action: 'react',
        conversation_id: activeChatId,
        message_id: msgId,
        emoji,
      });
      if (data.reactions) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, reactions: data.reactions } : m))
        );
      }
    } catch {
      /* noop */
    }
  };

  const insertEmoji = (e: string) => {
    setDraft((d) => d + e);
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  const renderAvatar = (
    photoUrl: string | null | undefined,
    emoji: string | null | undefined,
    color: string,
    sizeClass: string,
    textSize: string,
    fallbackInitial?: string,
  ) => {
    if (photoUrl) {
      return (
        <img
          src={photoUrl}
          alt=""
          className={`${sizeClass} rounded-full object-cover shadow-sm ring-2 ring-white`}
        />
      );
    }
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br ${color} flex items-center justify-center ${textSize} text-white font-semibold shadow-sm ring-2 ring-white`}
      >
        {emoji || fallbackInitial || '👤'}
      </div>
    );
  };

  return (
    <>
      <SEOHead
        title="Чат семьи — Наша Семья"
        description="Закрытый семейный чат: общий чат и тет-а-тет с каждым членом семьи. Реальное время, без рекламы, данные хранятся в РФ."
      />

      <SectionHero
        title="Чат семьи"
        subtitle="Закрытый чат для своих — без рекламы, данные хранятся в РФ"
        imageUrl={HERO_IMAGE}
      />

      <div className="px-3 sm:px-4 pt-2 pb-24 max-w-3xl mx-auto">
        {error && (
          <Card className="mb-3 border-red-200 bg-red-50">
            <CardContent className="p-3 text-sm text-red-700 flex items-center gap-2">
              <Icon name="AlertCircle" size={16} />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2 text-purple-500" />
              Загрузка чата…
            </CardContent>
          </Card>
        ) : !me ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Icon name="UserX" size={32} className="mx-auto mb-2 text-gray-400" />
              Чат доступен только участникам семьи. Войдите в свой аккаунт.
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Переключатель чатов */}
            <Card className="mb-3 border-purple-100">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="MessagesSquare" size={16} className="text-purple-600" />
                    <span className="text-sm font-semibold text-gray-800">Чаты</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {chats.length}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    в сети
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {chats.map((c, idx) => {
                    const isActive = c.id === activeChatId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveChatId(c.id)}
                        className={`relative flex flex-col items-center gap-1 min-w-[64px] p-1.5 rounded-lg transition ${
                          isActive ? 'bg-purple-100 ring-1 ring-purple-300' : 'hover:bg-gray-50'
                        }`}
                        title={c.title}
                      >
                        {c.kind === 'family' ? (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-sm ring-2 ring-white">
                            👨‍👩‍👧‍👦
                          </div>
                        ) : (
                          renderAvatar(
                            c.photo_url,
                            c.avatar,
                            colorFor(idx),
                            'w-11 h-11',
                            'text-base',
                            c.title.charAt(0).toUpperCase()
                          )
                        )}
                        {c.unread > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                            {c.unread > 99 ? '99+' : c.unread}
                          </span>
                        )}
                        <span className={`text-[10px] truncate max-w-[64px] ${isActive ? 'text-purple-700 font-semibold' : 'text-gray-700'}`}>
                          {c.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Лента сообщений */}
            <Card className="mb-3">
              <CardContent className="p-0">
                <div className="px-3 py-2 border-b border-gray-100 bg-white flex items-center gap-2">
                  <Icon
                    name={activeChat?.kind === 'family' ? 'Users' : 'User'}
                    size={14}
                    className="text-purple-600"
                  />
                  <span className="text-xs font-semibold text-gray-700">{activeChat?.title}</span>
                  <span className="text-[11px] text-gray-400">· {activeChat?.subtitle}</span>
                </div>
                <div
                  ref={scrollRef}
                  className="max-h-[58vh] overflow-y-auto p-3 space-y-4 bg-gradient-to-b from-purple-50/40 to-white"
                >
                  {grouped.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="MessageCircle" size={48} className="mx-auto mb-3 text-gray-300" />
                      <h3 className="text-base font-semibold text-gray-700 mb-1">Чат пуст</h3>
                      <p className="text-sm text-gray-500">
                        {activeChat?.kind === 'family'
                          ? 'Напишите первое сообщение семье'
                          : `Начните разговор с ${activeChat?.title}`}
                      </p>
                    </div>
                  ) : (
                    grouped.map((group) => (
                      <div key={group.dateLabel} className="space-y-2">
                        <div className="flex justify-center">
                          <span className="text-[10px] uppercase tracking-wider bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                            {group.dateLabel}
                          </span>
                        </div>
                        {group.items.map((msg, idx) => {
                          const isMe = msg.sender_member_id === me.member_id;
                          const color = colorFor(msg.sender_member_id.charCodeAt(0) + idx);
                          return (
                            <div
                              key={msg.id}
                              className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                            >
                              {msg.sender_photo ? (
                                <img
                                  src={msg.sender_photo}
                                  alt=""
                                  className="w-8 h-8 shrink-0 rounded-full object-cover shadow-sm"
                                />
                              ) : (
                                <div
                                  className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-base shadow-sm text-white font-semibold`}
                                >
                                  {msg.sender_avatar || msg.sender_name?.charAt(0).toUpperCase() || '👤'}
                                </div>
                              )}
                              <div className={`max-w-[78%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                  <span className="text-[11px] font-medium text-gray-600 mb-0.5 px-1">
                                    {msg.sender_name}
                                  </span>
                                )}
                                <div
                                  className={`relative rounded-2xl px-3 py-2 text-sm shadow-sm whitespace-pre-wrap break-words ${
                                    isMe
                                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-sm'
                                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                                  }`}
                                >
                                  {msg.content}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReactionFor(reactionFor === msg.id ? null : msg.id)
                                    }
                                    className={`absolute -top-2 ${
                                      isMe ? '-left-2' : '-right-2'
                                    } w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-300 flex items-center justify-center text-[10px] shadow transition`}
                                    title="Реакция"
                                  >
                                    <Icon name="Smile" size={11} />
                                  </button>
                                </div>

                                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                  <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                                      <span
                                        key={emoji}
                                        className="text-[11px] bg-white border border-gray-200 rounded-full px-1.5 py-0.5 shadow-sm"
                                      >
                                        {emoji} {count}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {reactionFor === msg.id && (
                                  <div
                                    className={`mt-1 flex gap-1 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-md ${
                                      isMe ? 'flex-row-reverse' : ''
                                    }`}
                                  >
                                    {QUICK_REACTIONS.map((e) => (
                                      <button
                                        key={e}
                                        type="button"
                                        onClick={() => addReaction(msg.id, e)}
                                        className="text-base hover:scale-125 transition-transform"
                                      >
                                        {e}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                                  {formatTime(msg.created_at)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Поле ввода */}
                <div className="border-t border-gray-100 p-2 bg-white sticky bottom-0 relative">
                  {showEmoji && (
                    <div
                      id="chat-emoji-picker"
                      className="absolute bottom-full left-2 right-2 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 max-h-56 overflow-y-auto z-20"
                    >
                      <div className="grid grid-cols-10 sm:grid-cols-12 gap-1">
                        {EMOJI_LIST.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => insertEmoji(e)}
                            className="text-xl hover:bg-purple-50 rounded p-1 transition"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-purple-600 shrink-0"
                      title="Прикрепить (скоро)"
                      onClick={() => alert('Вложения скоро будут доступны')}
                    >
                      <Icon name="Paperclip" size={18} />
                    </Button>
                    <Button
                      ref={emojiBtnRef}
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`shrink-0 ${showEmoji ? 'text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-purple-600'}`}
                      title="Эмодзи"
                      onClick={() => setShowEmoji((v) => !v)}
                    >
                      <Icon name="Smile" size={18} />
                    </Button>
                    <Input
                      placeholder="Написать сообщение…"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="rounded-full bg-gray-50 border-gray-200 focus-visible:ring-purple-300"
                    />
                    <Button
                      type="button"
                      onClick={sendMessage}
                      disabled={!draft.trim()}
                      className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shrink-0"
                      size="icon"
                      title="Отправить"
                    >
                      <Icon name="Send" size={16} />
                    </Button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 px-1">
                    Вы в чате как {me.name} · сообщения хранятся в БД (РФ) · обновление каждые 3 сек
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
