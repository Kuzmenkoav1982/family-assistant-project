import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { AGE_CRISES } from '../data/ageCrises';

interface Props {
  setQuestion: (v: string) => void;
  setActiveTab: (v: string) => void;
}

export default function CrisesTab({ setQuestion, setActiveTab }: Props) {
  const [expandedCrisis, setExpandedCrisis] = useState<string | null>(null);

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
          <Icon name="Baby" size={16} className="text-rose-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Возрастные кризисы детей</h3>
          <p className="text-xs text-gray-500">Что происходит, как помочь, когда к специалисту</p>
        </div>
      </div>

      <Card className="border-rose-200/40 bg-gradient-to-r from-rose-50/60 to-orange-50/40">
        <CardContent className="py-3 px-4 flex items-start gap-2.5">
          <Icon name="ShieldAlert" size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-rose-800 leading-relaxed">
            Информация носит справочный характер и не заменяет консультацию детского психолога или педиатра.
            Если вы наблюдаете тревожные признаки из раздела «Когда к специалисту» — обратитесь к врачу.
          </p>
        </CardContent>
      </Card>

      {AGE_CRISES.map((crisis) => {
        const isExpanded = expandedCrisis === crisis.id;
        return (
          <Card key={crisis.id} className={`transition-all ${isExpanded ? `border-${crisis.color}-300/60 shadow-md bg-white/90` : `border-${crisis.color}-200/40 bg-white/80 backdrop-blur-sm`}`}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandedCrisis(isExpanded ? null : crisis.id)}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br from-${crisis.color}-100 to-${crisis.color}-200 flex items-center justify-center flex-shrink-0`}>
                  <Icon name={crisis.icon} size={22} className={`text-${crisis.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800 text-sm">{crisis.title}</h4>
                  </div>
                  <Badge variant="outline" className={`mt-1 text-[10px] border-${crisis.color}-300 text-${crisis.color}-700`}>
                    {crisis.ageRange}
                  </Badge>
                </div>
                <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-gray-400 flex-shrink-0" />
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-${crisis.color}-50/60 to-${crisis.color}-50/30 border border-${crisis.color}-100`}>
                    <p className="text-sm text-gray-700 leading-relaxed">{crisis.what}</p>
                  </div>

                  <div className={`p-3 rounded-xl bg-${crisis.color}-50/30 border border-${crisis.color}-100/50 text-center`}>
                    <p className="text-xs text-gray-500 mb-1">Ключевая фраза для родителя</p>
                    <p className={`text-sm font-medium text-${crisis.color}-800 italic`}>«{crisis.keyPhrase}»</p>
                    <p className="text-[10px] text-gray-400 mt-1">Длительность: {crisis.duration}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                      <Icon name="AlertTriangle" size={14} className="text-amber-500" />
                      Как распознать
                    </h5>
                    <ul className="space-y-1.5">
                      {crisis.signs.map((sign, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-2" />
                          <span className="text-gray-700">{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                      <Icon name="XCircle" size={14} className="text-red-500" />
                      Ошибки родителей
                    </h5>
                    <ul className="space-y-1.5">
                      {crisis.parentMistakes.map((mistake, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-2" />
                          <span className="text-gray-700">{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                      <Icon name="Heart" size={14} className="text-emerald-500" />
                      Как помочь ребёнку
                    </h5>
                    <ul className="space-y-1.5">
                      {crisis.howToHelp.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50/60 border border-red-200/60">
                    <h5 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-2">
                      <Icon name="Stethoscope" size={14} className="text-red-600" />
                      Когда обратиться к специалисту
                    </h5>
                    <ul className="space-y-1.5">
                      {crisis.whenToDoctor.map((sign, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-red-900/80">{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-teal-300 text-teal-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuestion(`Мой ребёнок переживает ${crisis.title.toLowerCase()} (${crisis.ageRange}). `);
                      setActiveTab('consultation');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <Icon name="MessageCircle" size={14} className="mr-1" />
                    Спросить психолога об этом кризисе
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
