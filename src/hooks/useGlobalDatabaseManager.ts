/**
 * useGlobalDatabaseManager.ts
 * Global singleton database manager to prevent multiple simultaneous IndexedDB connections
 * and resolve upgrade blocking issues in health tools and other components.
 */

import { useIndexedDBManager } from './useIndexedDBManager';

// Configuration complète de la base de données pour tous les outils
const APP_DATABASE_CONFIG = {
  dbName: 'ToolsAppDatabase',
  version: 155,
  stores: [
    // Productivité
    {
      name: 'productivity-tasks',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' },
        { name: 'keywords', keyPath: 'keywords', multiEntry: true }
      ]
    },
    {
      name: 'productivity-goals',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' },
        { name: 'status', keyPath: 'status' }
      ]
    },
    {
      name: 'productivity-notes',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' },
        { name: 'backgroundColor', keyPath: 'backgroundColor' }
      ]
    },
    {
      name: 'productivity-pomodoro',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' },
        { name: 'preset', keyPath: 'preset' }
      ]
    },
    // Générateurs et Utilitaires
    {
      name: 'password-generator-advanced',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' }
      ]
    },
    {
      name: 'calculator-history',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' }
      ]
    },
    {
      name: 'qr-generator-history',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' }
      ]
    },
    {
      name: 'unit-converter-history',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' }
      ]
    },
    {
      name: 'date-calculator-history',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' }
      ]
    },
    {
      name: 'text-utils-advanced',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' }
      ]
    },
    {
      name: 'health-wellness-suite',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' }
      ]
    },
    // Créativité
    {
      name: 'creativity-logos',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' }
      ]
    },
    {
      name: 'creativity-colors',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' }
      ]
    },
    {
      name: 'creativity-gradients',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' }
      ]
    },
    {
      name: 'creativity-patterns',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' }
      ]
    },
    {
      name: 'user-preferences',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'category', keyPath: 'category' }
      ]
    },
    {
      name: 'export-history',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'type', keyPath: 'type' }
      ]
    },
    {
      name: 'events-planner',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'tool', keyPath: 'tool' }
      ]
    }
  ]
};

// Global singleton instance
let globalDatabaseInstance: ReturnType<typeof useIndexedDBManager> | null = null;
let initializationPromise: Promise<ReturnType<typeof useIndexedDBManager>> | null = null;
let isInitializing = false;

// Connection queue to handle multiple simultaneous requests
interface QueuedOperation {
  id: string;
  operation: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

let operationQueue: QueuedOperation[] = [];
let isProcessingQueue = false;

// Debounce mechanism for rapid operations
const debouncedOperations = new Map<string, NodeJS.Timeout>();

// Debounce mechanism to prevent rapid successive operations
let debounceTimers: Map<string, NodeJS.Timeout> = new Map();
const DEBOUNCE_DELAY = 100; // 100ms debounce delay

/**
 * Debounce utility function to prevent rapid successive database operations
 * @param key - Unique key for the operation type
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds (default: 100ms)
 */
const debounce = <T extends (...args: any[]) => any>(
  key: string,
  fn: T,
  delay: number = DEBOUNCE_DELAY
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      // Clear existing timer for this key
      const existingTimer = debounceTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timer = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          debounceTimers.delete(key);
        }
      }, delay);

      debounceTimers.set(key, timer);
    });
  };
};

/**
 * Process the operation queue sequentially to prevent concurrent database access
 */
const processQueue = async () => {
  if (isProcessingQueue || operationQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (operationQueue.length > 0) {
    const operation = operationQueue.shift();
    if (!operation) continue;

    try {
      const result = await operation.operation();
      operation.resolve(result);
    } catch (error) {
      console.error(`❌ Queued operation ${operation.id} failed:`, error);
      operation.reject(error);
    }

    // Small delay between operations to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  isProcessingQueue = false;
};

/**
 * Add an operation to the queue with debouncing
 */
const queueOperation = <T>(operationId: string, operation: () => Promise<T>, debounceMs = 100): Promise<T> => {
  return new Promise((resolve, reject) => {
    // Clear existing debounced operation if any
    const existingTimeout = debouncedOperations.get(operationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Debounce the operation
    const timeout = setTimeout(() => {
      debouncedOperations.delete(operationId);
      
      const queuedOp: QueuedOperation = {
        id: operationId,
        operation,
        resolve,
        reject,
        timestamp: Date.now()
      };

      operationQueue.push(queuedOp);
      processQueue();
    }, debounceMs);

    debouncedOperations.set(operationId, timeout);
  });
};

// Enhanced recovery mechanism with exponential backoff
const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY = 1000; // 1 second base delay
let retryAttempts = 0;

/**
 * Enhanced retry mechanism with exponential backoff for blocked database states
 * @param attempt - Current retry attempt number
 * @returns Promise that resolves after the calculated delay
 */
const waitWithExponentialBackoff = (attempt: number): Promise<void> => {
  const delay = BASE_RETRY_DELAY * Math.pow(2, attempt); // Exponential backoff
  console.log(`⏳ Waiting ${delay}ms before retry attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS}`);
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Initialize the global database instance with enhanced error handling,
 * connection management, and improved recovery mechanism to prevent upgrade blocking issues.
 */
const initializeGlobalDatabase = async (): Promise<ReturnType<typeof useIndexedDBManager>> => {
  if (globalDatabaseInstance) {
    return globalDatabaseInstance;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  if (isInitializing) {
    // Wait for initialization to complete with timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Database initialization timeout'));
      }, 30000); // 30 second timeout

      const checkInterval = setInterval(() => {
        if (!isInitializing && globalDatabaseInstance) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve(globalDatabaseInstance);
        } else if (!isInitializing && !globalDatabaseInstance) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          reject(new Error('Database initialization failed'));
        }
      }, 100);
    });
  }

  isInitializing = true;
  retryAttempts = 0;

  const attemptInitialization = async (): Promise<ReturnType<typeof useIndexedDBManager>> => {
    try {
      console.log('🔧 Initializing global database instance...');
      
      // Create the database manager instance
      const dbManager = useIndexedDBManager(APP_DATABASE_CONFIG);
      
      retryAttempts = 0; // Reset on success
      return dbManager;
    } catch (error: any) {
      console.error(`Database initialization attempt ${retryAttempts + 1} failed:`, error);
      
      // Check if this is a blocking error that we can recover from
      if (error.name === 'BlockedError' || error.message?.includes('blocked')) {
        if (retryAttempts < MAX_RETRY_ATTEMPTS) {
          retryAttempts++;
          console.log(`🔄 Attempting recovery from blocked state (attempt ${retryAttempts}/${MAX_RETRY_ATTEMPTS})`);
          
          // Reset global state
          if (globalDatabaseInstance) {
            globalDatabaseInstance = null;
          }
          
          // Wait with exponential backoff before retry
          await waitWithExponentialBackoff(retryAttempts - 1);
          
          // Recursive retry
          return attemptInitialization();
        } else {
          console.error('❌ Maximum retry attempts reached. Database initialization failed permanently.');
          throw new Error(`Database blocked after ${MAX_RETRY_ATTEMPTS} attempts. Please refresh the page.`);
        }
      }
      
      // For non-blocking errors, throw immediately
      throw error;
    }
  };

  initializationPromise = new Promise(async (resolve, reject) => {
    try {
      const dbManager = await attemptInitialization();
      globalDatabaseInstance = dbManager;
      isInitializing = false;
      
      console.log('✅ Global database instance initialized successfully');
      resolve(dbManager);
    } catch (error) {
      isInitializing = false;
      initializationPromise = null;
      globalDatabaseInstance = null; // Reset on failure
      console.error('❌ Failed to initialize global database instance:', error);
      reject(error);
    }
  });

  return initializationPromise;
};

/**
 * Global database manager hook that provides a singleton database instance
 * with connection queuing and debouncing to prevent upgrade blocking issues
 */
export const useGlobalDatabaseManager = () => {
  // Create debounced versions of core operations
  const debouncedSaveData = debounce('saveData', async (tool: string, key: string, data: any): Promise<boolean> => {
    const db = await initializeGlobalDatabase();
    return db.saveData(tool, key, data);
  });

  const debouncedLoadData = debounce('loadData', async (tool: string, key: string): Promise<any | null> => {
    const db = await initializeGlobalDatabase();
    return db.loadData(tool, key);
  });

  const debouncedDeleteData = debounce('deleteData', async (tool: string, key: string): Promise<boolean> => {
    const db = await initializeGlobalDatabase();
    return db.deleteData(tool, key);
  });

  // Return a wrapper that uses the global instance with queuing and debouncing
  return {
    saveData: async (tool: string, key: string, data: any): Promise<boolean> => {
      const operationId = `save-${tool}-${key}-${Date.now()}`;
      return queueOperation(operationId, () => debouncedSaveData(tool, key, data));
    },

    loadData: async (tool: string, key: string): Promise<any | null> => {
      const operationId = `load-${tool}-${key}`;
      return queueOperation(operationId, () => debouncedLoadData(tool, key), 50); // Shorter debounce for read operations
    },

    deleteData: async (tool: string, key: string): Promise<boolean> => {
      const operationId = `delete-${tool}-${key}-${Date.now()}`;
      return queueOperation(operationId, () => debouncedDeleteData(tool, key));
    },

    getAllKeys: async (tool: string): Promise<string[]> => {
      const operationId = `getAllKeys-${tool}`;
      return queueOperation(operationId, async () => {
        const db = await initializeGlobalDatabase();
        return db.getAllKeys(tool);
      }, 50);
    },

    exportAllData: async (): Promise<Record<string, any>> => {
      const operationId = `exportAllData-${Date.now()}`;
      return queueOperation(operationId, async () => {
        const db = await initializeGlobalDatabase();
        return db.exportAllData();
      });
    },

    clearAllData: async (): Promise<boolean> => {
      const operationId = `clearAllData-${Date.now()}`;
      return queueOperation(operationId, async () => {
        const db = await initializeGlobalDatabase();
        return db.clearAllData();
      });
    },

    getStorageInfo: async (): Promise<{ estimatedSize: number; quota: number }> => {
      const operationId = `getStorageInfo`;
      return queueOperation(operationId, async () => {
        const db = await initializeGlobalDatabase();
        return db.getStorageInfo();
      }, 200);
    },

    retryConnection: async (): Promise<boolean> => {
      const operationId = `retryConnection-${Date.now()}`;
      return queueOperation(operationId, async () => {
        const db = await initializeGlobalDatabase();
        return db.retryConnection();
      });
    },

    getErrorState: () => {
      if (globalDatabaseInstance) {
        return globalDatabaseInstance.getErrorState();
      }
      return {
        isBlocked: false,
        lastError: null,
        retryCount: 0,
        hasMultipleTabs: false
      };
    },

    clearErrorState: () => {
      if (globalDatabaseInstance) {
        globalDatabaseInstance.clearErrorState();
      }
    },

    isInitialized: true,
    isLoading: isInitializing
  };
};

/**
 * Reset the global database instance (for testing or recovery purposes)
 */
export const resetGlobalDatabase = () => {
  globalDatabaseInstance = null;
  initializationPromise = null;
  isInitializing = false;
  operationQueue = [];
  isProcessingQueue = false;
  debouncedOperations.clear();
  console.log('🔄 Global database instance reset');
};