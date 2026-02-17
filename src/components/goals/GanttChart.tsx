import type { FamilyGoal } from '@/types/family.types';

interface GanttChartProps {
  goal: FamilyGoal;
}

export function GanttChart({ goal }: GanttChartProps) {
  const startDateStr = goal.startDate || goal.createdAt || new Date().toISOString();
  const targetDateStr = goal.targetDate || goal.deadline || new Date().toISOString();
  const checkpoints = goal.checkpoints || [];

  const calculateDuration = (start: string, target: string) => {
    const s = new Date(start);
    const t = new Date(target);
    const diff = t.getTime() - s.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
  };

  const totalDays = calculateDuration(startDateStr, targetDateStr);
  const now = new Date();
  const startDate = new Date(startDateStr);
  const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{new Date(startDateStr).toLocaleDateString('ru-RU')}</span>
        <span>{new Date(targetDateStr).toLocaleDateString('ru-RU')}</span>
      </div>
      
      <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-200 to-blue-300 transition-all"
          style={{ width: `${Math.min((daysPassed / totalDays) * 100, 100)}%` }}
        />
        
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 transition-all"
          style={{ width: `${goal.progress || 0}%` }}
        />
        
        {checkpoints.map((checkpoint) => {
          const checkpointDate = new Date(checkpoint.dueDate);
          const checkpointDays = Math.ceil((checkpointDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const position = Math.min((checkpointDays / totalDays) * 100, 100);
          
          return (
            <div
              key={checkpoint.id}
              className="absolute top-0 bottom-0 w-1 cursor-pointer group"
              style={{ left: `${position}%` }}
              title={checkpoint.title}
            >
              <div className={`h-full ${checkpoint.completed ? 'bg-green-600' : 'bg-orange-400'}`} />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <div className="bg-black text-white text-xs px-2 py-1 rounded">
                  {checkpoint.title}
                </div>
              </div>
            </div>
          );
        })}
        
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500"
          style={{ left: `${Math.min((daysPassed / totalDays) * 100, 100)}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700 drop-shadow-sm">
            {goal.progress || 0}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded" />
          <span className="text-gray-600">Прошедшее время</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded" />
          <span className="text-gray-600">Прогресс</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-gray-600">Сегодня</span>
        </div>
      </div>
    </div>
  );
}
