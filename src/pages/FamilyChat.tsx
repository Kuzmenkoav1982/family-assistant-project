import { useState, useEffect, useRef, useMemo } from 'react';
import SEOHead from '@/components/SEOHead';
import SectionHero from '@/components/ui/section-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const HERO_IMAGE =
  'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/f3c4934c-0ac2-462f-b004-726c8716bf40.png';

const STORAGE_KEY = 'family_chat_messages_v1';

interface ChatMsg {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: number;
  reactions?: Record<string, number>;
}

const DEMO_PARTICIPANTS = [
  { id: 'mom', name: 'Анастасия', avatar: '👩‍🦰', color: 'from-pink-500 to-rose-500' },
  { id: 'dad', name: 'Алексей', avatar: '👨', color: 'from-blue-500 to-sky-500' },
  { id: 'son', name: 'Матвей', avatar: '🧒', color: 'from-amber-500 to-orange-500' },
  { id: 'daughter', name: 'Даша', avatar: '👧', color: 'from-violet-500 to-purple-500' },
];

const ME_ID = 'mom';

const SEED_MESSAGES: ChatMsg[] = [
  {
    id: 's1',
    senderId: 'mom',
    senderName: 'Анастасия',
    senderAvatar: '👩‍🦰',
    content: 'Не забудьте, завтра у Даши танцы в 17:00!',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    reactions: { '👍': 2 },
  },
  {
    id: 's2',
    senderId: 'dad',
    senderName: 'Алексей',
    senderAvatar: '👨',
    content: 'Отвезу её, я буду свободен',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    reactions: { '❤️': 1 },
  },
  {
    id: 's3',
    senderId: 'son',
    senderName: 'Матвей',
    senderAvatar: '🧒',
    content: 'Мама, можно сегодня пригласить друга в гости?',
    timestamp: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 's4',
    senderId: 'mom',
    senderName: 'Анастасия',
    senderAvatar: '👩‍🦰',
    content: 'Конечно, только сначала уроки!',
    timestamp: Date.now() - 1000 * 60 * 15,
    reactions: { '📚': 1 },
  },
  {
    id: 's5',
    senderId: 'daughter',
    senderName: 'Даша',
    senderAvatar: '👧',
    content: 'Я убрала свою комнату! ✨',
    timestamp: Date.now() - 1000 * 60 * 5,
    reactions: { '🌟': 3 },
  },
];

const QUICK_REACTIONS = ['❤️', '👍', '😂', '🎉', '🙏', '🔥'];

function loadMessages(): ChatMsg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_MESSAGES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return SEED_MESSAGES;
  } catch {
    return SEED_MESSAGES;
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

export default function FamilyChat() {
  const [messages, setMessages] = useState<ChatMsg[]>(loadMessages);
  const [draft, setDraft] = useState('');
  const [reactionFor, setReactionFor] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore quota */
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const me = DEMO_PARTICIPANTS.find((p) => p.id === ME_ID)!;

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
    if (!text) return;
    const msg: ChatMsg = {
      id: `m_${Date.now()}`,
      senderId: me.id,
      senderName: me.name,
      senderAvatar: me.avatar,
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setDraft('');
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

  const clearChat = () => {
    if (window.confirm('Очистить всю историю чата? Это действие нельзя отменить.')) {
      setMessages([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Чат семьи — Наша Семья"
        description="Закрытый семейный чат: общение, реакции, история сообщений. Без рекламы, данные хранятся в РФ."
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
        {/* Участники */}
        <Card className="mb-3 border-purple-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="Users" size={16} className="text-purple-600" />
                <span className="text-sm font-semibold text-gray-800">Участники</span>
                <Badge variant="secondary" className="text-[10px]">
                  {DEMO_PARTICIPANTS.length}
                </Badge>
              </div>
              <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                в сети
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {DEMO_PARTICIPANTS.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center gap-1 min-w-[56px]"
                  title={p.name}
                >
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-xl shadow-sm ring-2 ring-white`}
                  >
                    {p.avatar}
                  </div>
                  <span className="text-[10px] text-gray-700 truncate max-w-[60px]">{p.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Лента сообщений */}
        <Card className="mb-3">
          <CardContent className="p-0">
            <div
              ref={scrollRef}
              className="max-h-[58vh] overflow-y-auto p-3 space-y-4 bg-gradient-to-b from-purple-50/40 to-white"
            >
              {grouped.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="MessageCircle" size={48} className="mx-auto mb-3 text-gray-300" />
                  <h3 className="text-base font-semibold text-gray-700 mb-1">Чат пуст</h3>
                  <p className="text-sm text-gray-500">Напишите первое сообщение семье</p>
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
                      const isMe = msg.senderId === ME_ID;
                      const participant =
                        DEMO_PARTICIPANTS.find((p) => p.id === msg.senderId) || me;
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                        >
                          <div
                            className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${participant.color} flex items-center justify-center text-base shadow-sm`}
                          >
                            {participant.avatar}
                          </div>
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
                                } w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-300 flex items-center justify-center text-[10px] shadow opacity-0 group-hover:opacity-100 transition`}
                                title="Реакция"
                              >
                                <Icon name="Smile" size={11} />
                              </button>
                            </div>

                            {/* Реакции */}
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

                            {/* Панель быстрых реакций */}
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
            <div className="border-t border-gray-100 p-2 bg-white sticky bottom-0">
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
                Закрытый семейный чат · данные хранятся локально
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
