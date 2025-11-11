import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { AddFamilyMemberForm } from '@/components/AddFamilyMemberForm';
import { ChildDreamsDialog } from '@/components/ChildDreamsDialog';
import { useState } from 'react';
import type {
  FamilyMember,
  Task,
  Tradition,
  FamilyValue,
  BlogPost,
  ImportantDate,
  MealVoting,
  ChildProfile,
  DevelopmentPlan,
  ChatMessage,
  FamilyAlbum,
  FamilyNeed,
  FamilyTreeMember,
  CalendarEvent,
  AIRecommendation,
} from '@/types/family.types';

interface FamilyTabsContentProps {
  familyMembers: FamilyMember[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  traditions: Tradition[];
  familyValues: FamilyValue[];
  blogPosts: BlogPost[];
  importantDates: ImportantDate[];
  mealVotings: MealVoting[];
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
  aiRecommendations: AIRecommendation[];
  selectedUserId: string;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  toggleTask: (taskId: string) => void | Promise<any>;
  addPoints: (assignee: string, points: number) => void;
  getWorkloadColor: (workload: number) => string;
  getMemberById: (id: string) => FamilyMember | undefined;
  getAISuggestedMeals: () => { name: string; reason: string; icon: string }[];
  exportStatsToCSV?: () => void;
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
  tasks,
  traditions,
  familyValues,
  blogPosts,
  importantDates,
  mealVotings,
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
  aiRecommendations,
  selectedUserId,
  newMessage,
  setNewMessage,
  toggleTask,
  addPoints,
  getWorkloadColor,
  getMemberById,
  getAISuggestedMeals,
  exportStatsToCSV,
}: FamilyTabsContentProps) {
  const [taskFilter, setTaskFilter] = useState<string>('all');
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

  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);

  return (
    <>
      <TabsContent value="members" className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Члены семьи</h3>
          <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-pink-500"
                onClick={() => {
                  setEditingMember(undefined);
                  setAddMemberDialogOpen(true);
                }}
              >
                <Icon name="UserPlus" className="mr-2" size={16} />
                Добавить члена семьи
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMember ? 'Редактировать члена семьи' : 'Добавить нового члена семьи'}</DialogTitle>
              </DialogHeader>
              <AddFamilyMemberForm 
                editingMember={editingMember}
                onSubmit={(newMember) => {
                  if (editingMember) {
                    setFamilyMembers(familyMembers.map(m => m.id === newMember.id ? newMember : m));
                  } else {
                    setFamilyMembers([...familyMembers, newMember]);
                  }
                  setAddMemberDialogOpen(false);
                  setEditingMember(undefined);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {familyMembers.map((member, index) => (
            <Card 
              key={member.id} 
              className="animate-fade-in border-l-4 hover:shadow-lg transition-all hover:scale-[1.02]"
              style={{ 
                borderLeftColor: index % 2 === 0 ? '#f97316' : '#d946ef',
                animationDelay: `${index * 0.1}s`
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="relative group cursor-pointer">
                          {member.avatarType === 'photo' && member.photoUrl ? (
                            <img 
                              src={member.photoUrl} 
                              alt={member.name}
                              className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 group-hover:border-orange-400 transition-all"
                            />
                          ) : (
                            <div className="text-5xl group-hover:scale-110 transition-transform">
                              {member.avatar}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-all flex items-center justify-center">
                            <Icon name="Camera" className="text-white opacity-0 group-hover:opacity-100" size={20} />
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Изменить аватар для {member.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Загрузить фото</label>
                            <Input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const photoUrl = event.target?.result as string;
                                    const updatedMembers = familyMembers.map(m => 
                                      m.id === member.id 
                                        ? { ...m, photoUrl, avatarType: 'photo' as const }
                                        : m
                                    );
                                    setFamilyMembers(updatedMembers);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </div>
                          
                          <div className="border-t pt-4">
                            <label className="block text-sm font-medium mb-2">Или выберите иконку</label>
                            <div className="grid grid-cols-6 gap-2">
                              {['👨', '👩', '👴', '👵', '👦', '👧', '🧑', '👶', '🧔', '👨‍🦱', '👩‍🦰', '🧑‍🦳'].map((emoji) => (
                                <button
                                  key={emoji}
                                  className="text-3xl hover:bg-gray-100 rounded p-2 transition-colors"
                                  onClick={() => {
                                    const updatedMembers = familyMembers.map(m => 
                                      m.id === member.id 
                                        ? { ...m, avatar: emoji, avatarType: 'icon' as const, photoUrl: undefined }
                                        : m
                                    );
                                    setFamilyMembers(updatedMembers);
                                  }}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <div>
                      <CardTitle className="text-xl">{member.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      {member.moodStatus && (
                        <div className="mt-2 flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-md">
                          <span className="text-2xl">{member.moodStatus.emoji}</span>
                          <div className="text-xs">
                            <p className="font-medium text-blue-900">{member.moodStatus.label}</p>
                            {member.moodStatus.message && (
                              <p className="text-blue-700">{member.moodStatus.message}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      ⭐ Уровень {member.level}
                    </Badge>
                    <Badge variant="outline" className={getWorkloadColor(member.workload)}>
                      Загрузка: {member.workload}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-yellow-900">Баллы</span>
                      <span className="text-lg font-bold text-orange-600">{member.points}</span>
                    </div>
                    <Progress value={(member.points % 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {100 - (member.points % 100)} до следующего уровня
                    </p>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Уровень вовлеченности</span>
                    <span className={`font-semibold ${getWorkloadColor(member.workload)}`}>
                      {member.workload > 70 ? 'Высокая' : member.workload > 50 ? 'Средняя' : 'Низкая'}
                    </span>
                  </div>
                  <Progress value={member.workload} className="h-2" />
                  
                  <div className="flex gap-1 flex-wrap mt-3">
                    {member.achievements.slice(0, 3).map((achievement, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {achievement === 'early_bird' && '🌅 Ранняя пташка'}
                        {achievement === 'helper' && '🤝 Помощник'}
                        {achievement === 'chef' && '👨‍🍳 Повар'}
                        {achievement === 'organizer' && '📋 Организатор'}
                        {achievement === 'champion' && '🏆 Чемпион'}
                        {achievement === 'master_chef' && '⭐ Мастер-повар'}
                        {achievement === 'student' && '📚 Ученик'}
                        {achievement === 'beginner' && '🌟 Новичок'}
                        {achievement === 'wise' && '🦉 Мудрый'}
                        {achievement === 'cook' && '🍳 Кулинар'}
                        {achievement === 'gardener' && '🌱 Садовод'}
                        {achievement === 'storyteller' && '📖 Рассказчик'}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-blue-300 hover:bg-blue-50"
                        >
                          <Icon name="Smile" size={14} className="mr-1" />
                          Настроение
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Как настроение у {member.name}?</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { emoji: '😊', label: 'Радостно' },
                              { emoji: '😄', label: 'Отлично' },
                              { emoji: '🤗', label: 'Счастлив' },
                              { emoji: '😌', label: 'Спокойно' },
                              { emoji: '🤔', label: 'Задумчиво' },
                              { emoji: '😐', label: 'Нормально' },
                              { emoji: '😢', label: 'Грустно' },
                              { emoji: '😔', label: 'Печально' },
                              { emoji: '😰', label: 'Переживаю' },
                              { emoji: '😤', label: 'Раздражён' },
                              { emoji: '😴', label: 'Устал' },
                              { emoji: '🤒', label: 'Плохо' },
                            ].map((mood) => (
                              <button
                                key={mood.emoji}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 hover:border-blue-400 hover:bg-blue-50 transition-all"
                                onClick={() => {
                                  const updatedMembers = familyMembers.map(m =>
                                    m.id === member.id
                                      ? {
                                          ...m,
                                          moodStatus: {
                                            emoji: mood.emoji,
                                            label: mood.label,
                                            timestamp: new Date().toISOString(),
                                          },
                                        }
                                      : m
                                  );
                                  setFamilyMembers(updatedMembers);
                                }}
                              >
                                <span className="text-4xl">{mood.emoji}</span>
                                <span className="text-xs font-medium">{mood.label}</span>
                              </button>
                            ))}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Добавить сообщение (необязательно)
                            </label>
                            <Input
                              placeholder="Что происходит?"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && member.moodStatus) {
                                  const updatedMembers = familyMembers.map(m =>
                                    m.id === member.id
                                      ? {
                                          ...m,
                                          moodStatus: {
                                            ...m.moodStatus!,
                                            message: e.currentTarget.value,
                                          },
                                        }
                                      : m
                                  );
                                  setFamilyMembers(updatedMembers);
                                }
                              }}
                            />
                          </div>
                          {member.moodStatus && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                const updatedMembers = familyMembers.map(m =>
                                  m.id === member.id ? { ...m, moodStatus: undefined } : m
                                );
                                setFamilyMembers(updatedMembers);
                              }}
                            >
                              <Icon name="X" size={14} className="mr-1" />
                              Убрать статус
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    {member.age && member.age < 18 && (
                      <ChildDreamsDialog
                        child={member}
                        onUpdate={(updatedChild) => {
                          const updatedMembers = familyMembers.map(m =>
                            m.id === updatedChild.id ? updatedChild : m
                          );
                          setFamilyMembers(updatedMembers);
                        }}
                      />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingMember(member);
                        setAddMemberDialogOpen(true);
                      }}
                    >
                      <Icon name="Edit" size={14} className="mr-1" />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 border-red-300"
                      onClick={() => {
                        if (confirm(`Удалить ${member.name} из семьи?`)) {
                          setFamilyMembers(familyMembers.filter(m => m.id !== member.id));
                        }
                      }}
                    >
                      <Icon name="Trash2" size={14} className="mr-1" />
                      Удалить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="tree" className="space-y-6">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden">
          <CardHeader className="relative py-4">
            <div 
              className="absolute inset-0 opacity-10 bg-cover bg-center"
              style={{ 
                backgroundImage: `url('https://cdn.poehali.dev/files/ba8358f6-677b-47af-960b-3b5598f27d5b.jpeg')`,
                filter: 'blur(2px)'
              }}
            ></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                    <Icon name="TreePine" className="text-amber-700" size={28} />
                    Генеалогическое Древо Семьи
                  </CardTitle>
                  <p className="text-amber-800 italic text-sm">История рода в поколениях</p>
                </div>
                <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700" size="sm">
                  <Icon name="Plus" className="mr-2" size={14} />
                  Добавить
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 relative">
            <div className="relative overflow-x-auto pb-4">
              <div className="min-w-[700px] mx-auto">
                {[0, 1, 2].map(generation => {
                  const members = familyTree.filter(m => m.generation === generation);
                  if (members.length === 0) return null;
                  
                  return (
                    <div key={generation} className="mb-8 relative">
                      <div className="flex justify-center gap-3 sm:gap-4 relative">
                    {members.map((member, idx) => {
                      const calculateAge = (birthDate: string, deathDate?: string) => {
                        const birth = new Date(birthDate);
                        const end = deathDate ? new Date(deathDate) : new Date();
                        return Math.floor((end.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
                      };

                      const years = member.deathDate 
                        ? `${member.birthDate.split('-')[0]} - ${member.deathDate.split('-')[0]}`
                        : `${member.birthDate.split('-')[0]} - н.в.`;

                      const age = member.age || calculateAge(member.birthDate, member.deathDate);
                      const ageText = member.deathDate 
                        ? `${age} лет` 
                        : `${age} ${age % 10 === 1 && age !== 11 ? 'год' : age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20) ? 'года' : 'лет'}`;

                      return (
                        <div key={member.id} className="flex-1 relative">
                          <div 
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedTreeMember(member)}
                          >
                            <div className="bg-gradient-to-br from-amber-100 to-yellow-50 border-3 border-amber-700 rounded-lg p-2 sm:p-3 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 min-h-[100px] sm:min-h-[110px] flex flex-col justify-between"
                              style={{
                                backgroundImage: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
                              }}
                            >
                              <div className="absolute -top-1 -left-1 w-4 h-4 bg-amber-800 rounded-full border-2 border-amber-600"></div>
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-800 rounded-full border-2 border-amber-600"></div>
                              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-amber-800 rounded-full border-2 border-amber-600"></div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-800 rounded-full border-2 border-amber-600"></div>
                              
                              <div className="text-center">
                                <div className="text-2xl sm:text-3xl mb-1">{member.avatar}</div>
                                <p className="font-bold text-xs sm:text-sm text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
                                  {member.firstName}
                                </p>
                                <p className="text-[10px] sm:text-xs text-amber-800 italic">
                                  {years}
                                </p>
                                {member.occupation && (
                                  <p className="text-[10px] sm:text-xs text-amber-700 mt-0.5 truncate">
                                    {member.occupation}
                                  </p>
                                )}
                              </div>
                              
                              {member.deathDate && (
                                <div className="absolute top-1 right-1">
                                  <Badge className="bg-gray-700 text-white text-xs px-1 py-0">
                                    ✝
                                  </Badge>
                                </div>
                              )}
                            </div>
                            
                            {generation < 2 && (
                              <div className="absolute left-1/2 -bottom-6 w-0.5 h-6 bg-amber-700 transform -translate-x-1/2"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                      </div>
                      
                      {generation < 2 && members.length > 1 && (
                        <div 
                          className="absolute left-0 right-0 h-0.5 bg-amber-700"
                          style={{ 
                            top: 'calc(100px + 12px)',
                            left: `${100 / members.length / 2}%`,
                            right: `${100 / members.length / 2}%`,
                          }}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedTreeMember && (
          <Dialog open={!!selectedTreeMember} onOpenChange={() => setSelectedTreeMember(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl flex items-center gap-3">
                  <span className="text-5xl">{selectedTreeMember.avatar}</span>
                  {selectedTreeMember.fullName}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Icon name="User" size={20} className="text-emerald-600" />
                      Основная информация
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Полное имя:</span>
                        <span className="font-medium">{selectedTreeMember.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Дата рождения:</span>
                        <span className="font-medium">{selectedTreeMember.birthDate}</span>
                      </div>
                      {selectedTreeMember.deathDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Дата смерти:</span>
                          <span className="font-medium">{selectedTreeMember.deathDate}</span>
                        </div>
                      )}
                      {selectedTreeMember.placeOfBirth && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Место рождения:</span>
                          <span className="font-medium">{selectedTreeMember.placeOfBirth}</span>
                        </div>
                      )}
                      {selectedTreeMember.occupation && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Профессия:</span>
                          <span className="font-medium">{selectedTreeMember.occupation}</span>
                        </div>
                      )}
                      {selectedTreeMember.education && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Образование:</span>
                          <span className="font-medium">{selectedTreeMember.education}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTreeMember.hobbies && selectedTreeMember.hobbies.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <Icon name="Heart" size={20} className="text-emerald-600" />
                        Увлечения
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTreeMember.hobbies.map((hobby, i) => (
                          <Badge key={i} variant="secondary">{hobby}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {selectedTreeMember.bio && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Icon name="FileText" size={20} className="text-emerald-600" />
                      Биография
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedTreeMember.bio}
                    </p>
                  </div>
                )}

                {selectedTreeMember.achievements && selectedTreeMember.achievements.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Icon name="Award" size={20} className="text-emerald-600" />
                      Достижения
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTreeMember.achievements.map((achievement, i) => (
                        <Badge key={i} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTreeMember.importantDates && selectedTreeMember.importantDates.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Icon name="Calendar" size={20} className="text-emerald-600" />
                      Важные даты
                    </h3>
                    <div className="space-y-2">
                      {selectedTreeMember.importantDates.map((dateInfo, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                          <span className="text-sm font-medium">{dateInfo.event}</span>
                          <span className="text-sm text-muted-foreground">{dateInfo.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </TabsContent>

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
            <Dialog>
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
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = formData.get('title') as string;
                const assigneeId = formData.get('assignee') as string;
                const deadline = formData.get('deadline') as string;
                const category = formData.get('category') as string;
                const points = parseInt(formData.get('points') as string) || 10;
                
                const assignee = familyMembers.find(m => m.id === assigneeId);
                
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
                
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500">
                  <Icon name="Plus" className="mr-2" size={16} />
                  Создать задачу
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
        
        {tasks
          .filter(task => taskFilter === 'all' || task.assignee === taskFilter)
          .map((task, index) => {
          const nextOccurrence = getNextOccurrence(task);
          
          return (
            <Card 
              key={task.id} 
              className="animate-fade-in hover:shadow-md transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      {task.isRecurring && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          <Icon name="RotateCw" size={12} className="mr-1" />
                          Повторяется
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{task.assignee}</Badge>
                      <Badge variant="secondary" className="text-xs">{task.category}</Badge>
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
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    +{task.points} баллов
                  </Badge>
                  {task.completed && task.isRecurring && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Icon name="X" size={14} className="mr-1" />
                          Отменить
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Отменить повторение задачи?</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Вы уверены, что хотите отменить создание следующей повторяющейся задачи "{task.title}"?
                          </p>
                          <p className="text-sm font-medium">
                            Это отменит только следующее повторение. Текущая задача останется выполненной.
                          </p>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => {}}>
                              Закрыть
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => {
                                setTasks(prevTasks => prevTasks.filter(t => {
                                  const isNextOccurrence = t.id.startsWith(`${task.id}-`) && !t.completed;
                                  return !isNextOccurrence;
                                }));
                              }}
                            >
                              Отменить повторение
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </TabsContent>

      <TabsContent value="chat" className="space-y-4">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Icon name="MessageSquare" size={24} />
              Семейный чат
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((message) => {
              const isCurrentUser = message.senderId === selectedUserId;
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className="text-3xl flex-shrink-0">{message.senderAvatar}</div>
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">{message.senderName}</span>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.type === 'text' && <p>{message.content}</p>}
                      {message.type === 'image' && (
                        <div>
                          <p className="mb-2">{message.content}</p>
                          <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Icon name="Image" size={48} className="text-gray-400" />
                          </div>
                        </div>
                      )}
                      {message.type === 'video' && (
                        <div>
                          <p className="mb-2">{message.content}</p>
                          <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Icon name="Video" size={48} className="text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleFileUpload('image')}
              >
                <Icon name="Image" size={20} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleFileUpload('video')}
              >
                <Icon name="Video" size={20} />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введите сообщение..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} className="bg-gradient-to-r from-orange-500 to-pink-500">
                <Icon name="Send" size={20} />
              </Button>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="album" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Image" size={24} />
                Семейный альбом
              </CardTitle>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Icon name="Upload" className="mr-2" size={16} />
                Загрузить файл
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyAlbum.map((item, index) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-lg transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    {item.type === 'image' ? (
                      <Icon name="Image" size={64} className="text-purple-300" />
                    ) : (
                      <Icon name="Video" size={64} className="text-pink-300" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="font-semibold truncate">{item.fileName}</p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{item.uploadedBy}</span>
                      <span>{item.uploadDate}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="needs" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="ListTodo" size={24} />
                Семейные потребности
              </CardTitle>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить потребность
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {familyNeeds.map((need, index) => (
              <Card
                key={need.id}
                className="animate-fade-in hover:shadow-md transition-all"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{need.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{need.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className={getPriorityColor(need.priority)}>
                          {need.priority === 'high' && '🔴 Высокий'}
                          {need.priority === 'medium' && '🟡 Средний'}
                          {need.priority === 'low' && '🟢 Низкий'}
                        </Badge>
                        <Badge className={getStatusColor(need.status)}>
                          {need.status === 'completed' && '✅ Выполнено'}
                          {need.status === 'in_progress' && '⏳ В процессе'}
                          {need.status === 'pending' && '⏸️ Ожидает'}
                        </Badge>
                        <Badge variant="secondary">{need.category}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">От:</span>
                          <span className="font-medium">{need.createdByName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="ArrowRight" size={14} />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Кому:</span>
                          <span className="font-medium">{need.assignedToName}</span>
                        </div>
                        {need.dueDate && (
                          <div className="flex items-center gap-1 ml-auto">
                            <Icon name="Calendar" size={14} className="text-muted-foreground" />
                            <span className="text-muted-foreground">{need.dueDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {need.status !== 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateNeedStatus(need.id, 'in_progress')}
                      >
                        Начать выполнение
                      </Button>
                    )}
                    {need.status !== 'completed' && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-500"
                        onClick={() => updateNeedStatus(need.id, 'completed')}
                      >
                        <Icon name="Check" className="mr-1" size={14} />
                        Завершить
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rating" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Trophy" size={24} />
              Семейный рейтинг
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...familyMembers]
                .sort((a, b) => b.points - a.points)
                .map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-yellow-600 w-8">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `#${index + 1}`}
                      </div>
                      <div className="text-4xl">{member.avatar}</div>
                      <div>
                        <p className="font-semibold text-lg">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">{member.points}</p>
                        <p className="text-xs text-muted-foreground">баллов</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg px-4 py-2">
                        Уровень {member.level}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="traditions" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {traditions.map((tradition, index) => (
            <Card
              key={tradition.id}
              className="animate-fade-in hover:shadow-lg transition-all border-l-4 border-l-purple-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{tradition.icon}</div>
                    <div>
                      <CardTitle className="text-xl">{tradition.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">{tradition.frequency}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{tradition.description}</p>
                <div className="flex flex-wrap gap-1">
                  {tradition.participants.map((participant, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {participant}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="values" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {familyValues.map((value, index) => (
            <Card
              key={value.id}
              className="animate-fade-in hover:shadow-lg transition-all border-t-4 border-t-pink-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-5xl">{value.icon}</div>
                  <CardTitle className="text-2xl">{value.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{value.description}</p>
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-pink-900 mb-1">Наша традиция:</p>
                  <p className="text-sm text-pink-700">{value.tradition}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="meals" className="space-y-6">
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Icon name="Sparkles" size={28} className="text-orange-500" />
              ИИ рекомендации на основе предпочтений семьи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getAISuggestedMeals().map((meal, index) => (
                <Card
                  key={index}
                  className="border-2 border-orange-300 hover:shadow-lg transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-4">
                    <div className="text-5xl mb-3 text-center">{meal.icon}</div>
                    <h3 className="font-bold text-lg mb-2 text-center">{meal.name}</h3>
                    <p className="text-sm text-muted-foreground text-center">{meal.reason}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {mealVotings.map((voting, votingIndex) => (
          <Card key={voting.id} className="animate-fade-in" style={{ animationDelay: `${votingIndex * 0.1}s` }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Icon name="ChefHat" size={24} />
                    {voting.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Дата: {voting.date} | Тип: {voting.mealType === 'breakfast' ? 'Завтрак' : voting.mealType === 'lunch' ? 'Обед' : 'Ужин'}
                  </p>
                </div>
                <Badge className={voting.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                  {voting.status === 'active' ? 'Активно' : 'Завершено'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {voting.options.map((option, optionIndex) => {
                  const voteCount = Object.values(option.votes).filter(Boolean).length;
                  const voters = Object.entries(option.votes)
                    .filter(([_, voted]) => voted)
                    .map(([memberId]) => getMemberById(memberId)?.name)
                    .filter(Boolean);

                  return (
                    <Card
                      key={option.id}
                      className="hover:shadow-md transition-all border-2 hover:border-orange-400"
                    >
                      <CardContent className="p-4">
                        <div className="text-5xl mb-3 text-center">{option.icon}</div>
                        <h3 className="font-bold text-lg mb-2">{option.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{option.description}</p>

                        <div className="flex gap-2 mb-3 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            <Icon name="Clock" size={12} className="mr-1" />
                            {option.cookingTime}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              option.difficulty === 'easy'
                                ? 'bg-green-50'
                                : option.difficulty === 'medium'
                                ? 'bg-yellow-50'
                                : 'bg-red-50'
                            }`}
                          >
                            {option.difficulty === 'easy' && '✅ Легко'}
                            {option.difficulty === 'medium' && '⚠️ Средне'}
                            {option.difficulty === 'hard' && '🔥 Сложно'}
                          </Badge>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold">Голосов:</span>
                            <span className="text-lg font-bold text-orange-600">{voteCount}</span>
                          </div>
                          {voters.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {voters.map((voterName, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {voterName}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                          size="sm"
                        >
                          <Icon name="ThumbsUp" className="mr-2" size={16} />
                          Проголосовать
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="development" className="space-y-6">
        {developmentPlans.map((plan, planIndex) => (
          <Card
            key={plan.childId}
            className="animate-fade-in border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50"
            style={{ animationDelay: `${planIndex * 0.1}s` }}
          >
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Icon name="GraduationCap" size={32} className="text-blue-600" />
                План развития: {plan.childName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Icon name="User" size={20} className="text-blue-600" />
                  Профиль ребенка
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Возраст</p>
                    <p className="font-medium">{plan.profile.age} лет</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Личность</p>
                    <p className="font-medium">{plan.profile.personality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Интересы</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.profile.interests.map((interest, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Сильные стороны</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.profile.strengths.map((strength, i) => (
                        <Badge key={i} className="bg-green-100 text-green-800 text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Цели</p>
                  <div className="space-y-1">
                    {plan.profile.goals.map((goal, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Icon name="Target" size={14} className="text-blue-600" />
                        <span className="text-sm">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Icon name="Calendar" size={20} className="text-blue-600" />
                  Расписание занятий
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {plan.schedule.map((activity, i) => (
                    <Card key={activity.id} className={`${activity.color} border-2`}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">{activity.dayOfWeek}</Badge>
                          <span className="text-xs font-semibold">{activity.time}</span>
                        </div>
                        <h4 className="font-bold mb-1">{activity.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{activity.category}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Icon name="MapPin" size={12} />
                            <span>{activity.location}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Icon name="Clock" size={12} />
                            <span>{activity.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Icon name="User" size={12} />
                            <span>{activity.instructor}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Icon name="TrendingUp" size={20} className="text-blue-600" />
                  Развитие навыков
                </h3>
                <div className="space-y-4">
                  {plan.skills.map((skill, i) => (
                    <div key={skill.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold">{skill.skillName}</h4>
                          <p className="text-xs text-muted-foreground">{skill.category}</p>
                        </div>
                        <Badge
                          className={
                            skill.importance === 'high'
                              ? 'bg-red-100 text-red-800'
                              : skill.importance === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }
                        >
                          {skill.importance === 'high' && 'Высокий приоритет'}
                          {skill.importance === 'medium' && 'Средний приоритет'}
                          {skill.importance === 'low' && 'Низкий приоритет'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{skill.description}</p>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Прогресс</span>
                          <span className="font-semibold text-blue-600">{skill.progress}%</span>
                        </div>
                        <Progress value={skill.progress} className="h-2" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {skill.suggestedActivities.map((activity, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Icon name="Award" size={20} className="text-blue-600" />
                  Достижения и вехи
                </h3>
                <div className="space-y-2">
                  {plan.milestones.map((milestone, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        milestone.completed
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {milestone.completed ? '✅' : '⏳'}
                        </div>
                        <div>
                          <p className={`font-medium ${milestone.completed ? 'text-green-900' : ''}`}>
                            {milestone.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{milestone.date}</p>
                        </div>
                      </div>
                      {!milestone.completed && (
                        <Button size="sm" variant="outline">
                          Отметить выполненным
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="community" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="BookOpen" size={24} />
                Семейный блог
              </CardTitle>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Icon name="Plus" className="mr-2" size={16} />
                Новая запись
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogPosts.map((post, index) => (
                <Card
                  key={post.id}
                  className="animate-fade-in hover:shadow-lg transition-all cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{post.author}</span>
                          <span>•</span>
                          <span>{post.date}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Icon name="Heart" size={16} className="text-red-500" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="MessageSquare" size={16} className="text-blue-500" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="dates" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {importantDates.map((date, index) => (
            <Card
              key={date.id}
              className="animate-fade-in hover:shadow-lg transition-all border-t-4 border-t-red-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">
                    {date.type === 'birthday' && '🎂'}
                    {date.type === 'anniversary' && '💍'}
                    {date.type === 'milestone' && '🎓'}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{date.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{date.date}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-red-900">До события:</span>
                    <span className="text-2xl font-bold text-red-600">{date.daysLeft} дней</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="ai" className="space-y-6">
        <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Icon name="Sparkles" className="text-cyan-600" size={32} />
              ИИ-Рекомендации для здоровья
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Персональные рекомендации по здоровью, питанию и развитию для каждого члена семьи
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {aiRecommendations.map((rec, idx) => {
                const member = familyMembers.find(m => m.id === rec.memberId);
                if (!member) return null;

                return (
                  <Card 
                    key={rec.memberId}
                    className="animate-fade-in border-2 border-cyan-200 hover:shadow-xl transition-all"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <CardHeader className="bg-gradient-to-r from-cyan-100 to-blue-100">
                      <div className="flex items-center gap-4">
                        <div className="text-6xl">{member.avatar}</div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl">{rec.memberName}</CardTitle>
                          <p className="text-sm text-muted-foreground">{rec.age} {rec.age === 1 ? 'год' : rec.age < 5 ? 'года' : 'лет'}</p>
                          <Badge className="mt-2 bg-cyan-500">
                            {rec.ageGroup === 'school' && '👦 Школьный возраст'}
                            {rec.ageGroup === 'adult' && '👨 Взрослый'}
                            {rec.ageGroup === 'senior' && '👴 Пожилой возраст'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                      {rec.healthCheckups && rec.healthCheckups.length > 0 && (
                        <Card className="bg-red-50 border-red-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Icon name="Stethoscope" className="text-red-600" size={20} />
                              Медицинские обследования
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {rec.healthCheckups.map((checkup) => (
                              <div key={checkup.id} className="p-3 bg-white rounded-lg border">
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="font-semibold">{checkup.name}</h4>
                                  <Badge variant={checkup.importance === 'critical' ? 'destructive' : 'outline'}>
                                    {checkup.importance === 'critical' && 'Критично'}
                                    {checkup.importance === 'high' && 'Важно'}
                                    {checkup.importance === 'medium' && 'Рекомендуется'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{checkup.description}</p>
                                <div className="flex items-center gap-2 text-sm">
                                  <Icon name="Clock" size={14} className="text-blue-600" />
                                  <span>Периодичность: {checkup.frequency}</span>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {rec.vitamins && rec.vitamins.length > 0 && (
                        <Card className="bg-orange-50 border-orange-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Icon name="Pill" className="text-orange-600" size={20} />
                              Витамины и добавки
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {rec.vitamins.map((vitamin, vidx) => (
                              <div key={vidx} className="p-3 bg-white rounded-lg border">
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="font-semibold">{vitamin.name}</h4>
                                  <Badge variant="outline" className="bg-orange-100">{vitamin.dosage}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{vitamin.reason}</p>
                                {vitamin.season && (
                                  <p className="text-xs text-orange-600 mt-1">Особенно важно: {vitamin.season}</p>
                                )}
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {rec.nutrition && rec.nutrition.length > 0 && (
                        <Card className="bg-green-50 border-green-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Icon name="Apple" className="text-green-600" size={20} />
                              Питание
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {rec.nutrition.map((nutr, nidx) => (
                              <div key={nidx} className="p-3 bg-white rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                  <Icon name="ChefHat" size={16} className="text-green-600" />
                                  <h4 className="font-semibold">{nutr.category}</h4>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {nutr.items.map((item, iidx) => (
                                    <Badge key={iidx} variant="outline" className="text-xs">{item}</Badge>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground">{nutr.reason}</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {rec.developmentMilestones && rec.developmentMilestones.length > 0 && (
                        <Card className="bg-purple-50 border-purple-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Icon name="TrendingUp" className="text-purple-600" size={20} />
                              Развитие для возраста {rec.age} лет
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {rec.developmentMilestones.map((milestone, midx) => (
                              <div key={midx} className="p-3 bg-white rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                  <Icon name="Target" size={16} className="text-purple-600" />
                                  <h4 className="font-semibold">{milestone.category}</h4>
                                  <Badge className="ml-auto">{milestone.ageRange}</Badge>
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {milestone.skills.map((skill, sidx) => (
                                    <li key={sidx} className="text-muted-foreground">{skill}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {rec.cognitiveSkills && rec.cognitiveSkills.length > 0 && (
                        <Card className="bg-indigo-50 border-indigo-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Icon name="Brain" className="text-indigo-600" size={20} />
                              Когнитивное развитие
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {rec.cognitiveSkills.map((skill, cidx) => (
                                <Badge key={cidx} variant="outline" className="bg-indigo-100">{skill}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {rec.socialSkills && rec.socialSkills.length > 0 && (
                        <Card className="bg-pink-50 border-pink-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Icon name="Users" className="text-pink-600" size={20} />
                              Социальные навыки
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {rec.socialSkills.map((skill, sidx) => (
                                <Badge key={sidx} variant="outline" className="bg-pink-100">{skill}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {rec.physicalActivity && rec.physicalActivity.length > 0 && (
                        <Card className="bg-teal-50 border-teal-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Icon name="Activity" className="text-teal-600" size={20} />
                              Физическая активность
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {rec.physicalActivity.map((activity, aidx) => (
                              <div key={aidx} className="flex items-center gap-3 p-2 bg-white rounded border">
                                <Icon name="Dumbbell" size={16} className="text-teal-600" />
                                <div>
                                  <span className="font-semibold">{activity.type}</span>
                                  <p className="text-xs text-muted-foreground">{activity.duration} • {activity.frequency}</p>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {rec.warnings && rec.warnings.length > 0 && (
                        <Card className="bg-yellow-50 border-yellow-300">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Icon name="AlertTriangle" className="text-yellow-600" size={20} />
                              Важные предостережения
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {rec.warnings.map((warning, widx) => (
                                <li key={widx} className="flex items-start gap-2">
                                  <Icon name="AlertCircle" size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{warning}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {rec.tips && rec.tips.length > 0 && (
                        <Card className="bg-blue-50 border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Icon name="Lightbulb" className="text-blue-600" size={20} />
                              Полезные советы
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {rec.tips.map((tip, tidx) => (
                                <li key={tidx} className="flex items-start gap-2">
                                  <Icon name="CheckCircle2" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-gradient-to-br from-cyan-100 to-blue-100 border-2 border-cyan-300 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Info" className="text-cyan-600" size={20} />
                  О рекомендациях
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Рекомендации составлены на основе возраста, пола и общих медицинских стандартов</p>
                <p>• Обязательно консультируйтесь с врачом перед началом приема витаминов или изменением режима</p>
                <p>• Данные рекомендации носят информационный характер и не заменяют профессиональную медицинскую консультацию</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="feedback" className="space-y-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Icon name="MessageSquare" className="text-blue-600" size={32} />
              Отзывы, Техподдержка, Предложения
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Помогите нам улучшить проект! Ваше мнение очень важно для нас.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-2 border-green-300 bg-green-50 hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon name="Star" className="text-green-600" size={24} />
                    Отзыв
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Поделитесь своим опытом использования приложения
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-300 bg-orange-50 hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon name="Headphones" className="text-orange-600" size={24} />
                    Техподдержка
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Сообщите о проблеме или задайте вопрос
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-300 bg-purple-50 hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon name="Lightbulb" className="text-purple-600" size={24} />
                    Предложение
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Предложите новую функцию или улучшение
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="PenTool" className="text-blue-600" size={20} />
                  Форма обратной связи
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Тип обращения *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="w-full">Отзыв</Button>
                    <Button variant="outline" className="w-full">Поддержка</Button>
                    <Button variant="outline" className="w-full">Предложение</Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Ваше имя *</label>
                  <Input placeholder="Как к вам обращаться?" />
                  <p className="text-xs text-muted-foreground mt-1">💡 Укажите имя, чтобы мы знали, как к вам обращаться</p>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Email (необязательно)</label>
                  <Input type="email" placeholder="your@email.com" />
                  <p className="text-xs text-muted-foreground mt-1">💡 Оставьте email, если хотите получить ответ</p>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Заголовок *</label>
                  <Input placeholder="Кратко опишите суть" />
                  <p className="text-xs text-muted-foreground mt-1">💡 Например: "Ошибка при добавлении задачи" или "Предлагаю добавить темную тему"</p>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Описание *</label>
                  <textarea 
                    className="w-full min-h-[120px] p-3 border rounded-md"
                    placeholder="Подробно опишите ваше обращение..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 <strong>Для отзыва:</strong> Что понравилось? Что можно улучшить?<br />
                    💡 <strong>Для поддержки:</strong> Опишите проблему и шаги для её воспроизведения<br />
                    💡 <strong>Для предложения:</strong> Какую функцию хотите видеть и зачем она нужна?
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Оценка (для отзыва)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Icon key={star} name="Star" size={32} className="text-yellow-400 cursor-pointer hover:scale-110 transition-transform" />
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white" size="lg">
                  <Icon name="Send" className="mr-2" size={16} />
                  Отправить
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Info" className="text-blue-600" size={20} />
                  Почему это важно
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Ваши отзывы помогают нам понять, что работает хорошо, а что нужно улучшить</p>
                <p>• Сообщения о проблемах помогают нам быстрее их исправить</p>
                <p>• Ваши предложения могут стать новыми функциями в следующих версиях</p>
                <p>• Все обращения будут рассмотрены в течение 24-48 часов</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payment" className="space-y-6">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Icon name="CreditCard" className="text-emerald-600" size={32} />
              Подписка и оплата
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Поддержите развитие проекта и получите доступ ко всем функциям
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-gray-300">
                <CardHeader className="bg-gray-100">
                  <CardTitle className="text-2xl">Бесплатная версия</CardTitle>
                  <p className="text-muted-foreground">Попробуйте базовый функционал</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-gray-700 mb-2">0 ₽</div>
                    <p className="text-sm text-muted-foreground">Навсегда бесплатно</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Icon name="Check" className="text-green-600" size={20} />
                      <span className="text-sm">До 4 членов семьи</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Check" className="text-green-600" size={20} />
                      <span className="text-sm">Базовые задачи и календарь</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Check" className="text-green-600" size={20} />
                      <span className="text-sm">Семейный чат</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="X" className="text-gray-400" size={20} />
                      <span className="text-sm text-muted-foreground">ИИ-рекомендации</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="X" className="text-gray-400" size={20} />
                      <span className="text-sm text-muted-foreground">Семейное древо</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="X" className="text-gray-400" size={20} />
                      <span className="text-sm text-muted-foreground">Приоритетная поддержка</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" disabled>
                    Текущий план
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-500 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    Рекомендуем
                  </Badge>
                </div>
                <CardHeader className="bg-gradient-to-r from-emerald-100 to-teal-100">
                  <CardTitle className="text-2xl">Годовая подписка</CardTitle>
                  <p className="text-muted-foreground">Полный доступ ко всем функциям</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-emerald-600 mb-2">800 ₽</div>
                    <p className="text-sm text-muted-foreground">В год • Всего 67 ₽/мес</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Icon name="Check" className="text-emerald-600" size={20} />
                      <span className="text-sm font-semibold">Неограниченное количество членов</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Check" className="text-emerald-600" size={20} />
                      <span className="text-sm font-semibold">Все функции бесплатной версии</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Check" className="text-emerald-600" size={20} />
                      <span className="text-sm font-semibold">ИИ-рекомендации по здоровью</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Check" className="text-emerald-600" size={20} />
                      <span className="text-sm font-semibold">Семейное древо без ограничений</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Check" className="text-emerald-600" size={20} />
                      <span className="text-sm font-semibold">Планы развития детей</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Check" className="text-emerald-600" size={20} />
                      <span className="text-sm font-semibold">Приоритетная техподдержка</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Check" className="text-emerald-600" size={20} />
                      <span className="text-sm font-semibold">Резервное копирование данных</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white" size="lg">
                    <Icon name="Sparkles" className="mr-2" size={16} />
                    Оформить подписку
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Gift" className="text-amber-600" size={24} />
                  Специальное предложение
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  <strong>Первым 100 подписчикам:</strong> Скидка 50% на первый год подписки! Вместо 800₽ - всего 400₽
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Clock" size={16} />
                  <span>Предложение действует до 31 декабря 2025</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="HelpCircle" className="text-blue-600" size={20} />
                  Часто задаваемые вопросы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Как оплатить подписку?</h4>
                  <p className="text-sm text-muted-foreground">
                    После нажатия кнопки "Оформить подписку" вы будете перенаправлены на защищенную страницу оплаты. Принимаем карты всех банков.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Можно ли отменить подписку?</h4>
                  <p className="text-sm text-muted-foreground">
                    Да, вы можете отменить подписку в любой момент. При этом доступ к функциям сохранится до конца оплаченного периода.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Безопасна ли оплата?</h4>
                  <p className="text-sm text-muted-foreground">
                    Да, все платежи обрабатываются через защищенный платежный шлюз. Мы не храним данные ваших карт.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Что будет с данными после окончания подписки?</h4>
                  <p className="text-sm text-muted-foreground">
                    Все ваши данные сохраняются. Вы просто потеряете доступ к премиум-функциям, но базовый функционал останется доступным.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Heart" className="text-emerald-600" size={20} />
                  Поддержите развитие проекта
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Ваша подписка помогает нам:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Разрабатывать новые функции</li>
                  <li>Улучшать существующий функционал</li>
                  <li>Обеспечивать быструю техподдержку</li>
                  <li>Поддерживать серверы и инфраструктуру</li>
                  <li>Создавать качественный продукт для семей</li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="alice" className="space-y-6">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Icon name="Mic" className="text-purple-600" size={32} />
              Интеграция с Алисой
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Управляйте семейным органайзером голосом через Яндекс Алису
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="border-2 border-purple-300 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Zap" className="text-purple-600" size={24} />
                  Webhook URL для навыка Алисы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300 font-mono text-sm break-all">
                  https://functions.poehali.dev/06ed580e-0fae-4278-a2cc-e5f626486d18
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText('https://functions.poehali.dev/06ed580e-0fae-4278-a2cc-e5f626486d18');
                    alert('✅ URL скопирован в буфер обмена!');
                  }}
                >
                  <Icon name="Copy" className="mr-2" size={16} />
                  Скопировать URL
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BookOpen" className="text-blue-600" size={24} />
                  Инструкция по подключению
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Перейдите в Яндекс Диалоги</h4>
                      <p className="text-sm text-muted-foreground">
                        Откройте <a href="https://dialogs.yandex.ru/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">dialogs.yandex.ru</a> и войдите в аккаунт
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Создайте новый навык</h4>
                      <p className="text-sm text-muted-foreground">
                        Нажмите "Создать диалог" → выберите "Навык для Алисы" → введите название "Семейный Органайзер"
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Настройте Webhook</h4>
                      <p className="text-sm text-muted-foreground">
                        В разделе "Backend" → выберите "Webhook" → вставьте URL выше → сохраните
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Опубликуйте навык</h4>
                      <p className="text-sm text-muted-foreground">
                        Заполните описание навыка → нажмите "На модерацию" → дождитесь одобрения (1-3 дня)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Активируйте навык</h4>
                      <p className="text-sm text-muted-foreground">
                        Скажите "Алиса, запусти навык Семейный Органайзер" или включите в мобильном приложении Яндекс
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-300 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageCircle" className="text-green-600" size={24} />
                  Доступные голосовые команды
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Plus" className="text-blue-600" size={20} />
                      <h4 className="font-semibold">Добавление задач</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Примеры команд:</p>
                    <ul className="text-sm space-y-1">
                      <li>• "Добавь задачу купить молоко для Маши"</li>
                      <li>• "Создай задачу полить цветы"</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="List" className="text-purple-600" size={20} />
                      <h4 className="font-semibold">Просмотр задач</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Примеры команд:</p>
                    <ul className="text-sm space-y-1">
                      <li>• "Покажи задачи"</li>
                      <li>• "Какие задачи на сегодня?"</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="ChefHat" className="text-orange-600" size={20} />
                      <h4 className="font-semibold">Готовка</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Примеры команд:</p>
                    <ul className="text-sm space-y-1">
                      <li>• "Кто сегодня готовит?"</li>
                      <li>• "Чья очередь готовить?"</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Users" className="text-pink-600" size={20} />
                      <h4 className="font-semibold">Информация о семье</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Примеры команд:</p>
                    <ul className="text-sm space-y-1">
                      <li>• "Покажи семью"</li>
                      <li>• "Покажи рейтинг"</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="HelpCircle" className="text-gray-600" size={20} />
                      <h4 className="font-semibold">Помощь</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Примеры команд:</p>
                    <ul className="text-sm space-y-1">
                      <li>• "Помощь"</li>
                      <li>• "Что ты умеешь?"</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-300 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Sparkles" className="text-amber-600" size={24} />
                  Где использовать Алису
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-5xl mb-2">🏠</div>
                    <h4 className="font-semibold mb-1">Яндекс Станция</h4>
                    <p className="text-sm text-muted-foreground">
                      Умная колонка для всей семьи
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-2">📱</div>
                    <h4 className="font-semibold mb-1">Мобильное приложение</h4>
                    <p className="text-sm text-muted-foreground">
                      Яндекс или Алиса на iOS/Android
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-2">💻</div>
                    <h4 className="font-semibold mb-1">Браузер</h4>
                    <p className="text-sm text-muted-foreground">
                      Яндекс.Браузер с голосовым помощником
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Info" className="text-purple-600" size={20} />
                  Важная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Для использования навыка нужен аккаунт Яндекс</p>
                <p>• Навык работает на всех устройствах с Алисой</p>
                <p>• Голосовые команды обрабатываются в реальном времени</p>
                <p>• Для полной функциональности требуется интернет-соединение</p>
                <p>• После публикации навык доступен только вам (можно сделать публичным)</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stats" className="space-y-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3 mb-2">
                  <Icon name="BarChart3" className="text-blue-600" size={32} />
                  Статистика проекта
                </CardTitle>
                <p className="text-muted-foreground">
                  Просмотр собранной статистики по обратной связи и использованию
                </p>
              </div>
              {exportStatsToCSV && (
                <Button
                  onClick={exportStatsToCSV}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Icon name="Download" className="mr-2" size={16} />
                  Экспорт в CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-green-300 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="ThumbsUp" className="text-green-600" size={24} />
                    Буду использовать
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-600 mb-2">
                      {JSON.parse(localStorage.getItem('feedbackStats') || '{}').will_use || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Положительных откликов</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-300 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="ThumbsDown" className="text-red-600" size={24} />
                    Не интересно
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-red-600 mb-2">
                      {JSON.parse(localStorage.getItem('feedbackStats') || '{}').not_interested || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Отрицательных откликов</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-indigo-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="PieChart" className="text-indigo-600" size={24} />
                  Процентное соотношение
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const stats = JSON.parse(localStorage.getItem('feedbackStats') || '{}');
                    const willUse = stats.will_use || 0;
                    const notInterested = stats.not_interested || 0;
                    const total = willUse + notInterested || 1;
                    const willUsePercent = Math.round((willUse / total) * 100);
                    const notInterestedPercent = Math.round((notInterested / total) * 100);
                    
                    return (
                      <>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-semibold">Буду использовать</span>
                            <span className="text-sm font-bold text-green-600">{willUsePercent}%</span>
                          </div>
                          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
                              style={{ width: `${willUsePercent}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-semibold">Не интересно</span>
                            <span className="text-sm font-bold text-red-600">{notInterestedPercent}%</span>
                          </div>
                          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all"
                              style={{ width: `${notInterestedPercent}%` }}
                            />
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-300 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageSquare" className="text-purple-600" size={24} />
                  Отзывы из формы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Icon name="Inbox" size={48} className="text-purple-400 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Отзывы будут отображаться здесь после отправки формы обратной связи
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Функционал находится в разработке. В полной версии здесь будет список всех отзывов с фильтрацией по типу и статусу.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Info" className="text-blue-600" size={20} />
                  О статистике
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Данные сохраняются локально в вашем браузере</p>
                <p>• Статистика обновляется в реальном времени при нажатии кнопок</p>
                <p>• В полной версии данные будут храниться в базе данных</p>
                <p>• Вы можете очистить статистику, очистив кэш браузера</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
}