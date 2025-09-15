/**
 * TaxCalculator.tsx
 * Tax calculator with deductions for French tax system
 * Calculates income tax, social contributions, and net salary
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Receipt, PiggyBank, Users, Home, Baby, Download, TrendingUp, BarChart3, Lightbulb, FileText, GitCompare } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { FinancialWarning } from "@/components/ui/financial-warning";

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

interface TaxResult {
  grossSalary: number;
  socialContributions: number;
  taxableIncome: number;
  incomeTax: number;
  netSalary: number;
  effectiveRate: number;
  marginalRate: number;
}

interface Deduction {
  id: string;
  name: string;
  amount: number;
  percentage?: number;
  maxAmount?: number;
}

interface ComparisonScenario {
  id: string;
  name: string;
  familyStatus: string;
  dependents: number;
  result: TaxResult;
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  potentialSaving: number;
  category: 'deduction' | 'status' | 'timing';
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export const TaxCalculator = () => {
  const [grossSalary, setGrossSalary] = useState<string>("50000");
  const [familyStatus, setFamilyStatus] = useState<string>("single");
  const [dependents, setDependents] = useState<string>("0");
  const [deductions, setDeductions] = useState<Deduction[]>([
    { id: "pension", name: "Cotisations retraite", amount: 0, percentage: 10, maxAmount: 3000 },
    { id: "health", name: "Frais de santé", amount: 0 },
    { id: "charity", name: "Dons aux œuvres", amount: 0, percentage: 66, maxAmount: 20000 },
    { id: "childcare", name: "Frais de garde", amount: 0, percentage: 50, maxAmount: 3500 },
    { id: "home", name: "Travaux domicile", amount: 0, percentage: 30, maxAmount: 8000 },
    { id: "education", name: "Frais de scolarité", amount: 0 }
  ]);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [comparisonScenarios, setComparisonScenarios] = useState<ComparisonScenario[]>([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [showOptimization, setShowOptimization] = useState<boolean>(false);

  // French tax brackets for 2024 (simplified)
  const taxBrackets: TaxBracket[] = [
    { min: 0, max: 10777, rate: 0 },
    { min: 10777, max: 27478, rate: 11 },
    { min: 27478, max: 78570, rate: 30 },
    { min: 78570, max: 168994, rate: 41 },
    { min: 168994, max: Infinity, rate: 45 }
  ];

  /**
   * Calculate family quotient based on status and dependents
   */
  const getFamilyQuotient = (): number => {
    const dependentsCount = parseInt(dependents) || 0;
    
    switch (familyStatus) {
      case "single":
        return 1 + (dependentsCount * 0.5);
      case "married":
        return 2 + (dependentsCount * 0.5);
      case "divorced":
        return 1 + (dependentsCount * 0.5);
      default:
        return 1;
    }
  };

  /**
   * Calculate social contributions (simplified)
   */
  const calculateSocialContributions = (gross: number): number => {
    // Simplified calculation: ~22% for employees
    return gross * 0.22;
  };

  /**
   * Calculate total deductions
   */
  const calculateTotalDeductions = (): number => {
    return deductions.reduce((total, deduction) => {
      let deductibleAmount = deduction.amount;
      
      if (deduction.percentage && deduction.amount > 0) {
        deductibleAmount = deduction.amount * (deduction.percentage / 100);
        if (deduction.maxAmount) {
          deductibleAmount = Math.min(deductibleAmount, deduction.maxAmount);
        }
      }
      
      return total + deductibleAmount;
    }, 0);
  };

  /**
   * Calculate income tax using French brackets
   */
  const calculateIncomeTax = (taxableIncome: number, quotient: number): { tax: number; marginalRate: number } => {
    const incomePerPart = taxableIncome / quotient;
    let tax = 0;
    let marginalRate = 0;
    
    for (const bracket of taxBrackets) {
      if (incomePerPart > bracket.min) {
        const taxableInBracket = Math.min(incomePerPart - bracket.min, bracket.max - bracket.min);
        tax += taxableInBracket * (bracket.rate / 100);
        
        if (incomePerPart > bracket.min && incomePerPart <= bracket.max) {
          marginalRate = bracket.rate;
        }
      }
    }
    
    return { tax: tax * quotient, marginalRate };
  };

  /**
   * Calculate complete tax result
   */
  const calculateTax = (): TaxResult => {
    const gross = parseFloat(grossSalary) || 0;
    const socialContrib = calculateSocialContributions(gross);
    const totalDeductions = calculateTotalDeductions();
    const quotient = getFamilyQuotient();
    
    const taxableIncome = Math.max(0, gross - socialContrib - totalDeductions);
    const { tax: incomeTax, marginalRate } = calculateIncomeTax(taxableIncome, quotient);
    
    const netSalary = gross - socialContrib - incomeTax;
    const effectiveRate = gross > 0 ? ((socialContrib + incomeTax) / gross) * 100 : 0;
    
    return {
      grossSalary: gross,
      socialContributions: socialContrib,
      taxableIncome,
      incomeTax,
      netSalary,
      effectiveRate,
      marginalRate
    };
  };

  /**
   * Update deduction amount
   */
  const updateDeduction = (id: string, amount: number) => {
    setDeductions(prev => 
      prev.map(deduction => 
        deduction.id === id ? { ...deduction, amount } : deduction
      )
    );
  };

  /**
   * Get deduction benefit
   */
  const getDeductionBenefit = (deduction: Deduction): number => {
    if (deduction.amount === 0) return 0;
    
    let deductibleAmount = deduction.amount;
    if (deduction.percentage) {
      deductibleAmount = deduction.amount * (deduction.percentage / 100);
      if (deduction.maxAmount) {
        deductibleAmount = Math.min(deductibleAmount, deduction.maxAmount);
      }
    }
    
    // Approximate tax saving (using marginal rate)
    const marginalRate = result?.marginalRate || 30;
    return deductibleAmount * (marginalRate / 100);
  };

  /**
   * Generate comparison scenarios
   */
  const generateComparisonScenarios = (): ComparisonScenario[] => {
    const gross = parseFloat(grossSalary) || 0;
    const scenarios: ComparisonScenario[] = [];
    
    // Current scenario
    scenarios.push({
      id: 'current',
      name: 'Situation Actuelle',
      familyStatus,
      dependents: parseInt(dependents) || 0,
      result: calculateTaxForScenario(familyStatus, parseInt(dependents) || 0)
    });
    
    // Alternative scenarios
    if (familyStatus === 'single') {
      scenarios.push({
        id: 'married',
        name: 'Si Marié(e)',
        familyStatus: 'married',
        dependents: parseInt(dependents) || 0,
        result: calculateTaxForScenario('married', parseInt(dependents) || 0)
      });
    }
    
    // With one more dependent
    scenarios.push({
      id: 'more-dependents',
      name: `Avec ${(parseInt(dependents) || 0) + 1} personne(s) à charge`,
      familyStatus,
      dependents: (parseInt(dependents) || 0) + 1,
      result: calculateTaxForScenario(familyStatus, (parseInt(dependents) || 0) + 1)
    });
    
    return scenarios;
  };

  /**
   * Calculate tax for specific scenario
   */
  const calculateTaxForScenario = (status: string, deps: number): TaxResult => {
    const gross = parseFloat(grossSalary) || 0;
    const socialContrib = calculateSocialContributions(gross);
    const totalDeductions = calculateTotalDeductions();
    
    // Calculate quotient for scenario
    let quotient = 1;
    switch (status) {
      case 'single':
        quotient = 1 + (deps * 0.5);
        break;
      case 'married':
        quotient = 2 + (deps * 0.5);
        break;
      case 'divorced':
        quotient = 1 + (deps * 0.5);
        break;
    }
    
    const taxableIncome = Math.max(0, gross - socialContrib - totalDeductions);
    const { tax: incomeTax, marginalRate } = calculateIncomeTax(taxableIncome, quotient);
    
    const netSalary = gross - socialContrib - incomeTax;
    const effectiveRate = gross > 0 ? ((socialContrib + incomeTax) / gross) * 100 : 0;
    
    return {
      grossSalary: gross,
      socialContributions: socialContrib,
      taxableIncome,
      incomeTax,
      netSalary,
      effectiveRate,
      marginalRate
    };
  };

  /**
   * Generate optimization suggestions
   */
  const generateOptimizationSuggestions = (): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];
    const gross = parseFloat(grossSalary) || 0;
    
    // Check for unused deductions
    deductions.forEach(deduction => {
      if (deduction.amount === 0 && deduction.maxAmount) {
        const potentialSaving = (deduction.maxAmount * (deduction.percentage || 100) / 100) * 0.3; // Approximate saving
        suggestions.push({
          id: `deduction-${deduction.id}`,
          title: `Optimiser ${deduction.name}`,
          description: `Vous pourriez déduire jusqu'à ${deduction.maxAmount.toLocaleString('fr-FR')} € et économiser environ ${potentialSaving.toFixed(0)} € d'impôts.`,
          potentialSaving,
          category: 'deduction'
        });
      }
    });
    
    // Family status optimization
    if (familyStatus === 'single' && gross > 30000) {
      const marriedResult = calculateTaxForScenario('married', parseInt(dependents) || 0);
      const currentResult = result;
      if (currentResult && marriedResult.netSalary > currentResult.netSalary) {
        suggestions.push({
          id: 'marriage-benefit',
          title: 'Avantage du Mariage',
          description: `Le mariage pourrait vous faire économiser ${(currentResult.incomeTax - marriedResult.incomeTax).toFixed(0)} € d'impôts par an.`,
          potentialSaving: currentResult.incomeTax - marriedResult.incomeTax,
          category: 'status'
        });
      }
    }
    
    // High income optimization
    if (gross > 100000) {
      suggestions.push({
        id: 'high-income-optimization',
        title: 'Optimisation Revenus Élevés',
        description: 'Considérez l\'investissement dans des dispositifs de défiscalisation (PERP, investissement locatif, etc.).',
        potentialSaving: gross * 0.05, // Estimate 5% saving
        category: 'timing'
      });
    }
    
    return suggestions.sort((a, b) => b.potentialSaving - a.potentialSaving);
  };

  /**
   * Generate chart data for tax breakdown
   */
  const generateChartData = (): ChartData[] => {
    if (!result) return [];
    
    return [
      {
        name: 'Salaire Net',
        value: result.netSalary,
        color: '#22c55e'
      },
      {
        name: 'Cotisations Sociales',
        value: result.socialContributions,
        color: '#f59e0b'
      },
      {
        name: 'Impôt sur le Revenu',
        value: result.incomeTax,
        color: '#ef4444'
      }
    ];
  };

  /**
   * Export tax calculation to PDF (simplified)
   */
  const exportToPDF = () => {
    if (!result) return;
    
    const content = `
CALCUL D'IMPÔTS - RÉSUMÉ
========================

Salaire brut annuel: ${result.grossSalary.toLocaleString('fr-FR')} €
Situation familiale: ${familyStatus === 'single' ? 'Célibataire' : familyStatus === 'married' ? 'Marié(e)' : 'Divorcé(e)'}
Personnes à charge: ${dependents}
Quotient familial: ${getFamilyQuotient()}

DÉTAIL DU CALCUL
================
Salaire brut: ${result.grossSalary.toLocaleString('fr-FR')} €
Cotisations sociales: -${result.socialContributions.toLocaleString('fr-FR')} €
Déductions fiscales: -${calculateTotalDeductions().toLocaleString('fr-FR')} €
Revenu imposable: ${result.taxableIncome.toLocaleString('fr-FR')} €
Impôt sur le revenu: -${result.incomeTax.toLocaleString('fr-FR')} €

RÉSULTAT FINAL
==============
Salaire net: ${result.netSalary.toLocaleString('fr-FR')} €
Taux effectif: ${result.effectiveRate.toFixed(1)}%
Taux marginal: ${result.marginalRate}%

Généré le ${new Date().toLocaleDateString('fr-FR')}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calcul-impots-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const newResult = calculateTax();
    setResult(newResult);
    
    // Generate additional data when result changes
    if (newResult) {
      setComparisonScenarios(generateComparisonScenarios());
      setOptimizationSuggestions(generateOptimizationSuggestions());
      setChartData(generateChartData());
    }
  }, [grossSalary, familyStatus, dependents, deductions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calculator className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-foreground">Calculateur d'Impôts</h2>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1">
            <TabsTrigger value="calculator" className="text-xs lg:text-sm">Calcul</TabsTrigger>
            <TabsTrigger value="deductions" className="text-xs lg:text-sm">Déductions</TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs lg:text-sm">Comparaison</TabsTrigger>
            <TabsTrigger value="optimization" className="text-xs lg:text-sm">Optimisation</TabsTrigger>
            <TabsTrigger value="charts" className="text-xs lg:text-sm">Graphiques</TabsTrigger>
          </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Informations Fiscales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gross-salary">Salaire Brut Annuel (€)</Label>
                  <Input
                    id="gross-salary"
                    type="number"
                    value={grossSalary}
                    onChange={(e) => setGrossSalary(e.target.value)}
                    placeholder="50000"
                    className="bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="family-status">Situation Familiale</Label>
                  <Select value={familyStatus} onValueChange={setFamilyStatus}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Célibataire</SelectItem>
                      <SelectItem value="married">Marié(e)</SelectItem>
                      <SelectItem value="divorced">Divorcé(e)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dependents">Nombre de Personnes à Charge</Label>
                  <Input
                    id="dependents"
                    type="number"
                    min="0"
                    value={dependents}
                    onChange={(e) => setDependents(e.target.value)}
                    className="bg-background text-foreground"
                  />
                </div>

                <div className="pt-2">
                  <div className="text-sm text-muted-foreground">
                    Quotient familial: <span className="font-semibold">{getFamilyQuotient()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Résultats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Salaire brut</span>
                      <span className="font-semibold text-foreground">
                        {result.grossSalary.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cotisations sociales</span>
                      <span className="font-semibold text-red-500">
                        -{result.socialContributions.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Déductions fiscales</span>
                      <span className="font-semibold text-green-500">
                        -{calculateTotalDeductions().toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Revenu imposable</span>
                      <span className="font-semibold text-foreground">
                        {result.taxableIncome.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Impôt sur le revenu</span>
                      <span className="font-semibold text-red-500">
                        -{result.incomeTax.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    
                    <hr className="border-border" />
                    
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold text-foreground">Salaire net</span>
                      <span className="font-bold text-green-600">
                        {result.netSalary.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Taux effectif</div>
                        <Badge variant="secondary">
                          {result.effectiveRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Taux marginal</div>
                        <Badge variant="secondary">
                          {result.marginalRate}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Déductions Fiscales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deductions.map((deduction) => {
                  const benefit = getDeductionBenefit(deduction);
                  return (
                    <div key={deduction.id} className="p-4 bg-secondary rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {deduction.id === 'pension' && <PiggyBank className="w-4 h-4" />}
                          {deduction.id === 'charity' && <Users className="w-4 h-4" />}
                          {deduction.id === 'childcare' && <Baby className="w-4 h-4" />}
                          {deduction.id === 'home' && <Home className="w-4 h-4" />}
                          <span className="font-medium text-foreground">{deduction.name}</span>
                        </div>
                        {benefit > 0 && (
                          <Badge variant="default" className="text-xs">
                            Économie: {benefit.toFixed(0)} €
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={deduction.amount}
                          onChange={(e) => updateDeduction(deduction.id, parseFloat(e.target.value) || 0)}
                          placeholder="Montant en €"
                          className="flex-1 bg-background text-foreground"
                        />
                        <span className="text-sm text-muted-foreground">€</span>
                      </div>
                      
                      {deduction.percentage && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Réduction: {deduction.percentage}%
                          {deduction.maxAmount && ` (max ${deduction.maxAmount.toLocaleString('fr-FR')} €)`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Comparaison de Scénarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {comparisonScenarios.map((scenario) => (
                  <div key={scenario.id} className="p-4 border rounded-lg bg-secondary/50">
                    <h4 className="font-semibold mb-2">{scenario.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Salaire Net:</span>
                        <p className="font-medium text-green-600">
                          {scenario.result.netSalary.toLocaleString('fr-FR')} €
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Impôt:</span>
                        <p className="font-medium text-red-600">
                          {scenario.result.incomeTax.toLocaleString('fr-FR')} €
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Taux Effectif:</span>
                        <p className="font-medium">
                          {scenario.result.effectiveRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Économie vs Actuel:</span>
                        <p className={`font-medium ${
                          scenario.id === 'current' ? 'text-muted-foreground' :
                          scenario.result.netSalary > (result?.netSalary || 0) ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {scenario.id === 'current' ? '-' : 
                           `${(scenario.result.netSalary - (result?.netSalary || 0)).toLocaleString('fr-FR')} €`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Suggestions d'Optimisation Fiscale
              </CardTitle>
            </CardHeader>
            <CardContent>
              {optimizationSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {optimizationSuggestions.map((suggestion) => (
                    <Alert key={suggestion.id} className="border-l-4 border-l-blue-500">
                      <Lightbulb className="h-4 w-4" />
                      <div>
                        <h4 className="font-semibold">{suggestion.title}</h4>
                        <AlertDescription className="mt-1">
                          {suggestion.description}
                        </AlertDescription>
                        <div className="mt-2 flex items-center gap-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Économie potentielle: {suggestion.potentialSaving.toFixed(0)} €
                          </Badge>
                          <Badge variant="outline">
                            {suggestion.category === 'deduction' ? 'Déduction' :
                             suggestion.category === 'status' ? 'Statut' : 'Timing'}
                          </Badge>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune optimisation détectée pour le moment.</p>
                  <p className="text-sm mt-2">Essayez d'ajuster vos paramètres ou déductions.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Répartition des Charges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, 'Montant']}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Saisissez un salaire pour voir le graphique
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tranches d'Imposition
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result && (
                  <div className="space-y-3">
                    {taxBrackets.map((bracket, index) => {
                      const quotient = getFamilyQuotient();
                      const adjustedMin = bracket.min * quotient;
                      const adjustedMax = bracket.max ? bracket.max * quotient : Infinity;
                      const taxableIncome = result.taxableIncome;
                      
                      const isActive = taxableIncome > adjustedMin;
                      const taxableInThisBracket = Math.min(
                        Math.max(0, taxableIncome - adjustedMin),
                        adjustedMax - adjustedMin
                      );
                      
                      return (
                        <div key={index} className={`p-3 rounded border ${
                          isActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{bracket.rate}%</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {adjustedMin.toLocaleString('fr-FR')} € - {adjustedMax === Infinity ? '∞' : adjustedMax.toLocaleString('fr-FR')} €
                              </span>
                            </div>
                            {isActive && (
                              <Badge variant="secondary">
                                {taxableInThisBracket.toLocaleString('fr-FR')} €
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export des Calculs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exporter en TXT
                </Button>
                <Button 
                  onClick={() => setShowOptimization(!showOptimization)} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  {showOptimization ? 'Masquer' : 'Afficher'} Optimisations
                </Button>
              </div>
              
              {showOptimization && optimizationSuggestions.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Résumé des Optimisations</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Économies potentielles totales: {optimizationSuggestions.reduce((sum, s) => sum + s.potentialSaving, 0).toFixed(0)} €
                  </p>
                  <div className="space-y-1">
                    {optimizationSuggestions.slice(0, 3).map((suggestion) => (
                      <div key={suggestion.id} className="text-sm">
                        • {suggestion.title}: {suggestion.potentialSaving.toFixed(0)} €
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mode d'emploi et conseils */}
      <Card className="mt-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-3">Mode d'emploi et conseils :</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p><strong>💰 Salaire brut :</strong> Saisissez votre salaire annuel avant déductions sociales</p>
                  <p><strong>👨‍👩‍👧‍👦 Situation familiale :</strong> Choisissez votre statut pour calculer le quotient familial</p>
                  <p><strong>📊 Déductions :</strong> Ajoutez vos frais réels, dons, investissements locatifs</p>
                  <p><strong>📈 Comparaison :</strong> Simulez différents scénarios pour optimiser</p>
                </div>
                <div className="space-y-2">
                  <p><strong>🏠 Immobilier :</strong> Défiscalisez avec Pinel, LMNP, ou investissement locatif</p>
                  <p><strong>💡 PER/PERP :</strong> Réduisez vos impôts en épargnant pour la retraite</p>
                  <p><strong>🎓 Frais réels :</strong> Déduisez transport, repas, formation si &gt 10% abattement</p>
                  <p><strong>📅 Étalement :</strong> Lissez vos revenus exceptionnels sur plusieurs années</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Avertissement financier */}
      <FinancialWarning />
    </div>
   );
 };