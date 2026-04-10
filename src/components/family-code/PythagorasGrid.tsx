import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { PythagorasSquare, PythagorasCell } from '@/types/family-code.types';

interface PythagorasGridProps {
  square: PythagorasSquare;
}

const LEVEL_COLORS: Record<PythagorasCell['level'], string> = {
  none: 'bg-gray-100 text-gray-400 border-gray-200',
  weak: 'bg-amber-50 text-amber-700 border-amber-200',
  normal: 'bg-blue-50 text-blue-700 border-blue-200',
  strong: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  excessive: 'bg-purple-50 text-purple-700 border-purple-200',
};

const LEVEL_LABELS: Record<PythagorasCell['level'], string> = {
  none: 'Нет',
  weak: 'Слабо',
  normal: 'Норма',
  strong: 'Сильно',
  excessive: 'Избыток',
};

const GRID_ORDER = [1, 4, 7, 2, 5, 8, 3, 6, 9];

export default function PythagorasGrid({ square }: PythagorasGridProps) {
  const [selectedCell, setSelectedCell] = useState<PythagorasCell | null>(null);

  const orderedCells = GRID_ORDER.map(num => square.cells.find(c => c.number === num)!);

  return (
    <Card className="border-2 border-purple-200">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Icon name="Grid3x3" size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Квадрат Пифагора</h3>
            <p className="text-xs text-gray-500">Матрица характера по дате рождения</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {orderedCells.map((cell) => (
            <button
              key={cell.number}
              onClick={() => setSelectedCell(selectedCell?.number === cell.number ? null : cell)}
              className={`rounded-xl border-2 p-3 text-center transition-all hover:scale-105 ${
                LEVEL_COLORS[cell.level]
              } ${selectedCell?.number === cell.number ? 'ring-2 ring-purple-500 ring-offset-1 scale-105' : ''}`}
            >
              <p className="text-lg font-bold leading-none mb-0.5">
                {cell.digits}
              </p>
              <p className="text-[10px] font-medium leading-tight">{cell.title}</p>
              <p className="text-[9px] opacity-60 mt-0.5">{LEVEL_LABELS[cell.level]}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1 mb-4 text-[9px] text-center text-gray-400">
          <span>Столбец 1</span>
          <span>Столбец 2</span>
          <span>Столбец 3</span>
        </div>

        {selectedCell && (
          <div className="mt-2 p-3 bg-purple-50 rounded-xl border border-purple-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-purple-900">
                {selectedCell.title} ({selectedCell.digits})
              </h4>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                selectedCell.level === 'none' ? 'bg-gray-200 text-gray-600' :
                selectedCell.level === 'weak' ? 'bg-amber-200 text-amber-800' :
                selectedCell.level === 'normal' ? 'bg-blue-200 text-blue-800' :
                selectedCell.level === 'strong' ? 'bg-emerald-200 text-emerald-800' :
                'bg-purple-200 text-purple-800'
              }`}>
                {LEVEL_LABELS[selectedCell.level]}
              </span>
            </div>
            <p className="text-xs text-purple-800 leading-relaxed mb-2">{selectedCell.meaning}</p>
            <div className="flex items-start gap-1.5 bg-white/60 rounded-lg p-2">
              <Icon name="Lightbulb" size={12} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-purple-700 leading-relaxed">{selectedCell.advice}</p>
            </div>
          </div>
        )}

        {!selectedCell && (
          <p className="text-xs text-center text-gray-400 mt-2">
            Нажмите на ячейку для расшифровки
          </p>
        )}
      </CardContent>
    </Card>
  );
}
