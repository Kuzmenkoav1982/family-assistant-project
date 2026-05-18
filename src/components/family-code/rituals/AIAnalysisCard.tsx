import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { AIAnalysis } from './types';

function PerceptionBlock({ name, emoji, perspective }: { name: string; emoji: string; perspective: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <h4 className="font-bold text-sm text-gray-900">Как видит {name}</h4>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{perspective}</p>
    </div>
  );
}

export default function AIAnalysisCard({
  analysis,
  m1Name,
  m2Name,
}: {
  analysis: AIAnalysis;
  m1Name: string;
  m2Name: string;
}) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-xl">
          <Icon name="Brain" size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">ИИ-анализ конфликта</h3>
          <p className="text-[11px] text-gray-500">На основе нумерологии и астрологии обоих участников</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PerceptionBlock name={m1Name} emoji="👤" perspective={analysis.member1Perspective} />
        <PerceptionBlock name={m2Name} emoji="👤" perspective={analysis.member2Perspective} />
      </div>

      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Icon name="Lightbulb" size={16} className="text-amber-600" />
            <h4 className="font-bold text-sm text-amber-900">Корень конфликта</h4>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">{analysis.rootCause}</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Icon name="Route" size={16} className="text-emerald-600" />
            <h4 className="font-bold text-sm text-emerald-900">Путь к примирению</h4>
          </div>
          <ol className="space-y-2">
            {analysis.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-emerald-200 text-emerald-800 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-xs text-emerald-800 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="border border-violet-200 bg-violet-50">
          <CardContent className="p-3 flex items-start gap-2">
            <Icon name="Sparkles" size={14} className="text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-violet-700 uppercase tracking-wider mb-1">Мудрость</p>
              <p className="text-xs text-violet-800 leading-relaxed">{analysis.advice}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-sky-200 bg-sky-50">
          <CardContent className="p-3 flex items-start gap-2">
            <Icon name="Clock" size={14} className="text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-sky-700 uppercase tracking-wider mb-1">Лучшее время</p>
              <p className="text-xs text-sky-800 leading-relaxed">{analysis.bestTime}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
