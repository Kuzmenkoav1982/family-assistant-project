import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { lifeApi } from './api';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const QUICK = [
  { mode: 'reflect-past' as const, icon: 'History',  label: 'Разбери моё прошлое',     hint: 'Найдёт паттерны и сильные стороны' },
  { mode: 'plan-future' as const,  icon: 'Compass',  label: 'Составь план на год',     hint: '3 цели по SMART на 4 квартала' },
  { mode: 'ikigai' as const,       icon: 'Heart',    label: 'Помоги найти Икигай',     hint: 'Вопросы для смысла жизни' },
];

export default function CoachDialog({ open, onOpenChange }: Props) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async (mode: 'general' | 'reflect-past' | 'plan-future' | 'ikigai', q?: string) => {
    setLoading(true);
    setAnswer('');
    try {
      const res = await lifeApi.coach({ mode, question: q });
      setAnswer(res.response);
    } catch (e) {
      setAnswer('Ошибка: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white">
              <Icon name="Sparkles" size={18} />
            </span>
            Домовой · Жизненный путь
          </DialogTitle>
          <DialogDescription>
            Я вижу твою «Дорогу жизни» — события, цели и колесо баланса. Задай вопрос или выбери шаблон.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {QUICK.map((q) => (
              <button
                key={q.mode}
                onClick={() => ask(q.mode)}
                disabled={loading}
                className="p-3 rounded-xl border-2 border-purple-200 hover:border-purple-500 bg-white hover:bg-purple-50 text-left transition-all"
              >
                <Icon name={q.icon} size={18} className="text-purple-600 mb-1" />
                <div className="text-sm font-bold text-gray-800">{q.label}</div>
                <div className="text-[11px] text-gray-500">{q.hint}</div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Спроси о своём пути, выборе или сложной ситуации..."
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
            <Button
              onClick={() => ask('general', question)}
              disabled={!question.trim() || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <Icon name={loading ? 'Loader2' : 'Send'} size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Спросить Домового
            </Button>
          </div>

          {answer && (
            <div className="rounded-2xl p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
              <div className="flex items-center gap-2 mb-2 text-sm font-bold text-purple-900">
                <Icon name="MessageCircle" size={14} /> Ответ Домового
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{answer}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
