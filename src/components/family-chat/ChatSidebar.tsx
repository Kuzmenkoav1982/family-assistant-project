import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { colorFor } from './types';
import type { ChatItem } from './types';

interface Props {
  chats: ChatItem[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
}

function renderAvatar(
  photoUrl: string | null | undefined,
  emoji: string | null | undefined,
  color: string,
  fallbackInitial?: string,
) {
  if (photoUrl) {
    return <img src={photoUrl} alt="" className="w-11 h-11 rounded-full object-cover shadow-sm ring-2 ring-white" />;
  }
  return (
    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-base text-white font-semibold shadow-sm ring-2 ring-white`}>
      {emoji || fallbackInitial || '👤'}
    </div>
  );
}

export default function ChatSidebar({ chats, activeChatId, onSelect }: Props) {
  return (
    <Card className="mb-3 border-purple-100">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon name="MessagesSquare" size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-gray-800">Чаты</span>
            <Badge variant="secondary" className="text-[10px]">{chats.length}</Badge>
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
                onClick={() => onSelect(c.id)}
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
                  renderAvatar(c.photo_url, c.avatar, colorFor(idx), c.title.charAt(0).toUpperCase())
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
  );
}
