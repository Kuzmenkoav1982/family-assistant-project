import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';

export default function SlideCSI14ProductMap() {
  return (
    <CsiSlideFrame
      id="csi-14"
      eyebrow="Приложение 3 · Что уже работает"
      title="Три инструмента — единая семейная память"
      subtitle="Как уже работающие функции «Нашей Семьи» связывают человека, воспоминание и событие"
      tone="accent"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1.2fr_auto_1fr] items-center gap-3">
        {/* Семейное древо */}
        <div className="bg-white/70 border border-amber-900/10 rounded-2xl p-5 text-center flex flex-col items-center h-full">
          <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <Icon name="GitBranch" size={22} />
          </div>
          <div className="text-sm font-semibold text-stone-900 mb-1">Семейное древо</div>
          <div className="text-xs text-stone-600 leading-relaxed mb-2">
            Люди · поколения · родственные связи
          </div>
          <div className="text-[11px] text-stone-500 leading-relaxed mt-auto pt-2 border-t border-stone-200 w-full">
            Кто входит в семью и как люди связаны?
          </div>
        </div>

        <div className="flex md:flex-col items-center justify-center gap-1 text-amber-700">
          <Icon name="ArrowRight" size={18} className="hidden md:block" />
          <Icon name="ArrowDown" size={18} className="md:hidden mx-auto" />
          <span className="text-[10px] text-stone-500 text-center leading-tight max-w-[90px]">
            Фото или воспоминание привязывается к человеку
          </span>
        </div>

        {/* Альбом поколений — центр */}
        <div className="bg-white border-2 border-amber-800/25 rounded-2xl p-6 text-center flex flex-col items-center shadow-md h-full relative">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-wider text-white bg-amber-800 rounded-full px-3 py-0.5">
            Центр
          </span>
          <div className="w-12 h-12 rounded-full bg-amber-800 text-white flex items-center justify-center mb-3 mt-1">
            <Icon name="Images" size={24} />
          </div>
          <div className="text-base font-semibold text-stone-900 mb-1">Альбом поколений</div>
          <div className="text-xs text-stone-600 leading-relaxed mb-2">
            Фотографии · воспоминания · семейные истории
          </div>
          <div className="text-[11px] text-stone-500 leading-relaxed mt-auto pt-2 border-t border-stone-200 w-full">
            Материал можно связать с человеком и событием
          </div>
        </div>

        <div className="flex md:flex-col items-center justify-center gap-1 text-amber-700">
          <Icon name="ArrowRight" size={18} className="hidden md:block" />
          <Icon name="ArrowDown" size={18} className="md:hidden mx-auto" />
          <span className="text-[10px] text-stone-500 text-center leading-tight max-w-[90px]">
            Воспоминание привязывается к событию
          </span>
        </div>

        {/* Мастерская жизни */}
        <div className="bg-white/70 border border-amber-900/10 rounded-2xl p-5 text-center flex flex-col items-center h-full">
          <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <Icon name="Route" size={22} />
          </div>
          <div className="text-sm font-semibold text-stone-900 mb-1">Мастерская жизни</div>
          <div className="text-xs text-stone-600 leading-relaxed mb-2">
            События · даты · семейная хронология
          </div>
          <div className="text-[11px] text-stone-500 leading-relaxed mt-auto pt-2 border-t border-stone-200 w-full">
            Когда и как происходили важные события?
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white/60 border border-amber-900/10 rounded-xl px-5 py-4">
        <div className="text-xs font-medium uppercase tracking-wider text-amber-800 mb-2">
          Пример
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-800">
          <span className="bg-amber-50 border border-amber-800/15 rounded-full px-3 py-1">
            Фотография бабушки хранится в Альбоме поколений
          </span>
          <Icon name="ArrowRight" size={14} className="text-amber-700 shrink-0" />
          <span className="bg-amber-50 border border-amber-800/15 rounded-full px-3 py-1">
            связана с её карточкой в Семейном древе
          </span>
          <Icon name="ArrowRight" size={14} className="text-amber-700 shrink-0" />
          <span className="bg-amber-50 border border-amber-800/15 rounded-full px-3 py-1">
            привязана к событию в Мастерской жизни
          </span>
        </div>
      </div>

      <div className="mt-4 bg-stone-900 text-amber-50 rounded-xl px-5 py-4 text-sm sm:text-base leading-relaxed">
        Один семейный материал связывает человека, родственные отношения,
        событие и время. Модули работают в одном семейном пространстве, а
        воспоминания из Альбома поколений связывают людей из Древа с
        событиями Мастерской жизни.
      </div>
    </CsiSlideFrame>
  );
}
