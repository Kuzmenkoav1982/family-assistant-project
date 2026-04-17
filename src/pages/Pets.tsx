import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHero from '@/components/ui/section-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';

const PETS_HERO = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/2bc52e5d-939f-4527-a03d-684e81ef60de.jpg';

interface Feature {
  emoji: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

const FEATURES: Feature[] = [
  { emoji: '🐾', icon: 'PawPrint', title: 'Профили питомцев', description: 'Кличка, порода, возраст, фото, особенности', color: 'from-violet-500 to-purple-500' },
  { emoji: '💉', icon: 'Syringe', title: 'Вакцинация', description: 'График прививок, ветпаспорт, напоминания', color: 'from-rose-500 to-pink-500' },
  { emoji: '🩺', icon: 'Stethoscope', title: 'Визиты к ветеринару', description: 'История осмотров, диагнозы, контакты клиник', color: 'from-sky-500 to-blue-500' },
  { emoji: '💊', icon: 'Pill', title: 'Лекарства и витамины', description: 'График приёма, дозировки, напоминания', color: 'from-emerald-500 to-teal-500' },
  { emoji: '🍖', icon: 'Bone', title: 'Питание', description: 'Рацион, любимый корм, аллергии, график', color: 'from-amber-500 to-orange-500' },
  { emoji: '✂️', icon: 'Scissors', title: 'Груминг и уход', description: 'Стрижка, мытьё, обработка от паразитов', color: 'from-fuchsia-500 to-pink-500' },
  { emoji: '🏃', icon: 'Activity', title: 'Активность', description: 'Журнал прогулок, игр, тренировок', color: 'from-green-500 to-emerald-500' },
  { emoji: '💰', icon: 'Wallet', title: 'Расходы', description: 'Учёт трат: корм, врач, игрушки, груминг', color: 'from-yellow-500 to-amber-500' },
  { emoji: '📊', icon: 'LineChart', title: 'Показатели здоровья', description: 'Вес, температура, пульс, поведение', color: 'from-cyan-500 to-sky-500' },
  { emoji: '🎾', icon: 'Package', title: 'База вещей', description: 'Игрушки, миски, поводки, переноски', color: 'from-indigo-500 to-violet-500' },
  { emoji: '👥', icon: 'Users', title: 'Ответственные', description: 'Кто гуляет, кормит, ухаживает', color: 'from-orange-500 to-red-500' },
  { emoji: '📸', icon: 'Camera', title: 'Фотоальбом', description: 'Фото и видео, наблюдение за взрослением', color: 'from-pink-500 to-rose-500' },
];

interface GuideStep {
  num: number;
  icon: string;
  title: string;
  text: string;
}

const GUIDE: GuideStep[] = [
  { num: 1, icon: 'UserPlus', title: 'Создайте профиль питомца', text: 'Добавьте клички, породу, дату рождения и фото каждого любимца — будь то собака, кошка, попугай или рыбка.' },
  { num: 2, icon: 'Syringe', title: 'Заполните медкарту', text: 'Внесите прививки, перенесённые болезни и контакты ветеринара. Система будет напоминать о следующих процедурах.' },
  { num: 3, icon: 'Calendar', title: 'Настройте расписание', text: 'Укажите график кормления, прогулок, приёма лекарств и груминга. Распределите обязанности между членами семьи.' },
  { num: 4, icon: 'Heart', title: 'Следите за здоровьем', text: 'Записывайте вес, аппетит и настроение. Графики покажут динамику и помогут заметить неладное вовремя.' },
];

const FUN_FACTS = [
  { emoji: '🐕', text: 'Собаки различают около 250 слов и жестов — почти как двухлетний ребёнок.' },
  { emoji: '🐈', text: 'Кошки мурлычут на частоте 25–150 Гц, что помогает заживлять кости и снимать стресс.' },
  { emoji: '🦜', text: 'Попугаи жако могут запомнить более 1000 слов и понимать их смысл.' },
  { emoji: '🐢', text: 'Некоторые черепахи живут более 150 лет — ваш внук сможет играть с той же черепашкой.' },
];

export default function Pets() {
  const navigate = useNavigate();
  const [guideOpen, setGuideOpen] = useState(true);
  const [factsOpen, setFactsOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <SectionHero
        title="Питомцы"
        subtitle="Забота о домашних любимцах всей семьёй"
        imageUrl={PETS_HERO}
        backPath="/"
        rightAction={
          <Badge className="bg-amber-400 hover:bg-amber-500 text-amber-950 border-0 shadow-md">
            <Icon name="Sparkles" size={12} className="mr-1" />
            Скоро
          </Badge>
        }
      />

      {/* Мини-инструкция */}
      <Collapsible open={guideOpen} onOpenChange={setGuideOpen} className="mb-4">
        <Card className="overflow-hidden border-violet-200 bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-violet-950/30 dark:via-gray-900 dark:to-purple-950/30">
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 flex items-center justify-between hover:bg-violet-50/60 dark:hover:bg-violet-950/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
                  <Icon name="BookOpen" size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Как пользоваться разделом</h3>
                  <p className="text-xs text-muted-foreground">Быстрая инструкция за 4 шага</p>
                </div>
              </div>
              <Icon
                name="ChevronDown"
                size={20}
                className={`text-violet-500 transition-transform ${guideOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 px-4">
              <div className="space-y-3">
                {GUIDE.map((step) => (
                  <div key={step.num} className="flex gap-3 p-3 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-violet-100 dark:border-violet-900/40">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white font-bold flex items-center justify-center shadow-sm">
                      {step.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon name={step.icon} size={14} className="text-violet-600" />
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{step.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2">
                <Icon name="Lightbulb" size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-semibold">Совет:</span> начните с одного питомца и постепенно заполняйте данные — всё автоматически сохраняется.
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Заголовок функций */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Icon name="Sparkles" size={18} className="text-violet-600" />
          <h2 className="font-bold text-base text-gray-900 dark:text-gray-100">Что будет в разделе</h2>
        </div>
        <Badge variant="secondary" className="text-xs">
          {FEATURES.length} функций
        </Badge>
      </div>

      {/* Сетка функций */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {FEATURES.map((f, i) => (
          <Card
            key={i}
            className="overflow-hidden border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-default group"
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-2 mb-1.5">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-sm text-lg flex-shrink-0`}>
                  {f.emoji}
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight pt-0.5">
                  {f.title}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                {f.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Интересные факты */}
      <Collapsible open={factsOpen} onOpenChange={setFactsOpen} className="mb-4">
        <Card className="overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/30 dark:via-gray-900 dark:to-orange-950/30">
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 flex items-center justify-between hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                  <Icon name="Lightbulb" size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">А вы знали?</h3>
                  <p className="text-xs text-muted-foreground">Удивительные факты о питомцах</p>
                </div>
              </div>
              <Icon
                name="ChevronDown"
                size={20}
                className={`text-amber-500 transition-transform ${factsOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 px-4 space-y-2">
              {FUN_FACTS.map((fact, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-2xl flex-shrink-0">{fact.emoji}</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{fact.text}</p>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* CTA — раздел в разработке */}
      <Card className="overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white border-0 shadow-xl">
        <CardContent className="p-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-3">
            <Icon name="Construction" size={28} className="text-white" />
          </div>
          <h3 className="font-bold text-lg mb-1">Раздел в разработке</h3>
          <p className="text-sm text-white/90 mb-4 max-w-md mx-auto">
            Мы готовим полноценный модуль для заботы о ваших хвостатых. Поддержите разработку — проголосуйте за раздел!
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => navigate('/in-development')}
              className="bg-white text-violet-700 hover:bg-white/90 font-semibold shadow-md"
            >
              <Icon name="ThumbsUp" size={16} className="mr-2" />
              Проголосовать
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white backdrop-blur"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              На главную
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
