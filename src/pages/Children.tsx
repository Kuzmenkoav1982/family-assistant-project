import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import Footer from '@/components/Footer';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { ParentDashboard } from '@/components/children/ParentDashboard';
import { ChildProfile as ChildProfileComponent } from '@/components/children/ChildProfile';
import { AddFamilyMemberForm } from '@/components/AddFamilyMemberForm';
import type { FamilyMember } from '@/types/family.types';

export default function Children() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { members, loading, addMember } = useFamilyMembersContext();
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
      // Проверяем различные варианты написания роли ребёнка
      return role.includes('сын') || 
             role.includes('дочь') || 
             role.includes('ребёнок') || 
             role.includes('ребенок') ||
             role === 'сын' ||
             role === 'дочь';
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
  
  const isParent = currentMember?.role === 'Папа' || 
                   currentMember?.role === 'Мама' || 
                   currentMember?.role === 'Владелец' || 
                   currentMember?.role === 'Родитель' ||
                   currentUser?.role === 'Родитель';
  
  // Debug logs - uncomment if needed
  // console.log('[Children] members:', members?.length, 'children:', children.length, 'isParent:', isParent);

  useEffect(() => {
    if (!Array.isArray(members) || members.length === 0) return;
    
    const childId = searchParams.get('childId');
    const mode = searchParams.get('mode') as 'parent' | 'child' | null;
    
    if (childId) {
      // Если в URL указан childId - выбираем его
      setSelectedChildId(childId);
    } else {
      // Если childId НЕТ в URL
      if (isParent) {
        // Для родителей - очищаем выбор (показываем экран выбора)
        setSelectedChildId(null);
      } else if (children.length > 0) {
        // Для детей - автоматически выбираем первого ребёнка
        setSelectedChildId(children[0].id);
      }
    }
    
    if (mode) {
      setViewMode(mode);
    } else {
      setViewMode(isParent ? 'parent' : 'child');
    }
  }, [searchParams, isParent, children]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Загрузка профилей детей...</p>
        </div>
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Icon name="ArrowLeft" size={20} />
              Назад
            </Button>
          </div>

          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent className="space-y-6">
              <div className="text-6xl mb-4">👶</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Детские профили не найдены
              </h2>
              <p className="text-gray-600">
                Добавьте детей в раздел "Семья", чтобы начать использовать этот раздел
              </p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Перейти на главную
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const selectedChild = useMemo(() => 
    children.find(c => c.id === selectedChildId) || children[0],
    [children, selectedChildId]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={20} />
            Назад
          </Button>

          {isParent && (
            <div className="flex gap-2 z-50">
              <Button
                variant={viewMode === 'parent' ? 'default' : 'outline'}
                onClick={() => {
                  setViewMode('parent');
                  if (selectedChildId) {
                    setSearchParams({ childId: selectedChildId, mode: 'parent' });
                  }
                }}
                className="gap-2 shadow-lg"
              >
                <Icon name="BarChart3" size={18} />
                Родительский режим
              </Button>
              <Button
                variant={viewMode === 'child' ? 'default' : 'outline'}
                onClick={() => {
                  setViewMode('child');
                  if (selectedChildId) {
                    setSearchParams({ childId: selectedChildId, mode: 'child' });
                  }
                }}
                className="gap-2 shadow-lg"
              >
                <Icon name="Smile" size={18} />
                Детский режим
              </Button>
            </div>
          )}
        </div>

        {/* Инструкция */}
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen} className="mb-6 relative z-10">
          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                  <h3 className="font-semibold text-blue-900 text-lg">
                    Как работает раздел Дети
                  </h3>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" 
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
                          <li><strong>Профили детей:</strong> Информация о возрасте, интересах, характере</li>
                          <li><strong>Навыки:</strong> Отслеживание развития различных способностей</li>
                          <li><strong>Достижения:</strong> Система наград и мотивации</li>
                          <li><strong>Интересы:</strong> Хобби и увлечения ребёнка</li>
                          <li><strong>История активностей:</strong> Дневник событий и прогресса</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🎯 Родительский режим</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Просматривайте статистику развития всех детей</li>
                          <li>Добавляйте новые навыки и отмечайте прогресс</li>
                          <li>Присваивайте достижения за успехи</li>
                          <li>Записывайте важные события в историю</li>
                          <li>Сравнивайте развитие между детьми (если их несколько)</li>
                          <li>Планируйте развивающие активности</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">😊 Детский режим</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Ребёнок видит свой профиль и аватар</li>
                          <li>Просмотр своих достижений и наград</li>
                          <li>Визуализация прогресса по навыкам</li>
                          <li>Мотивация через геймификацию</li>
                          <li>История личных успехов</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📝 Как добавить ребёнка?</p>
                        <div className="space-y-3">
                          <ol className="text-sm space-y-1.5 list-decimal list-inside">
                            <li>Нажмите на кнопку "Добавить ребёнка" ниже или перейдите на главную страницу → вкладка <strong>"Семья"</strong></li>
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
                        <p className="font-medium mb-2">🎨 Как работать с навыками?</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>Добавление:</strong> Создайте навык (например, "Чтение", "Плавание", "Математика")</li>
                          <li><strong>Прогресс:</strong> Отмечайте уровень развития от начального до продвинутого</li>
                          <li><strong>Категории:</strong> Группируйте по типам (творчество, спорт, учёба, социальные)</li>
                          <li><strong>Регулярность:</strong> Обновляйте прогресс раз в неделю или месяц</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🏆 Система достижений</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Присваивайте награды за конкретные успехи</li>
                          <li>Используйте эмодзи для визуализации достижений</li>
                          <li>Отмечайте как маленькие, так и большие победы</li>
                          <li>Мотивируйте ребёнка стремиться к новым целям</li>
                          <li>Достижения видны в профиле ребёнка</li>
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
                          <li><strong>Вовлекайте детей:</strong> Показывайте им профиль в Детском режиме</li>
                          <li><strong>Празднуйте успехи:</strong> Отмечайте достижения вместе с ребёнком</li>
                          <li><strong>Будьте регулярны:</strong> Обновляйте информацию хотя бы раз в неделю</li>
                          <li><strong>Фокус на росте:</strong> Отслеживайте прогресс, а не только результаты</li>
                          <li><strong>Баланс навыков:</strong> Развивайте разные сферы (спорт, творчество, учёба)</li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-sm italic">
                          💡 <strong>Совет:</strong> Используйте раздел как инструмент мотивации — 
                          дети любят видеть свой прогресс наглядно. Система достижений превращает развитие в игру!
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        {/* Если родитель и не выбран ребёнок - показываем экран выбора */}
        {isParent && !selectedChildId ? (
          <Card className="max-w-4xl mx-auto text-center py-16">
            <CardContent className="space-y-8">
              <div className="text-8xl mb-6">👨‍👩‍👧‍👦</div>
              <h2 className="text-3xl font-bold text-gray-900">
                Выберите ребёнка
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Нажмите на имя ребёнка, чтобы просмотреть его профиль, достижения и прогресс в развитии
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
                {children.map((child) => (
                  <Card 
                    key={child.id}
                    className="hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                    onClick={() => {
                      setSelectedChildId(child.id);
                      setSearchParams({ childId: child.id, mode: viewMode });
                    }}
                  >
                    <CardContent className="pt-6 space-y-4">
                      {child.avatarType === 'photo' && child.photoUrl ? (
                        <img 
                          src={child.photoUrl} 
                          alt={child.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-purple-300 mx-auto"
                        />
                      ) : (
                        <div className="text-6xl">{child.avatar}</div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>
                        <p className="text-sm text-gray-600">{child.age} {child.age === 1 ? 'год' : child.age < 5 ? 'года' : 'лет'}</p>
                      </div>
                      <Button className="w-full">
                        Открыть профиль
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
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
              <ParentDashboard child={selectedChild} />
            ) : (
              <ChildProfileComponent child={selectedChild} />
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
  );
}