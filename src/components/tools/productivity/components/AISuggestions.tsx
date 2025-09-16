/**
 * AISuggestions.tsx - Composant de suggestions IA pour les outils de productivité
 * Affiche des suggestions automatiques pour la classification Eisenhower et Kanban
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Target, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Task } from '../hooks/useTaskManager';
import { 
  analyzeTaskForSuggestions, 
  generateProductivityInsights,
  EisenhowerSuggestion,
  KanbanSuggestion
} from '../utils/aiSuggestions';

// Props du composant
interface AISuggestionsProps {
  task?: Task;
  tasks?: Task[];
  onApplySuggestion?: (taskId: string, suggestion: { type: 'eisenhower' | 'kanban'; value: string }) => void;
  className?: string;
  mode?: 'single' | 'batch' | 'insights';
}

// Composant pour afficher une suggestion individuelle
interface SuggestionCardProps {
  title: string;
  suggestion: EisenhowerSuggestion | KanbanSuggestion;
  icon: React.ComponentType<{ className?: string }>;
  onApply?: () => void;
  type: 'eisenhower' | 'kanban';
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  title, 
  suggestion, 
  icon: Icon, 
  onApply, 
  type 
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return 'default';
    if (confidence >= 60) return 'secondary';
    return 'outline';
  };

  const getSuggestionValue = () => {
    if (type === 'eisenhower') {
      const eisenhowerSuggestion = suggestion as EisenhowerSuggestion;
      const quadrantNames = {
        'urgent-important': 'Urgent & Important',
        'important-not-urgent': 'Important & Non Urgent',
        'urgent-not-important': 'Urgent & Non Important',
        'not-urgent-not-important': 'Non Urgent & Non Important'
      };
      return quadrantNames[eisenhowerSuggestion.quadrant];
    } else {
      const kanbanSuggestion = suggestion as KanbanSuggestion;
      const columnNames = {
        'todo': 'À Faire',
        'in-progress': 'En Cours',
        'review': 'Révision',
        'done': 'Terminé'
      };
      return columnNames[kanbanSuggestion.column];
    }
  };

  return (
    <Card className="bg-card text-card-foreground border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            {title}
          </div>
          <Badge variant={getConfidenceBadge(suggestion.confidence)}>
            {suggestion.confidence.toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">{getSuggestionValue()}</span>
          {onApply && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onApply}
              className="flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              Appliquer
            </Button>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                suggestion.confidence >= 80 ? 'bg-green-500' :
                suggestion.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${suggestion.confidence}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
            Confiance
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const AISuggestions: React.FC<AISuggestionsProps> = ({ 
  task, 
  tasks = [], 
  onApplySuggestion, 
  className,
  mode = 'single'
}) => {
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeTaskForSuggestions> | null>(null);
  const [insights, setInsights] = useState<ReturnType<typeof generateProductivityInsights> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyse de la tâche individuelle
  useEffect(() => {
    if (task && mode === 'single') {
      setIsAnalyzing(true);
      // Simulation d'un délai d'analyse IA
      const timer = setTimeout(() => {
        const result = analyzeTaskForSuggestions(task);
        setAnalysis(result);
        setIsAnalyzing(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [task, mode]);

  // Analyse des insights de productivité
  useEffect(() => {
    if (tasks.length > 0 && mode === 'insights') {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        const result = generateProductivityInsights(tasks);
        setInsights(result);
        setIsAnalyzing(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [tasks, mode]);

  // Gestionnaire d'application des suggestions
  const handleApplySuggestion = (type: 'eisenhower' | 'kanban') => {
    if (!task || !analysis || !onApplySuggestion) return;
    
    const value = type === 'eisenhower' 
      ? analysis.eisenhower.quadrant 
      : analysis.kanban.column;
    
    onApplySuggestion(task.id, { type, value });
  };

  // Mode analyse de tâche individuelle
  if (mode === 'single') {
    if (!task) {
      return (
        <Alert className={className}>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Sélectionnez une tâche pour voir les suggestions IA.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className={`space-y-4 ${className}`}>
        {/* En-tête */}
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Suggestions IA</h3>
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Analyse en cours...
            </div>
          )}
        </div>

        {analysis && !isAnalyzing && (
          <>
            {/* Suggestions principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SuggestionCard
                title="Classification Eisenhower"
                suggestion={analysis.eisenhower}
                icon={Target}
                onApply={() => handleApplySuggestion('eisenhower')}
                type="eisenhower"
              />
              
              <SuggestionCard
                title="Colonne Kanban"
                suggestion={analysis.kanban}
                icon={Zap}
                onApply={() => handleApplySuggestion('kanban')}
                type="kanban"
              />
            </div>

            {/* Insights supplémentaires */}
            {analysis.insights.length > 0 && (
              <Card className="bg-card text-card-foreground">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Insights Supplémentaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <ArrowRight className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{insight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  }

  // Mode insights de productivité
  if (mode === 'insights') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* En-tête */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Insights de Productivité</h3>
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Analyse en cours...
            </div>
          )}
        </div>

        {insights && !isAnalyzing && (
          <div className="space-y-4">
            {/* Suggestions */}
            {insights.suggestions.length > 0 && (
              <Card className="bg-card text-card-foreground">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Alertes de Productivité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.suggestions.map((suggestion, index) => (
                      <Alert key={index} className="border-orange-200 dark:border-orange-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Patterns détectés */}
            {insights.patterns.length > 0 && (
              <Card className="bg-card text-card-foreground">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Patterns Détectés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.patterns.map((pattern, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 rounded bg-secondary">
                        <ArrowRight className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <span className="text-sm">{pattern}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommandations */}
            {insights.recommendations.length > 0 && (
              <Card className="bg-card text-card-foreground">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-green-500" />
                    Recommandations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-green-800 dark:text-green-200">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Message si pas d'insights */}
        {insights && !isAnalyzing && 
         insights.suggestions.length === 0 && 
         insights.patterns.length === 0 && 
         insights.recommendations.length === 0 && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Excellente gestion des tâches ! Aucune amélioration majeure détectée.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Mode batch (pour traitement de plusieurs tâches)
  if (mode === 'batch') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Suggestions Batch</h3>
        </div>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Le mode batch pour traiter plusieurs tâches simultanément sera disponible prochainement.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
};

export default AISuggestions;