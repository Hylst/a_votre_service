/**
 * EisenhowerAnalytics.tsx - Composant d'analyse pour la matrice d'Eisenhower
 * Fournit des insights sur la distribution du temps et les tendances de productivité
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Zap,
  Archive,
  BarChart3,
  Lightbulb,
  Calendar
} from 'lucide-react';
import { Task } from '../hooks/useTaskManager';

// Interface pour les analytics Eisenhower
interface EisenhowerAnalytics {
  timeDistribution: {
    urgentImportant: { count: number; percentage: number; avgTime: number };
    importantNotUrgent: { count: number; percentage: number; avgTime: number };
    urgentNotImportant: { count: number; percentage: number; avgTime: number };
    notUrgentNotImportant: { count: number; percentage: number; avgTime: number };
  };
  productivityInsights: {
    focusScore: number;
    planningScore: number;
    delegationOpportunities: number;
    timeWasters: number;
    overallEfficiency: number;
  };
  trends: {
    weeklyCompletion: { quadrant: string; trend: 'up' | 'down' | 'stable'; change: number }[];
    priorityShift: 'improving' | 'declining' | 'stable';
    burnoutRisk: 'low' | 'medium' | 'high';
  };
  recommendations: {
    type: 'focus' | 'planning' | 'delegation' | 'elimination';
    message: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

// Props du composant
interface EisenhowerAnalyticsProps {
  tasks: Task[];
  className?: string;
}

// Définition des quadrants
const QUADRANTS = {
  'urgent-important': { name: 'Urgent & Important', icon: AlertTriangle, color: 'text-red-500' },
  'important-not-urgent': { name: 'Important & Non Urgent', icon: Target, color: 'text-blue-500' },
  'urgent-not-important': { name: 'Urgent & Non Important', icon: Zap, color: 'text-yellow-500' },
  'not-urgent-not-important': { name: 'Non Urgent & Non Important', icon: Archive, color: 'text-gray-500' }
};

const EisenhowerAnalytics: React.FC<EisenhowerAnalyticsProps> = ({ tasks, className }) => {
  // Calcul des analytics
  const analytics = useMemo((): EisenhowerAnalytics => {
    const totalTasks = tasks.length;
    
    // Simulation de la classification des tâches par quadrant basée sur la priorité et les tags
    const classifyTask = (task: Task): keyof typeof QUADRANTS => {
      const hasUrgentTag = task.tags.some(tag => 
        tag.toLowerCase().includes('urgent') || 
        tag.toLowerCase().includes('deadline') ||
        task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      );
      
      const isImportant = task.priority === 'high' || 
        task.tags.some(tag => 
          tag.toLowerCase().includes('important') ||
          tag.toLowerCase().includes('critical')
        );
      
      if (hasUrgentTag && isImportant) return 'urgent-important';
      if (!hasUrgentTag && isImportant) return 'important-not-urgent';
      if (hasUrgentTag && !isImportant) return 'urgent-not-important';
      return 'not-urgent-not-important';
    };

    // Distribution des tâches par quadrant
    const distribution = {
      'urgent-important': tasks.filter(t => classifyTask(t) === 'urgent-important'),
      'important-not-urgent': tasks.filter(t => classifyTask(t) === 'important-not-urgent'),
      'urgent-not-important': tasks.filter(t => classifyTask(t) === 'urgent-not-important'),
      'not-urgent-not-important': tasks.filter(t => classifyTask(t) === 'not-urgent-not-important')
    };

    // Calcul de la distribution temporelle
    const timeDistribution = {
      urgentImportant: {
        count: distribution['urgent-important'].length,
        percentage: totalTasks > 0 ? (distribution['urgent-important'].length / totalTasks) * 100 : 0,
        avgTime: distribution['urgent-important'].reduce((acc, t) => acc + (t.estimatedDuration || 60), 0) / Math.max(distribution['urgent-important'].length, 1)
      },
      importantNotUrgent: {
        count: distribution['important-not-urgent'].length,
        percentage: totalTasks > 0 ? (distribution['important-not-urgent'].length / totalTasks) * 100 : 0,
        avgTime: distribution['important-not-urgent'].reduce((acc, t) => acc + (t.estimatedDuration || 45), 0) / Math.max(distribution['important-not-urgent'].length, 1)
      },
      urgentNotImportant: {
        count: distribution['urgent-not-important'].length,
        percentage: totalTasks > 0 ? (distribution['urgent-not-important'].length / totalTasks) * 100 : 0,
        avgTime: distribution['urgent-not-important'].reduce((acc, t) => acc + (t.estimatedDuration || 30), 0) / Math.max(distribution['urgent-not-important'].length, 1)
      },
      notUrgentNotImportant: {
        count: distribution['not-urgent-not-important'].length,
        percentage: totalTasks > 0 ? (distribution['not-urgent-not-important'].length / totalTasks) * 100 : 0,
        avgTime: distribution['not-urgent-not-important'].reduce((acc, t) => acc + (t.estimatedDuration || 20), 0) / Math.max(distribution['not-urgent-not-important'].length, 1)
      }
    };

    // Calcul des insights de productivité
    const focusScore = Math.max(0, 100 - timeDistribution.urgentImportant.percentage * 2); // Moins de crises = meilleur focus
    const planningScore = timeDistribution.importantNotUrgent.percentage * 2; // Plus de planification = mieux
    const delegationOpportunities = timeDistribution.urgentNotImportant.count;
    const timeWasters = timeDistribution.notUrgentNotImportant.count;
    const overallEfficiency = (focusScore + planningScore) / 2;

    const productivityInsights = {
      focusScore: Math.min(100, focusScore),
      planningScore: Math.min(100, planningScore),
      delegationOpportunities,
      timeWasters,
      overallEfficiency: Math.min(100, overallEfficiency)
    };

    // Calcul des tendances (simulation)
    const weeklyCompletion = [
      { quadrant: 'Urgent & Important', trend: 'down' as const, change: -15 },
      { quadrant: 'Important & Non Urgent', trend: 'up' as const, change: 25 },
      { quadrant: 'Urgent & Non Important', trend: 'stable' as const, change: 0 },
      { quadrant: 'Non Urgent & Non Important', trend: 'down' as const, change: -30 }
    ];

    const priorityShift = timeDistribution.importantNotUrgent.percentage > 40 ? 'improving' as const :
                        timeDistribution.urgentImportant.percentage > 30 ? 'declining' as const : 'stable' as const;
    
    const burnoutRisk = timeDistribution.urgentImportant.percentage > 40 ? 'high' as const :
                       timeDistribution.urgentImportant.percentage > 25 ? 'medium' as const : 'low' as const;

    const trends = {
      weeklyCompletion,
      priorityShift,
      burnoutRisk
    };

    // Génération des recommandations
    const recommendations = [];
    
    if (timeDistribution.urgentImportant.percentage > 25) {
      recommendations.push({
        type: 'focus' as const,
        message: 'Trop de tâches en mode crise. Planifiez davantage pour éviter l\'urgence.',
        priority: 'high' as const
      });
    }
    
    if (timeDistribution.importantNotUrgent.percentage < 30) {
      recommendations.push({
        type: 'planning' as const,
        message: 'Augmentez le temps consacré à la planification et aux tâches importantes non urgentes.',
        priority: 'high' as const
      });
    }
    
    if (delegationOpportunities > 3) {
      recommendations.push({
        type: 'delegation' as const,
        message: `${delegationOpportunities} tâches urgentes mais peu importantes pourraient être déléguées.`,
        priority: 'medium' as const
      });
    }
    
    if (timeWasters > 2) {
      recommendations.push({
        type: 'elimination' as const,
        message: `${timeWasters} tâches peu importantes consomment du temps. Considérez les éliminer.`,
        priority: 'medium' as const
      });
    }

    return {
      timeDistribution,
      productivityInsights,
      trends,
      recommendations
    };
  }, [tasks]);

  // Fonction pour obtenir la couleur selon le score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Fonction pour obtenir l'icône de tendance
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête des analytics */}
      <div className="flex items-center gap-2">
        <PieChart className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Analytics Eisenhower</h3>
      </div>

      {/* Scores de productivité */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score de Focus */}
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Score de Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(analytics.productivityInsights.focusScore)}`}>
              {analytics.productivityInsights.focusScore.toFixed(0)}/100
            </div>
            <Progress value={analytics.productivityInsights.focusScore} className="mt-2" />
          </CardContent>
        </Card>

        {/* Score de Planification */}
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Score de Planification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(analytics.productivityInsights.planningScore)}`}>
              {analytics.productivityInsights.planningScore.toFixed(0)}/100
            </div>
            <Progress value={analytics.productivityInsights.planningScore} className="mt-2" />
          </CardContent>
        </Card>

        {/* Opportunités de Délégation */}
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              À Déléguer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.productivityInsights.delegationOpportunities}</div>
            <div className="text-xs text-muted-foreground mt-1">tâches urgentes</div>
          </CardContent>
        </Card>

        {/* Efficacité Globale */}
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Efficacité Globale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(analytics.productivityInsights.overallEfficiency)}`}>
              {analytics.productivityInsights.overallEfficiency.toFixed(0)}%
            </div>
            <Progress value={analytics.productivityInsights.overallEfficiency} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Distribution du temps par quadrant */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Distribution du Temps par Quadrant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(analytics.timeDistribution).map(([key, data]) => {
            const quadrantKey = key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') as keyof typeof QUADRANTS;
            const quadrant = QUADRANTS[quadrantKey] || QUADRANTS['not-urgent-not-important'];
            const Icon = quadrant.icon;
            
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${quadrant.color}`} />
                    <span className="text-sm font-medium">{quadrant.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {data.count} tâches • {data.avgTime.toFixed(0)}min moy.
                    </span>
                    <Badge variant="secondary">{data.percentage.toFixed(1)}%</Badge>
                  </div>
                </div>
                <Progress value={data.percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Tendances hebdomadaires */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Tendances Hebdomadaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.trends.weeklyCompletion.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div className="flex items-center gap-3">
                  {getTrendIcon(trend.trend)}
                  <span className="font-medium text-sm">{trend.quadrant}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${
                    trend.change > 0 ? 'text-green-600' : 
                    trend.change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trend.change > 0 ? '+' : ''}{trend.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Évolution des Priorités:</span>
              <Badge variant={analytics.trends.priorityShift === 'improving' ? 'default' : 
                            analytics.trends.priorityShift === 'declining' ? 'destructive' : 'secondary'}>
                {analytics.trends.priorityShift === 'improving' ? 'En amélioration' :
                 analytics.trends.priorityShift === 'declining' ? 'En déclin' : 'Stable'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risque de Burnout:</span>
              <Badge variant={analytics.trends.burnoutRisk === 'high' ? 'destructive' :
                            analytics.trends.burnoutRisk === 'medium' ? 'secondary' : 'default'}>
                {analytics.trends.burnoutRisk === 'high' ? 'Élevé' :
                 analytics.trends.burnoutRisk === 'medium' ? 'Modéré' : 'Faible'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      {analytics.recommendations.length > 0 && (
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Recommandations Personnalisées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                  <div className="flex-shrink-0 mt-0.5">
                    {rec.type === 'focus' && <Target className="w-4 h-4 text-blue-500" />}
                    {rec.type === 'planning' && <Calendar className="w-4 h-4 text-green-500" />}
                    {rec.type === 'delegation' && <Zap className="w-4 h-4 text-yellow-500" />}
                    {rec.type === 'elimination' && <Archive className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{rec.message}</p>
                  </div>
                  <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                    {rec.priority === 'high' ? 'Priorité' : 'Suggestion'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EisenhowerAnalytics;