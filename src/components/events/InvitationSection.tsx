import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import type { FamilyEvent } from '@/types/events';

interface InvitationSectionProps {
  event: FamilyEvent;
  onUpdate: () => void;
}

export default function InvitationSection({ event, onUpdate }: InvitationSectionProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [invitationText, setInvitationText] = useState(
    event.invitationText ||
      `Приглашаем вас на ${event.title}!\n\nДата: ${new Date(event.eventDate).toLocaleDateString('ru-RU')}\nМесто: ${event.location || 'будет сообщено дополнительно'}\n\nБудем рады видеть вас!`
  );
  const [generatingImage, setGeneratingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(event.invitationImageUrl || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageWishes, setImageWishes] = useState('');

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem('userData')
        ? JSON.parse(localStorage.getItem('userData')!).member_id
        : '1';
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`https://functions.poehali.dev/79f31a73-5361-4721-96ff-71bfd28f43ac?id=${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { Authorization: `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          invitationText,
          invitationImageUrl: previewImage
        })
      });

      if (response.ok) {
        toast({ title: 'Сохранено', description: 'Приглашение обновлено' });
        setEditing(false);
        onUpdate();
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      console.error('[InvitationSection] Save error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive'
      });
    }
  };

  const DIET_API = 'https://functions.poehali.dev/18a28f19-8a37-4b2f-8434-ed8b1365f97a';

  const pollGreeting = async (operationId: string) => {
    const maxAttempts = 24;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        const res = await fetch(DIET_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check_greeting', operationId }),
        });
        const data = await res.json();
        if (data.status === 'processing') continue;
        if (data.status === 'done' && data.imageUrl) {
          setPreviewImage(data.imageUrl);
          toast({ title: 'Готово!', description: 'Открытка сгенерирована' });
          return;
        }
        if (data.status === 'error') {
          toast({ title: 'Ошибка', description: data.error || 'Не удалось сгенерировать', variant: 'destructive' });
          return;
        }
      } catch {
        toast({ title: 'Ошибка', description: 'Ошибка соединения', variant: 'destructive' });
        return;
      }
    }
    toast({ title: 'Таймаут', description: 'Генерация заняла слишком много времени', variant: 'destructive' });
  };

  const generateInvitationImage = async () => {
    setGeneratingImage(true);
    try {
      const authToken = localStorage.getItem('authToken') || '';
      const response = await fetch(DIET_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
        body: JSON.stringify({
          action: 'greeting_photo',
          eventTitle: event.title,
          theme: event.theme || '',
          wishes: imageWishes || '',
        })
      });

      if (response.status === 402) {
        toast({ title: 'Недостаточно средств', description: 'Пополните кошелёк для генерации открытки', variant: 'destructive' });
        setGeneratingImage(false);
        return;
      }

      const result = await response.json();
      if (result.status === 'started' && result.operationId) {
        await pollGreeting(result.operationId);
      } else {
        throw new Error(result.error || 'Unexpected response');
      }
    } catch (error) {
      console.error('[InvitationSection] Generate error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сгенерировать открытку',
        variant: 'destructive'
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите изображение',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 10 МБ',
        variant: 'destructive'
      });
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(',')[1];

        const userId = localStorage.getItem('userData')
          ? JSON.parse(localStorage.getItem('userData')!).member_id
          : '1';
        const authToken = localStorage.getItem('authToken');

        const response = await fetch('https://functions.poehali.dev/159c1ff5-fd0b-4564-b93b-55b81348c9a0', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId,
            ...(authToken && { Authorization: `Bearer ${authToken}` })
          },
          body: JSON.stringify({
            file: base64Data,
            file_name: file.name,
            content_type: file.type,
            folder: 'invitation-images'
          })
        });

        if (response.ok) {
          const data = await response.json();
          setPreviewImage(data.url);
          toast({ title: 'Готово!', description: 'Изображение загружено' });
        } else {
          throw new Error('Upload failed');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('[InvitationSection] Upload error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить изображение',
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const shareInvitation = () => {
    const shareText = `${event.title}\n\n${invitationText}`;
    const shareUrl = `${window.location.origin}/events/${event.id}/invitation`;

    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      toast({ title: 'Скопировано', description: 'Приглашение скопировано в буфер обмена' });
    }
  };

  if (!editing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Mail" className="text-pink-500" />
              Приглашение
            </CardTitle>
            <div className="flex gap-2">
              {event.invitationText && (
                <Button variant="ghost" size="sm" onClick={shareInvitation}>
                  <Icon name="Share2" size={16} />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Icon name="Pencil" size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!event.invitationText && !event.invitationImageUrl ? (
            <p className="text-muted-foreground">Приглашение не создано</p>
          ) : (
            <div className="space-y-4">
              {event.invitationImageUrl && (
                <div className="relative group">
                  <img
                    src={event.invitationImageUrl}
                    alt="Invitation"
                    className="w-full rounded-lg border"
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 hover:bg-white shadow-sm"
                      onClick={() => setEditing(true)}
                    >
                      <Icon name="RefreshCw" size={14} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 hover:bg-red-50 shadow-sm text-red-500"
                      onClick={async () => {
                        setPreviewImage('');
                        try {
                          const userId = localStorage.getItem('userData')
                            ? JSON.parse(localStorage.getItem('userData')!).member_id
                            : '1';
                          const authToken = localStorage.getItem('authToken');
                          await fetch(`https://functions.poehali.dev/79f31a73-5361-4721-96ff-71bfd28f43ac?id=${event.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'X-User-Id': userId,
                              ...(authToken && { Authorization: `Bearer ${authToken}` })
                            },
                            body: JSON.stringify({ invitationImageUrl: '' })
                          });
                          toast({ title: 'Удалено', description: 'Открытка удалена' });
                          onUpdate();
                        } catch {
                          toast({ title: 'Ошибка', description: 'Не удалось удалить', variant: 'destructive' });
                        }
                      }}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              )}
              {event.invitationText && (
                <div className="p-4 bg-accent rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{event.invitationText}</p>
                </div>
              )}
              <Button onClick={shareInvitation} className="w-full">
                <Icon name="Send" size={16} />
                Поделиться приглашением
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Mail" className="text-pink-500" />
          Создание приглашения
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="invitation-text">Текст приглашения</Label>
          <Textarea
            id="invitation-text"
            value={invitationText}
            onChange={(e) => setInvitationText(e.target.value)}
            rows={6}
            placeholder="Введите текст приглашения..."
          />
        </div>

        <div>
          <Label>Открытка</Label>
          <div className="space-y-2">
            {previewImage ? (
              <div className="relative">
                <img src={previewImage} alt="Preview" className="w-full rounded-lg border" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-background"
                  onClick={() => setPreviewImage('')}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center bg-gradient-to-br from-pink-50 to-purple-50">
                <Icon name="Image" size={48} className="mx-auto text-pink-500 mb-3" />
                <p className="text-lg font-semibold text-gray-900 mb-2">Загрузите фото для открытки</p>
                <p className="text-sm text-muted-foreground">Нажмите кнопку ниже, чтобы выбрать изображение с устройства</p>
              </div>
            )}

            <div>
              <Label htmlFor="image-wishes">Пожелания к открытке</Label>
              <Textarea
                id="image-wishes"
                value={imageWishes}
                onChange={(e) => setImageWishes(e.target.value)}
                rows={2}
                placeholder="Например: зимняя тема, снежинки, голубые тона..."
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={generateInvitationImage}
                disabled={generatingImage}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                <Icon name="Sparkles" size={16} />
                {generatingImage ? 'Генерирую открытку...' : 'Сгенерировать ИИ-открытку (7 руб)'}
              </Button>
              {generatingImage && (
                <p className="text-xs text-center text-muted-foreground animate-pulse">
                  Обычно это занимает 15-30 секунд
                </p>
              )}
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploadingImage}
                className="w-full"
              >
                <Icon name="Upload" size={16} />
                {uploadingImage ? 'Загружаю...' : 'Загрузить с устройства'}
              </Button>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">или</div>

            <div>
              <Label htmlFor="image-url">Ссылка на изображение</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={previewImage}
                onChange={(e) => setPreviewImage(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Icon name="Check" size={16} />
            Сохранить
          </Button>
          <Button variant="outline" onClick={() => setEditing(false)}>
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}