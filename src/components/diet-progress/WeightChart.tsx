import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface WeightChartProps {
  weightChartData: { weight: number; date: string }[];
  targetWeight: number | null;
  minW: number;
  maxW: number;
  range: number;
  showWeightForm: boolean;
  newWeight: string;
  setNewWeight: (v: string) => void;
  wellbeing: string;
  setWellbeing: (v: string) => void;
  savingWeight: boolean;
  onLogWeight: () => void;
  onShowForm: () => void;
  onHideForm: () => void;
}

export default function WeightChart({
  weightChartData, targetWeight, minW, range,
  showWeightForm, newWeight, setNewWeight,
  wellbeing, setWellbeing, savingWeight,
  onLogWeight, onShowForm, onHideForm,
}: WeightChartProps) {
  const chartWidth = Math.max(weightChartData.length * 70, 200);

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <Icon name="TrendingDown" size={18} className="text-green-600" />
              График веса
            </h3>
            <Button size="sm" variant="outline" onClick={onShowForm}>
              <Icon name="Plus" size={14} className="mr-1" />
              Записать вес
            </Button>
          </div>
          {weightChartData.length < 2 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Icon name="BarChart3" size={32} className="mx-auto mb-2 opacity-30" />
              Нужно минимум 2 записи для графика
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4">
              <div style={{ minWidth: chartWidth }} className="relative h-44">
                <svg viewBox={`0 0 ${chartWidth} 176`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="weightLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgb(139, 92, 246)" />
                      <stop offset="100%" stopColor="rgb(124, 58, 237)" />
                    </linearGradient>
                  </defs>
                  {targetWeight && (
                    <>
                      <line x1="0" y1={140 - ((targetWeight - minW) / range) * 110} x2={chartWidth} y2={140 - ((targetWeight - minW) / range) * 110} stroke="rgb(34, 197, 94)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.7" />
                      <text x={chartWidth - 5} y={140 - ((targetWeight - minW) / range) * 110 - 6} textAnchor="end" fontSize="10" fontWeight="500" fill="rgb(22, 163, 74)">
                        Цель: {targetWeight} кг
                      </text>
                    </>
                  )}
                  <polyline fill="none" stroke="url(#weightLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    points={weightChartData.map((d, i) => `${i * 70 + 35},${140 - ((d.weight - minW) / range) * 110}`).join(' ')} />
                  {weightChartData.map((d, i) => {
                    const cx = i * 70 + 35;
                    const cy = 140 - ((d.weight - minW) / range) * 110;
                    return (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r="6" fill="white" stroke="rgb(124, 58, 237)" strokeWidth="2.5" />
                        <circle cx={cx} cy={cy} r="2.5" fill="rgb(124, 58, 237)" />
                        <text x={cx} y={cy - 14} textAnchor="middle" fontSize="12" fontWeight="600" fill="#4b5563">{d.weight}</text>
                        <text x={cx} y={168} textAnchor="middle" fontSize="11" fill="#9ca3af">{d.date}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showWeightForm && (
        <Card className="border-violet-300 bg-violet-50/50">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold flex items-center gap-2">
              <Icon name="Scale" size={18} className="text-violet-600" />
              Записать вес
            </h3>
            <div>
              <Label>Вес (кг)</Label>
              <Input type="number" step="0.1" placeholder="75.5" value={newWeight} onChange={e => setNewWeight(e.target.value)} />
            </div>
            <div>
              <Label>Самочувствие (необязательно)</Label>
              <Textarea placeholder="Как себя чувствуете?" value={wellbeing} onChange={e => setWellbeing(e.target.value)} rows={2} />
            </div>
            <div className="flex gap-2">
              <Button onClick={onLogWeight} disabled={!newWeight || savingWeight} className="bg-violet-600">
                {savingWeight ? 'Сохраняю...' : 'Сохранить'}
              </Button>
              <Button variant="outline" onClick={onHideForm}>Отмена</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
