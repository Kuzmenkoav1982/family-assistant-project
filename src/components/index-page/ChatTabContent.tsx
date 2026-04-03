import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import type { ChatMessage } from '@/types/family.types';

interface ChatTabContentProps {
  chatMessages: ChatMessage[];
  newMessage: string;
  setNewMessage: (v: string) => void;
  handleSendMessage: () => void;
}

export default function ChatTabContent({
  chatMessages,
  newMessage,
  setNewMessage,
  handleSendMessage,
}: ChatTabContentProps) {
  return (
    <TabsContent value="chat">
      <Card key="chat-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="MessageCircle" />
            Семейный чат
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4 max-h-[500px] overflow-y-auto">
            {chatMessages.length > 0 ? chatMessages.map((msg, idx) => (
              <div key={msg.id} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                {msg.senderAvatar && msg.senderAvatar.startsWith('http') ? (
                  <img 
                    src={msg.senderAvatar} 
                    alt={msg.senderName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
                  />
                ) : (
                  <span className="text-2xl">{msg.senderAvatar}</span>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{msg.senderName}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {msg.type === 'text' && <p className="text-sm">{msg.content}</p>}
                    {msg.type === 'image' && (
                      <div className="space-y-2">
                        <div className="bg-purple-100 rounded p-4 text-center">{'\u{1F4F7}'} Фото</div>
                        <p className="text-xs text-muted-foreground">{msg.fileName}</p>
                      </div>
                    )}
                    {msg.type === 'video' && (
                      <div className="space-y-2">
                        <div className="bg-blue-100 rounded p-4 text-center">{'\u{1F3A5}'} Видео</div>
                        <p className="text-xs text-muted-foreground">{msg.fileName}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Чат пуст</h3>
                <p className="text-sm text-muted-foreground">Начните общение с семьей</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="Написать сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Icon name="Send" size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
