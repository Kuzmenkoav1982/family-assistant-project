import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { blogApi } from '@/lib/blogApi';

const STORAGE_KEY = 'blog_cover_job_v1';

export interface CoverJobItem {
  id: number;
  title: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  url?: string;
  error?: string;
}

export interface CoverJobState {
  active: boolean;
  startedAt: number;
  items: CoverJobItem[];
}

interface BlogCoverJobContextType {
  job: CoverJobState | null;
  startJob: () => Promise<void>;
  cancelJob: () => void;
  progress: { done: number; total: number; processing: number; failed: number };
}

const Ctx = createContext<BlogCoverJobContextType | null>(null);

function loadJob(): CoverJobState | null {
  // SSR-safe: на prerender нет localStorage — возвращаем null.
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CoverJobState;
  } catch {
    return null;
  }
}

function saveJob(state: CoverJobState | null) {
  if (typeof localStorage === 'undefined') return;
  try {
    if (state === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore quota / serialization errors
  }
}

export function BlogCoverJobProvider({ children }: { children: ReactNode }) {
  const [job, setJob] = useState<CoverJobState | null>(() => loadJob());
  const workerRunning = useRef(false);

  const updateJob = useCallback((updater: (prev: CoverJobState) => CoverJobState) => {
    setJob(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      saveJob(next);
      return next;
    });
  }, []);

  const cancelJob = useCallback(() => {
    workerRunning.current = false;
    setJob(null);
    saveJob(null);
    toast.info('Генерация обложек остановлена');
  }, []);

  const runWorker = useCallback(async () => {
    if (workerRunning.current) return;
    workerRunning.current = true;

    try {
      while (workerRunning.current) {
        const current = loadJob();
        if (!current || !current.active) break;

        const next = current.items.find(i => i.status === 'pending');
        if (!next) {
          updateJob(prev => ({ ...prev, active: false }));
          const finalState = loadJob();
          const success = finalState?.items.filter(i => i.status === 'done').length ?? 0;
          const failed = finalState?.items.filter(i => i.status === 'error').length ?? 0;
          toast.success(`Генерация обложек завершена: ${success} готово, ${failed} с ошибками`);
          break;
        }

        updateJob(prev => ({
          ...prev,
          items: prev.items.map(i => i.id === next.id ? { ...i, status: 'processing' } : i),
        }));

        try {
          const result = await blogApi.admin.generateCover(next.id);
          updateJob(prev => ({
            ...prev,
            items: prev.items.map(i =>
              i.id === next.id
                ? {
                    ...i,
                    status: result.ok ? 'done' : 'error',
                    url: result.url,
                    error: result.error,
                  }
                : i,
            ),
          }));
        } catch (e) {
          updateJob(prev => ({
            ...prev,
            items: prev.items.map(i =>
              i.id === next.id
                ? { ...i, status: 'error', error: (e as Error).message }
                : i,
            ),
          }));
        }
      }
    } finally {
      workerRunning.current = false;
    }
  }, [updateJob]);

  useEffect(() => {
    const stored = loadJob();
    if (stored && stored.active && !workerRunning.current) {
      runWorker();
    }
  }, [runWorker]);

  const startJob = useCallback(async () => {
    if (job?.active) {
      toast.info('Генерация уже запущена');
      return;
    }
    try {
      const data = await blogApi.admin.pendingCovers();
      if (!data.posts || data.posts.length === 0) {
        toast.info('Нет постов без обложек');
        return;
      }
      const newJob: CoverJobState = {
        active: true,
        startedAt: Date.now(),
        items: data.posts.map(p => ({
          id: p.id,
          title: p.title,
          status: 'pending' as const,
        })),
      };
      saveJob(newJob);
      setJob(newJob);
      toast.success(`Запущена генерация ${data.posts.length} обложек в фоне`);
      runWorker();
    } catch (e) {
      toast.error(`Ошибка запуска: ${(e as Error).message}`);
    }
  }, [job?.active, runWorker]);

  const progress = {
    total: job?.items.length ?? 0,
    done: job?.items.filter(i => i.status === 'done').length ?? 0,
    processing: job?.items.filter(i => i.status === 'processing').length ?? 0,
    failed: job?.items.filter(i => i.status === 'error').length ?? 0,
  };

  return (
    <Ctx.Provider value={{ job, startJob, cancelJob, progress }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBlogCoverJob() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBlogCoverJob must be used inside BlogCoverJobProvider');
  return ctx;
}