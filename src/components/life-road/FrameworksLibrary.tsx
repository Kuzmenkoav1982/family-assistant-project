import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FRAMEWORKS, type Framework } from './frameworks';

interface Props {
  onPick?: (fw: Framework) => void;
}

export default function FrameworksLibrary({ onPick }: Props) {
  const [active, setActive] = useState<Framework | null>(FRAMEWORKS[0]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="Library" size={18} className="text-purple-600" />
        <h3 className="font-bold text-gray-800">Библиотека методик</h3>
        <Badge variant="secondary" className="text-[10px]">{FRAMEWORKS.length} техник</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {FRAMEWORKS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActive(f)}
            className={`group text-left p-3 rounded-2xl border-2 transition-all ${
              active?.id === f.id
                ? 'border-purple-500 bg-white shadow-lg'
                : 'border-transparent bg-white/60 hover:bg-white hover:border-purple-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-2`}>
              <Icon name={f.icon} size={18} />
            </div>
            <div className="font-bold text-xs text-gray-800 leading-tight">{f.title}</div>
            <div className="text-[10px] text-gray-500 mt-1 line-clamp-2">{f.short}</div>
          </button>
        ))}
      </div>

      {active && (
        <div className={`rounded-2xl p-5 text-white bg-gradient-to-br ${active.gradient} shadow-lg`}>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <Icon name={active.icon} size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold leading-tight">{active.title}</h4>
              <p className="text-xs opacity-90">{active.short}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed opacity-95 mb-4">{active.description}</p>

          <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 mb-3">
            <div className="text-xs font-bold mb-2 opacity-90">Как применить:</div>
            <ol className="space-y-1.5 text-sm">
              {active.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-start gap-2 text-xs opacity-90 italic">
            <Icon name="Lightbulb" size={14} className="flex-shrink-0 mt-0.5" />
            <span>{active.hint}</span>
          </div>

          {onPick && (
            <Button
              onClick={() => onPick(active)}
              variant="secondary"
              size="sm"
              className="mt-4 bg-white text-gray-900 hover:bg-white/90"
            >
              <Icon name="Plus" size={14} className="mr-1.5" />
              Создать цель по этой методике
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
