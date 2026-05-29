import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const TREE_LINK_API = 'https://functions.poehali.dev/1c2b8fba-a386-476a-a78e-dd0d78f1aa61';

type Screen = 'welcome' | 'relation' | 'link-to-whom' | 'tree-action' | 'done';

const RELATION_OPTIONS = [
  { value: 'parent',    label: 'Родитель',           icon: '👩‍👦' },
  { value: 'spouse',    label: 'Супруг / супруга',   icon: '💑' },
  { value: 'child',     label: 'Сын / дочь',         icon: '👶' },
  { value: 'sibling',   label: 'Брат / сестра',      icon: '🤝' },
  { value: 'grandp',   label: 'Бабушка / дедушка',  icon: '👴' },
  { value: 'grandch',  label: 'Внук / внучка',       icon: '🧒' },
  { value: 'other',    label: 'Другой родственник',  icon: '👥' },
  { value: 'skip',     label: 'Настрою позже',       icon: '⏭️' },
];

const TREE_ACTION_OPTIONS = [
  { value: 'link',   label: 'Я есть в древе — свяжите меня',  icon: 'Link',       desc: 'Если кто-то уже добавил вас вручную' },
  { value: 'create', label: 'Создайте новую запись обо мне',  icon: 'UserPlus',   desc: 'Если вас ещё нет в древе' },
  { value: 'later',  label: 'Пропустить пока',                icon: 'Clock',      desc: 'Настроите в разделе «Семейное древо»' },
];

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current ? 'w-2 h-2 bg-violet-500' :
            i === current ? 'w-3 h-3 bg-violet-600' :
            'w-2 h-2 bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function InviteOnboarding() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [relation, setRelation] = useState('');
  const [treeAction, setTreeAction] = useState('');
  const [familyName, setFamilyName] = useState('вашей семье');

  useEffect(() => {
    const name = localStorage.getItem('joined_family_name');
    if (name) setFamilyName(name);

    // Если попали сюда не через инвайт — сразу на главную
    const viaInvite = localStorage.getItem('joined_via_invite');
    if (!viaInvite) navigate('/', { replace: true });
  }, [navigate]);

  const screenIndex: Record<Screen, number> = {
    welcome: 0, relation: 1, 'link-to-whom': 2, 'tree-action': 3, done: 4,
  };

  const handleFinish = async () => {
    localStorage.setItem('invite_onboarding_completed', 'true');
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.removeItem('joined_via_invite');

    // POST заявки на привязку в backend (если не «пропустить»)
    if (relation && relation !== 'skip' && treeAction && treeAction !== 'later') {
      try {
        const token = localStorage.getItem('authToken') || '';
        await fetch(`${TREE_LINK_API}?action=create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
          body: JSON.stringify({
            action: 'create',
            requested_role: relation,
            action_type: treeAction === 'link' ? 'link_existing' : 'create_new_person',
          }),
        });
      } catch { /* не блокируем переход */ }
    }

    navigate('/', { replace: true });
  };

  const handleSkipAll = () => {
    localStorage.setItem('invite_onboarding_completed', 'true');
    localStorage.setItem('tree_link_status', 'tree_link_pending');
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.removeItem('joined_via_invite');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col">

      {/* Хедер */}
      <div className="flex items-center justify-between px-4 py-4 max-w-lg mx-auto w-full">
        <ProgressDots current={screenIndex[screen]} total={5} />
        <button
          onClick={handleSkipAll}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Пропустить всё
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="max-w-sm w-full">

          {/* Экран 1: Добро пожаловать */}
          {screen === 'welcome' && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <Icon name="Home" size={36} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Добро пожаловать!
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Вы присоединились к семье <span className="font-semibold text-violet-700">«{familyName}»</span>.
                  Теперь у вас есть доступ к семейному пространству.
                </p>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-left space-y-2">
                <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Что дальше?</p>
                <p className="text-sm text-gray-600">
                  Чтобы связать ваш профиль с семейным древом, ответьте на пару вопросов. Это займёт минуту.
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => setScreen('relation')}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white"
                >
                  Продолжить
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
                <button
                  onClick={handleSkipAll}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
                >
                  Настроить позже
                </button>
              </div>
            </div>
          )}

          {/* Экран 2: Кем приходитесь */}
          {screen === 'relation' && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Кем вы приходитесь семье?</h2>
                <p className="text-sm text-gray-500">Это поможет правильно разместить вас в древе</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {RELATION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setRelation(opt.value)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      relation === opt.value
                        ? 'border-violet-500 bg-violet-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50/50'
                    }`}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span className="text-sm font-medium text-gray-800 leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setScreen('welcome')} className="flex-1">
                  <Icon name="ArrowLeft" size={15} className="mr-1" /> Назад
                </Button>
                <Button
                  onClick={() => setScreen('link-to-whom')}
                  disabled={!relation}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40"
                >
                  Далее <Icon name="ArrowRight" size={15} className="ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Экран 3: С кем связать */}
          {screen === 'link-to-whom' && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">С кем вас связать в семье?</h2>
                <p className="text-sm text-gray-500">Это сохранится как черновик — владелец семьи сможет уточнить</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <Icon name="Info" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  Точная привязка к конкретному человеку выполняется в разделе «Семейное древо». Сейчас просто сохраним ваш запрос.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ваш запрос на привязку</p>
                <p className="text-sm text-gray-700">
                  Роль: <span className="font-medium text-violet-700">
                    {RELATION_OPTIONS.find(r => r.value === relation)?.label || '—'}
                  </span>
                </p>
                <p className="text-sm text-gray-500">Семья: <span className="font-medium">{familyName}</span></p>
                <p className="text-xs text-gray-400 mt-2">Статус: ожидает подтверждения в древе</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setScreen('relation')} className="flex-1">
                  <Icon name="ArrowLeft" size={15} className="mr-1" /> Назад
                </Button>
                <Button
                  onClick={() => setScreen('tree-action')}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Далее <Icon name="ArrowRight" size={15} className="ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Экран 4: Действие с древом */}
          {screen === 'tree-action' && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Как поступить с древом?</h2>
                <p className="text-sm text-gray-500">Выберите вариант — владелец семьи подтвердит</p>
              </div>
              <div className="space-y-2">
                {TREE_ACTION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTreeAction(opt.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      treeAction === opt.value
                        ? 'border-violet-500 bg-violet-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50/50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      treeAction === opt.value ? 'bg-violet-100' : 'bg-gray-100'
                    }`}>
                      <Icon name={opt.icon as 'Link'} size={18} className={
                        treeAction === opt.value ? 'text-violet-600' : 'text-gray-500'
                      } />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setScreen('link-to-whom')} className="flex-1">
                  <Icon name="ArrowLeft" size={15} className="mr-1" /> Назад
                </Button>
                <Button
                  onClick={() => setScreen('done')}
                  disabled={!treeAction}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40"
                >
                  Далее <Icon name="ArrowRight" size={15} className="ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Экран 5: Готово */}
          {screen === 'done' && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <Icon name="CheckCircle" size={36} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Готово!</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Вы присоединились к семье <span className="font-semibold text-violet-700">«{familyName}»</span>.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={14} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Присоединился к семье</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name={treeAction === 'later' || !treeAction ? 'Clock' : 'CheckCircle'} size={14}
                    className={`flex-shrink-0 ${treeAction === 'later' || !treeAction ? 'text-amber-400' : 'text-emerald-500'}`}
                  />
                  <span className="text-sm text-gray-700">
                    Связь с древом — {treeAction === 'later' || !treeAction ? 'ожидает привязки' : 'запрос отправлен'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Завершить привязку к древу можно в любое время в разделе «Семейное древо».
              </p>
              <Button
                onClick={handleFinish}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white"
              >
                Перейти в семью
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}