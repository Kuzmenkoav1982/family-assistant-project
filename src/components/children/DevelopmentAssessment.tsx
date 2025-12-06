import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

interface DevelopmentAssessmentProps {
  child: FamilyMember;
  open: boolean;
  onClose: () => void;
  onComplete: (assessmentId: number, planId: number) => void;
}

interface Skill {
  skill_name: string;
  level: 'not' | 'partial' | 'confident';
}

interface Category {
  name: string;
  skills: string[];
}

const AGE_RANGES = [
  { value: '0-6', label: '0-6 месяцев', emoji: '👶' },
  { value: '6-12', label: '6-12 месяцев', emoji: '🍼' },
  { value: '1-2', label: '1-2 года', emoji: '🧸' },
  { value: '2-3', label: '2-3 года', emoji: '🎨' },
  { value: '3-4', label: '3-4 года', emoji: '🚀' },
  { value: '4-5', label: '4-5 лет', emoji: '📚' },
  { value: '5-6', label: '5-6 лет', emoji: '⚽' },
  { value: '6-7', label: '6-7 лет', emoji: '🎓' },
];

const SKILL_LEVELS = [
  { value: 'not', label: 'Не умеет', color: 'bg-red-100 text-red-700' },
  { value: 'partial', label: 'Частично', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confident', label: 'Уверенно', color: 'bg-green-100 text-green-700' },
];

export function DevelopmentAssessment({ child, open, onClose, onComplete }: DevelopmentAssessmentProps) {
  const [step, setStep] = useState<'age' | 'questionnaire' | 'analyzing'>('age');
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [questionnaire, setQuestionnaire] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Map<string, Skill>>(new Map());
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAgeSelect = async (ageRange: string) => {
    setSelectedAge(ageRange);
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://functions.poehali.dev/63148537-9a20-4397-9f79-cc9af652c022?age_range=${ageRange}`
      );

      if (!response.ok) {
        throw new Error('Ошибка загрузки анкеты');
      }

      const data = await response.json();
      setQuestionnaire(data.questionnaire.categories);
      
      const initialSkills = new Map<string, Skill>();
      data.questionnaire.categories.forEach((cat: Category) => {
        cat.skills.forEach((skillName: string) => {
          initialSkills.set(`${cat.name}-${skillName}`, {
            skill_name: skillName,
            level: 'not',
          });
        });
      });
      setSkills(initialSkills);
      
      setStep('questionnaire');
    } catch (err) {
      setError('Не удалось загрузить анкету. Проверьте настройки OPENAI_API_KEY.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (category: string, skillName: string, level: string) => {
    const key = `${category}-${skillName}`;
    setSkills(new Map(skills.set(key, {
      skill_name: skillName,
      level: level as 'not' | 'partial' | 'confident',
    })));
  };

  const handleSubmit = async () => {
    setStep('analyzing');
    setError('');

    try {
      const familyId = localStorage.getItem('familyId') || '';
      
      console.log('[DevelopmentAssessment] skills Map size:', skills.size);
      console.log('[DevelopmentAssessment] skills Map entries:', Array.from(skills.entries()));
      
      const skillsArray = Array.from(skills.entries()).map(([key, skill]) => {
        const category = key.split('-')[0];
        return {
          category,
          skill_name: skill.skill_name,
          skill_level: skill.level,
        };
      });

      const requestBody = {
        child_id: child.id,
        family_id: familyId,
        age_range: selectedAge,
        skills: skillsArray,
      };

      console.log('[DevelopmentAssessment] child.id:', child.id);
      console.log('[DevelopmentAssessment] familyId:', familyId);
      console.log('[DevelopmentAssessment] age_range:', selectedAge);
      console.log('[DevelopmentAssessment] skillsArray length:', skillsArray.length);
      console.log('[DevelopmentAssessment] Sending analysis request:', requestBody);

      const response = await fetch(
        'https://functions.poehali.dev/4f5f584d-55d2-4a42-ae62-dfd8e9f4718e',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      console.log('[DevelopmentAssessment] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[DevelopmentAssessment] Error response:', errorData);
        throw new Error(`Ошибка анализа: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('[DevelopmentAssessment] Success response:', data);
      onComplete(data.assessment_id, data.plan_id);
      onClose();
    } catch (err) {
      console.error('[DevelopmentAssessment] Error:', err);
      setError(`Не удалось выполнить анализ: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      setStep('questionnaire');
    }
  };

  const handleClose = () => {
    if (step === 'analyzing') {
      return;
    }
    setStep('age');
    setSelectedAge('');
    setQuestionnaire([]);
    setSkills(new Map());
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleClose();
      }
    }} modal>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => {
        if (step === 'questionnaire' || step === 'analyzing') {
          e.preventDefault();
        }
      }} onEscapeKeyDown={(e) => {
        if (step === 'questionnaire' || step === 'analyzing') {
          e.preventDefault();
        }
      }}>
        {step === 'age' && (
          <>
            <DialogHeader>
              <DialogTitle>Оценка развития: {child.name}</DialogTitle>
              <DialogDescription>
                Выберите текущий возраст ребёнка для получения персонализированной анкеты
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              {AGE_RANGES.map((range) => (
                <Button
                  key={range.value}
                  variant="outline"
                  className="h-24 flex flex-col gap-2 hover:bg-primary/10"
                  onClick={() => handleAgeSelect(range.value)}
                  disabled={loading}
                >
                  <span className="text-3xl">{range.emoji}</span>
                  <span className="text-sm font-medium">{range.label}</span>
                </Button>
              ))}
            </div>

            {loading && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}
          </>
        )}

        {step === 'questionnaire' && (
          <>
            <DialogHeader>
              <DialogTitle>Анкета развития: {child.name}</DialogTitle>
              <DialogDescription>
                Отметьте уровень владения каждым навыком
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6 py-4">
              {questionnaire.map((category, catIndex) => (
                <Card key={catIndex}>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Icon name="CheckCircle" size={20} className="text-primary" />
                      {category.name}
                    </h3>
                    
                    <div className="space-y-4">
                      {category.skills.map((skillName, skillIndex) => {
                        const key = `${category.name}-${skillName}`;
                        const currentSkill = skills.get(key);
                        
                        return (
                          <div key={skillIndex} className="border-b pb-4 last:border-0">
                            <p className="font-medium mb-3">{skillName}</p>
                            <RadioGroup
                              value={currentSkill?.level || 'not'}
                              onValueChange={(value) => handleSkillChange(category.name, skillName, value)}
                              className="flex gap-3"
                            >
                              {SKILL_LEVELS.map((level) => (
                                <div key={level.value} className="flex items-center">
                                  <RadioGroupItem value={level.value} id={`${key}-${level.value}`} />
                                  <Label
                                    htmlFor={`${key}-${level.value}`}
                                    className={`ml-2 cursor-pointer px-3 py-1 rounded-full text-sm ${
                                      currentSkill?.level === level.value ? level.color : 'bg-gray-100'
                                    }`}
                                  >
                                    {level.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep('age')}>
                <Icon name="ArrowLeft" size={18} className="mr-2" />
                Назад
              </Button>
              <Button onClick={handleSubmit}>
                Получить анализ
                <Icon name="ArrowRight" size={18} className="ml-2" />
              </Button>
            </div>
          </>
        )}

        {step === 'analyzing' && (
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
            <h3 className="text-xl font-semibold">Анализирую развитие...</h3>
            <p className="text-gray-600">
              ИИ сравнивает навыки с возрастными нормами и создаёт персональный план
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}