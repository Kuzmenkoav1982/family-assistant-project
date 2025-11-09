import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
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
  selectedUserId: string;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  toggleTask: (taskId: string) => void;
  addPoints: (assignee: string, points: number) => void;
  getWorkloadColor: (workload: number) => string;
  getMemberById: (id: string) => FamilyMember | undefined;
  getAISuggestedMeals: () => { name: string; reason: string; icon: string }[];
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
  selectedUserId,
  newMessage,
  setNewMessage,
  toggleTask,
  addPoints,
  getWorkloadColor,
  getMemberById,
  getAISuggestedMeals,
}: FamilyTabsContentProps) {
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
      <TabsContent value="members" className="space-y-4">
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
                    <div className="text-5xl">{member.avatar}</div>
                    <div>
                      <CardTitle className="text-xl">{member.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="tree" className="space-y-6">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl flex items-center gap-3">
                <Icon name="Network" className="text-emerald-600" size={32} />
                Семейное древо
              </CardTitle>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500">
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить члена семьи
              </Button>
            </div>
            <p className="text-muted-foreground mt-2">
              История вашей семьи в 4 поколениях
            </p>
          </CardHeader>
          <CardContent>
            {[0, 1, 2].map(generation => {
              const members = familyTree.filter(m => m.generation === generation);
              if (members.length === 0) return null;
              
              return (
                <div key={generation} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-lg px-4 py-2">
                      {generation === 0 && '👴👵 Бабушки и дедушки'}
                      {generation === 1 && '👫 Родители'}
                      {generation === 2 && '👶 Дети'}
                    </Badge>
                    <div className="h-px flex-1 bg-gradient-to-r from-emerald-300 to-transparent"></div>
                  </div>
                  
                  <div className={`grid gap-4 ${
                    generation === 0 ? 'grid-cols-1 md:grid-cols-2' :
                    generation === 1 ? 'grid-cols-1 md:grid-cols-2' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  }`}>
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
                        <Card 
                          key={member.id}
                          className="animate-fade-in hover:shadow-xl transition-all cursor-pointer border-2 border-emerald-200 hover:border-emerald-400 overflow-hidden group"
                          style={{ animationDelay: `${idx * 0.1}s` }}
                          onClick={() => setSelectedTreeMember(member)}
                        >
                          <div className="relative">
                            <div className="h-32 bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 flex items-center justify-center">
                              {member.photo ? (
                                <img src={member.photo} alt={member.fullName} className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg" />
                              ) : (
                                <div className="text-7xl group-hover:scale-110 transition-transform">{member.avatar}</div>
                              )}
                            </div>
                            {member.deathDate && (
                              <Badge className="absolute top-2 right-2 bg-gray-600 text-white">
                                <Icon name="Cross" size={12} className="mr-1" />
                                Память
                              </Badge>
                            )}
                          </div>
                          
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{member.fullName}</CardTitle>
                            <p className="text-sm text-muted-foreground">{years}</p>
                            <p className="text-xs text-emerald-600 font-semibold">{ageText}</p>
                          </CardHeader>
                          
                          <CardContent>
                            {member.occupation && (
                              <div className="flex items-center gap-2 mb-2">
                                <Icon name="Briefcase" size={14} className="text-emerald-600" />
                                <span className="text-sm">{member.occupation}</span>
                              </div>
                            )}
                            {member.placeOfBirth && (
                              <div className="flex items-center gap-2 mb-2">
                                <Icon name="MapPin" size={14} className="text-emerald-600" />
                                <span className="text-sm text-muted-foreground">{member.placeOfBirth}</span>
                              </div>
                            )}
                            
                            {member.achievements && member.achievements.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1">
                                {member.achievements.slice(0, 2).map((achievement, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {achievement}
                                  </Badge>
                                ))}
                                {member.achievements.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{member.achievements.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
        {tasks.map((task, index) => (
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
                  <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{task.assignee}</Badge>
                    <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  +{task.points} баллов
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
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
    </>
  );
}
