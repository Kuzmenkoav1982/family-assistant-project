import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { DestinyMatrix, TarotCard } from '@/types/family-code.types';

interface TarotMatrixProps {
  matrix: DestinyMatrix;
}

const CARD_POSITIONS = [
  { key: 'personalityCard' as const, label: 'Личность', sublabel: 'Кто вы для мира', icon: 'User', color: 'from-violet-500 to-purple-600' },
  { key: 'soulCard' as const, label: 'Душа', sublabel: 'Чего хочет душа', icon: 'Heart', color: 'from-rose-500 to-pink-600' },
  { key: 'karmaCard' as const, label: 'Карма', sublabel: 'Кармический урок', icon: 'RotateCcw', color: 'from-amber-500 to-orange-600' },
  { key: 'destinyCard' as const, label: 'Предназначение', sublabel: 'Куда идёте', icon: 'Compass', color: 'from-emerald-500 to-teal-600' },
];

function TarotCardDisplay({ card, position, isSelected, onSelect }: {
  card: TarotCard;
  position: typeof CARD_POSITIONS[number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 p-3 transition-all hover:scale-[1.03] ${
        isSelected
          ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200'
          : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-2 mb-1">
        <div className={`bg-gradient-to-br ${position.color} w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow`}>
          <Icon name={position.icon} size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-500 leading-tight">{position.label}</p>
          <p className="text-xs font-bold text-gray-900 leading-snug break-words">{card.name}</p>
        </div>
        <span className="text-xl flex-shrink-0">{card.emoji}</span>
      </div>
      <p className="text-[10px] text-gray-400">{position.sublabel}</p>
    </button>
  );
}

export default function TarotMatrix({ matrix }: TarotMatrixProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selectedPosition = CARD_POSITIONS.find(p => p.key === selectedKey);
  const selectedCard: TarotCard | null = selectedKey
    ? matrix[selectedKey as keyof DestinyMatrix] as TarotCard
    : null;

  return (
    <Card className="border-2 border-purple-200 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-amber-500 via-red-500 to-purple-500" />
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Icon name="Wand2" size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Матрица Судьбы</h3>
            <p className="text-xs text-gray-500">Арканы Таро по дате рождения</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {CARD_POSITIONS.map(pos => (
            <TarotCardDisplay
              key={pos.key}
              card={matrix[pos.key] as TarotCard}
              position={pos}
              isSelected={selectedKey === pos.key}
              onSelect={() => setSelectedKey(selectedKey === pos.key ? null : pos.key)}
            />
          ))}
        </div>

        {selectedCard && selectedPosition && (
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{selectedCard.emoji}</span>
              <div>
                <h4 className="text-sm font-bold text-purple-900">
                  {selectedCard.number}. {selectedCard.name}
                </h4>
                <p className="text-[10px] text-purple-600">{selectedPosition.label} — {selectedPosition.sublabel}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedCard.keywords.map(k => (
                <Badge key={k} variant="outline" className="text-[10px] border-purple-200 text-purple-700 bg-white">
                  {k}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-purple-800 leading-relaxed mb-2">{selectedCard.meaning}</p>
            <div className="flex items-start gap-1.5 bg-white/60 rounded-lg p-2">
              <Icon name="Lightbulb" size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-amber-800 leading-relaxed">{selectedCard.advice}</p>
            </div>
          </div>
        )}

        {!selectedKey && (
          <p className="text-xs text-center text-gray-400">Нажмите на карту для расшифровки</p>
        )}

        <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
            <Icon name="Scroll" size={12} /> Миссия жизни
          </p>
          <p className="text-xs text-amber-700 leading-relaxed">{matrix.mission}</p>
        </div>
      </CardContent>
    </Card>
  );
}