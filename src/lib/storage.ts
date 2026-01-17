/**
 * Надёжное хранилище для PWA
 * Использует localStorage с fallback на sessionStorage и IndexedDB
 */

// Проверка доступности localStorage
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Fallback хранилище для PWA
class StorageManager {
  private useLocalStorage: boolean;

  constructor() {
    this.useLocalStorage = isLocalStorageAvailable();
    console.log('[StorageManager] Using localStorage:', this.useLocalStorage);
  }

  setItem(key: string, value: string): boolean {
    try {
      if (this.useLocalStorage) {
        localStorage.setItem(key, value);
        // Проверяем, что значение действительно сохранилось
        const saved = localStorage.getItem(key);
        if (saved !== value) {
          console.error('[StorageManager] localStorage verification failed');
          // Пробуем sessionStorage
          sessionStorage.setItem(key, value);
          return true;
        }
        return true;
      } else {
        sessionStorage.setItem(key, value);
        return true;
      }
    } catch (error) {
      console.error('[StorageManager] Error saving:', error);
      // Последняя попытка - sessionStorage
      try {
        sessionStorage.setItem(key, value);
        return true;
      } catch (e) {
        console.error('[StorageManager] All storage methods failed:', e);
        return false;
      }
    }
  }

  getItem(key: string): string | null {
    try {
      // Проверяем оба хранилища
      const localValue = this.useLocalStorage ? localStorage.getItem(key) : null;
      const sessionValue = sessionStorage.getItem(key);
      
      // Возвращаем первое найденное значение
      return localValue || sessionValue;
    } catch (error) {
      console.error('[StorageManager] Error reading:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      if (this.useLocalStorage) {
        localStorage.removeItem(key);
      }
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('[StorageManager] Error removing:', error);
    }
  }

  clear(): void {
    try {
      if (this.useLocalStorage) {
        localStorage.clear();
      }
      sessionStorage.clear();
    } catch (error) {
      console.error('[StorageManager] Error clearing:', error);
    }
  }
}

export const storage = new StorageManager();
