import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useVotings } from '@/hooks/useVotings';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { getCurrentMember } from '@/data/demoFamily';

export function VotingWidget() {
  const { votings, loading, createVoting, castVote, deleteVoting } = useVotings('active');
  const { members } = useFamilyMembers();
  const currentUser = getCurrentMember();
  
  const getCurrentUserId = () => {
    try {
      const authUserStr = localStorage.getItem('authUser');
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr);
        return authUser.member_id || authUser.id;
      }
    } catch (e) {
      console.error('[ERROR getCurrentUserId] Error parsing auth user:', e);
    }
    return null;
  };
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedVoting, setSelectedVoting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [contextMenuVoting, setContextMenuVoting] = useState<string | null>(null);
  const [longPressActive, setLongPressActive] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggered = useRef(false);
  
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

    const result = await createVoting({
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

  const handleVote = async (votingId: string, optionId: string, value: boolean) => {
    const result = await castVote(votingId, optionId, value);
    if (!result.success) {
      alert('❌ Ошибка голосования: ' + result.error);
    }
  };

  const handleDelete = async (votingId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это голосование?')) {
      return;
    }

    setDeletingId(votingId);
    const result = await deleteVoting(votingId);
    
    if (result.success) {
      alert('✅ Голосование удалено');
    } else {
      alert('❌ Ошибка удаления: ' + result.error);
    }
    
    setDeletingId(null);
  };

  const canDeleteVoting = (voting: any) => {
    if (!currentUser) return false;
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;
    
    const isOwner = currentUser.role === 'owner' || currentUser.role === 'Папа' || currentUser.role.toLowerCase().includes('владелец');
    const isAuthor = voting.created_by === currentUserId;
    
    return isOwner || isAuthor;
  };

  const handleLongPressStart = (votingId: string) => {
    longPressTriggered.current = false;
    setLongPressActive(votingId);
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setLongPressActive(null);
      setContextMenuVoting(votingId);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setLongPressActive(null);
  };

  const handleCardClick = (votingId: string) => {
    if (!longPressTriggered.current) {
      setSelectedVoting(votingId);
    }
    longPressTriggered.current = false;
  };

  const getVotingProgress = (voting: any) => {
    if (!voting.options || voting.options.length === 0) return { votedCount: 0, totalMembers: members.length, percentage: 0 };
    
    const votedUserIds = new Set<string>();
    voting.options.forEach((option: any) => {
      if (option.votes) {
        option.votes.forEach((vote: any) => {
          votedUserIds.add(vote.user_id);
        });
      }
    });
    
    const votedCount = votedUserIds.size;
    const totalMembers = members.length || 1;
    const percentage = Math.round((votedCount / totalMembers) * 100);
    
    return { votedCount, totalMembers, percentage };
  };

  const getVotingIcon = (type: string) => {
    switch (type) {
      case 'meal': return 'Utensils';
      case 'rule': return 'Scale';
      default: return 'Vote';
    }
  };

  const getVotingColor = (type: string) => {
    switch (type) {
      case 'meal': return 'from-orange-500 to-red-500';
      case 'rule': return 'from-blue-500 to-indigo-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Vote" size={20} />
            Голосования
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader" className="animate-spin" size={32} />
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedVotingData = votings.find(v => v.id === selectedVoting);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Vote" size={20} />
            Активные голосования
            {votings.length > 0 && (
              <Badge className="bg-purple-600">{votings.length}</Badge>
            )}
          </CardTitle>
          
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
                    placeholder="Дополнительная информация о голосовании"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Тип голосования</Label>
                    <Select
                      value={formData.voting_type}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, voting_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Общее</SelectItem>
                        <SelectItem value="meal">Блюдо</SelectItem>
                        <SelectItem value="rule">Правило</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">Окончание голосования *</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Варианты ответов</Label>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddOption}>
                      <Icon name="Plus" size={14} className="mr-1" />
                      Добавить вариант
                    </Button>
                  </div>

                  {formData.options.map((option, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder={`Вариант ${index + 1}`}
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                          />
                          <Input
                            placeholder="Описание (опционально)"
                            value={option.description}
                            onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                          />
                        </div>
                        {formData.options.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    disabled={creating}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    {creating ? (
                      <>
                        <Icon name="Loader" className="mr-2 animate-spin" size={16} />
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
        </div>
      </CardHeader>
      
      <CardContent>
        {votings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Vote" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="mb-2">Нет активных голосований</p>
            <p className="text-sm">Создайте первое голосование для семьи</p>
          </div>
        ) : (
          <div className="space-y-3">
            {votings.map(voting => {
              const progress = getVotingProgress(voting);
              return (
                <Card
                  key={voting.id}
                  className={`cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-300 select-none ${
                    longPressActive === voting.id ? 'long-press-hint scale-[0.98] border-purple-400' : ''
                  }`}
                  onClick={() => handleCardClick(voting.id)}
                  onTouchStart={() => handleLongPressStart(voting.id)}
                  onTouchEnd={handleLongPressEnd}
                  onTouchCancel={handleLongPressEnd}
                  onMouseDown={() => handleLongPressStart(voting.id)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getVotingColor(voting.voting_type)} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={getVotingIcon(voting.voting_type)} size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1 truncate">{voting.title}</h4>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" size={12} />
                            До {new Date(voting.end_date).toLocaleDateString('ru-RU')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {voting.options.length} вариантов
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Проголосовало: {progress.votedCount} из {progress.totalMembers}</span>
                            <span className="font-semibold text-purple-600">{progress.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <Icon name="ChevronRight" size={20} className="text-gray-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={!!contextMenuVoting} onOpenChange={(open) => !open && setContextMenuVoting(null)}>
        <DialogContent className="max-w-sm">
          {contextMenuVoting && (() => {
            const voting = votings.find(v => v.id === contextMenuVoting);
            return voting ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getVotingColor(voting.voting_type)} flex items-center justify-center`}>
                      <Icon name={getVotingIcon(voting.voting_type)} size={20} className="text-white" />
                    </div>
                    {voting.title}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-2 pt-4">
                  <Button
                    onClick={() => {
                      setContextMenuVoting(null);
                      setSelectedVoting(voting.id);
                    }}
                    className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200"
                    variant="outline"
                  >
                    <Icon name="Eye" size={18} className="mr-2" />
                    Открыть голосование
                  </Button>
                  
                  <Button
                    onClick={async () => {
                      if (!currentUser) {
                        alert('❌ Пользователь не определён');
                        return;
                      }
                      
                      const currentUserId = getCurrentUserId();
                      if (!currentUserId) {
                        alert('❌ Не удалось определить ID пользователя');
                        return;
                      }
                      
                      const isOwner = currentUser.role === 'owner' || currentUser.role === 'Папа' || currentUser.role.toLowerCase().includes('владелец');
                      const isAuthor = voting.created_by === currentUserId;
                      
                      if (!isOwner && !isAuthor) {
                        alert(`❌ У вас нет прав на удаление.\n\nВаша роль: ${currentUser.role}\nВаш ID: ${currentUserId}\nАвтор голосования: ${voting.created_by}\n\nУдалять могут только Владелец семьи и автор вопроса.`);
                        return;
                      }
                      
                      setContextMenuVoting(null);
                      await handleDelete(voting.id);
                    }}
                    disabled={deletingId === voting.id}
                    className="w-full justify-start bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                    variant="outline"
                  >
                    {deletingId === voting.id ? (
                      <>
                        <Icon name="Loader" size={18} className="mr-2 animate-spin" />
                        Удаление...
                      </>
                    ) : (
                      <>
                        <Icon name="Trash2" size={18} className="mr-2" />
                        Удалить голосование
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => setContextMenuVoting(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Отмена
                  </Button>
                </div>
              </>
            ) : null;
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedVoting} onOpenChange={(open) => !open && setSelectedVoting(null)}>
        <DialogContent className="max-w-2xl">
          {selectedVotingData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getVotingColor(selectedVotingData.voting_type)} flex items-center justify-center`}>
                    <Icon name={getVotingIcon(selectedVotingData.voting_type)} size={20} className="text-white" />
                  </div>
                  {selectedVotingData.title}
                </DialogTitle>
              </DialogHeader>
              
              {selectedVotingData.description && (
                <p className="text-sm text-gray-600 -mt-2">{selectedVotingData.description}</p>
              )}

              {(() => {
                const progress = getVotingProgress(selectedVotingData);
                return (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 -mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-900">Прогресс голосования</span>
                      <span className="text-sm font-bold text-purple-600">{progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-purple-700">
                      Проголосовало {progress.votedCount} из {progress.totalMembers} членов семьи
                    </p>
                  </div>
                );
              })()}

              <div className="space-y-3">
                {selectedVotingData.options.map(option => {
                  const totalVotes = option.yes_votes + option.no_votes;
                  const yesPercent = totalVotes > 0 ? (option.yes_votes / totalVotes) * 100 : 0;
                  
                  return (
                    <Card key={option.id} className="p-4">
                      <div className="mb-3">
                        <h5 className="font-semibold mb-1">{option.option_text}</h5>
                        {option.description && (
                          <p className="text-sm text-gray-600">{option.description}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Голосов: {totalVotes}</span>
                          <span>За: {yesPercent.toFixed(0)}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                            style={{ width: `${yesPercent}%` }}
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleVote(selectedVotingData.id, option.id, true)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Icon name="ThumbsUp" size={14} className="mr-1" />
                            За ({option.yes_votes})
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVote(selectedVotingData.id, option.id, false)}
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Icon name="ThumbsDown" size={14} className="mr-1" />
                            Против ({option.no_votes})
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-800 flex items-center gap-2">
                  <Icon name="Info" size={14} />
                  Голосование завершится {new Date(selectedVotingData.end_date).toLocaleString('ru-RU')}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}