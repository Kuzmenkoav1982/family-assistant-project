import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useAIAssistant, defaultRoles } from '@/contexts/AIAssistantContext';
import type { AIAssistantRole } from '@/contexts/AIAssistantContext';
import DomovoyDonationDialog from '@/components/DomovoyDonationDialog';
import { AstrologyService } from '@/components/astrology/AstrologyService';
import { DomovoiTransform } from '@/components/DomovoiTransform';

const DOMOVOY_IMAGE = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/fc02be5d-2267-4bed-abdc-ec04bc7ec037.jpg';

export default function DomovoyPage() {
  const navigate = useNavigate();
  const { assistantLevel, selectedRole, setSelectedRole } = useAIAssistant();
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [showAstrologyDialog, setShowAstrologyDialog] = useState(false);
  const [showTransformAnimation, setShowTransformAnimation] = useState(false);
  const [pendingRole, setPendingRole] = useState<AIAssistantRole | null>(null);

  const levelProgress = ((assistantLevel - 1) / 9) * 100;

  const handleRoleClick = (role: AIAssistantRole) => {
    if (role.id === 'cook' && selectedRole?.id !== 'cook') {
      setPendingRole(role);
      setShowTransformAnimation(true);
    } else {
      setSelectedRole(role);
      if (role.id === 'astrologer') {
        setShowAstrologyDialog(true);
      }
    }
  };

  const handleTransformComplete = () => {
    setShowTransformAnimation(false);
    if (pendingRole) {
      setSelectedRole(pendingRole);
      if (pendingRole.id === 'astrologer') {
        setShowAstrologyDialog(true);
      }
      setPendingRole(null);
    }
  };

  const handleTransformSkip = () => {
    handleTransformComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pb-20">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              🏠 Домовой - хранитель очага
            </h1>
            <p className="text-gray-600 mt-2">Добрый дух славянской культуры</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
            <Icon name="ArrowLeft" size={18} />
            На главную
          </Button>
        </div>

        {/* Illustration */}
        <Card className="overflow-hidden border-4 border-amber-300">
          <img 
            src={DOMOVOY_IMAGE} 
            alt="Домовой" 
            className="w-full h-96 object-cover"
          />
        </Card>

        {/* Current Level */}
        <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Sparkles" className="text-amber-600" />
              Уровень мудрости Домового
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-amber-700">Уровень {assistantLevel} из 10</span>
              <Badge className="bg-amber-600 text-lg px-4 py-2">
                {assistantLevel <= 2 && 'Молодой'}
                {assistantLevel > 2 && assistantLevel <= 5 && 'Опытный'}
                {assistantLevel > 5 && assistantLevel <= 8 && 'Мудрый'}
                {assistantLevel > 8 && 'Древний'}
              </Badge>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <p className="text-sm text-gray-600">
              Чем выше уровень, тем более точные советы даёт Домовой вашей семье
            </p>
            <Button 
              onClick={() => setShowDonationDialog(true)}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              size="lg"
            >
              <Icon name="Gift" className="mr-2" />
              Угостить Домового
            </Button>
          </CardContent>
        </Card>

        {/* Role Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Briefcase" />
              Роль Домового в семье
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Выберите, в какой роли Домовой будет помогать вашей семье
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {defaultRoles.map((role: AIAssistantRole) => (
                <Button
                  key={role.id}
                  onClick={() => handleRoleClick(role)}
                  variant={selectedRole?.id === role.id ? 'default' : 'outline'}
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xl">{role.emoji}</span>
                    <span className="font-semibold text-sm">{role.name}</span>
                  </div>
                  {selectedRole?.id === role.id && (
                    <Icon name="Check" className="ml-auto" size={16} />
                  )}
                </Button>
              ))}
            </div>
            {selectedRole && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm">
                  <strong>{selectedRole.emoji} {selectedRole.name}:</strong> {selectedRole.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* About Domovoy */}
        <Card>
          <CardHeader>
            <CardTitle>📜 Кто такой Домовой?</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p className="text-gray-700 leading-relaxed">
              <strong>Домовой</strong> (также: Дедушка, Соседушка, Хозяюшко) — 
              главный дух славянского жилища, хранитель семейного очага и благополучия.
            </p>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Icon name="BookOpen" size={20} />
                Происхождение
              </h3>
              <p className="text-gray-700">
                Согласно славянским поверьям, Домовой — это дух предка, приставленный 
                Богами для защиты рода и дома. Он есть практически в каждом доме!
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Icon name="Eye" size={20} />
                Как выглядит Домовой?
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-green-600 mt-1" size={16} />
                  <span>Низкорослый коренастый старец</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-green-600 mt-1" size={16} />
                  <span>Длинная седая борода</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-green-600 mt-1" size={16} />
                  <span>Добрые, но строгие глаза</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-green-600 mt-1" size={16} />
                  <span>Покрыт мягкой шерстью</span>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Icon name="Home" size={20} />
                Где живёт?
              </h3>
              <p className="text-gray-700">
                <strong>В старину:</strong> За печкой, на чердаке<br />
                <strong>Сейчас:</strong> В укромном уголке кухни
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Icon name="Heart" size={20} />
                Чем помогает Домовой?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                  <Icon name="Shield" className="text-green-600 mt-1" size={18} />
                  <span>Оберегает дом от бед и невзгод</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                  <Icon name="Wrench" className="text-green-600 mt-1" size={18} />
                  <span>Помогает в хозяйстве</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                  <Icon name="Baby" className="text-green-600 mt-1" size={18} />
                  <span>Присматривает за детьми</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                  <Icon name="Users" className="text-green-600 mt-1" size={18} />
                  <span>Бережёт семейный лад</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                  <Icon name="Bell" className="text-green-600 mt-1" size={18} />
                  <span>Предупреждает об опасности</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                  <Icon name="Sparkles" className="text-green-600 mt-1" size={18} />
                  <span>Приносит удачу и достаток</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Icon name="Gift" size={20} />
                Как задобрить Домового?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-2xl">🥛</span>
                  <div>
                    <strong>Угощения:</strong> Молоко, каша, хлеб, мёд
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-2xl">🧹</span>
                  <div>
                    <strong>Чистота:</strong> Порядок в доме
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-2xl">🕊️</span>
                  <div>
                    <strong>Уважение:</strong> Не ругаться, не скандалить
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <strong>Подарки:</strong> Маленькие тапочки, лоскуток ткани
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Icon name="Users" size={20} />
                Семья Домового
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">👵</span>
                  <div>
                    <strong>Домовиха (Домаха)</strong> — жена, помощница по хозяйству
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">👶</span>
                  <div>
                    <strong>Домовята</strong> — дети (по числу детей в семье)
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Icon name="AlertCircle" size={20} />
                Народные приметы
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Icon name="Moon" className="text-yellow-600 mt-1" size={18} />
                  <span>Душит во сне → к переменам</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Icon name="Bell" className="text-orange-600 mt-1" size={18} />
                  <span>Стучит → предупреждает об опасности</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Icon name="Heart" className="text-green-600 mt-1" size={18} />
                  <span>Гладит рукой → к добру и благополучию</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="BookText" size={20} />
                📚 Источники
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Иванова И., "Славянская мифология" (Издательство "Северная Сказка")</li>
                <li>• Афанасьев А.Н., "Поэтические воззрения славян на природу" (1865-1869)</li>
                <li>• Максимов С.В., "Нечистая, неведомая и крестная сила" (1903)</li>
                <li>• Коринфский А.А., "Народная Русь" (1901)</li>
                <li>• Олонецкие губернские ведомости, 1899, № 53</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="border-4 border-amber-400 bg-gradient-to-br from-amber-100 to-orange-100">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">
              Помогите Домовому стать мудрее! 🏠
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Ваш Домовой работает день и ночь, чтобы помогать семье. 
              Угостите его, и он станет ещё умнее! 🧠✨
            </p>
            <Button 
              onClick={() => setShowDonationDialog(true)}
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-lg px-8"
            >
              <Icon name="Gift" className="mr-2" size={24} />
              Угостить Домового
            </Button>
          </CardContent>
        </Card>
      </div>

      <DomovoyDonationDialog
        open={showDonationDialog}
        onOpenChange={setShowDonationDialog}
      />

      <Dialog open={showAstrologyDialog} onOpenChange={setShowAstrologyDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <span className="text-3xl">🌙</span>
              Астрологические прогнозы Домового
            </DialogTitle>
          </DialogHeader>
          <AstrologyService />
        </DialogContent>
      </Dialog>

      {showTransformAnimation && pendingRole && (
        <DomovoiTransform
          role={pendingRole.id}
          onComplete={handleTransformComplete}
          onSkip={handleTransformSkip}
        />
      )}
    </div>
  );
}