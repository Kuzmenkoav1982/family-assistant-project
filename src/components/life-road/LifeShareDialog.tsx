import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { CATEGORY_CONFIG, type LifeEvent } from './types';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  events: LifeEvent[];
}

function buildText(events: LifeEvent[]): string {
  const past = events.filter((e) => !e.isFuture).sort((a, b) => a.date.localeCompare(b.date));
  if (past.length === 0) return 'Моя Дорога жизни пока пуста — я только начинаю.';
  const lines = ['🛤  Моя Дорога жизни', ''];
  past.forEach((e) => {
    const c = CATEGORY_CONFIG[e.category] || CATEGORY_CONFIG.other;
    const date = new Date(e.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    lines.push(`• ${date} — ${e.title} (${c.label})`);
  });
  lines.push('');
  lines.push(`Всего: ${past.length} событий. Создано в «Наша Семья» → Дорога жизни.`);
  return lines.join('\n');
}

export default function LifeShareDialog({ open, onOpenChange, events }: Props) {
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => buildText(events), [events]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Не удалось скопировать. Выдели текст вручную.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Моя Дорога жизни', text });
      } catch {
        /* отменено пользователем */
      }
    } else {
      handleCopy();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name="Share2" size={20} />
            Поделиться путём
          </DialogTitle>
          <DialogDescription>
            Текстовое описание твоей дороги — для соцсетей, мессенджеров или печати.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200 max-h-60 overflow-y-auto">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button onClick={handleCopy} variant="outline" size="sm">
              <Icon name={copied ? 'Check' : 'Copy'} size={14} className="mr-1.5" />
              {copied ? 'Скопировано' : 'Копировать'}
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Icon name="Share2" size={14} className="mr-1.5" />
              Поделиться
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Icon name="Printer" size={14} className="mr-1.5" />
              Печать
            </Button>
          </div>

          <p className="text-[11px] text-gray-500 text-center">
            Совет: на вкладке «Инсайты» можно сделать красивый скриншот для соцсетей.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
