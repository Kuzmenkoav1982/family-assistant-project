import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import type { FamilyMember } from '@/types/family.types';

interface AddFamilyMemberFormProps {
  onSubmit: (member: FamilyMember) => void | Promise<void>;
  editingMember?: FamilyMember;
  isChild?: boolean;
}

const memberColorPalette = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

export function AddFamilyMemberForm({ onSubmit, editingMember, isChild = false }: AddFamilyMemberFormProps) {
  const [formData, setFormData] = useState({
    name: editingMember?.name || '',
    role: editingMember?.role || '',
    age: editingMember?.age || '',
    avatar: editingMember?.avatar || '👤',
    avatarType: editingMember?.avatarType || 'icon' as const,
    photoUrl: editingMember?.photoUrl || undefined,
    accountType: editingMember?.account_type || 'child_profile' as 'full' | 'child_profile',
    favorites: editingMember?.foodPreferences?.favorites?.join(', ') || '',
    dislikes: editingMember?.foodPreferences?.dislikes?.join(', ') || '',
    responsibilities: editingMember?.responsibilities?.join(', ') || '',
    memberColor: editingMember?.member_color || memberColorPalette[0],
  });

  const [selectedAvatar, setSelectedAvatar] = useState(editingMember?.avatar || '👤');
  const [submitting, setSubmitting] = useState(false);
  const { upload, uploading } = useFileUpload();
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');

  const avatarOptions = ['👨', '👩', '👴', '👵', '👦', '👧', '🧑', '👶', '🧔', '👨‍🦱', '👩‍🦰', '🧑‍🦳', '👱', '🧓', '👤'];

  const handleCropComplete = async (croppedBase64: string) => {
    try {
      const blob = await fetch(croppedBase64).then(r => r.blob());
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      
      const url = await upload(file, 'avatars');
      setFormData({ 
        ...formData, 
        photoUrl: url, 
        avatarType: 'photo' 
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Ошибка загрузки фото. Попробуйте ещё раз.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMember: FamilyMember = {
      id: editingMember?.id || Date.now().toString(),
      name: formData.name,
      role: formData.role,
      age: formData.age ? parseInt(formData.age) : undefined,
      avatar: formData.avatarType === 'icon' ? selectedAvatar : formData.avatar,
      avatarType: formData.avatarType,
      photoUrl: formData.photoUrl,
      account_type: formData.accountType,
      workload: editingMember?.workload || 0,
      points: editingMember?.points || 0,
      level: editingMember?.level || 1,
      achievements: editingMember?.achievements || [],
      foodPreferences: {
        favorites: formData.favorites.split(',').map(s => s.trim()).filter(Boolean),
        dislikes: formData.dislikes.split(',').map(s => s.trim()).filter(Boolean),
      },
      responsibilities: formData.responsibilities.split(',').map(s => s.trim()).filter(Boolean),
      member_color: formData.memberColor,
    };

    setSubmitting(true);
    try {
      await onSubmit(newMember);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Имя *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Например: Александр"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Роль в семье *</label>
          <Input
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Например: Отец, Мать, Сын"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Возраст</label>
          <Input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="35"
            min="0"
            max="120"
          />
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200 flex gap-3">
        <Icon name="Info" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          {editingMember?.account_type === 'full' ? (
            <p>У этого участника есть свой вход в приложение.</p>
          ) : (
            <>
              <p className="font-medium">Профиль создаётся без входа в приложение</p>
              <p className="text-xs text-blue-800 mt-1">
                Чтобы человек мог входить сам, отправьте ему ссылку-приглашение и попросите при вступлении указать имя точно как в этом профиле — тогда профиль привяжется к его аккаунту.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-3">Аватар</label>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Загрузить фото</label>
            <Input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setTempImageSrc(reader.result as string);
                    setCropDialogOpen(true);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {uploading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <Icon name="Loader2" size={16} className="animate-spin" />
                Загрузка фото...
              </div>
            )}
            {formData.photoUrl && !uploading && (
              <div className="mt-2 flex items-center gap-2">
                <img src={formData.photoUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, photoUrl: undefined, avatarType: 'icon' })}
                >
                  Удалить фото
                </Button>
              </div>
            )}
          </div>

          {!formData.photoUrl && (
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Или выберите иконку</label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 sm:gap-2">
                {avatarOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`text-2xl sm:text-3xl hover:bg-gray-100 rounded p-1.5 sm:p-2 transition-all border-2 ${
                      selectedAvatar === emoji ? 'border-orange-500 bg-orange-50' : 'border-transparent'
                    }`}
                    onClick={() => {
                      setSelectedAvatar(emoji);
                      setFormData({ ...formData, avatar: emoji, avatarType: 'icon' });
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">Цвет в календаре</label>
        <p className="text-xs text-muted-foreground mb-3">
          События этого человека будут показываться этим цветом
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {memberColorPalette.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                formData.memberColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, memberColor: color })}
              aria-label={`Выбрать цвет ${color}`}
            />
          ))}
          <label
            className="relative w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden shrink-0"
            style={!memberColorPalette.includes(formData.memberColor) ? { backgroundColor: formData.memberColor, borderStyle: 'solid', borderColor: '#111827' } : undefined}
            title="Выбрать свой цвет"
          >
            {memberColorPalette.includes(formData.memberColor) && (
              <Icon name="Plus" size={14} className="text-gray-500" />
            )}
            <input
              type="color"
              value={formData.memberColor}
              onChange={(e) => setFormData({ ...formData, memberColor: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Icon name="UtensilsCrossed" size={18} />
          Пищевые предпочтения
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Любимые блюда</label>
            <Input
              value={formData.favorites}
              onChange={(e) => setFormData({ ...formData, favorites: e.target.value })}
              placeholder="Борщ, Пельмени, Блины (через запятую)"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Не любит</label>
            <Input
              value={formData.dislikes}
              onChange={(e) => setFormData({ ...formData, dislikes: e.target.value })}
              placeholder="Баклажаны, Оливки (через запятую)"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Icon name="ClipboardList" size={18} />
          Обязанности
        </h4>
        
        <Input
          value={formData.responsibilities}
          onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
          placeholder="Покупки, Готовка, Уборка (через запятую)"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button 
          type="submit" 
          disabled={submitting || uploading}
          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
        >
          {submitting ? (
            <>
              <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
              Сохранение...
            </>
          ) : (
            <>
              <Icon name="Check" className="mr-2" size={16} />
              {editingMember ? 'Сохранить изменения' : isChild ? 'Добавить ребёнка' : 'Добавить члена семьи'}
            </>
          )}
        </Button>
      </div>

      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
      />
    </form>
  );
}