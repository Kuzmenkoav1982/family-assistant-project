import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

async function captureSlides(
  onProgress: (msg: string) => void
): Promise<{ canvases: HTMLCanvasElement[]; count: number } | null> {
  const container = document.getElementById('homework-content');
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

interface RespondentData {
  role: string;
  strengths: string;
  changes: string;
  good: string;
  more: string;
  less: string;
}

function RespondentCard({ index, data, accentColor }: { index: number; data: RespondentData; accentColor: string }) {
  const colors: Record<string, { bg: string; border: string; badge: string; icon: string; highlight: string }> = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-600',
      icon: 'text-blue-600',
      highlight: 'bg-blue-100 text-blue-800',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-600',
      icon: 'text-emerald-600',
      highlight: 'bg-emerald-100 text-emerald-800',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      badge: 'bg-purple-600',
      icon: 'text-purple-600',
      highlight: 'bg-purple-100 text-purple-800',
    },
  };

  const c = colors[accentColor] || colors.blue;

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg ${c.badge} text-white flex items-center justify-center text-sm font-black`}>
          {index}
        </div>
        <div>
          <div className="font-bold text-slate-900 text-sm leading-tight">{data.role}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Icon name="Star" size={13} className={c.icon} />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Сильные стороны</span>
          </div>
          <p className="text-[12.5px] text-slate-700 leading-relaxed">{data.strengths}</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Icon name="RefreshCw" size={13} className={c.icon} />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Что стоит изменить</span>
          </div>
          <p className="text-[12.5px] text-slate-700 leading-relaxed">{data.changes}</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Icon name="CheckCircle" size={13} className="text-green-600" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Хорошо</span>
          </div>
          <p className="text-[12.5px] text-slate-700 leading-relaxed">{data.good}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/80 border border-white p-2.5">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-green-600 text-xs">▲</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Больше</span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-snug">{data.more}</p>
          </div>
          <div className="rounded-lg bg-white/80 border border-white p-2.5">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-amber-600 text-xs">▼</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Меньше / Прекратить</span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-snug">{data.less}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const respondent1: RespondentData = {
  role: 'Начальник Управления корпоративной политики в ДЗО',
  strengths:
    'Умение формулировать чёткие цели и задачи, реагировать на изменения, развитые организаторские способности и профессиональная компетенция. Поддержка в реализуемых проектах, видение проблемы в целом, умение акцентироваться на проблемных моментах, слушать предложения и конструктивно их обсуждать; определение комфортных сроков исполнения задач; контроль за исполнением с обсуждением трудностей в реализации. Стратегическое мышление; решительность в принятии ключевых решений; ответственность за принятые решения; мотивация и умение вдохновить; адаптивность к новым условиям; уверенность в себе; честность и целеустремлённость.',
  changes:
    'Проведение обсуждений стратегических задач, стоящих перед курируемым подразделением. Стать более открытым в части объяснения перспектив развития, в т.ч. движения организации.',
  good: 'Обсуждение проектов, получение глубокой обратной связи, привлечение к проектам заинтересованных лиц. В спорных ситуациях выслушивает все стороны и принимает взвешенное решение; предоставляет обоснование позиции; чётко доносит задачу с указанием сроков.',
  more: 'Доносить до подчинённых позицию высшего руководства по стратегическим направлениям развития подразделения на среднесрочную перспективу.',
  less: 'У подчинённых есть сложности в понимании позиции высшего руководства в «стратегических» направлениях развития подразделения.',
};

const respondent2: RespondentData = {
  role: 'Руководитель направления Экспертно-аналитического управления (1)',
  strengths:
    'Системное юридическое мышление в сочетании с управленческой экспертизой (МВА). Умение выстраивать сложные корпоративные процессы и доводить их до стандарта. Одновременно видит стратегическую картину и операционные детали. Высокий авторитет в профессиональном сообществе мотивирует команду соответствовать заданной планке.',
  changes:
    'Чаще транслировать приоритеты — чтобы команда точнее распределяла усилия между «идеально» и «достаточно хорошо сейчас». Делегировать промежуточный контроль линейным руководителям.',
  good: 'Чёткая постановка задач с правовой и управленческой аргументацией; всегда доступен для эскалации критических вопросов по ДЗО.',
  more: 'Проводить короткие стратегические сессии с управлением для синхронизации приоритетов по дочерним обществам.',
  less: 'Лично погружаться в рутинные согласования документов, которые могут быть закрыты на уровне управления.',
};

const respondent3: RespondentData = {
  role: 'Руководитель направления Экспертно-аналитического управления (2)',
  strengths:
    'Аналитическая глубина и требовательность к качеству данных — задаёт высокий стандарт экспертизы. Способность быстро вникать в новые области и применять знания на практике. Умение защитить позицию команды перед вышестоящим руководством — создаёт чувство «надёжного тыла». Стратегическое видение, личная дисциплина и открытость к обратной связи вдохновляют команду.',
  changes:
    'Ускорить цикл принятия решений — выделить «быструю аналитику» как формат с допустимой погрешностью для оперативных решений. Явно обозначать дедлайны и приоритеты при параллельных поручениях.',
  good: 'Культура доказательного подхода; поддержка профессионального развития сотрудников (личный пример — обучение во ВШЭ). Мотивация через смысл задачи; создаёт среду, где ценится экспертиза.',
  more: 'Делиться с командой инсайтами из программы проектного управления — это усилит проектную культуру. Ввести еженедельные 15-мин статус-встречи для приоритизации задач.',
  less: 'Брать на себя финальную вычитку каждого аналитического отчёта — доверить экспертам направления. Переключаться между задачами в режиме «всё срочно» — выделить категорию задач, которые могут подождать 24–48 ч.',
};

export default function AdminHomework() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [isPptxDownloading, setIsPptxDownloading] = useState(false);
  const [pptxProgress, setPptxProgress] = useState('');

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const result = await captureSlides(setDownloadProgress);
      if (!result) return;

      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 8;
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

        pdf.setFontSize(7);
        pdf.setTextColor(180, 180, 180);
        pdf.text(`${i + 1} / ${result.count}`, pageWidth / 2, pageHeight - 4, { align: 'center' });
      }

      pdf.save('ДЗ1-Интервью-подчинённые.pdf');
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
      pptx.author = 'Руководитель аппарата председателя';
      pptx.company = 'ПСБ';
      pptx.subject = 'Домашнее задание 1 — Интервью с подчинёнными';
      pptx.title = 'ДЗ1 — Интервью с ключевыми лицами (подчинённые)';

      const slideW = 10;
      const slideH = 5.625;
      const padding = 0.15;
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

      await pptx.writeFile({ fileName: 'ДЗ1-Интервью-подчинённые.pptx' });
    } catch (error) {
      console.error('Ошибка PPTX:', error);
    } finally {
      setIsPptxDownloading(false);
      setPptxProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">ВШЭ · Проектное управление</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Домашнее задание 1 — Интервью с подчинёнными</h1>
            <p className="text-sm text-slate-500">Руководитель аппарата председателя</p>
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
            <Button
              size="sm"
              variant="ghost"
              className="gap-2"
              onClick={() => window.location.href = '/admin/dashboard'}
            >
              <Icon name="ArrowLeft" size={16} />
              Назад
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

      <div id="homework-content" className="max-w-6xl mx-auto px-6 py-12 space-y-8">

        {/* СЛАЙД 1 — Респондент 1 (Начальник Управления корпоративной политики ДЗО) */}
        <div data-pdf-slide className="rounded-2xl overflow-hidden shadow-lg bg-white border border-slate-200">
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-800 text-white px-10 py-6">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-semibold tracking-[0.2em] text-blue-300 uppercase">
                ВШЭ · Проектное управление · Домашнее задание 1
              </div>
              <div className="text-[10px] text-slate-400">Слайд 1 из 2</div>
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-1">
              Интервью с ключевыми лицами (подчинённые)
            </h2>
            <p className="text-sm text-blue-200/80">
              Серия коротких интервью: 3 вопроса · 3 респондента
            </p>
          </div>

          <div className="px-10 py-8">
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-black">1</div>
                <div>
                  <div className="font-bold text-slate-900 text-base">Начальник Управления корпоративной политики в ДЗО</div>
                  <div className="text-[11px] text-slate-400">Агрегированное мнение сотрудников управления</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {/* Вопрос 1 */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</div>
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Сильные стороны как лидера</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                    <p className="text-[11px] text-slate-400 font-medium mb-0.5">Комментарий 1:</p>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed">Умение формулировать чёткие цели и задачи, реагировать на изменения, развитые организаторские способности и профессиональная компетенция</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                    <p className="text-[11px] text-slate-400 font-medium mb-0.5">Комментарий 2:</p>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed">Поддержка в реализуемых проектах, видение проблемы в целом, умение акцентироваться на проблемных моментах, слушать предложения и конструктивно их обсуждать; определение комфортных сроков исполнения задач; контроль за исполнением с обсуждением трудностей</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-blue-100">
                    <p className="text-[11px] text-slate-400 font-medium mb-0.5">Комментарий 3:</p>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed">Стратегическое мышление; решительность в принятии ключевых решений; ответственность; мотивация и умение вдохновить; адаптивность; уверенность в себе; честность и целеустремлённость</p>
                  </div>
                </div>
              </div>

              {/* Вопрос 2 */}
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-5 h-5 rounded bg-amber-600 text-white flex items-center justify-center text-[10px] font-black">2</div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Что стоит изменить</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-2.5 border border-amber-100">
                    <p className="text-[11px] text-slate-400 font-medium mb-0.5">Комментарий 1:</p>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed">Проведение обсуждений «стратегических» задач, стоящих перед курируемым подразделением</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-amber-100">
                    <p className="text-[11px] text-slate-400 font-medium mb-0.5">Комментарий 2:</p>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed">Надо стать более открытым в части объяснения перспектив развития, в т.ч. движения организации</p>
                  </div>
                </div>
              </div>

              {/* Вопрос 3 */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">3</div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Хорошо / Лучше</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-2.5 border border-emerald-100">
                    <p className="text-[11px] text-green-600 font-medium mb-0.5">✅ Хорошо:</p>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed">Обсуждение проектов, получение глубокой обратной связи, привлечение заинтересованных лиц. Выслушивает все стороны, принимает взвешенное решение с обоснованием; чётко доносит задачу с указанием сроков</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-emerald-100">
                    <p className="text-[11px] text-blue-600 font-medium mb-0.5">🔼 Больше:</p>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed">Доносить до подчинённых позицию высшего руководства по стратегическим направлениям развития подразделения на среднесрочную перспективу</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* СЛАЙД 2 — Респонденты 2 и 3 (Руководители направления ЭАУ) */}
        <div data-pdf-slide className="rounded-2xl overflow-hidden shadow-lg bg-white border border-slate-200">
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-800 text-white px-10 py-5">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-semibold tracking-[0.2em] text-blue-300 uppercase">
                ВШЭ · Проектное управление · Домашнее задание 1
              </div>
              <div className="text-[10px] text-slate-400">Слайд 2 из 2</div>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Руководители направления Экспертно-аналитического управления
            </h2>
          </div>

          <div className="px-10 py-6">
            <div className="grid grid-cols-2 gap-6">

              {/* Респондент 2 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-black">2</div>
                  <div className="font-bold text-slate-900 text-sm">Руководитель направления ЭАУ (1)</div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon name="Star" size={12} className="text-blue-600" />
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Сильные стороны</span>
                    </div>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed">
                      Системное юридическое мышление в сочетании с управленческой экспертизой (МВА). Умение выстраивать сложные корпоративные процессы и доводить их до стандарта. Одновременно видит стратегическую картину и операционные детали. Высокий авторитет в профессиональном сообществе мотивирует команду.
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon name="RefreshCw" size={12} className="text-amber-600" />
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Что стоит изменить</span>
                    </div>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed">
                      Чаще транслировать приоритеты — чтобы команда точнее распределяла усилия между «идеально» и «достаточно хорошо сейчас». Делегировать промежуточный контроль линейным руководителям.
                    </p>
                  </div>

                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon name="CheckCircle" size={12} className="text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Хорошо / Больше / Меньше</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[11.5px] text-slate-700 leading-relaxed">
                        <span className="text-green-600 font-medium">✅</span> Чёткая постановка задач с правовой и управленческой аргументацией; доступен для эскалации критических вопросов по ДЗО
                      </p>
                      <p className="text-[11.5px] text-slate-700 leading-relaxed">
                        <span className="text-blue-600 font-medium">🔼</span> Проводить стратегические сессии для синхронизации приоритетов по дочерним обществам
                      </p>
                      <p className="text-[11.5px] text-slate-700 leading-relaxed">
                        <span className="text-amber-600 font-medium">🔽</span> Лично погружаться в рутинные согласования документов
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Респондент 3 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-sm font-black">3</div>
                  <div className="font-bold text-slate-900 text-sm">Руководитель направления ЭАУ (2)</div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon name="Star" size={12} className="text-blue-600" />
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Сильные стороны</span>
                    </div>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed">
                      Аналитическая глубина и требовательность к качеству данных. Способность быстро вникать в новые области и применять знания на практике. Умение защитить позицию команды — «надёжный тыл». Стратегическое видение, личная дисциплина и открытость к обратной связи вдохновляют команду.
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon name="RefreshCw" size={12} className="text-amber-600" />
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Что стоит изменить</span>
                    </div>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed">
                      Ускорить цикл принятия решений — выделить «быструю аналитику» как формат с допустимой погрешностью. Явно обозначать дедлайны и приоритеты при параллельных поручениях.
                    </p>
                  </div>

                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon name="CheckCircle" size={12} className="text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Хорошо / Больше / Прекратить</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[11.5px] text-slate-700 leading-relaxed">
                        <span className="text-green-600 font-medium">✅</span> Культура доказательного подхода; поддержка профразвития (личный пример — обучение во ВШЭ); мотивация через смысл задачи
                      </p>
                      <p className="text-[11.5px] text-slate-700 leading-relaxed">
                        <span className="text-blue-600 font-medium">🔼</span> Делиться инсайтами из программы проектного управления; еженедельные 15-мин статус-встречи для приоритизации
                      </p>
                      <p className="text-[11.5px] text-slate-700 leading-relaxed">
                        <span className="text-red-600 font-medium">⛔</span> Финальная вычитка каждого отчёта — доверить экспертам. Режим «всё срочно» — выделить задачи, которые могут подождать 24–48 ч
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
