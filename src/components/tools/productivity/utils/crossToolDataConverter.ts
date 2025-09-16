/**
 * crossToolDataConverter.ts
 * Convertisseur de données entre les différents outils de la suite Organisation Productive
 * Permet l'import/export et la réutilisation des tâches entre To-Do List, Tâches Pro, Objectifs, Kanban et Eisenhower
 */

import { Task } from '../hooks/useTaskManager';
import { Goal, Milestone } from '../hooks/useGoalManagerEnhanced';

// Types unifiés pour la conversion
export interface UnifiedTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  sourceType: 'todo' | 'tasks-pro' | 'goals' | 'kanban' | 'eisenhower';
  metadata?: {
    quadrant?: 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'not-urgent-not-important';
    column?: string;
    goalId?: string;
    milestoneId?: string;
    estimatedTime?: number;
    actualTime?: number;
    subtasks?: UnifiedTask[];
  };
}

export interface ConversionResult {
  success: boolean;
  data?: UnifiedTask[];
  errors?: string[];
  warnings?: string[];
}

/**
 * Classe principale pour la conversion de données entre outils
 */
export class CrossToolDataConverter {
  
  /**
   * Convertit une tâche standard en format unifié
   */
  static taskToUnified(task: Task, sourceType: UnifiedTask['sourceType']): UnifiedTask {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category,
      tags: task.tags || [],
      completed: task.completed,
      dueDate: task.dueDate,
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || new Date().toISOString(),
      sourceType,
      metadata: {
        estimatedTime: task.estimatedTime,
        actualTime: task.actualTime,
        subtasks: task.subtasks?.map(subtask => 
          this.taskToUnified(subtask, sourceType)
        )
      }
    };
  }

  /**
   * Convertit un objectif en tâches unifiées
   */
  static goalToUnified(goal: Goal): UnifiedTask[] {
    const tasks: UnifiedTask[] = [];
    
    // Tâche principale pour l'objectif
    const mainTask: UnifiedTask = {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      priority: goal.priority as 'low' | 'medium' | 'high',
      category: goal.category,
      tags: goal.tags || [],
      completed: goal.status === 'completed',
      dueDate: goal.targetDate,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
      sourceType: 'goals',
      metadata: {
        goalId: goal.id
      }
    };
    tasks.push(mainTask);

    // Convertir les jalons en sous-tâches
    if (goal.milestones) {
      goal.milestones.forEach(milestone => {
        const milestoneTask: UnifiedTask = {
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          priority: 'medium',
          category: goal.category,
          tags: [...(goal.tags || []), 'milestone'],
          completed: milestone.completed,
          dueDate: milestone.dueDate,
          createdAt: milestone.createdAt || goal.createdAt,
          updatedAt: milestone.updatedAt || goal.updatedAt,
          sourceType: 'goals',
          metadata: {
            goalId: goal.id,
            milestoneId: milestone.id
          }
        };
        tasks.push(milestoneTask);
      });
    }

    return tasks;
  }

  /**
   * Convertit des tâches unifiées vers le format Kanban
   */
  static unifiedToKanban(tasks: UnifiedTask[]) {
    return tasks.map(task => ({
      ...task,
      metadata: {
        ...task.metadata,
        column: task.completed ? 'done' : 
                task.priority === 'high' ? 'in-progress' : 'todo'
      }
    }));
  }

  /**
   * Convertit des tâches unifiées vers le format Eisenhower
   */
  static unifiedToEisenhower(tasks: UnifiedTask[]) {
    return tasks.map(task => {
      let quadrant: UnifiedTask['metadata']['quadrant'] = 'not-urgent-not-important';
      
      // Logique de classification automatique
      const isUrgent = task.dueDate && 
        new Date(task.dueDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 jours
      const isImportant = task.priority === 'high' || 
        task.tags.includes('important') ||
        task.category === 'Travail' ||
        task.category === 'Projet';

      if (isUrgent && isImportant) {
        quadrant = 'urgent-important';
      } else if (!isUrgent && isImportant) {
        quadrant = 'important-not-urgent';
      } else if (isUrgent && !isImportant) {
        quadrant = 'urgent-not-important';
      }

      return {
        ...task,
        metadata: {
          ...task.metadata,
          quadrant
        }
      };
    });
  }

  /**
   * Convertit des tâches unifiées vers le format standard
   */
  static unifiedToTask(unifiedTask: UnifiedTask): Task {
    return {
      id: unifiedTask.id,
      title: unifiedTask.title,
      description: unifiedTask.description,
      priority: unifiedTask.priority,
      category: unifiedTask.category,
      tags: unifiedTask.tags,
      completed: unifiedTask.completed,
      status: unifiedTask.completed ? 'done' : 'todo',
      dueDate: unifiedTask.dueDate,
      createdAt: unifiedTask.createdAt,
      updatedAt: unifiedTask.updatedAt,
      estimatedTime: unifiedTask.metadata?.estimatedTime,
      actualTime: unifiedTask.metadata?.actualTime,
      subtasks: unifiedTask.metadata?.subtasks?.map(subtask => 
        this.unifiedToTask(subtask)
      )
    };
  }

  /**
   * Valide la compatibilité des données avant conversion
   */
  static validateCompatibility(data: any[], targetType: string): ConversionResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!Array.isArray(data)) {
      errors.push('Les données doivent être un tableau');
      return { success: false, errors };
    }

    data.forEach((item, index) => {
      if (!item.id) {
        errors.push(`Élément ${index}: ID manquant`);
      }
      if (!item.title) {
        errors.push(`Élément ${index}: Titre manquant`);
      }
      if (!['low', 'medium', 'high'].includes(item.priority)) {
        warnings.push(`Élément ${index}: Priorité non standard (${item.priority})`);
      }
    });

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Exporte des données vers un format JSON standardisé
   */
  static exportToJSON(tasks: UnifiedTask[], metadata?: any) {
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      source: 'Organisation Productive Suite',
      metadata: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        categories: [...new Set(tasks.map(t => t.category))],
        ...metadata
      },
      data: tasks
    };
  }

  /**
   * Importe des données depuis un format JSON standardisé
   */
  static importFromJSON(jsonData: string): ConversionResult {
    try {
      const parsed = JSON.parse(jsonData);
      
      if (!parsed.data || !Array.isArray(parsed.data)) {
        return {
          success: false,
          errors: ['Format JSON invalide: propriété "data" manquante ou invalide']
        };
      }

      const validation = this.validateCompatibility(parsed.data, 'unified');
      if (!validation.success) {
        return validation;
      }

      return {
        success: true,
        data: parsed.data,
        warnings: validation.warnings
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Erreur de parsing JSON: ${error.message}`]
      };
    }
  }

  /**
   * Fusionne des tâches de différentes sources en évitant les doublons
   */
  static mergeTasks(taskArrays: UnifiedTask[][]): UnifiedTask[] {
    const merged = new Map<string, UnifiedTask>();
    const duplicates: string[] = [];

    taskArrays.forEach(tasks => {
      tasks.forEach(task => {
        if (merged.has(task.id)) {
          duplicates.push(task.id);
          // Garder la version la plus récente
          const existing = merged.get(task.id)!;
          if (new Date(task.updatedAt) > new Date(existing.updatedAt)) {
            merged.set(task.id, task);
          }
        } else {
          merged.set(task.id, task);
        }
      });
    });

    return Array.from(merged.values());
  }

  /**
   * Analyse les statistiques de conversion
   */
  static analyzeConversion(originalData: any[], convertedData: UnifiedTask[]) {
    return {
      originalCount: originalData.length,
      convertedCount: convertedData.length,
      successRate: (convertedData.length / originalData.length) * 100,
      categoriesFound: [...new Set(convertedData.map(t => t.category))],
      priorityDistribution: {
        high: convertedData.filter(t => t.priority === 'high').length,
        medium: convertedData.filter(t => t.priority === 'medium').length,
        low: convertedData.filter(t => t.priority === 'low').length
      },
      completionRate: (convertedData.filter(t => t.completed).length / convertedData.length) * 100
    };
  }
}

/**
 * Utilitaires pour la gestion du localStorage avec compatibilité
 */
export class StorageCompatibilityManager {
  
  /**
   * Sauvegarde des données avec format unifié
   */
  static async saveUnifiedData(key: string, data: UnifiedTask[], dbManager: any) {
    try {
      const exportData = CrossToolDataConverter.exportToJSON(data);
      return await dbManager.saveData('productivity-tasks', key, exportData);
    } catch (error) {
      console.error('Erreur sauvegarde données unifiées:', error);
      return false;
    }
  }

  /**
   * Chargement des données avec format unifié
   */
  static async loadUnifiedData(key: string, dbManager: any): Promise<UnifiedTask[]> {
    try {
      const data = await dbManager.loadData('productivity-tasks', key);
      if (!data) return [];
      
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      // Fallback pour anciens formats
      if (Array.isArray(data)) {
        return data;
      }
      
      return [];
    } catch (error) {
      console.error('Erreur chargement données unifiées:', error);
      return [];
    }
  }

  /**
   * Migration des données depuis les anciens formats
   */
  static async migrateFromLegacyFormat(dbManager: any) {
    const migrations = [
      { key: 'todo-tasks', sourceType: 'todo' as const },
      { key: 'tasks-pro', sourceType: 'tasks-pro' as const },
      { key: 'goals-data', sourceType: 'goals' as const },
      { key: 'kanban-tasks', sourceType: 'kanban' as const },
      { key: 'eisenhower-tasks', sourceType: 'eisenhower' as const }
    ];

    const migratedTasks: UnifiedTask[] = [];

    for (const migration of migrations) {
      try {
        const legacyData = await dbManager.loadData('productivity-tasks', migration.key);
        if (legacyData && Array.isArray(legacyData)) {
          const converted = legacyData.map(item => 
            CrossToolDataConverter.taskToUnified(item, migration.sourceType)
          );
          migratedTasks.push(...converted);
        }
      } catch (error) {
        console.warn(`Migration échouée pour ${migration.key}:`, error);
      }
    }

    if (migratedTasks.length > 0) {
      await this.saveUnifiedData('unified-tasks', migratedTasks, dbManager);
      console.log(`Migration réussie: ${migratedTasks.length} tâches migrées`);
    }

    return migratedTasks;
  }
}