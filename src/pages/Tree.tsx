import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useFamilyTree, type TreeMember, type NewTreeMember } from '@/hooks/useFamilyTree';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

const RELATION_OPTIONS = [
  'Я',
  'Прадед', 'Прабабушка',
  'Дедушка', 'Бабушка',
  'Отец', 'Мать',
  'Сын', 'Дочь',
  'Брат', 'Сестра',
  'Внук', 'Внучка',
  'Дядя', 'Тётя',
  'Племянник', 'Племянница',
  'Супруг', 'Супруга',
  'Другое'
];

const AVATAR_OPTIONS = ['👤', '👨', '👩', '👴', '👵', '👦', '👧', '🧒', '👶', '🧓'];

const GENERATION_MAP: Record<string, number> = {
  'Прадед': 0, 'Прабабушка': 0,
  'Дедушка': 1, 'Бабушка': 1,
  'Отец': 2, 'Мать': 2, 'Дядя': 2, 'Тётя': 2,
  'Я': 3, 'Брат': 3, 'Сестра': 3, 'Супруг': 3, 'Супруга': 3,
  'Сын': 4, 'Дочь': 4, 'Племянник': 4, 'Племянница': 4,
  'Внук': 5, 'Внучка': 5,
};

function getGeneration(member: TreeMember, allMembers: TreeMember[]): number {
  if (member.relation && GENERATION_MAP[member.relation] !== undefined) {
    return GENERATION_MAP[member.relation];
  }
  if (member.parent_id || member.parent2_id) {
    const parent = allMembers.find(m => m.id === (member.parent_id || member.parent2_id));
    if (parent) return getGeneration(parent, allMembers) + 1;
  }
  return 3;
}

interface FamilyUnit {
  primary: TreeMember;
  spouse: TreeMember | null;
  children: TreeMember[];
}

function buildFamilyUnits(genMembers: TreeMember[], allMembers: TreeMember[]): { units: FamilyUnit[], singles: TreeMember[] } {
  const used = new Set<number>();
  const units: FamilyUnit[] = [];
  const singles: TreeMember[] = [];

  const sorted = [...genMembers].sort((a, b) => {
    if (a.relation === 'Я') return -1;
    if (b.relation === 'Я') return 1;
    return (a.birth_year || 9999) - (b.birth_year || 9999);
  });

  for (const member of sorted) {
    if (used.has(member.id)) continue;
    used.add(member.id);

    let spouse: TreeMember | null = null;
    if (member.spouse_id) {
      spouse = genMembers.find(m => m.id === member.spouse_id) || null;
      if (spouse) used.add(spouse.id);
    }
    if (!spouse) {
      const reverseSpouse = genMembers.find(m => m.spouse_id === member.id && !used.has(m.id));
      if (reverseSpouse) {
        spouse = reverseSpouse;
        used.add(reverseSpouse.id);
      }
    }

    const parentIds = new Set<number>();
    parentIds.add(member.id);
    if (spouse) parentIds.add(spouse.id);

    const children = allMembers.filter(m =>
      (m.parent_id && parentIds.has(m.parent_id)) ||
      (m.parent2_id && parentIds.has(m.parent2_id))
    );

    if (spouse || children.length > 0) {
      units.push({ primary: member, spouse, children });
    } else {
      singles.push(member);
    }
  }

  return { units, singles };
}

function MemberCard({ member, onClick, isHighlighted }: { member: TreeMember; onClick: () => void; isHighlighted?: boolean }) {
  const isImageUrl = (avatar: string) => avatar?.startsWith('http') || avatar?.startsWith('/');
  const calculateAge = (birthYear?: number | null, deathYear?: number | null) => {
    if (!birthYear) return null;
    return (deathYear || new Date().getFullYear()) - birthYear;
  };
  const getAgeText = (age: number) => {
    if (age % 10 === 1 && age !== 11) return `${age} год`;
    if (age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20)) return `${age} года`;
    return `${age} лет`;
  };
  const age = calculateAge(member.birth_year, member.death_year);
  const isMe = member.relation === 'Я';

  return (
    <Card
      className={`w-[130px] cursor-pointer hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden ${
        isMe
          ? 'border-amber-500 bg-gradient-to-br from-amber-100 to-yellow-100 ring-2 ring-amber-400/50'
          : isHighlighted
            ? 'border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50'
            : 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50'
      }`}
      onClick={onClick}
    >
      {member.death_year && (
        <div className="absolute top-1 right-1 z-10">
          <Badge className="bg-gray-600 text-white text-[10px] px-1 py-0">&#10013;</Badge>
        </div>
      )}
      {isMe && (
        <div className="absolute top-1 left-1 z-10">
          <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">Я</Badge>
        </div>
      )}
      <CardContent className="p-3 text-center">
        {member.photo_url && isImageUrl(member.photo_url) ? (
          <img
            src={member.photo_url}
            alt={member.name}
            className={`w-14 h-14 rounded-full object-cover border-2 mx-auto mb-2 ${isMe ? 'border-amber-500' : 'border-amber-300'}`}
          />
        ) : (
          <div className="text-3xl mb-2">{member.avatar || '👤'}</div>
        )}
        <p className="font-semibold text-sm text-amber-900 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
          {member.name.split(' ')[0]}
        </p>
        {member.relation && member.relation !== 'Я' && (
          <p className="text-[10px] text-amber-600 mt-0.5">{member.relation}</p>
        )}
        {member.birth_year && (
          <p className="text-[10px] text-amber-500 mt-0.5">
            {member.death_year ? `${member.birth_year} — ${member.death_year}` : `${member.birth_year} г.р.`}
          </p>
        )}
        {age !== null && (
          <Badge variant="outline" className="mt-1 text-[10px] border-amber-300 text-amber-700 px-1.5 py-0">
            {getAgeText(age)}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function FamilyUnitBlock({ unit, onSelect }: { unit: FamilyUnit; onSelect: (m: TreeMember) => void }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-0">
        <MemberCard member={unit.primary} onClick={() => onSelect(unit.primary)} />
        {unit.spouse && (
          <>
            <div className="flex items-center mx-[-4px] z-10">
              <div className="w-6 h-0.5 bg-pink-400" />
              <span className="text-pink-500 text-xs">&#10084;</span>
              <div className="w-6 h-0.5 bg-pink-400" />
            </div>
            <MemberCard member={unit.spouse} onClick={() => onSelect(unit.spouse!)} isHighlighted />
          </>
        )}
      </div>
      {unit.children.length > 0 && (
        <div className="flex flex-col items-center mt-1">
          <div className="w-0.5 h-4 bg-amber-300" />
          {unit.children.length > 1 && (
            <div className="relative w-full flex justify-center">
              <div className="h-0.5 bg-amber-300" style={{ width: `${Math.min(unit.children.length * 80, 300)}px` }} />
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2 mt-0">
            {unit.children.map(child => (
              <div key={child.id} className="flex flex-col items-center">
                {unit.children.length > 1 && <div className="w-0.5 h-3 bg-amber-300" />}
                <MemberCard member={child} onClick={() => onSelect(child)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Tree() {
  const { toast } = useToast();
  const { members, loading, error, addMember, updateMember, deleteMember, addPhoto, deletePhoto } = useFamilyTree();
  const { upload: uploadFile, uploading: uploadingPhoto } = useFileUpload();
  const [selectedMember, setSelectedMember] = useState<TreeMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingGalleryPhoto, setUploadingGalleryPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewTreeMember>({
    name: '',
    relation: '',
    avatar: '👤'
  });

  useEffect(() => {
    if (selectedMember) {
      const updated = members.find(m => m.id === selectedMember.id);
      if (updated && updated !== selectedMember) {
        setSelectedMember(updated);
      }
    }
  }, [members, selectedMember]);

  const generations = new Map<number, TreeMember[]>();
  members.forEach(member => {
    const gen = getGeneration(member, members);
    if (!generations.has(gen)) generations.set(gen, []);
    generations.get(gen)!.push(member);
  });
  const sortedGenerations = Array.from(generations.entries()).sort(([a], [b]) => a - b);

  const genLabels: Record<number, string> = {
    0: 'Прадеды',
    1: 'Дедушки и бабушки',
    2: 'Родители',
    3: 'Наше поколение',
    4: 'Дети',
    5: 'Внуки',
  };

  const calculateAge = (birthYear?: number | null, deathYear?: number | null) => {
    if (!birthYear) return null;
    return (deathYear || new Date().getFullYear()) - birthYear;
  };

  const getAgeText = (age: number) => {
    if (age % 10 === 1 && age !== 11) return `${age} год`;
    if (age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20)) return `${age} года`;
    return `${age} лет`;
  };

  const isImageUrl = (avatar: string) => avatar?.startsWith('http') || avatar?.startsWith('/');

  const resetForm = () => {
    setFormData({ name: '', relation: '', avatar: '👤' });
    setPhotoPreview(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const localPreview = URL.createObjectURL(file);
      setPhotoPreview(localPreview);
      const url = await uploadFile(file, 'family-tree');
      setFormData(prev => ({ ...prev, photo_url: url }));
      toast({ title: 'Фото загружено' });
    } catch (err) {
      setPhotoPreview(null);
      toast({ title: err instanceof Error ? err.message : 'Ошибка загрузки', variant: 'destructive' });
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Укажите имя', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const result = await addMember(formData);
    setSaving(false);
    if (result) {
      toast({ title: `${formData.name} добавлен(а) в древо` });
      setShowAddForm(false);
      resetForm();
    } else {
      toast({ title: 'Ошибка добавления', variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    if (!selectedMember || !formData.name.trim()) return;
    setSaving(true);
    const success = await updateMember(selectedMember.id, formData);
    setSaving(false);
    if (success) {
      toast({ title: 'Данные обновлены' });
      setShowEditForm(false);
      setSelectedMember(null);
    } else {
      toast({ title: 'Ошибка обновления', variant: 'destructive' });
    }
  };

  const handleDelete = async (member: TreeMember) => {
    if (!confirm(`Удалить ${member.name} из древа?`)) return;
    const success = await deleteMember(member.id);
    if (success) {
      toast({ title: `${member.name} удалён(а) из древа` });
      setSelectedMember(null);
    }
  };

  const openEditForm = (member: TreeMember) => {
    setFormData({
      name: member.name,
      relation: member.relation || '',
      birth_year: member.birth_year || undefined,
      death_year: member.death_year || undefined,
      occupation: member.occupation || undefined,
      bio: member.bio || undefined,
      avatar: member.avatar || '👤',
      photo_url: member.photo_url || undefined,
      parent_id: member.parent_id || undefined,
      parent2_id: member.parent2_id || undefined,
      spouse_id: member.spouse_id || undefined,
      gender: member.gender || undefined,
    });
    setPhotoPreview(member.photo_url || null);
    setShowEditForm(true);
  };

  const handleGalleryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, memberId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGalleryPhoto(true);
    try {
      const url = await uploadFile(file, 'family-tree');
      await addPhoto(memberId, url);
      toast({ title: 'Фото добавлено в галерею' });
    } catch {
      toast({ title: 'Ошибка загрузки фото', variant: 'destructive' });
    } finally {
      setUploadingGalleryPhoto(false);
    }
  };

  const handleDeletePhoto = async (memberId: number, photoId: number) => {
    const success = await deletePhoto(memberId, photoId);
    if (success) {
      toast({ title: 'Фото удалено' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="TreePine" size={48} className="text-amber-400 mx-auto mb-3 animate-pulse" />
          <p className="text-amber-700">Загрузка древа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 pb-24">
      <div className="p-4">
        <SectionHero
          title="Семейное древо"
          subtitle={`${members.length} чел. · История вашего рода`}
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/31fb406a-b2d5-4056-9fea-d86fc4d06f58.jpg"
          backPath="/family"
        />
      </div>

      <div className="px-4 space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm text-amber-700 font-medium">{members.length > 0 ? `В древе ${members.length} чел.` : 'Начните строить историю рода'}</p>
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700"
            onClick={() => { resetForm(); setShowAddForm(true); }}
          >
            <Icon name="Plus" className="mr-1" size={16} />
            Добавить
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-4">
            <CardContent className="py-3 text-center text-red-700 text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {members.length > 0 ? (
          <div className="space-y-2">
            {sortedGenerations.map(([genIndex, genMembers], sortIdx) => {
              const { units, singles } = buildFamilyUnits(genMembers, members);
              const childrenShownInUnits = new Set<number>();
              units.forEach(u => u.children.forEach(c => childrenShownInUnits.add(c.id)));

              return (
                <div key={genIndex}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-amber-200" />
                    <span className="text-xs font-medium text-amber-600 uppercase tracking-wider px-2">
                      {genLabels[genIndex] || `Поколение ${genIndex + 1}`}
                    </span>
                    <div className="h-px flex-1 bg-amber-200" />
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    {units.map((unit, idx) => (
                      <FamilyUnitBlock key={idx} unit={unit} onSelect={setSelectedMember} />
                    ))}
                    {singles.filter(s => !childrenShownInUnits.has(s.id)).map(member => (
                      <MemberCard key={member.id} member={member} onClick={() => setSelectedMember(member)} />
                    ))}
                  </div>

                  {sortIdx < sortedGenerations.length - 1 && (
                    <div className="flex justify-center mt-3">
                      <div className="w-0.5 h-6 bg-amber-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed border-amber-300 bg-amber-50/50">
            <CardContent className="py-12 text-center">
              <Icon name="TreePine" size={48} className="text-amber-300 mx-auto mb-3" />
              <p className="text-amber-700 font-medium mb-1">Древо пока пустое</p>
              <p className="text-amber-500 text-sm mb-4">Добавьте первого члена семьи, чтобы начать строить историю рода</p>
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => { resetForm(); setShowAddForm(true); }}
              >
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить первого
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedMember && !showEditForm && (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedMember.photo_url && isImageUrl(selectedMember.photo_url) ? (
                    <img src={selectedMember.photo_url} alt={selectedMember.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-300" />
                  ) : (
                    <span className="text-3xl">{selectedMember.avatar || '👤'}</span>
                  )}
                  <div>
                    <p className="text-lg">{selectedMember.name}</p>
                    {selectedMember.relation && <p className="text-sm text-muted-foreground font-normal">{selectedMember.relation}</p>}
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                {selectedMember.birth_year && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Calendar" size={16} className="text-amber-600" />
                    <span>
                      {selectedMember.death_year
                        ? `${selectedMember.birth_year} — ${selectedMember.death_year}`
                        : `Год рождения: ${selectedMember.birth_year}`}
                    </span>
                  </div>
                )}

                {calculateAge(selectedMember.birth_year, selectedMember.death_year) !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Clock" size={16} className="text-amber-600" />
                    <span>Возраст: {getAgeText(calculateAge(selectedMember.birth_year, selectedMember.death_year)!)}</span>
                  </div>
                )}

                {selectedMember.occupation && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Briefcase" size={16} className="text-amber-600" />
                    <span>{selectedMember.occupation}</span>
                  </div>
                )}

                {(selectedMember.parent_id || selectedMember.parent2_id) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Users" size={16} className="text-amber-600" />
                    <span>
                      Родители: {[
                        selectedMember.parent_id && members.find(m => m.id === selectedMember.parent_id)?.name,
                        selectedMember.parent2_id && members.find(m => m.id === selectedMember.parent2_id)?.name,
                      ].filter(Boolean).join(' и ') || 'Не указаны'}
                    </span>
                  </div>
                )}

                {selectedMember.spouse_id && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Heart" size={16} className="text-pink-500" />
                    <span>Супруг(а): {members.find(m => m.id === selectedMember.spouse_id)?.name}</span>
                  </div>
                )}

                {selectedMember.bio && (
                  <div className="text-sm text-muted-foreground border-t pt-3 mt-3">
                    {selectedMember.bio}
                  </div>
                )}

                {selectedMember.photos && selectedMember.photos.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Icon name="Images" size={14} className="text-amber-600" />
                      Фотографии ({selectedMember.photos.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedMember.photos.map(photo => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.photo_url}
                            alt={photo.caption || ''}
                            className="w-full aspect-square object-cover rounded-lg border border-amber-200"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 text-white rounded-full items-center justify-center text-xs hidden group-hover:flex"
                            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(selectedMember.id, photo.id); }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(() => {
                  const children = members.filter(m => m.parent_id === selectedMember.id || m.parent2_id === selectedMember.id);
                  if (children.length === 0) return null;
                  return (
                    <div className="flex items-start gap-2 text-sm">
                      <Icon name="Users" size={16} className="text-blue-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Дети:</span>
                        <ul className="ml-2 mt-1 space-y-0.5">
                          {children.map(child => <li key={child.id}>&#8226; {child.name}</li>)}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditForm(selectedMember)}>
                  <Icon name="Pencil" className="mr-1" size={14} />
                  Редактировать
                </Button>
                <label className="cursor-pointer flex-1">
                  <div className="flex items-center justify-center gap-1 px-3 py-2 rounded-md border text-sm hover:bg-amber-50 transition-colors">
                    <Icon name={uploadingGalleryPhoto ? 'Loader2' : 'ImagePlus'} size={14} className={uploadingGalleryPhoto ? 'animate-spin' : ''} />
                    {uploadingGalleryPhoto ? '...' : 'Фото'}
                  </div>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleGalleryPhotoUpload(e, selectedMember.id)} disabled={uploadingGalleryPhoto} />
                </label>
                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(selectedMember)}>
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={showAddForm || showEditForm} onOpenChange={() => { setShowAddForm(false); setShowEditForm(false); }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{showEditForm ? 'Редактировать' : 'Добавить в древо'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Имя *</Label>
                <Input
                  placeholder="Иван Петрович Иванов"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label>Кем приходится</Label>
                <Select value={formData.relation || ''} onValueChange={v => setFormData(prev => ({ ...prev, relation: v }))}>
                  <SelectTrigger><SelectValue placeholder="Выберите родство" /></SelectTrigger>
                  <SelectContent>
                    {RELATION_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Год рождения</Label>
                  <Input
                    type="number"
                    placeholder="1950"
                    value={formData.birth_year || ''}
                    onChange={e => setFormData(prev => ({ ...prev, birth_year: e.target.value ? parseInt(e.target.value) : undefined }))}
                  />
                </div>
                <div>
                  <Label>Год смерти</Label>
                  <Input
                    type="number"
                    placeholder="Если нет в живых"
                    value={formData.death_year || ''}
                    onChange={e => setFormData(prev => ({ ...prev, death_year: e.target.value ? parseInt(e.target.value) : undefined }))}
                  />
                </div>
              </div>

              <div>
                <Label>Род занятий</Label>
                <Input
                  placeholder="Учитель, инженер..."
                  value={formData.occupation || ''}
                  onChange={e => setFormData(prev => ({ ...prev, occupation: e.target.value || undefined }))}
                />
              </div>

              {members.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Отец</Label>
                      <Select
                        value={formData.parent_id?.toString() || 'none'}
                        onValueChange={v => setFormData(prev => ({ ...prev, parent_id: v === 'none' ? undefined : parseInt(v) }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Не указан" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Не указан</SelectItem>
                          {members.filter(m => !showEditForm || m.id !== selectedMember?.id).map(m => (
                            <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Мать</Label>
                      <Select
                        value={formData.parent2_id?.toString() || 'none'}
                        onValueChange={v => setFormData(prev => ({ ...prev, parent2_id: v === 'none' ? undefined : parseInt(v) }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Не указана" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Не указана</SelectItem>
                          {members.filter(m => !showEditForm || m.id !== selectedMember?.id).map(m => (
                            <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Супруг(а)</Label>
                    <Select
                      value={formData.spouse_id?.toString() || 'none'}
                      onValueChange={v => setFormData(prev => ({ ...prev, spouse_id: v === 'none' ? undefined : parseInt(v) }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Не указан(а)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Не указан(а)</SelectItem>
                        {members.filter(m => !showEditForm || m.id !== selectedMember?.id).map(m => (
                          <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div>
                <Label>Фото</Label>
                <div className="flex items-center gap-3 mt-1">
                  {(photoPreview || formData.photo_url) ? (
                    <div className="relative">
                      <img
                        src={photoPreview || formData.photo_url}
                        alt="Фото"
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-300"
                      />
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                        onClick={() => { setPhotoPreview(null); setFormData(prev => ({ ...prev, photo_url: undefined })); }}
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-dashed border-amber-300 flex items-center justify-center text-2xl">
                      {formData.avatar || '👤'}
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-sm ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Icon name={uploadingPhoto ? 'Loader2' : 'Camera'} size={16} className={uploadingPhoto ? 'animate-spin text-amber-600' : 'text-amber-600'} />
                        {uploadingPhoto ? 'Загрузка...' : 'Загрузить фото'}
                      </div>
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                    </label>
                    <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WebP до 10 МБ</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Иконка (если без фото)</Label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {AVATAR_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className={`text-2xl p-1 rounded-lg border-2 transition-all ${formData.avatar === emoji ? 'border-amber-500 bg-amber-50 scale-110' : 'border-transparent hover:border-amber-200'}`}
                      onClick={() => setFormData(prev => ({ ...prev, avatar: emoji }))}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>О человеке</Label>
                <Textarea
                  placeholder="Краткая биография, интересные факты..."
                  value={formData.bio || ''}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value || undefined }))}
                  rows={3}
                />
              </div>

              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={showEditForm ? handleEdit : handleAdd}
                disabled={saving || uploadingPhoto}
              >
                {saving ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                    Сохранение...
                  </>
                ) : showEditForm ? 'Сохранить' : 'Добавить в древо'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}