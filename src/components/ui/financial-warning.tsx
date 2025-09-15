/**
 * FinancialWarning.tsx
 * Reusable warning component for financial tools
 * Displays important disclaimer about financial calculations and liability
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const FinancialWarning = () => {
  return (
    <Card className="mt-6 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-semibold mb-3">Avertissement important :</p>
            <div className="space-y-2">
              <p>
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
        </div>
      </CardContent>
    </Card>
  );
};