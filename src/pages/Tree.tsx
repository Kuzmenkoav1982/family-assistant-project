import { useState } from 'react';
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
  'Брат': 3, 'Сестра': 3, 'Супруг': 3, 'Супруга': 3,
  'Сын': 3, 'Дочь': 3, 'Племянник': 3, 'Племянница': 3,
  'Внук': 4, 'Внучка': 4,
};

function getGeneration(member: TreeMember, allMembers: TreeMember[]): number {
  if (member.relation && GENERATION_MAP[member.relation] !== undefined) {
    return GENERATION_MAP[member.relation];
  }
  if (member.parent_id) {
    const parent = allMembers.find(m => m.id === member.parent_id);
    if (parent) return getGeneration(parent, allMembers) + 1;
  }
  return 2;
}

export default function Tree() {
  const { toast } = useToast();
  const { members, loading, error, addMember, updateMember, deleteMember } = useFamilyTree();
  const { upload: uploadFile, uploading: uploadingPhoto } = useFileUpload();
  const [selectedMember, setSelectedMember] = useState<TreeMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewTreeMember>({
    name: '',
    relation: '',
    avatar: '👤'
  });

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
    4: 'Дети и внуки',
  };

  const calculateAge = (birthYear?: number | null, deathYear?: number | null) => {
    if (!birthYear) return null;
    const endYear = deathYear || new Date().getFullYear();
    return endYear - birthYear;
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
      spouse_id: member.spouse_id || undefined,
      gender: member.gender || undefined,
    });
    setPhotoPreview(member.photo_url || null);
    setShowEditForm(true);
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
          imageUrl="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&h=400&fit=crop&crop=center"
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
          <div className="space-y-6">
            {sortedGenerations.map(([genIndex, genMembers]) => (
              <div key={genIndex}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-amber-200" />
                  <span className="text-xs font-medium text-amber-600 uppercase tracking-wider px-2">
                    {genLabels[genIndex] || `Поколение ${genIndex + 1}`}
                  </span>
                  <div className="h-px flex-1 bg-amber-200" />
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {genMembers.map(member => {
                    const age = calculateAge(member.birth_year, member.death_year);
                    const spouse = member.spouse_id ? members.find(m => m.id === member.spouse_id) : null;

                    return (
                      <Card
                        key={member.id}
                        className="w-[140px] cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 relative overflow-hidden"
                        onClick={() => setSelectedMember(member)}
                      >
                        {member.death_year && (
                          <div className="absolute top-1 right-1 z-10">
                            <Badge className="bg-gray-600 text-white text-[10px] px-1 py-0">&#10013;</Badge>
                          </div>
                        )}
                        <CardContent className="p-3 text-center">
                          {member.photo_url && isImageUrl(member.photo_url) ? (
                            <img
                              src={member.photo_url}
                              alt={member.name}
                              className="w-14 h-14 rounded-full object-cover border-2 border-amber-300 mx-auto mb-2"
                            />
                          ) : (
                            <div className="text-3xl mb-2">{member.avatar || '👤'}</div>
                          )}
                          <p className="font-semibold text-sm text-amber-900 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                            {member.name.split(' ')[0]}
                          </p>
                          {member.relation && (
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
                          {spouse && (
                            <p className="text-[10px] text-pink-500 mt-1 truncate">
                              &#10084; {spouse.name.split(' ')[0]}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {genIndex < sortedGenerations[sortedGenerations.length - 1][0] && (
                  <div className="flex justify-center mt-3">
                    <div className="w-0.5 h-6 bg-amber-300" />
                  </div>
                )}
              </div>
            ))}
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

                {(() => {
                  const children = members.filter(m => m.parent_id === selectedMember.id);
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Родитель</Label>
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
                </div>
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
                        ×
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