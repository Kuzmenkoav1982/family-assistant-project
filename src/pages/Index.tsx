import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useFamilyData } from '@/hooks/useFamilyData';
import { ChildEducation } from '@/components/ChildEducation';
import { ClickChamomile } from '@/components/ClickChamomile';
import Footer from '@/components/Footer';
import WidgetSettings from '@/components/WidgetSettings';
import type { FamilyMember, FamilyGoal } from '@/types/family.types';
import { getThemeClasses } from '@/config/themes';
import { initialComplaints } from '@/data/mockData';
import { FamilyTabsContent } from '@/components/FamilyTabsContent';
import { FamilyMembersGrid } from '@/components/FamilyMembersGrid';
import { GoalsSection } from '@/components/GoalsSection';
import { languageOptions, type LanguageCode } from '@/translations';
import { WelcomeScreen } from '@/components/index-page/WelcomeScreen';
import { IndexLayout } from '@/components/index-page/IndexLayout';
import { IndexDialogs } from '@/components/index-page/IndexDialogs';
import HomeHero from '@/components/index-page/HomeHero';
import { ComplaintBook } from '@/components/ComplaintBook';
import AIAssistantDialog from '@/components/AIAssistantDialog';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { FirstLoginWelcome } from '@/components/FirstLoginWelcome';
import { useDevSectionVotes } from '@/hooks/useDevSectionVotes';
import { useBirthdayReminders } from '@/hooks/useBirthdayReminders';
import { useCalendarReminders } from '@/hooks/useCalendarReminders';
import { useDietReminders } from '@/hooks/useDietReminders';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import PanelSettings from '@/components/PanelSettings';
import useIndexState from '@/hooks/useIndexState';
import useIndexEffects from '@/hooks/useIndexEffects';
import useIndexHandlers from '@/hooks/useIndexHandlers';
import DevSectionDialog from '@/components/index-page/DevSectionDialog';
import CohesionTabContent from '@/components/index-page/CohesionTabContent';
import TasksTabContent from '@/components/index-page/TasksTabContent';
import CalendarTabContent from '@/components/index-page/CalendarTabContent';
import ChildrenTabContent from '@/components/index-page/ChildrenTabContent';
import ValuesTabContent from '@/components/index-page/ValuesTabContent';
import TraditionsTabContent from '@/components/index-page/TraditionsTabContent';
import ShoppingTabContent from '@/components/index-page/ShoppingTabContent';
import ChatTabContent from '@/components/index-page/ChatTabContent';
import RulesTabContent from '@/components/index-page/RulesTabContent';
import AboutTabContent from '@/components/index-page/AboutTabContent';
import WidgetsSidebar from '@/components/index-page/WidgetsSidebar';
import { availableSections, availableTopPanelSections } from '@/data/indexSectionsData';

interface IndexProps {
  onLogout?: () => void;
}

export default function Index({ onLogout }: IndexProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { members: familyMembersRaw, loading: membersLoading, addMember, updateMember, deleteMember } = useFamilyMembersContext();
  const { tasks: tasksRaw, loading: tasksLoading, createTask, updateTask, deleteTask, toggleTask: toggleTaskDB } = useTasks();
  const { syncing } = useFamilyData();
  const { hasCompletedSetup } = useAIAssistant();
  const { events: calendarEventsAPI } = useCalendarEvents();
  const { votes: devSectionVotes, castVote: castDevVote } = useDevSectionVotes();

  const familyMembers = familyMembersRaw || [];
  const tasks = tasksRaw || [];

  useBirthdayReminders();
  useCalendarReminders();
  useDietReminders();

  const state = useIndexState();

  useIndexEffects({
    state,
    tasks,
    hasCompletedSetup,
    searchParams,
  });

  const authUser = localStorage.getItem('userData');
  const authUserData = authUser ? JSON.parse(authUser) : null;
  const currentUser = authUserData?.member_id
    ? familyMembers.find(m => m.id === authUserData.member_id) || familyMembers[0]
    : familyMembers[0];
  const currentUserId = currentUser?.id || familyMembers[0]?.id || '';

  const handlers = useIndexHandlers({
    state,
    familyMembers,
    tasks,
    currentUserId,
    currentUser,
    onLogout,
    navigate,
    toggleTaskDB,
    updateMember,
    castDevVote,
    devSectionVotes,
  });

  const calendarEvents = calendarEventsAPI || [];
  const setCalendarEvents = () => {
    console.warn('[Index] setCalendarEvents is deprecated, use useCalendarEvents hook instead');
  };

  const setFamilyMembers = (value: FamilyMember[] | ((prev: FamilyMember[]) => FamilyMember[])) => {
    console.warn('setFamilyMembers deprecated, use updateMember instead');
  };

  const menuSections = availableSections.map(s => ({ ...s, ready: true }));

  const getSectionTitle = (sectionId: string) => {
    const section = menuSections.find(s => s.id === sectionId);
    return section?.label || 'Семейный Органайзер';
  };

  const themeClasses = getThemeClasses(state.currentTheme);
  const totalPoints = familyMembers.reduce((sum, member) => sum + member.points, 0);
  const avgWorkload = familyMembers.length > 0
    ? Math.round(familyMembers.reduce((sum, member) => sum + member.workload, 0) / familyMembers.length)
    : 0;
  const completedTasks = (tasks || []).filter(t => t.completed).length;
  const totalTasks = (tasks || []).length;

  if (membersLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Загрузка данных семьи...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Главная — управление семьёй онлайн" description="Единая платформа для семьи: профили, задачи, здоровье, питание, финансы, путешествия, развитие. ИИ-помощник Кузя и Домовой для всей семьи." path="/" />
      <IndexDialogs
        showFamilyInvite={state.showFamilyInvite}
        showAssistantSelector={state.showAssistantSelector}
        onFamilyInviteChange={state.setShowFamilyInvite}
        onAssistantSelectorChange={state.setShowAssistantSelector}
      />

      <WelcomeScreen
        show={state.showWelcome}
        familyName={state.familyName}
        familyLogo={state.familyLogo}
        welcomeText={state.welcomeText}
        onClose={() => {
          state.setShowWelcome(false);
          localStorage.setItem('hasSeenWelcome', 'true');
        }}
      />

      <FirstLoginWelcome
        isFirstLogin={state.showFirstLoginWelcome}
        onClose={() => state.setShowFirstLoginWelcome(false)}
      />

      <IndexLayout
        currentTheme={state.currentTheme}
        themeClasses={themeClasses}
      >
        <div className="max-w-5xl mx-auto space-y-4 animate-fade-in p-4 pb-24">
          <HomeHero
            familyName={state.familyName}
            familyLogo={state.familyLogo}
            familyBanner={state.familyBanner}
            syncing={syncing}
          />

          <DevSectionDialog
            selectedDevSection={state.selectedDevSection}
            onClose={() => state.setSelectedDevSection(null)}
            showCommentDialog={state.showCommentDialog}
            setShowCommentDialog={state.setShowCommentDialog}
            voteComment={state.voteComment}
            setVoteComment={state.setVoteComment}
            pendingVote={state.pendingVote}
            setPendingVote={state.setPendingVote}
            handleDevSectionVote={handlers.handleDevSectionVote}
            handleSubmitVoteWithComment={handlers.handleSubmitVoteWithComment}
            getDevSectionVotes={handlers.getDevSectionVotes}
          />

          {state.activeSection !== 'family' && (
            <div className="bg-white/80 rounded-xl border px-5 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Icon name={menuSections.find(s => s.id === state.activeSection)?.icon || 'Home'} size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{getSectionTitle(state.activeSection)}</h2>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
            <div className="lg:col-span-2 min-w-0">
              <Tabs value={state.activeSection} onValueChange={state.setActiveSection} className="space-y-4">

                <CohesionTabContent
                  familyMembers={familyMembers}
                  tasks={tasks}
                  chatMessages={state.chatMessages}
                  familyAlbum={state.familyAlbum}
                  totalPoints={totalPoints}
                  avgWorkload={avgWorkload}
                  completedTasks={completedTasks}
                  totalTasks={totalTasks}
                />

                <TasksTabContent
                  tasks={tasks}
                  toggleTask={handlers.toggleTask}
                  getNextOccurrenceDate={handlers.getNextOccurrenceDate}
                  getMemberById={handlers.getMemberById}
                  deleteTask={deleteTask}
                />

                <TabsContent value="family">
                  {handlers.isWidgetEnabled('family-members') && (
                    <FamilyMembersGrid
                      members={familyMembers}
                      onMemberClick={(member) => navigate(`/member/${member.id}`)}
                      tasks={tasks}
                      events={calendarEvents}
                    />
                  )}
                </TabsContent>

                <CalendarTabContent
                  calendarEvents={calendarEvents}
                  calendarFilter={state.calendarFilter}
                  setCalendarFilter={state.setCalendarFilter}
                  currentUserId={currentUserId}
                  familyMembers={familyMembers}
                  setCalendarEvents={setCalendarEvents}
                />

                <ChildrenTabContent
                  childrenProfiles={state.childrenProfiles}
                  developmentPlans={state.developmentPlans}
                  familyMembers={familyMembers}
                  setEducationChild={state.setEducationChild}
                  navigate={navigate}
                  addMember={addMember}
                />

                <ValuesTabContent
                  familyValues={state.familyValues}
                  setFamilyValues={state.setFamilyValues}
                />

                <TraditionsTabContent
                  traditions={state.traditions}
                  setTraditions={state.setTraditions}
                  navigate={navigate}
                />

                <TabsContent value="goals">
                  {handlers.isWidgetEnabled('goals') && (
                    <>
                      <Card className="border-2 border-purple-200 bg-purple-50/50 mb-4">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                              <Icon name="Target" size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-2">Как работают цели?</h3>
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <p><strong>Ставьте долгосрочные цели</strong> — накопить на квартиру, поехать в отпуск, сделать ремонт.</p>
                                <p><strong>Добавляйте контрольные точки</strong> для отслеживания прогресса на диаграмме Ганта.</p>
                                <p><strong>Получайте подсказки от ИИ</strong> для достижения целей быстрее.</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <GoalsSection
                        goals={state.familyGoals}
                        familyMembers={familyMembers}
                        currentUserId={currentUserId}
                        onAddGoal={(goalData) => {
                          const newGoal: FamilyGoal = {
                            ...goalData,
                            id: Date.now().toString(),
                            createdAt: new Date().toISOString()
                          };
                          const updatedGoals = [...state.familyGoals, newGoal];
                          state.setFamilyGoals(updatedGoals);
                          localStorage.setItem('familyGoals', JSON.stringify(updatedGoals));
                        }}
                        onUpdateGoal={(goalId, updates) => {
                          const updatedGoals = state.familyGoals.map(g =>
                            g.id === goalId ? { ...g, ...updates } : g
                          );
                          state.setFamilyGoals(updatedGoals);
                          localStorage.setItem('familyGoals', JSON.stringify(updatedGoals));
                        }}
                        onDeleteGoal={(goalId) => {
                          const updatedGoals = state.familyGoals.filter(g => g.id !== goalId);
                          state.setFamilyGoals(updatedGoals);
                          localStorage.setItem('familyGoals', JSON.stringify(updatedGoals));
                        }}
                      />
                    </>
                  )}
                </TabsContent>

                <ShoppingTabContent
                  shoppingList={state.shoppingList}
                  currentUserId={currentUserId}
                  currentUser={currentUser}
                  toggleShoppingItem={handlers.toggleShoppingItem}
                  deleteShoppingItem={handlers.deleteShoppingItem}
                  clearBoughtItems={handlers.clearBoughtItems}
                  addShoppingItem={handlers.addShoppingItem}
                  newItemName={state.newItemName}
                  setNewItemName={state.setNewItemName}
                  newItemCategory={state.newItemCategory}
                  setNewItemCategory={state.setNewItemCategory}
                  newItemQuantity={state.newItemQuantity}
                  setNewItemQuantity={state.setNewItemQuantity}
                  newItemPriority={state.newItemPriority}
                  setNewItemPriority={state.setNewItemPriority}
                  showAddItemDialog={state.showAddItemDialog}
                  setShowAddItemDialog={state.setShowAddItemDialog}
                />

                <TabsContent value="complaints">
                  <ComplaintBook
                    familyMembers={familyMembers}
                    currentUserId={currentUserId}
                    initialComplaints={initialComplaints}
                  />
                </TabsContent>

                <ChatTabContent
                  chatMessages={state.chatMessages}
                  newMessage={state.newMessage}
                  setNewMessage={state.setNewMessage}
                  handleSendMessage={handlers.handleSendMessage}
                />

                <RulesTabContent />
                <AboutTabContent />

                <FamilyTabsContent
                  familyMembers={familyMembers}
                  setFamilyMembers={setFamilyMembers}
                  tasks={tasks}
                  setTasks={() => console.warn('setTasks deprecated, tasks managed by useTasks hook')}
                  createTask={createTask}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                  traditions={state.traditions}
                  familyValues={state.familyValues}
                  blogPosts={state.blogPosts}
                  importantDates={state.importantDates}
                  childrenProfiles={state.childrenProfiles}
                  developmentPlans={state.developmentPlans}
                  chatMessages={state.chatMessages}
                  setChatMessages={state.setChatMessages}
                  familyAlbum={state.familyAlbum}
                  setFamilyAlbum={state.setFamilyAlbum}
                  familyNeeds={state.familyNeeds}
                  setFamilyNeeds={state.setFamilyNeeds}
                  familyTree={state.familyTree}
                  setFamilyTree={state.setFamilyTree}
                  selectedTreeMember={state.selectedTreeMember}
                  setSelectedTreeMember={state.setSelectedTreeMember}
                  selectedUserId={currentUserId}
                  newMessage={state.newMessage}
                  setNewMessage={state.setNewMessage}
                  toggleTask={handlers.toggleTask}
                  addPoints={handlers.addPoints}
                  getWorkloadColor={handlers.getWorkloadColor}
                  getMemberById={handlers.getMemberById}
                  getAISuggestedMeals={handlers.getAISuggestedMeals}
                  exportStatsToCSV={handlers.exportStatsToCSV}
                  updateMember={updateMember}
                  deleteMember={deleteMember}
                />
              </Tabs>
            </div>

            <WidgetsSidebar
              isWidgetEnabled={handlers.isWidgetEnabled}
              setShowWidgetSettings={state.setShowWidgetSettings}
              calendarEvents={calendarEvents}
            />
          </div>
        </div>

        <Dialog open={state.educationChild !== null} onOpenChange={(open) => !open && state.setEducationChild(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Образовательный центр</DialogTitle>
            </DialogHeader>
            {state.educationChild && (
              <ChildEducation
                child={state.educationChild}
                onComplete={() => state.setEducationChild(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        <PanelSettings
          title="Настройки верхней панели"
          open={state.showTopPanelSettings}
          onOpenChange={state.setShowTopPanelSettings}
          autoHide={state.autoHideTopBar}
          onAutoHideChange={(value) => {
            state.setAutoHideTopBar(value);
            localStorage.setItem('autoHideTopBar', String(value));
          }}
          availableSections={availableTopPanelSections}
          selectedSections={state.topPanelSections}
          onSectionsChange={handlers.handleTopPanelSectionsChange}
          showLanguageSettings={true}
          currentLanguage={state.currentLanguage}
          languageOptions={languageOptions}
          onLanguageChange={(code) => {
            state.setCurrentLanguage(code as LanguageCode);
            localStorage.setItem('familyOrganizerLanguage', code);
            state.setShowLanguageSelector(false);
          }}
          showAppearanceSettings={true}
          appearanceMode={state.appearanceMode}
          onAppearanceModeChange={(mode) => {
            state.setAppearanceMode(mode);
            localStorage.setItem('appearanceMode', mode);
          }}
        />

        <PanelSettings
          title="Настройки левой панели"
          open={state.showLeftPanelSettings}
          onOpenChange={state.setShowLeftPanelSettings}
          autoHide={state.autoHideLeftMenu}
          onAutoHideChange={(value) => {
            state.setAutoHideLeftMenu(value);
            localStorage.setItem('autoHideLeftMenu', String(value));
          }}
          availableSections={availableSections}
          selectedSections={state.leftPanelSections}
          onSectionsChange={handlers.handleLeftPanelSectionsChange}
        />

        {state.chamomileEnabled && <ClickChamomile enabled={state.chamomileEnabled} soundEnabled={state.soundEnabled} />}

        <AIAssistantDialog
          open={state.showKuzyaDialog}
          onOpenChange={state.setShowKuzyaDialog}
        />

        <WidgetSettings
          isOpen={state.showWidgetSettings}
          onClose={() => state.setShowWidgetSettings(false)}
          onSave={handlers.handleWidgetSettingsSave}
        />

        <Footer />
      </IndexLayout>
    </>
  );
}