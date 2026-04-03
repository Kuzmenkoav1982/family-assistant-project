import { RefObject } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { QUICK_QUESTIONS } from '@/data/financeAnalyticsTypes';

interface AIAdvisorProps {
  aiQ: string;
  setAiQ: (v: string) => void;
  aiLoading: boolean;
  aiResponse: string;
  aiRef: RefObject<HTMLDivElement>;
  askAI: (question: string) => void;
}

export default function AIAdvisor({ aiQ, setAiQ, aiLoading, aiResponse, aiRef, askAI }: AIAdvisorProps) {
  return (
    <div ref={aiRef}>
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Icon name="Bot" size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">ИИ Финансовый советник</h3>
              <p className="text-[10px] text-muted-foreground">Задайте вопрос о ваших финансах</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q, i) => (
              <Button key={i} size="sm" variant="outline" className="h-7 text-[11px] rounded-full" disabled={aiLoading} onClick={() => { setAiQ(q); askAI(q); }}>
                {q}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input placeholder="Ваш вопрос..." value={aiQ} onChange={e => setAiQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAI(aiQ)} className="text-sm h-9" disabled={aiLoading} />
            <Button size="sm" className="h-9 px-4" disabled={aiLoading || !aiQ.trim()} onClick={() => askAI(aiQ)}>
              {aiLoading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />}
            </Button>
          </div>

          {aiLoading && (
            <div className="flex items-center gap-2 py-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-muted-foreground ml-2">Анализирую...</span>
            </div>
          )}
          {aiResponse && !aiLoading && (
            <div className="rounded-xl bg-background/80 p-4 text-sm whitespace-pre-wrap leading-relaxed border animate-in fade-in slide-in-from-bottom-2 duration-300">
              {aiResponse}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
