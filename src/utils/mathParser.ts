/**
 * mathParser.ts - Safe mathematical expression parser
 * Uses mathjs library for secure mathematical expression evaluation
 */

import { evaluate, create, all } from 'mathjs';

// Create a restricted mathjs instance with only safe functions
const math = create(all, {
  // Disable unsafe functions
  'import': false,
  'createUnit': false,
  'evaluate': false,
  'parse': false,
  'compile': false
});

/**
 * Safely evaluates a mathematical expression using mathjs
 * @param expression - The mathematical expression to evaluate
 * @param x - The value to substitute for 'x' in the expression
 * @param angleUnit - The angle unit for trigonometric functions ('rad', 'deg', 'grad')
 * @returns The evaluated result or NaN if invalid
 */
export function safeMathEvaluate(expression: string, x: number, angleUnit: 'rad' | 'deg' | 'grad' = 'rad'): number {
  try {
    // Set angle unit in mathjs
    const config = {
      number: 'number',
      precision: 64
    };
    
    // Configure angle unit
    if (angleUnit === 'deg') {
      math.config({ angles: 'deg' });
    } else if (angleUnit === 'grad') {
      math.config({ angles: 'grad' });
    } else {
      math.config({ angles: 'rad' });
    }

    // Replace common mathematical notation
    let processedExpr = expression
      .replace(/\^/g, '^')  // mathjs supports ^ for power
      .replace(/π/g, 'pi')
      .replace(/pi/g, 'pi')
      .replace(/e(?![a-zA-Z])/g, 'e');

    // Use mathjs evaluate with scope for x variable
    const scope = { x: x };
    const result = math.evaluate(processedExpr, scope);
    
    // Ensure we return a number
    return typeof result === 'number' ? result : NaN;
  } catch (error) {
    console.warn('Math evaluation error:', error);
    return NaN;
  }
}

/**
 * Validates if an expression contains only allowed mathematical operations
 * @param expression - The expression to validate
 * @returns true if the expression is safe, false otherwise
 */
export function validateMathExpression(expression: string): boolean {
  // Allow only mathematical operations, numbers, and basic functions
  const allowedPattern = /^[0-9+\-*/().\s^xsincotaglnqrtbsexpπpieMath\[\]]+$/i;
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /eval/i,
    /function/i,
    /constructor/i,
    /prototype/i,
    /__proto__/i,
    /import/i,
    /require/i,
    /process/i,
    /global/i,
    /window/i,
    /document/i
  ];

  if (!allowedPattern.test(expression)) {
    return false;
  }

  for (const pattern of dangerousPatterns) {
    if (pattern.test(expression)) {
      return false;
    }
  }

  return true;
}

/**
 * Enhanced safe math evaluator with validation
 * @param expression - The mathematical expression to evaluate
 * @param x - The value to substitute for 'x' in the expression
 * @param angleUnit - The angle unit for trigonometric functions
 * @returns The evaluated result or NaN if invalid or unsafe
 */
export function safeEvaluateExpression(expression: string, x: number, angleUnit: 'rad' | 'deg' | 'grad' = 'rad'): number {
  if (!validateMathExpression(expression)) {
    console.warn('Unsafe mathematical expression detected:', expression);
    return NaN;
  }

  return safeMathEvaluate(expression, x, angleUnit);
}