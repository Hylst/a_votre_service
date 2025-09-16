/**
 * KanbanMetrics.tsx - Composant d'analyse et métriques pour le tableau Kanban
 * Fournit des statistiques avancées sur les performances du workflow Kanban
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Activity,
  Timer,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Task } from '../hooks/useTaskManager';

// Interface pour les métriques Kanban
interface KanbanMetrics {
  cycleTime: {
    average: number;
    byColumn: Record<string, number>;
    trend: 'up' | 'down' | 'stable';
  };
  wipLimits: {
    todo: { current: number; limit: number; status: 'ok' | 'warning' | 'exceeded' };
    inProgress: { current: number; limit: number; status: 'ok' | 'warning' | 'exceeded' };
    review: { current: number; limit: number; status: 'ok' | 'warning' | 'exceeded' };
  };
  throughput: {
    daily: number;
    weekly: number;
    completionRate: number;
    trend: 'up' | 'down' | 'stable';
  };
  bottlenecks: {
    column: string;
    severity: 'low' | 'medium' | 'high';
    taskCount: number;
    avgTime: number;
  }[];
  leadTime: {
    average: number;
    p50: number;
    p90: number;
  };
}

// Props du composant
interface KanbanMetricsProps {
  tasks: Task[];
  className?: string;
}

// Colonnes Kanban par défaut
const KANBAN_COLUMNS = {
  todo: 'À faire',
  'in-progress': 'En cours',
  review: 'En révision',
  done: 'Terminé'
};

// Limites WIP par défaut
const DEFAULT_WIP_LIMITS = {
  todo: 10,
  'in-progress': 3,
  review: 2
};

const KanbanMetrics: React.FC<KanbanMetricsProps> = ({ tasks, className }) => {
  // Calcul des métriques
  const metrics = useMemo((): KanbanMetrics => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Simulation de données de cycle time (en heures)
    const cycleTimeByColumn = {
      todo: 24,
      'in-progress': 48,
      review: 12,
      done: 0
    };

    // Calcul des tâches par colonne (simulation basée sur les statuts)
    const tasksByColumn = {
      todo: tasks.filter(t => !t.completed && t.priority === 'low').length,
      'in-progress': tasks.filter(t => !t.completed && t.priority === 'medium').length,
      review: tasks.filter(t => !t.completed && t.priority === 'high').length
    };

    // Calcul des limites WIP
    const wipLimits = {
      todo: {
        current: tasksByColumn.todo,
        limit: DEFAULT_WIP_LIMITS.todo,
        status: tasksByColumn.todo > DEFAULT_WIP_LIMITS.todo ? 'exceeded' as const :
                tasksByColumn.todo > DEFAULT_WIP_LIMITS.todo * 0.8 ? 'warning' as const : 'ok' as const
      },
      inProgress: {
        current: tasksByColumn['in-progress'],
        limit: DEFAULT_WIP_LIMITS['in-progress'],
        status: tasksByColumn['in-progress'] > DEFAULT_WIP_LIMITS['in-progress'] ? 'exceeded' as const :
                tasksByColumn['in-progress'] > DEFAULT_WIP_LIMITS['in-progress'] * 0.8 ? 'warning' as const : 'ok' as const
      },
      review: {
        current: tasksByColumn.review,
        limit: DEFAULT_WIP_LIMITS.review,
        status: tasksByColumn.review > DEFAULT_WIP_LIMITS.review ? 'exceeded' as const :
                tasksByColumn.review > DEFAULT_WIP_LIMITS.review * 0.8 ? 'warning' as const : 'ok' as const
      }
    };

    // Calcul du throughput
    const completedTasks = tasks.filter(t => t.completed);
    const recentCompletedTasks = completedTasks.filter(t => 
      new Date(t.updatedAt) > oneWeekAgo
    );
    const dailyCompletedTasks = completedTasks.filter(t => 
      new Date(t.updatedAt) > oneDayAgo
    );

    const throughput = {
      daily: dailyCompletedTasks.length,
      weekly: recentCompletedTasks.length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
      trend: 'stable' as const // Simulation
    };

    // Détection des goulots d'étranglement
    const bottlenecks = Object.entries(tasksByColumn)
      .map(([column, count]) => ({
        column: KANBAN_COLUMNS[column as keyof typeof KANBAN_COLUMNS],
        severity: count > 5 ? 'high' as const : count > 3 ? 'medium' as const : 'low' as const,
        taskCount: count,
        avgTime: cycleTimeByColumn[column as keyof typeof cycleTimeByColumn]
      }))
      .filter(b => b.severity !== 'low')
      .sort((a, b) => b.taskCount - a.taskCount);

    // Calcul du lead time
    const leadTime = {
      average: Object.values(cycleTimeByColumn).reduce((a, b) => a + b, 0) / 4,
      p50: 36, // Médiane simulée
      p90: 72  // 90e percentile simulé
    };

    return {
      cycleTime: {
        average: Object.values(cycleTimeByColumn).reduce((a, b) => a + b, 0) / 4,
        byColumn: cycleTimeByColumn,
        trend: 'stable'
      },
      wipLimits,
      throughput,
      bottlenecks,
      leadTime
    };
  }, [tasks]);

  // Fonction pour obtenir la couleur selon le statut WIP
  const getWipStatusColor = (status: 'ok' | 'warning' | 'exceeded') => {
    switch (status) {
      case 'ok': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'exceeded': return 'text-red-600 dark:text-red-400';
    }
  };

  // Fonction pour obtenir l'icône selon la sévérité
  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête des métriques */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Métriques Kanban</h3>
      </div>

      {/* Grille des métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cycle Time Moyen */}
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Cycle Time Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cycleTime.average.toFixed(1)}h</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3" />
              Stable cette semaine
            </div>
          </CardContent>
        </Card>

        {/* Throughput */}
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.throughput.weekly}</div>
            <div className="text-xs text-muted-foreground mt-1">
              tâches cette semaine
            </div>
          </CardContent>
        </Card>

        {/* Taux de Completion */}
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Taux de Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.throughput.completionRate.toFixed(1)}%</div>
            <Progress value={metrics.throughput.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        {/* Lead Time */}
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Lead Time (P90)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.leadTime.p90}h</div>
            <div className="text-xs text-muted-foreground mt-1">
              Médiane: {metrics.leadTime.p50}h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Limites WIP */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Limites Work In Progress (WIP)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(metrics.wipLimits).map(([column, data]) => {
            const percentage = (data.current / data.limit) * 100;
            return (
              <div key={column} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {column === 'inProgress' ? 'En cours' : column === 'todo' ? 'À faire' : 'En révision'}
                  </span>
                  <Badge 
                    variant={data.status === 'ok' ? 'secondary' : 'destructive'}
                    className={getWipStatusColor(data.status)}
                  >
                    {data.current}/{data.limit}
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className={`h-2 ${data.status === 'exceeded' ? 'bg-red-100' : ''}`}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Goulots d'étranglement */}
      {metrics.bottlenecks.length > 0 && (
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Goulots d'Étranglement Détectés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.bottlenecks.map((bottleneck, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(bottleneck.severity)}
                    <div>
                      <div className="font-medium text-sm">{bottleneck.column}</div>
                      <div className="text-xs text-muted-foreground">
                        {bottleneck.taskCount} tâches • {bottleneck.avgTime}h moyenne
                      </div>
                    </div>
                  </div>
                  <Badge variant={bottleneck.severity === 'high' ? 'destructive' : 'secondary'}>
                    {bottleneck.severity === 'high' ? 'Critique' : 'Attention'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cycle Time par Colonne */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Temps par Colonne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(metrics.cycleTime.byColumn).map(([column, time]) => {
              const columnName = KANBAN_COLUMNS[column as keyof typeof KANBAN_COLUMNS];
              const maxTime = Math.max(...Object.values(metrics.cycleTime.byColumn));
              const percentage = (time / maxTime) * 100;
              
              return (
                <div key={column} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{columnName}</span>
                    <span className="text-sm text-muted-foreground">{time}h</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanMetrics;