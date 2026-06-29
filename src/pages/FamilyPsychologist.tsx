import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
// activeTab state is local; consultation state lives in usePsychologist hook
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import SectionAIAdvisor from '@/components/SectionAIAdvisor';
import HeaderAndInstructions from '@/components/psychologist/HeaderAndInstructions';
import { usePsychologist } from '@/components/psychologist/usePsychologist';
import ConsultationTab from '@/components/psychologist/tabs/ConsultationTab';
import RelaxationTab from '@/components/psychologist/tabs/RelaxationTab';
import ExercisesTab from '@/components/psychologist/tabs/ExercisesTab';
import CrisesTab from '@/components/psychologist/tabs/CrisesTab';
import TestsTab from '@/components/psychologist/tabs/TestsTab';
import ProgressTab from '@/components/psychologist/tabs/ProgressTab';

export default function FamilyPsychologist() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('consultation');

  const {
    responseRef,
    question, setQuestion,
    loading, currentResponse, setCurrentResponse,
    consultationHistory,
    activeTimer, timerSeconds,
    exercisesCompleted, relaxationSessions,
    handleSendConsultation,
    startTimer, stopTimer,
    markExerciseComplete,
    getExerciseCompletionCount, getTechniqueCompletionCount,
    getWeeklyActivity, getStreak, getDayLabel,
  } = usePsychologist();

  return (
    <>
      <SEOHead
        title="Семейный ИИ-помощник — идеи для семейных ситуаций, упражнения, релаксация"
        description="Семейный ИИ-помощник: информационный сервис для саморефлексии и семейного диалога. Идеи по воспитанию детей и решению конфликтов, техники релаксации, упражнения, справочник возрастных кризисов от 0 до 19 лет. Не заменяет специалиста."
        path="/psychologist"
      />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-3 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/development-hub')} className="mb-2">
            <Icon name="ArrowLeft" size={18} className="mr-1" />
            Развитие
          </Button>

          <HeaderAndInstructions />

          <SectionAIAdvisor
            role="psychologist"
            title="Семейный ИИ-помощник"
            description="Идеи для размышления над семейными ситуациями"
            gradientFrom="from-fuchsia-500"
            gradientTo="to-purple-600"
            accentBg="bg-fuchsia-50"
            accentText="text-fuchsia-700"
            accentBorder="border-fuchsia-200"
            placeholder="Расскажите, что беспокоит..."
            quickQuestions={[
              'Как помириться после ссоры?',
              'Как справиться со стрессом?',
              'Как говорить с подростком?',
              'Ребёнок не слушается — что делать?',
              'Как восстановить доверие в паре?',
            ]}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full overflow-x-auto flex justify-start gap-0.5 bg-white/60 backdrop-blur-sm p-1 h-auto">
              <TabsTrigger value="consultation" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-nowrap">
                <Icon name="MessageCircle" size={14} className="mr-1" />
                Консультация
              </TabsTrigger>
              <TabsTrigger value="relaxation" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-nowrap">
                <Icon name="Flower2" size={14} className="mr-1" />
                Релаксация
              </TabsTrigger>
              <TabsTrigger value="exercises" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-nowrap">
                <Icon name="Target" size={14} className="mr-1" />
                Упражнения
              </TabsTrigger>
              <TabsTrigger value="crises" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-nowrap">
                <Icon name="Baby" size={14} className="mr-1" />
                Возрасты
              </TabsTrigger>
              <TabsTrigger value="tests" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-nowrap">
                <Icon name="ClipboardList" size={14} className="mr-1" />
                Тесты
              </TabsTrigger>
              <TabsTrigger value="progress" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-nowrap">
                <Icon name="TrendingUp" size={14} className="mr-1" />
                Прогресс
              </TabsTrigger>
            </TabsList>

            <TabsContent value="consultation">
              <ConsultationTab
                question={question}
                setQuestion={setQuestion}
                loading={loading}
                currentResponse={currentResponse}
                setCurrentResponse={setCurrentResponse}
                consultationHistory={consultationHistory}
                responseRef={responseRef}
                handleSendConsultation={handleSendConsultation}
              />
            </TabsContent>

            <TabsContent value="relaxation">
              <RelaxationTab
                activeTimer={activeTimer}
                timerSeconds={timerSeconds}
                startTimer={startTimer}
                stopTimer={stopTimer}
                getTechniqueCompletionCount={getTechniqueCompletionCount}
              />
            </TabsContent>

            <TabsContent value="exercises">
              <ExercisesTab
                markExerciseComplete={markExerciseComplete}
                getExerciseCompletionCount={getExerciseCompletionCount}
              />
            </TabsContent>

            <TabsContent value="crises">
              <CrisesTab setQuestion={setQuestion} setActiveTab={setActiveTab} />
            </TabsContent>

            <TabsContent value="tests">
              <TestsTab />
            </TabsContent>

            <TabsContent value="progress">
              <ProgressTab
                consultationHistory={consultationHistory}
                exercisesCompleted={exercisesCompleted}
                relaxationSessions={relaxationSessions}
                getStreak={getStreak}
                getWeeklyActivity={getWeeklyActivity}
                getDayLabel={getDayLabel}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}