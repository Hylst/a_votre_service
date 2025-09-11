
import { useState, useEffect, useCallback } from 'react';
import { useAppDatabase } from './useAppDatabase';
import { useToast } from './use-toast';

interface DataManagerOptions {
  toolName: string;
  defaultData?: any;
}

export const useOfflineDataManager = <T>({ toolName, defaultData = null }: DataManagerOptions) => {
  const { toast } = useToast();
  const { 
    saveData, 
    loadData, 
    deleteData,
    getAllKeys,
    isInitialized, 
    isLoading: dbLoading 
  } = useAppDatabase();
  
  const [data, setData] = useState<T>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Simuler le statut en ligne (puisque nous utilisons IndexedDB localement)
  const isOnline = true;

  // Charger les données au démarrage
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isInitialized) return;
      
      setIsLoading(true);
      try {
        console.log(`🔄 Chargement des données pour ${toolName}...`);
        
        // Charger les données principales
        const loadedData = await loadData(toolName, 'main-data');
        
        if (loadedData) {
          setData(loadedData);
          setLastSyncTime(new Date().toISOString());
          console.log(`✅ Données chargées pour ${toolName}:`, loadedData);
        } else {
          setData(defaultData);
          console.log(`📝 Données par défaut utilisées pour ${toolName}`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors du chargement des données pour ${toolName}:`, error);
        
        // Check if it's a version error and attempt recovery
        if (error instanceof Error && error.name === 'VersionError') {
          console.log(`🔄 Tentative de récupération après erreur de version pour ${toolName}`);
          try {
            // Wait a bit and try again - the version should be auto-corrected now
            await new Promise(resolve => setTimeout(resolve, 1000));
            const retryData = await loadData(toolName, 'main-data');
            if (retryData) {
              setData(retryData);
              setLastSyncTime(new Date().toISOString());
              console.log(`✅ Récupération réussie pour ${toolName}`);
              return;
            }
          } catch (retryError) {
            console.error(`❌ Échec de la récupération pour ${toolName}:`, retryError);
          }
        }
        
        setData(defaultData);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données sauvegardées. Les données par défaut seront utilisées.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [toolName, isInitialized, defaultData, loadData, toast]);

  // Sauvegarder les données
  const updateData = useCallback(async (newData: T) => {
    if (!isInitialized) {
      console.warn(`⚠️ Base de données non initialisée pour ${toolName}`);
      setData(newData);
      return;
    }

    setIsSyncing(true);
    try {
      console.log(`💾 Sauvegarde des données pour ${toolName}...`);
      
      // Ajouter des métadonnées
      const dataWithMetadata = {
        data: newData,
        tool: toolName,
        timestamp: Date.now(),
        lastModified: new Date().toISOString()
      };

      const success = await saveData(toolName, 'main-data', dataWithMetadata);
      
      if (success) {
        setData(newData);
        setLastSyncTime(new Date().toISOString());
        console.log(`✅ Données sauvegardées pour ${toolName}`);
      } else {
        throw new Error('Échec de la sauvegarde');
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la sauvegarde pour ${toolName}:`, error);
      
      // Check if it's a version error and attempt recovery
      if (error instanceof Error && error.name === 'VersionError') {
        console.log(`🔄 Tentative de récupération après erreur de version lors de la sauvegarde pour ${toolName}`);
        try {
          // Wait a bit and try again - the version should be auto-corrected now
          await new Promise(resolve => setTimeout(resolve, 1000));
          const dataWithMetadata = {
            data: newData,
            tool: toolName,
            timestamp: Date.now(),
            lastModified: new Date().toISOString()
          };
          const retrySuccess = await saveData(toolName, 'main-data', dataWithMetadata);
          if (retrySuccess) {
            setData(newData);
            setLastSyncTime(new Date().toISOString());
            console.log(`✅ Récupération de sauvegarde réussie pour ${toolName}`);
            setIsSyncing(false);
            return;
          }
        } catch (retryError) {
          console.error(`❌ Échec de la récupération de sauvegarde pour ${toolName}:`, retryError);
        }
      }
      
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les données. Les modifications sont conservées en mémoire.",
        variant: "destructive",
      });
      // On garde quand même les données en mémoire
      setData(newData);
    } finally {
      setIsSyncing(false);
    }
  }, [toolName, isInitialized, saveData, toast]);

  // Exporter les données en JSON
  const exportData = useCallback(() => {
    try {
      const dataToExport = {
        tool: toolName,
        exportDate: new Date().toISOString(),
        version: "2.0",
        data: data
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${toolName}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export réussi",
        description: "Les données ont été exportées avec succès",
      });
      
      console.log(`📤 Export réussi pour ${toolName}`);
    } catch (error) {
      console.error(`❌ Erreur d'export pour ${toolName}:`, error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      });
    }
  }, [data, toolName, toast]);

  // Importer les données depuis un fichier JSON
  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      // Vérifier la structure des données
      if (!importedData.data || importedData.tool !== toolName) {
        throw new Error('Format de fichier incorrect');
      }
      
      await updateData(importedData.data);
      
      toast({
        title: "Import réussi",
        description: "Les données ont été importées avec succès",
      });
      
      console.log(`📥 Import réussi pour ${toolName}:`, importedData.data);
      return true;
    } catch (error) {
      console.error(`❌ Erreur d'import pour ${toolName}:`, error);
      toast({
        title: "Erreur d'import",
        description: "Format de fichier incorrect ou données corrompues",
        variant: "destructive",
      });
      return false;
    }
  }, [toolName, updateData, toast]);

  // Réinitialiser les données
  const resetData = useCallback(async () => {
    try {
      if (isInitialized) {
        await deleteData(toolName, 'main-data');
        console.log(`🗑️ Données supprimées pour ${toolName}`);
      }
      
      await updateData(defaultData);
      
      toast({
        title: "Données réinitialisées",
        description: "Toutes les données ont été supprimées",
      });
      
      console.log(`🔄 Réinitialisation terminée pour ${toolName}`);
    } catch (error) {
      console.error(`❌ Erreur de réinitialisation pour ${toolName}:`, error);
      // En cas d'erreur, on remet quand même les données par défaut
      setData(defaultData);
      setLastSyncTime(new Date().toISOString());
    }
  }, [toolName, defaultData, updateData, deleteData, isInitialized, toast]);

  return {
    data,
    setData: updateData,
    isLoading: isLoading || dbLoading,
    isOnline,
    isSyncing,
    lastSyncTime,
    exportData,
    importData,
    resetData
  };
};
