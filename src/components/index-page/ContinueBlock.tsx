import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useRecentHubs } from '@/hooks/useRecentHubs';

const formatTimeAgo = (ts: number): string => {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'вчера';
  return `${days} дн назад`;
};

const ContinueBlock = () => {
  const navigate = useNavigate();
  const hubs = useRecentHubs();

  if (hubs.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-900 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
          <Icon name="History" size={14} className="text-cyan-600" />
        </div>
        <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
          Продолжить
        </h3>
        <span className="ml-auto text-[11px] text-gray-400 dark:text-gray-500">
          где вы были
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {hubs.map((hub) => (
          <button
            key={hub.path}
            onClick={() => navigate(hub.path)}
            className="text-left p-3 rounded-xl border bg-gray-50/50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center mb-2 border">
              <Icon name={hub.icon} fallback="Circle" size={15} className={hub.iconColor} />
            </div>
            <div className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">
              {hub.title}
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              {formatTimeAgo(hub.visitedAt)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContinueBlock;
