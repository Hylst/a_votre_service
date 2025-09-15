/**
 * SavingsGoals.tsx
 * Component for managing savings goals - creating, tracking, and visualizing progress
 * Handles goal creation, progress updates, and completion tracking
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, Target, Calendar as CalendarIcon, TrendingUp, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import { SavingsGoal, PREDEFINED_GOALS } from "./types/budget.types";

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onGoalsChange: (goals: SavingsGoal[]) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  goals,
  onGoalsChange
}) => {
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: undefined as Date | undefined,
    selectedPredefined: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [showCalendar, setShowCalendar] = useState(false);

  /**
   * Handle predefined goal selection
   */
  const handlePredefinedGoalSelect = (goalName: string) => {
    const predefined = PREDEFINED_GOALS.find(g => g.name === goalName);
    if (predefined) {
      setNewGoal({
        name: predefined.name,
        targetAmount: predefined.targetAmount?.toString() || '',
        currentAmount: '0',
        targetDate: predefined.monthsDuration ? 
          new Date(Date.now() + predefined.monthsDuration * 30 * 24 * 60 * 60 * 1000) : 
          undefined,
        selectedPredefined: goalName,
        priority: predefined.priority || 'medium'
      });
    }
  };

  /**
   * Add a new savings goal
   */
  const addGoal = () => {
    if (newGoal.name && newGoal.targetAmount) {
      const targetAmount = parseFloat(newGoal.targetAmount) || 0;
      const currentAmount = parseFloat(newGoal.currentAmount) || 0;
      
      const goalData: SavingsGoal = {
        id: Date.now().toString(),
        name: newGoal.name,
        targetAmount,
        currentAmount,
        targetDate: newGoal.targetDate ? newGoal.targetDate.toISOString() : '',
        priority: newGoal.priority,
        completedAt: undefined
      };
      
      onGoalsChange([...goals, goalData]);
      setNewGoal({ 
        name: '', 
        targetAmount: '', 
        currentAmount: '', 
        targetDate: undefined, 
        selectedPredefined: '',
        priority: 'medium'
      });
      
      toast({
        title: "Objectif d'épargne ajouté",
        description: `L'objectif "${goalData.name}" a été créé avec succès.`,
      });
    }
  };

  /**
   * Remove a savings goal
   */
  const removeGoal = (id: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== id);
    onGoalsChange(updatedGoals);
  };

  /**
   * Update current amount for a goal
   */
  const updateCurrentAmount = (id: string, currentAmount: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === id) {
        const updatedGoal = { ...goal, currentAmount };
        
        // Check if goal is completed
        if (currentAmount >= goal.targetAmount && !goal.completedAt) {
          updatedGoal.completedAt = new Date().toISOString();
          toast({
            title: "🎉 Objectif atteint !",
            description: `Félicitations ! Vous avez atteint votre objectif "${goal.name}".`,
          });
        }
        
        return updatedGoal;
      }
      return goal;
    });
    onGoalsChange(updatedGoals);
  };

  /**
   * Get progress percentage for a goal
   */
  const getProgress = (goal: SavingsGoal): number => {
    return goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  };

  /**
   * Get progress color based on completion
   */
  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-gray-400";
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get priority label
   */
  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return 'Moyenne';
    }
  };

  /**
   * Calculate days remaining until target date
   */
  const getDaysRemaining = (targetDate?: Date): number | null => {
    if (!targetDate) return null;
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  /**
   * Calculate monthly savings needed
   */
  const getMonthlySavingsNeeded = (goal: SavingsGoal): number => {
    const remaining = goal.targetAmount - goal.currentAmount;
    const daysRemaining = getDaysRemaining(new Date(goal.targetDate));
    
    if (!daysRemaining || daysRemaining <= 0) return remaining;
    
    const monthsRemaining = daysRemaining / 30;
    return remaining / monthsRemaining;
  };

  // Sort goals by priority and completion status
  const sortedGoals = [...goals].sort((a, b) => {
    // Completed goals go to bottom
    if (a.completedAt && !b.completedAt) return 1;
    if (!a.completedAt && b.completedAt) return -1;
    
    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const activeGoals = sortedGoals.filter(goal => !goal.completedAt);
  const completedGoals = sortedGoals.filter(goal => goal.completedAt);

  return (
    <div className="space-y-6">
      {/* Add New Goal */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Nouvel objectif d'épargne
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="predefined-goal">Objectif prédéfini</Label>
              <Select 
                value={newGoal.selectedPredefined} 
                onValueChange={handlePredefinedGoalSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un objectif" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Objectif personnalisé</SelectItem>
                  {PREDEFINED_GOALS.map(goal => (
                    <SelectItem key={goal.name} value={goal.name}>
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="goal-name">Nom de l'objectif</Label>
              <Input
                id="goal-name"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                placeholder="Ex: Vacances d'été"
              />
            </div>
            
            <div>
              <Label htmlFor="target-amount">Montant cible (€)</Label>
              <Input
                id="target-amount"
                type="number"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="current-amount">Montant actuel (€)</Label>
              <Input
                id="current-amount"
                type="number"
                value={newGoal.currentAmount}
                onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label>Date cible</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newGoal.targetDate ? format(newGoal.targetDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newGoal.targetDate}
                    onSelect={(date) => {
                      setNewGoal({ ...newGoal, targetDate: date });
                      setShowCalendar(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select 
                value={newGoal.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setNewGoal({ ...newGoal, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={addGoal} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Créer l'objectif
          </Button>
        </CardContent>
      </Card>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Objectifs en cours ({activeGoals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activeGoals.map(goal => {
                const progress = getProgress(goal);
                const daysRemaining = getDaysRemaining(new Date(goal.targetDate));
                const monthlySavingsNeeded = getMonthlySavingsNeeded(goal);
                
                return (
                  <div key={goal.id} className="p-4 bg-secondary rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{goal.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge className={getPriorityColor(goal.priority)}>
                              {getPriorityLabel(goal.priority)}
                            </Badge>
                            {goal.targetDate && (
                              <Badge variant="outline">
                                {daysRemaining !== null && daysRemaining > 0 
                                  ? `${daysRemaining} jours restants`
                                  : "Échéance dépassée"
                                }
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Montant actuel (€)</Label>
                        <Input
                          type="number"
                          value={goal.currentAmount}
                          onChange={(e) => updateCurrentAmount(goal.id, parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Montant cible</Label>
                        <div className="mt-1 p-2 bg-background rounded border">
                          {goal.targetAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progression</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={`h-3 ${getProgressColor(progress)}`}
                      />
                      <div className="flex justify-between text-sm mt-1 text-muted-foreground">
                        <span>{goal.currentAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                        <span>{goal.targetAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                    </div>
                    
                    {monthlySavingsNeeded > 0 && daysRemaining && daysRemaining > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Épargne mensuelle recommandée :</strong> {' '}
                          {monthlySavingsNeeded.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Objectifs atteints ({completedGoals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedGoals.map(goal => (
                <div key={goal.id} className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-800">{goal.name}</h4>
                        <p className="text-sm text-green-600">
                          Atteint le {goal.completedAt && format(new Date(goal.completedAt), "PPP", { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-800">
                        {goal.targetAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </p>
                      <Badge className="bg-green-100 text-green-800">100%</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};