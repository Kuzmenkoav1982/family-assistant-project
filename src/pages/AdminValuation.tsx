import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

async function captureSlides(
  onProgress: (msg: string) => void
): Promise<{ canvases: HTMLCanvasElement[]; count: number } | null> {
  const container = document.getElementById('valuation-content');
  if (!container) return null;

  container.classList.add('printing');
  await new Promise(resolve => setTimeout(resolve, 200));

  const slides = container.querySelectorAll('[data-pdf-slide]');
  if (slides.length === 0) {
    container.classList.remove('printing');
    return null;
  }

  const renderWidth = 1200;
  const canvases: HTMLCanvasElement[] = [];

  for (let i = 0; i < slides.length; i++) {
    onProgress(`Обработка слайда ${i + 1} из ${slides.length}...`);
    const slide = slides[i] as HTMLElement;
    const canvas = await html2canvas(slide, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: null,
      windowWidth: renderWidth,
      imageTimeout: 0,
      removeContainer: true,
    });
    canvases.push(canvas);
  }

  container.classList.remove('printing');
  return { canvases, count: slides.length };
}

export default function AdminValuation() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [isPptxDownloading, setIsPptxDownloading] = useState(false);
  const [pptxProgress, setPptxProgress] = useState('');

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const result = await captureSlides(setDownloadProgress);
      if (!result) return;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

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
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, imgW, imgH, `slide-${i}`, 'FAST');

        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);
        pdf.text(`${i + 1} / ${result.count}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }

      pdf.save('Оценка-стоимости-НашаСемья-04052026.pdf');
    } catch (error) {
      console.error('Ошибка PDF:', error);
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
      pptx.author = 'ИП Кузьменко А.В.';
      pptx.company = 'Наша Семья';
      pptx.subject = 'Оценка рыночной стоимости платформы «Наша семья»';
      pptx.title = 'Оценка стоимости — Наша семья — 04.05.2026';

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
          fontSize: 7,
          color: 'B4B4B4',
        });
      }

      await pptx.writeFile({ fileName: 'Оценка-стоимости-НашаСемья-04052026.pptx' });
    } catch (error) {
      console.error('Ошибка PPTX:', error);
    } finally {
      setIsPptxDownloading(false);
      setPptxProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Админ — конфиденциально</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Оценка рыночной стоимости платформы «Наша семья»</h1>
            <p className="text-sm text-slate-500">По состоянию на 4 мая 2026 г.</p>
            {/* n'RIS Certificate */}
            <a
              href="https://nris.ru/deposits/check-certificate/?num=518-830-027"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-3 py-1.5 transition-all"
            >
              <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[8px] font-black leading-none">n</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[9px] text-slate-500 uppercase tracking-wide">Свидетельство о депонировании n'RIS</span>
                <span className="text-blue-700 font-bold text-xs">№ 518-830-027 · 04.03.2026 · РЦИС.РФ</span>
              </div>
              <span className="text-green-600 text-xs font-semibold ml-1 flex items-center gap-1">✓ ИС защищена</span>
            </a>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={downloadPDF}
              disabled={isDownloading}
              size="sm"
              className="gap-2 bg-slate-900 hover:bg-slate-800"
            >
              <Icon name={isDownloading ? 'Loader2' : 'FileDown'} size={16} className={isDownloading ? 'animate-spin' : ''} />
              {isDownloading ? downloadProgress || 'PDF...' : 'PDF'}
            </Button>
            <Button
              onClick={downloadPPTX}
              disabled={isPptxDownloading}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Icon name={isPptxDownloading ? 'Loader2' : 'Presentation'} size={16} className={isPptxDownloading ? 'animate-spin' : ''} />
              {isPptxDownloading ? pptxProgress || 'PPTX...' : 'PowerPoint'}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .printing [data-pdf-slide] {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        @media print { .sticky { display: none !important; } }
      `}</style>

      <div id="valuation-content" className="max-w-5xl mx-auto px-6 py-12 space-y-8">

        {/* СЛАЙД 1 — Титул */}
        <div data-pdf-slide className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-12">
          <div className="flex items-start justify-between mb-8">
            <div className="text-xs font-semibold tracking-[0.2em] text-blue-300 uppercase">Конфиденциально · Только для переговоров</div>
            <div className="text-xs text-slate-400">04.05.2026</div>
          </div>
          <div className="max-w-3xl">
            <div className="text-6xl font-black mb-4 tracking-tight">Наша семья</div>
            <div className="text-2xl font-light text-blue-200 mb-8">Оценка рыночной стоимости платформы</div>
            <div className="h-px bg-blue-700 mb-8" />
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl font-black text-green-400 mb-1">40–60 млн ₽</div>
                <div className="text-sm text-slate-300">Минимальная оценка</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-blue-400/50">
                <div className="text-3xl font-black text-blue-300 mb-1">85–130 млн ₽</div>
                <div className="text-sm text-slate-300">Справедливая оценка</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl font-black text-yellow-400 mb-1">150–250 млн ₽</div>
                <div className="text-sm text-slate-300">Стратегическая сделка</div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-xs text-slate-500">ИП Кузьменко А.В. · Платформа «Наша семья» · nasha-semiya.ru</div>
        </div>

        {/* СЛАЙД 2 — Введение */}
        <div data-pdf-slide className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Методология</div>
          <h2 className="text-3xl font-black text-slate-900 mb-6">Применяемые методы оценки</h2>
          <p className="text-slate-600 mb-8 text-lg leading-relaxed">
            Для оценки <strong>pre-revenue SaaS-платформы</strong> с работающим продуктом в production применяются четыре общепринятых метода. 
            Каждый отражает разный аспект стоимости актива — от технических затрат до стратегической ценности для покупателя.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '01', title: 'Стоимость воспроизведения', desc: 'Сколько стоило бы создать такой продукт с нуля? Нижняя граница стоимости.', color: 'bg-slate-50 border-slate-200' },
              { num: '02', title: 'Метод Беркуса', desc: 'Стандартный венчурный метод для pre-revenue стартапов. Оценка по 6 факторам.', color: 'bg-blue-50 border-blue-200' },
              { num: '03', title: 'Метод венчурного капитала', desc: 'Прогнозная выручка через 3 года с дисконтированием на ставку риска.', color: 'bg-purple-50 border-purple-200' },
              { num: '04', title: 'Стратегическая оценка', desc: 'Премия для банка-покупателя с учётом монополии, ESG, кросс-продаж.', color: 'bg-amber-50 border-amber-200' },
            ].map(m => (
              <div key={m.num} className={`rounded-xl border p-5 ${m.color}`}>
                <div className="text-2xl font-black text-slate-300 mb-2">{m.num}</div>
                <div className="font-bold text-slate-900 mb-2">{m.title}</div>
                <div className="text-sm text-slate-600">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* СЛАЙД 3 — Метод 1 */}
        <div data-pdf-slide className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-black">1</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Метод 1</div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Стоимость воспроизведения</h2>
          <p className="text-slate-500 mb-8">Сколько стоило бы создать такой продукт с нуля? (Cost-to-Duplicate)</p>

          <div className="overflow-hidden rounded-xl border border-slate-200 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-5 py-3 font-semibold text-slate-700">Статья затрат</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-700">Расчёт</th>
                  <th className="text-right px-5 py-3 font-semibold text-slate-700">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Senior Full-stack разработчик', '350 000 ₽/мес × 18 мес', '6 300 000 ₽'],
                  ['Backend/AI разработчик', '300 000 ₽/мес × 18 мес', '5 400 000 ₽'],
                  ['Frontend разработчик', '250 000 ₽/мес × 18 мес', '4 500 000 ₽'],
                  ['UI/UX дизайнер', '200 000 ₽/мес × 12 мес', '2 400 000 ₽'],
                  ['Product Manager', '250 000 ₽/мес × 18 мес', '4 500 000 ₽'],
                  ['QA/тестирование', '180 000 ₽/мес × 12 мес', '2 160 000 ₽'],
                  ['Инфраструктура, API, лицензии', '18 мес', '1 800 000 ₽'],
                  ['Исследования, методология развития детей', '—', '800 000 ₽'],
                ].map(([name, calc, sum], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-5 py-3 text-slate-800">{name}</td>
                    <td className="px-5 py-3 text-slate-500">{calc}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-800">{sum}</td>
                  </tr>
                ))}
                <tr className="bg-slate-900 text-white">
                  <td className="px-5 py-4 font-bold text-lg" colSpan={2}>ИТОГО</td>
                  <td className="px-5 py-4 text-right font-black text-xl">27 860 000 ₽</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400 mb-1">Оценка по методу стоимости воспроизведения</div>
              <div className="text-sm text-slate-300">Нижняя граница — стоимость технологии без учёта рынка и потенциала</div>
            </div>
            <div className="text-4xl font-black text-white">~28 млн ₽</div>
          </div>
        </div>

        {/* СЛАЙД 4 — Метод 2 Беркус */}
        <div data-pdf-slide className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-black">2</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Метод 2</div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Метод Беркуса</h2>
          <p className="text-slate-500 mb-8">Стандартный метод для pre-revenue стартапов. Каждому из 6 факторов присваивается стоимость до 10 млн ₽ (адаптировано для российского рынка 2026 г.)</p>

          <div className="space-y-3 mb-6">
            {[
              { factor: 'Качество идеи и рыночная потребность', score: 9, max: 10, note: 'Гос. приоритет — Стратегия семейной политики РФ до 2036 года, отсутствие конкурентов, TAM 50 млн семей', color: 'bg-green-500' },
              { factor: 'Прототип / работающая технология', score: 10, max: 10, note: 'Полностью функциональный продукт: 86 API-функций, 151 таблица, 90+ экранов, работает в production', color: 'bg-blue-500' },
              { factor: 'Качество команды', score: 5, max: 10, note: 'Соло-основатель с глубокой экспертизой, продукт создан на собственном опыте', color: 'bg-orange-400' },
              { factor: 'Стратегические партнёрства и интеграции', score: 6, max: 10, note: 'Яндекс Алиса, платёжные системы (СБП, Сбер, Т-Банк), Яндекс Карты', color: 'bg-purple-500' },
              { factor: 'Первые пользователи / traction', score: 5, max: 10, note: '88 семей в production, 30K+ аналитических событий, работающие платежи через семейный кошелёк', color: 'bg-teal-500' },
              { factor: 'Интеллектуальная собственность', score: 8, max: 10, note: 'Свидетельство о депонировании n\'RIS №518-830-027 (РЦИС.РФ, 04.03.2026) · Алгоритм оценки развития детей (Выготский + Эльконин) · AI-ассистент «Домовой»', color: 'bg-pink-500' },
            ].map((row, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-slate-900">{row.factor}</div>
                  <div className="text-lg font-black text-slate-800 ml-4 whitespace-nowrap">{row.score} млн ₽</div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${(row.score / row.max) * 100}%` }} />
                </div>
                <div className="text-xs text-slate-500">{row.note}</div>
              </div>
            ))}
          </div>

          <div className="bg-blue-600 text-white rounded-xl p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-200 mb-1">Оценка по методу Беркуса</div>
              <div className="text-sm text-blue-100">Базовая оценка стартапа с учётом всех ключевых факторов · ИС подтверждена свидетельством n'RIS</div>
            </div>
            <div className="text-4xl font-black">~43 млн ₽</div>
          </div>
        </div>

        {/* СЛАЙД 5 — Метод 3 VC */}
        <div data-pdf-slide className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-sm font-black">3</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Метод 3</div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Метод венчурного капитала (VC Method)</h2>
          <p className="text-slate-500 mb-8">Оценка на основе прогнозной выручки через 3 года с дисконтированием на ставку риска early-stage</p>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Прогнозные параметры</h3>
              {[
                { label: 'Прогноз активных платящих семей (год 3)', value: '100 000' },
                { label: 'ARPU (семейный кошелёк pay-per-use)', value: '~280 ₽/мес' },
                { label: 'Прогнозная годовая выручка (год 3)', value: '~336 млн ₽/год' },
                { label: 'Мультипликатор выручки SaaS (рос. рынок)', value: '3–5x' },
              ].map((r, i) => (
                <div key={i} className="bg-purple-50 rounded-lg px-4 py-3 flex justify-between">
                  <span className="text-slate-600 text-sm">{r.label}</span>
                  <span className="font-bold text-purple-800 text-sm ml-4">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Расчёт дисконтирования</h3>
              <div className="bg-purple-50 rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Стоимость компании (год 3)</span>
                  <span className="font-bold text-slate-800">1 008–1 680 млн ₽</span>
                </div>
                <div className="h-px bg-purple-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Ставка дисконтирования (early-stage)</span>
                  <span className="font-bold text-red-600">50% годовых</span>
                </div>
                <div className="h-px bg-purple-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Горизонт дисконтирования</span>
                  <span className="font-bold text-slate-800">3 года</span>
                </div>
                <div className="h-px bg-purple-200" />
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Приведённая стоимость (сегодня)</span>
                  <span className="font-black text-purple-700 text-lg">300–500 млн ₽</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg px-4 py-3 text-xs text-slate-500">
                Формула: PV = FV / (1 + r)³, где FV = 1 008–1 680 млн, r = 0,50
              </div>
            </div>
          </div>

          <div className="bg-purple-700 text-white rounded-xl p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-200 mb-1">Оценка по VC-методу</div>
              <div className="text-sm text-purple-100">Верхняя граница — потолок стоимости при выходе на целевые показатели</div>
            </div>
            <div className="text-4xl font-black">300–500 млн ₽</div>
          </div>
        </div>

        {/* СЛАЙД 6 — Метод 4 Стратегическая */}
        <div data-pdf-slide className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm font-black">4</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Метод 4</div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Стратегическая оценка для банка-покупателя</h2>
          <p className="text-slate-500 mb-8">При покупке банком учитывается стратегическая премия к базовой оценке Беркуса (43 млн ₽)</p>

          <div className="space-y-3 mb-6">
            {[
              { factor: 'Монопольная позиция — единственный продукт в нише', premium: '+30–50%', impact: 'Отсутствие конкурентного давления, высокий барьер входа' },
              { factor: 'Государственная повестка — Стратегия семейной политики РФ до 2036', premium: '+20–30%', impact: 'ESG-актив, репутационный капитал, доступ к грантам' },
              { factor: 'Готовая платформа кросс-продаж банковских продуктов', premium: '+40–60%', impact: 'Ипотека, страховки, ДМС, вклады, кредиты' },
              { factor: 'Данные о семьях для таргетирования', premium: '+20–30%', impact: 'Демографические, финансовые, поведенческие паттерны' },
              { factor: 'Готовый семейный кошелёк → интеграция с банковскими счетами', premium: '+15–25%', impact: 'Платёжная инфраструктура уже создана и работает' },
              { factor: 'Раздел «Финансы» — готовая витрина банковских продуктов', premium: '+20–30%', impact: 'Открытая площадка для продуктов банка внутри приложения' },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="bg-amber-500 text-white rounded-lg px-3 py-1 text-sm font-bold whitespace-nowrap">{row.premium}</div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm mb-1">{row.factor}</div>
                  <div className="text-xs text-slate-500">{row.impact}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-500 text-white rounded-xl p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-amber-100 mb-1">Совокупная стратегическая премия для банка</div>
              <div className="text-sm text-amber-100">Беркус (43 млн, ИС n'RIS) + премия 145–225% = итоговая оценка</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black">105–140 млн ₽</div>
              <div className="text-sm text-amber-100">+145–225% к базе</div>
            </div>
          </div>
        </div>

        {/* СЛАЙД 7 — Сводная таблица */}
        <div data-pdf-slide className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Итог</div>
          <h2 className="text-3xl font-black text-slate-900 mb-8">Сводная таблица оценки</h2>

          <div className="overflow-hidden rounded-xl border border-slate-200 mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-5 py-4 font-semibold text-slate-700">Метод оценки</th>
                  <th className="text-left px-5 py-4 font-semibold text-slate-700">Роль в оценке</th>
                  <th className="text-right px-5 py-4 font-semibold text-slate-700">Результат</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { method: 'Стоимость воспроизведения', role: 'Нижняя граница (пол)', value: '28 млн ₽', bg: 'bg-white' },
                  { method: 'Метод Беркуса', role: 'Базовая оценка', value: '43 млн ₽', bg: 'bg-blue-50' },
                  { method: 'Стратегическая (Беркус + премия банку)', role: 'Рабочий диапазон', value: '105–140 млн ₽', bg: 'bg-amber-50' },
                  { method: 'Венчурный метод (VC)', role: 'Верхняя граница (потолок)', value: '300–500 млн ₽', bg: 'bg-purple-50' },
                ].map((row, i) => (
                  <tr key={i} className={row.bg}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{row.method}</td>
                    <td className="px-5 py-4 text-slate-500 text-sm">{row.role}</td>
                    <td className="px-5 py-4 text-right font-black text-slate-800">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-4">Рекомендуемый диапазон для переговоров</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '🔻', label: 'Минимальная', sub: 'Продажа технологии и IP', value: '40–60 млн ₽', bg: 'bg-slate-100', text: 'text-slate-800' },
              { icon: '⚖️', label: 'Справедливая', sub: 'Продажа бизнеса целиком', value: '85–130 млн ₽', bg: 'bg-blue-600', text: 'text-white' },
              { icon: '🔺', label: 'Амбициозная', sub: 'Стратегическая сделка с банком', value: '150–250 млн ₽', bg: 'bg-slate-900', text: 'text-white' },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl p-5 ${s.bg}`}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`font-bold text-lg mb-1 ${s.text}`}>{s.label}</div>
                <div className={`text-xs mb-3 ${s.text} opacity-70`}>{s.sub}</div>
                <div className={`text-2xl font-black ${s.text}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* СЛАЙД 8 — Рекомендация */}
        <div data-pdf-slide className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-slate-900 to-blue-950 text-white p-12">
          <div className="text-xs font-semibold tracking-[0.2em] text-blue-300 uppercase mb-8">Рекомендация</div>
          <h2 className="text-4xl font-black mb-4">Стартовая цена переговоров</h2>
          <div className="text-7xl font-black text-blue-300 mb-8">150 млн ₽</div>

          <div className="h-px bg-blue-800 mb-8" />

          <h3 className="text-xl font-bold text-blue-200 mb-5">Обоснование:</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Работающий продукт в production без аналогов на рынке',
              'Государственный приоритет «Десятилетие семьи» 2024–2034',
              'Ready-to-scale технология: 86 API, 151 таблица, 90+ экранов',
              'Уникальная AI-методология развития детей (Выготский + Эльконин)',
              'Встроенная монетизация: семейный кошелёк pay-per-use',
              'Раздел «Финансы» — открытая витрина для продуктов банка',
              'Интеграции: Яндекс Алиса, СБП, Сбер, Т-Банк, Яндекс Карты',
              'При интеграции в экосистему банка: рост стоимости в 5–10× за 2–3 года',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/10 rounded-lg px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                <span className="text-sm text-slate-200">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-xs text-slate-500">
            Оценка подготовлена: 4 мая 2026 г. · ИП Кузьменко А.В. · Конфиденциально
          </div>
        </div>

        {/* СЛАЙД 9 — Варианты реализации */}
        <div data-pdf-slide className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Как продать</div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Варианты реализации платформы</h2>
          <p className="text-slate-500 mb-8 text-base">Три принципиально разных пути — каждый со своими условиями, сроками и выгодой. Выбор зависит от ваших целей.</p>

          <div className="space-y-5">
            {/* Вариант A */}
            <div className="rounded-2xl border-2 border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-lg">A</div>
                <div>
                  <div className="font-black text-slate-900 text-lg">Продажа технологии и кода</div>
                  <div className="text-sm text-slate-500">Самый простой и быстрый вариант</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-black text-slate-800">40–60 млн ₽</div>
                  <div className="text-xs text-slate-400">единовременно</div>
                </div>
              </div>
              <div className="px-6 py-5 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Что передаётся</div>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>• Весь исходный код</li>
                    <li>• База данных и схема</li>
                    <li>• Документация</li>
                    <li>• Домен и брендинг</li>
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Кому подходит</div>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>• IT-компания</li>
                    <li>• Частный инвестор</li>
                    <li>• Стартап-фонд</li>
                    <li>• Крупный работодатель</li>
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Сроки</div>
                  <div className="text-sm text-slate-700">Сделка закрывается за <strong>2–4 недели</strong>. Минимум юридических формальностей. Оплата разово.</div>
                </div>
              </div>
            </div>

            {/* Вариант B */}
            <div className="rounded-2xl border-2 border-blue-400 overflow-hidden">
              <div className="bg-blue-600 px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center font-black text-lg">B</div>
                <div>
                  <div className="font-black text-white text-lg">Продажа бизнеса целиком</div>
                  <div className="text-sm text-blue-200">Оптимальный вариант — продаёте всё вместе с правами и базой</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-black text-white">85–130 млн ₽</div>
                  <div className="text-xs text-blue-200">+ возможен earn-out</div>
                </div>
              </div>
              <div className="px-6 py-5 grid grid-cols-3 gap-4 bg-blue-50">
                <div>
                  <div className="text-xs font-semibold text-blue-400 uppercase mb-2">Что передаётся</div>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>• Код + инфраструктура</li>
                    <li>• База пользователей</li>
                    <li>• Торговая марка</li>
                    <li>• ИП или ООО целиком</li>
                    <li>• Все договоры и API</li>
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-blue-400 uppercase mb-2">Кому подходит</div>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li className="font-bold text-blue-700">• Банк ПСБ (ПАО «Банк ПСБ») — банк семей военных</li>
                    <li className="text-slate-500 text-xs pl-3 -mt-1 mb-1">Платформа идеально покрывает аудиторию семей военнослужащих: планирование бюджета, льготы, ипотека</li>
                    <li>• Сбербанк (СберСемья)</li>
                    <li>• Т-Банк (экосистема)</li>
                    <li>• Медиахолдинги</li>
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-blue-400 uppercase mb-2">Сроки и схема</div>
                  <div className="text-sm text-slate-700"><strong>1–3 месяца</strong> на due diligence и юридическое оформление. Возможна рассрочка или earn-out (доплата от выручки).</div>
                </div>
              </div>
            </div>

            {/* Вариант C */}
            <div className="rounded-2xl border-2 border-amber-400 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center font-black text-lg">C</div>
                <div>
                  <div className="font-black text-white text-lg">Стратегическое партнёрство с банком</div>
                  <div className="text-sm text-amber-100">Максимальная оценка — банк интегрирует платформу в свою экосистему</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-black text-white">150–250 млн ₽</div>
                  <div className="text-xs text-amber-100">старт переговоров</div>
                </div>
              </div>
              <div className="px-6 py-5 grid grid-cols-3 gap-4 bg-amber-50">
                <div>
                  <div className="text-xs font-semibold text-amber-500 uppercase mb-2">Что получает банк</div>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>• Готовый канал к семьям</li>
                    <li>• Витрина ипотеки, ДМС</li>
                    <li>• Семейный кошелёк</li>
                    <li>• Данные для таргетинга</li>
                    <li>• ESG-актив</li>
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-500 uppercase mb-2">Целевые покупатели</div>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li className="font-bold text-amber-700">• Банк ПСБ (ПАО «Банк ПСБ»)</li>
                    <li className="text-slate-500 text-xs pl-3 -mt-1 mb-1">Опорный банк ВПК и семей военных: льготная ипотека, субсидии, 2+ млн клиентов-военных</li>
                    <li>• Сбербанк (СберСемья)</li>
                    <li>• Т-Банк (экосистема)</li>
                    <li>• ВТБ (Мои финансы)</li>
                    <li>• Ростелеком</li>
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-500 uppercase mb-2">Сроки и схема</div>
                  <div className="text-sm text-slate-700"><strong>3–9 месяцев</strong> переговоры + сделка. Возможна структура: аванс 30% + доля в совместном продукте. Потенциал роста актива в <strong>5–10×</strong> за 3 года.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* СЛАЙД 10 — Пошаговый план действий */}
        <div data-pdf-slide className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Дорожная карта сделки</div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Пошаговый план действий</h2>
          <p className="text-slate-500 mb-8">Что нужно сделать от сегодняшнего дня (04.05.2026) до закрытия сделки — по шагам, простым языком.</p>

          <div className="space-y-4">
            {[
              {
                step: '1',
                phase: 'Подготовка',
                time: 'Май – июнь 2026',
                color: 'bg-slate-800',
                border: 'border-slate-200',
                bg: 'bg-slate-50',
                actions: [
                  'ИС уже защищена в РЦИС (n\'RIS №518-830-027) — дополнительной регистрации не требуется',
                  'Подготовить техническую документацию: архитектура, схема БД, API-описание',
                  'Составить финансовую модель на 3 года (выручка, расходы, юнит-экономика)',
                  'Сделать тизер (1 страница) и полный инвест. меморандум (этот документ)',
                  'Определить приоритетный сценарий продажи (A, B или C)',
                ],
              },
              {
                step: '2',
                phase: 'Поиск покупателей',
                time: 'Июнь – июль 2026',
                color: 'bg-blue-600',
                border: 'border-blue-100',
                bg: 'bg-blue-50',
                actions: [
                  'Составить список из 15–20 целевых компаний (банки, телеком, IT-экосистемы)',
                  'Выйти на M&A-отделы через LinkedIn, профессиональные ивенты, рекомендации',
                  'Рассмотреть M&A-брокера или буткемп для стартапов (ФРИИ, Сколково)',
                  'Параллельно: разместить анонс на площадках Avito Business, Mergers.ru',
                  'Не раскрывать технические детали без подписанного NDA',
                ],
              },
              {
                step: '3',
                phase: 'Переговоры',
                time: 'Июль – сентябрь 2026',
                color: 'bg-purple-600',
                border: 'border-purple-100',
                bg: 'bg-purple-50',
                actions: [
                  'Провести демо-сессии для каждого заинтересованного покупателя',
                  'Получить LOI (Letter of Intent) — письмо о намерении купить с ценовым диапазоном',
                  'Не снижать цену до получения минимум 2–3 предложений (конкуренция = цена)',
                  'Привлечь юриста для анализа условий сделки и структуры передачи прав',
                  'Согласовать структуру: единовременно / рассрочка / earn-out / доля',
                ],
              },
              {
                step: '4',
                phase: 'Due Diligence покупателя',
                time: 'Сентябрь – октябрь 2026',
                color: 'bg-teal-600',
                border: 'border-teal-100',
                bg: 'bg-teal-50',
                actions: [
                  'Предоставить доступ к коду в защищённом репозитории (read-only)',
                  'Подготовить выгрузки: статистика пользователей, финансы, технические метрики',
                  'Ответить на технические вопросы команды покупателя',
                  'Убедиться, что все данные пользователей соответствуют ФЗ-152 о персданных',
                  'Не допускать полной передачи данных до подписания договора',
                ],
              },
              {
                step: '5',
                phase: 'Закрытие сделки',
                time: 'Октябрь – ноябрь 2026',
                color: 'bg-green-600',
                border: 'border-green-100',
                bg: 'bg-green-50',
                actions: [
                  'Подписать договор купли-продажи исключительных прав на ПО',
                  'Получить первый платёж (аванс или полная сумма)',
                  'Передать исходный код, базы данных, доступы к инфраструктуре',
                  'Провести онбординг технической команды покупателя (1–2 недели)',
                  'Опционально: остаться в роли технического советника на 6–12 мес.',
                ],
              },
            ].map(row => (
              <div key={row.step} className={`rounded-xl border ${row.border} overflow-hidden`}>
                <div className={`${row.bg} px-5 py-3 flex items-center gap-3`}>
                  <div className={`w-8 h-8 rounded-lg ${row.color} text-white flex items-center justify-center font-black text-sm flex-shrink-0`}>{row.step}</div>
                  <div className="font-bold text-slate-900">{row.phase}</div>
                  <div className="ml-auto text-xs text-slate-400 font-medium">{row.time}</div>
                </div>
                <div className="px-5 py-4 grid grid-cols-1 gap-1">
                  {row.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700 py-1">
                      <div className={`w-5 h-5 rounded-full ${row.color} text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5`}>{i + 1}</div>
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* СЛАЙД 11 — Сравнение вариантов и финальный совет */}
        <div data-pdf-slide className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Сравнение</div>
          <h2 className="text-3xl font-black text-slate-900 mb-8">Какой вариант выбрать?</h2>

          <div className="overflow-hidden rounded-xl border border-slate-200 mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Критерий</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-700">A — Продажа кода</th>
                  <th className="text-center px-4 py-3 font-semibold text-blue-700 bg-blue-50">B — Продажа бизнеса</th>
                  <th className="text-center px-4 py-3 font-semibold text-amber-700">C — Банк/экосистема</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Сумма сделки', '40–60 млн ₽', '85–130 млн ₽', '150–250 млн ₽'],
                  ['Скорость', '2–4 недели', '1–3 месяца', '3–9 месяцев'],
                  ['Сложность', 'Низкая', 'Средняя', 'Высокая'],
                  ['Нужен юрист', 'Желательно', 'Обязательно', 'Обязательно'],
                  ['Риск срыва', 'Низкий', 'Средний', 'Средний'],
                  ['Потенциал роста', 'Нет', 'Умеренный', 'В 5–10× за 3 года'],
                  ['Участие после сделки', 'Не нужно', 'Опционально', 'Часто требуется'],
                ].map(([crit, a, b, c], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-4 py-3 font-medium text-slate-800">{crit}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{a}</td>
                    <td className="px-4 py-3 text-center font-semibold text-blue-700 bg-blue-50/50">{b}</td>
                    <td className="px-4 py-3 text-center text-amber-700">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-100 rounded-xl p-5">
              <div className="font-bold text-slate-800 mb-2">Выбирайте A, если...</div>
              <div className="text-sm text-slate-600">Хотите быстро получить деньги без сложных переговоров. Технология важнее, чем бизнес как таковой.</div>
            </div>
            <div className="bg-blue-100 rounded-xl p-5">
              <div className="font-bold text-blue-900 mb-2">Выбирайте B, если...</div>
              <div className="text-sm text-blue-800">Хотите максимально честную цену за всё вложенное. Есть время на переговоры и юридическое оформление.</div>
            </div>
            <div className="bg-amber-100 rounded-xl p-5">
              <div className="font-bold text-amber-900 mb-2">Выбирайте C, если...</div>
              <div className="text-sm text-amber-800">Хотите максимальную сумму и готовы участвовать в переговорах с крупными структурами несколько месяцев.</div>
            </div>
          </div>
        </div>

        {/* СЛАЙД 12 — M&A-брокеры и площадки */}
        <div data-pdf-slide className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Куда идти прямо сейчас</div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">M&A-брокеры и площадки для тизера</h2>
          <p className="text-slate-500 mb-8">Конкретные компании, организации и площадки, куда можно отправить тизер уже сегодня — без холодного поиска с нуля.</p>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* M&A-брокеры */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">M&A-брокеры (ведут сделку под ключ)</div>
              <div className="space-y-3">
                {[
                  {
                    name: 'IMAC (imac.ru)',
                    desc: 'Топ-1 в России по сделкам с IT и цифровыми активами. Оценка, подбор покупателя, сопровождение.',
                    contact: 'info@imac.ru',
                    tag: 'IT-сделки',
                    tagColor: 'bg-blue-100 text-blue-700',
                  },
                  {
                    name: 'RusBase M&A / Mergers.ru',
                    desc: 'Крупнейшая онлайн-площадка для продажи готового бизнеса в РФ. Разместить объявление — бесплатно.',
                    contact: 'mergers.ru → раздел "Разместить"',
                    tag: 'Онлайн-площадка',
                    tagColor: 'bg-slate-100 text-slate-600',
                  },
                  {
                    name: 'АВМ Capital (avmcapital.ru)',
                    desc: 'Специализируются на продаже IT-продуктов и SaaS стартапов. Есть опыт работы с банками.',
                    contact: 'info@avmcapital.ru',
                    tag: 'SaaS / IT',
                    tagColor: 'bg-purple-100 text-purple-700',
                  },
                  {
                    name: 'Бизброкер (bizbroker.ru)',
                    desc: 'Онлайн-маркетплейс готового бизнеса №1 по трафику в РФ. Быстрый выход на частных инвесторов.',
                    contact: 'bizbroker.ru → "Продать бизнес"',
                    tag: 'Маркетплейс',
                    tagColor: 'bg-green-100 text-green-700',
                  },
                ].map((item, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${item.tagColor}`}>{item.tag}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">{item.desc}</div>
                    <div className="text-xs font-mono text-slate-400">{item.contact}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Институты и фонды */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Институты, фонды и прямые контакты</div>
              <div className="space-y-3">
                {[
                  {
                    name: 'ФРИИ (Фонд развития интернет-инициатив)',
                    desc: 'Крупнейший венчурный фонд РФ. Программа «Акселератор» и прямые сделки с IT-активами.',
                    contact: 'iidf.ru → раздел "Портфель и партнёры"',
                    tag: 'Венчур',
                    tagColor: 'bg-orange-100 text-orange-700',
                  },
                  {
                    name: 'Банк ПСБ (ПАО «Банк ПСБ») — M&A отдел',
                    desc: 'Опорный банк ВПК. Прямой контакт: департамент развития экосистемы и цифровых продуктов.',
                    contact: 'psbank.ru → "Для бизнеса" / partnership@psbank.ru',
                    tag: 'Приоритет #1',
                    tagColor: 'bg-red-100 text-red-700',
                  },
                  {
                    name: 'Сколково — Рынок технологий',
                    desc: 'Платформа для поиска покупателей и партнёров среди крупных корпораций. Бесплатное размещение.',
                    contact: 'sk.ru → "Для стартапов" → Marketplace',
                    tag: 'Экосистема',
                    tagColor: 'bg-teal-100 text-teal-700',
                  },
                  {
                    name: 'Авито Бизнес / Авито Готовый бизнес',
                    desc: 'Раздел продажи готового бизнеса. Большой охват частных инвесторов. Быстрый первый отклик.',
                    contact: 'avito.ru → Готовый бизнес → Подать объявление',
                    tag: 'Быстрый старт',
                    tagColor: 'bg-yellow-100 text-yellow-700',
                  },
                ].map((item, i) => (
                  <div key={i} className={`border rounded-xl p-4 ${i === 1 ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${item.tagColor}`}>{item.tag}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">{item.desc}</div>
                    <div className="text-xs font-mono text-slate-400">{item.contact}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-6">
            <div className="text-sm font-semibold text-slate-300 mb-3">Рекомендуемый порядок действий (первые 2 недели)</div>
            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { num: '1', action: 'Отправить тизер в ПСБ', sub: 'partnership@psbank.ru' },
                { num: '2', action: 'Разместить на Mergers.ru', sub: 'Бесплатно, быстро' },
                { num: '3', action: 'Подать заявку в ФРИИ', sub: 'iidf.ru/accelerator' },
                { num: '4', action: 'Связаться с IMAC', sub: 'Подобрать покупателя' },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-black text-white mb-1">{s.num}</div>
                  <div className="text-sm font-semibold text-white mb-1">{s.action}</div>
                  <div className="text-xs text-slate-400">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* СЛАЙД 13 — Тизер (одностраничный питч для отправки) */}
        <div data-pdf-slide className="rounded-2xl border-2 border-slate-800 bg-white p-10 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Тизер · Конфиденциально · Май 2026</div>
              <h2 className="text-4xl font-black text-slate-900">НАША СЕМЬЯ</h2>
              <div className="text-lg text-slate-500 font-medium">Семейная платформа нового поколения</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 mb-1">nasha-semiya.ru</div>
              <div className="text-xs text-slate-400">ИП Кузьменко А.В.</div>
              <div className="mt-2 inline-block bg-slate-900 text-white text-xs px-3 py-1 rounded-full font-semibold">Ищем стратегического партнёра</div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6">
            <div className="text-sm text-slate-400 mb-2">Одной фразой</div>
            <div className="text-xl font-bold leading-snug">"Первый в России полноценный цифровой органайзер для семьи — от документов и здоровья до семейного бюджета и льгот от государства."</div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { num: '50 млн', label: 'семей в России — целевой рынок (TAM)' },
              { num: '28 млн ₽', label: 'стоимость воспроизведения технологии' },
              { num: '~85 млн ₽', label: 'оценка бизнеса (Беркус + премия)' },
              { num: 'до 2036', label: 'Стратегия семейной политики РФ — гос. приоритет' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-2xl font-black text-slate-900 mb-1">{s.num}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Что создано (готово)</div>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {[
                  'Работающий продукт в production — веб-платформа + мобильная версия',
                  '88 активных семей · оплаты через семейный кошелёк работают',
                  'Модули: Здоровье, Документы, Бюджет, Задачи, Календарь',
                  'Раздел «Господдержка» — пособия, льготы, ипотека',
                  'ИИ-диетолог с медицинскими столами (уникально для РФ)',
                  'Семейный маячок — GPS-трекинг, геозоны, SOS-кнопка',
                  'Аналитика нагрузки, Домовой (ИИ-психолог/педагог)',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 font-bold flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Почему сейчас</div>
              <ul className="space-y-1.5 text-sm text-slate-700 mb-4">
                {[
                  'Аналогов нет — уникальная ниша в России',
                  'Банк ПСБ: 2+ млн семей военных — идеальная аудитория',
                  'Стратегия семейной политики РФ до 2036 года — попутный ветер на 10+ лет',
                  'Технология защищена — депонирование в РЦИС n\'RIS №518-830-027',
                  'Стоимость растёт с каждым новым пользователем',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold flex-shrink-0">→</span>{f}
                  </li>
                ))}
              </ul>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Варианты сделки</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Продажа кода</span><span className="font-bold">40–60 млн ₽</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Продажа бизнеса</span><span className="font-bold text-blue-700">85–130 млн ₽</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Стратегический банк</span><span className="font-bold text-amber-700">150–250 млн ₽</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-blue-600 text-white rounded-xl p-5">
              <div className="text-sm text-blue-200 mb-1">Приоритетный покупатель</div>
              <div className="font-bold text-lg mb-2">Банк ПСБ (ПАО «Банк ПСБ») — опорный банк ВПК</div>
              <div className="text-sm text-blue-100">Платформа «Наша Семья» — готовый цифровой продукт для 2+ млн семей военнослужащих: льготная ипотека, субсидии, семейный бюджет, документы, здоровье. Идеальный fit с аудиторией Банка ПСБ.</div>
            </div>
            <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Контакт для переговоров</div>
                <div className="font-bold text-white">ИП Кузьменко А.В.</div>
                <div className="text-sm text-slate-300 mt-1">nasha-semiya.ru</div>
              </div>
              <div className="mt-3 text-xs text-slate-500">Документ конфиденциален. Передача третьим лицам только с письменного согласия.</div>
            </div>
          </div>
        </div>

        {/* СЛАЙД 14 — Финальный */}
        <div data-pdf-slide className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-slate-900 to-blue-950 text-white p-12">
          <div className="text-xs font-semibold tracking-[0.2em] text-blue-300 uppercase mb-8">Итог · Москва, 4 мая 2026 г.</div>
          <h2 className="text-4xl font-black mb-6">Ключевые выводы</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Платформа полностью готова к продаже', desc: 'Работающий продукт в production, 88 активных семей, встроенная pay-per-use монетизация' },
              { label: 'Аналогов на рынке нет', desc: 'Единственный комплексный семейный органайзер в России' },
              { label: 'Государственный приоритет', desc: 'Стратегия семейной политики РФ до 2036 года — попутный ветер для любого покупателя' },
              { label: 'Стоимость растёт с каждым месяцем', desc: 'Каждый новый пользователь и интеграция увеличивают оценку' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-5">
                <div className="font-bold text-white mb-2">{item.label}</div>
                <div className="text-sm text-slate-300">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="bg-blue-600/50 border border-blue-500 rounded-xl p-6 mb-8">
            <div className="text-sm text-blue-200 mb-1">Рекомендуемое первое действие</div>
            <div className="text-xl font-bold text-white">Нанять M&A-юриста + разослать тизер в 5 банков · ИС уже защищена в РЦИС</div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-black text-green-400">40–60</div>
              <div className="text-sm text-slate-400">млн ₽ минимум</div>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-300">85–130</div>
              <div className="text-sm text-slate-400">млн ₽ справедливо</div>
            </div>
            <div>
              <div className="text-3xl font-black text-yellow-400">150+</div>
              <div className="text-sm text-slate-400">млн ₽ цель переговоров</div>
            </div>
          </div>

          <div className="mt-8 text-xs text-slate-500">
            Документ подготовлен: 4 мая 2026 г. · Москва · ИП Кузьменко А.В. · Конфиденциально
          </div>
        </div>

      </div>
    </div>
  );
}