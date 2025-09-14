
interface DatabaseConfig {
  dbName: string;
  version: number;
  stores: Array<{
    name: string;
    keyPath: string;
    indexes?: Array<{
      name: string;
      keyPath: string;
      unique?: boolean;
    }>;
  }>;
}

interface StoredItem {
  id: string;
  tool: string;
  data: any;
  timestamp: number;
  lastModified: string;
}

interface IndexedDBError {
  type: 'blocked' | 'version_error' | 'quota_exceeded' | 'unknown';
  message: string;
  retryable: boolean;
}

// Global state to track IndexedDB issues
let globalDBState = {
  isBlocked: false,
  lastError: null as IndexedDBError | null,
  retryCount: 0
};

// Event dispatcher for IndexedDB errors
const dispatchIndexedDBError = (error: IndexedDBError) => {
  const event = new CustomEvent('indexeddb-error', {
    detail: error
  });
  window.dispatchEvent(event);
};

// Event dispatcher for IndexedDB recovery
const dispatchIndexedDBRecovery = () => {
  const event = new CustomEvent('indexeddb-recovery');
  window.dispatchEvent(event);
};

export const useIndexedDBManager = (config: DatabaseConfig) => {
  // Utility function to detect multiple tabs
  const detectMultipleTabs = (): boolean => {
    try {
      const tabId = Date.now().toString();
      const storageKey = `indexeddb_tab_${config.dbName}`;
      
      // Store our tab ID
      sessionStorage.setItem(storageKey, tabId);
      
      // Check if other tabs are using the same DB
      const allTabs = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(`indexeddb_tab_${config.dbName}`)) {
          allTabs.push(sessionStorage.getItem(key));
        }
      }
      
      return allTabs.length > 1;
    } catch (error) {
      console.warn('Could not detect multiple tabs:', error);
      return false;
    }
  };

  // Function to create user-friendly error messages
  const createErrorMessage = (error: any): IndexedDBError => {
    if (error?.name === 'QuotaExceededError') {
      return {
        type: 'quota_exceeded',
        message: 'Storage quota exceeded. Please free up some space.',
        retryable: false
      };
    }
    
    if (error?.name === 'VersionError') {
      return {
        type: 'version_error',
        message: 'Database version conflict detected.',
        retryable: true
      };
    }
    
    if (globalDBState.isBlocked) {
      const multipleTabs = detectMultipleTabs();
      return {
        type: 'blocked',
        message: multipleTabs 
          ? 'Database upgrade blocked by other tabs. Please close other tabs and try again.'
          : 'Database upgrade blocked. Attempting automatic recovery...',
        retryable: true
      };
    }
    
    return {
      type: 'unknown',
      message: error?.message || 'Unknown database error occurred.',
      retryable: true
    };
  };

  // Function to get the current database version
  const getCurrentDBVersion = async (): Promise<number> => {
    return new Promise((resolve) => {
      const request = indexedDB.open(config.dbName);
      request.onsuccess = () => {
        const db = request.result;
        const currentVersion = db.version;
        db.close();
        resolve(currentVersion);
      };
      request.onerror = () => resolve(0); // If DB doesn't exist, start from 0
    });
  };

  const openDB = async (retryCount = 0): Promise<IDBDatabase> => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second
    
    return new Promise(async (resolve, reject) => {
      try {
        // Get current version and use stable version calculation
        const currentVersion = await getCurrentDBVersion();
        // Only use config.version unless we need to upgrade from an older version
        const targetVersion = Math.max(config.version, currentVersion);
        
        // Prevent unnecessary upgrades if we're already at the target version
        if (currentVersion === config.version && retryCount === 0) {
          // Already at target version
        }
        
        const request = indexedDB.open(config.dbName, targetVersion);
        let blockedTimeout: NodeJS.Timeout;

        request.onerror = () => {
          const errorInfo = createErrorMessage(request.error);
          globalDBState.lastError = errorInfo;
          dispatchIndexedDBError(errorInfo);
          if (blockedTimeout) clearTimeout(blockedTimeout);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          if (blockedTimeout) clearTimeout(blockedTimeout);
          // Dispatch recovery event if we had previous errors
          if (globalDBState.lastError) {
            dispatchIndexedDBRecovery();
            globalDBState.lastError = null;
          }
          resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          config.stores.forEach(store => {
            if (!db.objectStoreNames.contains(store.name)) {
              const objectStore = db.createObjectStore(store.name, {
                keyPath: store.keyPath
              });

              // Créer les index
              store.indexes?.forEach(index => {
                objectStore.createIndex(index.name, index.keyPath, {
                  unique: index.unique || false
                });
              });
            }
          });
        };
        
        request.onblocked = () => {
          globalDBState.isBlocked = true;
          globalDBState.retryCount = retryCount;
          
          const errorInfo = createErrorMessage({ name: 'BlockedError' });
          globalDBState.lastError = errorInfo;
          dispatchIndexedDBError(errorInfo);
          
          // IndexedDB upgrade blocked
          
          // Set a timeout to automatically retry after a delay
          blockedTimeout = setTimeout(async () => {
            
            if (retryCount < MAX_RETRIES) {
              try {
                // Try to force close any existing connections
                const databases = await indexedDB.databases();
                const targetDB = databases.find(db => db.name === config.dbName);
                
                if (targetDB) {
                  // Try opening with current version first to close existing connections
                  const tempRequest = indexedDB.open(config.dbName);
                  tempRequest.onsuccess = () => {
                    tempRequest.result.close();
                    // Retry the original request
                    setTimeout(() => {
                      globalDBState.isBlocked = false;
                      openDB(retryCount + 1).then(resolve).catch(reject);
                    }, RETRY_DELAY);
                  };
                  tempRequest.onerror = () => {
                    // If temp request fails, just retry normally
                    setTimeout(() => {
                      globalDBState.isBlocked = false;
                      openDB(retryCount + 1).then(resolve).catch(reject);
                    }, RETRY_DELAY);
                  };
                } else {
                  // No existing DB found, retry normally
                  setTimeout(() => {
                    globalDBState.isBlocked = false;
                    openDB(retryCount + 1).then(resolve).catch(reject);
                  }, RETRY_DELAY);
                }
              } catch (error) {
                const recoveryError = createErrorMessage(error);
                globalDBState.lastError = recoveryError;
                setTimeout(() => {
                  globalDBState.isBlocked = false;
                  openDB(retryCount + 1).then(resolve).catch(reject);
                }, RETRY_DELAY);
              }
            } else {
              const finalError = createErrorMessage(new Error(`IndexedDB upgrade blocked after ${MAX_RETRIES} attempts`));
              globalDBState.lastError = finalError;
              reject(new Error(finalError.message));
            }
          }, 2000); // Wait 2 seconds before retrying
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  const saveData = async (tool: string, key: string, data: any): Promise<boolean> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([tool], 'readwrite');
      const store = transaction.objectStore(tool);
      
      const item: StoredItem = {
        id: key,
        tool,
        data,
        timestamp: Date.now(),
        lastModified: new Date().toISOString()
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => {
          reject(request.error);
        };
      });

      db.close();
      return true;
    } catch (error) {
      return false;
    }
  };

  const loadData = async (tool: string, key: string): Promise<any | null> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([tool], 'readonly');
      const store = transaction.objectStore(tool);

      const result = await new Promise<StoredItem | undefined>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          reject(request.error);
        };
      });

      db.close();
      
      if (result) {
        return result.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const deleteData = async (tool: string, key: string): Promise<boolean> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([tool], 'readwrite');
      const store = transaction.objectStore(tool);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
      return true;
    } catch (error) {
      return false;
    }
  };

  const getAllKeys = async (tool: string): Promise<string[]> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([tool], 'readonly');
      const store = transaction.objectStore(tool);

      const keys = await new Promise<string[]>((resolve, reject) => {
        const request = store.getAllKeys();
        request.onsuccess = () => resolve(request.result as string[]);
        request.onerror = () => reject(request.error);
      });

      db.close();
      return keys;
    } catch (error) {
      return [];
    }
  };

  const exportAllData = async (): Promise<Record<string, any>> => {
    try {
      const db = await openDB();
      const allData: Record<string, any> = {};

      for (const storeConfig of config.stores) {
        const transaction = db.transaction([storeConfig.name], 'readonly');
        const store = transaction.objectStore(storeConfig.name);

        const data = await new Promise<StoredItem[]>((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        allData[storeConfig.name] = data;
      }

      db.close();
      return allData;
    } catch (error) {
      return {};
    }
  };

  const clearAllData = async (): Promise<boolean> => {
    try {
      const db = await openDB();
      
      for (const storeConfig of config.stores) {
        const transaction = db.transaction([storeConfig.name], 'readwrite');
        const store = transaction.objectStore(storeConfig.name);

        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      db.close();
      return true;
    } catch (error) {
      return false;
    }
  };

  const getStorageInfo = async (): Promise<{ estimatedSize: number; quota: number }> => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          estimatedSize: estimate.usage || 0,
          quota: estimate.quota || 0
        };
      }
      return { estimatedSize: 0, quota: 0 };
    } catch (error) {
      return { estimatedSize: 0, quota: 0 };
    }
  };

  // Recovery function to manually retry blocked operations
  const retryConnection = async (): Promise<boolean> => {
    try {
      globalDBState.isBlocked = false;
      globalDBState.lastError = null;
      globalDBState.retryCount = 0;
      
      const db = await openDB();
      db.close();
      return true;
    } catch (error) {
      return false;
    }
  };

  // Function to get current error state
  const getErrorState = () => ({
    isBlocked: globalDBState.isBlocked,
    lastError: globalDBState.lastError,
    retryCount: globalDBState.retryCount,
    hasMultipleTabs: detectMultipleTabs()
  });

  // Function to clear error state
  const clearErrorState = () => {
    globalDBState.isBlocked = false;
    globalDBState.lastError = null;
    globalDBState.retryCount = 0;
  };

  const isInitialized = true; // IndexedDB est toujours disponible dans les navigateurs modernes
  const isLoading = false; // Pas de chargement initial pour IndexedDB

  return {
    saveData,
    loadData,
    deleteData,
    getAllKeys,
    exportAllData,
    clearAllData,
    getStorageInfo,
    retryConnection,
    getErrorState,
    clearErrorState,
    isInitialized,
    isLoading
  };
};
