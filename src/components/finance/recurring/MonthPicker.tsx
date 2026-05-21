import { MONTH_NAMES, MONTH_FULL_NAMES } from './recurringUtils';

export default function MonthPicker({ selected, onChange }: { selected: number[]; onChange: (months: number[]) => void }) {
  const toggle = (month: number) => {
    if (selected.includes(month)) {
      onChange(selected.filter(m => m !== month));
    } else {
      onChange([...selected, month].sort((a, b) => a - b));
    }
  };

  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">Месяцы начисления</label>
      <div className="grid grid-cols-6 gap-1">
        {MONTH_NAMES.map((name, i) => {
          const monthNum = i + 1;
          const isSelected = selected.includes(monthNum);
          return (
            <button
              key={monthNum}
              type="button"
              onClick={() => toggle(monthNum)}
              className={`text-xs py-1.5 px-1 rounded-md border transition-all font-medium ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Выбрано: {selected.map(m => MONTH_FULL_NAMES[m - 1]).join(', ')}
        </p>
      )}
    </div>
  );
}
