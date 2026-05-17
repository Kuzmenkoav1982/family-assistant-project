import Icon from '@/components/ui/icon';
import ProofSlideFrame from './ProofSlideFrame';

const checklist = [
  'Семейный контекст и Семейный ID собраны на уровне модели данных',
  '12 продуктовых хабов и 146 функциональных модулей — рабочая основа',
  '90 интеграционных интерфейсов — готовность к встраиванию',
  'Домовой — оркестратор семейного контекста на базе ИИ',
  'Сценарии вокруг банка проработаны как маршрут, а не как баннер',
  'Поэтапное встраивание — от пилота до интеграции в контур',
];

const formats = [
  'Пилот / совместный запуск',
  'Глубокое стратегическое партнёрство',
  'Стратегическая интеграция в контур банка',
];

export default function Proof09Format() {
  return (
    <ProofSlideFrame
      id="proof-9"
      code="Д9"
      title="Готовность к разговору о формате"
      subtitle="Доказательная база собрана. Дальше — выбор уровня вовлечения банка."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Что подтверждено
          </div>
          <ul className="space-y-2">
            {checklist.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-3 border border-slate-200 rounded-lg px-4 py-2.5"
              >
                <Icon
                  name="CheckCircle2"
                  size={18}
                  className="text-emerald-600 mt-0.5 shrink-0"
                />
                <span className="text-sm text-slate-800 leading-snug">{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Возможные форматы
          </div>
          <ul className="space-y-2">
            {formats.map((f, i) => (
              <li
                key={i}
                className="bg-slate-900 text-white rounded-lg px-4 py-3 text-sm font-medium leading-snug"
              >
                {f}
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            Выбор глубины — за банком. Доказательная база равноценно поддерживает
            любой из вариантов.
          </p>
        </div>
      </div>
    </ProofSlideFrame>
  );
}
