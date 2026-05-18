import Icon from '@/components/ui/icon';
import { LAYER_TAB_ACCENT } from './layers';
import type { DevLayer, LayerId } from './types';

interface Props {
  layers: DevLayer[];
  activeLayer: LayerId;
  onChange: (id: LayerId) => void;
}

export default function LayerTabs({ layers, activeLayer, onChange }: Props) {
  return (
    <div>
      <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
        Слои развития
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {layers.map(layer => {
          const a = LAYER_TAB_ACCENT[layer.accent];
          const isActive = layer.id === activeLayer;
          return (
            <button
              key={layer.id}
              onClick={() => onChange(layer.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-semibold text-sm whitespace-nowrap transition-all ${isActive ? a.active : a.inactive}`}
            >
              <Icon name={layer.icon} size={15} />
              <span>{layer.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
