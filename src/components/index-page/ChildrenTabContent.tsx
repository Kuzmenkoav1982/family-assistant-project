import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { AddFamilyMemberForm } from '@/components/AddFamilyMemberForm';
import type { ChildProfile, DevelopmentPlan, FamilyMember } from '@/types/family.types';

interface ChildrenTabContentProps {
  childrenProfiles: ChildProfile[];
  developmentPlans: DevelopmentPlan[];
  familyMembers: FamilyMember[];
  setEducationChild: (member: FamilyMember | null) => void;
  navigate: (path: string) => void;
  addMember?: (member: any) => void;
}

export default function ChildrenTabContent({
  childrenProfiles,
  developmentPlans,
  familyMembers,
  setEducationChild,
  navigate,
  addMember,
}: ChildrenTabContentProps) {
  return (
    <TabsContent value="children">
      <Card className="border-2 border-pink-200 bg-pink-50/50 mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Baby" size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Как работает раздел "Дети"?</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Отслеживайте развитие</strong> каждого ребёнка — навыки, достижения, расписание занятий.</p>
                <p><strong>Проходите IQ-тесты</strong> для оценки 6 категорий развития с рекомендациями от ИИ.</p>
                <p><strong>Видьте прогресс</strong> в визуальной форме и получайте персональные советы.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {childrenProfiles.length > 0 ? childrenProfiles.map((child, idx) => {
          const devPlan = developmentPlans.find(dp => dp.childId === child.childId);
          const avgProgress = devPlan?.skills ? Math.round(devPlan.skills.reduce((sum, s) => sum + s.progress, 0) / devPlan.skills.length) : 0;
          const completedMilestones = devPlan?.milestones.filter(m => m.completed).length || 0;
          const totalMilestones = devPlan?.milestones.length || 0;
          
          return (
            <Card key={child.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {child.avatar.startsWith('http') ? (
                      <img 
                        src={child.avatar} 
                        alt={child.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-300"
                      />
                    ) : (
                      <span className="text-4xl">{child.avatar}</span>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl">{child.name}</CardTitle>
                        <Badge>{child.age} лет</Badge>
                        <Badge variant="outline" className="bg-blue-50">{child.grade} класс</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{child.personality}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">{avgProgress}%</div>
                    <p className="text-xs text-gray-500">Общий прогресс</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-1">
                      <Icon name="Target" className="text-purple-600" size={20} />
                      <span className="text-2xl font-bold text-purple-600">{completedMilestones}/{totalMilestones}</span>
                    </div>
                    <p className="text-xs font-medium text-purple-900">Цели достигнуто</p>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <Icon name="Sparkles" className="text-blue-600" size={20} />
                      <span className="text-2xl font-bold text-blue-600">{devPlan?.skills.length || 0}</span>
                    </div>
                    <p className="text-xs font-medium text-blue-900">Навыков развивается</p>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                    <div className="flex items-center justify-between mb-1">
                      <Icon name="Calendar" className="text-green-600" size={20} />
                      <span className="text-2xl font-bold text-green-600">{devPlan?.schedule.length || 0}</span>
                    </div>
                    <p className="text-xs font-medium text-green-900">Занятий в неделю</p>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200">
                    <div className="flex items-center justify-between mb-1">
                      <Icon name="Trophy" className="text-orange-600" size={20} />
                      <span className="text-2xl font-bold text-orange-600">{child.achievements?.length || 0}</span>
                    </div>
                    <p className="text-xs font-medium text-orange-900">Достижений</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Icon name="TrendingUp" size={14} className="text-purple-600" />
                      Развиваемые навыки
                    </h4>
                    <div className="space-y-2">
                      {devPlan?.skills.slice(0, 3).map((skill, i) => (
                        <div key={`${child.id}-skill-${i}`} className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{skill.skillName}</span>
                            <Badge variant="outline" className="text-[10px] h-5">{skill.progress}%</Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${skill.progress}%` }}
                            />
                          </div>
                        </div>
                      )) || <p className="text-xs text-gray-500">Навыки не добавлены</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Icon name="Award" size={14} className="text-orange-600" />
                      Последние достижения
                    </h4>
                    <div className="space-y-1">
                      {child.achievements && child.achievements.length > 0 ? (
                        child.achievements.slice(0, 3).map((achievement, i) => (
                          <div key={`${child.id}-achievement-${i}`} className="text-xs flex items-start gap-2 p-2 bg-orange-50 rounded">
                            <Icon name="Trophy" size={12} className="text-orange-500 mt-0.5" />
                            <span>{achievement}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">Достижений пока нет</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Icon name="CalendarDays" size={14} className="text-blue-600" />
                    Расписание недели
                  </h4>
                  <div className="space-y-2">
                    {devPlan?.schedule && devPlan.schedule.length > 0 ? (
                      devPlan.schedule.map((activity, i) => (
                        <div key={`${child.id}-schedule-${i}`} className={`p-3 rounded-lg border-2 ${activity.color}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-gray-900">{activity.name}</span>
                                <Badge variant="outline" className="text-[9px] h-4 px-1">{activity.category}</Badge>
                              </div>
                              <div className="space-y-0.5 text-[10px] text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Icon name="Calendar" size={10} />
                                  <span>{activity.dayOfWeek}</span>
                                  <span className="mx-1">&bull;</span>
                                  <Icon name="Clock" size={10} />
                                  <span>{activity.time}</span>
                                  <span className="text-gray-400">({activity.duration})</span>
                                </div>
                                {activity.location && (
                                  <div className="flex items-center gap-1">
                                    <Icon name="MapPin" size={10} />
                                    <span>{activity.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-lg">
                              {activity.category === '\u0421\u043f\u043e\u0440\u0442' ? '\u26BD' : 
                               activity.category === 'STEM' ? '\u{1F916}' : 
                               activity.category === '\u0422\u0432\u043e\u0440\u0447\u0435\u0441\u0442\u0432\u043e' ? '\u{1F3A8}' : 
                               activity.category === '\u041c\u0443\u0437\u044b\u043a\u0430' ? '\u{1F3B9}' : '\u{1F4DA}'}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-2">Расписание не заполнено</p>
                    )}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Icon name="Lightbulb" size={14} className="text-yellow-600" />
                      Рекомендации ИИ
                    </h4>
                    <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-gray-700">
                        {child.id === 'child-3' 
                          ? '\u{1F3AF} Отличный прогресс в логическом мышлении! Рекомендуем добавить курс по математическим олимпиадам и увеличить время на проекты по робототехнике.'
                          : '\u{1F3A8} Творческие способности развиваются прекрасно! Предлагаем добавить занятия музыкальной импровизацией и участие в театральной студии.'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Icon name="BarChart3" size={14} className="text-indigo-600" />
                      Загруженность по дням
                    </h4>
                    <div className="grid grid-cols-7 gap-1">
                      {['\u041f\u043d', '\u0412\u0442', '\u0421\u0440', '\u0427\u0442', '\u041f\u0442', '\u0421\u0431', '\u0412\u0441'].map((day, dayIndex) => {
                        const dayActivities = devPlan?.schedule.filter(act => 
                          act.dayOfWeek === ['\u041f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a', '\u0412\u0442\u043e\u0440\u043d\u0438\u043a', '\u0421\u0440\u0435\u0434\u0430', '\u0427\u0435\u0442\u0432\u0435\u0440\u0433', '\u041f\u044f\u0442\u043d\u0438\u0446\u0430', '\u0421\u0443\u0431\u0431\u043e\u0442\u0430', '\u0412\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435'][dayIndex]
                        ).length || 0;
                        const intensity = dayActivities === 0 ? 'bg-gray-100' : 
                                         dayActivities === 1 ? 'bg-green-200' : 
                                         dayActivities === 2 ? 'bg-yellow-300' : 'bg-red-300';
                        
                        return (
                          <div key={`${child.id}-day-${dayIndex}`} className="flex flex-col items-center">
                            <div className={`w-full h-12 rounded ${intensity} flex items-center justify-center text-xs font-bold transition-all hover:scale-105`}>
                              {dayActivities}
                            </div>
                            <span className="text-[9px] text-gray-600 mt-0.5">{day}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[9px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded bg-gray-100"></div>
                        <span>Нет</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded bg-green-200"></div>
                        <span>1</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded bg-yellow-300"></div>
                        <span>2</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded bg-red-300"></div>
                        <span>3+</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setEducationChild(familyMembers.find(m => m.id === child.childId) || null)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <Icon name="GraduationCap" className="mr-2" size={16} />
                    Тесты и развитие
                  </Button>
                  <Button
                    onClick={() => navigate(`/member/${child.childId}`)}
                    variant="outline"
                    className="border-purple-300"
                  >
                    <Icon name="User" className="mr-2" size={16} />
                    Полный профиль
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <Card key="empty-children">
            <CardContent className="p-8 text-center">
              <Icon name="Baby" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Нет профилей детей</h3>
              <p className="text-sm text-muted-foreground mb-4">Добавьте первый профиль ребенка, чтобы отслеживать развитие и достижения</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Добавить ребёнка
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Добавить ребёнка</DialogTitle>
                  </DialogHeader>
                  <AddFamilyMemberForm 
                    editingMember={undefined}
                    isChild={true}
                    onSubmit={(newChild) => {
                      if (addMember) {
                        addMember(newChild);
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </TabsContent>
  );
}
