/**
 * useKanbanMetrics.ts - Hook pour les métriques et analyses Kanban
 * Fournit des calculs de performance, détection de goulots d'étranglement et insights
 */

import { useState, useEffect, useMemo } from 'react';
import { Task } from './useTaskManager';

export interface KanbanMetrics {
  cycleTime: {
    average: number;
    byColumn: Record<string, number>;
    trend: 'improving' | 'stable' | 'declining';
  };
  throughput: {
    daily: number;
    weekly: number;
    monthly: number;
    completedTasks: number;
    totalTasks: number;
  };
  wipLimits: {
    current: Record<string, number>;
    recommended: Record<string, number>;
    violations: string[];
  };
  bottlenecks: {
    column: string;
    severity: 'low' | 'medium' | 'high';
    reason: string;
    suggestion: string;
  }[];
  flowEfficiency: {
    percentage: number;
    activeTime: number;
    waitTime: number;
  };
  leadTime: {
    average: number;
    p50: number;
    p90: number;
    p95: number;
  };
  cumulativeFlow: {
    date: string;
    columns: Record<string, number>;
  }[];
}

export interface KanbanColumn {
  id: string;
  name: string;
  tasks: Task[];
  wipLimit?: number;
}

interface UseKanbanMetricsOptions {
  columns: KanbanColumn[];
  tasks: Task[];
  timeRange?: 'week' | 'month' | 'quarter';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseKanbanMetricsReturn {
  metrics: KanbanMetrics;
  isLoading: boolean;
  error: string | null;
  refreshMetrics: () => void;
  getColumnMetrics: (columnId: string) => {
    taskCount: number;
    averageAge: number;
    wipUtilization: number;
    isBottleneck: boolean;
  };
  getTaskMetrics: (taskId: string) => {
    cycleTime: number;
    leadTime: number;
    timeInCurrentColumn: number;
    blockedTime: number;
  } | null;
}

export const useKanbanMetrics = ({
  columns,
  tasks,
  timeRange = 'month',
  autoRefresh = false,
  refreshInterval = 60000
}: UseKanbanMetricsOptions): UseKanbanMetricsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Auto-refresh si activé
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastRefresh(Date.now());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Calcul des métriques principales
  const metrics = useMemo((): KanbanMetrics => {
    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const timeRangeMs = getTimeRangeMs(timeRange);
      const startDate = new Date(now.getTime() - timeRangeMs);

      // Filtrer les tâches dans la période
      const recentTasks = tasks.filter(task => 
        new Date(task.createdAt) >= startDate
      );

      const completedTasks = recentTasks.filter(task => task.completed);
      const activeTasks = recentTasks.filter(task => !task.completed);

      // Calcul du cycle time
      const cycleTime = calculateCycleTime(completedTasks, columns);
      
      // Calcul du throughput
      const throughput = calculateThroughput(completedTasks, recentTasks, timeRange);
      
      // Analyse des limites WIP
      const wipLimits = analyzeWipLimits(columns);
      
      // Détection des goulots d'étranglement
      const bottlenecks = detectBottlenecks(columns, activeTasks);
      
      // Calcul de l'efficacité du flux
      const flowEfficiency = calculateFlowEfficiency(completedTasks);
      
      // Calcul du lead time
      const leadTime = calculateLeadTime(completedTasks);
      
      // Données de flux cumulatif
      const cumulativeFlow = generateCumulativeFlowData(tasks, columns, timeRange);

      return {
        cycleTime,
        throughput,
        wipLimits,
        bottlenecks,
        flowEfficiency,
        leadTime,
        cumulativeFlow
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du calcul des métriques');
      return getEmptyMetrics();
    } finally {
      setIsLoading(false);
    }
  }, [columns, tasks, timeRange, lastRefresh]);

  // Fonction pour rafraîchir manuellement
  const refreshMetrics = () => {
    setLastRefresh(Date.now());
  };

  // Métriques par colonne
  const getColumnMetrics = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) {
      return {
        taskCount: 0,
        averageAge: 0,
        wipUtilization: 0,
        isBottleneck: false
      };
    }

    const taskCount = column.tasks.length;
    const averageAge = calculateAverageAge(column.tasks);
    const wipUtilization = column.wipLimit ? (taskCount / column.wipLimit) * 100 : 0;
    const isBottleneck = metrics.bottlenecks.some(b => b.column === column.name);

    return {
      taskCount,
      averageAge,
      wipUtilization,
      isBottleneck
    };
  };

  // Métriques par tâche
  const getTaskMetrics = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    const cycleTime = calculateTaskCycleTime(task);
    const leadTime = calculateTaskLeadTime(task);
    const timeInCurrentColumn = calculateTimeInCurrentColumn(task);
    const blockedTime = calculateBlockedTime(task);

    return {
      cycleTime,
      leadTime,
      timeInCurrentColumn,
      blockedTime
    };
  };

  return {
    metrics,
    isLoading,
    error,
    refreshMetrics,
    getColumnMetrics,
    getTaskMetrics
  };
};

// Fonctions utilitaires

function getTimeRangeMs(timeRange: 'week' | 'month' | 'quarter'): number {
  switch (timeRange) {
    case 'week':
      return 7 * 24 * 60 * 60 * 1000;
    case 'month':
      return 30 * 24 * 60 * 60 * 1000;
    case 'quarter':
      return 90 * 24 * 60 * 60 * 1000;
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}

function calculateCycleTime(completedTasks: Task[], columns: KanbanColumn[]) {
  if (completedTasks.length === 0) {
    return {
      average: 0,
      byColumn: {},
      trend: 'stable' as const
    };
  }

  const cycleTimes = completedTasks.map(task => {
    const created = new Date(task.createdAt).getTime();
    const completed = new Date(task.updatedAt).getTime();
    return (completed - created) / (1000 * 60 * 60 * 24); // en jours
  });

  const average = cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length;

  // Calcul par colonne (simulation basée sur le statut)
  const byColumn: Record<string, number> = {};
  columns.forEach(column => {
    const columnTasks = completedTasks.filter(task => 
      task.status === column.name.toLowerCase().replace(/\s+/g, '_')
    );
    if (columnTasks.length > 0) {
      const columnCycleTimes = columnTasks.map(task => {
        const created = new Date(task.createdAt).getTime();
        const updated = new Date(task.updatedAt).getTime();
        return (updated - created) / (1000 * 60 * 60 * 24);
      });
      byColumn[column.name] = columnCycleTimes.reduce((sum, time) => sum + time, 0) / columnCycleTimes.length;
    }
  });

  // Déterminer la tendance (simulation)
  const trend: 'improving' | 'stable' | 'declining' = average < 5 ? 'improving' : average > 10 ? 'declining' : 'stable';

  return {
    average,
    byColumn,
    trend
  };
}

function calculateThroughput(completedTasks: Task[], totalTasks: Task[], timeRange: string) {
  const completedCount = completedTasks.length;
  const totalCount = totalTasks.length;
  
  let daily = 0;
  let weekly = 0;
  let monthly = 0;

  switch (timeRange) {
    case 'week':
      daily = completedCount / 7;
      weekly = completedCount;
      monthly = completedCount * 4.33;
      break;
    case 'month':
      daily = completedCount / 30;
      weekly = completedCount / 4.33;
      monthly = completedCount;
      break;
    case 'quarter':
      daily = completedCount / 90;
      weekly = completedCount / 12.86;
      monthly = completedCount / 3;
      break;
  }

  return {
    daily: Math.round(daily * 100) / 100,
    weekly: Math.round(weekly * 100) / 100,
    monthly: Math.round(monthly * 100) / 100,
    completedTasks: completedCount,
    totalTasks: totalCount
  };
}

function analyzeWipLimits(columns: KanbanColumn[]) {
  const current: Record<string, number> = {};
  const recommended: Record<string, number> = {};
  const violations: string[] = [];

  columns.forEach(column => {
    current[column.name] = column.tasks.length;
    
    // Recommandation basée sur la taille de l'équipe (simulation)
    recommended[column.name] = Math.max(2, Math.ceil(column.tasks.length * 0.8));
    
    // Vérifier les violations
    if (column.wipLimit && column.tasks.length > column.wipLimit) {
      violations.push(column.name);
    }
  });

  return {
    current,
    recommended,
    violations
  };
}

function detectBottlenecks(columns: KanbanColumn[], activeTasks: Task[]) {
  const bottlenecks: {
    column: string;
    severity: 'low' | 'medium' | 'high';
    reason: string;
    suggestion: string;
  }[] = [];

  columns.forEach(column => {
    const taskCount = column.tasks.length;
    const avgAge = calculateAverageAge(column.tasks);
    
    // Détection basée sur le nombre de tâches et l'âge moyen
    if (taskCount > 5 && avgAge > 7) {
      bottlenecks.push({
        column: column.name,
        severity: 'high',
        reason: `${taskCount} tâches avec un âge moyen de ${avgAge.toFixed(1)} jours`,
        suggestion: 'Réduire le WIP et prioriser les tâches les plus anciennes'
      });
    } else if (taskCount > 3 && avgAge > 5) {
      bottlenecks.push({
        column: column.name,
        severity: 'medium',
        reason: `Accumulation de ${taskCount} tâches`,
        suggestion: 'Examiner les dépendances et les blocages'
      });
    } else if (taskCount > 2 && avgAge > 3) {
      bottlenecks.push({
        column: column.name,
        severity: 'low',
        reason: 'Flux légèrement ralenti',
        suggestion: 'Surveiller l\'évolution et optimiser si nécessaire'
      });
    }
  });

  return bottlenecks;
}

function calculateFlowEfficiency(completedTasks: Task[]) {
  if (completedTasks.length === 0) {
    return {
      percentage: 0,
      activeTime: 0,
      waitTime: 0
    };
  }

  // Simulation de l'efficacité du flux
  const totalTime = completedTasks.reduce((sum, task) => {
    const created = new Date(task.createdAt).getTime();
    const completed = new Date(task.updatedAt).getTime();
    return sum + (completed - created);
  }, 0);

  const activeTime = totalTime * 0.7; // 70% du temps actif (simulation)
  const waitTime = totalTime * 0.3; // 30% du temps d'attente
  const percentage = (activeTime / totalTime) * 100;

  return {
    percentage: Math.round(percentage),
    activeTime: Math.round(activeTime / (1000 * 60 * 60)), // en heures
    waitTime: Math.round(waitTime / (1000 * 60 * 60)) // en heures
  };
}

function calculateLeadTime(completedTasks: Task[]) {
  if (completedTasks.length === 0) {
    return {
      average: 0,
      p50: 0,
      p90: 0,
      p95: 0
    };
  }

  const leadTimes = completedTasks.map(task => {
    const created = new Date(task.createdAt).getTime();
    const completed = new Date(task.updatedAt).getTime();
    return (completed - created) / (1000 * 60 * 60 * 24); // en jours
  }).sort((a, b) => a - b);

  const average = leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length;
  const p50 = leadTimes[Math.floor(leadTimes.length * 0.5)];
  const p90 = leadTimes[Math.floor(leadTimes.length * 0.9)];
  const p95 = leadTimes[Math.floor(leadTimes.length * 0.95)];

  return {
    average: Math.round(average * 100) / 100,
    p50: Math.round(p50 * 100) / 100,
    p90: Math.round(p90 * 100) / 100,
    p95: Math.round(p95 * 100) / 100
  };
}

function generateCumulativeFlowData(tasks: Task[], columns: KanbanColumn[], timeRange: string) {
  const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
  const data = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const dayData: Record<string, number> = {};
    columns.forEach(column => {
      // Simulation de données historiques
      dayData[column.name] = Math.floor(Math.random() * 10) + column.tasks.length;
    });

    data.push({
      date: date.toISOString().split('T')[0],
      columns: dayData
    });
  }

  return data;
}

function calculateAverageAge(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  
  const now = Date.now();
  const totalAge = tasks.reduce((sum, task) => {
    const created = new Date(task.createdAt).getTime();
    return sum + (now - created);
  }, 0);
  
  return totalAge / tasks.length / (1000 * 60 * 60 * 24); // en jours
}

function calculateTaskCycleTime(task: Task): number {
  if (!task.completed) return 0;
  
  const created = new Date(task.createdAt).getTime();
  const completed = new Date(task.updatedAt).getTime();
  return (completed - created) / (1000 * 60 * 60 * 24); // en jours
}

function calculateTaskLeadTime(task: Task): number {
  const created = new Date(task.createdAt).getTime();
  const now = task.completed ? new Date(task.updatedAt).getTime() : Date.now();
  return (now - created) / (1000 * 60 * 60 * 24); // en jours
}

function calculateTimeInCurrentColumn(task: Task): number {
  // Simulation - dans un vrai système, on aurait l'historique des mouvements
  const updated = new Date(task.updatedAt).getTime();
  const now = Date.now();
  return (now - updated) / (1000 * 60 * 60 * 24); // en jours
}

function calculateBlockedTime(task: Task): number {
  // Simulation - détection basée sur les tags ou statuts
  const hasBlockedTag = task.tags.some(tag => 
    tag.toLowerCase().includes('blocked') || 
    tag.toLowerCase().includes('bloqué')
  );
  
  return hasBlockedTag ? Math.random() * 3 : 0; // 0-3 jours si bloqué
}

function getEmptyMetrics(): KanbanMetrics {
  return {
    cycleTime: {
      average: 0,
      byColumn: {},
      trend: 'stable'
    },
    throughput: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      completedTasks: 0,
      totalTasks: 0
    },
    wipLimits: {
      current: {},
      recommended: {},
      violations: []
    },
    bottlenecks: [],
    flowEfficiency: {
      percentage: 0,
      activeTime: 0,
      waitTime: 0
    },
    leadTime: {
      average: 0,
      p50: 0,
      p90: 0,
      p95: 0
    },
    cumulativeFlow: []
  };
}

export default useKanbanMetrics;