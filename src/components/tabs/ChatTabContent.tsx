import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import type { ChatMessage, FamilyMember } from '@/types/family.types';

interface ChatTabContentProps {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  selectedUserId: string;
  getMemberById: (id: string) => FamilyMember | undefined;
}

export function ChatTabContent({
  chatMessages,
  setChatMessages,
  newMessage,
  setNewMessage,
  selectedUserId,
  getMemberById,
}: ChatTabContentProps) {
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const currentUser = getMemberById(selectedUserId);
    if (!currentUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: selectedUserId,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: newMessage,
      timestamp: new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'text'
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage('');
  };

  const handleFileUpload = (type: 'image' | 'video') => {
    const currentUser = getMemberById(selectedUserId);
    if (!currentUser) return;

    const fileName = type === 'image' ? 'uploaded_image.jpg' : 'uploaded_video.mp4';
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: selectedUserId,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: `Отправил ${type === 'image' ? 'фото' : 'видео'}`,
      timestamp: new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: type,
      fileUrl: `/uploads/${fileName}`,
      fileName: fileName
    };

    setChatMessages([...chatMessages, message]);
  };

  return (
    <TabsContent value="chat" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="MessageCircle" size={24} />
            Семейный чат
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.senderId === selectedUserId ? 'flex-row-reverse' : ''
                }`}
              >
                <img
                  src={message.senderAvatar}
                  alt={message.senderName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className={`flex-1 ${message.senderId === selectedUserId ? 'text-right' : ''}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm">{message.senderName}</span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  
                  {message.type === 'text' && (
                    <div className={`inline-block p-3 rounded-lg ${
                      message.senderId === selectedUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border'
                    }`}>
                      {message.content}
                    </div>
                  )}
                  
                  {message.type === 'image' && (
                    <div className="inline-block">
                      <img src={message.fileUrl} alt="Shared" className="rounded-lg max-w-xs" />
                    </div>
                  )}
                  
                  {message.type === 'video' && (
                    <div className="inline-block">
                      <video controls className="rounded-lg max-w-xs">
                        <source src={message.fileUrl} />
                      </video>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Напишите сообщение..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Icon name="Send" size={18} />
            </Button>
            <Button onClick={() => handleFileUpload('image')} variant="outline" size="icon">
              <Icon name="Image" size={18} />
            </Button>
            <Button onClick={() => handleFileUpload('video')} variant="outline" size="icon">
              <Icon name="Video" size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
