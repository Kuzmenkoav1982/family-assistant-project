import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface DialogLockContextType {
  isDialogOpen: boolean;
  lockUpdates: () => void;
  unlockUpdates: () => void;
}

export const DialogLockContext = createContext<DialogLockContextType | undefined>(undefined);

export function DialogLockProvider({ children }: { children: ReactNode }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const lockUpdates = useCallback(() => {
    console.log('[DialogLock] LOCKING all updates');
    setIsDialogOpen(true);
  }, []);

  const unlockUpdates = useCallback(() => {
    console.log('[DialogLock] UNLOCKING updates');
    setIsDialogOpen(false);
  }, []);

  return (
    <DialogLockContext.Provider value={{ isDialogOpen, lockUpdates, unlockUpdates }}>
      {children}
    </DialogLockContext.Provider>
  );
}

export function useDialogLock() {
  const context = useContext(DialogLockContext);
  if (!context) {
    throw new Error('useDialogLock must be used within DialogLockProvider');
  }
  return context;
}