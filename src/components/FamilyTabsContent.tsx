import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import type {
  FamilyMember,
  Task,
  Tradition,
  FamilyValue,
  BlogPost,
  ImportantDate,
  ChildProfile,
  DevelopmentPlan,
  ChatMessage,
  FamilyAlbum,
  FamilyNeed,
  FamilyTreeMember,
  CalendarEvent,
} from '@/types/family.types';
import { MembersTabContent } from '@/components/tabs/MembersTabContent';
import { TreeTabContent } from '@/components/tabs/TreeTabContent';

interface FamilyTabsContentProps {
  familyMembers: FamilyMember[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  createTask?: (taskData: Partial<Task>) => Promise<{success: boolean; task?: Task; error?: string}>;
  updateTask?: (taskData: Partial<Task> & {id: string}) => Promise<{success: boolean; task?: Task; error?: string}>;
  deleteTask?: (taskId: string) => Promise<{success: boolean; error?: string}>;
  traditions: Tradition[];
  familyValues: FamilyValue[];
  blogPosts: BlogPost[];
  importantDates: ImportantDate[];
  childrenProfiles: ChildProfile[];
  developmentPlans: DevelopmentPlan[];
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  familyAlbum: FamilyAlbum[];
  setFamilyAlbum: React.Dispatch<React.SetStateAction<FamilyAlbum[]>>;
  familyNeeds: FamilyNeed[];
  setFamilyNeeds: React.Dispatch<React.SetStateAction<FamilyNeed[]>>;
  familyTree: FamilyTreeMember[];
  setFamilyTree: React.Dispatch<React.SetStateAction<FamilyTreeMember[]>>;
  selectedTreeMember: FamilyTreeMember | null;
  setSelectedTreeMember: React.Dispatch<React.SetStateAction<FamilyTreeMember | null>>;
  selectedUserId: string;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  toggleTask: (taskId: string) => void | Promise<any>;
  addPoints: (assignee: string, points: number) => void;
  getWorkloadColor: (workload: number) => string;
  getMemberById: (id: string) => FamilyMember | undefined;
  getAISuggestedMeals: () => { name: string; reason: string; icon: string }[];
  exportStatsToCSV?: () => void;
  updateMember?: (memberData: Partial<FamilyMember> & { id?: string; member_id?: string }) => Promise<any>;
  deleteMember?: (memberId: string) => Promise<any>;
}

function getNextOccurrence(task: Task): string | undefined {
  if (!task.isRecurring || !task.recurringPattern) return undefined;
  
  const now = new Date();
  const { frequency, interval, daysOfWeek, endDate } = task.recurringPattern;
  
  if (endDate && new Date(endDate) < now) return undefined;
  
  const next = new Date(now);
  
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval);
      break;
    case 'weekly':
      if (daysOfWeek && daysOfWeek.length > 0) {
        const currentDay = next.getDay();
        const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
        const nextDay = sortedDays.find(d => d > currentDay) || sortedDays[0];
        const daysToAdd = nextDay > currentDay 
          ? nextDay - currentDay 
          : 7 - currentDay + nextDay;
        next.setDate(next.getDate() + daysToAdd);
      } else {
        next.setDate(next.getDate() + 7 * interval);
      }
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + interval);
      break;
  }
  
  return next.toISOString().split('T')[0];
}

export function FamilyTabsContent({
  familyMembers,
  setFamilyMembers,
  tasks,
  setTasks,
  createTask,
  updateTask,
  deleteTask,
  traditions,
  familyValues,
  blogPosts,
  importantDates,
  childrenProfiles,
  developmentPlans,
  chatMessages,
  setChatMessages,
  familyAlbum,
  familyNeeds,
  setFamilyNeeds,
  familyTree,
  setFamilyTree,
  selectedTreeMember,
  setSelectedTreeMember,
  selectedUserId,
  newMessage,
  setNewMessage,
  toggleTask,
  addPoints,
  getWorkloadColor,
  getMemberById,
  getAISuggestedMeals,
  exportStatsToCSV,
  updateMember,
  deleteMember,
}: FamilyTabsContentProps) {
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const currentUser = getMemberById(selectedUserId);
    if (!currentUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: selectedUserId,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: newMessage,
      timestamp: new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'text'
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage('');
  };

  const handleFileUpload = (type: 'image' | 'video') => {
    const currentUser = getMemberById(selectedUserId);
    if (!currentUser) return;

    const fileName = type === 'image' ? 'uploaded_image.jpg' : 'uploaded_video.mp4';
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: selectedUserId,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: `Отправил ${type === 'image' ? 'фото' : 'видео'}`,
      timestamp: new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: type,
      fileUrl: `/uploads/${fileName}`,
      fileName: fileName
    };

    setChatMessages([...chatMessages, message]);
  };

  const updateNeedStatus = (needId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    setFamilyNeeds(familyNeeds.map(need => 
      need.id === needId ? { ...need, status: newStatus } : need
    ));
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getStatusColor = (status: 'pending' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <MembersTabContent 
        familyMembers={familyMembers}
        setFamilyMembers={setFamilyMembers}
        getWorkloadColor={getWorkloadColor}
        updateMember={updateMember}
        deleteMember={deleteMember}
        currentUserId={selectedUserId}
      />

      <TreeTabContent 
        familyTree={familyTree}
        selectedTreeMember={selectedTreeMember}
        setSelectedTreeMember={setSelectedTreeMember}
      />

      <TabsContent value="tasks" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold">Задачи</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial">
              <select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border-2 border-blue-300 rounded-md bg-white text-sm font-medium hover:border-blue-400 transition-colors"
              >
                <option value="all">Все задачи</option>
                {familyMembers.map(member => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить задачу
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новая задача</DialogTitle>
              </DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsCreatingTask(true);
                
                const formData = new FormData(e.currentTarget);
                const title = formData.get('title') as string;
                const assigneeId = formData.get('assignee') as string;
                const deadline = formData.get('deadline') as string;
                const category = formData.get('category') as string;
                const points = parseInt(formData.get('points') as string) || 10;
                
                const assignee = familyMembers.find(m => m.id === assigneeId);
                
                if (createTask) {
                  const result = await createTask({
                    title,
                    assignee_id: assigneeId,
                    assignee_name: assignee?.name || '',
                    completed: false,
                    category: category || 'Дом',
                    points,
                    deadline: deadline || undefined,
                    priority: 'medium',
                    is_recurring: false,
                  });
                  
                  if (result.success) {
                    (e.target as HTMLFormElement).reset();
                    setIsTaskDialogOpen(false);
                  } else {
                    alert(`Ошибка создания задачи: ${result.error}`);
                  }
                } else {
                  const newTask: Task = {
                    id: Date.now().toString(),
                    title,
                    assignee: assignee?.name || '',
                    completed: false,
                    category: category || 'Дом',
                    points,
                    deadline: deadline || undefined,
                  };
                  setTasks([...tasks, newTask]);
                  (e.target as HTMLFormElement).reset();
                  setIsTaskDialogOpen(false);
                }
                
                setIsCreatingTask(false);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Название задачи *</label>
                  <Input name="title" placeholder="Например: Постирать джинсы" required />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Исполнитель *</label>
                  <select name="assignee" className="w-full border rounded-md p-2" required>
                    <option value="">Выберите исполнителя</option>
                    {familyMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Icon name="Calendar" className="inline mr-1" size={16} />
                    Срок выполнения
                  </label>
                  <Input 
                    name="deadline" 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    placeholder="Когда нужно выполнить?"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Укажите когда задача должна быть выполнена (например, когда нужны чистые джинсы)
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Категория</label>
                    <Input name="category" placeholder="Дом" defaultValue="Дом" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Баллы</label>
                    <Input name="points" type="number" min="1" defaultValue="10" />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
                  disabled={isCreatingTask}
                >
                  {isCreatingTask ? (
                    <>
                      <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                      Создание...
                    </>
                  ) : (
                    <>
                      <Icon name="Save" className="mr-2" size={16} />
                      Сохранить задачу
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="space-y-3">
          {tasks
            .filter(task => taskFilter === 'all' || task.assignee === taskFilter)
            .map((task, idx) => {
              const nextOccurrence = getNextOccurrence(task);
              return (
                <Card 
                  key={task.id} 
                  className={`animate-fade-in ${task.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h4 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
                            {task.title}
                          </h4>
                          {task.deadline && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                new Date(task.deadline) < new Date() 
                                  ? 'bg-red-50 text-red-700 border-red-300'
                                  : new Date(task.deadline).getTime() - new Date().getTime() < 86400000 * 2
                                  ? 'bg-orange-50 text-orange-700 border-orange-300'
                                  : 'bg-blue-50 text-blue-700 border-blue-300'
                              }`}
                            >
                              <Icon name="Calendar" size={12} className="mr-1" />
                              {new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </Badge>
                          )}
                          {task.isRecurring && task.recurringPattern && (
                            <>
                              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
                                {task.recurringPattern.frequency === 'daily' && `Каждые ${task.recurringPattern.interval} дн.`}
                                {task.recurringPattern.frequency === 'weekly' && `Каждые ${task.recurringPattern.interval} нед.`}
                                {task.recurringPattern.frequency === 'monthly' && `Каждые ${task.recurringPattern.interval} мес.`}
                                {task.recurringPattern.frequency === 'yearly' && `Каждый год`}
                              </Badge>
                              {nextOccurrence && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                  <Icon name="Calendar" size={12} className="mr-1" />
                                  След: {nextOccurrence}
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{task.category}</Badge>
                          <Badge variant="outline">{task.assignee}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          +{task.points} баллов
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </TabsContent>

      <TabsContent value="needs" className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Потребности семьи</h3>
          <Button className="bg-gradient-to-r from-green-500 to-teal-500">
            <Icon name="Plus" className="mr-2" size={16} />
            Добавить потребность
          </Button>
        </div>
        
        <div className="space-y-4">
          {familyNeeds.map((need, idx) => (
            <Card 
              key={need.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{need.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{need.description}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getPriorityColor(need.priority)}>
                      {need.priority === 'high' && 'Высокий приоритет'}
                      {need.priority === 'medium' && 'Средний приоритет'}
                      {need.priority === 'low' && 'Низкий приоритет'}
                    </Badge>
                    <Badge className={getStatusColor(need.status)}>
                      {need.status === 'completed' && 'Выполнено'}
                      {need.status === 'in_progress' && 'В процессе'}
                      {need.status === 'pending' && 'Ожидает'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateNeedStatus(need.id, 'in_progress')}
                    disabled={need.status === 'in_progress'}
                  >
                    Начать
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateNeedStatus(need.id, 'completed')}
                    disabled={need.status === 'completed'}
                  >
                    Завершить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </>
  );
}