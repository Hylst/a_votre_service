/**
 * LoanCalculator.tsx
 * Enhanced loan calculator component for mortgage, auto, and personal loans
 * Calculates monthly payments, total interest, amortization schedules, and advanced scenarios
 * Includes down payment, taxes, insurance, PMI, and comprehensive loan analysis
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Calculator, Home, Car, User, TrendingDown, DollarSign, Calendar, AlertCircle, Info, Download, HelpCircle, Percent, Euro, Plus, TrendingUp, FileText, Zap, Clock, Target, BarChart3, Lightbulb, Printer, FileDown } from "lucide-react";

// InfoTooltip component for parameter explanations
const InfoTooltip: React.FC<{ content: string }> = ({ content }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  principalAndInterest: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
  totalMonthlyPayment: number;
}

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

interface LoanScenario {
  id: string;
  name: string;
  amount: number;
  rate: number;
  term: number;
  downPayment: number;
  result: LoanResult;
}

interface LoanParameters {
  propertyValue: number;
  downPayment: number;
  downPaymentPercent: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  propertyTax: number;
  homeInsurance: number;
  pmiRate: number;
  originationFee: number;
}

interface EarlyPayoffResult {
  monthsSaved: number;
  interestSaved: number;
  newTotalInterest: number;
  originalTotalInterest: number;
  yearsSaved: number;
  remainingMonths: number;
  newPayoffDate: string;
}

export const LoanCalculator = () => {
  // Basic loan parameters
  const [propertyValue, setPropertyValue] = useState<string>("");
  const [downPayment, setDownPayment] = useState<string>("");
  const [downPaymentPercent, setDownPaymentPercent] = useState<string>("20");
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [loanTerm, setLoanTerm] = useState<string>("");
  const [loanType, setLoanType] = useState<string>("mortgage");
  
  // Additional costs and fees
  const [propertyTax, setPropertyTax] = useState<string>("");
  const [homeInsurance, setHomeInsurance] = useState<string>("");
  const [pmiRate, setPmiRate] = useState<string>("0.5");
  const [originationFee, setOriginationFee] = useState<string>("");
  const [extraPayment, setExtraPayment] = useState<number>(0);
  
  // Early payoff parameters
  const [lumpSum, setLumpSum] = useState<number>(0);
  const [targetPayoffDate, setTargetPayoffDate] = useState<string>("");
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');
  
  // Results and calculations
  const [result, setResult] = useState<LoanResult | null>(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationEntry[]>([]);
  const [scenarios, setScenarios] = useState<LoanScenario[]>([]);
  const [earlyPayoffResult, setEarlyPayoffResult] = useState<EarlyPayoffResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("calculator");

  /**
   * Enhanced loan calculation with all parameters
   */
  const calculateLoan = () => {
    const propValue = parseFloat(propertyValue) || 0;
    const downPmt = parseFloat(downPayment) || 0;
    const principal = parseFloat(loanAmount) || (propValue - downPmt);
    const rate = parseFloat(interestRate) / 100 / 12;
    const payments = parseFloat(loanTerm) * 12;
    const propTax = parseFloat(propertyTax) || 0;
    const insurance = parseFloat(homeInsurance) || 0;
    const pmi = parseFloat(pmiRate) / 100 / 12 || 0;
    const origFee = parseFloat(originationFee) || 0;

    if (principal <= 0 || rate <= 0 || payments <= 0) {
      alert("Veuillez entrer des valeurs valides pour tous les champs.");
      return;
    }

    // Calculate principal and interest payment
    const principalAndInterest = (principal * rate * Math.pow(1 + rate, payments)) / (Math.pow(1 + rate, payments) - 1);
    
    // Calculate additional monthly costs
    const monthlyPropertyTax = propTax / 12;
    const monthlyInsurance = insurance / 12;
    const monthlyPMI = (propValue > 0 && downPmt / propValue < 0.2) ? (principal * pmi) : 0;
    
    // Total monthly payment
    const totalMonthlyPayment = principalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI;
    
    const totalAmount = principalAndInterest * payments;
    const totalInterest = totalAmount - principal;

    const loanResult: LoanResult = {
      monthlyPayment: principalAndInterest,
      totalInterest,
      totalAmount,
      principalAndInterest,
      propertyTax: monthlyPropertyTax,
      insurance: monthlyInsurance,
      pmi: monthlyPMI,
      totalMonthlyPayment
    };

    setResult(loanResult);
    generateAmortizationSchedule(principal, rate, payments, principalAndInterest);
  };

  /**
   * Generate enhanced amortization schedule with cumulative totals
   */
  const generateAmortizationSchedule = (principal: number, monthlyRate: number, totalPayments: number, monthlyPayment: number) => {
    const schedule: AmortizationEntry[] = [];
    let remainingBalance = principal;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;
    const extraPmt = extraPayment || 0;

    for (let month = 1; month <= totalPayments; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment - interestPayment + extraPmt, remainingBalance);
      remainingBalance -= principalPayment;
      cumulativeInterest += interestPayment;
      cumulativePrincipal += principalPayment;

      schedule.push({
        month,
        payment: monthlyPayment + extraPmt,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance),
        cumulativeInterest,
        cumulativePrincipal
      });

      if (remainingBalance <= 0) break;
    }

    setAmortizationSchedule(schedule);
  };

  /**
   * Calculate down payment based on percentage or amount
   */
  const updateDownPayment = (value: string, isPercentage: boolean) => {
    const propValue = parseFloat(propertyValue) || 0;
    
    if (isPercentage) {
      const percent = parseFloat(value) || 0;
      const amount = (propValue * percent / 100).toString();
      setDownPaymentPercent(value);
      setDownPayment(amount);
      setLoanAmount((propValue - parseFloat(amount)).toString());
    } else {
      const amount = parseFloat(value) || 0;
      const percent = propValue > 0 ? ((amount / propValue) * 100).toString() : "0";
      setDownPayment(value);
      setDownPaymentPercent(percent);
      setLoanAmount((propValue - amount).toString());
    }
  };

  /**
   * Calculate early payoff scenarios with extra payments, lump sum, and target dates
   */
  const calculateEarlyPayoff = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12;
    const payments = parseFloat(loanTerm) * 12;
    const extra = extraPayment || 0;
    const lump = lumpSum || 0;

    if (principal <= 0 || rate <= 0 || payments <= 0) return;

    const monthlyPayment = (principal * rate * Math.pow(1 + rate, payments)) / (Math.pow(1 + rate, payments) - 1);
    
    // Calculate with extra payments and lump sum
    let balance = principal - lump; // Apply lump sum immediately
    let month = 0;
    let totalInterest = 0;
    const frequencyMultiplier = paymentFrequency === 'monthly' ? 1 : paymentFrequency === 'quarterly' ? 3 : 12;

    while (balance > 0 && month < payments) {
      month++;
      const interestPayment = balance * rate;
      const extraThisMonth = (month % frequencyMultiplier === 0) ? extra : 0;
      const principalPayment = Math.min(monthlyPayment + extraThisMonth - interestPayment, balance);
      balance = Math.max(0, balance - principalPayment);
      totalInterest += interestPayment;
    }

    // Calculate savings
    const originalTotalInterest = (monthlyPayment * payments) - principal;
    const interestSaved = originalTotalInterest - totalInterest;
    const monthsSaved = payments - month;
    const yearsSaved = Math.floor(monthsSaved / 12);
    const remainingMonths = monthsSaved % 12;

    setEarlyPayoffResult({
      monthsSaved,
      interestSaved,
      newTotalInterest: totalInterest,
      originalTotalInterest,
      yearsSaved,
      remainingMonths,
      newPayoffDate: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
    });
  };

  /**
   * Add current calculation as a scenario for comparison
   */
  const addScenario = () => {
    if (result && loanAmount && interestRate && loanTerm) {
      const newScenario: LoanScenario = {
        id: Date.now().toString(),
        name: `${loanType} - ${parseFloat(loanAmount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`,
        amount: parseFloat(loanAmount),
        rate: parseFloat(interestRate),
        term: parseFloat(loanTerm),
        downPayment: parseFloat(downPayment) || 0,
        result
      };
      setScenarios([...scenarios, newScenario]);
    }
  };



  /**
   * Remove a scenario from comparison
   */
  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  /**
   * Get default values based on loan type
   */
  const getDefaultValues = (type: string) => {
    switch (type) {
      case "mortgage":
        return { amount: "300000", rate: "3.5", term: "30" };
      case "auto":
        return { amount: "25000", rate: "4.2", term: "5" };
      case "personal":
        return { amount: "10000", rate: "8.5", term: "3" };
      default:
        return { amount: "", rate: "", term: "" };
    }
  };

  /**
   * Handle loan type change and set default values
   */
  const handleLoanTypeChange = (type: string) => {
    setLoanType(type);
    const defaults = getDefaultValues(type);
    setLoanAmount(defaults.amount);
    setInterestRate(defaults.rate);
    setLoanTerm(defaults.term);
  };

  /**
   * Export amortization schedule as CSV
   */
  const exportToCSV = () => {
    if (!amortizationSchedule.length) {
      alert("Veuillez d'abord calculer le prêt pour exporter les données.");
      return;
    }

    const headers = ['Mois', 'Paiement', 'Capital', 'Intérêts', 'Solde Restant', 'Intérêts Cumulés'];
    const csvContent = [
      headers.join(','),
      ...amortizationSchedule.map(entry => [
        entry.month,
        entry.payment.toFixed(2),
        entry.principal.toFixed(2),
        entry.interest.toFixed(2),
        entry.balance.toFixed(2),
        entry.cumulativeInterest.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `amortissement_${loanType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Generate and download PDF summary
   */
  const exportToPDF = () => {
    if (!result) {
      alert("Veuillez d'abord calculer le prêt pour générer le PDF.");
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Résumé de Prêt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .label { font-weight: bold; }
            .value { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Résumé de Prêt ${loanType.charAt(0).toUpperCase() + loanType.slice(1)}</h1>
            <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div class="section">
            <h2>Paramètres du Prêt</h2>
            <div class="grid">
              <div class="card">
                <div><span class="label">Montant emprunté:</span> <span class="value">${parseFloat(loanAmount).toLocaleString('fr-FR')} €</span></div>
                <div><span class="label">Taux d'intérêt:</span> <span class="value">${interestRate}%</span></div>
                <div><span class="label">Durée:</span> <span class="value">${loanTerm} ans</span></div>
              </div>
              <div class="card">
                <div><span class="label">Paiement mensuel:</span> <span class="value">${result.monthlyPayment.toLocaleString('fr-FR')} €</span></div>
                <div><span class="label">Intérêts totaux:</span> <span class="value">${result.totalInterest.toLocaleString('fr-FR')} €</span></div>
                <div><span class="label">Coût total:</span> <span class="value">${result.totalAmount.toLocaleString('fr-FR')} €</span></div>
              </div>
            </div>
          </div>
          
          ${amortizationSchedule.length > 0 ? `
            <div class="section">
              <h2>Tableau d'Amortissement (12 premiers mois)</h2>
              <table>
                <thead>
                  <tr>
                    <th>Mois</th>
                    <th>Paiement</th>
                    <th>Capital</th>
                    <th>Intérêts</th>
                    <th>Solde</th>
                  </tr>
                </thead>
                <tbody>
                  ${amortizationSchedule.slice(0, 12).map(entry => `
                    <tr>
                      <td>${entry.month}</td>
                      <td>${entry.payment.toLocaleString('fr-FR')} €</td>
                      <td>${entry.principal.toLocaleString('fr-FR')} €</td>
                      <td>${entry.interest.toLocaleString('fr-FR')} €</td>
                      <td>${entry.balance.toLocaleString('fr-FR')} €</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  /**
   * Print loan summary
   */
  const printSummary = () => {
    if (!result) {
      alert("Veuillez d'abord calculer le prêt pour imprimer le résumé.");
      return;
    }
    exportToPDF();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Calculateur de Prêt Avancé
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Loan Type Selection */}
          <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Label className="text-base font-medium">Type de Prêt</Label>
                <InfoTooltip content="Choisissez le type de prêt pour obtenir des paramètres adaptés et des conseils spécifiques." />
              </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant={loanType === "mortgage" ? "default" : "outline"}
                onClick={() => handleLoanTypeChange("mortgage")}
                className="flex items-center gap-2 h-12"
              >
                <Home className="h-5 w-5" />
                Immobilier
              </Button>
              <Button
                variant={loanType === "auto" ? "default" : "outline"}
                onClick={() => handleLoanTypeChange("auto")}
                className="flex items-center gap-2 h-12"
              >
                <Car className="h-5 w-5" />
                Auto
              </Button>
              <Button
                variant={loanType === "personal" ? "default" : "outline"}
                onClick={() => handleLoanTypeChange("personal")}
                className="flex items-center gap-2 h-12"
              >
                <User className="h-5 w-5" />
                Personnel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Card className="bg-card text-card-foreground">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Calculateur
              </TabsTrigger>
              <TabsTrigger value="amortization" className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Amortissement
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Comparaison
              </TabsTrigger>
              <TabsTrigger value="early-payoff" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Remb. Anticipé
              </TabsTrigger>
            </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Parameters */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Paramètres de Base
                </h3>
                
                {loanType === "mortgage" && (
                  <>
                    <div>
                      <div className="flex items-center gap-2">
                          <Label htmlFor="propertyValue">Valeur de la propriété (€)</Label>
                          <InfoTooltip content="La valeur totale de la propriété que vous souhaitez acheter." />
                        </div>
                      <Input
                        id="propertyValue"
                        type="number"
                        value={propertyValue}
                        onChange={(e) => {
                          setPropertyValue(e.target.value);
                          const propVal = parseFloat(e.target.value) || 0;
                          const downPmt = (propVal * parseFloat(downPaymentPercent)) / 100;
                          setDownPayment(downPmt.toString());
                          setLoanAmount((propVal - downPmt).toString());
                        }}
                        placeholder="300000"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="downPayment">Apport initial (€)</Label>
                            <InfoTooltip content="Montant payé à l'avance, réduit le montant du prêt et peut éliminer le PMI." />
                          </div>
                        <Input
                          id="downPayment"
                          type="number"
                          value={downPayment}
                          onChange={(e) => updateDownPayment(e.target.value, false)}
                          placeholder="60000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="downPaymentPercent">Apport (%)</Label>
                            <InfoTooltip content="Pourcentage de la valeur de la propriété payé en apport." />
                          </div>
                        <Input
                          id="downPaymentPercent"
                          type="number"
                          step="0.1"
                          value={downPaymentPercent}
                          onChange={(e) => updateDownPayment(e.target.value, true)}
                          placeholder="20"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="loanAmount">Montant du prêt (€)</Label>
                    <InfoTooltip content="Le montant total que vous empruntez, après déduction de l'apport." />
                  </div>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="240000"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="interestRate">Taux d'intérêt annuel (%)</Label>
                    <InfoTooltip content="Le taux d'intérêt annuel fixe ou variable de votre prêt." />
                  </div>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="3.5"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="loanTerm">Durée (années)</Label>
                    <InfoTooltip content="La durée de remboursement du prêt. Plus elle est longue, plus les intérêts totaux sont élevés." />
                  </div>
                  <Input
                    id="loanTerm"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    placeholder="25"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Right Column - Additional Costs */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Coûts Additionnels
                </h3>
                
                {loanType === "mortgage" && (
                  <>
                    <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="propertyTax">Taxes foncières annuelles (€)</Label>
                          <InfoTooltip content="Taxes foncières annuelles sur la propriété." />
                        </div>
                      <Input
                        id="propertyTax"
                        type="number"
                        value={propertyTax}
                        onChange={(e) => setPropertyTax(e.target.value)}
                        placeholder="3000"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="homeInsurance">Assurance habitation annuelle (€)</Label>
                          <InfoTooltip content="Assurance habitation annuelle pour protéger votre propriété." />
                        </div>
                      <Input
                        id="homeInsurance"
                        type="number"
                        value={homeInsurance}
                        onChange={(e) => setHomeInsurance(e.target.value)}
                        placeholder="1200"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="pmiRate">Taux PMI annuel (%)</Label>
                          <InfoTooltip content="Assurance prêt immobilier requise si l'apport est inférieur à 20%. Taux annuel appliqué au montant du prêt." />
                        </div>
                      <Input
                        id="pmiRate"
                        type="number"
                        step="0.01"
                        value={pmiRate}
                        onChange={(e) => setPmiRate(e.target.value)}
                        placeholder="0.5"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
                
                <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="originationFee">Frais de dossier (€)</Label>
                      <InfoTooltip content="Frais de dossier et d'origination du prêt, généralement entre 0.5% et 2% du montant emprunté." />
                    </div>
                  <Input
                    id="originationFee"
                    type="number"
                    value={originationFee}
                    onChange={(e) => setOriginationFee(e.target.value)}
                    placeholder="2000"
                    className="mt-1"
                  />
                </div>
                
                <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="extraPayment">Paiement extra mensuel (€)</Label>
                      <InfoTooltip content="Paiement mensuel supplémentaire pour réduire la durée du prêt et les intérêts totaux." />
                    </div>
                  <Input
                    id="extraPayment"
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(Number(e.target.value) || 0)}
                    placeholder="200"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Calculate Button Section */}
          <div className="flex justify-center gap-4 mt-8">
            <Button onClick={calculateLoan} size="lg" className="px-8">
              <Calculator className="w-5 h-5 mr-2" />
              Calculer le Prêt
            </Button>
            {result && (
              <Button onClick={addScenario} variant="outline" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter Scénario
              </Button>
            )}
          </div>

          {/* Results Section */}
           {result && (
             <div className="mt-8">
               <Card className="bg-card text-card-foreground">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <TrendingUp className="h-5 w-5" />
                     Résultats du Calcul
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div className="p-4 bg-secondary rounded-lg">
                       <div className="text-sm text-muted-foreground">Paiement Principal + Intérêts</div>
                       <div className="text-2xl font-bold text-foreground">
                         {result.principalAndInterest.toLocaleString('fr-FR', {
                           style: 'currency',
                           currency: 'EUR'
                         })}
                       </div>
                     </div>
 
                     {loanType === "mortgage" && (
                       <>
                         <div className="p-4 bg-secondary rounded-lg">
                           <div className="text-sm text-muted-foreground">Taxes + Assurance + PMI</div>
                           <div className="text-xl font-semibold text-foreground">
                             {(result.propertyTax + result.insurance + result.pmi).toLocaleString('fr-FR', {
                               style: 'currency',
                               currency: 'EUR'
                             })}
                           </div>
                         </div>
                         
                         <div className="p-4 bg-secondary rounded-lg">
                           <div className="text-sm text-muted-foreground">Paiement Total Mensuel</div>
                           <div className="text-2xl font-bold text-primary">
                             {result.totalMonthlyPayment.toLocaleString('fr-FR', {
                               style: 'currency',
                               currency: 'EUR'
                             })}
                           </div>
                         </div>
                       </>
                     )}
 
                     <div className="p-4 bg-secondary rounded-lg">
                       <div className="text-sm text-muted-foreground">Intérêts Totaux</div>
                       <div className="text-xl font-semibold text-foreground">
                         {result.totalInterest.toLocaleString('fr-FR', {
                           style: 'currency',
                           currency: 'EUR'
                         })}
                       </div>
                     </div>
                   </div>
                   
                   {/* Payment Breakdown Chart */}
                   <div className="mt-6">
                     <h4 className="text-lg font-semibold mb-4">Répartition des Paiements</h4>
                     <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie
                             data={[
                               { name: 'Capital', value: parseFloat(loanAmount), fill: '#8884d8' },
                               { name: 'Intérêts', value: result.totalInterest, fill: '#82ca9d' },
                               ...(loanType === "mortgage" ? [
                                 { name: 'Taxes', value: result.propertyTax * parseFloat(loanTerm) * 12, fill: '#ffc658' },
                                 { name: 'Assurance', value: result.insurance * parseFloat(loanTerm) * 12, fill: '#ff7300' },
                                 { name: 'PMI', value: result.pmi * parseFloat(loanTerm) * 12, fill: '#8dd1e1' }
                               ] : [])
                             ]}
                             cx="50%"
                             cy="50%"
                             labelLine={false}
                             label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                             outerRadius={80}
                             fill="#8884d8"
                             dataKey="value"
                           />
                           <RechartsTooltip formatter={(value) => value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} />
                         </PieChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                   
                   {/* Export Buttons */}
                   <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                     <Button onClick={exportToCSV} variant="outline" size="sm">
                       <FileDown className="w-4 h-4 mr-2" />
                       Exporter CSV
                     </Button>
                     <Button onClick={exportToPDF} variant="outline" size="sm">
                       <FileDown className="w-4 h-4 mr-2" />
                       Exporter PDF
                     </Button>
                     <Button onClick={printSummary} variant="outline" size="sm">
                       <Printer className="w-4 h-4 mr-2" />
                       Imprimer
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             </div>
           )}
        </TabsContent>

        {/* Amortization Chart Tab */}
        <TabsContent value="amortization" className="mt-6">
          {amortizationSchedule.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Tableau d'Amortissement Détaillé
                </h3>
                <div className="text-sm text-muted-foreground">
                  {amortizationSchedule.length} paiements mensuels
                </div>
              </div>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="text-sm text-muted-foreground">Capital Total Payé</div>
                  <div className="text-xl font-semibold text-foreground">
                    {amortizationSchedule[amortizationSchedule.length - 1]?.cumulativePrincipal.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </div>
                </div>
                
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="text-sm text-muted-foreground">Intérêts Totaux Payés</div>
                  <div className="text-xl font-semibold text-foreground">
                    {amortizationSchedule[amortizationSchedule.length - 1]?.cumulativeInterest.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </div>
                </div>
                
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="text-sm text-muted-foreground">Paiements Totaux</div>
                  <div className="text-xl font-semibold text-foreground">
                    {(amortizationSchedule[amortizationSchedule.length - 1]?.cumulativePrincipal + 
                      amortizationSchedule[amortizationSchedule.length - 1]?.cumulativeInterest).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </div>
                </div>
              </div>
              
              {/* Amortization Chart */}
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Graphique d'Amortissement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={amortizationSchedule.filter((_, index) => index % 12 === 0)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={(value) => `Année ${Math.ceil(value / 12)}`}
                        />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [
                            `${value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`,
                            name === 'balance' ? 'Solde restant' : 
                            name === 'principal' ? 'Capital' : 'Intérêts'
                          ]}
                          labelFormatter={(value) => `Mois ${value}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="balance" 
                          stroke="#8884d8" 
                          name="Solde restant"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="principal" 
                          stroke="#82ca9d" 
                          name="Capital mensuel"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="interest" 
                          stroke="#ffc658" 
                          name="Intérêts mensuels"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Detailed Table */}
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Détail Mensuel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full border-collapse border border-border">
                      <thead className="sticky top-0 bg-muted">
                        <tr>
                          <th className="border border-border p-2 text-left">Mois</th>
                          <th className="border border-border p-2 text-right">Paiement</th>
                          <th className="border border-border p-2 text-right">Capital</th>
                          <th className="border border-border p-2 text-right">Intérêts</th>
                          <th className="border border-border p-2 text-right">Solde</th>
                          <th className="border border-border p-2 text-right">Capital Cumulé</th>
                          <th className="border border-border p-2 text-right">Intérêts Cumulés</th>
                        </tr>
                      </thead>
                      <tbody>
                        {amortizationSchedule.map((entry, index) => (
                          <tr key={index} className="hover:bg-muted/50">
                            <td className="border border-border p-2 font-medium">{entry.month}</td>
                            <td className="border border-border p-2 text-right">
                              {entry.payment.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              })}
                            </td>
                            <td className="border border-border p-2 text-right text-blue-600">
                              {entry.principal.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              })}
                            </td>
                            <td className="border border-border p-2 text-right text-red-600">
                              {entry.interest.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              })}
                            </td>
                            <td className="border border-border p-2 text-right font-medium">
                              {entry.balance.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              })}
                            </td>
                            <td className="border border-border p-2 text-right text-blue-600 font-medium">
                              {entry.cumulativePrincipal.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              })}
                            </td>
                            <td className="border border-border p-2 text-right text-red-600 font-medium">
                              {entry.cumulativeInterest.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Export Buttons for Amortization */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                    <Button onClick={exportToCSV} variant="outline" size="sm">
                      <FileDown className="w-4 h-4 mr-2" />
                      Exporter Tableau CSV
                    </Button>
                    <Button onClick={exportToPDF} variant="outline" size="sm">
                      <FileDown className="w-4 h-4 mr-2" />
                      Exporter Tableau PDF
                    </Button>
                    <Button onClick={printSummary} variant="outline" size="sm">
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimer Tableau
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-card text-card-foreground">
              <CardContent className="flex items-center justify-center h-48">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>Calculez d'abord un prêt pour voir le graphique d'amortissement</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Scenarios Comparison Tab */}
        <TabsContent value="scenarios" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Comparaison de Scénarios de Prêt
              </h3>
              {result && (
                <Button onClick={addScenario} className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Scénario Actuel
                </Button>
              )}
            </div>
            
            {scenarios.length > 0 ? (
              <div className="space-y-6">
                {/* Summary Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">Meilleur Paiement Mensuel</div>
                    <div className="text-xl font-semibold text-green-600">
                      {Math.min(...scenarios.map(s => s.result.monthlyPayment)).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Scénario {scenarios.findIndex(s => s.result.monthlyPayment === Math.min(...scenarios.map(s => s.result.monthlyPayment))) + 1}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">Moins d'Intérêts Totaux</div>
                    <div className="text-xl font-semibold text-green-600">
                      {Math.min(...scenarios.map(s => s.result.totalInterest)).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Scénario {scenarios.findIndex(s => s.result.totalInterest === Math.min(...scenarios.map(s => s.result.totalInterest))) + 1}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">Économies Maximales</div>
                    <div className="text-xl font-semibold text-blue-600">
                      {(Math.max(...scenarios.map(s => s.result.totalInterest)) - Math.min(...scenarios.map(s => s.result.totalInterest))).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Différence entre le meilleur et le pire scénario
                    </div>
                  </div>
                </div>
                
                {/* Detailed Comparison Table */}
                <Card className="bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>Tableau Comparatif Détaillé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-border">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-border p-3 text-left">Scénario</th>
                            <th className="border border-border p-3 text-right">Montant</th>
                            <th className="border border-border p-3 text-right">Acompte</th>
                            <th className="border border-border p-3 text-right">Taux</th>
                            <th className="border border-border p-3 text-right">Durée</th>
                            <th className="border border-border p-3 text-right">Paiement Mensuel</th>
                            <th className="border border-border p-3 text-right">Intérêts Totaux</th>
                            <th className="border border-border p-3 text-right">Coût Total</th>
                            <th className="border border-border p-3 text-center">Recommandation</th>
                            <th className="border border-border p-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scenarios.map((scenario, index) => {
                            const isLowestPayment = scenario.result.monthlyPayment === Math.min(...scenarios.map(s => s.result.monthlyPayment));
                            const isLowestInterest = scenario.result.totalInterest === Math.min(...scenarios.map(s => s.result.totalInterest));
                            const totalCost = scenario.amount + scenario.result.totalInterest;
                            
                            return (
                              <tr key={index} className={`hover:bg-muted/50 ${
                                isLowestPayment || isLowestInterest ? 'bg-green-50 dark:bg-green-900/20' : ''
                              }`}>
                                <td className="border border-border p-3 font-medium">
                                  <div className="flex items-center gap-2">
                                    {scenario.name}
                                    {(isLowestPayment || isLowestInterest) && (
                                      <span className="text-green-600 text-xs">⭐</span>
                                    )}
                                  </div>
                                </td>
                                <td className="border border-border p-3 text-right">
                                  {scenario.amount.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  })}
                                </td>
                                <td className="border border-border p-3 text-right">
                                  {scenario.downPayment?.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  }) || 'N/A'}
                                </td>
                                <td className="border border-border p-3 text-right font-medium">
                                  {scenario.rate}%
                                </td>
                                <td className="border border-border p-3 text-right">
                                  {scenario.term} ans
                                </td>
                                <td className={`border border-border p-3 text-right font-semibold ${
                                  isLowestPayment ? 'text-green-600' : ''
                                }`}>
                                  {scenario.result.monthlyPayment.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  })}
                                </td>
                                <td className={`border border-border p-3 text-right ${
                                  isLowestInterest ? 'text-green-600 font-semibold' : ''
                                }`}>
                                  {scenario.result.totalInterest.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  })}
                                </td>
                                <td className="border border-border p-3 text-right font-medium">
                                  {totalCost.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  })}
                                </td>
                                <td className="border border-border p-3 text-center">
                                  {isLowestPayment && isLowestInterest ? (
                                    <span className="text-green-600 font-semibold text-xs">OPTIMAL</span>
                                  ) : isLowestPayment ? (
                                    <span className="text-blue-600 text-xs">Paiement +</span>
                                  ) : isLowestInterest ? (
                                    <span className="text-purple-600 text-xs">Économies +</span>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">Standard</span>
                                  )}
                                </td>
                                <td className="border border-border p-3 text-center">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeScenario(scenario.id)}
                                  >
                                    <AlertCircle className="h-3 w-3" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Visual Comparison Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Payment Comparison */}
                  <Card className="bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle>Comparaison des Paiements Mensuels</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={scenarios.map((scenario, index) => ({
                            name: scenario.name,
                            monthlyPayment: scenario.result.monthlyPayment,
                            fill: scenario.result.monthlyPayment === Math.min(...scenarios.map(s => s.result.monthlyPayment)) ? '#10b981' : '#6366f1'
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                            <RechartsTooltip 
                              formatter={(value) => [
                                value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
                                'Paiement Mensuel'
                              ]}
                            />
                            <Bar dataKey="monthlyPayment" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Total Interest Comparison */}
                  <Card className="bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle>Comparaison des Intérêts Totaux</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={scenarios.map((scenario, index) => ({
                            name: scenario.name,
                            totalInterest: scenario.result.totalInterest,
                            fill: scenario.result.totalInterest === Math.min(...scenarios.map(s => s.result.totalInterest)) ? '#10b981' : '#ef4444'
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                            <RechartsTooltip 
                              formatter={(value) => [
                                value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
                                'Intérêts Totaux'
                              ]}
                            />
                            <Bar dataKey="totalInterest" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recommendations */}
                <Card className="bg-card text-card-foreground border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      Recommandations Personnalisées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const bestPayment = scenarios.find(s => s.result.monthlyPayment === Math.min(...scenarios.map(s => s.result.monthlyPayment)));
                        const bestInterest = scenarios.find(s => s.result.totalInterest === Math.min(...scenarios.map(s => s.result.totalInterest)));
                        const bestPaymentIndex = scenarios.findIndex(s => s === bestPayment);
                        const bestInterestIndex = scenarios.findIndex(s => s === bestInterest);
                        
                        return (
                          <>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                                💰 Pour un paiement mensuel minimal
                              </h4>
                              <p className="text-sm text-green-700 dark:text-green-300">
                                Choisissez le <strong>{bestPayment?.name}</strong> avec un paiement de{' '}
                                <strong>{bestPayment?.result.monthlyPayment.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</strong> par mois.
                              </p>
                            </div>
                            
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                                📈 Pour économiser sur les intérêts
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                Optez pour le <strong>{bestInterest?.name}</strong> et économisez{' '}
                                <strong>
                                  {(Math.max(...scenarios.map(s => s.result.totalInterest)) - bestInterest!.result.totalInterest).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                </strong> en intérêts totaux.
                              </p>
                            </div>
                            
                            {bestPaymentIndex !== bestInterestIndex && (
                              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                  ⚖️ Compromis à considérer
                                </h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                  Le scénario avec le paiement le plus bas n'est pas celui avec le moins d'intérêts. 
                                  Évaluez vos priorités : liquidités mensuelles vs économies à long terme.
                                </p>
                              </div>
                            )}
                          </>
                        );
                      })()
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun Scénario à Comparer</h3>
                <p className="text-muted-foreground mb-4">
                  Ajoutez différents scénarios de prêt pour les comparer et trouver la meilleure option.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>💡 <strong>Astuce :</strong> Modifiez les paramètres du calculateur puis cliquez sur "Ajouter Scénario Actuel"</p>
                  <p>📊 Comparez les taux, durées et montants pour optimiser votre choix</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Early Payoff Tab */}
        <TabsContent value="early-payoff" className="mt-6 space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Calculateur de Remboursement Anticipé</h3>
            </div>
            
            {/* Input Section */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Paramètres de Remboursement Anticipé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="extra-payment">Paiement Extra Mensuel</Label>
                        <InfoTooltip content="Montant supplémentaire ajouté chaque mois au paiement régulier. Même un petit montant peut considérablement réduire la durée du prêt." />
                      </div>
                      <div className="relative">
                        <Input
                          id="extra-payment"
                          type="number"
                          value={extraPayment}
                          onChange={(e) => setExtraPayment(Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Exemple: 100€/mois peut économiser des années
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="lump-sum">Paiement Unique</Label>
                        <InfoTooltip content="Montant forfaitaire appliqué directement au capital. Idéal pour utiliser un bonus, héritage ou économies." />
                      </div>
                      <div className="relative">
                        <Input
                          id="lump-sum"
                          type="number"
                          value={lumpSum}
                          onChange={(e) => setLumpSum(Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Appliqué immédiatement au capital restant
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="target-payoff-date">Date Cible de Remboursement</Label>
                        <InfoTooltip content="Calculez le paiement supplémentaire nécessaire pour rembourser à une date précise." />
                      </div>
                      <Input
                        id="target-payoff-date"
                        type="date"
                        value={targetPayoffDate}
                        onChange={(e) => setTargetPayoffDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="frequency">Fréquence des Paiements Extra</Label>
                        <InfoTooltip content="Choisissez la fréquence de vos paiements supplémentaires selon vos capacités financières." />
                      </div>
                      <select
                        id="frequency"
                        value={paymentFrequency}
                        onChange={(e) => setPaymentFrequency(e.target.value as 'monthly' | 'quarterly' | 'annually')}
                        className="w-full p-2 border border-border rounded-md bg-background"
                      >
                        <option value="monthly">Mensuel</option>
                        <option value="quarterly">Trimestriel</option>
                        <option value="annually">Annuel</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                  <Button 
                    onClick={calculateEarlyPayoff} 
                    className="flex-1 bg-primary text-primary-foreground"
                    disabled={!result}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculer le Remboursement Anticipé
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setExtraPayment(0);
                      setLumpSum(0);
                      setTargetPayoffDate('');
                      setEarlyPayoffResult(null);
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
                
                {!result && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Calculez d'abord un prêt dans l'onglet Calculateur</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {earlyPayoffResult && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <div className="text-sm text-green-700 dark:text-green-300">Temps Économisé</div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.floor(earlyPayoffResult.monthsSaved / 12)} ans {earlyPayoffResult.monthsSaved % 12} mois
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-blue-600" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">Intérêts Économisés</div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {earlyPayoffResult.interestSaved.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <div className="text-sm text-purple-700 dark:text-purple-300">Nouvelle Durée</div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.floor((parseFloat(loanTerm) * 12 - earlyPayoffResult.monthsSaved) / 12)} ans {(parseFloat(loanTerm) * 12 - earlyPayoffResult.monthsSaved) % 12} mois
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        <div className="text-sm text-orange-700 dark:text-orange-300">Paiement Total</div>
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {result && (result.monthlyPayment + extraPayment).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                      <div className="text-xs text-orange-600">
                        (+{extraPayment.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })})
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Comparison Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Savings Breakdown */}
                  <Card className="bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Analyse des Économies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                          <span className="text-sm">Coût total original:</span>
                          <span className="font-semibold">
                            {(parseFloat(loanAmount) + (result?.totalInterest || 0)).toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                          <span className="text-sm">Coût total avec remboursement anticipé:</span>
                          <span className="font-semibold text-green-600">
                            {(parseFloat(loanAmount) + (result?.totalInterest || 0) - earlyPayoffResult.interestSaved).toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <span className="text-sm font-semibold text-green-700 dark:text-green-300">Économies totales:</span>
                          <span className="font-bold text-green-600 text-lg">
                            {earlyPayoffResult.interestSaved.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            })}
                          </span>
                        </div>
                        
                        <div className="mt-4">
                          <div className="text-sm text-muted-foreground mb-2">Pourcentage d'économies sur les intérêts</div>
                          <div className="w-full bg-secondary rounded-full h-3">
                            <div 
                              className="bg-green-500 h-3 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min(100, (earlyPayoffResult.interestSaved / (result?.totalInterest || 1)) * 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className="text-right text-sm text-green-600 font-semibold mt-1">
                            {((earlyPayoffResult.interestSaved / (result?.totalInterest || 1)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Payment Timeline Comparison */}
                  <Card className="bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Comparaison Temporelle
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            {
                              name: 'Prêt Original',
                              durée: parseFloat(loanTerm) * 12,
                              intérêts: result?.totalInterest || 0,
                              fill: '#ef4444'
                            },
                            {
                              name: 'Avec Remboursement Anticipé',
                              durée: parseFloat(loanTerm) * 12 - earlyPayoffResult.monthsSaved,
                              intérêts: (result?.totalInterest || 0) - earlyPayoffResult.interestSaved,
                              fill: '#10b981'
                            }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${value} mois`} />
                            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                            <RechartsTooltip 
                              formatter={(value, name) => {
                                if (name === 'durée') {
                                  return [`${value} mois`, 'Durée'];
                                }
                                return [value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), 'Intérêts'];
                              }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="durée" name="durée" />
                            <Bar yAxisId="right" dataKey="intérêts" name="intérêts" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recommendations */}
                <Card className="bg-card text-card-foreground border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Conseils d'Optimisation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">💡 Stratégie Recommandée</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {extraPayment > 0 
                              ? `Avec ${extraPayment}€ supplémentaires par mois, vous économisez ${earlyPayoffResult.interestSaved.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} et finissez ${Math.floor(earlyPayoffResult.monthsSaved / 12)} ans plus tôt.`
                              : "Même 50€ par mois peuvent faire une différence significative sur la durée totale du prêt."
                            }
                          </p>
                        </div>
                        
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">🎯 Objectif Réaliste</h4>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Commencez petit et augmentez progressivement. Un paiement supplémentaire de 1% du capital par mois est un bon début.
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">📊 Impact du Timing</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Les paiements supplémentaires en début de prêt ont plus d'impact car ils réduisent le capital sur lequel les intérêts sont calculés.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">⚖️ Équilibre Financier</h4>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Assurez-vous de maintenir un fonds d'urgence avant d'augmenter vos paiements de prêt.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>

  {/* Mode d'emploi et conseils */}
  <Card className="mt-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
    <CardContent className="pt-4">
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-semibold mb-3">Mode d'emploi et conseils :</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p><strong>🏠 Immobilier :</strong> Utilisez l'onglet "Immobilier" pour inclure taxes foncières et assurances</p>
              <p><strong>🚗 Auto/Personnel :</strong> Choisissez le type de prêt adapté pour des calculs précis</p>
              <p><strong>📊 Tableau d'amortissement :</strong> Visualisez l'évolution capital/intérêts mois par mois</p>
              <p><strong>⚡ Remboursement anticipé :</strong> Simulez l'impact d'un paiement supplémentaire</p>
            </div>
            <div className="space-y-2">
              <p><strong>💡 Négociez le taux :</strong> 0,1% de différence = économies significatives sur la durée</p>
              <p><strong>🎯 Apport optimal :</strong> Généralement 10-20% pour éviter l'assurance emprunteur</p>
              <p><strong>📈 Comparez les offres :</strong> Utilisez l'onglet "Comparaison" pour plusieurs scénarios</p>
              <p><strong>⏰ Durée vs mensualités :</strong> Plus court = moins d'intérêts, plus long = mensualités réduites</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Avertissement légal */}
  <Card className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
    <CardContent className="pt-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-800 dark:text-yellow-200">
          <p className="font-semibold mb-2">Avertissement important :</p>
          <p className="mb-2">
            Cet outil peut comporter des erreurs encore non décelées et pourrait ne plus être à jour au moment où vous l'utilisez. 
            Les calculs fournis sont donnés à titre indicatif uniquement et ne constituent pas des conseils financiers professionnels.
          </p>
          <p>
            Le créateur de cette application ne saurait en aucun cas être tenu pour responsable d'une perte financière ou d'un quelconque préjudice. 
            Cet outil est fourni gracieusement, sans promesse de résultat ni d'exactitude. 
            Consultez toujours un conseiller financier qualifié avant de prendre des décisions importantes.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
  );
};

export default LoanCalculator;