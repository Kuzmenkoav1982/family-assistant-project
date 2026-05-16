/**
 * Тонкий хук-обёртка над FamilyTraditionsContext.
 *
 * Вся бизнес-логика (fetch, migration, debounce-sync) живёт
 * ЕДИНОЖДЫ в FamilyTraditionsProvider. Хук только читает контекст.
 *
 * Использование:
 *   const { traditions, loading, persistTraditions } = useFamilyTraditions();
 *
 * Требование: компонент должен быть внутри <FamilyTraditionsProvider>.
 */
import { useContext } from 'react';
import {
  FamilyTraditionsContext,
  type FamilyTraditionsContextValue,
} from '@/contexts/FamilyTraditionsContext';

export type { FamilyTraditionsContextValue as UseFamilyTraditionsResult };

export function useFamilyTraditions(): FamilyTraditionsContextValue {
  const ctx = useContext(FamilyTraditionsContext);
  if (!ctx) {
    throw new Error(
      'useFamilyTraditions() вызван вне <FamilyTraditionsProvider>. ' +
        'Оберни ближайшего общего предка компонентов в <FamilyTraditionsProvider>.',
    );
  }
  return ctx;
}
