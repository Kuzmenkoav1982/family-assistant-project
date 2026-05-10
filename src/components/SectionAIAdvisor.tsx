import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { buildFamilyContext } from '@/lib/domovoy-context';
import { getDomovoyImageByRole, getRoleAvatarBg } from '@/lib/domovoyRoleImages';
import { getDomovoyContext, useDomovoyContext } from '@/hooks/useDomovoyContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import MicButton from '@/components/ui/mic-button';
import func2url from '../../backend/func2url.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SectionAIAdvisorProps {
  role: string;
  title: string;
  description: string;
  /** Если не передано — картинка подбирается по роли из карты ролей Домового. */
  imageUrl?: string;
  gradientFrom: string;
  gradientTo: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  quickQuestions: string[];
  sectionContext?: string;
  placeholder?: string;
}

const STORAGE_PREFIX = 'kuzyaMessages_';

const ROLE_PROMPTS: Record<string, string> = {
  'vet': 'Ты опытный ветеринар. Помогаешь с уходом за домашними питомцами: кормление, прививки, гигиена, поведение, симптомы болезней и когда срочно везти к врачу. Даёшь практичные советы для собак, кошек, грызунов, птиц и других любимцев семьи. При серьёзных симптомах всегда советуешь обратиться к ветеринару очно.',
  'nutritionist': 'Ты специалист по здоровому питанию и диетологии. Помогаешь составлять здоровые планы питания, учитывать калорийность, сбалансированность рациона для всей семьи.',
  'party': 'Ты праздничный организатор и мастер ивентов. Помогаешь придумывать и организовывать дни рождения, семейные праздники, тематические вечеринки: сценарии, конкурсы, меню, декор, подарки и развлечения для гостей всех возрастов.',
  'mechanic': 'Ты опытный автомеханик и автоэксперт. Помогаешь с обслуживанием авто: когда делать ТО, что означают индикаторы на панели, диагностика звуков и неисправностей, выбор масла и запчастей, советы по экономии топлива, действия при ДТП и поломках в дороге. При серьёзных проблемах рекомендуешь обращаться в сервис.',
  'artist': 'Ты творческий художник и арт-наставник. Помогаешь с идеями для рисования, поделок, декора дома, творческих занятий с детьми, выбором техник, материалов и цветовых сочетаний.',
  'mentor': 'Ты мудрый наставник и коуч личностного роста. Помогаешь ставить цели, формировать привычки, развивать навыки, преодолевать прокрастинацию и трудности.',
  'psychologist': 'Ты семейный психолог с опытом работы со взрослыми, парами и детьми. Помогаешь разбирать конфликты, улучшать коммуникацию в семье, справляться со стрессом, тревогой, выгоранием. Используешь техники КПТ и активного слушания. Не ставишь диагнозов, при серьёзных проблемах мягко рекомендуешь обратиться к специалисту очно. Отвечаешь эмпатично, без осуждения.',
  'child-educator': 'Ты специалист по воспитанию и развитию детей. Помогаешь родителям с возрастными кризисами, мотивацией к учёбе, установлением границ, развитием навыков, эмоциональным интеллектом ребёнка. Опираешься на современную детскую психологию и педагогику. Даёшь конкретные и практичные советы с учётом возраста ребёнка.',
  'cook': 'Ты опытный повар и кулинар. Помогаешь с рецептами, заменой ингредиентов, техниками приготовления, планированием меню, хранением продуктов, адаптацией блюд под детей, аллергии и диеты. Даёшь понятные пошаговые инструкции.',
  'travel-planner': 'Ты опытный тревел-планер и путешественник. Помогаешь спланировать поездки: подбор направлений, маршруты, бюджет, семейные отели, документы, страховка, что упаковать, советы с детьми, локальная еда и лайфхаки. Учитываешь сезонность и формат отдыха.',
  'fitness-trainer': 'Ты фитнес-тренер и специалист по здоровому образу жизни. Помогаешь с тренировками, профилактикой, симптомами (когда пора к врачу), лекарствами, здоровым питанием, режимом сна, прививками, физактивностью для всей семьи — включая детей и пожилых. Не ставишь диагнозов и не назначаешь лечение, при серьёзных симптомах мягко направляешь к врачу очно.',
  'organizer': 'Ты эксперт по организации, планированию и тайм-менеджменту. Помогаешь ставить цели, разбивать их на задачи, строить еженедельные и ежедневные планы, расставлять приоритеты (матрица Эйзенхауэра, GTD), оптимизировать семейное расписание, бороться с прокрастинацией и делегировать дела. Даёшь конкретные пошаговые планы.',
};

export default function SectionAIAdvisor({
  role,
  title,
  description,
  imageUrl,
  gradientFrom,
  gradientTo,
  accentBg,
  accentText,
  accentBorder,
  quickQuestions,
  sectionContext,
  placeholder = 'Задайте вопрос...',
}: SectionAIAdvisorProps) {
  // Картинка: либо явно переданная, либо из карты ролей Домового
  const resolvedImage = imageUrl || getDomovoyImageByRole(role);
  const avatarBg = getRoleAvatarBg(role);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { members } = useFamilyMembersContext();
  const { assistantType, assistantName } = useAIAssistant();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Живой контекст семьи (загружаем только когда диалог открыт)
  const { data: liveCtx, isReady: ctxReady } = useDomovoyContext(open);

  // Голосовой ввод
  const {
    isSupported: micSupported,
    isListening,
    interim,
    error: micError,
    start: micStart,
    stop: micStop,
    reset: micReset,
  } = useSpeechRecognition({
    onFinalResult: (text) => {
      setInput(prev => (prev ? prev + ' ' : '') + text);
    },
  });

  useEffect(() => {
    if (!open && isListening) micStop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (micError) {
      toast({ title: 'Микрофон', description: micError });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micError]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + role);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {
      // ignore
    }
  }, [role]);

  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_PREFIX + role, JSON.stringify(messages.slice(-40)));
      } catch {
        // ignore
      }
    }
  }, [messages, role]);

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, open, loading]);

  const buildSystemPrompt = async (): Promise<string> => {
    const isDomovoy = assistantType === 'domovoy';
    const name = assistantName || (isDomovoy ? 'Домовой' : 'Ассистент');
    const basePrompt = isDomovoy
      ? `Ты добрый домовой, хранитель очага, по имени "${name}". Отвечай на русском языке тёплым семейным языком, с заботой и мудростью предков. Используй эмодзи 🏠🧙‍♂️ для наглядности.`
      : `Ты AI-ассистент по имени "${name}". Отвечай на русском языке профессионально, точно и по делу. Используй эмодзи 🤖⚡ для наглядности.`;

    let prompt = `${basePrompt} ${ROLE_PROMPTS[role] || ''}`;

    // 1. Эзотерический контекст членов семьи (нумерология, астрология, биоритмы)
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const familyCtx = buildFamilyContext(members, userData.id);
      if (familyCtx) prompt += '\n\n' + familyCtx;
    } catch {
      // ignore
    }

    // 2. ЖИВОЙ операционный контекст из БД (финансы, дом, покупки, задачи, события)
    try {
      const liveCtx = await getDomovoyContext();
      if (liveCtx?.summary) {
        prompt += '\n\n' + liveCtx.summary;
      }
    } catch {
      // ignore — Домовой просто ответит без операционного контекста
    }

    if (sectionContext) {
      prompt += '\n\n' + sectionContext;
    }

    return prompt;
  };

  const sendMessage = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = (func2url as Record<string, string>)['ai-assistant'];
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const systemPrompt = await buildSystemPrompt();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          systemPrompt,
          familyId: userData.family_id,
          userId: userData.id,
        }),
      });

      if (response.status === 402) {
        toast({
          title: '💰 Недостаточно средств',
          description: 'Пополните кошелёк для использования AI-помощника',
        });
        setTimeout(() => navigate('/wallet'), 1500);
        return;
      }

      if (response.status === 403) {
        const err = await response.json().catch(() => ({}));
        if (err.error === 'auth_required') {
          toast({ title: '🔐 Необходима регистрация' });
          setTimeout(() => navigate('/login'), 1500);
          return;
        }
      }

      if (!response.ok) {
        throw new Error('request failed');
      }

      const data = await response.json();
      const content = data.response || data.reply || data.message || data.advice || 'Нет ответа';
      const assistantMsg: Message = {
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось получить ответ' });
    } finally {
      setLoading(false);
    }
  };

  const openDomovoyWithRole = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent('domovoy:open-with-role', {
      detail: { role }
    }));
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_PREFIX + role);
  };

  return (
    <>
      <Card
        className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white border-0 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.01]`}
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${avatarBg} border-2 border-white/50 flex items-center justify-center overflow-hidden flex-shrink-0`}>
              <img
                src={resolvedImage}
                alt={title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-1.5">
                {title}
                <Icon name="Sparkles" size={14} className="opacity-80" />
              </h3>
              <p className="text-white/85 text-xs sm:text-sm truncate">{description}</p>
            </div>
            <Icon name="ChevronRight" size={22} className="text-white/70 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-[calc(100vw-1rem)] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className={`p-4 ${accentBg} ${accentBorder} border-b`}>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-16 h-16 rounded-2xl ${avatarBg} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                <img src={resolvedImage} alt={title} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className={`text-base font-bold ${accentText}`}>{title}</div>
                <div className="text-xs text-muted-foreground font-normal truncate">{description}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Индикатор живого контекста — Домовой видит реальные данные семьи */}
          {ctxReady && (
            <div className="px-4 py-2 bg-emerald-50/60 border-b border-emerald-100 flex items-center gap-2">
              <span className="relative flex-shrink-0">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                <span className="relative block w-2 h-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] text-emerald-800 font-medium leading-tight">
                Видит вашу семью
              </span>
              <span className="text-[10px] text-emerald-600/80 truncate">
                {(() => {
                  const facts: string[] = [];
                  if (liveCtx?.family?.members_count) facts.push(`${liveCtx.family.members_count} ${liveCtx.family.members_count === 1 ? 'член' : 'чел'}`);
                  if (liveCtx?.home?.unpaid_utilities_count) facts.push(`${liveCtx.home.unpaid_utilities_count} счёт(ов) к оплате`);
                  if (liveCtx?.shopping?.pending_count) facts.push(`${liveCtx.shopping.pending_count} к покупке`);
                  if (liveCtx?.tasks?.open_count) facts.push(`${liveCtx.tasks.open_count} задач`);
                  return facts.length ? '· ' + facts.slice(0, 3).join(' · ') : '';
                })()}
              </span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh]">
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-4">
                Выберите вопрос или задайте свой
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                    m.role === 'user'
                      ? `${accentBg} ${accentText} ${accentBorder} border`
                      : 'bg-gray-50 border border-gray-200 text-gray-800'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-1 items-center text-xs text-muted-foreground py-2">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-2">Думаю...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickQuestions.map(q => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 rounded-full"
                  disabled={loading}
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          )}

          <div className="p-3 border-t bg-white flex flex-col gap-2">
            {isListening && interim && (
              <div className="px-2 py-1 rounded-lg bg-red-50 border border-red-100 text-[12px] text-red-700 italic truncate">
                «{interim}…»
              </div>
            )}
            <div className="flex gap-2 items-center">
              <MicButton
                isSupported={micSupported}
                isListening={isListening}
                onStart={() => { micReset(); micStart(); }}
                onStop={micStop}
                disabled={loading}
              />
              <Input
                placeholder={isListening ? 'Говорите…' : placeholder}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
                disabled={loading}
                className="flex-1 text-sm"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className={`${accentBg} ${accentText} hover:opacity-90 ${accentBorder} border flex-shrink-0`}
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground h-7 px-2"
                onClick={openDomovoyWithRole}
              >
                <Icon name="ExternalLink" size={12} className="mr-1" />
                Открыть в чате Домового
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground h-7 px-2"
                  onClick={clearHistory}
                >
                  <Icon name="Trash2" size={12} className="mr-1" />
                  Очистить
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}