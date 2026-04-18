import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { FamilyCohesionChart } from '@/components/FamilyCohesionChart';
import type { FamilyMember, Task, ChatMessage, FamilyAlbum } from '@/types/family.types';

interface CohesionTabContentProps {
  familyMembers: FamilyMember[];
  tasks: Task[];
  chatMessages: ChatMessage[];
  familyAlbum: FamilyAlbum[];
  totalPoints: number;
  avgWorkload: number;
  completedTasks: number;
  totalTasks: number;
}

export default function CohesionTabContent({
  familyMembers,
  tasks,
  chatMessages,
  familyAlbum,
  totalPoints,
  avgWorkload,
  completedTasks,
  totalTasks,
}: CohesionTabContentProps) {
  return (
    <TabsContent value="cohesion">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-[5px]">
          <Card key="stat-points" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-orange-500" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Всего баллов</CardTitle>
                <Icon name="Award" className="text-orange-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 truncate">{totalPoints}</div>
            </CardContent>
          </Card>

          <Card key="stat-workload" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-pink-500" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Средняя загрузка</CardTitle>
                <Icon name="TrendingUp" className="text-pink-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-pink-600 truncate">{avgWorkload}%</div>
            </CardContent>
          </Card>

          <Card key="stat-tasks" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-purple-500" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <div className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Задачи выполнены</CardTitle>
                <Icon name="CheckCircle2" className="text-purple-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 truncate">{completedTasks}/{totalTasks}</div>
            </CardContent>
          </Card>

          <Card key="stat-members" className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-blue-500" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <div className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Членов семьи</CardTitle>
                <Icon name="Users" className="text-blue-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 truncate">{familyMembers.length}</div>
            </CardContent>
          </Card>
        </div>

        <FamilyCohesionChart 
          familyMembers={familyMembers}
          tasks={tasks}
          chatMessagesCount={chatMessages.length}
          albumPhotosCount={familyAlbum.length}
          lastActivityDays={0}
          totalFamilies={1250}
        />
      </div>
    </TabsContent>
  );
}