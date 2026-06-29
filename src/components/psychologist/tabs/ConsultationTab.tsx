import { type RefObject } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { QUICK_TOPICS } from '../data/prompts';
import { formatDate, stripMarkdown } from '../utils';
import type { ConsultationRecord } from '../types';

interface Props {
  question: string;
  setQuestion: (v: string) => void;
  loading: boolean;
  currentResponse: string;
  setCurrentResponse: (v: string) => void;
  consultationHistory: ConsultationRecord[];
  responseRef: RefObject<HTMLDivElement>;
  handleSendConsultation: () => void;
}

export default function ConsultationTab({
  question, setQuestion, loading, currentResponse, setCurrentResponse,
  consultationHistory, responseRef, handleSendConsultation,
}: Props) {
  const { toast } = useToast();

  const handleShareConsultation = async (q: string, answer: string, topic?: string) => {
    const cleanAnswer = stripMarkdown(answer);
    const title = topic || 'Идеи от семейного ИИ-помощника';
    const shareText = `🧠 ${title}\n\n❓ ${q.slice(0, 200)}${q.length > 200 ? '...' : ''}\n\n💡 Идеи от ИИ-помощника:\n${cleanAnswer}\n\n📲 Приложение «Наша Семья» — nasha-semiya.ru`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast({ title: 'Скопировано', description: 'Рекомендация скопирована в буфер обмена' });
      } catch {
        toast({ title: 'Ошибка', description: 'Не удалось поделиться', variant: 'destructive' });
      }
    }
  };

  const handleCopyConsultation = async (q: string, answer: string) => {
    const cleanAnswer = stripMarkdown(answer);
    const text = `❓ ${q}\n\n💡 Рекомендация:\n${cleanAnswer}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Скопировано', description: 'Текст консультации скопирован' });
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось скопировать', variant: 'destructive' });
    }
  };

  const renderResponseText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4 mb-1 text-gray-700" dangerouslySetInnerHTML={{ __html: boldLine.slice(2) }} />;
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={i} className="ml-4 mb-1 text-gray-700 list-decimal" dangerouslySetInnerHTML={{ __html: boldLine }} />;
      }
      return <p key={i} className="mb-2 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: boldLine }} />;
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <Card className="border-teal-200/60 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Brain" size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Опишите ситуацию</h3>
              <p className="text-xs text-gray-500">Семейный ИИ-помощник предложит идеи для размышления</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic.label}
                onClick={() => setQuestion(topic.template)}
                className="text-xs px-2.5 py-1.5 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200/60 transition-colors"
              >
                {topic.label}
              </button>
            ))}
          </div>

          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Опишите вашу семейную ситуацию подробно. Чем больше деталей, тем точнее будет совет..."
            className="min-h-[120px] resize-none bg-white"
            disabled={loading}
          />

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-400">
              {question.length < 20 ? `Минимум 20 символов (${question.length}/20)` : `${question.length} символов`}
            </span>
            <Button
              onClick={handleSendConsultation}
              disabled={loading || question.trim().length < 20}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Анализирую...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Icon name="Send" size={16} />
                  Получить совет
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card className="border-teal-200/60 bg-white/80 backdrop-blur-sm">
          <CardContent className="py-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center animate-pulse">
              <Icon name="Brain" size={24} className="text-teal-600" />
            </div>
            <p className="text-sm text-gray-500">ИИ-помощник анализирует вашу ситуацию...</p>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </CardContent>
        </Card>
      )}

      {currentResponse && (
        <div ref={responseRef}>
          <Card className="border-teal-300/60 bg-white/90 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-teal-800">
                <Icon name="Sparkles" size={18} className="text-teal-500" />
                Идеи от ИИ-помощника
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              {renderResponseText(currentResponse)}
            </CardContent>
            <div className="px-6 pb-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => { setCurrentResponse(''); setQuestion(''); }}>
                <Icon name="Plus" size={14} className="mr-1" />
                Новый вопрос
              </Button>
              <Button
                size="sm"
                onClick={() => handleShareConsultation(question, currentResponse)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <Icon name="Share2" size={14} className="mr-1" />
                Поделиться
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleCopyConsultation(question, currentResponse)} className="text-gray-500">
                <Icon name="Copy" size={14} className="mr-1" />
                Копировать
              </Button>
            </div>
          </Card>
        </div>
      )}

      {consultationHistory.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Icon name="History" size={14} />
            Последние консультации
          </h3>
          {consultationHistory.slice(0, 5).map((record) => (
            <Card key={record.id} className="border-gray-200/60 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors">
              <CardContent className="py-3 px-4">
                <div
                  className="flex items-start justify-between gap-2 cursor-pointer"
                  onClick={() => {
                    setCurrentResponse(record.answer);
                    setQuestion(record.question);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{record.topic}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{record.question.slice(0, 120)}...</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {formatDate(record.date)}
                  </span>
                </div>
                <div className="flex gap-1.5 mt-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShareConsultation(record.question, record.answer, record.topic); }}
                    className="text-[11px] px-2 py-1 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 flex items-center gap-1 transition-colors"
                  >
                    <Icon name="Share2" size={11} />
                    Поделиться
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyConsultation(record.question, record.answer); }}
                    className="text-[11px] px-2 py-1 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center gap-1 transition-colors"
                  >
                    <Icon name="Copy" size={11} />
                    Копировать
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}