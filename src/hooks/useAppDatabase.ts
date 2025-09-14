
/**
 * useAppDatabase.ts
 * Updated to use the global database manager singleton to prevent
 * multiple simultaneous IndexedDB connections and upgrade blocking issues.
 */

import { useGlobalDatabaseManager } from './useGlobalDatabaseManager';

/**
 * Hook that provides access to the application's IndexedDB database
 * using a global singleton pattern to prevent connection conflicts.
 * 
 * This replaces the previous implementation that created multiple
 * database instances, which caused upgrade blocking issues.
 */
export const useAppDatabase = () => {
  return useGlobalDatabaseManager();
};
