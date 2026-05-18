import { type RefObject } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { EMOJI_LIST } from './types';

interface Props {
  draft: string;
  setDraft: (v: string) => void;
  showEmoji: boolean;
  setShowEmoji: (v: boolean | ((prev: boolean) => boolean)) => void;
  emojiBtnRef: RefObject<HTMLButtonElement>;
  meName: string;
  onSend: () => void;
  onInsertEmoji: (e: string) => void;
}

export default function ChatComposer({
  draft, setDraft, showEmoji, setShowEmoji, emojiBtnRef, meName, onSend, onInsertEmoji,
}: Props) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-t border-gray-100 p-2 bg-white sticky bottom-0 relative">
          {showEmoji && (
            <div
              id="chat-emoji-picker"
              className="absolute bottom-full left-2 right-2 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 max-h-56 overflow-y-auto z-20"
            >
              <div className="grid grid-cols-10 sm:grid-cols-12 gap-1">
                {EMOJI_LIST.map((e) => (
                  <button key={e} type="button" onClick={() => onInsertEmoji(e)} className="text-xl hover:bg-purple-50 rounded p-1 transition">
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
                  onSend();
                }
              }}
              className="rounded-full bg-gray-50 border-gray-200 focus-visible:ring-purple-300"
            />
            <Button
              type="button"
              onClick={onSend}
              disabled={!draft.trim()}
              className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shrink-0"
              size="icon"
              title="Отправить"
            >
              <Icon name="Send" size={16} />
            </Button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 px-1">
            Вы в чате как {meName} · сообщения хранятся в БД (РФ) · обновление каждые 3 сек
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
