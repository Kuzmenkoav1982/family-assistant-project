import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useBlogCoverJob } from '@/contexts/BlogCoverJobContext';

export default function BlogCoverJobIndicator() {
  const { job, cancelJob, progress } = useBlogCoverJob();
  const [collapsed, setCollapsed] = useState(false);

  if (!job || !job.active) return null;

  const pct = progress.total > 0 ? Math.round((progress.done + progress.failed) / progress.total * 100) : 0;
  const currentItem = job.items.find(i => i.status === 'processing');

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
        title="Генерация обложек в процессе"
      >
        <Icon name="Sparkles" size={20} className="animate-pulse" />
        <span className="absolute -top-1 -right-1 bg-white text-purple-600 text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
          {progress.done + progress.failed}/{progress.total}
        </span>
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] shadow-2xl border-purple-200 bg-white">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Sparkles" size={16} className="animate-pulse" />
          <span className="font-semibold text-sm">ИИ-генерация обложек</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(true)}
            className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center"
            title="Свернуть"
          >
            <Icon name="Minus" size={14} />
          </button>
          <button
            onClick={cancelJob}
            className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center"
            title="Остановить"
          >
            <Icon name="X" size={14} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
            <span>
              Готово <strong className="text-gray-900">{progress.done}</strong>
              {progress.failed > 0 && (
                <span className="text-red-500"> · ошибок {progress.failed}</span>
              )}
            </span>
            <span>{progress.done + progress.failed} / {progress.total}</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        {currentItem && (
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-2.5">
            <div className="flex items-start gap-2">
              <Icon name="Loader2" size={14} className="animate-spin text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-purple-700 font-medium uppercase tracking-wide">Сейчас обрабатывается</div>
                <div className="text-xs text-gray-800 line-clamp-2 mt-0.5">{currentItem.title}</div>
              </div>
            </div>
          </div>
        )}

        <div className="text-[11px] text-gray-500 leading-relaxed">
          Можешь спокойно работать в админке — генерация продолжится в фоне. Каждая обложка занимает ~30–60 сек.
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={cancelJob}
          className="w-full text-xs h-8 text-red-600 border-red-200 hover:bg-red-50"
        >
          <Icon name="X" size={13} className="mr-1.5" />
          Остановить
        </Button>
      </div>
    </Card>
  );
}
