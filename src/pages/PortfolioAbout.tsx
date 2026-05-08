import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SectionProps {
  num: number;
  icon: string;
  title: string;
  children: React.ReactNode;
}

function Section({ num, icon, title, children }: SectionProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name={icon} size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              Раздел {num}
            </p>
            <h2 className="text-lg font-semibold leading-tight">{title}</h2>
          </div>
        </div>
        <div className="text-sm text-foreground/80 leading-relaxed space-y-2 pl-12">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

interface SphereCardProps {
  icon: string;
  title: string;
  description: string;
}

function SphereCard({ icon, title, description }: SphereCardProps) {
  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-2 mb-1">
        <Icon name={icon} size={14} className="text-primary" />
        <p className="text-sm font-medium">{title}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-snug">{description}</p>
    </div>
  );
}

export default function PortfolioAbout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <SEOHead
        title="Как работает Портфолио развития"
        description="Карта развития ребёнка на основе данных семьи"
      />
      <div className="container mx-auto max-w-3xl px-4 py-6 md:py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <Icon name="ArrowLeft" size={14} />
          Назад
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-full bg-primary/10 items-center justify-center mb-3">
            <Icon name="Sparkles" size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Как работает Портфолио развития
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Прозрачно о том, что собирает Портфолио, как формирует картину и почему даёт именно
            такие подсказки.
          </p>
        </div>

        <div className="space-y-4">
          <Section num={1} icon="MapPin" title="Что такое Портфолио">
            <p>
              Портфолио — это <span className="font-medium">карта развития ребёнка</span> по
              данным вашей семьи. Не экзамен, не оценка личности и не диагноз.
            </p>
            <p>
              Это инструмент, который помогает увидеть, где ребёнок чувствует себя сильно, а где
              нужно немного внимания, и подсказывает следующий полезный шаг.
            </p>
          </Section>

          <Section num={2} icon="Heart" title="Что оно даёт семье">
            <ul className="space-y-1.5 list-none">
              <li className="flex items-start gap-2">
                <Icon name="Check" size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <span>увидеть сильные стороны ребёнка;</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <span>заметить, какие сферы пока заполнены меньше;</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <span>отслеживать изменения со временем;</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <span>собирать достижения, привычки и наблюдения в одном месте;</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <span>получать понятные следующие шаги развития.</span>
              </li>
            </ul>
          </Section>

          <Section num={3} icon="Database" title="Откуда берутся данные">
            <p>
              Картину собирают данные, которые семья уже ведёт в приложении:
            </p>
            <ul className="space-y-1 list-none mt-2">
              <li className="flex items-start gap-2">
                <Icon name="User" size={13} className="text-muted-foreground mt-1 flex-shrink-0" />
                <span><span className="font-medium">Оценки родителя</span> — ваши личные наблюдения по сферам.</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Users" size={13} className="text-muted-foreground mt-1 flex-shrink-0" />
                <span><span className="font-medium">Семейные данные</span> — традиции, ритуалы, активности, кружки.</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Trophy" size={13} className="text-muted-foreground mt-1 flex-shrink-0" />
                <span><span className="font-medium">Достижения</span> — награды, грамоты, важные моменты.</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Activity" size={13} className="text-muted-foreground mt-1 flex-shrink-0" />
                <span><span className="font-medium">Регулярные записи</span> — дневник настроения, привычки, чтение.</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Stethoscope" size={13} className="text-muted-foreground mt-1 flex-shrink-0" />
                <span><span className="font-medium">Здоровье</span> — рост, вес, прививки, плановые визиты.</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              Все данные остаются в вашей семье и не используются для сравнения с другими детьми.
            </p>
          </Section>

          <Section num={4} icon="Layers" title="8 сфер развития">
            <p className="mb-3">
              Картина строится по 8 сферам — это привычные ориентиры, в которых развивается любой
              ребёнок:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <SphereCard
                icon="Brain"
                title="Интеллект"
                description="Любознательность, обучение, чтение, навыки решения задач."
              />
              <SphereCard
                icon="Heart"
                title="Чувства"
                description="Эмоциональная грамотность, умение замечать и называть эмоции."
              />
              <SphereCard
                icon="Activity"
                title="Тело"
                description="Здоровье, физическая активность, сон, режим, моторика."
              />
              <SphereCard
                icon="Palette"
                title="Творчество"
                description="Самовыражение, любимые занятия, проекты и идеи."
              />
              <SphereCard
                icon="Users"
                title="Общение"
                description="Дружба, командная игра, навыки разговора и сопереживания."
              />
              <SphereCard
                icon="Wallet"
                title="Финансы"
                description="Понимание денег, планирование трат, первые накопления."
              />
              <SphereCard
                icon="Compass"
                title="Ценности"
                description="Семейные традиции, нравственные ориентиры, ответственность."
              />
              <SphereCard
                icon="Wrench"
                title="Жизненные навыки"
                description="Самообслуживание, бытовые умения, самостоятельность."
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Подробности по каждой сфере видны прямо в профиле ребёнка и в источниках данных.
            </p>
          </Section>

          <Section num={5} icon="Gauge" title="Как читать баллы по сферам">
            <p>
              Балл по сфере — это <span className="font-medium">ориентир</span> по тем данным,
              которые сейчас есть в семье. Это не итоговая оценка ребёнка и не норма.
            </p>
            <p>
              Сравнение всегда идёт <span className="font-medium">с самим собой во времени</span>:
              что изменилось за месяц, за квартал. Не сравниваем детей между собой.
            </p>
            <p>
              Если по сфере данных мало — балл может не показываться, чтобы не делать поспешных
              выводов.
            </p>
          </Section>

          <Section num={6} icon="ShieldCheck" title="Что означает полнота картины">
            <p>
              Рядом с баллами вы увидите подпись «Достоверно», «Предварительно» или «Мало
              данных». Это означает, насколько полная картина по сфере прямо сейчас.
            </p>
            <p>Картина считается точнее, когда есть:</p>
            <ul className="space-y-1 list-none mt-1">
              <li className="flex items-start gap-2">
                <Icon name="Layers3" size={13} className="text-primary mt-1 flex-shrink-0" />
                <span><span className="font-medium">Полнота</span> — данные есть из нескольких источников.</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Clock" size={13} className="text-primary mt-1 flex-shrink-0" />
                <span><span className="font-medium">Свежесть</span> — записи обновлялись недавно.</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Shapes" size={13} className="text-primary mt-1 flex-shrink-0" />
                <span><span className="font-medium">Разнообразие</span> — есть и наблюдения родителя, и события из жизни.</span>
              </li>
            </ul>
          </Section>

          <Section num={7} icon="Lightbulb" title="Откуда берутся рекомендации">
            <p>
              Подсказки появляются на основе текущей картины по сфере, возраста ребёнка,
              динамики и активных планов развития.
            </p>
            <p>
              <span className="font-medium">Если данных пока мало</span> — рекомендации более
              общие («добавьте ещё несколько записей»).
            </p>
            <p>
              <span className="font-medium">Если картина уже полная</span> — подсказки становятся
              предметнее («введите 1 семейный ритуал», «закрепите навык 2 раза в неделю»).
            </p>
            <p className="text-xs text-muted-foreground">
              Советы AI-помощника всегда отмечены отдельно — это интерпретация, которую полезно
              сверить с тем, что вы знаете о своей семье.
            </p>
          </Section>

          <Section num={8} icon="Plus" title="Что делать, если данных мало">
            <p>
              Если по какой-то сфере картина «предварительная», добавьте 2–3 свежие записи в
              связанные разделы — и она станет точнее.
            </p>
            <p>
              Прямо в портфолио откройте раздел <span className="font-medium">«Источники
              данных»</span> — там видно, что уже учтено и что можно добавить, с быстрыми
              переходами в нужный раздел приложения.
            </p>
          </Section>

          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <Icon name="AlertCircle" size={18} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Что Портфолио НЕ делает</h2>
                  <ul className="space-y-1.5 text-sm text-foreground/80">
                    <li className="flex items-start gap-2">
                      <Icon name="X" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      не ставит ребёнку диагноз;
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="X" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      не клеит ярлык и не определяет «какой ребёнок»;
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="X" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      не сравнивает детей между собой;
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="X" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      не заменяет психолога, педагога или врача;
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="X" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      не является итоговой оценкой развития ребёнка.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5 text-center">
              <Icon name="Sparkles" size={24} className="text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Готовы начать?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Откройте профиль ребёнка и посмотрите, как складывается картина по 8 сферам.
              </p>
              <Button asChild>
                <Link to="/portfolio">
                  <Icon name="ArrowRight" size={14} className="mr-1" />
                  Открыть Портфолио
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
