
import React from "react";
import { Calculator, Zap, History, Code, TrendingUp } from "lucide-react";
import { ToolContainer } from "@/components/ui/tool-container";
import { ToolTabSystem } from "@/components/ui/tool-tab-system";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BasicCalculator } from "./calculator/BasicCalculator";
import { ScientificCalculator } from "./calculator/ScientificCalculator";
import { ProgrammerCalculator } from "./calculator/ProgrammerCalculator";
import { GraphingCalculator } from "./calculator/GraphingCalculator";
import { HistoryPanel } from "./calculator/HistoryPanel";
import { useCalculatorState } from "./calculator/hooks/useCalculatorState";

export const CalculatorImproved = () => {
  const calculatorState = useCalculatorState();

  const calculatorTabs = [
    {
      id: "basic",
      label: "Basique",
      icon: <Calculator className="w-4 h-4" />,
      badge: "Standard",
      content: <BasicCalculator {...calculatorState} />
    },
    {
      id: "scientific",
      label: "Scientifique",
      icon: <Zap className="w-4 h-4" />,
      badge: "50+ fonctions",
      content: <ScientificCalculator {...calculatorState} />
    },
    {
      id: "programmer",
      label: "Programmeur",
      icon: <Code className="w-4 h-4" />,
      badge: "Binaire & Hex",
      content: <ProgrammerCalculator 
        history={calculatorState.history}
        setHistory={calculatorState.setHistory}
        clearAll={calculatorState.clearAll}
      />
    },
    {
      id: "graphing",
      label: "Graphique",
      icon: <TrendingUp className="w-4 h-4" />,
      badge: "f(x)",
      content: <GraphingCalculator
        history={calculatorState.history}
        setHistory={calculatorState.setHistory}
        clearAll={calculatorState.clearAll}
      />
    },
    {
      id: "history",
      label: "Historique",
      icon: <History className="w-4 h-4" />,
      badge: "Mémoire",
      content: <HistoryPanel {...calculatorState} />
    }
  ];

  return (
    <TooltipProvider>
      <ToolContainer variant="wide" spacing="xxs">
        <ToolTabSystem
          tabs={calculatorTabs}
          defaultTab="basic"
          orientation="horizontal"
          size="md"
          className="w-full"
          tabsListClassName="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        />
      </ToolContainer>
    </TooltipProvider>
  );
};
