import Icon from '@/components/ui/icon';

export function PresentationTitleSlide() {
  return (
    <div data-pdf-slide className="text-center mb-16 pt-4">
      <div className="inline-block mb-3 px-4 py-1.5 bg-emerald-100 rounded-full">
        <span className="text-emerald-700 text-sm font-medium">Десятилетие семьи 2024–2034</span>
      </div>
      <div className="flex justify-center mb-6">
        <img 
          src="https://cdn.poehali.dev/files/Логотип Наша Семья.JPG" 
          alt="Наша семья"
          className="h-36 w-36 object-contain rounded-2xl shadow-lg"
        />
      </div>
      <h1 className="text-5xl font-bold mb-3 text-slate-800 tracking-tight">
        Наша семья
      </h1>
      <p className="text-xl text-slate-500 mb-2">
        Цифровая платформа управления семейной жизнью
      </p>
      <p className="text-2xl font-semibold text-emerald-700 mb-6">
        Объединяем семьи. Укрепляем общество.
      </p>
      <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-500">
        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
          <Icon name="Globe" size={14} className="text-slate-400" />
          nasha-semiya.ru
        </span>
        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
          <Icon name="Building2" size={14} className="text-slate-400" />
          ИП Кузьменко А.В.
        </span>
      </div>
    </div>
  );
}