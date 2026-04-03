import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import useDietProgress from '@/hooks/useDietProgress';
import StatsCards from '@/components/diet-progress/StatsCards';
import AnalysisCard from '@/components/diet-progress/AnalysisCard';
import WeightChart from '@/components/diet-progress/WeightChart';
import TodayMeals from '@/components/diet-progress/TodayMeals';
import { ActivityCard, ActivityModal, SOSModal, FinalReportModal, NotifSettingsModal } from '@/components/diet-progress/DietModals';

export default function DietProgress() {
  const navigate = useNavigate();
  const d = useDietProgress();

  if (d.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!d.data?.has_plan) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-violet-50 via-white to-white pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-6" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>
          <SectionHero
            title="Прогресс диеты"
            subtitle="Отслеживание результатов и мотивация"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/9b9c25c5-e1ad-46e1-8b47-77c770806985.jpg"
            backPath="/nutrition"
          />
          <Card className="border-2 border-dashed border-violet-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                <Icon name="TrendingUp" size={32} className="text-violet-500" />
              </div>
              <h2 className="text-lg font-bold mb-2">Нет активного плана</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Создайте план питания, чтобы отслеживать прогресс
              </p>
              <Button onClick={() => navigate('/nutrition')} className="bg-violet-600">
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                К питанию
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { plan, stats } = d;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-violet-50 via-white to-white pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>

        <SectionHero
          title="Прогресс диеты"
          subtitle={`День ${stats?.days_elapsed || 0} из ${plan?.duration_days || 0}`}
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/9b9c25c5-e1ad-46e1-8b47-77c770806985.jpg"
          backPath="/nutrition"
          rightAction={
            <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 bg-white/80" onClick={() => d.setShowSOS(true)}>
              <Icon name="LifeBuoy" size={16} />
              <span className="ml-1">SOS</span>
            </Button>
          }
        />

        {stats && (
          <StatsCards stats={stats} plan={plan} tip={d.data!.tip} onWeightFormOpen={() => d.setShowWeightForm(true)} />
        )}

        {stats && stats.days_elapsed >= 3 && (
          <AnalysisCard
            analysis={d.analysis}
            loadingAnalysis={d.loadingAnalysis}
            adjusting={d.adjusting}
            onAnalyze={d.handleAnalyze}
            onAdjust={d.handleAdjust}
            onHide={() => d.setAnalysis(null)}
          />
        )}

        <WeightChart
          weightChartData={d.weightChartData}
          targetWeight={d.targetWeight}
          minW={d.minW}
          maxW={d.maxW}
          range={d.range}
          showWeightForm={d.showWeightForm}
          newWeight={d.newWeight}
          setNewWeight={d.setNewWeight}
          wellbeing={d.wellbeing}
          setWellbeing={d.setWellbeing}
          savingWeight={d.savingWeight}
          onLogWeight={d.handleLogWeight}
          onShowForm={() => d.setShowWeightForm(true)}
          onHideForm={() => d.setShowWeightForm(false)}
        />

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2">
                <Icon name="Sparkles" size={18} className="text-amber-500" />
                Мотивация
              </h3>
              <Button size="sm" variant="ghost" onClick={d.handleMotivation} disabled={d.loadingMotivation}>
                {d.loadingMotivation ? (
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon name="RefreshCw" size={14} />
                )}
              </Button>
            </div>
            {d.motivation ? (
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <p className="text-sm leading-relaxed">{d.motivation}</p>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={d.handleMotivation} disabled={d.loadingMotivation}>
                <Icon name="Sparkles" size={16} className="mr-2" />
                {d.loadingMotivation ? 'Генерирую...' : 'Получить мотивацию от ИИ'}
              </Button>
            )}
          </CardContent>
        </Card>

        <TodayMeals
          meals={d.today_meals}
          markingMeal={d.markingMeal}
          mealMenu={d.mealMenu}
          setMealMenu={d.setMealMenu}
          onEat={d.handleEatMeal}
          onUndo={d.handleUndoMeal}
          onSaveRecipe={d.handleSaveRecipe}
          onAddToShopping={d.handleAddToShopping}
        />

        {plan && (
          <ActivityCard plan={plan} todayActivity={d.todayActivity} onOpen={() => d.setShowActivity(true)} />
        )}

        <ActivityModal
          show={d.showActivity}
          onClose={() => d.setShowActivity(false)}
          actSteps={d.actSteps} setActSteps={d.setActSteps}
          actType={d.actType} setActType={d.setActType}
          actDuration={d.actDuration} setActDuration={d.setActDuration}
          actNote={d.actNote} setActNote={d.setActNote}
          savingActivity={d.savingActivity}
          onSave={d.handleSaveActivity}
        />

        {stats && stats.days_remaining <= 3 && stats.days_remaining >= 0 && (
          <Card className="border-2 border-amber-300 bg-amber-50/50">
            <CardContent className="p-4">
              <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-2">
                <Icon name="Flag" size={18} className="text-amber-600" />
                {stats.days_remaining === 0 ? 'План завершается сегодня!' : `До конца плана: ${stats.days_remaining} дн.`}
              </h3>
              <p className="text-sm text-amber-800 mb-3">
                {stats.days_remaining === 0
                  ? 'Посмотрите итоговый отчёт и решите, что дальше — продлить или закрепить результат.'
                  : 'Скоро финиш! Можно посмотреть промежуточные результаты.'}
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-amber-600" onClick={d.handleFinalReport}>
                  <Icon name="BarChart3" size={14} className="mr-1" />
                  Итоговый отчёт
                </Button>
                <Button size="sm" variant="outline" className="border-amber-400" onClick={() => d.handleExtendPlan(7)} disabled={d.extending}>
                  <Icon name="Plus" size={14} className="mr-1" />
                  +7 дней
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2 text-sm">
                  <Icon name="Bell" size={16} className="text-violet-600" />
                  Уведомления
                </h3>
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { d.setShowNotifSettings(true); d.fetchNotifSettings(); }}>
                  <Icon name="Settings" size={12} className="mr-1" />
                  Настроить
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="shrink-0">
            <CardContent className="p-4">
              <Button size="sm" variant="ghost" className="text-xs h-auto py-0" onClick={d.handleFinalReport}>
                <Icon name="FileText" size={16} className="text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <NotifSettingsModal
          show={d.showNotifSettings}
          onClose={() => d.setShowNotifSettings(false)}
          settings={d.notifSettings}
          loadingNotif={d.loadingNotif}
          savingNotif={d.savingNotif}
          onToggle={d.toggleNotif}
          onUpdateTime={d.updateNotifTime}
          onUpdateInterval={(type, minutes) => d.setNotifSettings(prev => prev.map(x => x.type === type ? { ...x, interval_minutes: minutes } : x))}
          onSave={d.saveNotifSettings}
        />

        <FinalReportModal
          show={d.showFinalReport}
          onClose={() => d.setShowFinalReport(false)}
          loadingReport={d.loadingReport}
          finalReport={d.finalReport}
          extending={d.extending}
          finishing={d.finishing}
          onExtend={d.handleExtendPlan}
          onFinish={d.handleFinishPlan}
        />

        <SOSModal
          show={d.showSOS}
          sosResponse={d.sosResponse}
          sosComment={d.sosComment}
          setSosComment={d.setSosComment}
          sendingSOS={d.sendingSOS}
          onSOS={d.handleSOS}
          onClose={() => d.setShowSOS(false)}
          onDismiss={() => { d.setShowSOS(false); d.setSosResponse(null); d.setSosComment(''); }}
        />

      </div>
    </div>
  );
}
