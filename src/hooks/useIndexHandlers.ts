import type {
  FamilyMember,
  Task,
  ChatMessage,
  ShoppingItem,
  ThemeType,
} from '@/types/family.types';
import type { WidgetConfig } from '@/components/WidgetSettings';
import type { UseIndexStateReturn } from './useIndexState';

export interface UseIndexHandlersParams {
  state: UseIndexStateReturn;
  familyMembers: FamilyMember[];
  tasks: Task[];
  currentUserId: string;
  currentUser: FamilyMember | undefined;
  onLogout?: () => void;
  navigate: (path: string) => void;
  toggleTaskDB: (taskId: string) => Promise<any>;
  updateMember: (data: { id: string; points: number; level: number }) => Promise<void>;
  castDevVote: (sectionId: string, voteType: 'up' | 'down', comment?: string) => Promise<{ success: boolean; error?: string }>;
  devSectionVotes: Record<string, { up: number; down: number }>;
}

export interface UseIndexHandlersReturn {
  handleSendMessage: () => void;
  handleLogout: () => void;
  handleLogoutLocal: () => void;
  toggleTask: (taskId: string) => Promise<void>;
  getNextOccurrenceDate: (task: Task) => string | undefined;
  addPoints: (memberName: string, points: number) => Promise<void>;
  getWorkloadColor: (workload: number) => string;
  getMemberById: (id: string) => FamilyMember | undefined;
  getAISuggestedMeals: () => { name: string; reason: string; icon: string }[];
  addShoppingItem: () => void;
  toggleShoppingItem: (itemId: string) => void;
  deleteShoppingItem: (itemId: string) => void;
  clearBoughtItems: () => void;
  handleDevSectionVote: (sectionId: string, voteType: 'up' | 'down', withComment?: boolean) => Promise<void>;
  handleSubmitVoteWithComment: () => Promise<void>;
  getDevSectionVotes: (sectionId: string) => { up: number; down: number };
  handleLanguageChange: (language: string) => void;
  handleThemeChange: (theme: ThemeType) => void;
  handleFeedbackButton: (type: 'will_use' | 'not_interested') => void;
  exportStatsToCSV: () => void;
  toggleAutoHide: () => void;
  toggleLeftMenuAutoHide: () => void;
  handleBottomBarSectionsChange: (sections: string[]) => void;
  handleLeftPanelSectionsChange: (sections: string[]) => void;
  handleTopPanelSectionsChange: (sections: string[]) => void;
  handleAutoHideBottomBarChange: (value: boolean) => void;
  isWidgetEnabled: (widgetId: string) => boolean;
  handleWidgetSettingsSave: (settings: WidgetConfig[]) => void;
}

export default function useIndexHandlers({
  state,
  familyMembers,
  tasks,
  currentUserId,
  currentUser,
  onLogout,
  navigate,
  toggleTaskDB,
  updateMember,
  castDevVote,
  devSectionVotes,
}: UseIndexHandlersParams): UseIndexHandlersReturn {
  const {
    newMessage, setNewMessage,
    chatMessages, setChatMessages,
    shoppingList, setShoppingList,
    newItemName, setNewItemName,
    newItemCategory,
    newItemQuantity, setNewItemQuantity,
    newItemPriority, setNewItemPriority,
    setShowAddItemDialog,
    setCurrentLanguage,
    setShowLanguageSelector,
    currentTheme,
    setCurrentTheme,
    setShowThemeSelector,
    autoHideTopBar, setAutoHideTopBar,
    autoHideLeftMenu, setAutoHideLeftMenu,
    setAutoHideBottomBar,
    setBottomBarSections,
    setLeftPanelSections,
    setTopPanelSections,
    widgetSettings, setWidgetSettings,
    pendingVote, setPendingVote,
    voteComment, setVoteComment,
    setShowCommentDialog,
  } = state;

  const getMemberById = (id: string): FamilyMember | undefined => {
    return familyMembers.find(m => m.id === id);
  };

  const addPoints = async (memberName: string, points: number) => {
    const member = familyMembers.find(m => m.name === memberName);
    if (member) {
      const newPoints = member.points + points;
      const newLevel = Math.floor(newPoints / 100) + 1;
      await updateMember({
        id: member.id,
        points: newPoints,
        level: newLevel
      });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const user = getMemberById(currentUserId);
    if (!user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: newMessage,
      timestamp: new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'text'
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage('');
  };

  const handleLogoutLocal = () => {
    if (confirm('Сбросить все демо-данные и начать заново? Это действие нельзя отменить.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const result = await toggleTaskDB(taskId);

    if (result?.success && !task.completed && task.assignee_id) {
      addPoints(task.assignee_id, task.points);
    }
  };

  const getNextOccurrenceDate = (task: Task): string | undefined => {
    if (!task.recurringPattern) return undefined;

    const now = new Date();
    const { frequency, interval, daysOfWeek, endDate } = task.recurringPattern;

    if (endDate && new Date(endDate) < now) return undefined;

    const next = new Date(now);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + interval);
        break;
      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          const currentDay = next.getDay();
          const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
          const nextDay = sortedDays.find(d => d > currentDay) || sortedDays[0];
          const daysToAdd = nextDay > currentDay
            ? nextDay - currentDay
            : 7 - currentDay + nextDay;
          next.setDate(next.getDate() + daysToAdd);
        } else {
          next.setDate(next.getDate() + 7 * interval);
        }
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + interval);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + interval);
        break;
    }

    return next.toISOString().split('T')[0];
  };

  const getWorkloadColor = (workload: number) => {
    if (workload > 70) return 'text-red-600 bg-red-50 border-red-300';
    if (workload > 50) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    return 'text-green-600 bg-green-50 border-green-300';
  };

  const getAISuggestedMeals = () => {
    const allFavorites = familyMembers.flatMap(m => m.foodPreferences?.favorites || []);
    const favoriteCount = allFavorites.reduce((acc, food) => {
      acc[food] = (acc[food] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const topFavorites = Object.entries(favoriteCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return [
      {
        name: topFavorites[0]?.[0] || 'Пицца',
        reason: `Любимое блюдо ${topFavorites[0]?.[1] || 3} членов семьи`,
        icon: '\u{1F355}'
      },
      {
        name: topFavorites[1]?.[0] || 'Паста',
        reason: `Нравится ${topFavorites[1]?.[1] || 2} членам семьи`,
        icon: '\u{1F35D}'
      },
      {
        name: topFavorites[2]?.[0] || 'Салат',
        reason: `Популярно у ${topFavorites[2]?.[1] || 2} членов семьи`,
        icon: '\u{1F957}'
      }
    ];
  };

  const addShoppingItem = () => {
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      category: newItemCategory,
      quantity: newItemQuantity,
      priority: newItemPriority,
      bought: false,
      addedBy: currentUserId,
      addedByName: currentUser?.name || 'Неизвестно',
      addedAt: new Date().toISOString()
    };

    const updatedList = [...shoppingList, newItem];
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));

    setNewItemName('');
    setNewItemQuantity('');
    setNewItemPriority('normal');
    setShowAddItemDialog(false);
  };

  const toggleShoppingItem = (itemId: string) => {
    const updatedList = shoppingList.map(item =>
      item.id === itemId ? { ...item, bought: !item.bought } : item
    );
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
  };

  const deleteShoppingItem = (itemId: string) => {
    const updatedList = shoppingList.filter(item => item.id !== itemId);
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
  };

  const clearBoughtItems = () => {
    const updatedList = shoppingList.filter(item => !item.bought);
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('familyOrganizerLanguage', language);
    setShowLanguageSelector(false);

    const languageNames: Record<string, string> = {
      ru: 'Русский',
      en: 'English',
      es: 'Espa\u00f1ol',
      de: 'Deutsch',
      fr: 'Fran\u00e7ais',
      zh: '\u4e2d\u6587',
      ar: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629'
    };

    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white border-2 border-blue-500 rounded-lg shadow-2xl p-4 z-[100] animate-fade-in';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-2xl">\u{1F310}</div>
        <div>
          <p class="font-bold text-sm">Язык изменен</p>
          <p class="text-xs text-gray-600">Язык: ${languageNames[language]}</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      notification.style.transition = 'all 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  };

  const handleThemeChange = (theme: ThemeType) => {
    setCurrentTheme(theme);
    localStorage.setItem('familyOrganizerTheme', theme);
    setShowThemeSelector(false);

    const themeNames: Record<ThemeType, string> = {
      young: 'Молодёжный',
      middle: 'Деловой',
      senior: 'Комфортный',
      apple: 'Apple'
    };

    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white border-2 border-indigo-500 rounded-lg shadow-2xl p-4 z-[100] animate-fade-in';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-2xl">\u{1F3A8}</div>
        <div>
          <p class="font-bold text-sm">Тема изменена</p>
          <p class="text-xs text-gray-600">Стиль: ${themeNames[theme]}</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      notification.style.transition = 'all 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  };

  const handleFeedbackButton = (type: 'will_use' | 'not_interested') => {
    const stats = JSON.parse(localStorage.getItem('feedbackStats') || '{}');
    stats[type] = (stats[type] || 0) + 1;
    stats.timestamp = new Date().toISOString();
    localStorage.setItem('feedbackStats', JSON.stringify(stats));

    alert(type === 'will_use'
      ? '\u2705 Спасибо! Ваше мнение очень важно для нас!'
      : 'Спасибо за обратную связь! Мы будем работать над улучшением проекта.');
  };

  const exportStatsToCSV = () => {
    const stats = JSON.parse(localStorage.getItem('feedbackStats') || '{}');
    const willUse = stats.will_use || 0;
    const notInterested = stats.not_interested || 0;
    const total = willUse + notInterested;
    const willUsePercent = total > 0 ? ((willUse / total) * 100).toFixed(2) : '0';
    const notInterestedPercent = total > 0 ? ((notInterested / total) * 100).toFixed(2) : '0';
    const timestamp = stats.timestamp || new Date().toISOString();

    const csvContent = [
      ['Семейный Органайзер - Статистика обратной связи'],
      ['Дата экспорта:', new Date().toLocaleString('ru-RU')],
      ['Последнее обновление:', new Date(timestamp).toLocaleString('ru-RU')],
      [''],
      ['Тип отзыва', 'Количество', 'Процент'],
      ['Буду использовать', willUse.toString(), willUsePercent + '%'],
      ['Не интересно', notInterested.toString(), notInterestedPercent + '%'],
      ['Всего откликов', total.toString(), '100%'],
      [''],
      ['Детальная информация:'],
      ['Положительных откликов:', willUse.toString()],
      ['Отрицательных откликов:', notInterested.toString()],
      ['Процент заинтересованности:', willUsePercent + '%'],
      ['Процент незаинтересованности:', notInterestedPercent + '%']
    ]
      .map(row => row.join(','))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `family-organizer-stats-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white border-2 border-green-500 rounded-lg shadow-2xl p-4 z-[100] animate-fade-in';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-2xl">\u2705</div>
        <div>
          <p class="font-bold text-sm">Статистика экспортирована</p>
          <p class="text-xs text-gray-600">Файл CSV сохранён</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      notification.style.transition = 'all 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const toggleAutoHide = () => {
    const newValue = !autoHideTopBar;
    setAutoHideTopBar(newValue);
    localStorage.setItem('autoHideTopBar', String(newValue));
  };

  const toggleLeftMenuAutoHide = () => {
    const newValue = !autoHideLeftMenu;
    setAutoHideLeftMenu(newValue);
    localStorage.setItem('autoHideLeftMenu', String(newValue));
  };

  const handleBottomBarSectionsChange = (sections: string[]) => {
    setBottomBarSections(sections);
    localStorage.setItem('bottomBarSections', JSON.stringify(sections));
  };

  const handleLeftPanelSectionsChange = (sections: string[]) => {
    setLeftPanelSections(sections);
    localStorage.setItem('leftPanelSections', JSON.stringify(sections));
  };

  const handleTopPanelSectionsChange = (sections: string[]) => {
    setTopPanelSections(sections);
    localStorage.setItem('topPanelSections', JSON.stringify(sections));
  };

  const handleAutoHideBottomBarChange = (value: boolean) => {
    setAutoHideBottomBar(value);
    localStorage.setItem('autoHideBottomBar', String(value));
  };

  const isWidgetEnabled = (widgetId: string) => {
    if (!widgetSettings) return true;
    const widget = widgetSettings.find((w: WidgetConfig) => w.id === widgetId);
    return widget ? widget.enabled : true;
  };

  const handleWidgetSettingsSave = (settings: WidgetConfig[]) => {
    setWidgetSettings(settings);
    localStorage.setItem('widgetSettings', JSON.stringify(settings));
  };

  const handleDevSectionVote = async (sectionId: string, voteType: 'up' | 'down', withComment = false) => {
    if (withComment) {
      setPendingVote({ sectionId, voteType });
      setShowCommentDialog(true);
      return;
    }

    const result = await castDevVote(sectionId, voteType);
    if (!result.success) {
      alert('\u274c Ошибка голосования: ' + result.error);
    }
  };

  const handleSubmitVoteWithComment = async () => {
    if (!pendingVote) return;

    const result = await castDevVote(pendingVote.sectionId, pendingVote.voteType, voteComment.trim() || undefined);

    if (result.success) {
      alert('\u2705 Голос учтён! Спасибо за ваш отзыв.');
      setShowCommentDialog(false);
      setVoteComment('');
      setPendingVote(null);
    } else {
      alert('\u274c Ошибка: ' + result.error);
    }
  };

  const getDevSectionVotes = (sectionId: string) => {
    return devSectionVotes[sectionId] || { up: 0, down: 0 };
  };

  return {
    handleSendMessage,
    handleLogout,
    handleLogoutLocal,
    toggleTask,
    getNextOccurrenceDate,
    addPoints,
    getWorkloadColor,
    getMemberById,
    getAISuggestedMeals,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    clearBoughtItems,
    handleDevSectionVote,
    handleSubmitVoteWithComment,
    getDevSectionVotes,
    handleLanguageChange,
    handleThemeChange,
    handleFeedbackButton,
    exportStatsToCSV,
    toggleAutoHide,
    toggleLeftMenuAutoHide,
    handleBottomBarSectionsChange,
    handleLeftPanelSectionsChange,
    handleTopPanelSectionsChange,
    handleAutoHideBottomBarChange,
    isWidgetEnabled,
    handleWidgetSettingsSave,
  };
}
