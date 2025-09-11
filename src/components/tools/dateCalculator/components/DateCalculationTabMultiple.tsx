/**
 * DateCalculationTabMultiple.tsx
 * Enhanced date calculator component that supports multiple successive operations
 * Allows users to chain multiple add/subtract operations on dates with intermediate results
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarPlus, Copy, Calculator, Plus, Minus, X, RotateCcw, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDateCalculationsEnhanced } from "../hooks/useDateCalculationsEnhanced";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Interface for individual operation
interface DateOperation {
  id: string;
  operation: 'add' | 'subtract';
  amount: string;
  unit: 'days' | 'months' | 'years';
}

// Interface for calculation step result
interface CalculationStep {
  operation: DateOperation;
  result: string;
  formattedResult: string;
}

export const DateCalculationTabMultiple = () => {
  const { toast } = useToast();
  const { calculateNewDate } = useDateCalculationsEnhanced();
  const [baseDate, setBaseDate] = useState("");
  const [operations, setOperations] = useState<DateOperation[]>([
    {
      id: "1",
      operation: 'add',
      amount: "",
      unit: 'days'
    }
  ]);
  const [calculationSteps, setCalculationSteps] = useState<CalculationStep[]>([]);
  const [finalResult, setFinalResult] = useState("");

  /**
   * Copy text to clipboard with toast notification
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le résultat a été copié dans le presse-papiers.",
    });
  };

  /**
   * Add a new operation row
   */
  const addOperation = () => {
    const newOperation: DateOperation = {
      id: Date.now().toString(),
      operation: 'add',
      amount: "",
      unit: 'days'
    };
    setOperations([...operations, newOperation]);
  };

  /**
   * Remove an operation row by ID
   */
  const removeOperation = (id: string) => {
    if (operations.length > 1) {
      setOperations(operations.filter(op => op.id !== id));
    }
  };

  /**
   * Update a specific operation
   */
  const updateOperation = (id: string, field: keyof DateOperation, value: string) => {
    setOperations(operations.map(op => 
      op.id === id ? { ...op, [field]: value } : op
    ));
  };

  /**
   * Clear all operations and reset to single empty operation
   */
  const clearAllOperations = () => {
    setOperations([{
      id: Date.now().toString(),
      operation: 'add',
      amount: "",
      unit: 'days'
    }]);
    setCalculationSteps([]);
    setFinalResult("");
  };

  /**
   * Validate all inputs before calculation
   */
  const validateInputs = (): boolean => {
    if (!baseDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date de base.",
        variant: "destructive"
      });
      return false;
    }

    for (const operation of operations) {
      if (!operation.amount || operation.amount.trim() === "") {
        toast({
          title: "Erreur",
          description: "Veuillez remplir toutes les quantités.",
          variant: "destructive"
        });
        return false;
      }

      const amountNum = parseInt(operation.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer des nombres valides et positifs.",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  /**
   * Calculate multiple successive operations
   */
  const handleCalculateMultiple = () => {
    if (!validateInputs()) return;

    const steps: CalculationStep[] = [];
    let currentDate = baseDate;

    // Process each operation sequentially
    for (const operation of operations) {
      const result = calculateNewDate(currentDate, operation.amount, operation.unit, operation.operation);
      
      if (result.includes("Erreur") || result.includes("invalide")) {
        toast({
          title: "Erreur de calcul",
          description: "Une erreur s'est produite lors du calcul.",
          variant: "destructive"
        });
        return;
      }

      // Extract the date from the formatted result for next calculation
      const dateMatch = result.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        currentDate = dateMatch[1];
      } else {
        // Fallback: try to parse the formatted date back to ISO format
        try {
          const parsedDate = new Date(result.split(' à ')[0]);
          currentDate = format(parsedDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Error parsing date:", error);
          currentDate = baseDate; // Fallback to base date
        }
      }

      steps.push({
        operation,
        result: currentDate,
        formattedResult: result
      });
    }

    setCalculationSteps(steps);
    setFinalResult(steps[steps.length - 1]?.formattedResult || "");
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
          <CalendarPlus className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
          Calculateur de Dates - Opérations Multiples
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 lg:space-y-6 p-4 lg:p-6">
        {/* Base Date Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Date de base</label>
          <Input
            type="date"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            className="bg-white dark:bg-gray-800 border-2 focus:border-blue-400"
          />
        </div>

        {/* Operations Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Opérations successives</h3>
            <div className="flex gap-2">
              <Button
                onClick={addOperation}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
              <Button
                onClick={clearAllOperations}
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-600 hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Effacer tout
              </Button>
            </div>
          </div>

          {/* Operation Rows */}
          {operations.map((operation, index) => (
            <div key={operation.id} className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Étape {index + 1}
                </span>
                {operations.length > 1 && (
                  <Button
                    onClick={() => removeOperation(operation.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 ml-auto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Opération</label>
                  <Select 
                    value={operation.operation} 
                    onValueChange={(value: 'add' | 'subtract') => updateOperation(operation.id, 'operation', value)}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-green-600" />
                          Ajouter
                        </div>
                      </SelectItem>
                      <SelectItem value="subtract">
                        <div className="flex items-center gap-2">
                          <Minus className="w-4 h-4 text-red-600" />
                          Soustraire
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Quantité</label>
                  <Input
                    type="number"
                    value={operation.amount}
                    onChange={(e) => updateOperation(operation.id, 'amount', e.target.value)}
                    placeholder="Ex: 30"
                    className="bg-white dark:bg-gray-800 border-2 focus:border-blue-400"
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Unité</label>
                  <Select 
                    value={operation.unit} 
                    onValueChange={(value: 'days' | 'months' | 'years') => updateOperation(operation.id, 'unit', value)}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Jours</SelectItem>
                      <SelectItem value="months">Mois</SelectItem>
                      <SelectItem value="years">Années</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calculate Button */}
        <Button 
          onClick={handleCalculateMultiple}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!baseDate || operations.some(op => !op.amount)}
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculer les opérations successives
        </Button>

        {/* Intermediate Results */}
        {calculationSteps.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Étapes de calcul</h3>
            {calculationSteps.map((step, index) => (
              <div key={step.operation.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Étape {index + 1}:</span>
                  {step.operation.operation === 'add' ? (
                    <Plus className="w-4 h-4 text-green-600" />
                  ) : (
                    <Minus className="w-4 h-4 text-red-600" />
                  )}
                  <span>{step.operation.amount} {step.operation.unit}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div className="flex-1 text-sm font-medium">
                  {step.formattedResult}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(step.formattedResult)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Final Result */}
        {finalResult && (
          <div className="p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-2xl border-2 border-blue-200 dark:border-blue-700 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
              <h3 className="font-bold text-lg lg:text-xl text-gray-800 dark:text-gray-100">Résultat final</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(finalResult)}
                className="text-blue-600 hover:text-blue-700 self-start"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-2xl lg:text-3xl font-bold text-blue-700 dark:text-blue-300">
                {finalResult}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};