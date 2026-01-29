import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

const API_URL = func2url['event-share'];

interface ShareEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
}

function getUserId(): string {
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      return userData.member_id || '1';
    } catch (e) {
      console.error('[getUserId] Failed to parse userData:', e);
    }
  }
  return '1';
}

export default function ShareEventDialog({ open, onOpenChange, eventId, eventTitle }: ShareEventDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (open && !shareUrl) {
      generateShareLink();
    }
  }, [open]);

  const generateShareLink = async () => {
    setLoading(true);
    try {
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({ eventId })
      });

      if (response.ok) {
        const data = await response.json();
        setShareUrl(data.url);
      } else {
        throw new Error('Failed to generate share link');
      }
    } catch (error) {
      console.error('[ShareEvent] Error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать ссылку для шаринга',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Скопировано!',
        description: 'Ссылка скопирована в буфер обмена'
      });
    } catch (error) {
      console.error('[CopyLink] Error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать ссылку',
        variant: 'destructive'
      });
    }
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: `Приглашение на ${eventTitle}`,
          url: shareUrl
        });
        toast({
          title: 'Успешно!',
          description: 'Ссылка отправлена'
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('[WebShare] Error:', error);
        }
      }
    }
  };

  const shareViaTelegram = () => {
    const text = encodeURIComponent(`Приглашение на ${eventTitle}`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Приглашение на ${eventTitle}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Приглашение на ${eventTitle}`);
    const body = encodeURIComponent(`Здравствуйте!\n\nПриглашаю вас на ${eventTitle}.\n\nПодробности и виш-лист: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Share2" />
            Поделиться праздником
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Icon name="Loader2" className="animate-spin" size={32} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ссылка для гостей</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button onClick={copyToClipboard} variant="outline">
                  <Icon name="Copy" size={16} />
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Гости смогут посмотреть информацию о празднике и виш-лист подарков
              </p>
            </div>

            <div className="space-y-2">
              <Label>Отправить гостям</Label>
              <div className="grid grid-cols-2 gap-2">
                {navigator.share && (
                  <Button onClick={shareViaWebShare} variant="outline" className="w-full">
                    <Icon name="Share2" size={16} />
                    Поделиться
                  </Button>
                )}
                <Button onClick={shareViaTelegram} variant="outline" className="w-full">
                  <Icon name="Send" size={16} />
                  Telegram
                </Button>
                <Button onClick={shareViaWhatsApp} variant="outline" className="w-full">
                  <Icon name="MessageCircle" size={16} />
                  WhatsApp
                </Button>
                <Button onClick={shareViaEmail} variant="outline" className="w-full">
                  <Icon name="Mail" size={16} />
                  Email
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
