
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDexieDB } from './useDexieDB';
import { useDataSync } from './useDataSync';
import { useToast } from './use-toast';

interface OptimizedDataManagerOptions {
  toolName: string;
  defaultData?: any;
  autoSave?: boolean;
  syncInterval?: number;
}

export const useOptimizedDataManager = <T>({
  toolName,
  defaultData = null,
  autoSave = true,
  syncInterval = 30000 // 30 secondes
}: OptimizedDataManagerOptions) => {
  const { toast } = useToast();
  const { saveData: saveToDexie, loadData: loadFromDexie, deleteData } = useDexieDB();
  const { 
    isOnline, 
    isSyncing, 
    lastSyncTime, 
    saveData: saveToSync, 
    loadData: loadFromSync 
  } = useDataSync(toolName);
  
  const [data, setData] = useState<T>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const syncIntervalRef = useRef<NodeJS.Timeout>();

  // Memoize functions to prevent dependency changes
  const memoizedLoadFromDexie = useCallback(loadFromDexie, []);
  const memoizedLoadFromSync = useCallback(loadFromSync, []);
  
  // Chargement initial optimisé
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Essayer de charger depuis la synchronisation (Supabase si en ligne, sinon local)
        const syncData = await memoizedLoadFromSync();
        if (syncData) {
          setData(syncData);
          return;
        }

        // Charger depuis Dexie comme fallback
        const localData = await memoizedLoadFromDexie(toolName);
        if (localData) {
          setData(localData);
        } else {
          setData(defaultData);
        }
      } catch (error) {
        console.error(`❌ Erreur de chargement pour ${toolName}:`, error);
        setData(defaultData);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [toolName, memoizedLoadFromDexie, memoizedLoadFromSync]);

  // Auto-save debounced
  const debouncedSave = useCallback(async (newData: T) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Sauvegarder localement avec Dexie
        await saveToDexie(toolName, newData);
        
        // Sauvegarder avec la synchronisation (gère automatiquement Supabase/local)
        await saveToSync(newData);
        
        setHasChanges(false);
      } catch (error) {
        console.error(`❌ Erreur auto-save pour ${toolName}:`, error);
      }
    }, 1000); // 1 seconde de debounce
  }, [toolName, saveToDexie, saveToSync]);

  // Mise à jour des données avec auto-save
  const updateData = useCallback((newData: T) => {
    setData(newData);
    setHasChanges(true);
    
    if (autoSave) {
      debouncedSave(newData);
    }
  }, [autoSave, debouncedSave]);

  // Sauvegarde manuelle
  const manualSave = useCallback(async () => {
    try {
      await saveToDexie(toolName, data);
      await saveToSync(data);
      
      setHasChanges(false);
      toast({
        title: "Sauvegarde réussie",
        description: `Données sauvegardées pour ${toolName}`,
      });
    } catch (error) {
      console.error(`❌ Erreur de sauvegarde manuelle:`, error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les données",
        variant: "destructive",
      });
    }
  }, [data, toolName, saveToDexie, saveToSync, toast]);

  // Export optimisé
  const exportData = useCallback(() => {
    try {
      const exportObj = {
        tool: toolName,
        version: "2.1.0",
        exportDate: new Date().toISOString(),
        data: data,
        metadata: {
          hasChanges,
          lastModified: new Date().toISOString()
        }
      };
      
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${toolName}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export réussi",
        description: "Données exportées avec succès",
      });
    } catch (error) {
      console.error(`❌ Erreur d'export:`, error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      });
    }
  }, [data, toolName, hasChanges, toast]);

  // Import optimisé
  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importObj = JSON.parse(text);
      
      if (!importObj.data || importObj.tool !== toolName) {
        throw new Error('Format de fichier incorrect');
      }
      
      updateData(importObj.data);
      
      toast({
        title: "Import réussi",
        description: "Données importées avec succès",
      });
      
      return true;
    } catch (error) {
      console.error(`❌ Erreur d'import:`, error);
      toast({
        title: "Erreur d'import",
        description: "Format de fichier incorrect",
        variant: "destructive",
      });
      return false;
    }
  }, [toolName, updateData, toast]);

  // Reset optimisé
  const resetData = useCallback(async () => {
    try {
      await deleteData(toolName);
      updateData(defaultData);
      
      toast({
        title: "Données réinitialisées",
        description: "Toutes les données ont été supprimées",
      });
    } catch (error) {
      console.error(`❌ Erreur de reset:`, error);
    }
  }, [toolName, deleteData, updateData, defaultData, toast]);

  // Sync automatique
  useEffect(() => {
    if (syncInterval > 0 && isOnline && hasChanges && !isSyncing) {
      syncIntervalRef.current = setInterval(() => {
        saveToSync(data);
      }, syncInterval);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [syncInterval, isOnline, hasChanges, isSyncing, data, saveToSync]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  return {
    data,
    setData: updateData,
    isLoading,
    hasChanges,
    isOnline,
    isSyncing,
    lastSyncTime,
    manualSave,
    exportData,
    importData,
    resetData
  };
};
