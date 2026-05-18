import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { ReconciliationScenario } from '@/lib/reconciliation';
import { DIFF_COLORS, DIFF_LABELS } from './types';

export default function ScenarioCard({ scenario }: { scenario: ReconciliationScenario }) {
  const [open, setOpen] = useState(false);
  return (
    <Card
      className="hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-purple-200"
      onClick={() => setOpen(!open)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{scenario.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900 text-sm">{scenario.title}</h4>
              <Badge className={`text-[10px] ${DIFF_COLORS[scenario.difficulty]}`}>{DIFF_LABELS[scenario.difficulty]}</Badge>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{scenario.description}</p>
            <p className="text-[10px] text-purple-600 mt-1">{scenario.basedOn}</p>
          </div>
          <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-gray-400 mt-1" />
        </div>
        {open && (
          <div className="mt-3 pt-3 border-t space-y-2 animate-in fade-in duration-200">
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <Icon name="ListOrdered" size={12} /> Пошаговый план:
            </p>
            <ol className="space-y-1.5 pl-4">
              {scenario.steps.map((step, i) => (
                <li key={i} className="text-xs text-gray-600 leading-relaxed list-decimal">{step}</li>
              ))}
            </ol>
            <div className="flex items-center gap-1.5 bg-purple-50 rounded-lg p-2 mt-2">
              <Icon name="Clock" size={12} className="text-purple-600 flex-shrink-0" />
              <p className="text-[11px] text-purple-700">{scenario.timing}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
