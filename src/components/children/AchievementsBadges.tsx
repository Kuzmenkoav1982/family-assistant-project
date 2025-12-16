import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  maxProgress: number;
  earnedDate?: string;
  category: 'reading' | 'tasks' | 'mood' | 'special';
}

interface AchievementsBadgesProps {
  childId: string;
}

export function AchievementsBadges({ childId }: AchievementsBadgesProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Книжный червь',
      description: 'Прочитай 10 книг',
      icon: '📚',
      earned: true,
      progress: 10,
      maxProgress: 10,
      earnedDate: new Date().toISOString(),
      category: 'reading',
    },
    {
      id: '2',
      title: 'Трудяга',
      description: 'Выполни 50 заданий',
      icon: '💪',
      earned: false,
      progress: 32,
      maxProgress: 50,
      category: 'tasks',
    },
    {
      id: '3',
      title: 'Позитивчик',
      description: '7 дней подряд с хорошим настроением',
      icon: '😊',
      earned: true,
      progress: 7,
      maxProgress: 7,
      earnedDate: new Date(Date.now() - 86400000).toISOString(),
      category: 'mood',
    },
    {
      id: '4',
      title: 'Начинающий',
      description: 'Выполни первое задание',
      icon: '🌟',
      earned: true,
      progress: 1,
      maxProgress: 1,
      earnedDate: new Date(Date.now() - 604800000).toISOString(),
      category: 'special',
    },
    {
      id: '5',
      title: 'Копилочка',
      description: 'Накопи 100 монет',
      icon: '🪙',
      earned: false,
      progress: 65,
      maxProgress: 100,
      category: 'special',
    },
    {
      id: '6',
      title: 'Стрик мастер',
      description: '30 дней подряд выполняй задания',
      icon: '🔥',
      earned: false,
      progress: 12,
      maxProgress: 30,
      category: 'tasks',
    },
  ]);

  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  const categoryNames = {
    reading: 'Чтение',
    tasks: 'Задания',
    mood: 'Настроение',
    special: 'Особые',
  };

  const categoryColors = {
    reading: 'from-purple-500 to-pink-500',
    tasks: 'from-blue-500 to-cyan-500',
    mood: 'from-yellow-500 to-orange-500',
    special: 'from-green-500 to-emerald-500',
  };

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <Card className="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 border-2 border-yellow-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="text-7xl">🏆</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Коллекция достижений</h3>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-4xl font-bold text-yellow-600">{earnedCount}</span>
                <span className="text-gray-600">из {totalCount}</span>
              </div>
              <Progress value={(earnedCount / totalCount) * 100} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                Ещё {totalCount - earnedCount} достижений ждут тебя!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Полученные достижения */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Award" size={20} className="text-yellow-600" />
            Полученные достижения ({earnedCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.filter(a => a.earned).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-5xl mb-3">🎯</div>
              <p>Пока нет достижений</p>
              <p className="text-sm">Выполняй задания и получай награды!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {achievements
                .filter(a => a.earned)
                .map((achievement) => (
                  <button
                    key={achievement.id}
                    onClick={() => setSelectedAchievement(achievement)}
                    className="group relative p-4 rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Icon name="Check" size={14} className="text-white" />
                    </div>
                    <div className="text-5xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold text-sm line-clamp-2">{achievement.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(achievement.earnedDate!).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                  </button>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Достижения в процессе */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Target" size={20} className="text-blue-600" />
            В процессе ({achievements.filter(a => !a.earned).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements
              .filter(a => !a.earned)
              .map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`border-2 bg-gradient-to-r ${categoryColors[achievement.category]} bg-opacity-10 hover:shadow-md transition-all cursor-pointer`}
                  onClick={() => setSelectedAchievement(achievement)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl opacity-50">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-lg">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                          <Badge variant="outline">{categoryNames[achievement.category]}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Прогресс</span>
                            <span className="font-semibold">
                              {achievement.progress} / {achievement.maxProgress}
                            </span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Диалог с деталями достижения */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="max-w-md">
          {selectedAchievement && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">
                  <div className="text-8xl mb-4">{selectedAchievement.icon}</div>
                  <h2 className="text-2xl font-bold">{selectedAchievement.title}</h2>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-center text-gray-600">{selectedAchievement.description}</p>
                
                {selectedAchievement.earned ? (
                  <div className="text-center">
                    <Badge className="bg-yellow-500 text-white mb-3">
                      <Icon name="Check" size={16} className="mr-1" />
                      Получено!
                    </Badge>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedAchievement.earnedDate!).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Прогресс</span>
                      <span className="font-semibold">
                        {selectedAchievement.progress} / {selectedAchievement.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}
                      className="h-3"
                    />
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Ещё {selectedAchievement.maxProgress - selectedAchievement.progress} {' '}
                      {selectedAchievement.category === 'reading' && 'книг'}
                      {selectedAchievement.category === 'tasks' && 'заданий'}
                      {selectedAchievement.category === 'mood' && 'дней'}
                      {selectedAchievement.category === 'special' && 'шагов'}
                      !
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <Badge className={`bg-gradient-to-r ${categoryColors[selectedAchievement.category]} text-white`}>
                    {categoryNames[selectedAchievement.category]}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
