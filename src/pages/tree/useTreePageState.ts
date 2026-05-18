import { useState, useEffect } from 'react';
import { useFamilyTree, type TreeMember, type NewTreeMember } from '@/hooks/useFamilyTree';
import { useClanTree } from '@/hooks/useClanTree';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

export function useTreePageState() {
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
  const [formData, setFormData] = useState<NewTreeMember>({ name: '', relation: '', avatar: '👤' });
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [deathDay, setDeathDay] = useState('');
  const [deathMonth, setDeathMonth] = useState('');

  useEffect(() => {
    if (selectedMember) {
      const updated = members.find(m => m.id === selectedMember.id);
      if (updated && updated !== selectedMember) setSelectedMember(updated);
    }
  }, [members, selectedMember]);

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
    if (!formData.name.trim()) { toast({ title: 'Укажите имя', variant: 'destructive' }); return; }
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
    if (result) { toast({ title: `${formData.name} добавлен(а) в древо` }); setShowAddForm(false); resetForm(); }
    else toast({ title: 'Ошибка добавления', variant: 'destructive' });
  };

  const handleEdit = async () => {
    if (!selectedMember || !formData.name.trim()) return;
    setSaving(true);
    const dataToSend = { ...formData };
    if (birthDay && birthMonth && dataToSend.birth_year) {
      dataToSend.birth_date = `${dataToSend.birth_year}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    } else { dataToSend.birth_date = undefined; }
    if (deathDay && deathMonth && dataToSend.death_year) {
      dataToSend.death_date = `${dataToSend.death_year}-${deathMonth.padStart(2, '0')}-${deathDay.padStart(2, '0')}`;
    } else { dataToSend.death_date = undefined; }
    const success = await updateMember(selectedMember.id, dataToSend);
    setSaving(false);
    if (success) { toast({ title: 'Данные обновлены' }); setShowEditForm(false); setSelectedMember(null); }
    else toast({ title: 'Ошибка обновления', variant: 'destructive' });
  };

  const handleDelete = async (member: TreeMember) => {
    if (!confirm(`Удалить ${member.name} из древа?`)) return;
    const success = await deleteMember(member.id);
    if (success) { toast({ title: `${member.name} удалён(а) из древа` }); setSelectedMember(null); }
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
    } else { setBirthDay(''); setBirthMonth(''); }
    if (member.death_date) {
      const parts = member.death_date.split('-');
      setDeathMonth(parts[1] || '');
      setDeathDay(parts[2] ? String(parseInt(parts[2])) : '');
    } else { setDeathDay(''); setDeathMonth(''); }
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
    if (success) toast({ title: 'Фото удалено' });
  };

  const handleUnlinkSpouse = async (memberId: number) => {
    if (!confirm('Расторгнуть брак? Связь будет убрана у обоих.')) return;
    const success = await updateMember(memberId, { spouse_id: null });
    if (success) { toast({ title: 'Брак расторгнут' }); setSelectedMember(null); fetchTree(); }
  };

  return {
    members, loading, error, fetchTree,
    clanHook,
    selectedMember, setSelectedMember,
    addFromMemberId, setAddFromMemberId,
    showAddForm, setShowAddForm,
    showEditForm, setShowEditForm,
    showClanPanel, setShowClanPanel,
    clanName, setClanName,
    inviteEmail, setInviteEmail,
    saving, setSaving,
    uploadingGalleryPhoto,
    uploadingPhoto,
    photoPreview, setPhotoPreview,
    formData, setFormData,
    birthDay, setBirthDay,
    birthMonth, setBirthMonth,
    deathDay, setDeathDay,
    deathMonth, setDeathMonth,
    resetForm, handlePhotoUpload,
    handleAdd, handleEdit, handleDelete,
    openEditForm, handleGalleryPhotoUpload, handleDeletePhoto, handleUnlinkSpouse,
    toast,
  };
}