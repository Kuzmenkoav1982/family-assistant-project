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
import { useClanTree } from '@/hooks/useClanTree';
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

function buildFamilyUnits(genMembers: TreeMember[], allMembers: TreeMember[], genMemberIds: Set<number>): { units: FamilyUnit[], singles: TreeMember[] } {
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
      !genMemberIds.has(m.id) &&
      ((m.parent_id && parentIds.has(m.parent_id)) ||
      (m.parent2_id && parentIds.has(m.parent2_id)))
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

function CoupleBlock({ unit, onSelect }: { unit: FamilyUnit; onSelect: (m: TreeMember) => void }) {
  return (
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
  );
}

type TreeNode = { type: 'unit'; unit: FamilyUnit } | { type: 'single'; member: TreeMember };

function getNodeMemberIds(node: TreeNode): number[] {
  if (node.type === 'unit') {
    const ids = [node.unit.primary.id];
    if (node.unit.spouse) ids.push(node.unit.spouse.id);
    return ids;
  }
  return [node.member.id];
}

function getChildrenOfNode(node: TreeNode, nextGenNodes: TreeNode[]): TreeNode[] {
  const parentIds = new Set(getNodeMemberIds(node));
  return nextGenNodes.filter(child => {
    const m = child.type === 'unit' ? child.unit.primary : child.member;
    return (m.parent_id && parentIds.has(m.parent_id)) || (m.parent2_id && parentIds.has(m.parent2_id));
  });
}



export default function Tree() {
  const { toast } = useToast();
  const { members, loading, error, addMember, updateMember, deleteMember, addPhoto, deletePhoto, fetchTree } = useFamilyTree();
  const clanHook = useClanTree();
  const { upload: uploadFile, uploading: uploadingPhoto } = useFileUpload();
  const [selectedMember, setSelectedMember] = useState<TreeMember | null>(null);
  const [addFromMemberId, setAddFromMemberId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showClanPanel, setShowClanPanel] = useState(false);
  const [clanName, setClanName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
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
    setAddFromMemberId(null);
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
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700"
              onClick={() => setShowClanPanel(!showClanPanel)}
            >
              <Icon name="Users" className="mr-1" size={16} />
              Род
            </Button>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => { resetForm(); setShowAddForm(true); }}
            >
              <Icon name="Plus" className="mr-1" size={16} />
              Добавить
            </Button>
          </div>
        </div>

        {clanHook.invites.length > 0 && !showClanPanel && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Mail" size={16} className="text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Вас приглашают в род «{clanHook.invites[0].clan_name}»
                    {clanHook.invites[0].invited_by_name && ` от ${clanHook.invites[0].invited_by_name}`}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-7 text-xs" onClick={async () => {
                    const ok = await clanHook.acceptInvite(clanHook.invites[0].id);
                    if (ok) { toast({ title: 'Вы присоединились к роду!' }); fetchTree(); }
                  }}>Принять</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={async () => {
                    await clanHook.declineInvite(clanHook.invites[0].id);
                    toast({ title: 'Приглашение отклонено' });
                  }}>Нет</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showClanPanel && (
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                  <Icon name="Crown" size={18} className="text-amber-600" />
                  {clanHook.clan ? clanHook.clan.name : 'Общий род'}
                </h3>
                <button onClick={() => setShowClanPanel(false)} className="text-amber-400 hover:text-amber-600">
                  <Icon name="X" size={18} />
                </button>
              </div>

              {!clanHook.clan ? (
                <div className="space-y-3">
                  <p className="text-sm text-amber-700">Создайте общий род, чтобы родственники из других семей видели и дополняли одно древо.</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Название рода (напр. Кузьменко)"
                      value={clanName}
                      onChange={e => setClanName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      className="bg-amber-600 hover:bg-amber-700"
                      disabled={!clanName.trim() || saving}
                      onClick={async () => {
                        setSaving(true);
                        const result = await clanHook.createClan(clanName.trim());
                        setSaving(false);
                        if (result.success) {
                          toast({ title: `Род «${clanName}» создан!` });
                          setClanName('');
                          fetchTree();
                        } else {
                          toast({ title: result.error || 'Ошибка создания', variant: 'destructive' });
                        }
                      }}
                    >
                      {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : 'Создать'}
                    </Button>
                  </div>

                  {clanHook.invites.length > 0 && (
                    <div className="space-y-2 border-t border-amber-200 pt-3">
                      <p className="text-sm font-medium text-amber-800">Приглашения:</p>
                      {clanHook.invites.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between bg-white rounded-lg p-2 border border-amber-100">
                          <div>
                            <p className="text-sm font-medium">{inv.clan_name}</p>
                            {inv.invited_by_name && <p className="text-xs text-muted-foreground">от {inv.invited_by_name}</p>}
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-7 text-xs" onClick={async () => {
                              const ok = await clanHook.acceptInvite(inv.id);
                              if (ok) { toast({ title: 'Вы в роду!' }); fetchTree(); }
                            }}>Принять</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={async () => {
                              await clanHook.declineInvite(inv.id);
                            }}>Отклонить</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300">{clanHook.clan.role === 'owner' ? 'Создатель' : 'Участник'}</Badge>
                    <span className="text-sm text-amber-700">
                      {clanHook.families.filter(f => f.status === 'active').length} {
                        (() => {
                          const n = clanHook.families.filter(f => f.status === 'active').length;
                          if (n === 1) return 'семья';
                          if (n >= 2 && n <= 4) return 'семьи';
                          return 'семей';
                        })()
                      } в роду
                    </span>
                  </div>

                  <div className="space-y-1">
                    {clanHook.families.filter(f => f.status === 'active').map(f => (
                      <div key={f.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-amber-100">
                        <Icon name="Home" size={14} className="text-amber-500" />
                        <span className="text-sm">{f.user_name || f.user_email || 'Семья'}</span>
                        {f.role === 'owner' && <Badge className="bg-amber-500 text-white text-[10px] px-1 py-0 ml-auto">Создатель</Badge>}
                      </div>
                    ))}
                    {clanHook.families.filter(f => f.status === 'pending').map(f => (
                      <div key={f.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 opacity-60">
                        <Icon name="Clock" size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{f.user_name || f.user_email || 'Семья'}</span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0 ml-auto">Ожидает</Badge>
                      </div>
                    ))}
                  </div>

                  {clanHook.clan.role === 'owner' && (
                    <div className="border-t border-amber-200 pt-3">
                      <p className="text-sm font-medium text-amber-800 mb-2">Пригласить родственника</p>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="Email родственника"
                          value={inviteEmail}
                          onChange={e => setInviteEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          className="bg-amber-600 hover:bg-amber-700"
                          disabled={!inviteEmail.trim() || saving}
                          onClick={async () => {
                            setSaving(true);
                            const result = await clanHook.inviteByEmail(inviteEmail.trim().toLowerCase());
                            setSaving(false);
                            if (result.success) {
                              toast({ title: 'Приглашение отправлено!' });
                              setInviteEmail('');
                            } else {
                              toast({ title: result.error || 'Ошибка', variant: 'destructive' });
                            }
                          }}
                        >
                          <Icon name="Send" size={16} />
                        </Button>
                      </div>
                      <p className="text-[10px] text-amber-600 mt-1">Родственник должен быть зарегистрирован в приложении</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 mb-4">
            <CardContent className="py-3 text-center text-red-700 text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {members.length > 0 ? (
          <div className="space-y-0">
            {(() => {
              const allGenMemberIds = new Set<number>();
              sortedGenerations.forEach(([, gm]) => gm.forEach(m => allGenMemberIds.add(m.id)));

              const genNodesMap = new Map<number, TreeNode[]>();
              sortedGenerations.forEach(([genIndex, genMembers]) => {
                const { units, singles } = buildFamilyUnits(genMembers, members, allGenMemberIds);
                genNodesMap.set(genIndex, [
                  ...units.map(u => ({ type: 'unit' as const, unit: u })),
                  ...singles.map(m => ({ type: 'single' as const, member: m })),
                ]);
              });

              return sortedGenerations.map(([genIndex], sortIdx) => {
                const nodes = genNodesMap.get(genIndex) || [];
                if (nodes.length === 0) return null;

                const prevGenIndex = sortIdx > 0 ? sortedGenerations[sortIdx - 1][0] : null;
                const prevGenNodes = prevGenIndex !== null ? (genNodesMap.get(prevGenIndex) || []) : [];

                const groupedByParent: { parentNode: TreeNode | null; children: TreeNode[] }[] = [];
                const claimed = new Set<number>();

                for (const parentNode of prevGenNodes) {
                  const kids = getChildrenOfNode(parentNode, nodes);
                  if (kids.length > 0) {
                    groupedByParent.push({ parentNode, children: kids });
                    kids.forEach(k => {
                      const id = k.type === 'unit' ? k.unit.primary.id : k.member.id;
                      claimed.add(id);
                      if (k.type === 'unit' && k.unit.spouse) claimed.add(k.unit.spouse.id);
                    });
                  }
                }

                for (const group of groupedByParent) {
                  const SIBLING_RELATIONS = new Set(['Брат', 'Сестра']);
                  const meIdx = group.children.findIndex(c => {
                    const m = c.type === 'unit' ? c.unit.primary : c.member;
                    return m.relation === 'Я';
                  });
                  if (meIdx >= 0) {
                    const siblings: TreeNode[] = [];
                    const others: TreeNode[] = [];
                    group.children.forEach((c, i) => {
                      if (i === meIdx) return;
                      const m = c.type === 'unit' ? c.unit.primary : c.member;
                      if (SIBLING_RELATIONS.has(m.relation || '')) {
                        siblings.push(c);
                      } else {
                        others.push(c);
                      }
                    });
                    group.children = [...siblings, group.children[meIdx], ...others];
                  }
                }

                const orphans = nodes.filter(n => {
                  const id = n.type === 'unit' ? n.unit.primary.id : n.member.id;
                  return !claimed.has(id);
                });

                const SIBLING_RELATIONS = new Set(['Брат', 'Сестра']);
                const siblingOrphans: TreeNode[] = [];
                const trueOrphans: TreeNode[] = [];
                orphans.forEach(n => {
                  const m = n.type === 'unit' ? n.unit.primary : n.member;
                  if (SIBLING_RELATIONS.has(m.relation || '')) {
                    siblingOrphans.push(n);
                  } else {
                    trueOrphans.push(n);
                  }
                });

                if (siblingOrphans.length > 0) {
                  let inserted = false;
                  for (const group of groupedByParent) {
                    const meIdx = group.children.findIndex(c => {
                      const m = c.type === 'unit' ? c.unit.primary : c.member;
                      return m.relation === 'Я';
                    });
                    if (meIdx >= 0) {
                      group.children.splice(meIdx, 0, ...siblingOrphans);
                      inserted = true;
                      break;
                    }
                  }
                  if (!inserted) {
                    const meInOrphans = trueOrphans.findIndex(n => {
                      const m = n.type === 'unit' ? n.unit.primary : n.member;
                      return m.relation === 'Я';
                    });
                    if (meInOrphans >= 0) {
                      const meNode = trueOrphans.splice(meInOrphans, 1)[0];
                      groupedByParent.push({ parentNode: prevGenNodes[0] || null, children: [...siblingOrphans, meNode] });
                    } else {
                      groupedByParent.push({ parentNode: prevGenNodes[0] || null, children: siblingOrphans });
                    }
                  }
                }

                if (trueOrphans.length > 0) {
                  groupedByParent.push({ parentNode: null, children: trueOrphans });
                }

                return (
                  <div key={genIndex} className="mb-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-amber-200" />
                      <span className="text-xs font-medium text-amber-600 uppercase tracking-wider px-2">
                        {genLabels[genIndex] || `Поколение ${genIndex + 1}`}
                      </span>
                      <div className="h-px flex-1 bg-amber-200" />
                    </div>

                    <div className="overflow-x-auto pb-2">
                      <div className="flex flex-nowrap justify-start items-end gap-6 min-w-max px-2">
                        {groupedByParent.map((group, gIdx) => (
                          <div key={gIdx} className="flex flex-col items-center">
                            {group.parentNode && group.children.length > 0 ? (
                              <div className="flex flex-col items-center mb-0">
                                <div className="w-0.5 h-4 bg-amber-300" />
                                {group.children.length > 1 && (
                                  <div className="flex justify-center">
                                    <div className="h-0.5 bg-amber-300" style={{ width: `${Math.max(group.children.length * 144, 160)}px` }} />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-[28px]" />
                            )}
                            <div className="flex flex-nowrap items-start">
                              {group.children.map((child, cIdx) => (
                                <div key={cIdx} className="flex items-start">
                                  {cIdx > 0 && group.children.length > 1 && (
                                    <div className="flex flex-col items-center justify-center self-stretch pt-6">
                                      <div className="w-4 h-0.5 bg-amber-300" />
                                    </div>
                                  )}
                                  <div className="flex flex-col items-center">
                                    {group.parentNode && group.children.length > 1 && (
                                      <div className="w-0.5 h-3 bg-amber-300" />
                                    )}
                                    {child.type === 'unit' ? (
                                      <CoupleBlock unit={child.unit} onSelect={setSelectedMember} />
                                    ) : (
                                      <MemberCard member={child.member} onClick={() => setSelectedMember(child.member)} />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
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

              <div className="flex gap-2 mt-4 flex-wrap">
                <Button
                  size="sm"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 min-w-[140px]"
                  onClick={() => {
                    const fromMember = selectedMember;
                    setSelectedMember(null);
                    setAddFromMemberId(fromMember.id);
                    resetForm();
                    setShowAddForm(true);
                  }}
                >
                  <Icon name="UserPlus" className="mr-1" size={14} />
                  Добавить родственника
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
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

        <Dialog open={showAddForm || showEditForm} onOpenChange={() => { setShowAddForm(false); setShowEditForm(false); resetForm(); }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{showEditForm ? 'Редактировать' : 'Добавить в древо'}</DialogTitle>
            </DialogHeader>

            {!showEditForm && addFromMemberId && (() => {
              const fromMember = members.find(m => m.id === addFromMemberId);
              return fromMember ? (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
                  <Icon name="Link" size={14} className="text-amber-600 shrink-0" />
                  <span>Добавляется как родственник: <strong>{fromMember.name}</strong></span>
                </div>
              ) : null;
            })()}

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