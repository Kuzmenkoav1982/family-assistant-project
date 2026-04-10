import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { PythagorasLine } from '@/types/family-code.types';

interface PythagorasLinesProps {
  rows: PythagorasLine[];
  columns: PythagorasLine[];
  diagonals: PythagorasLine[];
}

function LineBar({ line }: { line: PythagorasLine }) {
  const maxStrength = 12;
  const pct = Math.min((line.strength / maxStrength) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${line.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          <span className="text-xs font-medium text-gray-800">{line.name}</span>
        </div>
        <span className="text-xs text-gray-500">{line.strength}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            line.isActive ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gray-300'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-500 leading-tight">{line.meaning}</p>
    </div>
  );
}

export default function PythagorasLines({ rows, columns, diagonals }: PythagorasLinesProps) {
  const allLines = [...rows, ...columns, ...diagonals];
  const activeCount = allLines.filter(l => l.isActive).length;

  return (
    <Card className="border-2 border-purple-200">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Icon name="TrendingUp" size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Линии силы</h3>
              <p className="text-xs text-gray-500">Активных: {activeCount} из {allLines.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Строки</p>
            <div className="space-y-3">
              {rows.map(line => <LineBar key={line.name} line={line} />)}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Столбцы</p>
            <div className="space-y-3">
              {columns.map(line => <LineBar key={line.name} line={line} />)}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Диагонали</p>
            <div className="space-y-3">
              {diagonals.map(line => <LineBar key={line.name} line={line} />)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
