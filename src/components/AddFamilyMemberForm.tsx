import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

interface AddFamilyMemberFormProps {
  onSubmit: (member: FamilyMember) => void;
  editingMember?: FamilyMember;
  isChild?: boolean;
}

export function AddFamilyMemberForm({ onSubmit, editingMember, isChild = false }: AddFamilyMemberFormProps) {
  const [formData, setFormData] = useState({
    name: editingMember?.name || '',
    role: editingMember?.role || '',
    age: editingMember?.age || '',
    avatar: editingMember?.avatar || '👤',
    avatarType: editingMember?.avatarType || 'icon' as const,
    photoUrl: editingMember?.photoUrl || undefined,
    favorites: editingMember?.foodPreferences?.favorites?.join(', ') || '',
    dislikes: editingMember?.foodPreferences?.dislikes?.join(', ') || '',
    responsibilities: editingMember?.responsibilities?.join(', ') || '',
  });

  const [selectedAvatar, setSelectedAvatar] = useState(editingMember?.avatar || '👤');

  const avatarOptions = ['👨', '👩', '👴', '👵', '👦', '👧', '🧑', '👶', '🧔', '👨‍🦱', '👩‍🦰', '🧑‍🦳', '👱', '🧓', '👤'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMember: FamilyMember = {
      id: editingMember?.id || Date.now().toString(),
      name: formData.name,
      role: formData.role,
      age: formData.age ? parseInt(formData.age) : undefined,
      avatar: formData.avatarType === 'icon' ? selectedAvatar : formData.avatar,
      avatarType: formData.avatarType,
      photoUrl: formData.photoUrl,
      workload: editingMember?.workload || 0,
      points: editingMember?.points || 0,
      level: editingMember?.level || 1,
      achievements: editingMember?.achievements || [],
      foodPreferences: {
        favorites: formData.favorites.split(',').map(s => s.trim()).filter(Boolean),
        dislikes: formData.dislikes.split(',').map(s => s.trim()).filter(Boolean),
      },
      responsibilities: formData.responsibilities.split(',').map(s => s.trim()).filter(Boolean),
    };

    onSubmit(newMember);
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

      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-3">Аватар</label>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Загрузить фото</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const photoUrl = event.target?.result as string;
                    setFormData({ 
                      ...formData, 
                      photoUrl, 
                      avatarType: 'photo' 
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {formData.photoUrl && (
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
              <div className="grid grid-cols-8 gap-2">
                {avatarOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`text-3xl hover:bg-gray-100 rounded p-2 transition-all border-2 ${
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
        <Button type="submit" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
          <Icon name="Check" className="mr-2" size={16} />
          {editingMember ? 'Сохранить изменения' : 'Добавить члена семьи'}
        </Button>
      </div>
    </form>
  );
}