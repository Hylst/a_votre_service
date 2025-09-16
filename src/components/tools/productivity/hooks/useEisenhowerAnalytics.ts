/**
 * useEisenhowerAnalytics.ts - Hook pour les analyses et insights de la matrice d'Eisenhower
 * Fournit des analyses de productivité, tendances temporelles et recommandations
 */

import { useState, useEffect, useMemo } from 'react';
import { Task } from './useTaskManager';

export interface EisenhowerAnalytics {
  distribution: {
    urgent_important: number;
    urgent_not_important: number;
    not_urgent_important: number;
    not_urgent_not_important: number;
    percentages: {
      urgent_important: number;
      urgent_not_important: number;
      not_urgent_important: number;
      not_urgent_not_important: number;
    };
  };
  timeDistribution: {
    quadrant: string;
    timeSpent: number;
    percentage: number;
    averageTaskDuration: number;
  }[];
  productivityInsights: {
    score: number;
    level: 'low' | 'medium' | 'high' | 'excellent';
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
  trends: {
    period: string;
    date: string;
    quadrants: {
      urgent_important: number;
      urgent_not_important: number;
      not_urgent_important: number;
      not_urgent_not_important: number;
    };
    completionRate: number;
    productivityScore: number;
  }[];
  taskPrioritization: {
    overdue: Task[];
    dueToday: Task[];
    dueThisWeek: Task[];
    strategic: Task[];
    quickWins: Task[];
  };
  focusMetrics: {
    focusTime: number;
    distractionTime: number;
    focusRatio: number;
    optimalQuadrantTime: number;
    suboptimalQuadrantTime: number;
  };
  burnoutRisk: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    suggestions: string[];
    urgentTasksRatio: number;
  };
}

export type EisenhowerQuadrant = 
  | 'urgent_important' 
  | 'urgent_not_important' 
  | 'not_urgent_important' 
  | 'not_urgent_not_important';

interface UseEisenhowerAnalyticsOptions {
  tasks: Task[];
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  autoRefresh?: boolean;
  refreshInterval?: number;
  includeCompleted?: boolean;
}

interface UseEisenhowerAnalyticsReturn {
  analytics: EisenhowerAnalytics;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => void;
  getQuadrantTasks: (quadrant: EisenhowerQuadrant) => Task[];
  getTaskQuadrant: (task: Task) => EisenhowerQuadrant;
  getProductivityTrend: () => 'improving' | 'stable' | 'declining';
  getRecommendedActions: () => {
    action: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }[];
}

export const useEisenhowerAnalytics = ({
  tasks,
  timeRange = 'month',
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
  includeCompleted = true
}: UseEisenhowerAnalyticsOptions): UseEisenhowerAnalyticsReturn => {
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

  // Fonction pour déterminer le quadrant d'une tâche
  const getTaskQuadrant = (task: Task): EisenhowerQuadrant => {
    const isUrgent = isTaskUrgent(task);
    const isImportant = isTaskImportant(task);

    if (isUrgent && isImportant) return 'urgent_important';
    if (isUrgent && !isImportant) return 'urgent_not_important';
    if (!isUrgent && isImportant) return 'not_urgent_important';
    return 'not_urgent_not_important';
  };

  // Calcul des analyses principales
  const analytics = useMemo((): EisenhowerAnalytics => {
    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const timeRangeMs = getTimeRangeMs(timeRange);
      const startDate = new Date(now.getTime() - timeRangeMs);

      // Filtrer les tâches selon les critères
      const filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        const inTimeRange = taskDate >= startDate;
        const shouldInclude = includeCompleted || !task.completed;
        return inTimeRange && shouldInclude;
      });

      // Calcul de la distribution
      const distribution = calculateDistribution(filteredTasks, getTaskQuadrant);
      
      // Calcul de la distribution temporelle
      const timeDistribution = calculateTimeDistribution(filteredTasks, getTaskQuadrant);
      
      // Analyse des insights de productivité
      const productivityInsights = analyzeProductivityInsights(filteredTasks, distribution);
      
      // Calcul des tendances
      const trends = calculateTrends(tasks, timeRange, getTaskQuadrant);
      
      // Priorisation des tâches
      const taskPrioritization = analyzeTaskPrioritization(filteredTasks);
      
      // Métriques de focus
      const focusMetrics = calculateFocusMetrics(filteredTasks, getTaskQuadrant);
      
      // Analyse du risque de burnout
      const burnoutRisk = analyzeBurnoutRisk(filteredTasks, distribution);

      return {
        distribution,
        timeDistribution,
        productivityInsights,
        trends,
        taskPrioritization,
        focusMetrics,
        burnoutRisk
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du calcul des analyses');
      return getEmptyAnalytics();
    } finally {
      setIsLoading(false);
    }
  }, [tasks, timeRange, includeCompleted, lastRefresh]);

  // Fonction pour rafraîchir manuellement
  const refreshAnalytics = () => {
    setLastRefresh(Date.now());
  };

  // Obtenir les tâches d'un quadrant spécifique
  const getQuadrantTasks = (quadrant: EisenhowerQuadrant): Task[] => {
    return tasks.filter(task => getTaskQuadrant(task) === quadrant);
  };

  // Obtenir la tendance de productivité
  const getProductivityTrend = (): 'improving' | 'stable' | 'declining' => {
    if (analytics.trends.length < 2) return 'stable';
    
    const recent = analytics.trends.slice(-3);
    const scores = recent.map(t => t.productivityScore);
    
    const avgRecent = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const avgPrevious = analytics.trends.slice(-6, -3)
      .map(t => t.productivityScore)
      .reduce((sum, score) => sum + score, 0) / 3;
    
    if (avgRecent > avgPrevious + 5) return 'improving';
    if (avgRecent < avgPrevious - 5) return 'declining';
    return 'stable';
  };

  // Obtenir les actions recommandées
  const getRecommendedActions = () => {
    const actions: {
      action: string;
      priority: 'high' | 'medium' | 'low';
      description: string;
    }[] = [];

    const { distribution, burnoutRisk, focusMetrics } = analytics;

    // Recommandations basées sur la distribution
    if (distribution.percentages.urgent_important > 40) {
      actions.push({
        action: 'Réduire les tâches urgentes et importantes',
        priority: 'high',
        description: 'Trop de tâches en mode "crise". Planifiez mieux pour éviter l\'urgence.'
      });
    }

    if (distribution.percentages.urgent_not_important > 30) {
      actions.push({
        action: 'Déléguer les tâches urgentes non importantes',
        priority: 'high',
        description: 'Ces tâches vous font perdre du temps. Déléguez ou éliminez-les.'
      });
    }

    if (distribution.percentages.not_urgent_important < 25) {
      actions.push({
        action: 'Investir plus dans le quadrant stratégique',
        priority: 'medium',
        description: 'Consacrez plus de temps aux tâches importantes non urgentes.'
      });
    }

    // Recommandations basées sur le risque de burnout
    if (burnoutRisk.level === 'high') {
      actions.push({
        action: 'Prendre des mesures anti-burnout',
        priority: 'high',
        description: 'Réduisez votre charge de travail et prenez des pauses régulières.'
      });
    }

    // Recommandations basées sur les métriques de focus
    if (focusMetrics.focusRatio < 0.6) {
      actions.push({
        action: 'Améliorer la concentration',
        priority: 'medium',
        description: 'Éliminez les distractions et concentrez-vous sur les tâches importantes.'
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics,
    getQuadrantTasks,
    getTaskQuadrant,
    getProductivityTrend,
    getRecommendedActions
  };
};

// Fonctions utilitaires

function getTimeRangeMs(timeRange: 'week' | 'month' | 'quarter' | 'year'): number {
  switch (timeRange) {
    case 'week':
      return 7 * 24 * 60 * 60 * 1000;
    case 'month':
      return 30 * 24 * 60 * 60 * 1000;
    case 'quarter':
      return 90 * 24 * 60 * 60 * 1000;
    case 'year':
      return 365 * 24 * 60 * 60 * 1000;
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}

function isTaskUrgent(task: Task): boolean {
  const now = new Date();
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  
  // Urgent si échéance dans les 2 jours ou déjà dépassée
  if (dueDate) {
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    if (daysDiff <= 2) return true;
  }
  
  // Urgent si contient des mots-clés d'urgence
  const urgentKeywords = ['urgent', 'asap', 'immédiat', 'critique', 'emergency'];
  const taskText = `${task.title} ${task.description}`.toLowerCase();
  
  return urgentKeywords.some(keyword => taskText.includes(keyword));
}

function isTaskImportant(task: Task): boolean {
  // Important si priorité élevée
  if (task.priority === 'high') return true;
  
  // Important si contient des mots-clés d'importance
  const importantKeywords = [
    'stratégique', 'objectif', 'goal', 'important', 'crucial', 
    'essentiel', 'priorité', 'key', 'critical', 'vital'
  ];
  const taskText = `${task.title} ${task.description}`.toLowerCase();
  
  return importantKeywords.some(keyword => taskText.includes(keyword));
}

function calculateDistribution(
  tasks: Task[], 
  getTaskQuadrant: (task: Task) => EisenhowerQuadrant
) {
  const counts = {
    urgent_important: 0,
    urgent_not_important: 0,
    not_urgent_important: 0,
    not_urgent_not_important: 0
  };

  tasks.forEach(task => {
    const quadrant = getTaskQuadrant(task);
    counts[quadrant]++;
  });

  const total = tasks.length || 1;
  const percentages = {
    urgent_important: Math.round((counts.urgent_important / total) * 100),
    urgent_not_important: Math.round((counts.urgent_not_important / total) * 100),
    not_urgent_important: Math.round((counts.not_urgent_important / total) * 100),
    not_urgent_not_important: Math.round((counts.not_urgent_not_important / total) * 100)
  };

  return {
    ...counts,
    percentages
  };
}

function calculateTimeDistribution(
  tasks: Task[], 
  getTaskQuadrant: (task: Task) => EisenhowerQuadrant
) {
  const quadrantData: Record<string, { tasks: Task[], totalTime: number }> = {
    'Urgent & Important': { tasks: [], totalTime: 0 },
    'Urgent & Not Important': { tasks: [], totalTime: 0 },
    'Not Urgent & Important': { tasks: [], totalTime: 0 },
    'Not Urgent & Not Important': { tasks: [], totalTime: 0 }
  };

  const quadrantMap = {
    urgent_important: 'Urgent & Important',
    urgent_not_important: 'Urgent & Not Important',
    not_urgent_important: 'Not Urgent & Important',
    not_urgent_not_important: 'Not Urgent & Not Important'
  };

  tasks.forEach(task => {
    const quadrant = getTaskQuadrant(task);
    const quadrantName = quadrantMap[quadrant];
    const estimatedTime = getTaskEstimatedTime(task);
    
    quadrantData[quadrantName].tasks.push(task);
    quadrantData[quadrantName].totalTime += estimatedTime;
  });

  const totalTime = Object.values(quadrantData).reduce((sum, data) => sum + data.totalTime, 0) || 1;

  return Object.entries(quadrantData).map(([quadrant, data]) => ({
    quadrant,
    timeSpent: data.totalTime,
    percentage: Math.round((data.totalTime / totalTime) * 100),
    averageTaskDuration: data.tasks.length > 0 ? data.totalTime / data.tasks.length : 0
  }));
}

function getTaskEstimatedTime(task: Task): number {
  // Estimation basée sur la complexité et la priorité
  let baseTime = 2; // 2 heures par défaut
  
  if (task.priority === 'high') baseTime *= 1.5;
  if (task.priority === 'low') baseTime *= 0.5;
  
  // Ajustement basé sur la description
  const description = task.description.toLowerCase();
  if (description.includes('quick') || description.includes('rapide')) baseTime *= 0.5;
  if (description.includes('complex') || description.includes('complexe')) baseTime *= 2;
  
  return baseTime;
}

function analyzeProductivityInsights(
  tasks: Task[], 
  distribution: ReturnType<typeof calculateDistribution>
) {
  const completedTasks = tasks.filter(task => task.completed);
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  
  // Calcul du score de productivité
  let score = 0;
  
  // Points pour la distribution optimale
  score += Math.max(0, 25 - distribution.percentages.urgent_important); // Moins de crises
  score += Math.max(0, 20 - distribution.percentages.urgent_not_important); // Moins de distractions
  score += Math.min(40, distribution.percentages.not_urgent_important); // Plus de stratégique
  score += Math.min(15, distribution.percentages.not_urgent_not_important); // Peu de temps perdu
  
  // Points pour le taux de completion
  score += completionRate * 0.3;
  
  score = Math.min(100, Math.max(0, score));
  
  const level = score >= 80 ? 'excellent' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low';
  
  const strengths: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];
  
  // Analyse des forces
  if (distribution.percentages.not_urgent_important > 30) {
    strengths.push('Bon focus sur les tâches stratégiques');
  }
  if (distribution.percentages.urgent_important < 30) {
    strengths.push('Gestion proactive, peu de crises');
  }
  if (completionRate > 70) {
    strengths.push('Excellent taux de completion des tâches');
  }
  
  // Analyse des améliorations
  if (distribution.percentages.urgent_not_important > 25) {
    improvements.push('Réduire les interruptions et distractions');
    recommendations.push('Déléguez ou éliminez les tâches urgentes non importantes');
  }
  if (distribution.percentages.urgent_important > 40) {
    improvements.push('Améliorer la planification pour éviter les crises');
    recommendations.push('Planifiez à l\'avance et anticipez les échéances');
  }
  if (distribution.percentages.not_urgent_important < 20) {
    improvements.push('Investir plus dans le développement à long terme');
    recommendations.push('Bloquez du temps pour les tâches importantes non urgentes');
  }
  
  return {
    score: Math.round(score),
    level: level as 'low' | 'medium' | 'high' | 'excellent',
    strengths,
    improvements,
    recommendations
  };
}

function calculateTrends(
  tasks: Task[], 
  timeRange: string, 
  getTaskQuadrant: (task: Task) => EisenhowerQuadrant
) {
  const periods = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
  const trends = [];
  
  for (let i = periods; i >= 0; i -= Math.ceil(periods / 10)) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - i);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - Math.ceil(periods / 10));
    
    const periodTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= endDate;
    });
    
    const distribution = calculateDistribution(periodTasks, getTaskQuadrant);
    const completedTasks = periodTasks.filter(task => task.completed);
    const completionRate = periodTasks.length > 0 ? (completedTasks.length / periodTasks.length) * 100 : 0;
    
    // Score de productivité simplifié
    const productivityScore = Math.round(
      (distribution.percentages.not_urgent_important * 0.4) +
      (Math.max(0, 50 - distribution.percentages.urgent_important) * 0.3) +
      (completionRate * 0.3)
    );
    
    trends.push({
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      date: endDate.toISOString().split('T')[0],
      quadrants: {
        urgent_important: distribution.urgent_important,
        urgent_not_important: distribution.urgent_not_important,
        not_urgent_important: distribution.not_urgent_important,
        not_urgent_not_important: distribution.not_urgent_not_important
      },
      completionRate: Math.round(completionRate),
      productivityScore
    });
  }
  
  return trends;
}

function analyzeTaskPrioritization(tasks: Task[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const overdue = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < today;
  });
  
  const dueToday = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
  });
  
  const dueThisWeek = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate > new Date(today.getTime() + 24 * 60 * 60 * 1000) && dueDate <= weekFromNow;
  });
  
  const strategic = tasks.filter(task => {
    if (task.completed) return false;
    return isTaskImportant(task) && !isTaskUrgent(task);
  });
  
  const quickWins = tasks.filter(task => {
    if (task.completed) return false;
    const estimatedTime = getTaskEstimatedTime(task);
    return estimatedTime <= 1 && (task.priority === 'medium' || task.priority === 'high');
  });
  
  return {
    overdue,
    dueToday,
    dueThisWeek,
    strategic,
    quickWins
  };
}

function calculateFocusMetrics(
  tasks: Task[], 
  getTaskQuadrant: (task: Task) => EisenhowerQuadrant
) {
  const totalTime = tasks.reduce((sum, task) => sum + getTaskEstimatedTime(task), 0);
  
  let focusTime = 0;
  let distractionTime = 0;
  let optimalQuadrantTime = 0;
  let suboptimalQuadrantTime = 0;
  
  tasks.forEach(task => {
    const quadrant = getTaskQuadrant(task);
    const taskTime = getTaskEstimatedTime(task);
    
    if (quadrant === 'not_urgent_important') {
      focusTime += taskTime;
      optimalQuadrantTime += taskTime;
    } else if (quadrant === 'urgent_important') {
      focusTime += taskTime * 0.7; // Moins optimal mais nécessaire
      optimalQuadrantTime += taskTime * 0.7;
    } else if (quadrant === 'urgent_not_important') {
      distractionTime += taskTime;
      suboptimalQuadrantTime += taskTime;
    } else {
      distractionTime += taskTime * 0.5;
      suboptimalQuadrantTime += taskTime * 0.5;
    }
  });
  
  const focusRatio = totalTime > 0 ? focusTime / totalTime : 0;
  
  return {
    focusTime: Math.round(focusTime),
    distractionTime: Math.round(distractionTime),
    focusRatio: Math.round(focusRatio * 100) / 100,
    optimalQuadrantTime: Math.round(optimalQuadrantTime),
    suboptimalQuadrantTime: Math.round(suboptimalQuadrantTime)
  };
}

function analyzeBurnoutRisk(
  tasks: Task[], 
  distribution: ReturnType<typeof calculateDistribution>
) {
  const factors: string[] = [];
  const suggestions: string[] = [];
  
  const urgentTasksRatio = (distribution.urgent_important + distribution.urgent_not_important) / (tasks.length || 1);
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  
  // Facteurs de risque
  if (urgentTasksRatio > 0.6) {
    factors.push('Trop de tâches urgentes (>60%)');
    suggestions.push('Planifiez mieux pour réduire l\'urgence');
    riskLevel = 'high';
  } else if (urgentTasksRatio > 0.4) {
    factors.push('Proportion élevée de tâches urgentes');
    suggestions.push('Améliorez votre planification');
    riskLevel = 'medium';
  }
  
  if (distribution.percentages.urgent_important > 50) {
    factors.push('Mode "crise" permanent');
    suggestions.push('Déléguez et priorisez mieux');
    riskLevel = 'high';
  }
  
  const incompleteTasks = tasks.filter(task => !task.completed);
  if (incompleteTasks.length > 20) {
    factors.push('Surcharge de tâches en cours');
    suggestions.push('Réduisez votre charge de travail');
    if (riskLevel === 'low') riskLevel = 'medium';
  }
  
  // Suggestions générales
  if (riskLevel === 'high') {
    suggestions.push('Prenez des pauses régulières');
    suggestions.push('Considérez déléguer certaines responsabilités');
  }
  
  return {
    level: riskLevel,
    factors,
    suggestions,
    urgentTasksRatio: Math.round(urgentTasksRatio * 100)
  };
}

function getEmptyAnalytics(): EisenhowerAnalytics {
  return {
    distribution: {
      urgent_important: 0,
      urgent_not_important: 0,
      not_urgent_important: 0,
      not_urgent_not_important: 0,
      percentages: {
        urgent_important: 0,
        urgent_not_important: 0,
        not_urgent_important: 0,
        not_urgent_not_important: 0
      }
    },
    timeDistribution: [],
    productivityInsights: {
      score: 0,
      level: 'low',
      strengths: [],
      improvements: [],
      recommendations: []
    },
    trends: [],
    taskPrioritization: {
      overdue: [],
      dueToday: [],
      dueThisWeek: [],
      strategic: [],
      quickWins: []
    },
    focusMetrics: {
      focusTime: 0,
      distractionTime: 0,
      focusRatio: 0,
      optimalQuadrantTime: 0,
      suboptimalQuadrantTime: 0
    },
    burnoutRisk: {
      level: 'low',
      factors: [],
      suggestions: [],
      urgentTasksRatio: 0
    }
  };
}

export default useEisenhowerAnalytics;