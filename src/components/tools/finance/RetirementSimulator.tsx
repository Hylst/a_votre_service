/**
 * RetirementSimulator.tsx
 * Retirement planning and investment simulation component
 * Helps users plan for retirement with various investment scenarios
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Calendar, DollarSign, PieChart } from "lucide-react";
import { FinancialWarning } from "@/components/ui/financial-warning";

interface RetirementResult {
  totalSavings: number;
  monthlyIncome: number;
  yearsOfIncome: number;
  shortfall: number;
  recommendedSavings: number;
}

interface InvestmentScenario {
  name: string;
  expectedReturn: number;
  risk: 'low' | 'medium' | 'high';
  description: string;
}

export const RetirementSimulator = () => {
  const [currentAge, setCurrentAge] = useState<string>("30");
  const [retirementAge, setRetirementAge] = useState<string>("65");
  const [currentSavings, setCurrentSavings] = useState<string>("10000");
  const [monthlyContribution, setMonthlyContribution] = useState<string>("500");
  const [expectedReturn, setExpectedReturn] = useState<string>("7");
  const [desiredIncome, setDesiredIncome] = useState<string>("3000");
  const [inflationRate, setInflationRate] = useState<string>("2.5");
  const [result, setResult] = useState<RetirementResult | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>("balanced");

  const investmentScenarios: InvestmentScenario[] = [
    {
      name: "Conservateur",
      expectedReturn: 4,
      risk: 'low',
      description: "Obligations et épargne sécurisée"
    },
    {
      name: "Équilibré",
      expectedReturn: 7,
      risk: 'medium',
      description: "Mix actions/obligations (60/40)"
    },
    {
      name: "Dynamique",
      expectedReturn: 10,
      risk: 'high',
      description: "Principalement des actions"
    }
  ];

  /**
   * Calculate retirement projections
   */
  const calculateRetirement = () => {
    const currentAgeNum = parseFloat(currentAge);
    const retirementAgeNum = parseFloat(retirementAge);
    const currentSavingsNum = parseFloat(currentSavings) || 0;
    const monthlyContributionNum = parseFloat(monthlyContribution) || 0;
    const annualReturn = parseFloat(expectedReturn) / 100;
    const monthlyReturn = annualReturn / 12;
    const yearsToRetirement = retirementAgeNum - currentAgeNum;
    const monthsToRetirement = yearsToRetirement * 12;
    const desiredIncomeNum = parseFloat(desiredIncome) || 0;
    const inflationRateNum = parseFloat(inflationRate) / 100;

    // Validation des entrées
    if (isNaN(currentAgeNum) || isNaN(retirementAgeNum) || yearsToRetirement <= 0) {
      setResult(null);
      return;
    }

    // Calculate future value of current savings
    const futureValueCurrentSavings = currentSavingsNum * Math.pow(1 + annualReturn, yearsToRetirement);

    // Calculate future value of monthly contributions (annuity)
    // Protection contre la division par zéro
    let futureValueContributions = 0;
    if (monthlyReturn > 0 && monthsToRetirement > 0) {
      futureValueContributions = monthlyContributionNum * 
        ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn);
    } else if (monthsToRetirement > 0) {
      // Si le taux est 0, calcul simple
      futureValueContributions = monthlyContributionNum * monthsToRetirement;
    }

    const totalSavings = futureValueCurrentSavings + futureValueContributions;

    // Calculate required income adjusted for inflation
    const adjustedDesiredIncome = desiredIncomeNum * Math.pow(1 + inflationRateNum, yearsToRetirement);

    // Assume 4% withdrawal rule for retirement income
    const monthlyIncome = (totalSavings * 0.04) / 12;

    // Calculate how many years the savings will last
    const annualExpenses = adjustedDesiredIncome * 12;
    const yearsOfIncome = annualExpenses > 0 ? totalSavings / annualExpenses : Infinity;

    // Calculate shortfall or surplus
    const shortfall = annualExpenses - (totalSavings * 0.04);

    // Calculate recommended monthly savings to meet goal
    let recommendedSavings = 0;
    if (shortfall > 0) {
      const requiredTotal = annualExpenses / 0.04;
      const requiredFromContributions = requiredTotal - futureValueCurrentSavings;
      
      if (monthlyReturn > 0 && monthsToRetirement > 0) {
        const annuityFactor = (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn;
        if (annuityFactor > 0) {
          recommendedSavings = requiredFromContributions / annuityFactor;
        }
      } else if (monthsToRetirement > 0) {
        recommendedSavings = requiredFromContributions / monthsToRetirement;
      }
    }

    setResult({
      totalSavings,
      monthlyIncome,
      yearsOfIncome: Math.min(yearsOfIncome, 999), // Limite pour l'affichage
      shortfall,
      recommendedSavings: Math.max(0, recommendedSavings)
    });
  };

  /**
   * Handle scenario change
   */
  const handleScenarioChange = (scenarioName: string) => {
    setSelectedScenario(scenarioName);
    const scenario = investmentScenarios.find(s => s.name.toLowerCase() === scenarioName);
    if (scenario) {
      setExpectedReturn(scenario.expectedReturn.toString());
    }
  };

  /**
   * Get risk color
   */
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  useEffect(() => {
    calculateRetirement();
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn, desiredIncome, inflationRate]);

  const yearsToRetirement = parseFloat(retirementAge) - parseFloat(currentAge);
  // Calcul de progression basé sur une carrière typique de 40 ans (25-65)
  const careerStartAge = 25;
  const typicalRetirementAge = 65;
  const totalCareerYears = typicalRetirementAge - careerStartAge;
  const currentCareerAge = Math.max(0, parseFloat(currentAge) - careerStartAge);
  const progressToRetirement = yearsToRetirement > 0 ? Math.min(100, (currentCareerAge / totalCareerYears) * 100) : 100;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculateur</TabsTrigger>
          <TabsTrigger value="scenarios">Scénarios</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Parameters */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Paramètres de Retraite
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentAge">Âge actuel</Label>
                    <Input
                      id="currentAge"
                      type="number"
                      min="18"
                      max="100"
                      value={currentAge}
                      onChange={(e) => setCurrentAge(e.target.value)}
                      className="bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retirementAge">Âge de retraite</Label>
                    <Input
                      id="retirementAge"
                      type="number"
                      min="50"
                      max="100"
                      value={retirementAge}
                      onChange={(e) => setRetirementAge(e.target.value)}
                      className="bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentSavings">Épargne actuelle (€)</Label>
                  <Input
                    id="currentSavings"
                    type="number"
                    min="0"
                    max="10000000"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(e.target.value)}
                    className="bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyContribution">Épargne mensuelle (€)</Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    min="0"
                    max="50000"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedReturn">Rendement attendu (%)</Label>
                  <Input
                    id="expectedReturn"
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(e.target.value)}
                    className="bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiredIncome">Revenu souhaité/mois (€)</Label>
                  <Input
                    id="desiredIncome"
                    type="number"
                    min="0"
                    max="100000"
                    value={desiredIncome}
                    onChange={(e) => setDesiredIncome(e.target.value)}
                    className="bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inflationRate">Taux d'inflation (%)</Label>
                  <Input
                    id="inflationRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(e.target.value)}
                    className="bg-background text-foreground"
                  />
                </div>

                <div className="pt-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Progression vers la retraite</span>
                    <span>{yearsToRetirement} ans restantes</span>
                  </div>
                  <Progress value={Math.max(0, Math.min(100, progressToRetirement))} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Projections de Retraite
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="text-sm text-muted-foreground">Capital à la retraite</div>
                      <div className="text-2xl font-bold text-green-500">
                        {result.totalSavings.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                    </div>

                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="text-sm text-muted-foreground">Revenu mensuel possible</div>
                      <div className="text-xl font-semibold text-foreground">
                        {result.monthlyIncome.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                    </div>

                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="text-sm text-muted-foreground">Durée du capital</div>
                      <div className="text-xl font-semibold text-foreground">
                        {result.yearsOfIncome.toFixed(1)} ans
                      </div>
                    </div>

                    <div className={`p-4 bg-secondary rounded-lg`}>
                      <div className="text-sm text-muted-foreground">
                        {result.shortfall > 0 ? 'Manque à gagner' : 'Surplus'}
                      </div>
                      <div className={`text-xl font-semibold ${
                        result.shortfall > 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {Math.abs(result.shortfall).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                    </div>

                    {result.shortfall > 0 && (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">Épargne recommandée</div>
                        <div className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                          {result.recommendedSavings.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          })} / mois
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Scénarios d'Investissement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {investmentScenarios.map((scenario) => (
                  <div
                    key={scenario.name}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedScenario === scenario.name.toLowerCase()
                        ? 'border-primary bg-primary/10'
                        : 'border-secondary bg-secondary hover:border-primary/50'
                    }`}
                    onClick={() => handleScenarioChange(scenario.name.toLowerCase())}
                  >
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-foreground">{scenario.name}</h3>
                      <div className="text-2xl font-bold text-primary">
                        {scenario.expectedReturn}%
                      </div>
                      <div className={`text-sm font-medium ${getRiskColor(scenario.risk)}`}>
                        Risque {scenario.risk === 'low' ? 'Faible' : scenario.risk === 'medium' ? 'Modéré' : 'Élevé'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Conseils d'Investissement</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Diversifiez vos investissements pour réduire les risques</li>
                  <li>• Commencez tôt pour bénéficier des intérêts composés</li>
                  <li>• Ajustez votre stratégie selon votre âge et tolérance au risque</li>
                  <li>• Réévaluez régulièrement vos objectifs et performances</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mode d'emploi et conseils */}
      <Card className="mt-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-3">Mode d'emploi et conseils :</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p><strong>🎯 Objectif réaliste :</strong> Visez 70-80% de vos revenus actuels pour maintenir votre niveau de vie</p>
                  <p><strong>📈 Règle des 4% :</strong> Votre capital devrait permettre de retirer 4% par an sans l'épuiser</p>
                  <p><strong>⏰ Commencez tôt :</strong> Chaque année compte grâce aux intérêts composés</p>
                  <p><strong>💰 Augmentez progressivement :</strong> Augmentez vos cotisations avec vos revenus</p>
                </div>
                <div className="space-y-2">
                  <p><strong>🔄 Diversification :</strong> Répartissez entre actions, obligations et immobilier</p>
                  <p><strong>📊 Profil de risque :</strong> Plus jeune = plus d'actions, plus âgé = plus de sécurité</p>
                  <p><strong>🏦 Comptes avantagés :</strong> PER, assurance-vie, PEA pour optimiser la fiscalité</p>
                  <p><strong>🔍 Révision annuelle :</strong> Ajustez selon l'évolution de votre situation</p>
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