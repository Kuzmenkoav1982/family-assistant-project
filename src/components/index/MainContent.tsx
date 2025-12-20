import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { getDailyMotto } from '@/utils/dailyMottos';
import { FamilyTabsContent } from '@/components/FamilyTabsContent';
import { FamilyMembersGrid } from '@/components/FamilyMembersGrid';
import { FamilyProfilesInstructions } from '@/components/FamilyProfilesInstructions';
import { GoalsSection } from '@/components/GoalsSection';
import { WidgetSettingsDialog } from '@/components/WidgetSettingsDialog';
import StatsCounter from '@/components/StatsCounter';
import type { FamilyMember, Task, FamilyGoal } from '@/types/family.types';
import { useState, useEffect } from 'react';

interface MainContentProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  familyMembers: FamilyMember[];
  currentUserId: string;
  tasks: Task[];
  familyGoals: FamilyGoal[];
  setFamilyGoals: (goals: FamilyGoal[]) => void;
  updateMember: (updates: any) => void;
  toggleTask: (taskId: string) => void;
  createTask: (task: any) => void;
  updateTask: (updates: any) => void;
  deleteTask: (taskId: string) => void;
  addPoints: (memberName: string, points: number) => Promise<void>;
  getNextOccurrenceDate: (task: Task) => string | undefined;
  getMemberById: (id: string) => FamilyMember | undefined;
  inDevelopmentSections: any[];
  getDevSectionVotes: (sectionId: string) => { up: number; down: number };
  setSelectedDevSection: (section: any) => void;
  syncing: boolean;
  getLastSyncTime: () => string | null;
}

export function MainContent({
  activeSection,
  setActiveSection,
  familyMembers,
  currentUserId,
  tasks,
  familyGoals,
  setFamilyGoals,
  updateMember,
  toggleTask,
  createTask,
  updateTask,
  deleteTask,
  addPoints,
  getNextOccurrenceDate,
  getMemberById,
  inDevelopmentSections,
  getDevSectionVotes,
  setSelectedDevSection,
  syncing,
  getLastSyncTime
}: MainContentProps) {
  const navigate = useNavigate();
  const [familyName, setFamilyName] = useState('Наша семья');
  const [familyLogo, setFamilyLogo] = useState('https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png');
  
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.family_name) setFamilyName(user.family_name);
      if (user.logo_url) setFamilyLogo(user.logo_url);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-4 lg:p-8" style={{ paddingTop: '4rem' }}>
      <div 
        className="relative -mx-4 lg:-mx-8 mb-8 overflow-hidden rounded-2xl"
        style={{
          backgroundImage: 'url(https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '240px'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/75 to-white/65 backdrop-blur-[1px]"></div>
        <div className="relative h-full flex flex-col items-center justify-center px-6">
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center gap-4">
              <img 
                src={familyLogo} 
                alt={familyName}
                className="w-28 h-28 lg:w-36 lg:h-36 object-contain rounded-full"
                style={{ border: 'none', outline: 'none' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png';
                }}
              />
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 bg-clip-text text-transparent">
                  {familyName}
                </h1>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 mt-4">
            <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-400 via-slate-500 via-slate-600 to-gray-700 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%] text-center px-4">
              {getDailyMotto()}
            </p>
            {syncing && (
              <Badge className="bg-blue-600 animate-pulse shadow-lg">
                <Icon name="RefreshCw" className="mr-1 animate-spin" size={12} />
                Синхронизация
              </Badge>
            )}
          </div>
        </div>
      </div>

      {activeSection === 'family' && (
        <>
          <FamilyProfilesInstructions />
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              <Icon name="Users" size={16} className="inline mr-1" />
              {familyMembers.length} {familyMembers.length === 1 ? 'член семьи' : familyMembers.length < 5 ? 'члена семьи' : 'членов семьи'}
            </div>
            <WidgetSettingsDialog />
          </div>
          <FamilyMembersGrid
            members={familyMembers}
            onMemberClick={(member) => navigate(`/member/${member.id}`)}
            tasks={tasks}
            onAssignTask={(memberId) => {
              // TODO: Открыть диалог создания задачи с предвыбранным assignee
              navigate(`/tasks?assignee=${memberId}`);
            }}
          />
        </>
      )}

      {activeSection === 'goals' && (
        <GoalsSection
          goals={familyGoals}
          setGoals={setFamilyGoals}
          members={familyMembers}
          currentUserId={currentUserId}
        />
      )}

      {(activeSection === 'tasks' || 
        activeSection === 'values' || 
        activeSection === 'traditions' || 
        activeSection === 'blog' || 
        activeSection === 'children' || 
        activeSection === 'tree') && (
        <FamilyTabsContent
          activeTab={activeSection}
          familyMembers={familyMembers}
          currentUserId={currentUserId}
          tasks={tasks}
          toggleTask={toggleTask}
          createTask={createTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
          addPoints={addPoints}
          getNextOccurrenceDate={getNextOccurrenceDate}
          getMemberById={getMemberById}
        />
      )}
    </div>
  );
}