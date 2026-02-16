import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { VotingWidget } from '@/components/VotingWidget';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';

export default function VotingPage() {
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Голосования"
          subtitle="Семейные решения демократично"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/7db4e4eb-f20a-44c7-81de-270d03d22da1.jpg"
        />

        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
          <Alert className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <div className="flex items-start gap-3">
              <Icon name="Vote" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                  <h3 className="font-semibold text-indigo-900 text-sm">Как работают голосования</h3>
                  <Icon name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-indigo-800">
                    <div className="space-y-2 text-xs">
                      <div className="p-1.5 bg-white/60 rounded border-l-3 border-indigo-500">
                        <p className="font-medium">1. Создайте голосование</p>
                        <p className="text-[11px] text-indigo-700">Вопрос, варианты ответа, срок голосования</p>
                      </div>
                      <div className="p-1.5 bg-white/60 rounded border-l-3 border-indigo-500">
                        <p className="font-medium">2. Семья голосует</p>
                        <p className="text-[11px] text-indigo-700">Каждый выбирает понравившийся вариант</p>
                      </div>
                      <div className="p-1.5 bg-white/60 rounded border-l-3 border-indigo-500">
                        <p className="font-medium">3. Результаты</p>
                        <p className="text-[11px] text-indigo-700">Автоматический подсчёт, прозрачный итог</p>
                      </div>
                      <div className="bg-white/50 p-2 rounded-lg">
                        <p className="font-medium text-xs mb-0.5">Примеры вопросов</p>
                        <p className="text-[11px]">
                          Что приготовить на ужин? Куда поехать на выходные? Какой фильм посмотреть? Какую настольную игру купить?
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: 'MessageCircle', title: 'Создать', desc: 'Предложите вопрос', gradient: 'from-indigo-500 to-blue-600' },
            { icon: 'Users', title: 'Голосовать', desc: 'Каждый голос важен', gradient: 'from-purple-500 to-pink-600' },
            { icon: 'BarChart3', title: 'Результаты', desc: 'Прозрачный итог', gradient: 'from-emerald-500 to-teal-600' },
          ].map((item) => (
            <Card key={item.title} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  <div className={`w-16 min-h-full bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={item.icon} size={26} className="text-white drop-shadow-sm" />
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <VotingWidget />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
