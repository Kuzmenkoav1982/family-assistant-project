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

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem('userData')
        ? JSON.parse(localStorage.getItem('userData')!).member_id
        : '1';
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/events/${event.id}`, {
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

  const generateInvitationImage = async () => {
    setGeneratingImage(true);
    try {
      const prompt = `Beautiful invitation card for ${event.title}, ${
        event.theme ? `theme: ${event.theme}, ` : ''
      }elegant design, festive, celebration, high quality`;

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewImage(data.url);
        toast({ title: 'Готово!', description: 'Открытка сгенерирована' });
      } else {
        throw new Error('Failed to generate image');
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
                <img
                  src={event.invitationImageUrl}
                  alt="Invitation"
                  className="w-full rounded-lg border"
                />
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
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Icon name="Image" size={48} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-4">Открытка не выбрана</p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={generateInvitationImage}
              disabled={generatingImage}
              className="w-full"
            >
              <Icon name="Wand2" size={16} />
              {generatingImage ? 'Генерирую...' : 'Сгенерировать открытку с ИИ'}
            </Button>

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
