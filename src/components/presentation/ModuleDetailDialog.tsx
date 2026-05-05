import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { ModuleDetail, ModuleStatus } from './moduleData';

interface Props {
  module: ModuleDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_LABEL: Record<ModuleStatus, { label: string; color: string; icon: string }> = {
  live: { label: 'Уже работает', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: 'CheckCircle2' },
  dev: { label: 'В разработке', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: 'Loader' },
  planned: { label: 'План по 615-р', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: 'Sparkles' },
};

const AUDIENCE_LABEL: Record<string, { label: string; color: string }> = {
  B2C: { label: 'B2C · семьи', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  B2G: { label: 'B2G · регионы', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  B2B2C: { label: 'B2B2C · работодатели', color: 'bg-amber-100 text-amber-800 border-amber-300' },
};

export function ModuleDetailDialog({ module, open, onOpenChange }: Props) {
  if (!module) return null;

  const status = STATUS_LABEL[module.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-2.5 flex-shrink-0">
              <Icon name={module.icon} size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg leading-tight">{module.name}</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">{module.shortDesc}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          {/* Статус и аудитория */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className={`${status.color} gap-1 text-[10px]`}>
              <Icon name={status.icon} size={10} />
              {status.label}
            </Badge>
            {module.audience.map((a) => (
              <Badge key={a} variant="outline" className={`${AUDIENCE_LABEL[a].color} text-[10px]`}>
                {AUDIENCE_LABEL[a].label}
              </Badge>
            ))}
          </div>

          {/* Описание */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Icon name="Info" size={12} />
              Что это
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">{module.fullDesc}</p>
          </div>

          {/* Цитата из Стратегии */}
          {module.citation && (
            <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-500">
              <p className="text-xs font-bold text-purple-900 mb-1.5 flex items-center gap-1.5">
                <Icon name="Quote" size={12} />
                Прямая цитата из Стратегии 615-р
              </p>
              <p className="text-xs text-purple-900 italic leading-relaxed">«{module.citation.text}»</p>
              <p className="text-[10px] text-purple-700 mt-1.5">— раздел {module.citation.section}</p>
            </div>
          )}

          {/* KPI Стратегии */}
          {module.kpi && module.kpi.length > 0 && (
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <p className="text-xs font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
                <Icon name="Target" size={12} />
                KPI Стратегии до 2036, к которым приближаем
              </p>
              <ul className="space-y-1">
                {module.kpi.map((k, i) => (
                  <li key={i} className="text-xs text-emerald-900 flex items-start gap-1.5">
                    <Icon name="CheckCircle2" size={11} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Тайминг */}
          {module.timeline && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 flex items-start gap-2">
              <Icon name="Calendar" size={14} className="text-amber-700 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">Когда</p>
                <p className="text-xs text-amber-900 mt-0.5">{module.timeline}</p>
              </div>
            </div>
          )}

          {/* Disclaimer для planned */}
          {module.status === 'planned' && (
            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
              <p className="text-[10px] text-gray-600 leading-relaxed">
                <Icon name="Info" size={10} className="inline mr-1" />
                Модуль не реализуется от имени государства. «Наша Семья» — независимый цифровой
                сервис, который помогает семье применять меры поддержки в реальной жизни.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ModuleDetailDialog;
