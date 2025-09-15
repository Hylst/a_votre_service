/**
 * BudgetCategories.tsx
 * Component for managing budget categories - adding, editing, removing, and displaying categories
 * Handles both income and expense categories with predefined options
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Home, Car, ShoppingCart, Gamepad2, Heart, GraduationCap, Plane, Coffee, Gift, Wallet, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { BudgetCategory, PREDEFINED_CATEGORIES } from "./types/budget.types";

interface BudgetCategoriesProps {
  categories: BudgetCategory[];
  onCategoriesChange: (categories: BudgetCategory[]) => void;
  tagFilter?: string;
}

/**
 * Get icon component by name
 */
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    Home, Car, ShoppingCart, Gamepad2, Heart, GraduationCap, 
    Plane, Coffee, Gift, Wallet, TrendingUp
  };
  return iconMap[iconName] || ShoppingCart;
};

export const BudgetCategories: React.FC<BudgetCategoriesProps> = ({
  categories,
  onCategoriesChange,
  tagFilter = ''
}) => {
  const [newCategory, setNewCategory] = useState({
    name: '',
    budgeted: '',
    type: 'expense' as 'income' | 'expense',
    selectedPredefined: '',
    tags: ''
  });

  /**
   * Get all unique tags from categories
   */
  const getAllTags = () => {
    const allTags = categories.flatMap(cat => cat.tags || []);
    return [...new Set(allTags)].sort();
  };

  /**
   * Filter categories by tag
   */
  const getFilteredCategories = () => {
    if (!tagFilter || tagFilter === 'all') return categories;
    return categories.filter(cat => 
      cat.tags && cat.tags.some(tag => 
        tag.toLowerCase().includes(tagFilter.toLowerCase())
      )
    );
  };

  /**
   * Handle predefined category selection
   */
  const handlePredefinedCategorySelect = (categoryName: string) => {
    const predefined = PREDEFINED_CATEGORIES.find(p => p.name === categoryName);
    if (predefined) {
      setNewCategory({
        name: predefined.name,
        budgeted: predefined.suggestedBudget?.toString() || '',
        type: predefined.type,
        selectedPredefined: categoryName,
        tags: ''
      });
    }
  };

  /**
   * Add a new budget category
   */
  const addCategory = () => {
    if (newCategory.name && (newCategory.budgeted || newCategory.selectedPredefined)) {
      const tags = newCategory.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      // Determine the budgeted amount
      let budgetedAmount = parseFloat(newCategory.budgeted) || 0;
      
      // If a predefined category is selected and no manual budget is set, use suggested budget
      if (newCategory.selectedPredefined && (!newCategory.budgeted || budgetedAmount === 0)) {
        const predefined = PREDEFINED_CATEGORIES.find(p => p.name === newCategory.selectedPredefined);
        if (predefined && predefined.suggestedBudget) {
          budgetedAmount = predefined.suggestedBudget;
        }
      }
      
      let categoryData: BudgetCategory = {
        id: Date.now().toString(),
        name: newCategory.name,
        budgeted: budgetedAmount,
        spent: 0,
        type: newCategory.type,
        tags: tags
      };

      // If a predefined category is selected, add icon and color
      if (newCategory.selectedPredefined) {
        const predefined = PREDEFINED_CATEGORIES.find(p => p.name === newCategory.selectedPredefined);
        if (predefined) {
          categoryData = {
            ...categoryData,
            name: predefined.name, // Use predefined name
            icon: predefined.icon,
            color: predefined.color,
            type: predefined.type // Use predefined type
          };
        }
      }
      
      onCategoriesChange([...categories, categoryData]);
      setNewCategory({ name: '', budgeted: '', type: 'expense', selectedPredefined: '', tags: '' });
      
      toast({
        title: "Catégorie ajoutée",
        description: `La catégorie "${categoryData.name}" a été ajoutée avec succès.`,
      });
    }
  };

  /**
   * Remove a budget category
   */
  const removeCategory = (id: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== id);
    onCategoriesChange(updatedCategories);
  };

  /**
   * Update spent amount for a category
   */
  const updateSpent = (id: string, spent: number) => {
    const updatedCategories = categories.map(cat => 
      cat.id === id ? { ...cat, spent } : cat
    );
    onCategoriesChange(updatedCategories);
  };

  /**
   * Update budgeted amount for a category
   */
  const updateBudgeted = (id: string, budgeted: number) => {
    const updatedCategories = categories.map(cat => 
      cat.id === id ? { ...cat, budgeted } : cat
    );
    onCategoriesChange(updatedCategories);
  };

  /**
   * Get progress percentage for expense categories
   */
  const getProgress = (category: BudgetCategory): number => {
    if (category.type === 'income') return 100;
    return category.budgeted > 0 ? (category.spent / category.budgeted) * 100 : 0;
  };

  /**
   * Get progress color based on spending
   */
  const getProgressColor = (progress: number): string => {
    if (progress <= 75) return "bg-green-500";
    if (progress <= 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredCategories = getFilteredCategories();
  const incomeCategories = filteredCategories.filter(cat => cat.type === 'income');
  const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense');

  return (
    <div className="space-y-6">
      {/* Add New Category */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter une catégorie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="predefined-category">Catégorie prédéfinie</Label>
              <Select 
                value={newCategory.selectedPredefined} 
                onValueChange={handlePredefinedCategorySelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Catégorie personnalisée</SelectItem>
                  {PREDEFINED_CATEGORIES.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name} ({cat.type === 'income' ? 'Revenu' : 'Dépense'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category-name">Nom de la catégorie</Label>
              <Input
                id="category-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Ex: Alimentation"
              />
            </div>
            
            <div>
              <Label htmlFor="category-budget">Budget (€)</Label>
              <Input
                id="category-budget"
                type="number"
                value={newCategory.budgeted}
                onChange={(e) => setNewCategory({ ...newCategory, budgeted: e.target.value })}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="category-type">Type</Label>
              <Select 
                value={newCategory.type} 
                onValueChange={(value: 'income' | 'expense') => 
                  setNewCategory({ ...newCategory, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Revenu</SelectItem>
                  <SelectItem value="expense">Dépense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="category-tags">Tags (séparés par des virgules)</Label>
              <Input
                id="category-tags"
                value={newCategory.tags}
                onChange={(e) => setNewCategory({ ...newCategory, tags: e.target.value })}
                placeholder="Ex: essentiel, mensuel, variable"
              />
            </div>
          </div>
          
          <Button onClick={addCategory} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter la catégorie
          </Button>
        </CardContent>
      </Card>

      {/* Income Categories */}
      {incomeCategories.length > 0 && (
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-green-600">Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incomeCategories.map(category => {
                const IconComponent = category.icon ? getIconComponent(category.icon) : Wallet;
                return (
                  <div key={category.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-full"
                        style={{ backgroundColor: category.color || '#10B981' }}
                      >
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        {category.tags && category.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {category.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Input
                          type="number"
                          value={category.spent}
                          onChange={(e) => updateSpent(category.id, parseFloat(e.target.value) || 0)}
                          className="w-24 text-right"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.spent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense Categories */}
      {expenseCategories.length > 0 && (
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-red-600">Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseCategories.map(category => {
                const progress = getProgress(category);
                const IconComponent = category.icon ? getIconComponent(category.icon) : ShoppingCart;
                return (
                  <div key={category.id} className="p-4 bg-secondary rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-full"
                          style={{ backgroundColor: category.color || '#EF4444' }}
                        >
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          {category.tags && category.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {category.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Dépensé (€)</Label>
                        <Input
                          type="number"
                          value={category.spent}
                          onChange={(e) => updateSpent(category.id, parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Budget (€)</Label>
                        <Input
                          type="number"
                          value={category.budgeted}
                          onChange={(e) => updateBudgeted(category.id, parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progression</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={`h-2 ${getProgressColor(progress)}`}
                      />
                      <div className="flex justify-between text-sm mt-1 text-muted-foreground">
                        <span>{category.spent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                        <span>{category.budgeted.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};