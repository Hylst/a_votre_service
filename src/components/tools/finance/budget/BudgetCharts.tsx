/**
 * BudgetCharts.tsx
 * Component for budget data visualization - charts, graphs, and analytics
 * Handles pie charts, bar charts, trend analysis, and budget summaries
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { BudgetCategory, SavingsGoal, BudgetSummary, BudgetAlert } from "./types/budget.types";

interface BudgetChartsProps {
  categories: BudgetCategory[];
  goals: SavingsGoal[];
  summary: BudgetSummary;
  alerts: BudgetAlert[];
  monthlyData?: Array<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
}

/**
 * Custom colors for charts
 */
const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
];

/**
 * Format currency for French locale
 */
const formatCurrency = (value: number): string => {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
};

/**
 * Custom tooltip for charts
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card text-card-foreground p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const BudgetCharts: React.FC<BudgetChartsProps> = ({
  categories,
  goals,
  summary,
  alerts,
  monthlyData = []
}) => {
  /**
   * Prepare data for expense categories pie chart
   */
  const expenseChartData = categories
    .filter(cat => cat.type === 'expense' && cat.spent > 0)
    .map(cat => ({
      name: cat.name,
      value: cat.spent,
      color: cat.color || '#8884d8'
    }))
    .sort((a, b) => b.value - a.value);

  /**
   * Prepare data for budget vs actual comparison
   */
  const budgetComparisonData = categories
    .filter(cat => cat.type === 'expense')
    .map(cat => ({
      name: cat.name.length > 15 ? cat.name.substring(0, 15) + '...' : cat.name,
      budgeted: cat.budgeted,
      spent: cat.spent,
      remaining: Math.max(0, cat.budgeted - cat.spent)
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 8); // Show top 8 categories

  /**
   * Prepare data for savings goals progress
   */
  const goalsProgressData = goals
    .filter(goal => !goal.completedAt)
    .map(goal => ({
      name: goal.name.length > 15 ? goal.name.substring(0, 15) + '...' : goal.name,
      progress: (goal.currentAmount / goal.targetAmount) * 100,
      current: goal.currentAmount,
      target: goal.targetAmount,
      remaining: goal.targetAmount - goal.currentAmount
    }))
    .sort((a, b) => b.progress - a.progress);

  /**
   * Calculate category performance metrics
   */
  const getCategoryPerformance = () => {
    const expenseCategories = categories.filter(cat => cat.type === 'expense');
    const overBudget = expenseCategories.filter(cat => cat.spent > cat.budgeted).length;
    const onTrack = expenseCategories.filter(cat => cat.spent <= cat.budgeted * 0.9).length;
    const nearLimit = expenseCategories.filter(cat => 
      cat.spent > cat.budgeted * 0.9 && cat.spent <= cat.budgeted
    ).length;
    
    return { overBudget, onTrack, nearLimit, total: expenseCategories.length };
  };

  /**
   * Get alert severity color
   */
  const getAlertColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  /**
   * Get alert icon
   */
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <TrendingDown className="h-4 w-4" />;
      case 'low': return <TrendingUp className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const performance = getCategoryPerformance();

  return (
    <div className="space-y-6">
      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card text-card-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenus totaux</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dépenses totales</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalExpenses)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Solde net</p>
                <p className={`text-2xl font-bold ${
                  summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary.netIncome)}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${
                summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux d'épargne</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.savingsRate.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Distribution Pie Chart */}
        {expenseChartData.length > 0 && (
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Répartition des dépenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Budget vs Actual Bar Chart */}
        {budgetComparisonData.length > 0 && (
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Budget vs Réalisé</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis tickFormatter={(value) => `${value}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="budgeted" fill="#8884d8" name="Budget" />
                  <Bar dataKey="spent" fill="#82ca9d" name="Dépensé" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Monthly Trend Chart */}
      {monthlyData.length > 0 && (
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}€`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10B981" name="Revenus" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Dépenses" strokeWidth={2} />
                <Line type="monotone" dataKey="savings" stroke="#3B82F6" name="Épargne" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Savings Goals Progress */}
      {goalsProgressData.length > 0 && (
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Progression des objectifs d'épargne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goalsProgressData.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {goal.progress.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(goal.progress, 100)} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatCurrency(goal.current)}</span>
                    <span>{formatCurrency(goal.target)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Performance des catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Dans le budget</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {performance.onTrack}/{performance.total}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Proche de la limite</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {performance.nearLimit}/{performance.total}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Dépassement</span>
                </div>
                <Badge className="bg-red-100 text-red-800">
                  {performance.overBudget}/{performance.total}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Alerts */}
        {alerts.length > 0 && (
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Alertes budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className={`p-3 rounded-lg ${getAlertColor(alert.severity)}`}>
                    <div className="flex items-start gap-2">
                      {getAlertIcon(alert.severity)}
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
                {alerts.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{alerts.length - 5} autres alertes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};