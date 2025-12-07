import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { getDailyMotto } from '@/utils/dailyMottos';
import { FamilyTabsContent } from '@/components/FamilyTabsContent';
import { FamilyMembersGrid } from '@/components/FamilyMembersGrid';
import { GoalsSection } from '@/components/GoalsSection';
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
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {familyName}
                </h1>
              </div>
            </div>
            
            <div className="hidden sm:block">
              <StatsCounter />
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 mt-4">
            <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%] text-center px-4">
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

      <div className="bg-white/95 backdrop-blur-md shadow-sm -mx-4 lg:-mx-8 px-4 lg:px-8 py-3 mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-blue-50/80 border border-blue-200">
            <Button
              onClick={() => setActiveSection('family')}
              variant={activeSection === 'family' ? 'default' : 'outline'}
              className="text-xs py-1.5 px-2.5 h-auto"
            >
              <Icon name="Users" size={14} className="mr-1" />
              Семья
            </Button>
            <Button
              onClick={() => setActiveSection('children')}
              variant={activeSection === 'children' ? 'default' : 'outline'}
              className="text-xs py-1.5 px-2.5 h-auto"
            >
              <Icon name="Baby" size={14} className="mr-1" />
              Дети
            </Button>
            <Button
              onClick={() => setActiveSection('values')}
              variant={activeSection === 'values' ? 'default' : 'outline'}
              className="text-xs py-1.5 px-2.5 h-auto"
            >
              <Icon name="Heart" size={14} className="mr-1" />
              Ценности
            </Button>
            <Button
              onClick={() => setActiveSection('traditions')}
              variant={activeSection === 'traditions' ? 'default' : 'outline'}
              className="text-xs py-1.5 px-2.5 h-auto"
            >
              <Icon name="Sparkles" size={14} className="mr-1" />
              Традиции
            </Button>
            <Button
              onClick={() => navigate('/family-code')}
              variant="outline"
              className="text-xs py-1.5 px-2.5 h-auto"
            >
              <Icon name="Scale" size={14} className="mr-1" />
              Кодекс
            </Button>
            <Button
              onClick={() => navigate('/rules')}
              variant="outline"
              className="text-xs py-1.5 px-2.5 h-auto"
            >
              <Icon name="Scale" size={14} className="mr-1" />
              Правила
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-green-50/80 border border-green-200">
            <Button
              onClick={() => setActiveSection('goals')}
              variant={activeSection === 'goals' ? 'default' : 'outline'}
              className="text-xs py-1.5 px-2.5 h-auto"
            >
              <Icon name="Target" size={14} className="mr-1" />
              Цели
            </Button>
            <Button
              onClick={() => setActiveSection('tasks')}
              variant={activeSection === 'tasks' ? 'default' : 'outline'}
              className="text-xs py-1.5 px-2.5 h-auto"
            >
              <Icon name="CheckSquare" size={14} className="mr-1" />
              Задачи
            </Button>
            <Button
              onClick={() => navigate('/calendar')}
              variant="outline"
              className="text-xs py-1.5 px-2.5 h-auto"
            >
              <Icon name="Calendar" size={14} className="mr-1" />
              Календарь
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-purple-50/80 border border-purple-200">
            <Button
              onClick={() => setActiveSection('blog')}
              variant={activeSection === 'blog' ? 'default' : 'outline'}
              className="text-xs py-1.5 px-2.5 h-auto"
            >
              <Icon name="BookOpen" size={14} className="mr-1" />
              Блог
            </Button>
            <Button
              onClick={() => setActiveSection('tree')}
              variant={activeSection === 'tree' ? 'default' : 'outline'}
              className="text-xs py-1.5 px-2.5 h-auto"
            >
              <Icon name="GitBranch" size={14} className="mr-1" />
              Древо
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-orange-50/80 border border-orange-200">
            <Button
              onClick={() => navigate('/voting')}
              variant="outline"
              className="text-xs py-1.5 px-2.5 h-auto"
            >
              <Icon name="Vote" size={14} className="mr-1" />
              Голосования
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-xs py-1.5 px-2.5 h-auto"
                >
                  <Icon name="Wrench" size={14} className="mr-1" />
                  В разработке
                  <Badge className="ml-1 bg-amber-500 text-white text-[9px] px-1 py-0">{inDevelopmentSections.length}</Badge>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Icon name="Wrench" size={24} />
                    Разделы в разработке
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {inDevelopmentSections.map((section) => {
                    const votes = getDevSectionVotes(section.id);
                    return (
                      <Card
                        key={section.id}
                        className="cursor-pointer hover:border-amber-400 transition-all"
                        onClick={() => setSelectedDevSection(section)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon name={section.icon} size={20} className="text-amber-600" />
                              <h4 className="font-bold text-sm">{section.label}</h4>
                            </div>
                            <Badge className="bg-amber-500 text-white text-[9px] px-1 py-0">DEV</Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{section.description}</p>
                          <div className="flex items-center gap-2 text-[10px]">
                            <div className="flex items-center gap-1 text-green-600">
                              <Icon name="ThumbsUp" size={10} />
                              <span>{votes.up}</span>
                            </div>
                            <div className="flex items-center gap-1 text-red-600">
                              <Icon name="ThumbsDown" size={10} />
                              <span>{votes.down}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {activeSection === 'family' && (
        <FamilyMembersGrid
          members={familyMembers}
          onMemberClick={(memberId) => navigate(`/member/${memberId}`)}
        />
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