import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import type { FamilyTreeMember } from '@/types/family.types';

interface TreeTabContentProps {
  familyTree: FamilyTreeMember[];
  selectedTreeMember: FamilyTreeMember | null;
  setSelectedTreeMember: React.Dispatch<React.SetStateAction<FamilyTreeMember | null>>;
}

export function TreeTabContent({
  familyTree,
  selectedTreeMember,
  setSelectedTreeMember,
}: TreeTabContentProps) {
  return (
    <TabsContent value="tree" className="space-y-6">
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden">
        <CardHeader className="relative py-4">
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ 
              backgroundImage: `url('https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png')`,
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
                              {member.photoUrl ? (
                                <img 
                                  src={member.photoUrl} 
                                  alt={member.firstName}
                                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-amber-700 mx-auto mb-1"
                                />
                              ) : (
                                <div className="text-2xl sm:text-3xl mb-1">{member.avatar}</div>
                              )}
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
  );
}