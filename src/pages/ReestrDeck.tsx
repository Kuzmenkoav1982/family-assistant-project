import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PresentationHeader } from '@/components/presentation/PresentationHeader';
import HubReturnLink from '@/components/strategy-shared/HubReturnLink';
import SlideFrame from '@/components/strategy-v21/SlideFrame';

async function captureSlides(
  onProgress: (msg: string) => void
): Promise<{ canvases: HTMLCanvasElement[]; count: number } | null> {
  const container = document.getElementById('reestr-deck-content');
  if (!container) return null;

  container.classList.add('printing');
  await new Promise((resolve) => setTimeout(resolve, 400));

  const slides = container.querySelectorAll('[data-pdf-slide]');
  if (slides.length === 0) {
    container.classList.remove('printing');
    return null;
  }

  const renderWidth = 1200;
  const canvases: HTMLCanvasElement[] = [];

  for (let i = 0; i < slides.length; i++) {
    onProgress(`Обработка ${i + 1} из ${slides.length}...`);
    const slide = slides[i] as HTMLElement;
    const canvas = await html2canvas(slide, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: renderWidth,
      imageTimeout: 0,
      removeContainer: true,
    });
    canvases.push(canvas);
  }

  container.classList.remove('printing');
  return { canvases, count: slides.length };
}

export default function ReestrDeck() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [isPptxDownloading, setIsPptxDownloading] = useState(false);
  const [pptxProgress, setPptxProgress] = useState('');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const downloadPDF = async () => {
    setIsDownloading(true);
    const loadingId = toast.loading('Готовлю PDF...');
    try {
      const result = await captureSlides((msg) => {
        setDownloadProgress(msg);
        toast.loading(msg, { id: loadingId });
      });
      if (!result) {
        toast.error('Не удалось найти разделы для PDF', { id: loadingId });
        return;
      }

      toast.loading('Формирую PDF...', { id: loadingId });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      for (let i = 0; i < result.canvases.length; i++) {
        const canvas = result.canvases[i];
        const imgAspect = canvas.width / canvas.height;
        let imgW = contentWidth;
        let imgH = imgW / imgAspect;

        if (imgH > contentHeight) {
          imgH = contentHeight;
          imgW = imgH * imgAspect;
        }

        const x = margin + (contentWidth - imgW) / 2;
        const y = margin + (contentHeight - imgH) / 2;

        if (i > 0) pdf.addPage();

        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          x,
          y,
          imgW,
          imgH,
          `slide-${i}`,
          'FAST'
        );

        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);
        pdf.text(`${i + 1} / ${result.count}`, pageWidth / 2, pageHeight - 5, {
          align: 'center',
        });
      }

      pdf.save('Наша-Семья-Комплект-для-Реестра-РПО.pdf');
      toast.success('PDF готов!', { id: loadingId });
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast.error(`Не удалось создать PDF: ${msg}`, { id: loadingId });
    } finally {
      setIsDownloading(false);
      setDownloadProgress('');
    }
  };

  const downloadPPTX = async () => {
    setIsPptxDownloading(true);
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const result = await captureSlides(setPptxProgress);
      if (!result) return;

      setPptxProgress('Формирую PPTX...');
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'Наша Семья';
      pptx.company = 'ИП Кузьменко А.В.';
      pptx.subject = 'Комплект материалов для Реестра российского ПО';
      pptx.title = 'Наша Семья — Комплект для Реестра РПО';

      const slideW = 10;
      const slideH = 5.625;
      const padding = 0.3;
      const maxW = slideW - padding * 2;
      const maxH = slideH - padding * 2;

      for (let i = 0; i < result.canvases.length; i++) {
        const canvas = result.canvases[i];
        const imgData = canvas.toDataURL('image/png');
        const imgAspect = canvas.width / canvas.height;
        let w = maxW;
        let h = w / imgAspect;
        if (h > maxH) {
          h = maxH;
          w = h * imgAspect;
        }
        const x = (slideW - w) / 2;
        const y = (slideH - h) / 2;
        const slide = pptx.addSlide();
        slide.background = { fill: 'FFFFFF' };
        slide.addImage({ data: imgData, x, y, w, h });
        slide.addText(`${i + 1} / ${result.count}`, {
          x: 0,
          y: slideH - 0.35,
          w: slideW,
          h: 0.3,
          align: 'center',
          fontSize: 9,
          color: 'B4B4B4',
        });
      }

      await pptx.writeFile({ fileName: 'Наша-Семья-Комплект-для-Реестра-РПО.pptx' });
      toast.success('PPTX готов!');
    } catch (error) {
      console.error('Ошибка при создании PPTX:', error);
      toast.error('Не удалось создать PPTX');
    } finally {
      setIsPptxDownloading(false);
      setPptxProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PresentationHeader
        onDownloadPDF={downloadPDF}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
        onDownloadPPTX={downloadPPTX}
        isPptxDownloading={isPptxDownloading}
        pptxProgress={pptxProgress}
      />

      <HubReturnLink variant="corner" topOffset="4rem" />

      <style>{`
        .printing [data-pdf-slide] {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
      `}</style>

      <div
        id="reestr-deck-content"
        className="max-w-5xl mx-auto px-3 sm:px-6 pt-16 pb-12"
      >
        <header className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-2">
            Служебный материал · для экспертизы Реестра РПО
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
            Комплект документов для Реестра российского ПО
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Заявление №372122 · ПО «Наша Семья» · правообладатель Кузьменко А. В.
          </p>
        </header>

        {/* 1. Ответ эксперту */}
        <SlideFrame
          id="answer"
          eyebrow="1. Ответ эксперту"
          title="Ответ на запрос по заявлению №372122"
          subtitle="Направляется через карточку заявления. Не отказ, а готовность к проверке в безопасном формате."
          tone="accent"
          footnote="Отвечать через карточку заявления, не на адрес noreply."
        >
          <div className="space-y-4 text-sm sm:text-base leading-relaxed">
            <p>
              Подтверждаем готовность обеспечить проверку технологического стека
              серверной части ПО «Наша Семья».
            </p>
            <p>
              ПО предоставляется как интернет-сервис (SaaS) и размещено на
              управляемой платформе poehali.dev. По информации, полученной от
              поддержки платформы (обращение #LL550078), платформа использует
              инфраструктуру Yandex Cloud на территории РФ; адрес ЦОД: Московская
              область, г. Мытищи, ул. Силикатная, д. 19, 141004.
            </p>
            <p>
              Серверная часть реализована по бессерверной (serverless) модели — в
              виде облачных функций, без выделенного сервера с прямым
              административным доступом к хостовой ОС и контейнерам. Формат
              низкоуровневого доступа (SSH / VPN / RDP) зависит от возможностей
              платформы размещения.
            </p>
            <div>
              <div className="font-semibold text-slate-900 mb-2">
                Готовы обеспечить проверку способами:
              </div>
              <ul className="space-y-1.5 list-disc pl-5 text-slate-700">
                <li>совместная онлайн-демонстрация серверной части (архитектура, БД, хранилище, конфигурация, журналы);</li>
                <li>техническая документация по архитектуре (в дополнение к ТХ.pdf);</li>
                <li>подтверждающие материалы по инфраструктуре (переписка с платформой, публичные документы Yandex Cloud, NS-записи домена);</li>
                <li>при технической возможности платформы — временный доступ к тестовому контуру без персональных данных.</li>
              </ul>
            </div>
          </div>
        </SlideFrame>

        {/* 2. Схема архитектуры */}
        <SlideFrame
          id="architecture"
          eyebrow="2. Схема архитектуры"
          title="Техническая архитектура ПО «Наша Семья»"
          subtitle="Модель распространения — SaaS. Архитектурный подход — управляемая облачная среда (serverless)."
          tone="default"
        >
          <div className="flex flex-col items-center gap-1 text-center text-sm sm:text-base font-medium">
            <Box>Пользователи</Box>
            <Arrow />
            <Box>Веб-браузер</Box>
            <Arrow />
            <Box color="blue">Frontend · React + TypeScript + Vite</Box>
            <Arrow label="HTTPS" />
            <Box color="grey">Управляемая облачная среда · poehali.dev</Box>
            <Arrow />
            <Box color="orange">Серверная часть · Python, облачные функции (serverless)</Box>
            <Arrow />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full mt-1">
              <Box color="green">PostgreSQL · структурированные данные</Box>
              <div className="flex flex-col items-center gap-1">
                <Box>S3-совместимое объектное хранилище</Box>
                <div className="text-slate-400 text-xs">┆ при необходимости для части файлов</div>
                <Box small>Yandex Object Storage</Box>
              </div>
            </div>
          </div>
        </SlideFrame>

        {/* 3. Пояснительная записка */}
        <SlideFrame
          id="note"
          eyebrow="3. Пояснительная записка"
          title="Описание технической архитектуры"
          tone="default"
        >
          <div className="space-y-3 text-sm sm:text-base leading-relaxed text-slate-700">
            <p>
              ПО «Наша Семья» предоставляется как интернет-сервис (SaaS).
              Клиентская часть реализована как веб-приложение на React +
              TypeScript.
            </p>
            <p>
              Серверная логика реализована на Python в модели облачных функций
              (serverless) в управляемой облачной среде платформы poehali.dev.
              Хранение структурированных данных осуществляется в PostgreSQL.
            </p>
            <p>
              Хранение файлов пользователей осуществляется в S3-совместимом
              объектном хранилище; при необходимости для части файлов может
              использоваться Yandex Object Storage.
            </p>
            <p>
              Низкоуровневый доступ к инфраструктуре предоставляется в объёме,
              доступном пользователю управляемой платформы размещения.
            </p>
          </div>
        </SlideFrame>

        {/* 4. Технологический стек */}
        <SlideFrame
          id="stack"
          eyebrow="4. Технологический стек"
          title="Компоненты серверной части"
          tone="default"
        >
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {[
                  ['Клиентская часть', 'Веб-приложение (SPA), React + TypeScript, сборка Vite'],
                  ['Серверная часть', 'Python, модель исполнения — облачные функции (serverless)'],
                  ['База данных', 'PostgreSQL'],
                  ['Файловое хранилище', 'S3-совместимое объектное хранилище; часть файлов — Yandex Object Storage'],
                  ['Размещение', 'Управляемая облачная среда poehali.dev на инфраструктуре Yandex Cloud (РФ)'],
                  ['Контейнеры (Docker)', 'Правообладателем не используются; контейнерные механизмы платформы — под управлением провайдера'],
                  ['Модель распространения', 'SaaS'],
                ].map(([k, v], i) => (
                  <tr key={i} className="odd:bg-white even:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900 align-top w-1/3">{k}</td>
                    <td className="px-4 py-3 text-slate-700">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SlideFrame>

        {/* 5. Подтверждение размещения */}
        <SlideFrame
          id="hosting"
          eyebrow="5. Подтверждение размещения в РФ"
          title="Инфраструктура и локализация данных"
          tone="default"
          footnote="NS-записи публично проверяются командой: nslookup -type=NS nasha-semiya.ru"
        >
          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700">
            <div>
              <div className="font-semibold text-slate-900 mb-1">Домен правообладателя</div>
              <p>
                nasha-semiya.ru обслуживается серверами имён Yandex Cloud:
                <span className="font-mono text-slate-900"> ns1.yandexcloud.net</span>,
                <span className="font-mono text-slate-900"> ns2.yandexcloud.net</span>.
                Публично проверяемый факт размещения в инфраструктуре Яндекса.
              </p>
            </div>
            <div>
              <div className="font-semibold text-slate-900 mb-1">Подтверждающие материалы</div>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Переписка с платформой размещения (обращение #LL550078): подтверждение Yandex Cloud и адреса ЦОД.</li>
                <li>Публичные документы Yandex Cloud о соответствии 152-ФЗ и локализации в РФ.</li>
                <li>Дата-центр: Московская область, г. Мытищи, ул. Силикатная, д. 19, 141004.</li>
              </ul>
            </div>
          </div>
        </SlideFrame>

        {/* 6. Сценарий демо */}
        <SlideFrame
          id="demo"
          eyebrow="6. Сценарий онлайн-демонстрации"
          title="Проверка серверной части за 10 минут"
          subtitle="Формат: видеозвонок с показом экрана. Без боевых персональных данных."
          tone="accent"
          footnote="На экране не показывать: значения переменных окружения, токены, ключи, DSN, боевые ПДн."
        >
          <div className="overflow-hidden rounded-xl border border-indigo-100">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-indigo-50">
                {[
                  ['0:00–2:00', 'Вступление + схема архитектуры'],
                  ['2:00–3:30', 'Модель размещения: платформа, Yandex Cloud, материалы #LL550078'],
                  ['3:30–5:00', 'Серверная часть: структура backend, точка входа (Python handler)'],
                  ['5:00–6:20', 'PostgreSQL: подключение, структура таблиц, обезличенные данные'],
                  ['6:20–7:20', 'Объектное хранилище: интеграция S3'],
                  ['7:20–8:20', 'Журналы выполнения серверной части'],
                  ['8:20–9:10', 'Ответ на вопрос про SSH / ОС / Docker (эквивалентный формат)'],
                  ['9:10–10:00', 'Завершение + перечень материалов к отправке'],
                ].map(([t, v], i) => (
                  <tr key={i} className="odd:bg-white even:bg-indigo-50/30">
                    <td className="px-4 py-2.5 font-mono text-indigo-700 align-top whitespace-nowrap">{t}</td>
                    <td className="px-4 py-2.5 text-slate-700">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SlideFrame>

        {/* 7. Перечень приложений */}
        <SlideFrame
          id="attachments"
          eyebrow="7. Перечень приложений"
          title="Что прикладывается к ответу"
          tone="dark"
        >
          <ul className="space-y-2 text-sm sm:text-base">
            {[
              'Схема архитектуры + пояснительная записка (настоящий документ)',
              'Скрин / выгрузка переписки с платформой (обращение #LL550078)',
              'Публичные материалы Yandex Cloud (152-ФЗ, локализация в РФ)',
              'Техническое описание архитектуры (ТХ.pdf — уже в заявлении)',
              'NS-записи домена nasha-semiya.ru (дополнительно)',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-300 shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SlideFrame>
      </div>
    </div>
  );
}

function Box({
  children,
  color = 'plain',
  small = false,
}: {
  children: React.ReactNode;
  color?: 'plain' | 'blue' | 'orange' | 'green' | 'grey';
  small?: boolean;
}) {
  const colors: Record<string, string> = {
    plain: 'bg-white border-slate-300 text-slate-800',
    blue: 'bg-blue-50 border-blue-300 text-blue-900',
    orange: 'bg-orange-50 border-orange-300 text-orange-900',
    green: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    grey: 'bg-slate-100 border-slate-300 text-slate-700',
  };
  return (
    <div
      className={`rounded-xl border shadow-sm ${colors[color]} ${
        small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5'
      }`}
    >
      {children}
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="text-slate-400 text-lg">↓</span>
      {label && <span className="text-[10px] text-slate-400 -mt-1">{label}</span>}
    </div>
  );
}
