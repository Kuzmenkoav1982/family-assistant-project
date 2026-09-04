import Icon from '@/components/ui/icon';
import CsiSlideFrame from './CsiSlideFrame';
import { LEGAL_ENTITY, SOFTWARE_REGISTRY } from '@/lib/legalEntity';

const LOGO_URL =
  'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/c0fcb6ce-d833-4fce-b2d4-26dda0c44c4b.png';

export default function SlideCSI12Contacts() {
  return (
    <CsiSlideFrame
      id="csi-12"
      eyebrow="Контакты и следующий шаг"
      title="Готовы продолжить обсуждение"
      tone="accent"
    >
      <div className="bg-amber-50 border border-amber-800/15 rounded-xl px-5 py-4 mb-6">
        <div className="text-sm font-semibold text-amber-900 mb-1">
          Предлагаемый следующий шаг
        </div>
        <p className="text-sm sm:text-base text-stone-800 leading-relaxed">
          После встречи — коротко зафиксировать интересы Центра, выбрать одну
          программу и подготовить уточнённый сценарий пилота на 1–2 страницы.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-5 items-start bg-white/70 border border-amber-900/10 rounded-xl p-5">
        <img
          src={LOGO_URL}
          alt="Наша Семья"
          className="w-20 h-20"
        />
        <div>
          <div className="text-lg font-bold text-stone-900">Алексей Кузьменко</div>
          <div className="text-sm text-stone-600 mb-3">
            Основатель проекта «Наша Семья»
          </div>
          <div className="space-y-1.5 text-sm text-stone-800">
            <div className="flex items-center gap-2">
              <Icon name="Phone" size={14} className="text-amber-700 shrink-0" />
              <a
                href={`tel:${LEGAL_ENTITY.ownerPhoneHref}`}
                className="hover:underline"
              >
                {LEGAL_ENTITY.ownerPhone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Globe" size={14} className="text-amber-700 shrink-0" />
              <a
                href={LEGAL_ENTITY.siteUrl}
                className="hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {LEGAL_ENTITY.site}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Mail" size={14} className="text-amber-700 shrink-0" />
              <a href={`mailto:${LEGAL_ENTITY.infoEmail}`} className="hover:underline">
                {LEGAL_ENTITY.infoEmail}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="MessageCircle" size={14} className="text-amber-700 shrink-0" />
              <a
                href={LEGAL_ENTITY.maxChannel}
                className="hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Канал в MAX
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white/70 border border-amber-900/10 rounded-xl p-5">
        <div className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Icon name="ShieldCheck" size={16} className="text-amber-700" />
          Технологический и юридический статус
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-white rounded-lg px-3 py-2 border border-stone-100">
            <div className="text-[11px] text-stone-500 mb-0.5">Правообладатель</div>
            <div className="font-medium text-stone-900">{LEGAL_ENTITY.fullName}</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 border border-stone-100">
            <div className="text-[11px] text-stone-500 mb-0.5">ОГРНИП / ИНН</div>
            <div className="font-medium text-stone-900">
              {LEGAL_ENTITY.ogrnip} / {LEGAL_ENTITY.inn}
            </div>
          </div>
          <a
            href={SOFTWARE_REGISTRY.registryUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-lg px-3 py-2 border border-stone-100 sm:col-span-2 hover:border-amber-400 hover:bg-amber-50/50 transition-colors group"
          >
            <div className="text-[11px] text-stone-500 mb-0.5 flex items-center gap-1.5">
              Статус программного обеспечения
              <Icon
                name="ExternalLink"
                size={11}
                className="text-amber-600 group-hover:translate-x-0.5 transition-transform"
              />
            </div>
            <div className="font-medium text-stone-900 leading-relaxed">
              Включено в {SOFTWARE_REGISTRY.registryName} — реестровая запись №{' '}
              {SOFTWARE_REGISTRY.recordNumber} от {SOFTWARE_REGISTRY.recordDate}
              <span className="block text-xs font-normal text-stone-500 mt-0.5">
                Протокол экспертного совета {SOFTWARE_REGISTRY.authority}{' '}
                {SOFTWARE_REGISTRY.protocol}
              </span>
              <span className="block text-xs font-medium text-amber-700 mt-1">
                Открыть карточку записи в реестре →
              </span>
            </div>
          </a>
        </div>
        <p className="text-xs text-stone-500 mt-3 leading-relaxed">
          Российский цифровой продукт, работающий в промышленной эксплуатации.
          Готовы обсуждать отдельный контур обработки данных и предоставить
          юридические и технические документы для официального взаимодействия.
        </p>
      </div>

      <p className="text-xs text-stone-400 mt-5 text-center">
        Рабочая концепция. Партнёрство не согласовано.
      </p>
    </CsiSlideFrame>
  );
}