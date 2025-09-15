/**
 * SavingsCalculator.tsx
 * Savings calculator with compound interest calculations
 * Helps users plan their savings goals and understand compound growth
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { PiggyBank, TrendingUp, Target, Calendar, DollarSign, Percent, AlertTriangle, Calculator, Settings, BarChart3, Zap, HelpCircle } from "lucide-react";

interface SavingsResult {
  finalAmount: number;
  totalContributions: number;
  totalInterest: number;
  monthlyData: Array<{
    month: number;
    balance: number;
    interest: number;
    contribution: number;
    realValue?: number;
  }>;
}

interface InterestRateComparison {
  rate: number;
  finalAmount: number;
  totalInterest: number;
  label: string;
}

interface CustomGoal {
  id: string;
  amount: number;
  description: string;
  monthsToReach: number;
}

interface ContributionPattern {
  type: 'fixed' | 'increasing' | 'decreasing' | 'irregular';
  increaseRate?: number; // Annual increase percentage
  decreaseRate?: number; // Annual decrease percentage
  irregularAmounts?: number[]; // Array of monthly amounts for irregular pattern
}

interface AdvancedScenario {
  id: string;
  name: string;
  description: string;
  pattern: ContributionPattern;
  result?: SavingsResult;
}

interface TaxAdvantagedAccount {
  type: 'livret_a' | 'pel' | 'assurance_vie' | 'pea' | 'standard';
  name: string;
  maxAmount?: number;
  taxRate: number;
  socialCharges: number;
  minDuration?: number;
  earlyWithdrawalPenalty?: number;
  description: string;
}

interface TaxCalculationResult {
  grossInterest: number;
  taxes: number;
  socialCharges: number;
  netInterest: number;
  effectiveRate: number;
  totalReturn: number;
}

interface AssetAllocation {
  stocks: number;
  bonds: number;
  realEstate: number;
  commodities: number;
  cash: number;
}

interface RiskProfile {
  id: string;
  name: string;
  description: string;
  expectedReturn: number;
  volatility: number;
  allocation: AssetAllocation;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
}

interface PortfolioSimulation {
  profile: RiskProfile;
  scenarios: {
    optimistic: SavingsResult;
    realistic: SavingsResult;
    pessimistic: SavingsResult;
  };
  riskMetrics: {
    maxDrawdown: number;
    sharpeRatio: number;
    volatility: number;
  };
}

export const SavingsCalculator = () => {
  const [initialAmount, setInitialAmount] = useState<string>("1000");
  const [monthlyContribution, setMonthlyContribution] = useState<string>("200");
  const [annualRate, setAnnualRate] = useState<string>("3.5");
  const [years, setYears] = useState<string>("10");
  const [compoundFrequency, setCompoundFrequency] = useState<string>("12");
  const [inflationRate, setInflationRate] = useState<string>("2.0");
  const [customGoalAmount, setCustomGoalAmount] = useState<string>("50000");
  const [customGoalDescription, setCustomGoalDescription] = useState<string>("Objectif personnalisé");
  const [activeTab, setActiveTab] = useState<string>("calculator");
  const [result, setResult] = useState<SavingsResult | null>(null);
  const [interestComparisons, setInterestComparisons] = useState<InterestRateComparison[]>([]);
  const [customGoals, setCustomGoals] = useState<CustomGoal[]>([]);
  const [contributionPattern, setContributionPattern] = useState<ContributionPattern>({ type: 'fixed' });
  const [increaseRate, setIncreaseRate] = useState<string>("3");
  const [decreaseRate, setDecreaseRate] = useState<string>("2");
  const [irregularAmounts, setIrregularAmounts] = useState<string>("200,300,150,400,250,200");
  const [scenarios, setScenarios] = useState<AdvancedScenario[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('standard');
  const [taxAdvantagedResults, setTaxAdvantagedResults] = useState<{[key: string]: SavingsResult & TaxCalculationResult}>({});
  
  // Portfolio simulation states
  const [selectedRiskProfile, setSelectedRiskProfile] = useState<string>('moderate');
  const [portfolioSimulation, setPortfolioSimulation] = useState<PortfolioSimulation | null>(null);
  const [showPortfolioDetails, setShowPortfolioDetails] = useState<boolean>(false);

  // French tax-advantaged accounts definitions
  const taxAdvantagedAccounts: TaxAdvantagedAccount[] = [
    {
      type: 'standard',
      name: 'Compte Standard',
      taxRate: 30, // PFU (Prélèvement Forfaitaire Unique)
      socialCharges: 17.2,
      description: 'Compte d\'épargne classique soumis à la fiscalité standard'
    },
    {
      type: 'livret_a',
      name: 'Livret A',
      maxAmount: 22950,
      taxRate: 0,
      socialCharges: 0,
      description: 'Épargne défiscalisée, plafonnée à 22 950€, taux réglementé'
    },
    {
      type: 'pel',
      name: 'Plan Épargne Logement (PEL)',
      maxAmount: 61200,
      taxRate: 24, // Après 12 ans
      socialCharges: 17.2,
      minDuration: 4,
      earlyWithdrawalPenalty: 2.5,
      description: 'Épargne logement, avantages fiscaux selon la durée'
    },
    {
      type: 'assurance_vie',
      name: 'Assurance Vie',
      taxRate: 7.5, // Après 8 ans, sur les gains > 4600€
      socialCharges: 17.2,
      minDuration: 8,
      description: 'Fiscalité avantageuse après 8 ans, abattement annuel'
    },
    {
      type: 'pea',
      name: 'Plan d\'Épargne en Actions (PEA)',
      maxAmount: 150000,
      taxRate: 0, // Après 5 ans
      socialCharges: 17.2,
      minDuration: 5,
      earlyWithdrawalPenalty: 22.5,
      description: 'Investissement actions, exonération fiscale après 5 ans'
    }
  ];

  // Risk profiles for portfolio simulation
  const riskProfiles: RiskProfile[] = [
    {
      id: 'conservative',
      name: 'Conservateur',
      description: 'Profil sécuritaire privilégiant la préservation du capital',
      expectedReturn: 4.5,
      volatility: 8,
      riskLevel: 'conservative',
      allocation: {
        stocks: 20,
        bonds: 60,
        realEstate: 10,
        commodities: 5,
        cash: 5
      }
    },
    {
      id: 'moderate',
      name: 'Modéré',
      description: 'Équilibre entre croissance et sécurité',
      expectedReturn: 6.5,
      volatility: 12,
      riskLevel: 'moderate',
      allocation: {
        stocks: 50,
        bonds: 30,
        realEstate: 15,
        commodities: 3,
        cash: 2
      }
    },
    {
      id: 'aggressive',
      name: 'Dynamique',
      description: 'Recherche de performance maximale avec volatilité élevée',
      expectedReturn: 8.5,
      volatility: 18,
      riskLevel: 'aggressive',
      allocation: {
        stocks: 70,
        bonds: 15,
        realEstate: 10,
        commodities: 4,
        cash: 1
      }
    }
  ];

  /**
   * Calculate taxes and social charges for different account types
   */
  const calculateTaxes = (grossInterest: number, accountType: string, duration: number): TaxCalculationResult => {
    const account = taxAdvantagedAccounts.find(acc => acc.type === accountType);
    if (!account) {
      return {
        grossInterest,
        taxes: 0,
        socialCharges: 0,
        netInterest: grossInterest,
        effectiveRate: 0,
        totalReturn: 0
      };
    }

    let taxes = 0;
    let socialCharges = 0;

    switch (account.type) {
      case 'livret_a':
        // Livret A is tax-free
        taxes = 0;
        socialCharges = 0;
        break;
      
      case 'pel':
        if (duration >= 12) {
          // After 12 years: 24% tax + 17.2% social charges
          taxes = grossInterest * (account.taxRate / 100);
          socialCharges = grossInterest * (account.socialCharges / 100);
        } else if (duration >= 4) {
          // Between 4-12 years: only social charges
          taxes = 0;
          socialCharges = grossInterest * (account.socialCharges / 100);
        } else {
          // Before 4 years: penalty + full taxation
          taxes = grossInterest * 0.30; // 30% penalty tax
          socialCharges = grossInterest * (account.socialCharges / 100);
        }
        break;
      
      case 'assurance_vie':
        if (duration >= 8) {
          // After 8 years: 7.5% tax on gains > 4600€ + social charges
          const taxableGains = Math.max(0, grossInterest - 4600);
          taxes = taxableGains * (account.taxRate / 100);
          socialCharges = grossInterest * (account.socialCharges / 100);
        } else {
          // Before 8 years: standard taxation
          taxes = grossInterest * 0.30;
          socialCharges = grossInterest * (account.socialCharges / 100);
        }
        break;
      
      case 'pea':
        if (duration >= 5) {
          // After 5 years: only social charges
          taxes = 0;
          socialCharges = grossInterest * (account.socialCharges / 100);
        } else {
          // Before 5 years: 22.5% penalty + social charges
          taxes = grossInterest * (account.earlyWithdrawalPenalty! / 100);
          socialCharges = grossInterest * (account.socialCharges / 100);
        }
        break;
      
      default: // standard account
        taxes = grossInterest * (account.taxRate / 100);
        socialCharges = grossInterest * (account.socialCharges / 100);
        break;
    }

    const netInterest = grossInterest - taxes - socialCharges;
    const effectiveRate = grossInterest > 0 ? (netInterest / grossInterest) * 100 : 0;
    const totalReturn = grossInterest > 0 ? (netInterest / grossInterest) * 100 : 0;

    return {
      grossInterest,
      taxes,
      socialCharges,
      netInterest,
      effectiveRate,
      totalReturn
    };
  };

  /**
   * Calculate savings with tax-advantaged accounts
   */
  const calculateTaxAdvantagedSavings = () => {
    const results: {[key: string]: SavingsResult & TaxCalculationResult} = {};
    
    taxAdvantagedAccounts.forEach(account => {
      const baseResult = calculateAdvancedSavings({ type: 'fixed' });
      if (baseResult) {
        const duration = parseFloat(years);
        const taxCalc = calculateTaxes(baseResult.totalInterest, account.type, duration);
        
        // Adjust final amount based on net interest
        const adjustedFinalAmount = baseResult.totalContributions + taxCalc.netInterest;
        
        results[account.type] = {
          ...baseResult,
          ...taxCalc,
          finalAmount: adjustedFinalAmount,
          totalInterest: taxCalc.netInterest,
          totalReturn: ((taxCalc.netInterest / baseResult.totalContributions) * 100)
        };
      }
    });
    
    setTaxAdvantagedResults(results);
  };

  /**
   * Simulate portfolio performance with Monte Carlo approach
   */
  const simulatePortfolioScenarios = (profile: RiskProfile): PortfolioSimulation => {
    const baseResult = calculateAdvancedSavings({ type: 'fixed' });
    if (!baseResult) {
      throw new Error('Base calculation failed');
    }

    // Calculate scenarios based on expected return and volatility
    const optimisticReturn = profile.expectedReturn + profile.volatility * 0.5;
    const pessimisticReturn = Math.max(0.5, profile.expectedReturn - profile.volatility * 0.5);
    
    const calculateScenario = (returnRate: number): SavingsResult => {
      const initial = parseFloat(initialAmount) || 0;
      const monthly = parseFloat(monthlyContribution) || 0;
      const duration = parseFloat(years) || 1;
      const monthlyRate = returnRate / 100 / 12;
      const totalMonths = duration * 12;
      
      let balance = initial;
      const monthlyData = [];
      let totalContributions = initial;
      
      for (let month = 1; month <= totalMonths; month++) {
        const monthlyInterest = balance * monthlyRate;
        balance += monthlyInterest + monthly;
        totalContributions += monthly;
        
        monthlyData.push({
          month,
          balance,
          interest: monthlyInterest,
          contribution: monthly
        });
      }
      
      return {
        finalAmount: balance,
        totalContributions,
        totalInterest: balance - totalContributions,
        monthlyData
      };
    };

    const optimistic = calculateScenario(optimisticReturn);
    const realistic = calculateScenario(profile.expectedReturn);
    const pessimistic = calculateScenario(pessimisticReturn);

    // Calculate risk metrics
    const maxDrawdown = (realistic.finalAmount - pessimistic.finalAmount) / realistic.finalAmount * 100;
    const avgReturn = (optimistic.finalAmount + realistic.finalAmount + pessimistic.finalAmount) / 3;
    const variance = ((optimistic.finalAmount - avgReturn) ** 2 + 
                     (realistic.finalAmount - avgReturn) ** 2 + 
                     (pessimistic.finalAmount - avgReturn) ** 2) / 3;
    const volatility = Math.sqrt(variance) / avgReturn * 100;
    const sharpeRatio = (profile.expectedReturn - 2) / profile.volatility; // Assuming 2% risk-free rate

    return {
      profile,
      scenarios: {
        optimistic,
        realistic,
        pessimistic
      },
      riskMetrics: {
        maxDrawdown,
        sharpeRatio,
        volatility
      }
    };
  };

  /**
   * Calculate portfolio simulation based on selected risk profile
   */
  const calculatePortfolioSimulation = () => {
    const profile = riskProfiles.find(p => p.id === selectedRiskProfile);
    if (profile) {
      const simulation = simulatePortfolioScenarios(profile);
      setPortfolioSimulation(simulation);
    }
  };

  /**
   * Calculate monthly contribution based on pattern and month
   */
  const getMonthlyContribution = (month: number, pattern: ContributionPattern, basePMT: number): number => {
    switch (pattern.type) {
      case 'fixed':
        return basePMT;
      case 'increasing':
        const yearsPassed = Math.floor((month - 1) / 12);
        return basePMT * Math.pow(1 + (pattern.increaseRate || 0) / 100, yearsPassed);
      case 'decreasing':
        const yearsPassedDec = Math.floor((month - 1) / 12);
        return Math.max(0, basePMT * Math.pow(1 - (pattern.decreaseRate || 0) / 100, yearsPassedDec));
      case 'irregular':
        if (pattern.irregularAmounts && pattern.irregularAmounts.length > 0) {
          const index = (month - 1) % pattern.irregularAmounts.length;
          return pattern.irregularAmounts[index];
        }
        return basePMT;
      default:
        return basePMT;
    }
  };

  /**
   * Calculate compound interest with regular contributions (legacy function)
   */
  const calculateSavings = () => {
    calculateAdvancedSavings({ type: 'fixed' });
  };

  /**
   * Calculate compound interest with advanced contribution patterns and inflation adjustment
   */
  const calculateAdvancedSavings = (pattern: ContributionPattern = contributionPattern) => {
    const P = parseFloat(initialAmount) || 0;
    const basePMT = parseFloat(monthlyContribution) || 0;
    const r = parseFloat(annualRate) / 100;
    const n = parseFloat(compoundFrequency);
    const t = parseFloat(years);
    const inflationR = parseFloat(inflationRate) / 100;

    if (r && n && t) {
      const monthlyRate = r / 12;
      const monthlyInflation = inflationR / 12;
      const totalMonths = t * 12;
      const monthlyData: Array<{
        month: number;
        balance: number;
        interest: number;
        contribution: number;
        realValue?: number;
      }> = [];

      let balance = P;
      let totalContributions = P;

      for (let month = 1; month <= totalMonths; month++) {
        const monthlyInterest = balance * monthlyRate;
        const monthlyContrib = getMonthlyContribution(month, pattern, basePMT);
        balance += monthlyInterest + monthlyContrib;
        totalContributions += monthlyContrib;

        // Calculate real value adjusted for inflation
        const realValue = balance / Math.pow(1 + monthlyInflation, month);

        monthlyData.push({
          month,
          balance,
          interest: monthlyInterest,
          contribution: monthlyContrib,
          realValue
        });
      }

      const finalAmount = balance;
      const totalInterest = finalAmount - totalContributions;

      const resultData = {
        finalAmount,
        totalContributions,
        totalInterest,
        monthlyData
      };

      if (pattern.type === 'fixed') {
        setResult(resultData);
      }
      
      return resultData;
    } else {
      if (pattern.type === 'fixed') {
        setResult(null);
      }
      return null;
    }
  };

  /**
   * Generate comparison scenarios with different contribution patterns
   */
  const generateScenarios = () => {
    const basePattern: ContributionPattern = { type: 'fixed' };
    const increasingPattern: ContributionPattern = { 
      type: 'increasing', 
      increaseRate: parseFloat(increaseRate) || 3 
    };
    const decreasingPattern: ContributionPattern = { 
      type: 'decreasing', 
      decreaseRate: parseFloat(decreaseRate) || 2 
    };
    const irregularPattern: ContributionPattern = { 
      type: 'irregular', 
      irregularAmounts: irregularAmounts.split(',').map(amt => parseFloat(amt.trim()) || 0)
    };

    const newScenarios: AdvancedScenario[] = [
      {
        id: 'fixed',
        name: 'Versements Fixes',
        description: 'Versements mensuels constants',
        pattern: basePattern,
        result: calculateAdvancedSavings(basePattern)
      },
      {
        id: 'increasing',
        name: 'Versements Croissants',
        description: `Augmentation annuelle de ${increaseRate}%`,
        pattern: increasingPattern,
        result: calculateAdvancedSavings(increasingPattern)
      },
      {
        id: 'decreasing',
        name: 'Versements Décroissants',
        description: `Diminution annuelle de ${decreaseRate}%`,
        pattern: decreasingPattern,
        result: calculateAdvancedSavings(decreasingPattern)
      },
      {
        id: 'irregular',
        name: 'Versements Irréguliers',
        description: 'Montants variables selon un cycle défini',
        pattern: irregularPattern,
        result: calculateAdvancedSavings(irregularPattern)
      }
    ];

    setScenarios(newScenarios.filter(s => s.result !== null));
  };

  /**
   * Calculate time to reach a specific goal
   */
  const calculateTimeToGoal = (goalAmount: number): number => {
    const P = parseFloat(initialAmount) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const r = parseFloat(annualRate) / 100 / 12;

    if (goalAmount <= P) return 0;
    if (PMT === 0 && r === 0) return Infinity;

    // Using logarithmic formula for annuity with compound interest
    if (r > 0) {
      const months = Math.log((goalAmount * r + PMT) / (P * r + PMT)) / Math.log(1 + r);
      return Math.ceil(months);
    } else {
      return Math.ceil((goalAmount - P) / PMT);
    }
  };

  /**
   * Generate interest rate comparisons
   */
  const generateInterestComparisons = () => {
    const baseRate = parseFloat(annualRate);
    const rates = [
      { rate: baseRate - 1, label: `${(baseRate - 1).toFixed(1)}% (Conservateur)` },
      { rate: baseRate, label: `${baseRate.toFixed(1)}% (Actuel)` },
      { rate: baseRate + 1, label: `${(baseRate + 1).toFixed(1)}% (Optimiste)` },
      { rate: baseRate + 2, label: `${(baseRate + 2).toFixed(1)}% (Agressif)` }
    ];

    const comparisons = rates.map(({ rate, label }) => {
      const P = parseFloat(initialAmount) || 0;
      const PMT = parseFloat(monthlyContribution) || 0;
      const r = rate / 100;
      const t = parseFloat(years);
      const monthlyRate = r / 12;
      const totalMonths = t * 12;

      let balance = P;
      let totalContributions = P;

      for (let month = 1; month <= totalMonths; month++) {
        const monthlyInterest = balance * monthlyRate;
        balance += monthlyInterest + PMT;
        totalContributions += PMT;
      }

      return {
        rate,
        finalAmount: balance,
        totalInterest: balance - totalContributions,
        label
      };
    });

    setInterestComparisons(comparisons);
  };

  /**
   * Add custom goal
   */
  const addCustomGoal = () => {
    const amount = parseFloat(customGoalAmount);
    if (amount > 0 && customGoalDescription.trim()) {
      const monthsToReach = calculateTimeToGoal(amount);
      const newGoal: CustomGoal = {
        id: Date.now().toString(),
        amount,
        description: customGoalDescription,
        monthsToReach
      };
      setCustomGoals([...customGoals, newGoal]);
      setCustomGoalAmount("");
      setCustomGoalDescription("");
    }
  };

  /**
   * Remove custom goal
   */
  const removeCustomGoal = (id: string) => {
    setCustomGoals(customGoals.filter(goal => goal.id !== id));
  };

  /**
   * Get chart data for growth visualization
   */
  const getChartData = () => {
    if (!result) return [];
    
    return result.monthlyData
      .filter((_, index) => index % 6 === 0 || index === result.monthlyData.length - 1)
      .map(data => ({
        month: `Mois ${data.month}`,
        "Valeur Nominale": Math.round(data.balance),
        "Valeur Réelle": Math.round(data.realValue || data.balance),
        "Contributions": Math.round(parseFloat(initialAmount) + (data.month * parseFloat(monthlyContribution)))
      }));
  };

  useEffect(() => {
    calculateSavings();
    generateInterestComparisons();
    calculateTaxAdvantagedSavings();
    calculatePortfolioSimulation();
    if (showAdvancedOptions) {
      generateScenarios();
    }
  }, [initialAmount, monthlyContribution, annualRate, years, compoundFrequency, inflationRate, increaseRate, decreaseRate, irregularAmounts, showAdvancedOptions, selectedRiskProfile]);

  const compoundOptions = [
    { value: "1", label: "Annuellement" },
    { value: "4", label: "Trimestriellement" },
    { value: "12", label: "Mensuellement" },
    { value: "365", label: "Quotidiennement" }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="calculator">Calculateur</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Paramètres de base pour calculer votre épargne avec intérêts composés</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="charts">Graphiques</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visualisation graphique de l'évolution de votre épargne dans le temps</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="comparison">Comparaison</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Comparaison de différents taux d'intérêt pour optimiser vos placements</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="scenarios">Scénarios</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Scénarios avancés avec différents modèles de versements mensuels</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="tax-accounts">Fiscalité</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Analyse fiscale des différents comptes d'épargne français (Livret A, PEL, etc.)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="portfolio">Portefeuille</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Simulation de portefeuille d'investissement avec profils de risque</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="goals">Objectifs</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Définition et suivi d'objectifs d'épargne personnalisés</p>
              </TooltipContent>
            </Tooltip>
          </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Parameters */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Paramètres d'Épargne
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialAmount">Montant initial (€)</Label>
                    <Input
                      id="initialAmount"
                      type="number"
                      value={initialAmount}
                      onChange={(e) => setInitialAmount(e.target.value)}
                      placeholder="Montant de départ"
                      className="bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyContribution">Versement mensuel (€)</Label>
                    <Input
                      id="monthlyContribution"
                      type="number"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(e.target.value)}
                      placeholder="Versement régulier"
                      className="bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualRate">Taux d'intérêt annuel (%)</Label>
                    <Input
                      id="annualRate"
                      type="number"
                      step="0.1"
                      value={annualRate}
                      onChange={(e) => setAnnualRate(e.target.value)}
                      placeholder="Taux de rendement"
                      className="bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inflationRate">Taux d'inflation annuel (%)</Label>
                    <Input
                      id="inflationRate"
                      type="number"
                      step="0.1"
                      value={inflationRate}
                      onChange={(e) => setInflationRate(e.target.value)}
                      placeholder="Inflation prévue"
                      className="bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years">Durée (années)</Label>
                    <Input
                      id="years"
                      type="number"
                      value={years}
                      onChange={(e) => setYears(e.target.value)}
                      placeholder="Période d'épargne"
                      className="bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compoundFrequency">Fréquence de capitalisation</Label>
                    <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {compoundOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={calculateSavings} className="w-full">
                  <Calculator className="w-4 h-4 mr-2" />
                  Recalculer
                </Button>

                {/* Advanced Options Toggle */}
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {showAdvancedOptions ? 'Masquer' : 'Afficher'} les Options Avancées
                  </Button>
                </div>

                {/* Advanced Contribution Patterns */}
                {showAdvancedOptions && (
                  <Card className="mt-4 bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Zap className="w-5 h-5 mr-2" />
                        Scénarios de Versements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Type de Versement</Label>
                        <Select 
                          value={contributionPattern.type} 
                          onValueChange={(value) => setContributionPattern({ 
                            ...contributionPattern, 
                            type: value as ContributionPattern['type'] 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Versements Fixes</SelectItem>
                            <SelectItem value="increasing">Versements Croissants</SelectItem>
                            <SelectItem value="decreasing">Versements Décroissants</SelectItem>
                            <SelectItem value="irregular">Versements Irréguliers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {contributionPattern.type === 'increasing' && (
                        <div>
                          <Label htmlFor="increaseRate" className="text-sm font-medium">
                            Taux d'Augmentation Annuel (%)
                            <HelpCircle className="w-4 h-4 ml-1 inline" />
                          </Label>
                          <Input
                            id="increaseRate"
                            type="number"
                            value={increaseRate}
                            onChange={(e) => setIncreaseRate(e.target.value)}
                            placeholder="3"
                            step="0.1"
                            min="0"
                            max="20"
                          />
                        </div>
                      )}

                      {contributionPattern.type === 'decreasing' && (
                        <div>
                          <Label htmlFor="decreaseRate" className="text-sm font-medium">
                            Taux de Diminution Annuel (%)
                            <HelpCircle className="w-4 h-4 ml-1 inline" />
                          </Label>
                          <Input
                            id="decreaseRate"
                            type="number"
                            value={decreaseRate}
                            onChange={(e) => setDecreaseRate(e.target.value)}
                            placeholder="2"
                            step="0.1"
                            min="0"
                            max="10"
                          />
                        </div>
                      )}

                      {contributionPattern.type === 'irregular' && (
                        <div>
                          <Label htmlFor="irregularAmounts" className="text-sm font-medium">
                            Montants Mensuels (séparés par des virgules)
                            <HelpCircle className="w-4 h-4 ml-1 inline" />
                          </Label>
                          <Input
                            id="irregularAmounts"
                            type="text"
                            value={irregularAmounts}
                            onChange={(e) => setIrregularAmounts(e.target.value)}
                            placeholder="200,300,150,400,250,200"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Exemple: 200,300,150 créera un cycle de 3 mois qui se répète
                          </p>
                        </div>
                      )}

                      <Button onClick={generateScenarios} variant="secondary" className="w-full">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Générer les Scénarios
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Résultats de l'Épargne
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="text-sm text-muted-foreground">Montant final (nominal)</div>
                      <div className="text-2xl font-bold text-green-500">
                        {result.finalAmount.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                    </div>

                    {result.monthlyData.length > 0 && result.monthlyData[result.monthlyData.length - 1].realValue && (
                      <div className="p-4 bg-secondary rounded-lg">
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Valeur réelle (ajustée inflation)
                        </div>
                        <div className="text-xl font-bold text-orange-500">
                          {result.monthlyData[result.monthlyData.length - 1].realValue!.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          })}
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="text-sm text-muted-foreground">Total versé</div>
                      <div className="text-xl font-semibold text-foreground">
                        {result.totalContributions.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                    </div>

                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="text-sm text-muted-foreground">Intérêts gagnés</div>
                      <div className="text-xl font-semibold text-blue-500">
                        {result.totalInterest.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                    </div>

                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="text-sm text-muted-foreground">Rendement total</div>
                      <div className="text-lg font-semibold text-foreground">
                        {((result.totalInterest / result.totalContributions) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          {result && (
            <>
              {/* Growth Chart */}
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Évolution de l'Épargne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip formatter={(value: number) => [
                          value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
                          ''
                        ]} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="Valeur Nominale" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Valeur Réelle" 
                          stroke="#f97316" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Contributions" 
                          stroke="#3b82f6" 
                          strokeWidth={1}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Breakdown */}
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Évolution Mensuelle Détaillée</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.monthlyData.slice(0, 24).map((data) => (
                      <div key={data.month} className="flex justify-between items-center p-3 bg-secondary rounded text-sm">
                        <span className="text-muted-foreground font-medium">Mois {data.month}</span>
                        <div className="flex gap-4 items-center">
                          <div className="text-right">
                            <div className="text-foreground font-medium">
                              {data.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </div>
                            {data.realValue && (
                              <div className="text-xs text-orange-500">
                                Réel: {data.realValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-green-600">
                            +{data.interest.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {/* Interest Rate Comparison */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Comparaison des Taux d'Intérêt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={interestComparisons}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <RechartsTooltip formatter={(value: number) => [
                      value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
                      ''
                    ]} />
                    <Bar dataKey="finalAmount" fill="#22c55e" name="Montant Final" />
                    <Bar dataKey="totalInterest" fill="#3b82f6" name="Intérêts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {interestComparisons.map((comparison, index) => (
                  <div key={index} className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm font-medium text-foreground mb-2">
                      {comparison.label}
                    </div>
                    <div className="text-lg font-bold text-green-500">
                      {comparison.finalAmount.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Intérêts: {comparison.totalInterest.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
               <CardTitle className="flex items-center">
                 <BarChart3 className="w-5 h-5 mr-2" />
                 Comparaison des Scénarios de Versements
               </CardTitle>
               <CardDescription>
                 Comparez différents modèles de versements pour optimiser votre épargne
               </CardDescription>
             </CardHeader>
            <CardContent>
              {scenarios.length > 0 ? (
                <div className="space-y-6">
                  {/* Scenarios Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {scenarios.map((scenario) => (
                      <Card key={scenario.id} className="bg-secondary text-secondary-foreground">
                        <CardHeader className="pb-2">
                           <CardTitle className="text-sm font-medium">{scenario.name}</CardTitle>
                           <CardDescription className="text-xs">{scenario.description}</CardDescription>
                         </CardHeader>
                        <CardContent>
                          {scenario.result && (
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Montant final</p>
                                <p className="text-lg font-bold text-green-600">
                                  {scenario.result.finalAmount.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Intérêts gagnés</p>
                                <p className="text-sm font-semibold text-blue-600">
                                  {scenario.result.totalInterest.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Rendement total</p>
                                <p className="text-sm font-semibold">
                                  {((scenario.result.totalInterest / scenario.result.totalContributions) * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Scenarios Comparison Chart */}
                  <Card className="bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle className="text-lg">Évolution Comparative</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="month" 
                              type="number"
                              domain={['dataMin', 'dataMax']}
                              tickFormatter={(value) => `M${value}`}
                            />
                            <YAxis 
                              tickFormatter={(value) => 
                                new Intl.NumberFormat('fr-FR', {
                                  style: 'currency',
                                  currency: 'EUR',
                                  notation: 'compact'
                                }).format(value)
                              }
                            />
                            <RechartsTooltip 
                              formatter={(value: number) => [
                                new Intl.NumberFormat('fr-FR', {
                                  style: 'currency',
                                  currency: 'EUR'
                                }).format(value),
                                'Montant'
                              ]}
                              labelFormatter={(value) => `Mois ${value}`}
                            />
                            <Legend />
                            {scenarios.map((scenario, index) => {
                              const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];
                              return scenario.result ? (
                                <Line
                                  key={scenario.id}
                                  data={scenario.result.monthlyData}
                                  type="monotone"
                                  dataKey="balance"
                                  stroke={colors[index % colors.length]}
                                  strokeWidth={2}
                                  name={scenario.name}
                                  connectNulls={false}
                                />
                              ) : null;
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Best Strategy Recommendation */}
                  <Card className="bg-card text-card-foreground border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-700">
                        <Target className="w-5 h-5 mr-2" />
                        Recommandation Stratégique
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const bestScenario = scenarios.reduce((best, current) => 
                          (current.result?.finalAmount || 0) > (best.result?.finalAmount || 0) ? current : best
                        );
                        return (
                          <div className="space-y-2">
                            <p className="font-semibold">Stratégie optimale: {bestScenario.name}</p>
                            <p className="text-sm text-muted-foreground">{bestScenario.description}</p>
                            <p className="text-sm">
                              Cette stratégie génère le montant final le plus élevé avec{' '}
                              <span className="font-bold text-green-600">
                                {bestScenario.result?.finalAmount.toLocaleString('fr-FR', {
                                  style: 'currency',
                                  currency: 'EUR'
                                })}
                              </span>
                            </p>
                          </div>
                        );
                      })()
                      }
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Activez les options avancées dans l'onglet Calculateur pour générer des scénarios de comparaison.
                  </p>
                  <Button onClick={() => setShowAdvancedOptions(true)} variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Activer les Options Avancées
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax-Advantaged Accounts Tab */}
        <TabsContent value="tax-accounts" className="space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Percent className="w-5 h-5 mr-2" />
                Comparaison des Comptes d'Épargne Français
              </CardTitle>
              <CardDescription>
                Analysez l'impact de la fiscalité sur vos différents placements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Account Selection */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sélectionner un compte pour les détails</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taxAdvantagedAccounts.map(account => (
                        <SelectItem key={account.type} value={account.type}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Account Details */}
                {(() => {
                  const account = taxAdvantagedAccounts.find(acc => acc.type === selectedAccount);
                  const result = taxAdvantagedResults[selectedAccount];
                  return account ? (
                    <Card className="bg-secondary text-secondary-foreground">
                      <CardHeader>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <CardDescription>{account.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Caractéristiques</h4>
                            {account.maxAmount && (
                              <p className="text-sm">
                                <span className="font-medium">Plafond:</span> {account.maxAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                              </p>
                            )}
                            <p className="text-sm">
                              <span className="font-medium">Taux d'imposition:</span> {account.taxRate}%
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Prélèvements sociaux:</span> {account.socialCharges}%
                            </p>
                            {account.minDuration && (
                              <p className="text-sm">
                                <span className="font-medium">Durée minimale:</span> {account.minDuration} ans
                              </p>
                            )}
                          </div>
                          
                          {result && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Résultats Fiscaux</h4>
                              <p className="text-sm">
                                <span className="font-medium">Intérêts bruts:</span> {result.grossInterest.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Impôts:</span> {result.taxes.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Prélèvements sociaux:</span> {result.socialCharges.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                              </p>
                              <p className="text-sm font-bold text-green-600">
                                <span className="font-medium">Intérêts nets:</span> {result.netInterest.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null;
                })()}

                {/* Comparison Table */}
                <Card className="bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle className="text-lg">Comparaison Complète</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Compte</th>
                            <th className="text-right p-2">Montant Final</th>
                            <th className="text-right p-2">Intérêts Bruts</th>
                            <th className="text-right p-2">Impôts</th>
                            <th className="text-right p-2">Prélèvements</th>
                            <th className="text-right p-2">Intérêts Nets</th>
                            <th className="text-right p-2">Rendement Net</th>
                          </tr>
                        </thead>
                        <tbody>
                          {taxAdvantagedAccounts.map(account => {
                            const result = taxAdvantagedResults[account.type];
                            return (
                              <tr key={account.type} className="border-b hover:bg-muted/50">
                                <td className="p-2 font-medium">{account.name}</td>
                                <td className="text-right p-2 font-bold text-green-600">
                                  {result ? result.finalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                                </td>
                                <td className="text-right p-2">
                                  {result ? result.grossInterest.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                                </td>
                                <td className="text-right p-2 text-red-600">
                                  {result ? result.taxes.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                                </td>
                                <td className="text-right p-2 text-red-600">
                                  {result ? result.socialCharges.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                                </td>
                                <td className="text-right p-2 font-semibold text-blue-600">
                                  {result ? result.netInterest.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                                </td>
                                <td className="text-right p-2 font-semibold">
                                  {result ? `${result.totalReturn.toFixed(2)}%` : '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Best Tax Strategy */}
                <Card className="bg-card text-card-foreground border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-700">
                      <Target className="w-5 h-5 mr-2" />
                      Optimisation Fiscale
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const bestAccount = Object.entries(taxAdvantagedResults)
                        .reduce((best, [key, result]) => 
                          result.finalAmount > (best.result?.finalAmount || 0) ? { key, result } : best
                        , { key: '', result: null as any });
                      
                      const account = taxAdvantagedAccounts.find(acc => acc.type === bestAccount.key);
                      
                      return bestAccount.result && account ? (
                        <div className="space-y-2">
                          <p className="font-semibold">Meilleur choix fiscal: {account.name}</p>
                          <p className="text-sm text-muted-foreground">{account.description}</p>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm font-medium">Économie d'impôts vs compte standard:</p>
                              <p className="text-lg font-bold text-green-600">
                                {(() => {
                                  const standardResult = taxAdvantagedResults['standard'];
                                  if (standardResult) {
                                    const savings = standardResult.taxes + standardResult.socialCharges - 
                                                   (bestAccount.result.taxes + bestAccount.result.socialCharges);
                                    return savings.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
                                  }
                                  return '0 €';
                                })()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Gain net supplémentaire:</p>
                              <p className="text-lg font-bold text-blue-600">
                                {(() => {
                                  const standardResult = taxAdvantagedResults['standard'];
                                  if (standardResult) {
                                    const extraGain = bestAccount.result.finalAmount - standardResult.finalAmount;
                                    return extraGain.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
                                  }
                                  return '0 €';
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Calculs en cours...</p>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          {/* Risk Profile Selection */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Simulation de Portefeuille d'Investissement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="risk-profile">Profil de Risque</Label>
                <Select value={selectedRiskProfile} onValueChange={setSelectedRiskProfile}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un profil de risque" />
                  </SelectTrigger>
                  <SelectContent>
                    {riskProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name} - {profile.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedRiskProfile && (() => {
                const profile = riskProfiles.find(p => p.id === selectedRiskProfile);
                return profile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Caractéristiques du Profil</h4>
                      <div className="space-y-1 text-sm">
                        <p>Rendement attendu: <span className="font-medium text-green-600">{profile.expectedReturn}%</span></p>
                        <p>Volatilité: <span className="font-medium text-orange-600">{profile.volatility}%</span></p>
                        <p>Niveau de risque: <Badge variant={profile.riskLevel === 'conservative' ? 'secondary' : profile.riskLevel === 'moderate' ? 'default' : 'destructive'}>{profile.riskLevel === 'conservative' ? 'Conservateur' : profile.riskLevel === 'moderate' ? 'Modéré' : 'Dynamique'}</Badge></p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Allocation d'Actifs</h4>
                      <div className="space-y-1 text-sm">
                        <p>Actions: <span className="font-medium">{profile.allocation.stocks}%</span></p>
                        <p>Obligations: <span className="font-medium">{profile.allocation.bonds}%</span></p>
                        <p>Immobilier: <span className="font-medium">{profile.allocation.realEstate}%</span></p>
                        <p>Matières premières: <span className="font-medium">{profile.allocation.commodities}%</span></p>
                        <p>Liquidités: <span className="font-medium">{profile.allocation.cash}%</span></p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </CardContent>
          </Card>

          {/* Portfolio Simulation Results */}
          {portfolioSimulation && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Scénarios de Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="font-medium text-green-700 dark:text-green-300">Scénario Optimiste</span>
                      <span className="font-bold text-green-800 dark:text-green-200">{portfolioSimulation.scenarios.optimistic.finalAmount.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="font-medium text-blue-700 dark:text-blue-300">Scénario Réaliste</span>
                      <span className="font-bold text-blue-800 dark:text-blue-200">{portfolioSimulation.scenarios.realistic.finalAmount.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="font-medium text-red-700 dark:text-red-300">Scénario Pessimiste</span>
                      <span className="font-bold text-red-800 dark:text-red-200">{portfolioSimulation.scenarios.pessimistic.finalAmount.toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Métriques de Risque</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Perte maximale (Drawdown)</span>
                      <span className="font-medium text-red-600">{portfolioSimulation.riskMetrics.maxDrawdown.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Ratio de Sharpe</span>
                      <span className="font-medium">{portfolioSimulation.riskMetrics.sharpeRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Volatilité annuelle</span>
                      <span className="font-medium text-orange-600">{portfolioSimulation.riskMetrics.volatility.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Portfolio Performance Chart */}
          {portfolioSimulation && (
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Évolution des Scénarios de Portefeuille</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={portfolioSimulation.scenarios.realistic.monthlyData.map((item, index) => ({
                    month: item.month,
                    optimiste: portfolioSimulation.scenarios.optimistic.monthlyData[index]?.balance || 0,
                    realiste: item.balance,
                    pessimiste: portfolioSimulation.scenarios.pessimistic.monthlyData[index]?.balance || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k €`} />
                    <RechartsTooltip formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="optimiste" stroke="#22c55e" strokeWidth={2} name="Optimiste" />
                    <Line type="monotone" dataKey="realiste" stroke="#3b82f6" strokeWidth={2} name="Réaliste" />
                    <Line type="monotone" dataKey="pessimiste" stroke="#ef4444" strokeWidth={2} name="Pessimiste" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          {/* Custom Goal Creator */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Créer un Objectif Personnalisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customGoalDescription">Description</Label>
                  <Input
                    id="customGoalDescription"
                    value={customGoalDescription}
                    onChange={(e) => setCustomGoalDescription(e.target.value)}
                    placeholder="Ex: Achat voiture"
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customGoalAmount">Montant (€)</Label>
                  <Input
                    id="customGoalAmount"
                    type="number"
                    value={customGoalAmount}
                    onChange={(e) => setCustomGoalAmount(e.target.value)}
                    placeholder="Objectif financier"
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addCustomGoal} className="w-full">
                    <Target className="w-4 h-4 mr-2" />
                    Ajouter Objectif
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Predefined Goals */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Objectifs Prédéfinis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[10000, 25000, 50000, 100000].map((goal) => {
                  const monthsToGoal = calculateTimeToGoal(goal);
                  const yearsToGoal = monthsToGoal / 12;
                  
                  return (
                    <div key={goal} className="p-4 bg-secondary rounded-lg text-center">
                      <div className="text-lg font-semibold text-foreground">
                        {goal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {monthsToGoal === Infinity ? (
                          "Impossible"
                        ) : yearsToGoal < 1 ? (
                          `${monthsToGoal} mois`
                        ) : (
                          `${yearsToGoal.toFixed(1)} ans`
                        )}
                      </div>
                      <Calendar className="w-4 h-4 mx-auto mt-2 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Custom Goals List */}
          {customGoals.length > 0 && (
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Mes Objectifs Personnalisés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customGoals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">{goal.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {goal.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {goal.monthsToReach === Infinity ? (
                            "Impossible"
                          ) : goal.monthsToReach < 12 ? (
                            `${goal.monthsToReach} mois`
                          ) : (
                            `${(goal.monthsToReach / 12).toFixed(1)} ans`
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomGoal(goal.id)}
                          className="text-red-500 hover:text-red-700 mt-1"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* User Guide Section */}
      <Card className="bg-card text-card-foreground mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Mode d'Emploi - Calculateur d'Épargne
          </CardTitle>
          <CardDescription>
            Guide complet pour utiliser efficacement toutes les fonctionnalités du calculateur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calculator Tab Guide */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Calculateur
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Montant initial :</strong> Capital de départ de votre épargne</p>
                <p><strong>Versement mensuel :</strong> Montant ajouté chaque mois</p>
                <p><strong>Taux d'intérêt annuel :</strong> Rendement annuel de votre placement</p>
                <p><strong>Durée :</strong> Période d'épargne en années</p>
                <p><strong>Fréquence de capitalisation :</strong> Fréquence de calcul des intérêts composés</p>
                <p><strong>Options avancées :</strong> Inflation, versements variables, scénarios personnalisés</p>
              </div>
            </div>

            {/* Charts Tab Guide */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Graphiques
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Évolution de l'épargne :</strong> Courbe de croissance de votre capital</p>
                <p><strong>Répartition :</strong> Distinction entre capital versé et intérêts gagnés</p>
                <p><strong>Détail mensuel :</strong> Évolution mois par mois sur 24 premiers mois</p>
                <p><strong>Valeur réelle :</strong> Impact de l'inflation sur votre épargne</p>
              </div>
            </div>

            {/* Comparison Tab Guide */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Comparaison
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Taux multiples :</strong> Comparaison automatique de différents taux d'intérêt</p>
                <p><strong>Impact du taux :</strong> Visualisation de l'effet du taux sur le montant final</p>
                <p><strong>Optimisation :</strong> Identification du meilleur rendement possible</p>
              </div>
            </div>

            {/* Scenarios Tab Guide */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Scénarios
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Versements fixes :</strong> Montant constant chaque mois</p>
                <p><strong>Versements croissants :</strong> Augmentation annuelle (ex: +3%/an)</p>
                <p><strong>Versements décroissants :</strong> Diminution progressive</p>
                <p><strong>Versements irréguliers :</strong> Montants variables selon vos possibilités</p>
              </div>
            </div>

            {/* Tax Accounts Tab Guide */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Fiscalité
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Livret A :</strong> Épargne défiscalisée, plafond 22 950€</p>
                <p><strong>PEL :</strong> Plan Épargne Logement, avantages fiscaux</p>
                <p><strong>Assurance Vie :</strong> Fiscalité avantageuse après 8 ans</p>
                <p><strong>PEA :</strong> Plan Épargne Actions, exonération après 5 ans</p>
                <p><strong>Compte standard :</strong> Imposition classique (30% flat tax)</p>
              </div>
            </div>

            {/* Portfolio Tab Guide */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Portefeuille
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Profil Conservateur :</strong> 70% obligations, faible risque, rendement stable</p>
                <p><strong>Profil Modéré :</strong> 50% actions, équilibre risque/rendement</p>
                <p><strong>Profil Dynamique :</strong> 80% actions, fort potentiel, volatilité élevée</p>
                <p><strong>Scénarios :</strong> Projections optimiste, réaliste et pessimiste</p>
                <p><strong>Métriques de risque :</strong> Volatilité, ratio de Sharpe, drawdown maximum</p>
              </div>
            </div>

            {/* Goals Tab Guide */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Target className="w-4 h-4" />
                Objectifs
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Objectifs prédéfinis :</strong> 10k€, 25k€, 50k€, 100k€</p>
                <p><strong>Objectifs personnalisés :</strong> Créez vos propres cibles d'épargne</p>
                <p><strong>Calcul automatique :</strong> Temps nécessaire pour atteindre chaque objectif</p>
                <p><strong>Suivi :</strong> Gestion et suppression de vos objectifs</p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Conseils d'Utilisation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><strong>💡 Commencez simple :</strong> Utilisez d'abord l'onglet Calculateur avec les paramètres de base</p>
                <p><strong>📊 Visualisez :</strong> Consultez les graphiques pour mieux comprendre l'évolution</p>
                <p><strong>🔍 Comparez :</strong> Testez différents taux pour optimiser vos placements</p>
              </div>
              <div className="space-y-2">
                <p><strong>🎯 Fixez des objectifs :</strong> Définissez des cibles concrètes pour rester motivé</p>
                <p><strong>💰 Considérez la fiscalité :</strong> Choisissez le bon type de compte selon votre situation</p>
                <p><strong>⚖️ Diversifiez :</strong> Utilisez le simulateur de portefeuille pour répartir les risques</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avertissement légal */}
      <Card className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold mb-2">Avertissement important :</p>
              <p className="mb-2">
                Cet outil peut comporter des erreurs encore non décelées et pourrait ne plus être à jour au moment où vous l'utilisez. 
                Les calculs et projections fournis sont donnés à titre indicatif uniquement et ne constituent pas des conseils financiers ou d'investissement professionnels.
              </p>
              <p>
                Le créateur de cette application ne saurait en aucun cas être tenu pour responsable d'une perte financière ou d'un quelconque préjudice. 
                Cet outil est fourni gracieusement, sans promesse de résultat ni d'exactitude. 
                Consultez toujours un conseiller financier qualifié avant de prendre des décisions d'investissement importantes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
};