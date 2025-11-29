import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface VotingCreateDialogProps {
  showCreateDialog: boolean;
  setShowCreateDialog: (show: boolean) => void;
  onCreateVoting: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export function VotingCreateDialog({ 
  showCreateDialog, 
  setShowCreateDialog, 
  onCreateVoting 
}: VotingCreateDialogProps) {
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    voting_type: 'general' as 'meal' | 'rule' | 'general',
    end_date: '',
    options: [{ text: '', description: '' }]
  });

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', description: '' }]
    }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index: number, field: 'text' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const result = await onCreateVoting({
      ...formData,
      options: formData.options.filter(opt => opt.text.trim())
    });

    if (result.success) {
      alert('✅ Голосование создано!');
      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        voting_type: 'general',
        end_date: '',
        options: [{ text: '', description: '' }]
      });
    } else {
      alert('❌ Ошибка: ' + result.error);
    }
    
    setCreating(false);
  };

  return (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Icon name="Plus" size={16} className="mr-1" />
          Создать
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Plus" size={24} />
            Создать голосование
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название вопроса *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Например: Какое блюдо приготовить на ужин?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание (опционально)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Дополнительные детали голосования..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voting_type">Тип голосования</Label>
            <Select
              value={formData.voting_type}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, voting_type: value }))}
            >
              <SelectTrigger id="voting_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Общее</SelectItem>
                <SelectItem value="meal">Меню/Еда</SelectItem>
                <SelectItem value="rule">Правила семьи</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">Дата окончания (опционально)</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Варианты ответов *</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddOption}
              >
                <Icon name="Plus" size={14} className="mr-1" />
                Добавить вариант
              </Button>
            </div>

            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      placeholder={`Вариант ${index + 1}`}
                      required
                    />
                    <Input
                      value={option.description}
                      onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                      placeholder="Описание (опционально)"
                    />
                  </div>
                  {formData.options.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveOption(index)}
                      className="flex-shrink-0"
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="flex-1"
              disabled={creating}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              disabled={creating}
            >
              {creating ? (
                <>
                  <Icon name="Loader" className="animate-spin mr-2" size={16} />
                  Создание...
                </>
              ) : (
                <>
                  <Icon name="Check" className="mr-2" size={16} />
                  Создать голосование
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
