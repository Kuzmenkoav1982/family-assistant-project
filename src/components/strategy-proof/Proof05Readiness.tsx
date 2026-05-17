import Icon from '@/components/ui/icon';
import ProofSlideFrame from './ProofSlideFrame';

const metrics = [
  { value: '12', label: 'продуктовых хабов' },
  { value: '146', label: 'функциональных модулей' },
  { value: '90', label: 'интеграционных интерфейсов' },
  { value: '151', label: 'таблица в модели данных' },
];

const status = [
  { icon: 'CheckCircle2' as const, text: 'Закрытое тестирование запущено' },
  { icon: 'Layers' as const, text: 'Рабочее ядро платформы' },
  { icon: 'Database' as const, text: 'Структурированная модель данных' },
  { icon: 'Network' as const, text: 'Интеграционный контур' },
  { icon: 'Cpu' as const, text: 'Основа для слоя ИИ и партнёрских сервисов' },
];

export default function Proof05Readiness() {
  return (
    <ProofSlideFrame
      id="proof-5"
      code="Д5"
      title="Что уже собрано"
      subtitle="Это не презентационная гипотеза — это собранный фундамент"
      footnote="Заявка на включение в Реестр российского ПО подана"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 grid grid-cols-2 gap-3 sm:gap-4">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="bg-slate-50 border border-slate-200 rounded-xl p-5"
            >
              <div className="text-4xl sm:text-5xl font-bold text-slate-900 leading-none mb-1 tabular-nums">
                {m.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-600">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-2">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Готовность
          </div>
          <ul className="space-y-2">
            {status.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 border border-slate-200 rounded-lg px-3.5 py-2.5"
              >
                <Icon
                  name={s.icon}
                  size={16}
                  className="text-emerald-600 mt-0.5 shrink-0"
                />
                <span className="text-sm text-slate-800 leading-snug">
                  {s.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ProofSlideFrame>
  );
}
