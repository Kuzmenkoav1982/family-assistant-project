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

type CoachMode =
  | 'general'
  | 'reflect-past'
  | 'plan-future'
  | 'ikigai'
  | 'balance-check'
  | 'next-step'
  | 'blockers';

const QUICK: { mode: CoachMode; icon: string; label: string; hint: string; color: string }[] = [
  { mode: 'next-step',     icon: 'Footprints', label: 'Какой мой следующий шаг?', hint: 'Один маленький шаг на 3 дня',     color: 'from-pink-500 to-rose-500' },
  { mode: 'reflect-past',  icon: 'History',    label: 'Разбери моё прошлое',      hint: 'Паттерны и сильные стороны',       color: 'from-purple-500 to-pink-500' },
  { mode: 'plan-future',   icon: 'Compass',    label: 'План на год',              hint: '3 цели по SMART на 4 квартала',    color: 'from-blue-500 to-indigo-500' },
  { mode: 'balance-check', icon: 'PieChart',   label: 'Что с моим балансом?',     hint: 'Найдёт просадку + действия',       color: 'from-emerald-500 to-teal-500' },
  { mode: 'blockers',      icon: 'ShieldAlert', label: 'Что мне мешает?',         hint: 'Возможные блоки и как сдвинуться', color: 'from-amber-500 to-orange-500' },
  { mode: 'ikigai',        icon: 'Heart',      label: 'Помоги найти Икигай',      hint: 'Смысл через 4 вопроса',            color: 'from-rose-500 to-red-500' },
];

const SUGGESTIONS = [
  'Хочу сменить работу, но боюсь. С чего начать?',
  'Как найти время на себя между работой и семьёй?',
  'Чувствую, что топчусь на месте. Что делать?',
  'Как перестать откладывать важное?',
];

export default function CoachDialog({ open, onOpenChange }: Props) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async (mode: CoachMode, q?: string) => {
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
      <DialogContent className="max-w-2xl w-[calc(100vw-1rem)] sm:w-auto max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white">
              <Icon name="Sparkles" size={18} />
            </span>
            Домовой · Мастерская жизни
          </DialogTitle>
          <DialogDescription>
            Твой наставник по «Мастерской жизни». Видит события, цели и колесо баланса — и помогает
            собрать следующий шаг.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <p className="text-[11px] font-semibold text-purple-900 uppercase tracking-wide mb-2">
              Быстрые шаблоны
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {QUICK.map((q) => (
                <button
                  key={q.mode}
                  onClick={() => ask(q.mode)}
                  disabled={loading}
                  className="group relative p-3 rounded-xl border border-purple-200 hover:border-transparent bg-white hover:shadow-md text-left transition-all disabled:opacity-50 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${q.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative">
                    <div className={`inline-flex w-8 h-8 rounded-lg bg-gradient-to-br ${q.color} items-center justify-center text-white mb-1.5`}>
                      <Icon name={q.icon} size={15} />
                    </div>
                    <div className="text-[13px] font-bold text-gray-800 leading-tight">{q.label}</div>
                    <div className="text-[11px] text-gray-500 leading-snug mt-0.5">{q.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-purple-900 uppercase tracking-wide mb-2">
              Или спроси своими словами
            </p>
            <Textarea
              placeholder="Например: хочу сменить работу, но боюсь. С чего начать?"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              className="resize-none"
            />
            {!question && !answer && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuestion(s)}
                    disabled={loading}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <Button
              onClick={() => ask('general', question)}
              disabled={!question.trim() || loading}
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <Icon name={loading ? 'Loader2' : 'Send'} size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Думаю…' : 'Спросить Домового'}
            </Button>
          </div>

          {loading && !answer && (
            <div className="rounded-2xl p-4 bg-purple-50 border border-purple-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                <Icon name="Sparkles" size={16} />
              </div>
              <div className="text-sm text-purple-900">
                Смотрю твою мастерскую — события, цели, баланс…
              </div>
            </div>
          )}

          {answer && (
            <div className="rounded-2xl p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-purple-900">
                  <Icon name="MessageCircle" size={14} /> Ответ Домового
                </div>
                <button
                  onClick={() => {
                    setAnswer('');
                    setQuestion('');
                  }}
                  className="text-[11px] text-purple-600 hover:text-purple-900 flex items-center gap-1"
                >
                  <Icon name="RotateCcw" size={11} /> Задать новый
                </button>
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{answer}</div>
            </div>
          )}

          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            Домовой видит твои события, цели и колесо баланса. Ответы — только опора для размышлений,
            не замена психолога или врача.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}