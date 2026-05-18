import Icon from '@/components/ui/icon';
import type { DevLayer } from './types';

interface Props {
  layer: DevLayer;
}

export default function LayerDescription({ layer }: Props) {
  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-900 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
          <Icon name={layer.icon} size={18} className="text-violet-600" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
              {layer.fullTitle}
            </h3>
            <span className="text-[10px] font-bold text-violet-700 bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 px-1.5 py-0.5 rounded-full">
              {layer.badge}
            </span>
          </div>
          <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">
            {layer.description}
          </p>
        </div>
      </div>
    </div>
  );
}
