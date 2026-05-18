import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiQuestion: string;
  setAiQuestion: (v: string) => void;
  aiAdvice: string;
  aiLoading: boolean;
  askAI: (question?: string) => void;
}

const QUICK_QUESTIONS = [
  'Проанализируй мой бюджет',
  'Как гасить кредиты?',
  'Где сократить расходы?',
  'Куда направить свободные деньги?',
];

export default function HubAiDialog({
  open,
  onOpenChange,
  aiQuestion,
  setAiQuestion,
  aiAdvice,
  aiLoading,
  askAI,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="BrainCircuit" size={20} className="text-violet-600" />
            ИИ-финансовый советник
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {QUICK_QUESTIONS.map(q => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => { setAiQuestion(q); askAI(q); }}
              >
                {q}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Задайте вопрос о ваших финансах..."
              value={aiQuestion}
              onChange={e => setAiQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !aiLoading && askAI()}
            />
            <Button
              onClick={() => askAI()}
              disabled={aiLoading}
              className="bg-violet-600 hover:bg-violet-700 flex-shrink-0"
            >
              <Icon name="Send" size={16} />
            </Button>
          </div>

          {aiLoading && (
            <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600" />
              <p className="text-sm text-violet-700">Анализирую ваши финансы...</p>
            </div>
          )}

          {aiAdvice && !aiLoading && (
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Sparkles" size={16} className="text-violet-600" />
                <span className="text-sm font-medium text-violet-800">Рекомендации</span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                {aiAdvice}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
