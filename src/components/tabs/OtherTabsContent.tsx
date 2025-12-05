import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type {
  FamilyMember,
  Tradition,
  FamilyValue,
  BlogPost,
  ImportantDate,
  ChildProfile,
  DevelopmentPlan,
  CalendarEvent,
} from '@/types/family.types';

interface OtherTabsContentProps {
  traditions: Tradition[];
  familyValues: FamilyValue[];
  blogPosts: BlogPost[];
  importantDates: ImportantDate[];
  childrenProfiles: ChildProfile[];
  developmentPlans: DevelopmentPlan[];
  familyMembers: FamilyMember[];
  getAISuggestedMeals: () => { name: string; reason: string; icon: string }[];
  exportStatsToCSV?: () => void;
}

export function OtherTabsContent({
  traditions,
  familyValues,
  blogPosts,
  importantDates,
  childrenProfiles,
  developmentPlans,
  familyMembers,
  getAISuggestedMeals,
  exportStatsToCSV,
}: OtherTabsContentProps) {
  return (
    <>
      <TabsContent value="traditions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Heart" size={24} />
              Семейные традиции
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {traditions.map((tradition) => (
              <Card key={tradition.id}>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{tradition.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{tradition.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon name="Calendar" size={14} />
                    <span>{tradition.frequency}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="values" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Star" size={24} />
              Семейные ценности
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {familyValues.map((value) => (
              <Card key={value.id}>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{value.name}</h4>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="blog" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BookOpen" size={24} />
              Семейный блог
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {blogPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{post.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{post.content}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Icon name="User" size={14} />
                        <span>{post.author}</span>
                        <Icon name="Calendar" size={14} />
                        <span>{new Date(post.date).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="calendar" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Calendar" size={24} />
              Важные даты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {importantDates.map((date) => (
              <Card key={date.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{date.title}</h4>
                      <p className="text-sm text-gray-600">{date.description}</p>
                    </div>
                    <Badge variant="outline">
                      {new Date(date.date).toLocaleDateString('ru-RU')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="children" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Baby" size={24} />
              Дети и их развитие
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {childrenProfiles.map((child) => (
              <Card key={child.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={child.avatar}
                      alt={child.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{child.name}</h4>
                      <p className="text-sm text-gray-600">
                        {child.age} {child.age === 1 ? 'год' : child.age < 5 ? 'года' : 'лет'}
                      </p>
                    </div>
                  </div>

                  {developmentPlans
                    .filter(plan => plan.childId === child.id)
                    .map((plan) => (
                      <div key={plan.id} className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{plan.skill}</span>
                            <span className="text-sm text-gray-600">{plan.progress}%</span>
                          </div>
                          <Progress value={plan.progress} />
                        </div>
                        
                        {plan.milestones && plan.milestones.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Достижения:</p>
                            {plan.milestones.map((milestone, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <Icon 
                                  name={milestone.completed ? "CheckCircle2" : "Circle"} 
                                  size={16} 
                                  className={milestone.completed ? "text-green-500" : "text-gray-400"}
                                />
                                <div className="flex-1">
                                  <span className={milestone.completed ? "line-through text-gray-500" : ""}>
                                    {milestone.title}
                                  </span>
                                  {milestone.date && (
                                    <span className="text-gray-500 ml-2">
                                      ({new Date(milestone.date).toLocaleDateString('ru-RU')})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}

            {childrenProfiles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Icon name="Baby" className="mx-auto mb-2 text-gray-400" size={48} />
                <p>Нет профилей детей</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stats" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="TrendingUp" size={24} />
                Статистика
              </CardTitle>
              {exportStatsToCSV && (
                <Button onClick={exportStatsToCSV} variant="outline" size="sm">
                  <Icon name="Download" size={16} className="mr-2" />
                  Экспорт CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Рейтинг участников</h4>
              <div className="space-y-3">
                {familyMembers
                  .sort((a, b) => b.points - a.points)
                  .map((member, index) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold">
                        {index + 1}
                      </div>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.role}</div>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Icon name="Award" size={14} />
                        {member.points} баллов
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">ИИ рекомендации на сегодня</h4>
              <div className="space-y-2">
                {getAISuggestedMeals().map((meal, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{meal.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium">{meal.name}</div>
                          <div className="text-sm text-gray-600">{meal.reason}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
}
