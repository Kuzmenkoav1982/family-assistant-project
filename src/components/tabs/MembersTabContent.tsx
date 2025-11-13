import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { AddFamilyMemberForm } from '@/components/AddFamilyMemberForm';
import { ChildDreamsDialog } from '@/components/ChildDreamsDialog';
import MemberPermissions from '@/components/MemberPermissions';
import { useState } from 'react';
import type { FamilyMember } from '@/types/family.types';

interface MembersTabContentProps {
  familyMembers: FamilyMember[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  getWorkloadColor: (workload: number) => string;
  updateMember?: (memberData: Partial<FamilyMember> & { id?: string; member_id?: string }) => Promise<any>;
}

export function MembersTabContent({
  familyMembers,
  setFamilyMembers,
  getWorkloadColor,
  updateMember,
}: MembersTabContentProps) {
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);

  const handleUpdatePermissions = async (memberId: string, permissions: any) => {
    if (updateMember) {
      await updateMember({ member_id: memberId, permissions });
    }
  };

  return (
    <TabsContent value="members" className="space-y-4">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h3 className="text-2xl font-bold">Члены семьи</h3>
        <div className="flex gap-2">
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
        
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Icon name="Baby" className="mr-2" size={16} />
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
                setFamilyMembers([...familyMembers, { ...newChild, relationship: 'Ребёнок' }]);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
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
                  {(member.achievements || []).slice(0, 3).map((achievement, i) => (
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
                        <Icon name="Info" className="mr-2" size={14} />
                        Подробнее
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          {member.avatarType === 'photo' && member.photoUrl ? (
                            <img 
                              src={member.photoUrl} 
                              alt={member.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl">{member.avatar}</span>
                          )}
                          <div>
                            <div>{member.name}</div>
                            <div className="text-sm text-muted-foreground font-normal">{member.role}</div>
                          </div>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon name="Award" className="text-orange-500" size={20} />
                              <span className="font-semibold text-sm">Баллы</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">{member.points}</p>
                            <Progress value={(member.points % 100)} className="h-2 mt-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {100 - (member.points % 100)} до уровня {member.level + 1}
                            </p>
                          </div>
                          
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon name="TrendingUp" className="text-blue-500" size={20} />
                              <span className="font-semibold text-sm">Загрузка</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{member.workload}%</p>
                            <Progress value={member.workload} className="h-2 mt-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {member.workload > 70 ? 'Высокая активность' : member.workload > 50 ? 'Средняя активность' : 'Низкая активность'}
                            </p>
                          </div>
                        </div>
                        
                        {(member.achievements || []).length > 0 && (
                          <div>
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <Icon name="Trophy" className="text-yellow-500" size={20} />
                              Достижения
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {(member.achievements || []).map((achievement, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <span className="text-2xl">
                                    {achievement === 'early_bird' && '🌅'}
                                    {achievement === 'helper' && '🤝'}
                                    {achievement === 'chef' && '👨‍🍳'}
                                    {achievement === 'organizer' && '📋'}
                                    {achievement === 'champion' && '🏆'}
                                    {achievement === 'master_chef' && '⭐'}
                                    {achievement === 'student' && '📚'}
                                    {achievement === 'beginner' && '🌟'}
                                    {achievement === 'wise' && '🦉'}
                                    {achievement === 'cook' && '🍳'}
                                    {achievement === 'gardener' && '🌱'}
                                    {achievement === 'storyteller' && '📖'}
                                  </span>
                                  <span className="text-xs font-medium">
                                    {achievement === 'early_bird' && 'Ранняя пташка'}
                                    {achievement === 'helper' && 'Помощник'}
                                    {achievement === 'chef' && 'Повар'}
                                    {achievement === 'organizer' && 'Организатор'}
                                    {achievement === 'champion' && 'Чемпион'}
                                    {achievement === 'master_chef' && 'Мастер-повар'}
                                    {achievement === 'student' && 'Ученик'}
                                    {achievement === 'beginner' && 'Новичок'}
                                    {achievement === 'wise' && 'Мудрый'}
                                    {achievement === 'cook' && 'Кулинар'}
                                    {achievement === 'gardener' && 'Садовод'}
                                    {achievement === 'storyteller' && 'Рассказчик'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {member.foodPreferences && (
                          <div>
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <Icon name="UtensilsCrossed" className="text-green-500" size={20} />
                              Пищевые предпочтения
                            </h3>
                            <div className="space-y-3">
                              {member.foodPreferences.favorites && member.foodPreferences.favorites.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                  <p className="text-sm font-semibold mb-2 text-green-900">Любимые блюда</p>
                                  <div className="flex flex-wrap gap-2">
                                    {member.foodPreferences.favorites.map((food, i) => (
                                      <Badge key={i} className="bg-green-500">{food}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {member.foodPreferences.dislikes && member.foodPreferences.dislikes.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                  <p className="text-sm font-semibold mb-2 text-red-900">Не любит</p>
                                  <div className="flex flex-wrap gap-2">
                                    {member.foodPreferences.dislikes.map((food, i) => (
                                      <Badge key={i} variant="destructive">{food}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {member.foodPreferences.allergies && member.foodPreferences.allergies.length > 0 && (
                                <div className="bg-orange-50 border border-orange-300 rounded-lg p-3">
                                  <p className="text-sm font-semibold mb-2 text-orange-900">⚠️ Аллергии</p>
                                  <div className="flex flex-wrap gap-2">
                                    {member.foodPreferences.allergies.map((allergy, i) => (
                                      <Badge key={i} className="bg-orange-500">{allergy}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {member.foodPreferences.dietaryRestrictions && member.foodPreferences.dietaryRestrictions.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-sm font-semibold mb-2 text-blue-900">Диетические ограничения</p>
                                  <div className="flex flex-wrap gap-2">
                                    {member.foodPreferences.dietaryRestrictions.map((restriction, i) => (
                                      <Badge key={i} className="bg-blue-500">{restriction}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <ChildDreamsDialog member={member} />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-purple-300 hover:bg-purple-50"
                    onClick={() => {
                      setEditingMember(member);
                      setAddMemberDialogOpen(true);
                    }}
                  >
                    <Icon name="Edit" className="mr-2" size={14} />
                    Редактировать
                  </Button>
                </div>

                {updateMember && (
                  <div className="mt-3 pt-3 border-t">
                    <MemberPermissions 
                      member={member}
                      onUpdate={handleUpdatePermissions}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  );
}