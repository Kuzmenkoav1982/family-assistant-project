import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDialogLock } from '@/contexts/DialogLockContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GradientSlider } from '@/components/ui/slider';
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
  score: number;
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
  { value: '7-8', label: '7-8 лет', emoji: '🎮' },
  { value: '8-9', label: '8-9 лет', emoji: '🔬' },
  { value: '9-10', label: '9-10 лет', emoji: '🏆' },
  { value: '10-12', label: '10-12 лет', emoji: '🚀' },
];

const getScoreColor = (score: number): string => {
  if (score <= 3) return 'text-red-600';
  if (score <= 6) return 'text-yellow-600';
  return 'text-green-600';
};

const getScoreLabel = (score: number): string => {
  if (score === 0) return 'Совсем не умеет';
  if (score <= 2) return 'Только начинает';
  if (score <= 4) return 'Получается с трудом';
  if (score <= 6) return 'Получается неплохо';
  if (score <= 8) return 'Хорошо владеет';
  if (score === 9) return 'Почти отлично';
  return 'Владеет в совершенстве';
};

export function DevelopmentAssessment({ child, open, onClose, onComplete }: DevelopmentAssessmentProps) {
  const queryClient = useQueryClient();
  const { lockUpdates, unlockUpdates } = useDialogLock();
  const [step, setStep] = useState<'age' | 'questionnaire' | 'analyzing'>('age');
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [questionnaire, setQuestionnaire] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Map<string, Skill>>(new Map());
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('[DevelopmentAssessment] open changed:', open);
    if (open) {
      console.log('[DevelopmentAssessment] LOCKING all updates');
      lockUpdates();
      queryClient.cancelQueries();
      // Автоопределение возраста
      const childAge = child.age || 0;
      if (childAge >= 0 && childAge <= 0.5) setSelectedAge('0-6');
      else if (childAge > 0.5 && childAge <= 1) setSelectedAge('6-12');
      else if (childAge > 1 && childAge <= 2) setSelectedAge('1-2');
      else if (childAge > 2 && childAge <= 3) setSelectedAge('2-3');
      else if (childAge > 3 && childAge <= 4) setSelectedAge('3-4');
      else if (childAge > 4 && childAge <= 5) setSelectedAge('4-5');
      else if (childAge > 5 && childAge <= 6) setSelectedAge('5-6');
      else if (childAge > 6 && childAge <= 7) setSelectedAge('6-7');
      else if (childAge > 7 && childAge <= 8) setSelectedAge('7-8');
      else if (childAge > 8 && childAge <= 9) setSelectedAge('8-9');
      else if (childAge > 9 && childAge <= 10) setSelectedAge('9-10');
      else if (childAge > 10) setSelectedAge('10-12');
    } else {
      console.log('[DevelopmentAssessment] UNLOCKING updates');
      unlockUpdates();
    }
  }, [open, queryClient, lockUpdates, unlockUpdates, child.age]);

  useEffect(() => {
    console.log('[DevelopmentAssessment] Component mounted/updated');
    return () => {
      console.log('[DevelopmentAssessment] Component unmounting!');
    };
  }, []);

  const handleAgeSelect = async (ageRange: string) => {
    setSelectedAge(ageRange);
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://functions.poehali.dev/63148537-9a20-4397-9f79-cc9af652c022?age_range=${ageRange}`
      );

      if (!response.ok) {
        let errorMessage = 'Ошибка загрузки анкеты';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `Ошибка сервера (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.questionnaire || !data.questionnaire.categories) {
        throw new Error('Неверный формат анкеты');
      }
      
      setQuestionnaire(data.questionnaire.categories);
      
      const initialSkills = new Map<string, Skill>();
      data.questionnaire.categories.forEach((cat: Category) => {
        cat.skills.forEach((skillName: string) => {
          initialSkills.set(`${cat.name}-${skillName}`, {
            skill_name: skillName,
            score: 5,
          });
        });
      });
      setSkills(initialSkills);
      
      setStep('questionnaire');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить анкету';
      setError(errorMessage);
      console.error('[DevelopmentAssessment] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (category: string, skillName: string, score: number) => {
    const key = `${category}-${skillName}`;
    setSkills(new Map(skills.set(key, {
      skill_name: skillName,
      score,
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
          skill_level: skill.score >= 7 ? 'confident' : skill.score >= 4 ? 'partial' : 'not',
          skill_score: skill.score,
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
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        console.log('[DevelopmentAssessment] onOpenChange called:', { isOpen, step, currentOpen: open });
        // Разрешаем закрытие только на этапе выбора возраста
        if (!isOpen && step === 'age') {
          console.log('[DevelopmentAssessment] Allowing close on age step');
          handleClose();
        } else if (!isOpen) {
          console.log('[DevelopmentAssessment] BLOCKING close attempt on step:', step);
        }
      }} 
      modal={true}
    >
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto w-[calc(100vw-1rem)] sm:w-full" 
        onInteractOutside={(e) => {
          // Разрешаем закрытие только на этапе выбора возраста
          if (step !== 'age') {
            e.preventDefault();
          }
        }} 
        onPointerDownOutside={(e) => {
          if (step !== 'age') {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (step !== 'age') {
            e.preventDefault();
          }
        }}
      >
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

            {selectedAge && (
              <div className="flex justify-center py-2">
                <Button
                  onClick={() => handleAgeSelect(selectedAge)}
                  disabled={loading}
                  className="gap-2"
                >
                  <Icon name="Zap" size={18} />
                  Использовать текущий возраст ({AGE_RANGES.find(r => r.value === selectedAge)?.label})
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 max-h-[60vh] overflow-y-auto">
              {AGE_RANGES.map((range) => (
                <Button
                  key={range.value}
                  variant={selectedAge === range.value ? "default" : "outline"}
                  className={`h-20 sm:h-24 flex flex-col gap-1 sm:gap-2 hover:bg-primary/10 transition-all ${
                    selectedAge === range.value ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  onClick={() => handleAgeSelect(range.value)}
                  disabled={loading}
                >
                  <span className="text-2xl sm:text-3xl">{range.emoji}</span>
                  <span className="text-xs sm:text-sm font-medium">{range.label}</span>
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
                Оцените уровень владения каждым навыком по шкале от 0 до 10
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
                    
                    <div className="space-y-6">
                      {category.skills.map((skillName, skillIndex) => {
                        const key = `${category.name}-${skillName}`;
                        const currentSkill = skills.get(key);
                        const score = currentSkill?.score ?? 5;
                        
                        return (
                          <div key={skillIndex} className="border-b pb-6 last:border-0">
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-medium flex-1">{skillName}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                                  {score}
                                </span>
                                <span className="text-xs text-gray-500">/ 10</span>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <GradientSlider
                                value={[score]}
                                onValueChange={([value]) => handleSkillChange(category.name, skillName, value)}
                                min={0}
                                max={10}
                                step={1}
                                className="w-full"
                              />
                              
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-red-600 font-medium">0 - Не умеет</span>
                                <span className={`font-semibold text-sm ${getScoreColor(score)}`}>
                                  {getScoreLabel(score)}
                                </span>
                                <span className="text-green-600 font-medium">10 - Отлично</span>
                              </div>
                            </div>
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