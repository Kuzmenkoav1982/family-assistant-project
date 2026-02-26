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

      pdf.save('Оценка-стоимости-НашаСемья-26022026.pdf');
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
      pptx.title = 'Оценка стоимости — Наша семья — 26.02.2026';

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

      await pptx.writeFile({ fileName: 'Оценка-стоимости-НашаСемья-26022026.pptx' });
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
            <p className="text-sm text-slate-500">По состоянию на 26 февраля 2026 г.</p>
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
            <div className="text-xs text-slate-400">26.02.2026</div>
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
                <div className="text-3xl font-black text-blue-300 mb-1">80–120 млн ₽</div>
                <div className="text-sm text-slate-300">Справедливая оценка</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl font-black text-yellow-400 mb-1">150–250 млн ₽</div>
                <div className="text-sm text-slate-300">Стратегическая сделка</div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-xs text-slate-500">ИП Кузьменко А.В. · Платформа «Наша семья» · nashamily.ru</div>
        </div>

        {/* СЛАЙД 2 — Введение */}
        <div data-pdf-slide className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Методология</div>
          <h2 className="text-3xl font-black text-slate-900 mb-6">Применяемые методы оценки</h2>
          <p className="text-slate-600 mb-8 text-lg leading-relaxed">
            Для оценки <strong>pre-revenue SaaS-стартапа</strong> с работающим MVP применяются четыре общепринятых метода. 
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
              { factor: 'Качество идеи и рыночная потребность', score: 9, max: 10, note: 'Гос. приоритет «Десятилетие семьи», отсутствие конкурентов, TAM 50 млн семей', color: 'bg-green-500' },
              { factor: 'Прототип / работающая технология', score: 10, max: 10, note: 'Полностью функциональный MVP: 86 API-функций, 151 таблица, 90+ экранов, production', color: 'bg-blue-500' },
              { factor: 'Качество команды', score: 5, max: 10, note: 'Соло-основатель с глубокой экспертизой, продукт создан на собственном опыте', color: 'bg-orange-400' },
              { factor: 'Стратегические партнёрства и интеграции', score: 6, max: 10, note: 'Яндекс Алиса, платёжные системы (СБП, Сбер, Т-Банк), Яндекс Карты', color: 'bg-purple-500' },
              { factor: 'Первые пользователи / traction', score: 4, max: 10, note: '40+ пользователей, 51 семья, 30K+ аналитических событий, работающие платежи', color: 'bg-teal-500' },
              { factor: 'Интеллектуальная собственность', score: 6, max: 10, note: 'Алгоритм оценки развития детей (Выготский + Эльконин), AI-ассистент «Домовой»', color: 'bg-pink-500' },
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
              <div className="text-sm text-blue-100">Базовая оценка стартапа с учётом всех ключевых факторов</div>
            </div>
            <div className="text-4xl font-black">~40 млн ₽</div>
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
                { label: 'Прогноз платящих пользователей (год 3)', value: '100 000' },
                { label: 'Средний чек (подписка + кошелёк)', value: '330 ₽/мес' },
                { label: 'Прогнозная годовая выручка (год 3)', value: '396 млн ₽/год' },
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
                  <span className="font-bold text-slate-800">1 188–1 980 млн ₽</span>
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
                  <span className="font-black text-purple-700 text-lg">352–587 млн ₽</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg px-4 py-3 text-xs text-slate-500">
                Формула: PV = FV / (1 + r)³, где FV = 1 188–1 980 млн, r = 0,50
              </div>
            </div>
          </div>

          <div className="bg-purple-700 text-white rounded-xl p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-200 mb-1">Оценка по VC-методу</div>
              <div className="text-sm text-purple-100">Верхняя граница — потолок стоимости при выходе на целевые показатели</div>
            </div>
            <div className="text-4xl font-black">350–590 млн ₽</div>
          </div>
        </div>

        {/* СЛАЙД 6 — Метод 4 Стратегическая */}
        <div data-pdf-slide className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm font-black">4</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Метод 4</div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Стратегическая оценка для банка-покупателя</h2>
          <p className="text-slate-500 mb-8">При покупке банком учитывается стратегическая премия к базовой оценке Беркуса (40 млн ₽)</p>

          <div className="space-y-3 mb-6">
            {[
              { factor: 'Монопольная позиция — единственный продукт в нише', premium: '+30–50%', impact: 'Отсутствие конкурентного давления, высокий барьер входа' },
              { factor: 'Государственная повестка «Десятилетие семьи»', premium: '+20–30%', impact: 'ESG-актив, репутационный капитал, доступ к грантам' },
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
              <div className="text-sm text-amber-100">Беркус (40 млн) + премия 145–225% = итоговая оценка</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black">98–130 млн ₽</div>
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
                  { method: 'Метод Беркуса', role: 'Базовая оценка', value: '40 млн ₽', bg: 'bg-blue-50' },
                  { method: 'Стратегическая (Беркус + премия банку)', role: 'Рабочий диапазон', value: '98–130 млн ₽', bg: 'bg-amber-50' },
                  { method: 'Венчурный метод (VC)', role: 'Верхняя граница (потолок)', value: '350–590 млн ₽', bg: 'bg-purple-50' },
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
              { icon: '⚖️', label: 'Справедливая', sub: 'Продажа бизнеса целиком', value: '80–120 млн ₽', bg: 'bg-blue-600', text: 'text-white' },
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
              'Работающий MVP без аналогов на рынке',
              'Государственный приоритет «Десятилетие семьи» 2024–2033',
              'Ready-to-scale технология: 86 API, 151 таблица, 90+ экранов',
              'Уникальная AI-методология развития детей (Выготский + Эльконин)',
              'Встроенная монетизация: подписка + семейный кошелёк',
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
            Оценка подготовлена: 26 февраля 2026 г. · ИП Кузьменко А.В. · Конфиденциально
          </div>
        </div>

      </div>
    </div>
  );
}
