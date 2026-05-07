import { useState, useEffect, useRef, useMemo, useContext } from 'react';
import SEOHead from '@/components/SEOHead';
import SectionHero from '@/components/ui/section-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { FamilyMembersContext } from '@/contexts/FamilyMembersContext';

const HERO_IMAGE =
  'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/8e1ea98d-74bd-4232-979e-22fbb47b21db.jpg';

const STORAGE_PREFIX = 'family_chat_v2_';
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

interface ChatMsg {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderPhoto?: string;
  senderColor?: string;
  content: string;
  timestamp: number;
  reactions?: Record<string, number>;
}

type ChatId = 'family' | string; // 'family' = общий, 'dm:<memberId>' = тет-а-тет

function loadMessages(chatId: ChatId): ChatMsg[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + chatId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((today - msgDay) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
}

const FALLBACK_COLORS = [
  'from-pink-500 to-rose-500',
  'from-blue-500 to-sky-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-fuchsia-500 to-pink-500',
];

function colorForId(id: string, idx: number): string {
  return FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

interface MemberLike {
  id: string | number;
  user_id?: string | number;
  name: string;
  role?: string;
  avatar?: string;
  photo_url?: string;
}

function getCurrentUserId(members: MemberLike[]): string | null {
  // 1. Из userData в localStorage (member_id)
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.member_id) return String(parsed.member_id);
      if (parsed.id) {
        // Поиск по user_id
        const found = members.find((m) => String(m.user_id) === String(parsed.id));
        if (found) return String(found.id);
      }
    }
  } catch {
    /* ignore */
  }
  // 2. Член семьи с ролью "владелец"
  const owner = members.find((m) => (m.role || '').toLowerCase() === 'владелец');
  if (owner) return String(owner.id);
  // 3. Первый
  return members[0] ? String(members[0].id) : null;
}

export default function FamilyChat() {
  const ctx = useContext(FamilyMembersContext);
  const ctxMembers = ctx?.members;
  const members = useMemo(() => ctxMembers || [], [ctxMembers]);

  const [activeChat, setActiveChat] = useState<ChatId>('family');
  const [messages, setMessages] = useState<ChatMsg[]>(() => loadMessages('family'));
  const [draft, setDraft] = useState('');
  const [reactionFor, setReactionFor] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const emojiBtnRef = useRef<HTMLButtonElement | null>(null);

  const meId = useMemo(() => getCurrentUserId(members), [members]);
  const me = useMemo(
    () => members.find((m) => String(m.id) === meId) || null,
    [members, meId]
  );

  // загружаем сообщения при смене чата
  useEffect(() => {
    setMessages(loadMessages(activeChat));
    setReactionFor(null);
    setShowEmoji(false);
  }, [activeChat]);

  // сохраняем сообщения для конкретного чата
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + activeChat, JSON.stringify(messages));
    } catch {
      /* ignore quota */
    }
  }, [messages, activeChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, activeChat]);

  // закрытие эмодзи-пикера по клику вне
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
      const label = formatDateLabel(m.timestamp);
      const last = result[result.length - 1];
      if (!last || last.dateLabel !== label) {
        result.push({ dateLabel: label, items: [m] });
      } else {
        last.items.push(m);
      }
    }
    return result;
  }, [messages]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !me) return;
    const meIdx = members.findIndex((m) => String(m.id) === meId);
    const msg: ChatMsg = {
      id: `m_${Date.now()}`,
      senderId: String(me.id),
      senderName: me.name,
      senderAvatar: me.avatar || '👤',
      senderPhoto: me.photo_url,
      senderColor: colorForId(String(me.id), meIdx >= 0 ? meIdx : 0),
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setDraft('');
    setShowEmoji(false);
  };

  const addReaction = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const r = { ...(m.reactions || {}) };
        r[emoji] = (r[emoji] || 0) + 1;
        return { ...m, reactions: r };
      })
    );
    setReactionFor(null);
  };

  const insertEmoji = (e: string) => {
    setDraft((d) => d + e);
  };

  const clearChat = () => {
    if (window.confirm('Очистить историю этого чата? Это действие нельзя отменить.')) {
      setMessages([]);
      try {
        localStorage.removeItem(STORAGE_PREFIX + activeChat);
      } catch {
        /* ignore */
      }
    }
  };

  // Список чатов: общий + тет-а-тет с каждым (кроме себя)
  const chatList = useMemo(() => {
    const list: Array<{ id: ChatId; title: string; subtitle: string; avatar: string | null; photo?: string; color: string; emoji: string }> = [
      {
        id: 'family',
        title: 'Чат семьи',
        subtitle: 'Общий чат',
        avatar: null,
        color: 'from-purple-500 to-pink-500',
        emoji: '👨‍👩‍👧‍👦',
      },
    ];
    members.forEach((m, idx) => {
      if (String(m.id) === meId) return;
      list.push({
        id: `dm:${m.id}`,
        title: m.name,
        subtitle: m.role || 'Член семьи',
        avatar: m.avatar || '👤',
        photo: m.photo_url,
        color: colorForId(String(m.id), idx),
        emoji: m.avatar || '👤',
      });
    });
    return list;
  }, [members, meId]);

  const activeChatMeta = chatList.find((c) => c.id === activeChat) || chatList[0];

  // Аватар-рендер
  const renderAvatar = (
    photoUrl: string | undefined,
    emoji: string,
    color: string,
    sizeClass: string,
    textSize: string,
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
        className={`${sizeClass} rounded-full bg-gradient-to-br ${color} flex items-center justify-center ${textSize} shadow-sm ring-2 ring-white`}
      >
        {emoji}
      </div>
    );
  };

  return (
    <>
      <SEOHead
        title="Чат семьи — Наша Семья"
        description="Закрытый семейный чат: общий чат и тет-а-тет с каждым членом семьи. Без рекламы, данные хранятся в РФ."
      />

      <SectionHero
        title="Чат семьи"
        subtitle="Закрытый чат для своих — без рекламы, данные хранятся в РФ"
        imageUrl={HERO_IMAGE}
        rightAction={
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-white hover:bg-white/20"
            title="Очистить историю"
          >
            <Icon name="Trash2" size={16} />
          </Button>
        }
      />

      <div className="px-3 sm:px-4 pt-2 pb-24 max-w-3xl mx-auto">
        {/* Переключатель чатов */}
        <Card className="mb-3 border-purple-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="MessagesSquare" size={16} className="text-purple-600" />
                <span className="text-sm font-semibold text-gray-800">Чаты</span>
                <Badge variant="secondary" className="text-[10px]">
                  {chatList.length}
                </Badge>
              </div>
              <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                в сети
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {chatList.map((c) => {
                const isActive = c.id === activeChat;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveChat(c.id)}
                    className={`flex flex-col items-center gap-1 min-w-[64px] p-1.5 rounded-lg transition ${
                      isActive ? 'bg-purple-100 ring-1 ring-purple-300' : 'hover:bg-gray-50'
                    }`}
                    title={c.title}
                  >
                    {c.id === 'family' ? (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-sm ring-2 ring-white">
                        {c.emoji}
                      </div>
                    ) : (
                      renderAvatar(c.photo, c.emoji, c.color, 'w-11 h-11', 'text-xl')
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
                name={activeChat === 'family' ? 'Users' : 'User'}
                size={14}
                className="text-purple-600"
              />
              <span className="text-xs font-semibold text-gray-700">{activeChatMeta?.title}</span>
              <span className="text-[11px] text-gray-400">· {activeChatMeta?.subtitle}</span>
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
                    {activeChat === 'family'
                      ? 'Напишите первое сообщение семье'
                      : `Начните разговор с ${activeChatMeta?.title}`}
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
                    {group.items.map((msg) => {
                      const isMe = msg.senderId === meId;
                      const color = msg.senderColor || colorForId(msg.senderId, 0);
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                        >
                          {msg.senderPhoto ? (
                            <img
                              src={msg.senderPhoto}
                              alt=""
                              className="w-8 h-8 shrink-0 rounded-full object-cover shadow-sm"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-base shadow-sm`}
                            >
                              {msg.senderAvatar}
                            </div>
                          )}
                          <div className={`max-w-[78%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            {!isMe && (
                              <span className="text-[11px] font-medium text-gray-600 mb-0.5 px-1">
                                {msg.senderName}
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
                              {formatTime(msg.timestamp)}
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
                  placeholder={me ? 'Написать сообщение…' : 'Загрузка профиля…'}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={!me}
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
                  disabled={!draft.trim() || !me}
                  className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shrink-0"
                  size="icon"
                  title="Отправить"
                >
                  <Icon name="Send" size={16} />
                </Button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 px-1">
                {me
                  ? `Вы в чате как ${me.name} · данные хранятся локально`
                  : 'Закрытый семейный чат · данные хранятся локально'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}