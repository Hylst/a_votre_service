/**
 * ExpenseTracker.tsx
 * Expense tracker with charts and analytics
 * Manages expenses by categories with visual analytics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FinancialWarning } from '@/components/ui/financial-warning';
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3,
  Home,
  Car,
  ShoppingCart,
  Utensils,
  Gamepad2,
  Heart,
  GraduationCap,
  Plane,
  DollarSign,
  Download,
  Settings,
  AlertTriangle,
  Target
} from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'expense' | 'income';
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  budget?: number;
}

interface MonthlyData {
  month: string;
  expenses: number;
  income: number;
  balance: number;
}

interface PredictionData {
  month: string;
  predicted: number;
  actual?: number;
  confidence: number;
}

interface CustomCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  budget?: number;
  isCustom: boolean;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      amount: 1200,
      category: 'housing',
      description: 'Loyer mensuel',
      date: '2024-01-01',
      type: 'expense'
    },
    {
      id: '2',
      amount: 3500,
      category: 'salary',
      description: 'Salaire',
      date: '2024-01-01',
      type: 'income'
    },
    {
      id: '3',
      amount: 450,
      category: 'food',
      description: 'Courses alimentaires',
      date: '2024-01-05',
      type: 'expense'
    },
    {
      id: '4',
      amount: 80,
      category: 'transport',
      description: 'Essence',
      date: '2024-01-07',
      type: 'expense'
    },
    {
      id: '5',
      amount: 120,
      category: 'entertainment',
      description: 'Cinéma et sorties',
      date: '2024-01-10',
      type: 'expense'
    }
  ]);

  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'expense' | 'income'
  });

  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', color: 'bg-blue-500', budget: '' });
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const defaultCategories: Category[] = [
    { id: 'housing', name: 'Logement', icon: <Home className="w-4 h-4" />, color: 'bg-blue-500', budget: 1000 },
    { id: 'food', name: 'Alimentation', icon: <Utensils className="w-4 h-4" />, color: 'bg-green-500', budget: 400 },
    { id: 'transport', name: 'Transport', icon: <Car className="w-4 h-4" />, color: 'bg-yellow-500', budget: 200 },
    { id: 'entertainment', name: 'Loisirs', icon: <Gamepad2 className="w-4 h-4" />, color: 'bg-purple-500', budget: 150 },
    { id: 'health', name: 'Santé', icon: <Heart className="w-4 h-4" />, color: 'bg-red-500', budget: 100 },
    { id: 'education', name: 'Éducation', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-indigo-500', budget: 200 },
    { id: 'travel', name: 'Voyage', icon: <Plane className="w-4 h-4" />, color: 'bg-cyan-500', budget: 300 },
    { id: 'shopping', name: 'Shopping', icon: <ShoppingCart className="w-4 h-4" />, color: 'bg-pink-500', budget: 250 },
    { id: 'salary', name: 'Salaire', icon: <DollarSign className="w-4 h-4" />, color: 'bg-emerald-500' },
    { id: 'other', name: 'Autre', icon: <Wallet className="w-4 h-4" />, color: 'bg-gray-500' }
  ];

  // Combine default and custom categories
  const categories = [...defaultCategories, ...customCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    budget: cat.budget
  }))];

  /**
   * Add new expense or income
   */
  const addExpense = () => {
    if (!newExpense.amount || !newExpense.category || !newExpense.description) {
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description,
      date: newExpense.date,
      type: newExpense.type
    };

    setExpenses(prev => [expense, ...prev]);
    setNewExpense({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense'
    });
  };

  /**
   * Delete expense
   */
  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  /**
   * Get category info
   */
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1];
  };

  /**
   * Calculate totals for current period
   */
  const calculateTotals = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      if (selectedPeriod === 'month') {
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      } else if (selectedPeriod === 'year') {
        return expenseDate.getFullYear() === currentYear;
      }
      return true;
    });

    const totalExpenses = filteredExpenses
      .filter(expense => expense.type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0);

    const totalIncome = filteredExpenses
      .filter(expense => expense.type === 'income')
      .reduce((sum, expense) => sum + expense.amount, 0);

    const balance = totalIncome - totalExpenses;

    return { totalExpenses, totalIncome, balance, filteredExpenses };
  };

  /**
   * Calculate expenses by category
   */
  const getExpensesByCategory = () => {
    const { filteredExpenses } = calculateTotals();
    const expensesByCategory = new Map<string, number>();

    filteredExpenses
      .filter(expense => expense.type === 'expense')
      .forEach(expense => {
        const current = expensesByCategory.get(expense.category) || 0;
        expensesByCategory.set(expense.category, current + expense.amount);
      });

    return Array.from(expensesByCategory.entries())
      .map(([categoryId, amount]) => ({
        category: getCategoryInfo(categoryId),
        amount,
        percentage: (amount / calculateTotals().totalExpenses) * 100
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  /**
   * Get monthly data for trend analysis
   */
  const getMonthlyData = (): MonthlyData[] => {
    const monthlyData = new Map<string, { expenses: number; income: number }>();
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { expenses: 0, income: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      if (expense.type === 'expense') {
        data.expenses += expense.amount;
      } else {
        data.income += expense.amount;
      }
    });
    
    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        expenses: data.expenses,
        income: data.income,
        balance: data.income - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  /**
   * Generate expense predictions based on historical data
   */
  const generatePredictions = (): PredictionData[] => {
    const monthlyData = getMonthlyData();
    if (monthlyData.length < 3) return [];

    const predictions: PredictionData[] = [];
    const avgExpenses = monthlyData.reduce((sum, data) => sum + data.expenses, 0) / monthlyData.length;
    const trend = monthlyData.length > 1 ? 
      (monthlyData[monthlyData.length - 1].expenses - monthlyData[0].expenses) / monthlyData.length : 0;

    // Generate next 3 months predictions
    for (let i = 1; i <= 3; i++) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + i);
      const monthKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
      
      const predicted = Math.max(0, avgExpenses + (trend * i));
      const confidence = Math.max(0.3, 1 - (i * 0.2)); // Decreasing confidence over time
      
      predictions.push({
        month: monthKey,
        predicted,
        confidence
      });
    }
    
    return predictions;
  };

  /**
   * Add custom category
   */
  const addCustomCategory = () => {
    if (!newCategory.name.trim()) return;
    
    const customCategory: CustomCategory = {
      id: `custom_${Date.now()}`,
      name: newCategory.name,
      icon: <Target className="w-4 h-4" />,
      color: newCategory.color,
      budget: newCategory.budget ? parseFloat(newCategory.budget) : undefined,
      isCustom: true
    };
    
    setCustomCategories(prev => [...prev, customCategory]);
    setNewCategory({ name: '', color: 'bg-blue-500', budget: '' });
    setShowCategoryDialog(false);
  };

  /**
   * Export data to CSV
   */
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Catégorie', 'Description', 'Montant'];
    const csvData = expenses.map(expense => [
      expense.date,
      expense.type === 'income' ? 'Revenu' : 'Dépense',
      getCategoryInfo(expense.category).name,
      expense.description,
      expense.amount.toString()
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Get chart data for pie chart
   */
  const getChartData = (): ChartData[] => {
    const expensesByCategory = getExpensesByCategory();
    return expensesByCategory.map(({ category, amount }) => ({
      name: category.name,
      value: amount,
      color: category.color.replace('bg-', '#').replace('-500', '')
    }));
  };

  // Generate predictions on component mount and when expenses change
  useEffect(() => {
    setPredictions(generatePredictions());
  }, [expenses]);

  const { totalExpenses, totalIncome, balance } = calculateTotals();
  const expensesByCategory = getExpensesByCategory();
  const monthlyData = getMonthlyData();
  const chartData = getChartData();
  const colorPalette = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899', '#6366F1'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-semibold text-foreground">Gestionnaire de Dépenses</h2>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-background text-foreground">
                <Settings className="w-4 h-4 mr-2" />
                Catégories
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>Ajouter une Catégorie Personnalisée</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Nom de la catégorie</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Abonnements"
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryBudget">Budget mensuel (€)</Label>
                  <Input
                    id="categoryBudget"
                    type="number"
                    value={newCategory.budget}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="0.00"
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Couleur</Label>
                  <div className="flex gap-2">
                    {['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-pink-500'].map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${color} border-2 ${
                          newCategory.color === color ? 'border-foreground' : 'border-transparent'
                        }`}
                        onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={addCustomCategory} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter la Catégorie
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={exportToCSV} className="bg-background text-foreground">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 bg-background text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card text-card-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold text-green-600">
                  +{totalIncome.toLocaleString('fr-FR')} €
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dépenses</p>
                <p className="text-2xl font-bold text-red-600">
                  -{totalExpenses.toLocaleString('fr-FR')} €
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solde</p>
                <p className={`text-2xl font-bold ${
                  balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {balance >= 0 ? '+' : ''}{balance.toLocaleString('fr-FR')} €
                </p>
              </div>
              <Wallet className={`w-8 h-8 ${
                balance >= 0 ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="charts">Graphiques</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
          <TabsTrigger value="add">Ajouter</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Transactions */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Transactions Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {expenses.slice(0, 10).map((expense) => {
                  const category = getCategoryInfo(expense.category);
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${category.color} text-white`}>
                          {category.icon}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{expense.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {category.name} • {new Date(expense.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {expense.type === 'income' ? '+' : '-'}{expense.amount.toLocaleString('fr-FR')} €
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Dépenses par Catégorie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expensesByCategory.map(({ category, amount, percentage }) => {
                  const budget = category.budget || 0;
                  const budgetProgress = budget > 0 ? (amount / budget) * 100 : 0;
                  
                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category.color} text-white`}>
                            {category.icon}
                          </div>
                          <span className="font-medium text-foreground">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            {amount.toLocaleString('fr-FR')} €
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      {budget > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Budget: {budget.toLocaleString('fr-FR')} €</span>
                            <span>{budgetProgress.toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={Math.min(budgetProgress, 100)} 
                            className={`h-2 ${budgetProgress > 100 ? 'bg-red-100' : ''}`}
                          />
                          {budgetProgress > 100 && (
                            <div className="text-xs text-red-500">
                              Dépassement: +{(amount - budget).toLocaleString('fr-FR')} €
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Évolution Mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data) => {
                  const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses)));
                  const incomeWidth = (data.income / maxValue) * 100;
                  const expenseWidth = (data.expenses / maxValue) * 100;
                  
                  return (
                    <div key={data.month} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">
                          {new Date(data.month + '-01').toLocaleDateString('fr-FR', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </span>
                        <Badge variant={data.balance >= 0 ? "default" : "destructive"}>
                          {data.balance >= 0 ? '+' : ''}{data.balance.toLocaleString('fr-FR')} €
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600 w-16">Revenus</span>
                          <div className="flex-1 bg-secondary rounded-full h-4 relative">
                            <div 
                              className="bg-green-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${incomeWidth}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground w-20 text-right">
                            {data.income.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-red-600 w-16">Dépenses</span>
                          <div className="flex-1 bg-secondary rounded-full h-4 relative">
                            <div 
                              className="bg-red-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${expenseWidth}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground w-20 text-right">
                            {data.expenses.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Répartition des Dépenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, 'Montant']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trends Chart */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Évolution Mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(value) => {
                          const date = new Date(value + '-01');
                          return date.toLocaleDateString('fr-FR', { month: 'short' });
                        }}
                      />
                      <YAxis tickFormatter={(value) => `${value.toLocaleString('fr-FR')}€`} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value.toLocaleString('fr-FR')} €`, 
                          name === 'expenses' ? 'Dépenses' : name === 'income' ? 'Revenus' : 'Solde'
                        ]}
                        labelFormatter={(value) => {
                          const date = new Date(value + '-01');
                          return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
                        }}
                      />
                      <Legend />
                      <Bar dataKey="income" fill="#10B981" name="Revenus" />
                      <Bar dataKey="expenses" fill="#EF4444" name="Dépenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Prédictions de Dépenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {predictions.length > 0 ? (
                <div className="space-y-6">
                  {/* Predictions Chart */}
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...monthlyData.slice(-3), ...predictions.map(p => ({ 
                        month: p.month, 
                        expenses: p.predicted, 
                        predicted: true 
                      }))]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={(value) => {
                            const date = new Date(value + '-01');
                            return date.toLocaleDateString('fr-FR', { month: 'short' });
                          }}
                        />
                        <YAxis tickFormatter={(value) => `${value.toLocaleString('fr-FR')}€`} />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            `${value.toLocaleString('fr-FR')} €`, 
                            name === 'expenses' ? 'Dépenses' : 'Prédiction'
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="expenses" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          dot={{ fill: '#3B82F6' }}
                          name="Dépenses"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Predictions List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Prédictions des 3 prochains mois</h3>
                    {predictions.map((prediction) => {
                      const date = new Date(prediction.month + '-01');
                      const monthName = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
                      
                      return (
                        <div key={prediction.month} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                              <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{monthName}</div>
                              <div className="text-sm text-muted-foreground">
                                Confiance: {(prediction.confidence * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">
                              {prediction.predicted.toLocaleString('fr-FR')} €
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Dépenses prévues
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Budget Alerts */}
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">Alertes Budget</span>
                      </div>
                      <div className="mt-2 text-sm text-yellow-700">
                        {expensesByCategory.some(({ category, amount }) => 
                          category.budget && amount > category.budget
                        ) ? (
                          <div className="space-y-1">
                            {expensesByCategory
                              .filter(({ category, amount }) => category.budget && amount > category.budget)
                              .map(({ category, amount }) => (
                                <div key={category.id}>
                                  Budget dépassé pour {category.name}: 
                                  +{((amount - (category.budget || 0)) / (category.budget || 1) * 100).toFixed(0)}%
                                </div>
                              ))
                            }
                          </div>
                        ) : (
                          "Aucun dépassement de budget détecté."
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Pas assez de données pour générer des prédictions.</p>
                  <p className="text-sm">Ajoutez plus de transactions pour voir les prédictions.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Ajouter une Transaction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={newExpense.type} 
                    onValueChange={(value: 'expense' | 'income') => 
                      setNewExpense(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Dépense</SelectItem>
                      <SelectItem value="income">Revenu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (€)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select 
                    value={newExpense.category} 
                    onValueChange={(value) => setNewExpense(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(cat => newExpense.type === 'income' ? cat.id === 'salary' || cat.id === 'other' : cat.id !== 'salary')
                        .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            {category.icon}
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la transaction..."
                  className="bg-background text-foreground"
                  rows={3}
                />
              </div>

              <Button 
                onClick={addExpense}
                className="w-full"
                disabled={!newExpense.amount || !newExpense.category || !newExpense.description}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter la Transaction
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mode d'emploi et conseils */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Mode d'emploi et conseils</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-700 dark:text-blue-300">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="w-4 h-4" />
                Utilisation
              </h4>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Onglets :</strong> Vue d'ensemble, catégories, tendances, graphiques, prédictions et ajout</li>
                <li><strong>Transactions :</strong> Ajoutez revenus et dépenses avec catégories personnalisées</li>
                <li><strong>Budgets :</strong> Définissez des limites par catégorie et suivez les dépassements</li>
                <li><strong>Graphiques :</strong> Visualisez vos dépenses avec camemberts et histogrammes</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Conseils de gestion
              </h4>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Règle 50/30/20 :</strong> 50% besoins, 30% envies, 20% épargne</li>
                <li><strong>Suivi régulier :</strong> Enregistrez vos dépenses quotidiennement</li>
                <li><strong>Catégories :</strong> Créez des catégories spécifiques à vos habitudes</li>
                <li><strong>Prédictions :</strong> Utilisez les tendances pour anticiper vos dépenses futures</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Avertissement financier */}
      <FinancialWarning />
    </div>
  );
};