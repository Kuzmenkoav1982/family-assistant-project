import { useState, useEffect, useMemo } from 'react';
import SEOHead from "@/components/SEOHead";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import Footer from '@/components/Footer';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { ParentDashboard } from '@/components/children/ParentDashboard';
import { ChildProfile as ChildProfileComponent } from '@/components/children/ChildProfile';
import { AddFamilyMemberForm } from '@/components/AddFamilyMemberForm';
import type { FamilyMember } from '@/types/family.types';
import SectionAIAdvisor from '@/components/SectionAIAdvisor';

export default function Children() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { members: realMembers, loading: realLoading, addMember } = useFamilyMembersContext();
  const { isDemoMode, demoMembers } = useDemoMode();
  const members = isDemoMode ? demoMembers : realMembers;
  const loading = isDemoMode ? false : realLoading;
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'parent' | 'child'>('parent');
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [showAddChildDialog, setShowAddChildDialog] = useState(false);

  // Safe data processing with Array.isArray check - use useMemo to prevent infinite loops
  // Фильтруем всех детей по нескольким критериям
  const children = useMemo(() => {
    if (!Array.isArray(members)) return [];
    
    return members.filter(m => {
      const role = m.role?.toLowerCase() || '';
      const relationship = m.relationship?.toLowerCase() || '';
      
      // Проверяем роль или родство
      return role.includes('сын') || 
             role.includes('дочь') || 
             role.includes('ребёнок') || 
             role.includes('ребенок') ||
             role === 'сын' ||
             role === 'дочь' ||
             relationship.includes('сын') ||
             relationship.includes('дочь') ||
             relationship.includes('ребёнок') ||
             relationship.includes('ребенок') ||
             m.access_role === 'child';
    });
  }, [members]);
  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('userData') || '{}'), []);
  
  // Try to find by user_id first, then by id
  const currentMember = Array.isArray(members) 
    ? members.find(m => 
        m.user_id === currentUser?.id || 
        m.id === currentUser?.id ||
        m.user_id === currentUser?.user_id
      ) 
    : undefined;
  
  // Проверяем и роль члена семьи, и права доступа
  const isParent = isDemoMode || 
                   currentMember?.role === 'Папа' || 
                   currentMember?.role === 'Мама' || 
                   currentMember?.role === 'Владелец' || 
                   currentMember?.role === 'Родитель' ||
                   currentMember?.role === 'Отец' ||
                   currentMember?.role === 'Мать' ||
                   currentMember?.role === 'Жена' ||
                   currentMember?.role === 'Муж' ||
                   currentUser?.role === 'Родитель' ||
                   currentMember?.accessRole === 'admin' ||
                   currentMember?.accessRole === 'editor';
  
  // Debug logs - uncomment if needed
  // console.log('[Children] members:', members?.length, 'children:', children.length, 'isParent:', isParent);

  useEffect(() => {
    if (!Array.isArray(members) || members.length === 0) return;
    
    // D.1: поддерживаем ?member= как алиас ?childId= для deep-link из портфолио.
    const childId = searchParams.get('childId') || searchParams.get('member');
    const mode = searchParams.get('mode') as 'parent' | 'child' | null;
    
    if (childId) {
      // Если в URL указан childId - выбираем его
      setSelectedChildId(childId);
    } else {
      // Если childId НЕТ в URL
      if (!isParent && currentMember) {
        // Если текущий пользователь — ребёнок, ищем его в списке детей по всем возможным полям
        const currentChild = children.find(c => {
          // Сравниваем по id члена семьи
          if (c.id === currentMember.id) return true;
          // Сравниваем по user_id
          if (c.user_id && currentMember.user_id && c.user_id === currentMember.user_id) return true;
          // Сравниваем user_id ребёнка с id текущего пользователя
          if (c.user_id === currentUser?.id) return true;
          // Сравниваем id ребёнка с user_id текущего пользователя  
          if (c.id === currentUser?.user_id) return true;
          return false;
        });
        
        if (currentChild) {
          // Нашли текущего ребёнка - показываем его
          setSelectedChildId(currentChild.id);
        } else {
          // Если НЕ нашли - НЕ показываем профиль (у ребёнка нет доступа к другим детям)
          setSelectedChildId(null);
        }
      } else {
        // Родителям показываем первого ребёнка
        if (children.length > 0) {
          setSelectedChildId(children[0].id);
        }
      }
    }
    
    if (mode) {
      setViewMode(mode);
    } else {
      setViewMode(isParent ? 'parent' : 'child');
    }
  }, [searchParams, isParent, children, currentMember, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-amber-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Загрузка профилей детей...</p>
        </div>
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-amber-50/30 to-white pb-24">
        <div className="max-w-5xl mx-auto p-4 space-y-6">
          <SectionHero
            title="Дети"
            subtitle="Развитие и контроль"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/c284ef36-f2eb-45cb-95cc-7e8f735dbd0d.jpg"
            backPath="/family-hub"
          />
          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent className="space-y-6">
              <div className="text-6xl mb-4">👶</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Детские профили не найдены
              </h2>
              <p className="text-gray-600">
                Добавьте ребёнка, чтобы начать использовать этот раздел
              </p>
              <Button 
                onClick={() => setShowAddChildDialog(true)} 
                className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Icon name="Baby" className="mr-2" size={18} />
                Добавить ребёнка
              </Button>
              <Dialog open={showAddChildDialog} onOpenChange={setShowAddChildDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100vw-1rem)] sm:w-full">
                  <DialogHeader>
                    <DialogTitle>Добавить ребёнка</DialogTitle>
                  </DialogHeader>
                  <AddFamilyMemberForm 
                    isChild={true}
                    onSubmit={async (newChild) => {
                      await addMember(newChild);
                      setShowAddChildDialog(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  return (
    <>
    <SEOHead title="Дети — профили и развитие детей" description="Профили детей, отслеживание развития, оценка навыков, планы развития. Всё для заботливых родителей." path="/children" breadcrumbs={[{ name: "Семья", path: "/family-hub" }, { name: "Дети", path: "/children" }]} />
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-amber-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Дети"
          subtitle="Развитие и контроль"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/c284ef36-f2eb-45cb-95cc-7e8f735dbd0d.jpg"
          backPath="/family-hub"
        />

        <SectionAIAdvisor
          role="child-educator"
          title="ИИ-Воспитатель"
          description="Развитие, возрастные кризисы, воспитание"
          gradientFrom="from-amber-500"
          gradientTo="to-orange-600"
          accentBg="bg-amber-50"
          accentText="text-amber-700"
          accentBorder="border-amber-200"
          placeholder="Спросите о ребёнке..."
          quickQuestions={[
            'Как мотивировать к учёбе?',
            'Как пережить возрастной кризис?',
            'Как развивать самостоятельность?',
            'Как установить границы?',
            'Ребёнок не хочет в школу — что делать?',
          ]}
          sectionContext={children.length > 0
            ? `Дети в семье: ${children.map(c => `${c.name || ''}${c.birth_date ? ` (род. ${c.birth_date})` : ''}${c.role ? ` — ${c.role}` : ''}`).join('; ')}.`
            : undefined}
        />

        <div className="flex items-center justify-end mb-4">
          {isParent && (
            <div className="flex gap-2 z-50 flex-wrap justify-end">
              <Button
                variant={viewMode === 'parent' ? 'default' : 'outline'}
                onClick={() => {
                  setViewMode('parent');
                  if (selectedChildId) {
                    setSearchParams({ childId: selectedChildId, mode: 'parent' });
                  }
                }}
                className="gap-2 shadow-lg text-sm px-3 py-2 whitespace-nowrap"
              >
                <Icon name="BarChart3" size={16} />
                <span className="hidden sm:inline">Родительский режим</span>
                <span className="sm:hidden">Родитель</span>
              </Button>
              <Button
                variant={viewMode === 'child' ? 'default' : 'outline'}
                onClick={() => {
                  setViewMode('child');
                  if (selectedChildId) {
                    setSearchParams({ childId: selectedChildId, mode: 'child' });
                  }
                }}
                className="gap-2 shadow-lg text-sm px-3 py-2 whitespace-nowrap"
              >
                <Icon name="Smile" size={16} />
                <span className="hidden sm:inline">Детский режим</span>
                <span className="sm:hidden">Детский</span>
              </Button>
            </div>
          )}
        </div>

        {/* Инструкция */}
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen} className="mb-6 relative z-10">
          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-2 shadow-md">
                <Icon name="Info" className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-blue-900 text-lg">
                      📖 Как работает раздел Дети
                    </h3>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-medium">
                      Инструкция
                    </span>
                  </div>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-6 w-6 text-blue-600 transition-transform group-hover:scale-110" 
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-blue-800">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">👶 Для чего нужен раздел Дети?</p>
                        <p className="text-sm">
                          Раздел помогает следить за развитием и достижениями детей, отслеживать их активности, 
                          навыки и интересы. Родители видят полную картину развития ребёнка, а дети получают 
                          мотивацию через систему достижений и наград.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">⚡ Возможности раздела</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>Два режима:</strong> Родительский (аналитика и контроль) и Детский (профиль ребёнка)</li>
                          <li><strong>Оценка развития с ИИ:</strong> Анализ навыков по возрасту, персональный план развития</li>
                          <li><strong>Личный календарь:</strong> События, врачи, кружки, напоминания для каждого ребёнка</li>
                          <li><strong>Дневник настроения:</strong> Отслеживание эмоций и благополучия</li>
                          <li><strong>Копилка:</strong> Реальные накопления, цели, история транзакций</li>
                          <li><strong>Достижения и значки:</strong> Система наград и мотивации</li>
                          <li><strong>Магазин наград:</strong> Обмен баллов на привилегии и подарки</li>
                          <li><strong>Игры, книги, мечты:</strong> Трекеры интересов и целей ребёнка</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🎯 Родительский режим (Дашборд)</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>ИИ-оценка развития:</strong> Проводите анализ по возрасту (0-7 лет), получайте план упражнений</li>
                          <li><strong>Календарь:</strong> Планируйте врачей, школу, кружки, спорт с напоминаниями</li>
                          <li><strong>Здоровье:</strong> Отслеживайте рост, вес, прививки, анализы</li>
                          <li><strong>Финансы:</strong> Управляйте копилкой — добавляйте/снимайте деньги, ставьте цели</li>
                          <li><strong>Магазин наград:</strong> Создавайте награды, которые ребёнок может купить за баллы</li>
                          <li><strong>Статистика:</strong> Просматривайте динамику развития всех детей</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">😊 Детский режим (Профиль ребёнка)</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>Главная:</strong> Балансы баллов и денег, интересный факт дня</li>
                          <li><strong>Дневник настроения:</strong> Отмечает как чувствует себя каждый день</li>
                          <li><strong>Достижения:</strong> Коллекция значков и наград за успехи</li>
                          <li><strong>Магазин:</strong> Покупает награды за баллы (кино, сладкое, прогулка)</li>
                          <li><strong>Копилка:</strong> Видит свои накопления, цели сбережений, историю</li>
                          <li><strong>Календарь:</strong> Личные события с фильтрами по категориям</li>
                          <li><strong>Игры/Книги/Мечты:</strong> Управляет своими желаниями и интересами</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📝 Как добавить ребёнка?</p>
                        <div className="space-y-3">
                          <ol className="text-sm space-y-1.5 list-decimal list-inside">
                            <li>Нажмите на кнопку "Добавить ребёнка" ниже, или на вкладке <strong>"Семья"</strong> на главной</li>
                            <li>Заполните форму: <strong>имя</strong>, <strong>роль</strong> (Сын/Дочь/Ребёнок), <strong>возраст</strong> (необязательно)</li>
                            <li>Выберите <strong>аватар</strong> или загрузите фото профиля</li>
                            <li>Нажмите "Добавить" — профиль появится автоматически в разделе "Дети"</li>
                            <li>В Родительском режиме добавьте навыки, интересы и достижения</li>
                            <li>Регулярно обновляйте информацию о прогрессе</li>
                          </ol>
                          
                          <div className="flex justify-center pt-2">
                            <Button
                              onClick={() => setShowAddChildDialog(true)}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
                            >
                              <Icon name="Baby" className="mr-2" size={18} />
                              Добавить ребёнка
                            </Button>
                          </div>
                          
                          <p className="text-xs text-blue-700 italic">
                            ℹ️ Для ребёнка не нужен телефон или email — это просто профиль в вашей семье для отслеживания развития.
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🧠 Оценка развития (ИИ)</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>Нажмите "Оценка развития" в Родительском режиме</li>
                          <li>Выберите возраст ребёнка (8 диапазонов от 0 до 7 лет)</li>
                          <li>Заполните анкету: оцените навыки (Не умеет / Частично / Уверенно)</li>
                          <li>ИИ создаст отчёт с процентами по 5 категориям</li>
                          <li>Получите персональный план развития с упражнениями</li>
                          <li>Отмечайте выполнение — прогресс обновляется автоматически</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📅 Личный календарь ребёнка</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Добавляйте события по категориям: Здоровье, Школа, Кружки, Спорт, Другое</li>
                          <li>Устанавливайте дату, время, описание</li>
                          <li>Включайте напоминания за день до события</li>
                          <li>Фильтруйте по категориям или смотрите все сразу</li>
                          <li>Доступен в Родительском режиме и в профиле ребёнка (вкладка Календарь)</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🔄 Переключение между детьми</p>
                        <p className="text-sm">
                          Если в семье несколько детей, используйте кнопки с именами вверху страницы 
                          для переключения между профилями. Вся информация сохраняется отдельно для каждого ребёнка.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">💡 Полезные советы</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>Дайте доступ ребёнку:</strong> Переключайтесь в Детский режим, чтобы ребёнок видел свой профиль</li>
                          <li><strong>Регулярная оценка:</strong> Проводите ИИ-анализ каждые 3-6 месяцев для отслеживания прогресса</li>
                          <li><strong>Используйте календарь:</strong> Планируйте всё для каждого ребёнка отдельно</li>
                          <li><strong>Копилка как мотивация:</strong> Платите за задачи, учите копить на цели</li>
                          <li><strong>Магазин наград:</strong> Создавайте привилегии, которые действительно интересны ребёнку</li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-blue-200">
                        <Button
                          variant="link"
                          onClick={() => navigate('/instructions')}
                          className="text-blue-600 hover:underline p-0 h-auto text-sm"
                        >
                          📖 <strong>Подробнее:</strong> Полная инструкция
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        {selectedChild && (
          <>
            <div className="mb-6">
              <div className="flex gap-3 overflow-x-auto pb-4">
                {children.map((child) => (
                  <Button
                    key={child.id}
                    variant={selectedChildId === child.id ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedChildId(child.id);
                      setSearchParams({ childId: child.id, mode: viewMode });
                    }}
                    className="whitespace-nowrap font-semibold text-base"
                  >
                    {child.name}
                  </Button>
                ))}
              </div>
            </div>

            {viewMode === 'parent' ? (
              <ParentDashboard
                child={selectedChild}
                initialTab={searchParams.get('tab')}
                initialAction={searchParams.get('action')}
                onActionHandled={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete('action');
                  next.delete('tab');
                  next.delete('from');
                  setSearchParams(next, { replace: true });
                }}
              />
            ) : (
              <ChildProfileComponent
                child={selectedChild}
                initialTab={searchParams.get('tab')}
                initialAction={searchParams.get('action')}
                onActionHandled={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete('action');
                  next.delete('tab');
                  next.delete('from');
                  setSearchParams(next, { replace: true });
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Диалог добавления ребёнка */}
      <Dialog open={showAddChildDialog} onOpenChange={setShowAddChildDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить ребёнка</DialogTitle>
          </DialogHeader>
          <AddFamilyMemberForm
            isChild={true}
            onSubmit={async (newChild) => {
              const result = await addMember({
                name: newChild.name,
                role: newChild.role,
                age: newChild.age,
                avatar: newChild.avatar,
                avatar_type: newChild.avatarType,
                photo_url: newChild.photoUrl,
                relationship: 'Ребёнок',
                points: 0,
                level: 1,
                workload: 0
              });
              
              if (result.success) {
                setShowAddChildDialog(false);
              } else {
                alert('Ошибка добавления ребёнка: ' + result.error);
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
    </>
  );
}