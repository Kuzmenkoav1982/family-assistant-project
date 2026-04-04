import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import type { FamilyTreeMember } from '@/types/family.types';
import { initialFamilyTree } from '@/data/mockData';

export default function Tree() {
  const navigate = useNavigate();
  const [familyTree] = useState<FamilyTreeMember[]>(initialFamilyTree);
  const [selectedMember, setSelectedMember] = useState<FamilyTreeMember | null>(null);

  const getGeneration = (member: FamilyTreeMember): number => {
    if (member.generation !== undefined) return member.generation;
    if (!member.parents || member.parents.length === 0) {
      const hasChildren = familyTree.some(m => m.parents?.includes(member.id));
      const hasGrandchildren = familyTree.some(m => {
        const parentIds = m.parents || [];
        return parentIds.some(pid => {
          const parent = familyTree.find(p => p.id === pid);
          return parent?.parents?.some(gid => gid === member.id);
        });
      });
      if (hasGrandchildren) return 0;
      if (hasChildren) return 1;
      return 0;
    }
    const parent = familyTree.find(m => m.id === member.parents![0]);
    if (parent) return getGeneration(parent) + 1;
    return 0;
  };

  const generations = new Map<number, FamilyTreeMember[]>();
  familyTree.forEach(member => {
    const gen = getGeneration(member);
    if (!generations.has(gen)) generations.set(gen, []);
    generations.get(gen)!.push(member);
  });

  const sortedGenerations = Array.from(generations.entries()).sort(([a], [b]) => a - b);

  const genLabels: Record<number, string> = {
    0: 'Старшее поколение',
    1: 'Родители',
    2: 'Дети',
    3: 'Внуки',
  };

  const calculateAge = (birthYear?: number, birthDate?: string, deathDate?: string) => {
    if (birthDate) {
      const birth = new Date(birthDate);
      const end = deathDate ? new Date(deathDate) : new Date();
      return Math.floor((end.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }
    if (birthYear) {
      return new Date().getFullYear() - birthYear;
    }
    return null;
  };

  const getAgeText = (age: number) => {
    if (age % 10 === 1 && age !== 11) return `${age} год`;
    if (age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20)) return `${age} года`;
    return `${age} лет`;
  };

  const isImageUrl = (avatar: string) => avatar.startsWith('http') || avatar.startsWith('/');

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
              <Icon name="TreePine" className="text-amber-700" size={28} />
              Семейное древо
            </h1>
            <p className="text-amber-700 text-sm">История вашего рода</p>
          </div>
          <Badge className="bg-amber-100 text-amber-800 border border-amber-300">
            {familyTree.length} чел.
          </Badge>
        </div>

        <div className="space-y-6">
          {sortedGenerations.map(([genIndex, members]) => (
            <div key={genIndex}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-amber-200" />
                <span className="text-xs font-medium text-amber-600 uppercase tracking-wider px-2">
                  {genLabels[genIndex] || `Поколение ${genIndex + 1}`}
                </span>
                <div className="h-px flex-1 bg-amber-200" />
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {members.map(member => {
                  const age = calculateAge(member.birthYear, member.birthDate, member.deathDate);
                  const yearText = member.birthYear
                    ? member.deathDate
                      ? `${member.birthYear} — ${member.deathDate.split('-')[0]}`
                      : `${member.birthYear} г.р.`
                    : '';

                  return (
                    <Card
                      key={member.id}
                      className="w-[140px] cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 relative overflow-hidden"
                      onClick={() => setSelectedMember(member)}
                    >
                      {member.deathDate && (
                        <div className="absolute top-1 right-1 z-10">
                          <Badge className="bg-gray-600 text-white text-[10px] px-1 py-0">✝</Badge>
                        </div>
                      )}
                      <CardContent className="p-3 text-center">
                        {isImageUrl(member.avatar) ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-amber-300 mx-auto mb-2"
                          />
                        ) : (
                          <div className="text-3xl mb-2">{member.avatar}</div>
                        )}
                        <p className="font-semibold text-sm text-amber-900 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                          {member.firstName || member.name.split(' ')[0]}
                        </p>
                        <p className="text-[10px] text-amber-600 mt-0.5">{member.role}</p>
                        {yearText && (
                          <p className="text-[10px] text-amber-500 mt-0.5">{yearText}</p>
                        )}
                        {age !== null && (
                          <Badge variant="outline" className="mt-1 text-[10px] border-amber-300 text-amber-700 px-1.5 py-0">
                            {getAgeText(age)}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {genIndex < sortedGenerations.length - 1 && (
                <div className="flex justify-center mt-3">
                  <div className="w-0.5 h-6 bg-amber-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {familyTree.length === 0 && (
          <Card className="border-dashed border-amber-300 bg-amber-50/50">
            <CardContent className="py-12 text-center">
              <Icon name="TreePine" size={48} className="text-amber-300 mx-auto mb-3" />
              <p className="text-amber-700 font-medium mb-1">Древо пока пустое</p>
              <p className="text-amber-500 text-sm mb-4">Добавьте первого члена семьи</p>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedMember && (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {isImageUrl(selectedMember.avatar) ? (
                    <img
                      src={selectedMember.avatar}
                      alt={selectedMember.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
                    />
                  ) : (
                    <span className="text-3xl">{selectedMember.avatar}</span>
                  )}
                  <div>
                    <p className="text-lg">{selectedMember.fullName || selectedMember.name}</p>
                    <p className="text-sm text-muted-foreground font-normal">{selectedMember.role}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                {selectedMember.birthYear && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Calendar" size={16} className="text-amber-600" />
                    <span>Год рождения: {selectedMember.birthYear}</span>
                  </div>
                )}

                {calculateAge(selectedMember.birthYear, selectedMember.birthDate, selectedMember.deathDate) !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Clock" size={16} className="text-amber-600" />
                    <span>Возраст: {getAgeText(calculateAge(selectedMember.birthYear, selectedMember.birthDate, selectedMember.deathDate)!)}</span>
                  </div>
                )}

                {selectedMember.occupation && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Briefcase" size={16} className="text-amber-600" />
                    <span>{selectedMember.occupation}</span>
                  </div>
                )}

                {selectedMember.spouse && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Heart" size={16} className="text-pink-500" />
                    <span>Супруг(а): {familyTree.find(m => m.id === selectedMember.spouse)?.name}</span>
                  </div>
                )}

                {selectedMember.children && selectedMember.children.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Icon name="Users" size={16} className="text-blue-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Дети:</span>
                      <ul className="ml-2 mt-1 space-y-0.5">
                        {selectedMember.children.map(childId => {
                          const child = familyTree.find(m => m.id === childId);
                          return child ? <li key={childId}>• {child.name}</li> : null;
                        })}
                      </ul>
                    </div>
                  </div>
                )}

                {selectedMember.deathDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon name="Star" size={16} />
                    <span>Ушёл из жизни: {selectedMember.deathDate}</span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
