import { useState, useEffect } from 'react';
import SurveyStepTwo from '@/components/SurveyStepTwo';
import SurveyStepThree from '@/components/SurveyStepThree';
import PersonalRecommendations from '@/components/PersonalRecommendations';
import { getSurveyUrl } from '@/config/api';
import ProfileNewHeader from '@/components/profile-new/ProfileNewHeader';
import ProfileNewProgress from '@/components/profile-new/ProfileNewProgress';
import ProfileNewStages from '@/components/profile-new/ProfileNewStages';
import ProfileNewRecommendations from '@/components/profile-new/ProfileNewRecommendations';

interface ProfileNewProps {
  userId: number;
  surveyId: number;
  onBack: () => void;
}

interface SurveyStatus {
  stage1_completed: boolean;
  stage2_completed: boolean;
  stage3_completed: boolean;
  user_name: string;
  user_email: string;
}

export default function ProfileNew({ userId, surveyId, onBack }: ProfileNewProps) {
  // Очищаем ID от возможных артефактов вроде "24:1"
  const cleanUserId = typeof userId === 'number' ? userId : parseInt(String(userId).split(':')[0], 10);
  const cleanSurveyId = typeof surveyId === 'number' ? surveyId : parseInt(String(surveyId).split(':')[0], 10);

  const [surveyStatus, setSurveyStatus] = useState<SurveyStatus | null>(null);
  const [currentStage, setCurrentStage] = useState<'dashboard' | 'stage2' | 'stage3' | 'recommendations'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('🏠 ProfileNew mounted with:', {
      original: { userId, surveyId },
      cleaned: { cleanUserId, cleanSurveyId }
    });
    if (!cleanUserId || !cleanSurveyId || isNaN(cleanUserId) || isNaN(cleanSurveyId)) {
      console.error('❌ ProfileNew: Invalid userId or surveyId!', { cleanUserId, cleanSurveyId });
      return;
    }
    loadSurveyStatus();
  }, [cleanUserId, cleanSurveyId]);

  // DEBUG: Выводим состояние для отладки
  useEffect(() => {
    if (surveyStatus) {
      console.log('📊 ProfileNew render state:', {
        surveyId: cleanSurveyId,
        stage1: surveyStatus.stage1_completed,
        stage2: surveyStatus.stage2_completed,
        stage3: surveyStatus.stage3_completed,
        showRecommendations: surveyStatus.stage1_completed === true
      });
    }
  }, [surveyStatus, cleanSurveyId]);

  const loadSurveyStatus = async (isRefresh = false) => {
    try {
      const url = getSurveyUrl('status') + `&survey_id=${cleanSurveyId}`;
      console.log('🔄 Loading survey status from:', url);

      const response = await fetch(url);
      console.log('📡 Survey status response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Survey status loaded:', data);
        setSurveyStatus(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to load survey status:', { status: response.status, error: errorText });
      }
    } catch (error) {
      console.error('💥 Error loading survey status:', error);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  const handleStage2Complete = async (answers: Record<number, any>) => {
    console.log('Saving Stage 2 answers:', { surveyId: cleanSurveyId, answersCount: Object.keys(answers).length });
    try {
      const response = await fetch(getSurveyUrl('submit-stage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: cleanSurveyId,
          stage: 2,
          answers
        })
      });

      const data = await response.json();
      console.log('Stage 2 response:', { status: response.status, data });

      if (response.ok) {
        console.log('🎯 Stage 2 saved successfully, refreshing status...');
        setRefreshing(true);

        await loadSurveyStatus(true);

        setRefreshing(false);
        setCurrentStage('dashboard');
        console.log('✅ Stage 2 complete, returning to dashboard');

        setTimeout(() => {
          alert('✅ Анкета успешно сохранена! Ваши персональные рекомендации обновлены.');
        }, 300);
      } else {
        console.error('❌ Stage 2 save failed:', data);
        alert(`Ошибка при сохранении анкеты: ${data.error || 'Попробуйте снова'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка подключения. Проверьте интернет и попробуйте снова.');
    }
  };

  const handleStage3Complete = async (answers: Record<number, any>) => {
    console.log('Saving Stage 3 answers:', { surveyId: cleanSurveyId, answersCount: Object.keys(answers).length });
    try {
      const response = await fetch(getSurveyUrl('submit-stage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: cleanSurveyId,
          stage: 3,
          answers
        })
      });

      const data = await response.json();
      console.log('Stage 3 response:', { status: response.status, data });

      if (response.ok) {
        // Показываем индикатор обновления
        setRefreshing(true);

        // Перезагружаем статус для обновления индикаторов
        await loadSurveyStatus(true);

        setRefreshing(false);
        setCurrentStage('dashboard');

        // Показываем уведомление об успехе с указанием завершения всех этапов
        setTimeout(() => {
          alert('🎉 Поздравляем! Все анкеты заполнены. Теперь ваши персональные рекомендации максимально точные.');
        }, 300);
      } else {
        console.error('Stage 3 save failed:', data);
        alert(`Ошибка при сохранении анкеты: ${data.error || 'Попробуйте снова'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка подключения. Проверьте интернет и попробуйте снова.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (currentStage === 'stage2') {
    return (
      <SurveyStepTwo
        stepOneData={{ name: '', email: '', gender: '', birthDate: '', goals: [] }}
        onComplete={handleStage2Complete}
        onBack={() => setCurrentStage('dashboard')}
      />
    );
  }

  if (currentStage === 'stage3') {
    return (
      <SurveyStepThree
        onComplete={handleStage3Complete}
        onBack={() => setCurrentStage('dashboard')}
      />
    );
  }

  if (currentStage === 'recommendations') {
    return (
      <PersonalRecommendations
        userId={cleanUserId}
        surveyId={cleanSurveyId}
        onBack={() => setCurrentStage('dashboard')}
      />
    );
  }

  const totalProgress =
    (surveyStatus?.stage1_completed ? 33 : 0) +
    (surveyStatus?.stage2_completed ? 33 : 0) +
    (surveyStatus?.stage3_completed ? 34 : 0);

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto max-w-5xl">
        <ProfileNewHeader
          userName={surveyStatus?.user_name}
          userEmail={surveyStatus?.user_email}
          refreshing={refreshing}
          onBack={onBack}
        />

        {/* Прогресс заполнения */}
        <ProfileNewProgress totalProgress={totalProgress} />

        {/* Карточки этапов */}
        <ProfileNewStages
          stage1Completed={surveyStatus?.stage1_completed}
          stage2Completed={surveyStatus?.stage2_completed}
          stage3Completed={surveyStatus?.stage3_completed}
          onOpenStage2={() => setCurrentStage('stage2')}
          onOpenStage3={() => setCurrentStage('stage3')}
        />

        {/* Персональные рекомендации - доступны на любом этапе */}
        <ProfileNewRecommendations
          stage1Completed={surveyStatus?.stage1_completed}
          stage2Completed={surveyStatus?.stage2_completed}
          stage3Completed={surveyStatus?.stage3_completed}
          onOpenRecommendations={() => setCurrentStage('recommendations')}
        />
      </div>
    </div>
  );
}
