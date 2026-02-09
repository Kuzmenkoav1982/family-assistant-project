import { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Consultation {
  id: string;
  topic: string;
  situation: string;
  participants: string[];
  date: string;
  status: 'active' | 'resolved';
  aiAdvice: {
    analysis: string;
    recommendations: string[];
    actions: string[];
  };
}

const mockConsultations: Consultation[] = [
  {
    id: '1',
    topic: 'Конфликт из-за времени у компьютера',
    situation: 'Максим проводит много времени за компьютером, София жалуется что он не играет с ней. Родители переживают за здоровье сына.',
    participants: ['Максим', 'София', 'Александр', 'Елена'],
    date: '2 дня назад',
    status: 'resolved',
    aiAdvice: {
      analysis: 'Данная ситуация типична для семей с детьми разного возраста. Максиму 11 лет - возраст активного освоения цифрового пространства, София младше и нуждается во внимании брата. Важно найти баланс между интересами обоих детей.',
      recommendations: [
        'Установите чёткое расписание использования техники для Максима',
        'Выделите специальное время для совместных игр брата и сестры',
        'Найдите общие интересы детей (настольные игры, прогулки)',
        'Объясните Максиму важность общения с сестрой для её развития',
        'Хвалите Максима когда он проводит время с Софией'
      ],
      actions: [
        '📅 Создать в календаре "Час семейных игр" каждый вечер',
        '⏰ Установить таймер использования компьютера для Максима (2 часа в день)',
        '🎮 Купить новую настольную игру, интересную обоим детям',
        '✅ Добавить задачу Максиму "Поиграть с Софией" (20 баллов)'
      ]
    }
  },
  {
    id: '2',
    topic: 'Распределение домашних обязанностей',
    situation: 'Елена чувствует что выполняет слишком много работы по дому. Александр работает допоздна и считает что вносит вклад зарабатывая деньги.',
    participants: ['Александр', 'Елена'],
    date: '1 неделю назад',
    status: 'active',
    aiAdvice: {
      analysis: 'Классическая ситуация дисбаланса в семейных обязанностях. Важно понимать, что и работа вне дома, и домашние дела - это вклад в семью. Необходимо открытое обсуждение и справедливое перераспределение задач.',
      recommendations: [
        'Составьте список всех домашних дел за неделю',
        'Оцените время выполнения каждой задачи',
        'Учтите рабочее время обоих супругов',
        'Перераспределите обязанности более равномерно',
        'Привлеките детей к помощи по дому',
        'Рассмотрите автоматизацию задач (робот-пылесос, посудомойка)'
      ],
      actions: [
        '📝 Создать общий список домашних дел в разделе "Задачи"',
        '⚖️ Распределить задачи между всеми членами семьи',
        '🎯 Максиму: уборка своей комнаты, выгул собаки',
        '🎯 Софии: полив цветов, складывание игрушек',
        '🎯 Александру: покупка продуктов, вынос мусора, помощь с уроками',
        '🗣️ Провести семейное собрание для обсуждения'
      ]
    }
  },
  {
    id: '3',
    topic: 'София не хочет ходить в школу',
    situation: 'София каждое утро плачет и не хочет идти в школу. Говорит что у неё нет друзей, а учительница строгая.',
    participants: ['София', 'Елена', 'Александр'],
    date: '3 дня назад',
    status: 'active',
    aiAdvice: {
      analysis: 'Отказ ребёнка ходить в школу - серьёзный сигнал. Возможные причины: сложности в адаптации, конфликты со сверстниками, страх перед учителем или трудности в учёбе. Важно выяснить истинную причину через доверительный разговор.',
      recommendations: [
        'Поговорите с Софией в спокойной обстановке',
        'Не обесценивайте её чувства ("Это ерунда")',
        'Свяжитесь с учительницей, узнайте её видение ситуации',
        'Понаблюдайте за поведением дочери дома',
        'Организуйте встречу с одноклассниками вне школы',
        'При необходимости обратитесь к школьному психологу'
      ],
      actions: [
        '📞 Записаться на встречу с учителем',
        '🎈 Организовать домашний праздник и пригласить одноклассниц',
        '📚 Помочь Софии с подготовкой к урокам (снизить тревожность)',
        '🎨 Записать на кружок по интересам (уверенность в себе)',
        '💬 Ежедневно интересоваться как прошёл день в школе'
      ]
    }
  }
];

export default function FamilyPsychologist() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations);
  const [newTopic, setNewTopic] = useState('');
  const [newSituation, setNewSituation] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const familyMembers = ['Александр', 'Елена', 'Максим', 'София', 'Бабушка Анна', 'Дедушка Николай'];

  const handleCreateConsultation = () => {
    if (!newTopic || !newSituation) return;

    const newConsultation: Consultation = {
      id: String(consultations.length + 1),
      topic: newTopic,
      situation: newSituation,
      participants: selectedParticipants,
      date: 'только что',
      status: 'active',
      aiAdvice: {
        analysis: 'ИИ анализирует вашу ситуацию и готовит рекомендации...',
        recommendations: [
          'Проанализируйте глубинные причины ситуации',
          'Проведите открытый диалог со всеми участниками',
          'Найдите компромиссное решение'
        ],
        actions: [
          '🗣️ Провести семейную встречу',
          '📝 Записать договорённости',
          '✅ Отслеживать выполнение решений'
        ]
      }
    };

    setConsultations([newConsultation, ...consultations]);
    setNewTopic('');
    setNewSituation('');
    setSelectedParticipants([]);
    setIsDialogOpen(false);
  };

  const toggleParticipant = (name: string) => {
    setSelectedParticipants(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Семейный психолог ИИ
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Помощь в решении конфликтов, поиске компромиссов и укреплении семейных отношений
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <Icon name="Home" className="mr-2" size={16} />
            На главную
          </Button>
        </header>

        <Card className="border-2 border-teal-200 bg-teal-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Icon name="Brain" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Как работает семейный психолог?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  ИИ-психолог анализирует вашу ситуацию и предлагает научно обоснованные рекомендации для разрешения конфликтов.
                  Это не замена реального психолога, но помощник для повседневных семейных вопросов.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Анализ ситуации</Badge>
                  <Badge variant="secondary">Практические советы</Badge>
                  <Badge variant="secondary">План действий</Badge>
                  <Badge variant="secondary">Конфиденциально</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600" size="lg">
              <Icon name="Plus" className="mr-2" size={20} />
              Обратиться за советом
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Новая консультация</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Тема обращения</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Например: Конфликт между детьми"
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Опишите ситуацию подробно</label>
                <Textarea
                  value={newSituation}
                  onChange={(e) => setNewSituation(e.target.value)}
                  placeholder="Расскажите что произошло, как давно это началось, что вы уже пробовали..."
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Кто вовлечён в ситуацию?</label>
                <div className="flex flex-wrap gap-2">
                  {familyMembers.map((member) => (
                    <Badge
                      key={member}
                      variant={selectedParticipants.includes(member) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleParticipant(member)}
                    >
                      {member}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleCreateConsultation}
                disabled={!newTopic || !newSituation}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500"
              >
                Получить рекомендации ИИ
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="MessageSquare" size={20} className="text-teal-600" />
            <h2 className="text-xl font-bold">История консультаций</h2>
          </div>

          {consultations.map((consultation) => (
            <Card key={consultation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{consultation.topic}</CardTitle>
                      <Badge variant={consultation.status === 'resolved' ? 'default' : 'secondary'}>
                        {consultation.status === 'resolved' ? 'Решено' : 'В процессе'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{consultation.situation}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon name="Users" size={14} />
                      <span>{consultation.participants.join(', ')}</span>
                      <span>•</span>
                      <span>{consultation.date}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div className="flex items-start gap-2 mb-2">
                    <Icon name="Lightbulb" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm mb-1">Анализ ситуации</h4>
                      <p className="text-sm">{consultation.aiAdvice.analysis}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Icon name="CheckCircle2" size={16} className="text-green-600" />
                    Рекомендации
                  </h4>
                  <ul className="space-y-1">
                    {consultation.aiAdvice.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 flex-shrink-0">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Icon name="Zap" size={16} className="text-purple-600" />
                    Конкретные действия
                  </h4>
                  <div className="space-y-2">
                    {consultation.aiAdvice.actions.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Когда нужен настоящий психолог?</p>
                <p className="text-muted-foreground">
                  ИИ-психолог помогает с повседневными вопросами, но не заменяет профессионала. Обратитесь к психологу при серьёзных конфликтах, 
                  признаках депрессии, агрессии, затяжных проблемах в отношениях.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}