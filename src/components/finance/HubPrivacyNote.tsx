import Icon from '@/components/ui/icon';

export default function HubPrivacyNote() {
  return (
    <details className="rounded-xl bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent border border-emerald-200/50 group/privacy">
      <summary className="flex items-center gap-3 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Icon name="Shield" size={16} className="text-emerald-600" />
        </div>
        <p className="text-sm font-medium text-emerald-800 flex-1">Безопасность и доступ к данным</p>
        <Icon name="ChevronDown" size={16} className="text-emerald-500 transition-transform group-open/privacy:rotate-180" />
      </summary>
      <div className="px-4 pb-4 pl-[3.75rem] space-y-1.5">
        <p className="text-xs text-emerald-600/80">
          Финансовая информация не передаётся третьим лицам и хранится в зашифрованном виде.
        </p>
        <div className="text-xs text-emerald-700/70 space-y-0.5">
          <p className="font-medium text-emerald-800/80">Доступ только у владельца семьи:</p>
          <p>Бюджет, Счета и карты, Кредиты и долги, Регулярные платежи, Имущество, Аналитика, Стратегия погашения, Прогноз кэшфлоу</p>
          <p className="font-medium text-emerald-800/80 mt-1">Доступ для всех членов семьи:</p>
          <p>Финансовые цели, Грамотность, Скидочные карты, Антимошенник</p>
        </div>
      </div>
    </details>
  );
}
