/**
 * BudgetPlanner.tsx
 * Legacy wrapper for the new modular BudgetPlanner
 * Redirects to the new modular implementation
 */

import React from "react";
import { BudgetPlanner as ModularBudgetPlanner } from "./budget/BudgetPlanner";

/**
 * Legacy BudgetPlanner component
 * Now uses the new modular implementation
 */
export const BudgetPlanner = () => {
  return <ModularBudgetPlanner />;
};

export default BudgetPlanner;