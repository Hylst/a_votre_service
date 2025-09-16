/**
 * useCrossToolConverter.ts
 * Hook pour la conversion et l'import/export de données entre les outils de productivité
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAppDatabase } from '@/hooks/useAppDatabase';
import { 
  CrossToolDataConverter, 
  StorageCompatibilityManager, 
  UnifiedTask, 
  ConversionResult 
} from '../utils/crossToolDataConverter';
import { Task } from './useTaskManager';
import { Goal } from './useGoalManagerEnhanced';

export interface ImportExportStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  warnings: string[];
  errors: string[];
}

export const useCrossToolConverter = () => {
  const { toast } = useToast();
  const dbManager = useAppDatabase();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastStats, setLastStats] = useState<ImportExportStats | null>(null);

  /**
   * Convertit des tâches vers le format unifié
   */
  const convertTasksToUnified = useCallback((tasks: Task[], sourceType: UnifiedTask['sourceType']): UnifiedTask[] => {
    return tasks.map(task => CrossToolDataConverter.taskToUnified(task, sourceType));
  }, []);

  /**
   * Convertit des objectifs vers le format unifié
   */
  const convertGoalsToUnified = useCallback((goals: Goal[]): UnifiedTask[] => {
    const allTasks: UnifiedTask[] = [];
    goals.forEach(goal => {
      const goalTasks = CrossToolDataConverter.goalToUnified(goal);
      allTasks.push(...goalTasks);
    });
    return allTasks;
  }, []);

  /**
   * Importe des tâches d'un outil vers un autre
   */
  const importTasksBetweenTools = useCallback(async (
    sourceKey: string,
    targetKey: string,
    sourceType: UnifiedTask['sourceType'],
    targetType: UnifiedTask['sourceType']
  ): Promise<ImportExportStats> => {
    setIsProcessing(true);
    const stats: ImportExportStats = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      warnings: [],
      errors: []
    };

    try {
      // Charger les données source
      const sourceData = await dbManager.loadData('productivity-tasks', sourceKey);
      if (!sourceData || !Array.isArray(sourceData)) {
        stats.errors.push('Aucune donnée trouvée dans l\'outil source');
        return stats;
      }

      stats.totalProcessed = sourceData.length;

      // Convertir vers le format unifié
      let unifiedTasks: UnifiedTask[];
      if (sourceType === 'goals') {
        unifiedTasks = convertGoalsToUnified(sourceData as Goal[]);
      } else {
        unifiedTasks = convertTasksToUnified(sourceData as Task[], sourceType);
      }

      // Adapter au format cible
      let targetTasks: UnifiedTask[];
      switch (targetType) {
        case 'kanban':
          targetTasks = CrossToolDataConverter.unifiedToKanban(unifiedTasks);
          break;
        case 'eisenhower':
          targetTasks = CrossToolDataConverter.unifiedToEisenhower(unifiedTasks);
          break;
        default:
          targetTasks = unifiedTasks;
      }

      // Charger les données existantes du target
      const existingData = await dbManager.loadData('productivity-tasks', targetKey) || [];
      const existingUnified = Array.isArray(existingData) ? 
        convertTasksToUnified(existingData as Task[], targetType) : [];

      // Fusionner en évitant les doublons
      const mergedTasks = CrossToolDataConverter.mergeTasks([existingUnified, targetTasks]);

      // Convertir vers le format standard pour la sauvegarde
      const finalTasks = mergedTasks.map(task => CrossToolDataConverter.unifiedToTask(task));

      // Sauvegarder
      const saveSuccess = await dbManager.saveData('productivity-tasks', targetKey, finalTasks);
      
      if (saveSuccess) {
        stats.successful = targetTasks.length;
        toast({
          title: "Import réussi",
          description: `${stats.successful} tâches importées de ${sourceType} vers ${targetType}`,
        });
      } else {
        stats.failed = targetTasks.length;
        stats.errors.push('Erreur lors de la sauvegarde');
      }

    } catch (error) {
      stats.errors.push(`Erreur d'import: ${error.message}`);
      stats.failed = stats.totalProcessed;
      toast({
        title: "Erreur d'import",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setLastStats(stats);
    }

    return stats;
  }, [dbManager, toast, convertTasksToUnified, convertGoalsToUnified]);

  /**
   * Exporte toutes les données vers un fichier JSON
   */
  const exportAllData = useCallback(async (): Promise<string | null> => {
    setIsProcessing(true);
    
    try {
      const allTools = [
        { key: 'todo-tasks', type: 'todo' as const },
        { key: 'tasks-pro', type: 'tasks-pro' as const },
        { key: 'goals-data', type: 'goals' as const },
        { key: 'kanban-tasks', type: 'kanban' as const },
        { key: 'eisenhower-tasks', type: 'eisenhower' as const }
      ];

      const allUnifiedTasks: UnifiedTask[] = [];

      for (const tool of allTools) {
        try {
          const data = await dbManager.loadData('productivity-tasks', tool.key);
          if (data && Array.isArray(data)) {
            if (tool.type === 'goals') {
              const goalTasks = convertGoalsToUnified(data as Goal[]);
              allUnifiedTasks.push(...goalTasks);
            } else {
              const tasks = convertTasksToUnified(data as Task[], tool.type);
              allUnifiedTasks.push(...tasks);
            }
          }
        } catch (error) {
          console.warn(`Erreur export ${tool.key}:`, error);
        }
      }

      const exportData = CrossToolDataConverter.exportToJSON(allUnifiedTasks, {
        exportedTools: allTools.map(t => t.type),
        exportedBy: 'Organisation Productive Suite'
      });

      const jsonString = JSON.stringify(exportData, null, 2);
      
      toast({
        title: "Export réussi",
        description: `${allUnifiedTasks.length} tâches exportées`,
      });

      return jsonString;
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [dbManager, toast, convertTasksToUnified, convertGoalsToUnified]);

  /**
   * Importe des données depuis un fichier JSON
   */
  const importFromJSON = useCallback(async (jsonData: string, targetTool: string): Promise<ImportExportStats> => {
    setIsProcessing(true);
    const stats: ImportExportStats = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      warnings: [],
      errors: []
    };

    try {
      const result: ConversionResult = CrossToolDataConverter.importFromJSON(jsonData);
      
      if (!result.success) {
        stats.errors = result.errors || [];
        return stats;
      }

      const importedTasks = result.data || [];
      stats.totalProcessed = importedTasks.length;
      stats.warnings = result.warnings || [];

      // Convertir vers le format standard
      const standardTasks = importedTasks.map(task => CrossToolDataConverter.unifiedToTask(task));

      // Charger les données existantes
      const existingData = await dbManager.loadData('productivity-tasks', targetTool) || [];
      const existingTasks = Array.isArray(existingData) ? existingData as Task[] : [];

      // Fusionner
      const existingUnified = convertTasksToUnified(existingTasks, 'todo');
      const mergedTasks = CrossToolDataConverter.mergeTasks([existingUnified, importedTasks]);
      const finalTasks = mergedTasks.map(task => CrossToolDataConverter.unifiedToTask(task));

      // Sauvegarder
      const saveSuccess = await dbManager.saveData('productivity-tasks', targetTool, finalTasks);
      
      if (saveSuccess) {
        stats.successful = importedTasks.length;
        toast({
          title: "Import réussi",
          description: `${stats.successful} tâches importées`,
        });
      } else {
        stats.failed = importedTasks.length;
        stats.errors.push('Erreur lors de la sauvegarde');
      }

    } catch (error) {
      stats.errors.push(`Erreur d'import JSON: ${error.message}`);
      stats.failed = stats.totalProcessed;
      toast({
        title: "Erreur d'import",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setLastStats(stats);
    }

    return stats;
  }, [dbManager, toast, convertTasksToUnified]);

  /**
   * Migre les données depuis les anciens formats
   */
  const migrateFromLegacyFormats = useCallback(async (): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      const migratedTasks = await StorageCompatibilityManager.migrateFromLegacyFormat(dbManager);
      
      if (migratedTasks.length > 0) {
        toast({
          title: "Migration réussie",
          description: `${migratedTasks.length} tâches migrées vers le nouveau format`,
        });
        return true;
      } else {
        toast({
          title: "Aucune migration nécessaire",
          description: "Toutes les données sont déjà au bon format",
        });
        return true;
      }
    } catch (error) {
      toast({
        title: "Erreur de migration",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [dbManager, toast]);

  /**
   * Analyse la compatibilité entre outils
   */
  const analyzeCompatibility = useCallback(async (sourceKey: string, targetKey: string) => {
    try {
      const sourceData = await dbManager.loadData('productivity-tasks', sourceKey);
      const targetData = await dbManager.loadData('productivity-tasks', targetKey);
      
      if (!sourceData) {
        return { compatible: false, reason: 'Aucune donnée source trouvée' };
      }

      const validation = CrossToolDataConverter.validateCompatibility(sourceData, 'unified');
      
      return {
        compatible: validation.success,
        reason: validation.success ? 'Compatible' : validation.errors?.join(', '),
        warnings: validation.warnings,
        sourceCount: Array.isArray(sourceData) ? sourceData.length : 0,
        targetCount: Array.isArray(targetData) ? targetData.length : 0
      };
    } catch (error) {
      return {
        compatible: false,
        reason: `Erreur d'analyse: ${error.message}`
      };
    }
  }, [dbManager]);

  /**
   * Télécharge un fichier JSON
   */
  const downloadJSON = useCallback((jsonData: string, filename: string = 'productivity-export.json') => {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    // État
    isProcessing,
    lastStats,
    
    // Fonctions de conversion
    convertTasksToUnified,
    convertGoalsToUnified,
    
    // Import/Export
    importTasksBetweenTools,
    exportAllData,
    importFromJSON,
    downloadJSON,
    
    // Migration et compatibilité
    migrateFromLegacyFormats,
    analyzeCompatibility
  };
};