/**
 * usePomodoroDatabase.ts
 * Database management for Pomodoro Timer sessions with IndexedDB persistence
 */

import { useIndexedDBManager } from '../useIndexedDBManager';
import { useCallback } from 'react';

// Pomodoro session interface for database storage
export interface PomodoroSessionRecord {
  id: string;
  type: 'work' | 'break' | 'longBreak';
  duration: number; // in seconds
  completedAt: Date;
  taskId?: string; // Optional link to task system
  taskTitle?: string;
  interrupted: boolean;
  actualDuration: number; // actual time spent (may differ from planned)
  notes?: string;
}

// Daily statistics interface
export interface PomodoroStats {
  date: string; // YYYY-MM-DD format
  totalSessions: number;
  workSessions: number;
  breakSessions: number;
  totalWorkTime: number; // in seconds
  totalBreakTime: number; // in seconds
  completionRate: number; // percentage
  averageSessionLength: number; // in seconds
}

// Database configuration for Pomodoro sessions
const POMODORO_DB_CONFIG = {
  dbName: 'PomodoroDatabase',
  version: 1,
  stores: [
    {
      name: 'sessions',
      keyPath: 'id',
      indexes: [
        { name: 'completedAt', keyPath: 'completedAt' },
        { name: 'type', keyPath: 'type' },
        { name: 'taskId', keyPath: 'taskId' }
      ]
    },
    {
      name: 'stats',
      keyPath: 'date',
      indexes: [
        { name: 'date', keyPath: 'date' }
      ]
    }
  ]
};

export const usePomodoroDatabase = () => {
  const { saveData, loadData, deleteData } = useIndexedDBManager(POMODORO_DB_CONFIG);

  // Custom saveData for Pomodoro that stores raw data
  const savePomodoroData = async (storeName: string, data: any): Promise<boolean> => {
    return new Promise(async (resolve) => {
      try {
        const request = indexedDB.open(POMODORO_DB_CONFIG.dbName, POMODORO_DB_CONFIG.version);
        
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const putRequest = store.put(data);
          
          putRequest.onsuccess = () => {
            db.close();
            resolve(true);
          };
          
          putRequest.onerror = () => {
            db.close();
            console.error('Error saving Pomodoro data:', putRequest.error);
            resolve(false);
          };
        };
        
        request.onerror = () => {
          console.error('Error opening Pomodoro database:', request.error);
          resolve(false);
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          POMODORO_DB_CONFIG.stores.forEach(store => {
            if (!db.objectStoreNames.contains(store.name)) {
              const objectStore = db.createObjectStore(store.name, {
                keyPath: store.keyPath
              });

              store.indexes?.forEach(index => {
                objectStore.createIndex(index.name, index.keyPath);
              });
            }
          });
        };
      } catch (error) {
        console.error('Error in savePomodoroData:', error);
        resolve(false);
      }
    });
  };

  // Custom loadAllData for Pomodoro that handles raw data storage - memoized to prevent infinite loops
  const loadAllPomodoroData = useCallback(async (storeName: string): Promise<any[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        const request = indexedDB.open(POMODORO_DB_CONFIG.dbName, POMODORO_DB_CONFIG.version);
        
        request.onsuccess = () => {
          const db = request.result;
          
          if (!db.objectStoreNames.contains(storeName)) {
            console.warn(`Store '${storeName}' not found in database`);
            db.close();
            resolve([]);
            return;
          }
          
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            db.close();
            resolve(getAllRequest.result || []);
          };
          
          getAllRequest.onerror = () => {
            db.close();
            reject(getAllRequest.error);
          };
        };
        
        request.onerror = () => {
          reject(request.error);
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          POMODORO_DB_CONFIG.stores.forEach(store => {
            if (!db.objectStoreNames.contains(store.name)) {
              const objectStore = db.createObjectStore(store.name, {
                keyPath: store.keyPath
              });

              store.indexes?.forEach(index => {
                objectStore.createIndex(index.name, index.keyPath);
              });
            }
          });
        };
      } catch (error) {
        console.error(`Error loading all data from ${storeName}:`, error);
        resolve([]);
      }
    });
  }, []);

  /**
   * Save a completed Pomodoro session
   */
  const saveSession = async (session: Omit<PomodoroSessionRecord, 'id'>) => {
    const sessionWithId: PomodoroSessionRecord = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    await savePomodoroData('sessions', sessionWithId);
    await updateDailyStats(sessionWithId);
    return sessionWithId;
  };

  /**
   * Load sessions for a specific date range
   */
  const loadSessionsByDateRange = useCallback(async (startDate: Date, endDate: Date): Promise<PomodoroSessionRecord[]> => {
    const allSessions = await loadAllPomodoroData('sessions');
    return allSessions.filter(session => {
      const sessionDate = new Date(session.completedAt);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }, [loadAllPomodoroData]);

  /**
   * Load sessions for today
   */
  const loadTodaySessions = async (): Promise<PomodoroSessionRecord[]> => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return loadSessionsByDateRange(startOfDay, endOfDay);
  };

  /**
   * Load sessions for a specific task
   */
  const loadSessionsByTask = async (taskId: string): Promise<PomodoroSessionRecord[]> => {
    const allSessions = await loadAllPomodoroData('sessions');
    return allSessions.filter(session => session.taskId === taskId);
  };

  /**
   * Update daily statistics
   */
  const updateDailyStats = async (session: PomodoroSessionRecord) => {
    const dateKey = new Date(session.completedAt).toISOString().split('T')[0];
    
    try {
      let stats = await loadData('stats', dateKey);
      
      if (!stats) {
        stats = {
          date: dateKey,
          totalSessions: 0,
          workSessions: 0,
          breakSessions: 0,
          totalWorkTime: 0,
          totalBreakTime: 0,
          completionRate: 0,
          averageSessionLength: 0
        };
      }

      // Update statistics
      stats.totalSessions += 1;
      
      if (session.type === 'work') {
        stats.workSessions += 1;
        stats.totalWorkTime += session.actualDuration;
      } else {
        stats.breakSessions += 1;
        stats.totalBreakTime += session.actualDuration;
      }

      // Calculate completion rate (actual vs planned duration)
      const totalPlannedTime = stats.workSessions * 25 * 60; // 25 minutes per work session
      stats.completionRate = totalPlannedTime > 0 ? (stats.totalWorkTime / totalPlannedTime) * 100 : 0;
      
      // Calculate average session length
      const totalTime = stats.totalWorkTime + stats.totalBreakTime;
      stats.averageSessionLength = stats.totalSessions > 0 ? totalTime / stats.totalSessions : 0;

      await savePomodoroData('stats', stats);
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  };

  /**
   * Load daily statistics for a date range
   */
  const loadStatsByDateRange = useCallback(async (startDate: Date, endDate: Date): Promise<PomodoroStats[]> => {
    const allStats = await loadAllPomodoroData('stats');
    return allStats.filter(stat => {
      const statDate = new Date(stat.date);
      return statDate >= startDate && statDate <= endDate;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [loadAllPomodoroData]);

  /**
   * Load statistics for the last N days
   */
  const loadRecentStats = async (days: number = 7): Promise<PomodoroStats[]> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    
    return loadStatsByDateRange(startDate, endDate);
  };

  /**
   * Delete old sessions (cleanup)
   */
  const cleanupOldSessions = async (daysToKeep: number = 90) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const allSessions = await loadAllPomodoroData('sessions');
    const sessionsToDelete = allSessions.filter(session => 
      new Date(session.completedAt) < cutoffDate
    );
    
    for (const session of sessionsToDelete) {
      await deleteData('sessions', session.id);
    }
    
    return sessionsToDelete.length;
  };

  return {
    saveSession,
    loadSessionsByDateRange,
    loadTodaySessions,
    loadSessionsByTask,
    loadStatsByDateRange,
    loadRecentStats,
    cleanupOldSessions
  };
};