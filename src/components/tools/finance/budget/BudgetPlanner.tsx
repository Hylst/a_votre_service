/**
 * BudgetPlanner.tsx
 * Main budget planning component - orchestrates all budget modules
 * Handles state management, data persistence, and component coordination
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Download, Upload, History, Lightbulb, PieChart as PieChartIcon, Target, Wallet } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Import modular components
import { BudgetCategories } from "./BudgetCategories";
import { SavingsGoals } from "./SavingsGoals";
import { BudgetCharts } from "./BudgetCharts";
import { BudgetCategory, SavingsGoal, BudgetSummary, BudgetAlert, MonthlyBudget, OptimizationSuggestion } from "./types/budget.types";

export const BudgetPlanner = () => {
  // State management
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyBudget[]>([]);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('categories');

  /**
   * Load data from localStorage on component mount
   */
  useEffect(() => {
    const savedCategories = localStorage.getItem('budgetCategories');
    const savedGoals = localStorage.getItem('savingsGoals');
    const savedHistory = localStorage.getItem('monthlyHistory');
    
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    }
    
    if (savedGoals) {
      try {
        setSavingsGoals(JSON.parse(savedGoals));
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    }
    
    if (savedHistory) {
      try {
        setMonthlyHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  /**
   * Save data to localStorage when state changes
   */
  useEffect(() => {
    localStorage.setItem('budgetCategories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('monthlyHistory', JSON.stringify(monthlyHistory));
  }, [monthlyHistory]);

  /**
   * Calculate budget summary
   */
  const calculateSummary = (): BudgetSummary => {
    const totalIncome = categories
      .filter(cat => cat.type === 'income')
      .reduce((sum, cat) => sum + cat.spent, 0);
    
    const totalExpenses = categories
      .filter(cat => cat.type === 'expense')
      .reduce((sum, cat) => sum + cat.spent, 0);
    
    const totalBudgeted = categories
      .filter(cat => cat.type === 'expense')
      .reduce((sum, cat) => sum + cat.budgeted, 0);
    
    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
    
    return {
      totalIncome,
      totalExpenses,
      totalBudgeted,
      remaining: totalIncome - totalExpenses,
      netIncome,
      savingsRate
    };
  };

  /**
   * Generate budget alerts
   */
  const generateAlerts = (): BudgetAlert[] => {
    const newAlerts: BudgetAlert[] = [];
    
    // Category overspending alerts
    categories.forEach(category => {
      if (category.type === 'expense') {
        const percentage = category.budgeted > 0 ? (category.spent / category.budgeted) * 100 : 0;
        
        if (category.spent > category.budgeted) {
          newAlerts.push({
            id: `overspend-${category.id}`,
            type: 'danger',
            severity: 'high',
            title: 'Dépassement de budget',
            message: `${category.name}: ${(category.spent - category.budgeted).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} de dépassement`,
            suggestion: `Réduisez vos dépenses en ${category.name} ou augmentez le budget alloué.`,
            categoryId: category.id
          });
        } else if (percentage > 90) {
          newAlerts.push({
            id: `warning-${category.id}`,
            type: 'warning',
            severity: 'medium',
            title: 'Budget presque épuisé',
            message: `${category.name}: ${percentage.toFixed(1)}% du budget utilisé`,
            suggestion: `Surveillez vos dépenses en ${category.name} pour éviter un dépassement.`,
            categoryId: category.id
          });
        }
      }
    });
    
    // Savings goals alerts
    savingsGoals.forEach(goal => {
      if (!goal.completedAt && goal.targetDate) {
        const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        
        if (daysLeft < 0) {
          newAlerts.push({
            id: `goal-overdue-${goal.id}`,
            type: 'danger',
            severity: 'high',
            title: 'Objectif en retard',
            message: `"${goal.name}" échéance dépassée (${progress.toFixed(1)}% atteint)`,
            suggestion: 'Révisez votre objectif ou augmentez vos contributions mensuelles.'
          });
        } else if (daysLeft <= 30 && progress < 80) {
          newAlerts.push({
            id: `goal-behind-${goal.id}`,
            type: 'warning',
            severity: 'medium',
            title: 'Objectif en retard',
            message: `"${goal.name}": ${progress.toFixed(1)}% en ${daysLeft} jours`,
            suggestion: `Augmentez vos contributions pour atteindre votre objectif à temps.`
          });
        }
      }
    });
    
    // Overall budget alert
    const summary = calculateSummary();
    if (summary.netIncome < 0) {
      newAlerts.push({
        id: 'negative-balance',
        type: 'danger',
        severity: 'high',
        title: 'Budget global dépassé',
        message: `Déficit de ${Math.abs(summary.netIncome).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`,
        suggestion: 'Réduisez vos dépenses ou augmentez vos revenus pour équilibrer votre budget.'
      });
    }
    
    return newAlerts;
  };

  /**
   * Generate optimization suggestions
   */
  const generateOptimizationSuggestions = (): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];
    const summary = calculateSummary();
    
    // Overspending suggestions
    const overBudgetCategories = categories.filter(cat => 
      cat.type === 'expense' && cat.spent > cat.budgeted
    );
    
    overBudgetCategories.forEach(category => {
      const excess = category.spent - category.budgeted;
      suggestions.push({
        id: `reduce-${category.id}`,
        type: 'reduce',
        title: 'Réduction recommandée',
        message: `Réduire les dépenses en ${category.name}`,
        potentialSaving: excess,
        priority: 'high'
      });
    });
    
    // Savings surplus suggestion
    if (summary.netIncome > 100) {
      suggestions.push({
        id: 'save-surplus',
        type: 'save',
        title: 'Opportunité d\'épargne',
        message: `Créer un objectif d'épargne avec le surplus`,
        potentialSaving: summary.netIncome,
        priority: 'medium'
      });
    }
    
    // Budget reallocation suggestions
    const underBudgetCategories = categories.filter(cat => 
      cat.type === 'expense' && cat.spent < cat.budgeted * 0.7
    );
    
    if (underBudgetCategories.length > 0 && overBudgetCategories.length > 0) {
      const totalUnderused = underBudgetCategories.reduce((sum, cat) => 
        sum + (cat.budgeted - cat.spent), 0
      );
      suggestions.push({
        id: 'reallocate-budget',
        type: 'reallocate',
        title: 'Réallocation suggérée',
        message: `Réalloquer le budget des catégories sous-utilisées`,
        potentialSaving: totalUnderused,
        priority: 'medium'
      });
    }
    
    return suggestions;
  };

  /**
   * Export budget data
   */
  const exportData = () => {
    const data = {
      categories,
      savingsGoals,
      monthlyHistory,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export réussi",
      description: "Vos données de budget ont été exportées avec succès.",
    });
  };

  /**
   * Import budget data
   */
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.categories) setCategories(data.categories);
        if (data.savingsGoals) setSavingsGoals(data.savingsGoals);
        if (data.monthlyHistory) setMonthlyHistory(data.monthlyHistory);
        
        toast({
          title: "Import réussi",
          description: "Vos données de budget ont été importées avec succès.",
        });
      } catch (error) {
        toast({
          title: "Erreur d'import",
          description: "Le fichier sélectionné n'est pas valide.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  /**
   * Save current month to history
   */
  const saveCurrentMonth = () => {
    const currentDate = new Date();
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    const newMonthlyBudget: MonthlyBudget = {
      id: `${currentDate.getFullYear()}-${currentDate.getMonth()}`,
      month: monthNames[currentDate.getMonth()],
      year: currentDate.getFullYear(),
      categories: [...categories],
      summary: calculateSummary(),
      savingsGoals: [...savingsGoals]
    };
    
    setMonthlyHistory(prev => {
      const filtered = prev.filter(m => m.id !== newMonthlyBudget.id);
      return [newMonthlyBudget, ...filtered].slice(0, 12); // Keep only 12 months
    });
    
    toast({
      title: "Mois sauvegardé",
      description: "Le budget du mois actuel a été ajouté à l'historique.",
    });
  };

  /**
   * Get all unique tags from categories
   */
  const getAllTags = () => {
    const allTags = categories.flatMap(cat => cat.tags || []);
    return [...new Set(allTags)].sort();
  };

  /**
   * Get monthly trend data for charts
   */
  const getMonthlyTrendData = () => {
    return monthlyHistory.slice(0, 6).reverse().map(month => ({
      month: `${month.month.substring(0, 3)} ${month.year}`,
      income: month.summary.totalIncome,
      expenses: month.summary.totalExpenses,
      savings: month.summary.netIncome
    }));
  };

  // Update alerts and suggestions when data changes
  useEffect(() => {
    setAlerts(generateAlerts());
    setSuggestions(generateOptimizationSuggestions());
  }, [categories, savingsGoals]);

  const summary = calculateSummary();
  const allTags = getAllTags();
  const monthlyTrendData = getMonthlyTrendData();

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Planificateur de Budget</h1>
          <p className="text-muted-foreground">Gérez vos finances personnelles efficacement</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <label>
              <Upload className="h-4 w-4 mr-2" />
              Importer
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </Button>
          
          <Button onClick={saveCurrentMonth} variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            Sauvegarder le mois
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <Alert key={alert.id} className={`${
              alert.type === 'danger' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
              alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
              'border-blue-500 bg-blue-50 dark:bg-blue-950'
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.title}:</strong> {alert.message}
                {alert.suggestion && (
                  <div className="mt-1 text-sm opacity-80">
                    💡 {alert.suggestion}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
          {alerts.length > 3 && (
            <p className="text-sm text-muted-foreground text-center">
              +{alerts.length - 3} autres alertes dans l'onglet Analyses
            </p>
          )}
        </div>
      )}

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-4">
          <Label htmlFor="tag-filter">Filtrer par tag:</Label>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Catégories
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Objectifs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Analyses
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Conseils
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <BudgetCategories
            categories={categories}
            onCategoriesChange={setCategories}
            tagFilter={tagFilter}
          />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <SavingsGoals
            goals={savingsGoals}
            onGoalsChange={setSavingsGoals}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <BudgetCharts
            categories={categories}
            goals={savingsGoals}
            summary={summary}
            alerts={alerts}
            monthlyData={monthlyTrendData}
          />
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          {/* Optimization Suggestions */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Suggestions d'optimisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestions.length > 0 ? (
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-4 bg-secondary rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {suggestion.message}
                          </p>
                          {suggestion.potentialSaving && (
                            <p className="text-sm font-medium text-green-600 mt-2">
                              Économie potentielle: {suggestion.potentialSaving.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </p>
                          )}
                        </div>
                        <Badge variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}>
                          {suggestion.priority === 'high' ? 'Priorité haute' : 
                           suggestion.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Aucune suggestion d'optimisation pour le moment.
                  Continuez à utiliser votre budget pour recevoir des conseils personnalisés.
                </p>
              )}
            </CardContent>
          </Card>

          {/* All Alerts */}
          {alerts.length > 0 && (
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Toutes les alertes ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg ${
                      alert.type === 'danger' ? 'bg-red-50 text-red-800' :
                      alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                      'bg-blue-50 text-blue-800'
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm mt-1">{alert.message}</p>
                          {alert.suggestion && (
                            <p className="text-sm mt-2 font-medium">
                              💡 {alert.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};