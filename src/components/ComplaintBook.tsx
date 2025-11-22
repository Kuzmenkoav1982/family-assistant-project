import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { Complaint, FamilyMember } from '@/types/family.types';

interface ComplaintBookProps {
  familyMembers: FamilyMember[];
  currentUserId: string;
}

export function ComplaintBook({ familyMembers, currentUserId }: ComplaintBookProps) {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('familyComplaints');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showNewComplaintDialog, setShowNewComplaintDialog] = useState(false);
  const [selectedAccusedId, setSelectedAccusedId] = useState('');
  const [situation, setSituation] = useState('');
  const [feelings, setFeelings] = useState('');
  const [consequences, setConsequences] = useState('');

  const currentMember = familyMembers.find(m => m.id === currentUserId);

  const generateAIAnalysis = (complaint: Omit<Complaint, 'id' | 'aiAnalysis' | 'resolution'>): Complaint['aiAnalysis'] => {
    const severityMap = {
      low: ['небольшой недопонимание', 'мелкая ссора', 'легкое недовольство'],
      medium: ['конфликт', 'обида', 'ссора', 'разногласие'],
      high: ['серьезный конфликт', 'глубокая обида', 'критическая ситуация']
    };

    const severity = complaint.consequences && complaint.consequences.length > 50 ? 'high' : 
                     complaint.feelings.length > 100 ? 'medium' : 'low';

    const recommendationsMap = {
      low: [
        'Попробуйте спокойно обсудить ситуацию напрямую с человеком',
        'Выразите свои чувства используя "Я-сообщения"',
        'Постарайтесь понять точку зрения другой стороны'
      ],
      medium: [
        'Дайте себе время успокоиться перед разговором',
        'Подготовьте конкретные примеры ситуаций',
        'Предложите найти компромисс',
        'Если сложно говорить напрямую, напишите письмо'
      ],
      high: [
        'Рекомендую провести семейный совет с участием всех',
        'Возможно, стоит привлечь нейтрального посредника',
        'Важно выслушать обе стороны без перебивания',
        'Сосредоточьтесь на решении, а не на обвинениях'
      ]
    };

    const peaceStepsMap = {
      low: [
        'Шаг 1: Найдите спокойное время для разговора',
        'Шаг 2: Объясните свои чувства без обвинений',
        'Шаг 3: Выслушайте ответ другой стороны',
        'Шаг 4: Договоритесь о том, как действовать дальше'
      ],
      medium: [
        'Шаг 1: Оба участника берут паузу для успокоения (1-2 часа)',
        'Шаг 2: Встретьтесь в нейтральном месте',
        'Шаг 3: Каждый по очереди описывает ситуацию своими словами',
        'Шаг 4: Определите общие интересы и потребности',
        'Шаг 5: Вместе придумайте решение, устраивающее обоих'
      ],
      high: [
        'Шаг 1: Организуйте семейное собрание в течение 24 часов',
        'Шаг 2: Пригласите нейтрального модератора (член семьи или друг)',
        'Шаг 3: Установите правила: говорить по очереди, не перебивать, не повышать голос',
        'Шаг 4: Каждая сторона высказывается 5 минут без перебивания',
        'Шаг 5: Совместно ищите решения и договоренности',
        'Шаг 6: Зафиксируйте договоренности письменно'
      ]
    };

    const messageForAccused = severity === 'low' 
      ? `Здравствуйте! ${complaint.complainantName} обратился(-лась) с просьбой помочь разобраться в недопонимании между вами. В ситуации "${complaint.situation}" ${complaint.complainantName} почувствовал(-а): ${complaint.feelings}. Это не обвинение, а возможность лучше понять друг друга. Возможно, вы не заметили, как ваши действия повлияли на близкого человека. Предлагаю спокойно поговорить и найти общий язык. Помните: в семье важно слышать друг друга! 💙`
      : severity === 'medium'
      ? `Добрый день! ${complaint.complainantName} обратился(-лась) за помощью в разрешении конфликта между вами. В ситуации "${complaint.situation}" ${complaint.complainantName} испытал(-а) сильные чувства: ${complaint.feelings}. ${complaint.consequences ? `Это привело к: ${complaint.consequences}. ` : ''}Такие моменты случаются в любой семье, и это нормально. Важно не то, что произошел конфликт, а то, как мы его решим. Предлагаю встретиться и спокойно обсудить, что каждый из вас чувствовал и чего хотел. Уверен, вместе вы найдете решение! 🤝`
      : `Уважаемый член семьи! ${complaint.complainantName} обратился(-лась) с серьезной проблемой, которая требует внимания. В ситуации "${complaint.situation}" ${complaint.complainantName} пережил(-а): ${complaint.feelings}. ${complaint.consequences ? `Последствия: ${complaint.consequences}. ` : ''}Эта ситуация причинила боль вашему близкому человеку. Важно понимать: конфликты — это не провал, а возможность стать ближе, если решить их правильно. Предлагаю организовать семейную встречу, где каждый сможет высказаться и быть услышанным. Вместе вы сможете найти путь к примирению и взаимопониманию. Семья — это команда, и вы справитесь! 🌟`;

    return {
      summary: `Зарегистрирован конфликт между ${complaint.complainantName} и ${complaint.accusedName}. Уровень серьезности: ${severity === 'low' ? 'низкий' : severity === 'medium' ? 'средний' : 'высокий'}. Требуется ${severity === 'low' ? 'разговор' : severity === 'medium' ? 'медиация' : 'семейный совет'}.`,
      recommendationsForComplainant: recommendationsMap[severity],
      messageForAccused,
      peaceSteps: peaceStepsMap[severity],
      severity
    };
  };

  const handleSubmitComplaint = () => {
    if (!selectedAccusedId || !situation.trim() || !feelings.trim()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const accused = familyMembers.find(m => m.id === selectedAccusedId);
    if (!accused || !currentMember) return;

    const complaintData: Omit<Complaint, 'id' | 'aiAnalysis' | 'resolution'> = {
      complainantId: currentUserId,
      complainantName: currentMember.name,
      accusedId: selectedAccusedId,
      accusedName: accused.name,
      situation,
      feelings,
      consequences: consequences.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const newComplaint: Complaint = {
      ...complaintData,
      id: Date.now().toString(),
      aiAnalysis: generateAIAnalysis(complaintData)
    };

    const updatedComplaints = [newComplaint, ...complaints];
    setComplaints(updatedComplaints);
    localStorage.setItem('familyComplaints', JSON.stringify(updatedComplaints));

    setShowNewComplaintDialog(false);
    setSelectedAccusedId('');
    setSituation('');
    setFeelings('');
    setConsequences('');
  };

  const handleResolveComplaint = (complaintId: string, outcome: string) => {
    const updatedComplaints = complaints.map(c => 
      c.id === complaintId 
        ? {
            ...c,
            status: 'resolved' as const,
            resolution: {
              resolvedAt: new Date().toISOString(),
              outcome
            }
          }
        : c
    );
    setComplaints(updatedComplaints);
    localStorage.setItem('familyComplaints', JSON.stringify(updatedComplaints));
  };

  const getSeverityColor = (severity?: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (status: Complaint['status']) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'in_progress': return 'В процессе';
      case 'resolved': return 'Решено';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="BookOpen" className="text-amber-600" size={28} />
            Жалобная книга
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Место для разрешения конфликтов и восстановления гармонии в семье
          </p>
        </div>
        
        <Dialog open={showNewComplaintDialog} onOpenChange={setShowNewComplaintDialog}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Icon name="Plus" size={18} className="mr-2" />
              Оставить обращение
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="MessageSquareWarning" className="text-amber-600" />
                Новое обращение
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  На кого жалоба? <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedAccusedId}
                  onChange={(e) => setSelectedAccusedId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Выберите члена семьи</option>
                  {familyMembers.filter(m => m.id !== currentUserId).map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Опишите ситуацию <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="Что произошло? Когда и где?"
                  className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Ваши чувства <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={feelings}
                  onChange={(e) => setFeelings(e.target.value)}
                  placeholder="Что вы почувствовали? Как это на вас повлияло?"
                  className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Последствия (необязательно)
                </label>
                <textarea
                  value={consequences}
                  onChange={(e) => setConsequences(e.target.value)}
                  placeholder="Какие последствия произошли? Как это отразилось на семье?"
                  className="w-full border rounded-lg px-3 py-2 min-h-[80px]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNewComplaintDialog(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleSubmitComplaint}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Отправить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {complaints.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icon name="Smile" size={64} className="text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">В семье царит гармония!</h3>
            <p className="text-muted-foreground text-center">
              Пока нет обращений. Это прекрасно! Но если возникнет конфликт,<br />
              не стесняйтесь использовать этот инструмент для его разрешения.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="overflow-hidden">
              <CardHeader className={`${getSeverityColor(complaint.aiAnalysis?.severity)} border-b-2`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(complaint.status)}>
                        {getStatusText(complaint.status)}
                      </Badge>
                      {complaint.aiAnalysis?.severity && (
                        <Badge variant="outline" className={getSeverityColor(complaint.aiAnalysis.severity)}>
                          {complaint.aiAnalysis.severity === 'low' ? '⚠️ Низкий' : 
                           complaint.aiAnalysis.severity === 'medium' ? '⚠️⚠️ Средний' : 
                           '⚠️⚠️⚠️ Высокий'}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">
                      {complaint.complainantName} → {complaint.accusedName}
                    </CardTitle>
                    <p className="text-sm opacity-75 mt-1">
                      {new Date(complaint.createdAt).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Icon name="Flag" size={24} />
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Icon name="FileText" size={16} />
                    Ситуация
                  </h4>
                  <p className="text-sm">{complaint.situation}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Icon name="Heart" size={16} />
                    Чувства
                  </h4>
                  <p className="text-sm">{complaint.feelings}</p>
                </div>

                {complaint.consequences && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <Icon name="AlertTriangle" size={16} />
                      Последствия
                    </h4>
                    <p className="text-sm">{complaint.consequences}</p>
                  </div>
                )}

                {complaint.aiAnalysis && (
                  <div className="border-t pt-6 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Icon name="Lightbulb" size={18} className="text-blue-600" />
                        Анализ ситуации
                      </h4>
                      <p className="text-sm">{complaint.aiAnalysis.summary}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Icon name="ListChecks" size={18} className="text-purple-600" />
                        Рекомендации для {complaint.complainantName}
                      </h4>
                      <ul className="space-y-2">
                        {complaint.aiAnalysis.recommendationsForComplainant.map((rec, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-purple-600 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Icon name="MessageCircle" size={18} className="text-amber-600" />
                        Сообщение для {complaint.accusedName}
                      </h4>
                      <p className="text-sm whitespace-pre-line">{complaint.aiAnalysis.messageForAccused}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Icon name="Route" size={18} className="text-green-600" />
                        Шаги к примирению
                      </h4>
                      <ol className="space-y-2">
                        {complaint.aiAnalysis.peaceSteps.map((step, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-green-600 font-bold min-w-[20px]">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                {complaint.resolution && (
                  <div className="border-t pt-6">
                    <div className="bg-green-100 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-800">
                        <Icon name="CheckCircle" size={18} />
                        Конфликт решен
                      </h4>
                      <p className="text-sm text-green-800 mb-2">
                        {new Date(complaint.resolution.resolvedAt).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-green-900">{complaint.resolution.outcome}</p>
                    </div>
                  </div>
                )}

                {complaint.status !== 'resolved' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <Icon name="MessageSquare" size={16} className="mr-2" />
                          Отметить как решено
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Отметить конфликт как решенный</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <textarea
                            id={`outcome-${complaint.id}`}
                            placeholder="Опишите, как был решен конфликт"
                            className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
                          />
                          <Button
                            onClick={() => {
                              const textarea = document.getElementById(`outcome-${complaint.id}`) as HTMLTextAreaElement;
                              const outcome = textarea?.value || 'Конфликт решен';
                              handleResolveComplaint(complaint.id, outcome);
                            }}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Icon name="Check" size={16} className="mr-2" />
                            Подтвердить
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
