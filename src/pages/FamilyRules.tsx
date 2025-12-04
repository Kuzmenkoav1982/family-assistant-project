import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface FamilyRule {
  id: string;
  title: string;
  description: string;
  author: string;
  createdDate: string;
  status: 'approved' | 'voting' | 'rejected';
  votes?: {
    for: string[];
    against: string[];
    required: number;
  };
  category: string;
}

const mockRules: FamilyRule[] = [];

const familyMembers = [
  { id: '1', name: 'Пользователь', role: 'Владелец', canApproveAlone: true }
];

export default function FamilyRules() {
  const navigate = useNavigate();
  const [rules, setRules] = useState<FamilyRule[]>(() => {
    const saved = localStorage.getItem('familyRules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockRules;
      }
    }
    return mockRules;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('Общие');
  const [currentUser] = useState('Пользователь');
  const [isInstructionOpen, setIsInstructionOpen] = useState(true);

  const currentUserData = familyMembers.find(m => m.name === currentUser);

  const handleCreateRule = () => {
    if (!newRuleTitle || !newRuleDescription) return;

    const newRule: FamilyRule = {
      id: String(rules.length + 1),
      title: newRuleTitle,
      description: newRuleDescription,
      author: currentUser,
      createdDate: 'только что',
      status: currentUserData?.canApproveAlone ? 'approved' : 'voting',
      votes: currentUserData?.canApproveAlone ? undefined : {
        for: [currentUser],
        against: [],
        required: familyMembers.length - 1
      },
      category: newRuleCategory
    };

    const updatedRules = [newRule, ...rules];
    setRules(updatedRules);
    localStorage.setItem('familyRules', JSON.stringify(updatedRules));
    setNewRuleTitle('');
    setNewRuleDescription('');
    setNewRuleCategory('Общие');
    setIsDialogOpen(false);
  };

  const handleVote = (ruleId: string, vote: 'for' | 'against') => {
    const updatedRules = rules.map(rule => {
      if (rule.id !== ruleId || !rule.votes) return rule;
      
      const alreadyVoted = rule.votes.for.includes(currentUser) || rule.votes.against.includes(currentUser);
      if (alreadyVoted) return rule;

      const updatedVotes = {
        ...rule.votes,
        [vote]: [...rule.votes[vote], currentUser]
      };

      const totalVotes = updatedVotes.for.length + updatedVotes.against.length;
      const approvedVotes = updatedVotes.for.length;

      return {
        ...rule,
        votes: updatedVotes,
        status: totalVotes >= updatedVotes.required 
          ? (approvedVotes >= updatedVotes.required ? 'approved' : 'rejected')
          : 'voting'
      };
    });
    setRules(updatedRules);
    localStorage.setItem('familyRules', JSON.stringify(updatedRules));
  };

  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm('Удалить это правило?')) {
      const updatedRules = rules.filter(r => r.id !== ruleId);
      setRules(updatedRules);
      localStorage.setItem('familyRules', JSON.stringify(updatedRules));
    }
  };

  const approvedRules = rules.filter(r => r.status === 'approved');
  const votingRules = rules.filter(r => r.status === 'voting');
  const rejectedRules = rules.filter(r => r.status === 'rejected');

  const categories = ['Общие', 'Традиции', 'Технологии', 'Финансы', 'Распорядок', 'Учёба', 'Домашние дела'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Семейные правила
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Правила, которые помогают нашей семье жить в гармонии и взаимопонимании
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <Icon name="Home" className="mr-2" size={16} />
            На главную
          </Button>
        </header>

        {/* Инструкция */}
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
          <Alert className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                  <h3 className="font-semibold text-yellow-900 text-lg">
                    Как работают семейные правила
                  </h3>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-5 w-5 text-yellow-600 transition-transform group-hover:scale-110" 
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-yellow-800">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">⚖️ Для чего нужны семейные правила?</p>
                        <p className="text-sm">
                          Семейные правила — это договорённости, которые помогают всем членам семьи жить в гармонии, 
                          избегать конфликтов и понимать, что можно, а что нельзя. Правила создают структуру и 
                          предсказуемость в семейной жизни.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">✨ Основные возможности</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>Создание правил:</strong> Любой член семьи может предложить новое правило</li>
                          <li><strong>Категории:</strong> Общие, Традиции, Технологии, Финансы, Распорядок, Учёба, Домашние дела</li>
                          <li><strong>Голосование:</strong> Правила обычных членов семьи требуют одобрения</li>
                          <li><strong>Статусы:</strong> Утверждено, На голосовании, Отклонено</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🎯 Как использовать</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>Владелец и Администратор</strong> могут утверждать правила единолично — они вступают в силу сразу</li>
                          <li><strong>Обычные участники</strong> предлагают правило на голосование — нужно одобрение всех остальных</li>
                          <li>Голосуйте "За" или "Против" предложенных правил</li>
                          <li>Правила можно удалять (с подтверждением)</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">💡 Советы</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Формулируйте правила чётко и однозначно</li>
                          <li>Используйте категории для лучшей организации</li>
                          <li>Обсуждайте правила всей семьёй перед голосованием</li>
                          <li>Периодически пересматривайте правила — удаляйте неактуальные</li>
                          <li>Правила должны быть справедливыми и выполнимыми для всех</li>
                        </ul>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        <Card className="border-2 border-indigo-200 bg-indigo-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Icon name="Scale" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Как работают семейные правила?</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Владелец и Администратор</strong> могут добавлять правила единолично - они вступают в силу сразу.</p>
                  <p><strong>Любой член семьи</strong> может предложить новое правило на голосование. Правило принимается, если ЗА проголосуют все остальные участники.</p>
                  <p><strong>Правила обязательны</strong> для всех членов семьи и помогают избежать конфликтов.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {approvedRules.length} утверждено
            </Badge>
            {votingRules.length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {votingRules.length} на голосовании
              </Badge>
            )}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                <Icon name="Plus" className="mr-2" size={18} />
                Предложить правило
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Новое семейное правило</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {currentUserData?.canApproveAlone && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                    <Icon name="Crown" size={16} className="inline mr-2 text-green-600" />
                    Как {currentUserData.role}, вы можете утвердить правило единолично
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Категория</label>
                  <select 
                    value={newRuleCategory}
                    onChange={(e) => setNewRuleCategory(e.target.value)}
                    className="w-full border rounded-md p-2"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Название правила</label>
                  <Input
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    placeholder="Например: Убирать за собой посуду"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Описание правила</label>
                  <Textarea
                    value={newRuleDescription}
                    onChange={(e) => setNewRuleDescription(e.target.value)}
                    placeholder="Опишите правило подробно: что, когда, как..."
                    className="min-h-[100px]"
                  />
                </div>
                <Button
                  onClick={handleCreateRule}
                  disabled={!newRuleTitle || !newRuleDescription}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
                >
                  {currentUserData?.canApproveAlone ? 'Утвердить правило' : 'Предложить на голосование'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {votingRules.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="Vote" size={22} className="text-amber-600" />
              На голосовании
            </h2>
            <div className="space-y-4">
              {votingRules.map((rule) => (
                <Card key={rule.id} className="border-2 border-amber-200 bg-amber-50/30">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{rule.category}</Badge>
                          <Badge className="bg-amber-500">Голосование</Badge>
                        </div>
                        <CardTitle className="text-lg mb-1">{rule.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Предложил: {rule.author} • {rule.createdDate}
                        </p>
                      </div>
                      {(rule.author === currentUser || currentUserData?.canApproveAlone) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {rule.votes && (
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Голосов ЗА: {rule.votes.for.length}</span>
                          <span>Нужно: {rule.votes.required}</span>
                        </div>
                        <Progress value={(rule.votes.for.length / rule.votes.required) * 100} className="h-2" />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-medium mb-1">За ({rule.votes.for.length}):</p>
                          <div className="flex flex-wrap gap-1">
                            {rule.votes.for.map(name => (
                              <Badge key={name} variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {rule.votes.against.length > 0 && (
                          <div className="flex-1">
                            <p className="text-xs font-medium mb-1">Против ({rule.votes.against.length}):</p>
                            <div className="flex flex-wrap gap-1">
                              {rule.votes.against.map(name => (
                                <Badge key={name} variant="secondary" className="bg-red-100 text-red-700 text-xs">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {!rule.votes.for.includes(currentUser) && !rule.votes.against.includes(currentUser) && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleVote(rule.id, 'for')}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                            size="sm"
                          >
                            <Icon name="ThumbsUp" className="mr-2" size={16} />
                            За
                          </Button>
                          <Button
                            onClick={() => handleVote(rule.id, 'against')}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            <Icon name="ThumbsDown" className="mr-2" size={16} />
                            Против
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="ShieldCheck" size={22} className="text-green-600" />
            Действующие правила
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {approvedRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{rule.category}</Badge>
                        <Badge className="bg-green-500">Действует</Badge>
                      </div>
                      <CardTitle className="text-lg mb-1">{rule.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Утвердил: {rule.author} • {rule.createdDate}
                      </p>
                    </div>
                    {currentUserData?.canApproveAlone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}