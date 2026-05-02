import { useState, useEffect } from 'react';
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useFamilyTree, type TreeMember, type NewTreeMember } from '@/hooks/useFamilyTree';
import { useClanTree } from '@/hooks/useClanTree';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { getGeneration } from './tree/treeUtils';
import { FamilyTreeCanvas } from './tree/FamilyTreeCanvas';
import { MemberDetailDialog, MemberFormDialog } from './tree/TreeDialogs';

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
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [deathDay, setDeathDay] = useState('');
  const [deathMonth, setDeathMonth] = useState('');

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

  const resetForm = () => {
    setFormData({ name: '', relation: '', avatar: '👤' });
    setPhotoPreview(null);
    setAddFromMemberId(null);
    setBirthDay('');
    setBirthMonth('');
    setDeathDay('');
    setDeathMonth('');
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
    const dataToSend = { ...formData };
    if (birthDay && birthMonth && dataToSend.birth_year) {
      dataToSend.birth_date = `${dataToSend.birth_year}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    }
    if (deathDay && deathMonth && dataToSend.death_year) {
      dataToSend.death_date = `${dataToSend.death_year}-${deathMonth.padStart(2, '0')}-${deathDay.padStart(2, '0')}`;
    }
    const result = await addMember(dataToSend);
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
    const dataToSend = { ...formData };
    if (birthDay && birthMonth && dataToSend.birth_year) {
      dataToSend.birth_date = `${dataToSend.birth_year}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    } else {
      dataToSend.birth_date = undefined;
    }
    if (deathDay && deathMonth && dataToSend.death_year) {
      dataToSend.death_date = `${dataToSend.death_year}-${deathMonth.padStart(2, '0')}-${deathDay.padStart(2, '0')}`;
    } else {
      dataToSend.death_date = undefined;
    }
    const success = await updateMember(selectedMember.id, dataToSend);
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
      birth_date: member.birth_date || undefined,
      death_date: member.death_date || undefined,
      occupation: member.occupation || undefined,
      bio: member.bio || undefined,
      avatar: member.avatar || '👤',
      photo_url: member.photo_url || undefined,
      parent_id: member.parent_id || undefined,
      parent2_id: member.parent2_id || undefined,
      spouse_id: member.spouse_id || undefined,
      gender: member.gender || undefined,
    });
    if (member.birth_date) {
      const parts = member.birth_date.split('-');
      setBirthMonth(parts[1] || '');
      setBirthDay(parts[2] ? String(parseInt(parts[2])) : '');
    } else {
      setBirthDay('');
      setBirthMonth('');
    }
    if (member.death_date) {
      const parts = member.death_date.split('-');
      setDeathMonth(parts[1] || '');
      setDeathDay(parts[2] ? String(parseInt(parts[2])) : '');
    } else {
      setDeathDay('');
      setDeathMonth('');
    }
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
    <>
    <SEOHead title="Семейное древо — родословная вашей семьи" description="Создайте генеалогическое древо семьи: добавляйте родственников, стройте связи между поколениями, сохраняйте историю рода." path="/tree" breadcrumbs={[{ name: "Семья", path: "/family-hub" }, { name: "Семейное древо", path: "/tree" }]} />
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 pb-24">
      <div className="max-w-5xl mx-auto p-4">
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
                    <Icon name="Users" size={14} className="text-amber-600" />
                    <span className="text-sm text-amber-800">
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
          <FamilyTreeCanvas
            members={members}
            sortedGenerations={sortedGenerations}
            genLabels={genLabels}
            onSelectMember={setSelectedMember}
          />
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
          <MemberDetailDialog
            selectedMember={selectedMember}
            members={members}
            uploadingGalleryPhoto={uploadingGalleryPhoto}
            onClose={() => setSelectedMember(null)}
            onAddRelative={() => {
              const fromMember = selectedMember;
              setSelectedMember(null);
              resetForm();
              setAddFromMemberId(fromMember.id);
              setShowAddForm(true);
            }}
            onEdit={() => openEditForm(selectedMember)}
            onDelete={handleDelete}
            onGalleryPhotoUpload={handleGalleryPhotoUpload}
            onDeletePhoto={handleDeletePhoto}
            onUnlinkSpouse={async () => {
              if (!confirm('Расторгнуть брак? Связь будет убрана у обоих.')) return;
              const success = await updateMember(selectedMember.id, { spouse_id: null });
              if (success) {
                toast({ title: 'Брак расторгнут' });
                setSelectedMember(null);
                fetchTree();
              }
            }}
          />
        )}

        <MemberFormDialog
          open={showAddForm || showEditForm}
          showEditForm={showEditForm}
          members={members}
          selectedMember={selectedMember}
          addFromMemberId={addFromMemberId}
          formData={formData}
          setFormData={setFormData}
          birthDay={birthDay}
          setBirthDay={setBirthDay}
          birthMonth={birthMonth}
          setBirthMonth={setBirthMonth}
          deathDay={deathDay}
          setDeathDay={setDeathDay}
          deathMonth={deathMonth}
          setDeathMonth={setDeathMonth}
          photoPreview={photoPreview}
          setPhotoPreview={setPhotoPreview}
          uploadingPhoto={uploadingPhoto}
          saving={saving}
          onClose={() => { setShowAddForm(false); setShowEditForm(false); resetForm(); }}
          onPhotoUpload={handlePhotoUpload}
          onSubmit={showEditForm ? handleEdit : handleAdd}
        />
      </div>
    </div>
    </>
  );
}
