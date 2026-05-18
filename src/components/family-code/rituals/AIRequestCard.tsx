import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Props {
  situation: string;
  setSituation: (v: string) => void;
  aiLoading: boolean;
  onAnalyze: () => void;
}

export default function AIRequestCard({ situation, setSituation, aiLoading, onAnalyze }: Props) {
  return (
    <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-1.5 rounded-lg">
            <Icon name="Brain" size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Спросить Домового</h3>
            <p className="text-[10px] text-gray-500">Опишите ситуацию — ИИ проанализирует с учётом нумерологии обоих (5 ₽)</p>
          </div>
        </div>
        <Textarea
          placeholder="Опишите конфликтную ситуацию... Например: «Не можем договориться о том, куда поехать в отпуск» или «Ссоримся из-за распределения домашних обязанностей»"
          value={situation}
          onChange={e => setSituation(e.target.value)}
          className="text-sm bg-white/80 border-violet-200 focus:border-violet-400 min-h-[80px] resize-none"
        />
        <button
          onClick={onAnalyze}
          disabled={!situation.trim() || aiLoading}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {aiLoading ? (
            <><Icon name="Loader2" size={16} className="animate-spin" /> Анализирую...</>
          ) : (
            <><Icon name="Sparkles" size={16} /> Получить ИИ-анализ</>
          )}
        </button>
      </CardContent>
    </Card>
  );
}
