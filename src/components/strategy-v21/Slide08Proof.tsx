import Icon from '@/components/ui/icon';
import SlideFrame from './SlideFrame';

const metrics = [
  { value: '12', label: 'продуктовых хабов' },
  { value: '146', label: 'функциональных модулей' },
  { value: '90', label: 'интеграционных интерфейсов' },
  { value: '151', label: 'таблица в модели данных' },
];

const readiness = [
  { icon: 'CheckCircle2' as const, text: 'Закрытое тестирование запущено' },
  { icon: 'Layers' as const, text: 'Рабочее ядро платформы' },
  { icon: 'Database' as const, text: 'Структурированная модель данных' },
  { icon: 'Network' as const, text: 'Интеграционный контур' },
  { icon: 'Cpu' as const, text: 'Основа для слоя ИИ и партнёрских сервисов' },
];

export default function Slide08Proof() {
  return (
    <SlideFrame
      id="slide-8"
      eyebrow="Готовность платформы · по состоянию на май 2026"
      title="Ядро платформы уже собрано и является прочной базой для банковского пилота"
      footnote="Заявка на включение в Реестр российского ПО подана"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {metrics.map((m, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 sm:p-6"
              >
                <div className="text-4xl sm:text-5xl font-bold text-indigo-700 mb-1 leading-none">
                  {m.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 leading-snug">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Готовность
          </div>
          <ul className="space-y-2.5">
            {readiness.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3"
              >
                <Icon
                  name={r.icon}
                  size={18}
                  className="text-emerald-600 mt-0.5 shrink-0"
                />
                <span className="text-sm text-slate-800 leading-snug">{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-slate-900 text-white rounded-xl px-5 py-4">
        <p className="text-sm sm:text-base leading-relaxed">
          <span className="text-amber-300 font-semibold">Главное:</span> банк
          разговаривает не с презентационной гипотезой, а с уже собранным
          фундаментом.
        </p>
      </div>
    </SlideFrame>
  );
}
