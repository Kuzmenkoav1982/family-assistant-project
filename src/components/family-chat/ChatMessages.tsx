import { type RefObject } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { QUICK_REACTIONS, colorFor, formatTime } from './types';
import type { ChatMsg, ChatItem, MeInfo } from './types';

interface Grouped { dateLabel: string; items: ChatMsg[] }

interface Props {
  activeChat: ChatItem | undefined;
  grouped: Grouped[];
  me: MeInfo;
  reactionFor: string | null;
  scrollRef: RefObject<HTMLDivElement>;
  onReactionToggle: (msgId: string) => void;
  onReact: (msgId: string, emoji: string) => void;
}

export default function ChatMessages({
  activeChat, grouped, me, reactionFor, scrollRef, onReactionToggle, onReact,
}: Props) {
  return (
    <Card className="mb-3">
      <CardContent className="p-0">
        <div className="px-3 py-2 border-b border-gray-100 bg-white flex items-center gap-2">
          <Icon name={activeChat?.kind === 'family' ? 'Users' : 'User'} size={14} className="text-purple-600" />
          <span className="text-xs font-semibold text-gray-700">{activeChat?.title}</span>
          <span className="text-[11px] text-gray-400">· {activeChat?.subtitle}</span>
        </div>

        <div ref={scrollRef} className="max-h-[58vh] overflow-y-auto p-3 space-y-4 bg-gradient-to-b from-purple-50/40 to-white">
          {grouped.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-3 text-gray-300" />
              <h3 className="text-base font-semibold text-gray-700 mb-1">Чат пуст</h3>
              <p className="text-sm text-gray-500">
                {activeChat?.kind === 'family' ? 'Напишите первое сообщение семье' : `Начните разговор с ${activeChat?.title}`}
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
                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {msg.sender_photo ? (
                        <img src={msg.sender_photo} alt="" className="w-8 h-8 shrink-0 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-base shadow-sm text-white font-semibold`}>
                          {msg.sender_avatar || msg.sender_name?.charAt(0).toUpperCase() || '👤'}
                        </div>
                      )}
                      <div className={`max-w-[78%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && (
                          <span className="text-[11px] font-medium text-gray-600 mb-0.5 px-1">{msg.sender_name}</span>
                        )}
                        <div className={`relative rounded-2xl px-3 py-2 text-sm shadow-sm whitespace-pre-wrap break-words ${
                          isMe
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-sm'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                        }`}>
                          {msg.content}
                          <button
                            type="button"
                            onClick={() => onReactionToggle(msg.id)}
                            className={`absolute -top-2 ${isMe ? '-left-2' : '-right-2'} w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-300 flex items-center justify-center text-[10px] shadow transition`}
                            title="Реакция"
                          >
                            <Icon name="Smile" size={11} />
                          </button>
                        </div>

                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                            {Object.entries(msg.reactions).map(([emoji, count]) => (
                              <span key={emoji} className="text-[11px] bg-white border border-gray-200 rounded-full px-1.5 py-0.5 shadow-sm">
                                {emoji} {count}
                              </span>
                            ))}
                          </div>
                        )}

                        {reactionFor === msg.id && (
                          <div className={`mt-1 flex gap-1 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-md ${isMe ? 'flex-row-reverse' : ''}`}>
                            {QUICK_REACTIONS.map((e) => (
                              <button key={e} type="button" onClick={() => onReact(msg.id, e)} className="text-base hover:scale-125 transition-transform">
                                {e}
                              </button>
                            ))}
                          </div>
                        )}

                        <span className="text-[10px] text-gray-400 mt-0.5 px-1">{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
