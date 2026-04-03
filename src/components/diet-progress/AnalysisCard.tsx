import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { AnalysisData } from '@/data/dietProgressTypes';

interface AnalysisCardProps {
  analysis: AnalysisData | null;
  loadingAnalysis: boolean;
  adjusting: boolean;
  onAnalyze: () => void;
  onAdjust: () => void;
  onHide: () => void;
}

export default function AnalysisCard({ analysis, loadingAnalysis, adjusting, onAnalyze, onAdjust, onHide }: AnalysisCardProps) {
  return (
    <Card className={`border-2 ${
      analysis?.recommendation === 'ease' ? 'border-amber-300 bg-amber-50/50' :
      analysis?.recommendation === 'intensify' ? 'border-blue-300 bg-blue-50/50' :
      analysis ? 'border-green-300 bg-green-50/50' : 'border-violet-200'
    }`}>
      <CardContent className="p-4">
        {!analysis ? (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Icon name="Activity" size={16} className="text-violet-600" />
                Анализ прогресса
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Проверю темп и подскажу, нужна ли корректировка
              </p>
            </div>
            <Button size="sm" onClick={onAnalyze} disabled={loadingAnalysis} className="bg-violet-600">
              {loadingAnalysis ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Icon name="BarChart3" size={14} className="mr-1" />
                  Анализ
                </>
              )}
            </Button>
          </div>
        ) : !analysis.has_analysis ? (
          <p className="text-sm text-muted-foreground text-center py-2">{analysis.reason || 'Недостаточно данных'}</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon
                name={analysis.recommendation === 'ease' ? 'TrendingDown' : analysis.recommendation === 'intensify' ? 'TrendingUp' : 'Check'}
                size={20}
                className={analysis.recommendation === 'ease' ? 'text-amber-600' : analysis.recommendation === 'intensify' ? 'text-blue-600' : 'text-green-600'}
              />
              <h3 className="font-bold text-sm">{analysis.reason}</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white/80">
                <div className="text-sm font-bold">{analysis.actual_loss_kg} кг</div>
                <div className="text-[10px] text-muted-foreground">фактически</div>
              </div>
              <div className="p-2 rounded-lg bg-white/80">
                <div className="text-sm font-bold">{analysis.expected_loss_kg} кг</div>
                <div className="text-[10px] text-muted-foreground">ожидалось</div>
              </div>
              <div className="p-2 rounded-lg bg-white/80">
                <div className="text-sm font-bold">{analysis.weekly_loss_kg} кг</div>
                <div className="text-[10px] text-muted-foreground">в неделю</div>
              </div>
            </div>
            <p className="text-sm">{analysis.advice}</p>
            {analysis.cal_adjustment !== 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/80 border">
                <div>
                  <p className="text-xs text-muted-foreground">Калории: {analysis.current_calories} kcal</p>
                  <p className="text-sm font-bold">
                    {analysis.cal_adjustment > 0 ? '+' : ''}{analysis.cal_adjustment} kcal = {analysis.new_calories} kcal/день
                  </p>
                </div>
                <Button size="sm" onClick={onAdjust} disabled={adjusting}
                  className={analysis.recommendation === 'ease' ? 'bg-amber-600' : 'bg-blue-600'}>
                  {adjusting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Применить'}
                </Button>
              </div>
            )}
            <Button size="sm" variant="ghost" className="w-full text-xs" onClick={onHide}>Скрыть</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
