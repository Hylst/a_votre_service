/**
 * FinanceBudgetSuite.tsx
 * Main component for the Finance & Budget suite with tabbed interface
 * Provides comprehensive financial tools including loan calculators, budget planning, and investment simulators
 */

import React from "react";
import { DollarSign, Calculator, PiggyBank, TrendingUp, Bitcoin, Receipt, BarChart3 } from "lucide-react";
import { ToolContainer } from "@/components/ui/tool-container";
import { ToolTabSystem } from "@/components/ui/tool-tab-system";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoanCalculator } from "./finance/LoanCalculator";
import { BudgetPlanner } from "./finance/BudgetPlanner";
import { SavingsCalculator } from "./finance/SavingsCalculator";
import { RetirementSimulator } from "./finance/RetirementSimulator";
import { CryptoConverter } from "./finance/CryptoConverter";
import { TaxCalculator } from "./finance/TaxCalculator";
import { ExpenseTracker } from "./finance/ExpenseTracker";

export const FinanceBudgetSuite = () => {
  const financeTabs = [
    {
      id: "loan-calculator",
      label: "Calculateur de Prêts",
      icon: <DollarSign className="w-4 h-4" />,
      content: <LoanCalculator />
    },
    {
      id: "budget-planner",
      label: "Planificateur Budget",
      icon: <Calculator className="w-4 h-4" />,
      content: <BudgetPlanner />
    },
    {
      id: "savings-calculator",
      label: "Calculateur Épargne",
      icon: <PiggyBank className="w-4 h-4" />,
      content: <SavingsCalculator />
    },
    {
      id: "retirement-simulator",
      label: "Simulateur Retraite",
      icon: <TrendingUp className="w-4 h-4" />,
      content: <RetirementSimulator />
    },
    {
      id: "crypto-converter",
      label: "Convertisseur Crypto",
      icon: <Bitcoin className="w-4 h-4" />,
      content: <CryptoConverter />
    },
    {
      id: "tax-calculator",
      label: "Calculateur Taxes",
      icon: <Receipt className="w-4 h-4" />,
      content: <TaxCalculator />
    },
    {
      id: "expense-manager",
      label: "Gestionnaire Dépenses",
      icon: <Receipt className="w-4 h-4" />,
      content: <ExpenseTracker />
    }
  ];

  return (
    <TooltipProvider>
      <ToolContainer variant="wide" spacing="xxs">
        <ToolTabSystem
          tabs={financeTabs}
          defaultTab="loan-calculator"
          orientation="horizontal"
          size="md"
          className="w-full"
          tabsListClassName="grid-cols-4 grid-rows-2 sm:grid-cols-4 sm:grid-rows-2 lg:grid-cols-7 lg:grid-rows-1"
        />
      </ToolContainer>
    </TooltipProvider>
  );
};