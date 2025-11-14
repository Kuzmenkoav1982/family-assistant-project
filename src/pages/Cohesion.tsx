import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { FamilyCohesionChart } from '@/components/FamilyCohesionChart';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useTasks } from '@/hooks/useTasks';
import { useState } from 'react';
import { testFamilyMembers, testTasks } from '@/data/testFamilyData';
import type { ChatMessage, FamilyAlbum } from '@/types/family.types';
import { initialChatMessages, initialFamilyAlbum } from '@/data/mockData';

export default function Cohesion() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isTestMode = user.id?.startsWith('user-');
  
  const { members: familyMembersRaw } = useFamilyMembers();
  const { tasks: tasksRaw } = useTasks();
  
  const familyMembers = isTestMode ? testFamilyMembers : (familyMembersRaw || []);
  const tasks = isTestMode ? testTasks : (tasksRaw || []);
  const [chatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [familyAlbum] = useState<FamilyAlbum[]>(initialFamilyAlbum);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Сплочённость семьи
            </h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Heart" className="text-purple-600" />
              Анализ сплочённости
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Этот раздел показывает, насколько активно члены семьи взаимодействуют друг с другом,
              выполняют задачи и участвуют в семейной жизни. Высокий уровень сплочённости говорит
              о здоровой и дружной семье.
            </p>

            <FamilyCohesionChart 
              familyMembers={familyMembers}
              tasks={tasks}
              chatMessagesCount={chatMessages.length}
              albumPhotosCount={familyAlbum.length}
              lastActivityDays={0}
              totalFamilies={1250}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Активность в чате</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{chatMessages.length}</div>
              <p className="text-xs text-muted-foreground">сообщений всего</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Выполнено задач</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.completed).length}
              </div>
              <p className="text-xs text-muted-foreground">из {tasks.length} задач</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Фото в альбоме</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{familyAlbum.length}</div>
              <p className="text-xs text-muted-foreground">совместных воспоминаний</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Рекомендации по улучшению сплочённости</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Icon name="MessageCircle" className="text-blue-600 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-sm">Общайтесь чаще</h4>
                  <p className="text-xs text-muted-foreground">
                    Используйте семейный чат для обмена новостями и планами на день
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Icon name="CheckSquare" className="text-green-600 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-sm">Совместные задачи</h4>
                  <p className="text-xs text-muted-foreground">
                    Создавайте задачи, которые требуют участия нескольких членов семьи
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Icon name="Sparkles" className="text-purple-600 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-sm">Семейные традиции</h4>
                  <p className="text-xs text-muted-foreground">
                    Регулярно проводите время вместе, создавайте новые традиции
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
