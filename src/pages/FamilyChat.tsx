import SEOHead from '@/components/SEOHead';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useFamilyChat } from '@/components/family-chat/useFamilyChat';
import ChatSidebar from '@/components/family-chat/ChatSidebar';
import ChatMessages from '@/components/family-chat/ChatMessages';
import ChatComposer from '@/components/family-chat/ChatComposer';

const HERO_IMAGE = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/8e1ea98d-74bd-4232-979e-22fbb47b21db.jpg';

export default function FamilyChat() {
  const {
    me, chats, activeChatId, setActiveChatId,
    grouped,
    draft, setDraft,
    reactionFor, setReactionFor,
    showEmoji, setShowEmoji,
    loading, error,
    scrollRef, emojiBtnRef,
    sendMessage, addReaction, insertEmoji,
  } = useFamilyChat();

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <>
      <SEOHead
        title="Чат семьи — Наша Семья"
        description="Закрытый семейный чат: общий чат и тет-а-тет с каждым членом семьи. Реальное время, без рекламы, данные хранятся в РФ."
      />

      <SectionPageFrame
        title="Чат семьи"
        subtitle="Закрытый чат для своих — без рекламы, данные хранятся в РФ"
        backPath="/family-hub"
        imageUrl={HERO_IMAGE}
        width="narrow"
      >
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
            <ChatSidebar chats={chats} activeChatId={activeChatId} onSelect={setActiveChatId} />

            <ChatMessages
              activeChat={activeChat}
              grouped={grouped}
              me={me}
              reactionFor={reactionFor}
              scrollRef={scrollRef}
              onReactionToggle={(msgId) => setReactionFor(reactionFor === msgId ? null : msgId)}
              onReact={addReaction}
            />

            <ChatComposer
              draft={draft}
              setDraft={setDraft}
              showEmoji={showEmoji}
              setShowEmoji={setShowEmoji}
              emojiBtnRef={emojiBtnRef}
              meName={me.name}
              onSend={sendMessage}
              onInsertEmoji={insertEmoji}
            />
          </>
        )}
      </SectionPageFrame>
    </>
  );
}