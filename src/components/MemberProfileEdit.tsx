import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

interface MemberProfileEditProps {
  member: FamilyMember;
  onSave: (updates: Partial<FamilyMember>) => Promise<void>;
}

export function MemberProfileEdit({ member, onSave }: MemberProfileEditProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: member.name || '',
    role: member.role || '',
    age: member.age || '',
    avatar: member.avatar || '👤',
    bio: (member as any).bio || '',
    phone: (member as any).phone || '',
    email: (member as any).email || '',
    hobbies: (member.responsibilities || []).join(', '),
    favorites: member.foodPreferences?.favorites.join(', ') || '',
    dislikes: member.foodPreferences?.dislikes.join(', ') || '',
    achievements: (member.achievements || []).join(', '),
    responsibilities: (member.responsibilities || []).join(', '),
  });

  const emojiOptions = [
    '👨', '👩', '👦', '👧', '👴', '👵', '👶',
    '🧑', '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰', '👨‍🦳', '👩‍🦳',
    '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍⚕️', '👩‍⚕️',
    '👨‍🍳', '👩‍🍳', '👨‍🔧', '👩‍🔧', '👨‍🎨', '👩‍🎨',
    '🧒', '🧓', '🙋‍♂️', '🙋‍♀️', '💁‍♂️', '💁‍♀️'
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates: Partial<FamilyMember> = {
        name: formData.name,
        role: formData.role,
        age: formData.age ? parseInt(formData.age) : undefined,
        avatar: formData.avatar,
        foodPreferences: {
          favorites: formData.favorites.split(',').map(s => s.trim()).filter(Boolean),
          dislikes: formData.dislikes.split(',').map(s => s.trim()).filter(Boolean),
        },
        achievements: formData.achievements.split(',').map(s => s.trim()).filter(Boolean),
        responsibilities: formData.responsibilities.split(',').map(s => s.trim()).filter(Boolean),
      };

      await onSave(updates);
      alert('✅ Профиль обновлён!');
    } catch (error) {
      alert('❌ Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="User" size={24} />
            Основная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Александр"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Роль в семье *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Отец, Мама, Сын..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Возраст</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="25"
                min="0"
                max="120"
              />
            </div>

            <div className="space-y-2">
              <Label>Аватар (выберите emoji)</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleChange('avatar', emoji)}
                    className={`text-3xl hover:scale-110 transition-transform ${
                      formData.avatar === emoji ? 'ring-2 ring-blue-500 rounded' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500">Выбранный: {formData.avatar}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Utensils" size={24} />
            Предпочтения в еде
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="favorites">
              <Icon name="Heart" className="inline mr-1 text-green-500" size={16} />
              Любимые блюда (через запятую)
            </Label>
            <Textarea
              id="favorites"
              value={formData.favorites}
              onChange={(e) => handleChange('favorites', e.target.value)}
              placeholder="Пицца, Паста, Борщ"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dislikes">
              <Icon name="X" className="inline mr-1 text-red-500" size={16} />
              Не любит (через запятую)
            </Label>
            <Textarea
              id="dislikes"
              value={formData.dislikes}
              onChange={(e) => handleChange('dislikes', e.target.value)}
              placeholder="Брокколи, Грибы"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="ListTodo" size={24} />
            Обязанности и достижения
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="responsibilities">
              <Icon name="CheckSquare" className="inline mr-1 text-blue-500" size={16} />
              Обязанности (через запятую)
            </Label>
            <Textarea
              id="responsibilities"
              value={formData.responsibilities}
              onChange={(e) => handleChange('responsibilities', e.target.value)}
              placeholder="Убрать комнату, Выгулять собаку, Мыть посуду"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">
              <Icon name="Award" className="inline mr-1 text-yellow-500" size={16} />
              Достижения (через запятую)
            </Label>
            <Textarea
              id="achievements"
              value={formData.achievements}
              onChange={(e) => handleChange('achievements', e.target.value)}
              placeholder="Победитель олимпиады, Отличник, Научился плавать"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="submit" size="lg" disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600">
          {saving ? (
            <>
              <Icon name="Loader" className="mr-2 animate-spin" size={18} />
              Сохранение...
            </>
          ) : (
            <>
              <Icon name="Save" className="mr-2" size={18} />
              Сохранить изменения
            </>
          )}
        </Button>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Icon name="Info" size={18} />
          Советы по заполнению:
        </h4>
        <ul className="text-sm space-y-1 ml-6">
          <li>• Указывайте реальный возраст для корректных рекомендаций ИИ</li>
          <li>• Обязанности помогут честно распределять задачи</li>
          <li>• Предпочтения в еде учитываются при планировании меню</li>
          <li>• Достижения мотивируют и поднимают самооценку</li>
        </ul>
      </div>
    </form>
  );
}
