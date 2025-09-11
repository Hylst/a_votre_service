/**
 * aiResponseParser.ts
 * Modular AI Response Parser utility with validation schemas and type-safe response handling
 */

// Types for parsing results
export interface ParseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  method?: string;
  confidence?: number;
}

export interface ValidationSchema {
  required?: string[];
  optional?: string[];
  types?: Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>;
  validators?: Record<string, (value: any) => boolean>;
}

export interface ParsingOptions {
  schema?: ValidationSchema;
  strictMode?: boolean;
  allowPartial?: boolean;
  fallbackData?: any;
}

/**
 * Advanced AI Response Parser
 * Provides multiple parsing strategies with validation and type safety
 */
export class AIResponseParser {
  private static instance: AIResponseParser;
  
  public static getInstance(): AIResponseParser {
    if (!AIResponseParser.instance) {
      AIResponseParser.instance = new AIResponseParser();
    }
    return AIResponseParser.instance;
  }

  /**
   * Main parsing method with multiple strategies
   */
  public parse<T = any>(response: string, options: ParsingOptions = {}): ParseResult<T> {
    console.log('🔍 [AIResponseParser] Starting parsing with options:', options);
    
    const strategies = [
      () => this.parseDirectJSON<T>(response, options),
      () => this.parseCleanedJSON<T>(response, options),
      () => this.parseExtractedJSON<T>(response, options),
      () => this.parseStructuredText<T>(response, options),
      () => this.parseKeyValuePairs<T>(response, options)
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        const result = strategies[i]();
        if (result.success) {
          console.log(`✅ [AIResponseParser] Success with strategy ${i + 1}: ${result.method}`);
          return result;
        }
      } catch (error) {
        console.log(`⚠️ [AIResponseParser] Strategy ${i + 1} failed:`, error);
      }
    }

    // All strategies failed, return fallback
    if (options.fallbackData) {
      return {
        success: true,
        data: options.fallbackData,
        method: 'fallback',
        confidence: 0.1
      };
    }

    return {
      success: false,
      error: 'All parsing strategies failed',
      method: 'none'
    };
  }

  /**
   * Strategy 1: Direct JSON parsing
   */
  private parseDirectJSON<T>(response: string, options: ParsingOptions): ParseResult<T> {
    try {
      const parsed = JSON.parse(response.trim());
      const validation = this.validateData(parsed, options.schema);
      
      if (validation.isValid || !options.strictMode) {
        return {
          success: true,
          data: parsed,
          method: 'direct-json',
          confidence: validation.isValid ? 1.0 : 0.7
        };
      }
      
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
        method: 'direct-json'
      };
    } catch (error) {
      return {
        success: false,
        error: `JSON parsing failed: ${error}`,
        method: 'direct-json'
      };
    }
  }

  /**
   * Strategy 2: Cleaned JSON parsing
   */
  private parseCleanedJSON<T>(response: string, options: ParsingOptions): ParseResult<T> {
    try {
      let cleaned = this.cleanJSONString(response);
      const parsed = JSON.parse(cleaned);
      const validation = this.validateData(parsed, options.schema);
      
      if (validation.isValid || !options.strictMode) {
        return {
          success: true,
          data: parsed,
          method: 'cleaned-json',
          confidence: validation.isValid ? 0.9 : 0.6
        };
      }
      
      return {
        success: false,
        error: `Validation failed after cleaning: ${validation.errors.join(', ')}`,
        method: 'cleaned-json'
      };
    } catch (error) {
      return {
        success: false,
        error: `Cleaned JSON parsing failed: ${error}`,
        method: 'cleaned-json'
      };
    }
  }

  /**
   * Strategy 3: Extract JSON from mixed content
   */
  private parseExtractedJSON<T>(response: string, options: ParsingOptions): ParseResult<T> {
    try {
      const extracted = this.extractJSONFromText(response);
      if (!extracted) {
        return {
          success: false,
          error: 'No JSON found in response',
          method: 'extracted-json'
        };
      }
      
      const parsed = JSON.parse(extracted);
      const validation = this.validateData(parsed, options.schema);
      
      if (validation.isValid || !options.strictMode) {
        return {
          success: true,
          data: parsed,
          method: 'extracted-json',
          confidence: validation.isValid ? 0.8 : 0.5
        };
      }
      
      return {
        success: false,
        error: `Validation failed for extracted JSON: ${validation.errors.join(', ')}`,
        method: 'extracted-json'
      };
    } catch (error) {
      return {
        success: false,
        error: `JSON extraction failed: ${error}`,
        method: 'extracted-json'
      };
    }
  }

  /**
   * Strategy 4: Parse structured text (lists, bullet points)
   */
  private parseStructuredText<T>(response: string, options: ParsingOptions): ParseResult<T> {
    try {
      const structured = this.parseTextStructure(response);
      if (!structured || Object.keys(structured).length === 0) {
        return {
          success: false,
          error: 'No structured content found',
          method: 'structured-text'
        };
      }
      
      const validation = this.validateData(structured, options.schema);
      
      if (validation.isValid || !options.strictMode || options.allowPartial) {
        return {
          success: true,
          data: structured as T,
          method: 'structured-text',
          confidence: validation.isValid ? 0.7 : 0.4
        };
      }
      
      return {
        success: false,
        error: `Structured text validation failed: ${validation.errors.join(', ')}`,
        method: 'structured-text'
      };
    } catch (error) {
      return {
        success: false,
        error: `Structured text parsing failed: ${error}`,
        method: 'structured-text'
      };
    }
  }

  /**
   * Strategy 5: Parse key-value pairs
   */
  private parseKeyValuePairs<T>(response: string, options: ParsingOptions): ParseResult<T> {
    try {
      const keyValueData = this.extractKeyValuePairs(response);
      if (!keyValueData || Object.keys(keyValueData).length === 0) {
        return {
          success: false,
          error: 'No key-value pairs found',
          method: 'key-value'
        };
      }
      
      const validation = this.validateData(keyValueData, options.schema);
      
      if (validation.isValid || !options.strictMode || options.allowPartial) {
        return {
          success: true,
          data: keyValueData as T,
          method: 'key-value',
          confidence: validation.isValid ? 0.6 : 0.3
        };
      }
      
      return {
        success: false,
        error: `Key-value validation failed: ${validation.errors.join(', ')}`,
        method: 'key-value'
      };
    } catch (error) {
      return {
        success: false,
        error: `Key-value parsing failed: ${error}`,
        method: 'key-value'
      };
    }
  }

  /**
   * Clean JSON string by removing common formatting issues
   */
  private cleanJSONString(text: string): string {
    let cleaned = text.trim();
    
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '');
    
    // Remove leading/trailing non-JSON content
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    
    // Remove control characters
    cleaned = cleaned.replace(/[\u0000-\u001f\u007f-\u009f]/g, '');
    
    // Fix common JSON issues
    cleaned = cleaned
      // Fix unquoted keys
      .replace(/(\w+)\s*:/g, '"$1":')
      // Fix single quotes
      .replace(/'/g, '"')
      // Fix trailing commas
      .replace(/,\s*([}\]])/g, '$1')
      // Fix missing commas between objects
      .replace(/}\s*{/g, '},{')
      // Fix unquoted string values (basic)
      .replace(/:\s*([^"\[\{\d\-][^,}\]]*[^\s,}\]])/g, ': "$1"')
      // Clean up double quotes
      .replace(/""/g, '"');
    
    return cleaned;
  }

  /**
   * Extract JSON from mixed text content
   */
  private extractJSONFromText(text: string): string | null {
    // Try to find JSON objects
    const jsonPatterns = [
      /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g,  // Simple nested objects
      /\{[\s\S]*\}/,                        // Any content between braces
      /\[[\s\S]*\]/                         // Arrays
    ];
    
    for (const pattern of jsonPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          try {
            JSON.parse(match);
            return match;
          } catch {
            // Try cleaning this match
            try {
              const cleaned = this.cleanJSONString(match);
              JSON.parse(cleaned);
              return cleaned;
            } catch {
              continue;
            }
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Parse structured text into objects
   */
  private parseTextStructure(text: string): any {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const result: any = {};
    const items: any[] = [];
    
    // Patterns for different structures
    const listPatterns = [
      /^[-*•]\s*(.+)$/,                    // - item, * item, • item
      /^\d+[\.)\s]\s*(.+)$/,              // 1. item, 1) item
      /^[a-zA-Z][\.)\s]\s*(.+)$/,         // a. item, a) item
    ];
    
    const keyValuePatterns = [
      /^([^:]+):\s*(.+)$/,                 // key: value
      /^([^=]+)=\s*(.+)$/,                 // key = value
      /^([^-]+)-\s*(.+)$/,                 // key - value
    ];
    
    let currentSection = '';
    
    for (const line of lines) {
      // Check for section headers
      if (line.match(/^#+\s*(.+)$/) || line.match(/^[A-Z][^:]*:?$/)) {
        currentSection = line.replace(/^#+\s*/, '').replace(/:$/, '').toLowerCase();
        continue;
      }
      
      // Check for list items
      let isListItem = false;
      for (const pattern of listPatterns) {
        const match = line.match(pattern);
        if (match && match[1].length > 2) {
          items.push({
            title: match[1].trim(),
            description: match[1].trim(),
            section: currentSection || 'items'
          });
          isListItem = true;
          break;
        }
      }
      
      if (isListItem) continue;
      
      // Check for key-value pairs
      for (const pattern of keyValuePatterns) {
        const match = line.match(pattern);
        if (match && match[1].trim() && match[2].trim()) {
          const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
          const value = match[2].trim();
          
          if (currentSection) {
            if (!result[currentSection]) result[currentSection] = {};
            result[currentSection][key] = value;
          } else {
            result[key] = value;
          }
          break;
        }
      }
    }
    
    // Add items if found
    if (items.length > 0) {
      result.items = items;
    }
    
    return Object.keys(result).length > 0 ? result : null;
  }

  /**
   * Extract key-value pairs from text
   */
  private extractKeyValuePairs(text: string): any {
    const result: any = {};
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    const patterns = [
      /([^:]+):\s*([^\n]+)/g,              // key: value
      /([^=]+)=\s*([^\n]+)/g,              // key = value
      /"([^"]+)"\s*[:-]\s*"([^"]+)"/g,    // "key": "value"
      /(\w+)\s*[:-]\s*([^,\n]+)/g,        // word: value
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const key = match[1].trim().toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
        const value = match[2].trim().replace(/["']/g, '');
        
        if (key && value && key.length > 1 && value.length > 1) {
          result[key] = value;
        }
      }
    }
    
    return Object.keys(result).length > 0 ? result : null;
  }

  /**
   * Validate parsed data against schema
   */
  private validateData(data: any, schema?: ValidationSchema): { isValid: boolean; errors: string[] } {
    if (!schema) {
      return { isValid: true, errors: [] };
    }
    
    const errors: string[] = [];
    
    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data) || data[field] === undefined || data[field] === null) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }
    
    // Check field types
    if (schema.types) {
      for (const [field, expectedType] of Object.entries(schema.types)) {
        if (field in data && data[field] !== undefined && data[field] !== null) {
          const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
          if (actualType !== expectedType) {
            errors.push(`Field ${field} should be ${expectedType}, got ${actualType}`);
          }
        }
      }
    }
    
    // Run custom validators
    if (schema.validators) {
      for (const [field, validator] of Object.entries(schema.validators)) {
        if (field in data && data[field] !== undefined && data[field] !== null) {
          try {
            if (!validator(data[field])) {
              errors.push(`Field ${field} failed validation`);
            }
          } catch (error) {
            errors.push(`Validator error for field ${field}: ${error}`);
          }
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create validation schema for common AI response formats
   */
  public static createSchema(type: 'subtasks' | 'analysis' | 'recommendations' | 'custom', customFields?: ValidationSchema): ValidationSchema {
    switch (type) {
      case 'subtasks':
        return {
          required: ['subtasks'],
          types: {
            subtasks: 'array'
          },
          validators: {
            subtasks: (value) => Array.isArray(value) && value.length > 0 && 
                                value.every(item => typeof item === 'object' && item.title)
          }
        };
      
      case 'analysis':
        return {
          required: ['analysis'],
          types: {
            analysis: 'object'
          }
        };
      
      case 'recommendations':
        return {
          required: ['recommendations'],
          types: {
            recommendations: 'array'
          },
          validators: {
            recommendations: (value) => Array.isArray(value) && value.length > 0
          }
        };
      
      case 'custom':
        return customFields || {};
      
      default:
        return {};
    }
  }
}

// Export singleton instance
export const aiResponseParser = AIResponseParser.getInstance();

// Export utility functions
export const parseAIResponse = <T = any>(response: string, options?: ParsingOptions): ParseResult<T> => {
  return aiResponseParser.parse<T>(response, options);
};

export const createValidationSchema = AIResponseParser.createSchema;

// Export types (avoiding conflicts)
export type {
  ParseResult as AIParseResult,
  ValidationSchema as AIValidationSchema,
  ParsingOptions as AIParsingOptions
};