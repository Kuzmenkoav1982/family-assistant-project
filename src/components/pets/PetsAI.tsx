import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';
import type { Pet } from '@/hooks/usePets';

interface Props {
  pet?: Pet | null;
}

const SYSTEM_PROMPT = `Ты — опытный ветеринар и зоопсихолог с 20-летним стажем. Помогаешь владельцам питомцев заботиться о здоровье, поведении и уходе за домашними животными.

ПРАВИЛА:
1. Анализируй питомца с учётом вида, породы, возраста, веса, аллергий
2. Давай конкретные практичные советы
3. Опирайся на доказательную ветеринарию
4. Если симптомы тревожные — настоятельно рекомендуй очный приём у ветеринара
5. Учитывай сезонность, регион проживания (Россия)
6. Не назначай рецептурные препараты — только советы по уходу

ФОРМАТ ОТВЕТА:
🐾 **Коротко о ситуации** — 1-2 предложения
🎯 **Рекомендации** — 3-5 конкретных шагов
⚠️ **Когда срочно к врачу** — тревожные признаки
💡 **Совет** — что упростит уход`;

const QUICK_QUESTIONS: { icon: string; label: string; template: (p?: Pet) => string }[] = [
  {
    icon: 'Syringe',
    label: 'График прививок',
    template: p => `Составь календарь обязательных прививок для моего питомца${p ? ` (${p.species}${p.breed ? ', ' + p.breed : ''}${p.birth_date ? `, родился ${p.birth_date}` : ''})` : ''}. Какие прививки нужны, как часто и с какого возраста?`,
  },
  {
    icon: 'Bone',
    label: 'Подобрать питание',
    template: p => `Помоги подобрать правильный рацион для моего питомца${p ? ` (${p.species}${p.breed ? ', ' + p.breed : ''}${p.weight ? `, вес ${p.weight} кг` : ''}${p.allergies ? `, аллергии: ${p.allergies}` : ''})` : ''}. Какой корм, порции и режим кормления?`,
  },
  {
    icon: 'Activity',
    label: 'Физическая активность',
    template: p => `Сколько и какой активности нужно моему питомцу${p ? ` (${p.species}${p.breed ? ', ' + p.breed : ''})` : ''}? Прогулки, игры, тренировки.`,
  },
  {
    icon: 'Brain',
    label: 'Проблемы поведения',
    template: p => `У моего питомца${p ? ` (${p.species}${p.breed ? ', ' + p.breed : ''})` : ''} проблемы с поведением: `,
  },
  {
    icon: 'Scissors',
    label: 'Уход и груминг',
    template: p => `Какой уход и груминг нужен для${p ? ` ${p.species}${p.breed ? ` породы ${p.breed}` : ''}` : ' моего питомца'}? Как часто мыть, стричь, чистить уши и зубы?`,
  },
  {
    icon: 'AlertTriangle',
    label: 'Тревожные симптомы',
    template: p => `Мой питомец${p ? ` (${p.species}${p.breed ? ', ' + p.breed : ''})` : ''} ведёт себя необычно: `,
  },
];

const HEADER_EMOJIS = ['🐾', '🎯', '⚠️', '💡', '🚀', '📋', '🏋️'];

function formatAnswer(text: string) {
  const parts = text.split(/\n\n+/);
  return parts.map((p, i) => {
    const trimmed = p.trimStart();
    const isHeader = HEADER_EMOJIS.some(e => trimmed.startsWith(e));
    return (
      <p
        key={i}
        className={`text-sm leading-relaxed whitespace-pre-wrap ${isHeader ? 'font-semibold text-gray-900 dark:text-gray-100 mt-2' : 'text-gray-700 dark:text-gray-300'}`}
      >
        {p.replace(/\*\*/g, '')}
      </p>
    );
  });
}

export default function PetsAI({ pet }: Props) {
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const contextLine = pet
    ? `Питомец: ${pet.name}, ${pet.species || 'вид не указан'}${pet.breed ? ', ' + pet.breed : ''}${pet.birth_date ? `, дата рождения ${pet.birth_date}` : ''}${pet.weight ? `, вес ${pet.weight} кг` : ''}${pet.gender ? `, пол ${pet.gender}` : ''}${pet.allergies ? `, аллергии: ${pet.allergies}` : ''}${pet.notes ? `, особенности: ${pet.notes}` : ''}.`
    : '';

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      let userId: string | undefined;
      try {
        const raw = localStorage.getItem('userData');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.id) userId = String(parsed.id);
        }
      } catch {
        userId = undefined;
      }
      if (!userId) {
        const legacy = localStorage.getItem('userId');
        if (legacy) userId = legacy;
      }
      const familyId = localStorage.getItem('familyId') || undefined;

      const payload: Record<string, unknown> = {
        messages: [{ role: 'user', content: contextLine ? `${contextLine}\n\nВопрос: ${q}` : q }],
        systemPrompt: SYSTEM_PROMPT,
      };
      if (userId) payload.userId = userId;
      if (familyId) payload.familyId = familyId;

      const res = await fetch(func2url['ai-assistant'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось получить ответ',
          variant: 'destructive',
        });
        return;
      }
      setAnswer(data.response || data.message || data.content || '');
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: err instanceof Error ? err.message : 'Сбой запроса',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const pickQuick = (template: string) => {
    setQuestion(template);
  };

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Icon name="Sparkles" size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">ИИ-ветеринар</h3>
              <p className="text-xs text-white/80">Советы по здоровью, питанию и уходу</p>
            </div>
          </div>
          {pet && (
            <div className="mt-2 p-2 rounded-lg bg-white/15 backdrop-blur text-xs">
              <Icon name="PawPrint" size={12} className="inline mr-1" />
              Отвечаю с учётом данных о <span className="font-semibold">{pet.name}</span>
              {pet.species && <span className="opacity-80"> · {pet.species}</span>}
              {pet.breed && <span className="opacity-80"> · {pet.breed}</span>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Быстрые темы</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q.label}
                onClick={() => pickQuick(q.template(pet || undefined))}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-950/60 border border-violet-200 dark:border-violet-900/50 text-violet-700 dark:text-violet-300 text-xs font-medium transition-colors"
              >
                <Icon name={q.icon} size={12} />
                {q.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 space-y-2">
          <Textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={3}
            placeholder="Спросите о вашем питомце: симптомы, поведение, питание, уход..."
            className="resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              <Icon name="Info" size={11} className="inline mr-1" />
              Не заменяет очный приём ветеринара
            </p>
            <Button
              onClick={() => ask(question)}
              disabled={loading || !question.trim()}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
            >
              {loading ? (
                <><Icon name="Loader2" size={14} className="mr-1.5 animate-spin" />Думаю...</>
              ) : (
                <><Icon name="Send" size={14} className="mr-1.5" />Спросить</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {answer && (
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-violet-950/20 dark:via-gray-900 dark:to-purple-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                <Icon name="Sparkles" size={10} className="mr-1" />
                ИИ-ответ
              </Badge>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(answer);
                  toast({ title: 'Скопировано' });
                }}
                className="ml-auto text-xs text-muted-foreground hover:text-violet-600"
              >
                <Icon name="Copy" size={12} className="inline mr-1" />
                Копировать
              </button>
            </div>
            <div className="space-y-1.5">{formatAnswer(answer)}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}