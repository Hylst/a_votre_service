/**
 * useAIApiManager.ts
 * Reusable AI API Manager hook providing robust communication, parsing, and error handling for AI tools
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types for AI API communication
export interface AIProvider {
  id: string;
  provider: string;
  api_key: string;
  is_default: boolean;
  selected_model: string | null;
}

export interface AIRequest {
  prompt: string;
  systemMessage?: string;
  maxTokens?: number;
  temperature?: number;
  retries?: number;
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rawResponse?: string;
  recoveryMethod?: string;
  retryCount?: number;
}

export interface ParseOptions {
  expectedFields?: string[];
  fallbackGenerator?: (rawResponse: string) => any;
  validator?: (data: any) => boolean;
}

// Error categories for better error handling
export enum AIErrorType {
  NETWORK_ERROR = 'network_error',
  API_ERROR = 'api_error',
  PARSING_ERROR = 'parsing_error',
  VALIDATION_ERROR = 'validation_error',
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  UNKNOWN = 'unknown'
}

export interface AIError {
  type: AIErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  retryable: boolean;
}

/**
 * Reusable AI API Manager Hook
 * Provides robust communication with various AI providers with error handling and retry logic
 */
export const useAIApiManager = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestCache, setRequestCache] = useState<Map<string, any>>(new Map());
  const [isConfigured, setIsConfigured] = useState(true); // Assume configured for now

  /**
   * Categorize errors for better handling
   */
  const categorizeError = (error: any, statusCode?: number): AIError => {
    const message = error?.message || error?.toString() || 'Unknown error';
    
    // Network errors
    if (error?.name === 'TypeError' && message.includes('fetch')) {
      return {
        type: AIErrorType.NETWORK_ERROR,
        message: 'Erreur de connexion réseau. Vérifiez votre connexion internet.',
        originalError: error,
        retryable: true
      };
    }

    // API errors based on status codes
    if (statusCode) {
      if (statusCode === 401 || statusCode === 403) {
        return {
          type: AIErrorType.AUTHENTICATION,
          message: 'Erreur d\'authentification. Vérifiez votre clé API.',
          statusCode,
          retryable: false
        };
      }
      
      if (statusCode === 429) {
        return {
          type: AIErrorType.RATE_LIMIT,
          message: 'Limite de taux atteinte. Veuillez patienter avant de réessayer.',
          statusCode,
          retryable: true
        };
      }
      
      if (statusCode >= 500) {
        return {
          type: AIErrorType.API_ERROR,
          message: 'Erreur du serveur API. Veuillez réessayer plus tard.',
          statusCode,
          retryable: true
        };
      }
    }

    // Parsing errors
    if (message.includes('JSON') || message.includes('parse')) {
      return {
        type: AIErrorType.PARSING_ERROR,
        message: 'Erreur de format de réponse. Tentative de récupération...',
        originalError: error,
        retryable: false
      };
    }

    return {
      type: AIErrorType.UNKNOWN,
      message: `Erreur inconnue: ${message}`,
      originalError: error,
      retryable: true
    };
  };

  /**
   * Advanced JSON parsing with multiple recovery strategies
   */
  const parseAIResponse = <T = any>(rawResponse: string, options: ParseOptions = {}): AIResponse<T> => {
    console.log('🔍 [AIApiManager] Starting advanced JSON parsing');
    console.log('📝 [AIApiManager] Raw response preview:', rawResponse.substring(0, 200) + '...');

    const { expectedFields = [], fallbackGenerator, validator } = options;

    // Strategy 1: Direct JSON parsing
    try {
      const parsed = JSON.parse(rawResponse);
      if (!validator || validator(parsed)) {
        console.log('✅ [AIApiManager] Direct JSON parsing successful');
        return {
          success: true,
          data: parsed,
          rawResponse,
          recoveryMethod: 'direct'
        };
      }
    } catch (error) {
      console.log('⚠️ [AIApiManager] Direct parsing failed, trying cleanup...');
    }

    // Strategy 2: Clean and parse
    try {
      let cleaned = rawResponse.trim();
      
      // Remove markdown code blocks
      cleaned = cleaned.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '');
      
      // Extract JSON from mixed content
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      
      // Remove control characters
      cleaned = cleaned.replace(/[\u0000-\u001f\u007f-\u009f]/g, '');
      
      // Fix common JSON issues
      cleaned = repairCommonJSONIssues(cleaned);
      
      const parsed = JSON.parse(cleaned);
      if (!validator || validator(parsed)) {
        console.log('✅ [AIApiManager] Cleaned JSON parsing successful');
        return {
          success: true,
          data: parsed,
          rawResponse,
          recoveryMethod: 'cleaned'
        };
      }
    } catch (error) {
      console.log('⚠️ [AIApiManager] Cleaned parsing failed, trying pattern extraction...');
    }

    // Strategy 3: Pattern-based extraction
    try {
      const extracted = extractByPatterns(rawResponse, expectedFields);
      if (extracted && (!validator || validator(extracted))) {
        console.log('✅ [AIApiManager] Pattern extraction successful');
        return {
          success: true,
          data: extracted,
          rawResponse,
          recoveryMethod: 'pattern-extraction'
        };
      }
    } catch (error) {
      console.log('⚠️ [AIApiManager] Pattern extraction failed, trying structured text parsing...');
    }

    // Strategy 4: Structured text parsing
    try {
      const structured = parseStructuredText(rawResponse);
      if (structured && (!validator || validator(structured))) {
        console.log('✅ [AIApiManager] Structured text parsing successful');
        return {
          success: true,
          data: structured,
          rawResponse,
          recoveryMethod: 'structured-text'
        };
      }
    } catch (error) {
      console.log('⚠️ [AIApiManager] Structured text parsing failed');
    }

    // Strategy 5: Fallback generation
    if (fallbackGenerator) {
      try {
        const fallback = fallbackGenerator(rawResponse);
        console.log('✅ [AIApiManager] Fallback generation successful');
        return {
          success: true,
          data: fallback,
          rawResponse,
          recoveryMethod: 'fallback-generation'
        };
      } catch (error) {
        console.log('⚠️ [AIApiManager] Fallback generation failed');
      }
    }

    // All strategies failed
    return {
      success: false,
      error: 'Impossible d\'analyser la réponse de l\'IA: Format de réponse invalide - aucun JSON trouvé',
      rawResponse
    };
  };

  /**
   * Repair common JSON formatting issues
   */
  const repairCommonJSONIssues = (text: string): string => {
    return text
      // Fix unquoted keys
      .replace(/(\w+)\s*:/g, '"$1":')
      // Fix single quotes
      .replace(/'/g, '"')
      // Fix trailing commas
      .replace(/,\s*([}\]])/g, '$1')
      // Fix missing commas between objects
      .replace(/}\s*{/g, '},{')
      // Fix unquoted string values
      .replace(/:\s*([^"\[\{\d][^,}\]]*)/g, ': "$1"')
      // Clean up extra quotes
      .replace(/""/g, '"');
  };

  /**
   * Extract data using regex patterns
   */
  const extractByPatterns = (text: string, expectedFields: string[]): any => {
    const result: any = {};
    
    // Common patterns for different field types
    const patterns = {
      string: /"(\w+)"\s*:\s*"([^"]*)"/g,
      number: /"(\w+)"\s*:\s*(\d+)/g,
      array: /"(\w+)"\s*:\s*\[([^\]]*)\]/g
    };

    // Extract string fields
    let match;
    while ((match = patterns.string.exec(text)) !== null) {
      result[match[1]] = match[2];
    }

    // Extract number fields
    while ((match = patterns.number.exec(text)) !== null) {
      result[match[1]] = parseInt(match[2]);
    }

    // Extract array fields (basic)
    while ((match = patterns.array.exec(text)) !== null) {
      try {
        result[match[1]] = JSON.parse(`[${match[2]}]`);
      } catch {
        result[match[1]] = match[2].split(',').map(item => item.trim().replace(/"/g, ''));
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  };

  /**
   * Parse structured text (lists, bullet points, etc.)
   */
  const parseStructuredText = (text: string): any => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const items: any[] = [];
    
    const listPatterns = [
      /^[-*•]\s*(.+)$/,           // - item, * item, • item
      /^\d+[\.)\s]\s*(.+)$/,     // 1. item, 1) item
      /^[a-zA-Z][\.)\s]\s*(.+)$/, // a. item, a) item
    ];

    for (const line of lines) {
      for (const pattern of listPatterns) {
        const match = line.match(pattern);
        if (match && match[1].length > 3) {
          items.push({
            title: match[1],
            description: match[1]
          });
          break;
        }
      }
    }

    return items.length > 0 ? { items } : null;
  };

  /**
   * Make API call with retry logic and error handling
   */
  const makeAPICall = useCallback(async <T = any>(
    provider: AIProvider,
    request: AIRequest,
    parseOptions?: ParseOptions
  ): Promise<AIResponse<T>> => {
    const { prompt, systemMessage, maxTokens = 1000, temperature = 0.7, retries = 2 } = request;
    
    // Check cache first
    const cacheKey = `${provider.provider}-${JSON.stringify({ prompt, systemMessage, maxTokens, temperature })}`;
    if (requestCache.has(cacheKey)) {
      console.log('📦 [AIApiManager] Returning cached response');
      return requestCache.get(cacheKey);
    }

    setIsLoading(true);
    let lastError: AIError | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🚀 [AIApiManager] Attempt ${attempt + 1}/${retries + 1} for ${provider.provider}`);
        
        const rawResponse = await callProviderAPI(provider, {
          prompt,
          systemMessage,
          maxTokens,
          temperature
        });

        // Parse the response
        const parseResult = parseAIResponse<T>(rawResponse, parseOptions);
        
        if (parseResult?.success) {
          // Cache successful results
          const result = {
            ...parseResult,
            retryCount: attempt
          };
          requestCache.set(cacheKey, result);
          
          // Clean old cache entries (keep last 50)
          if (requestCache.size > 50) {
            const firstKey = requestCache.keys().next().value;
            requestCache.delete(firstKey);
          }
          
          return result;
        } else {
          lastError = {
            type: AIErrorType.PARSING_ERROR,
            message: parseResult?.error || 'Parsing failed',
            retryable: false
          };
        }
        
      } catch (error: any) {
        lastError = categorizeError(error, error?.status || error?.statusCode);
        console.error(`❌ [AIApiManager] Attempt ${attempt + 1} failed:`, lastError);
        
        // Don't retry non-retryable errors
        if (!lastError?.retryable) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
          console.log(`⏳ [AIApiManager] Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    setIsLoading(false);
    
    // Show user-friendly error message
    const errorMessage = getUserFriendlyErrorMessage(lastError!);
    toast?.({
      title: "Erreur de communication IA",
      description: errorMessage,
      variant: "destructive"
    });

    return {
      success: false,
      error: errorMessage,
      retryCount: retries
    };
  }, [requestCache, toast]);

  /**
   * Get user-friendly error messages
   */
  const getUserFriendlyErrorMessage = (error: AIError): string => {
    switch (error.type) {
      case AIErrorType.NETWORK_ERROR:
        return "Problème de connexion. Vérifiez votre connexion internet et réessayez.";
      case AIErrorType.AUTHENTICATION:
        return "Erreur d'authentification. Vérifiez votre configuration API.";
      case AIErrorType.RATE_LIMIT:
        return "Trop de requêtes. Veuillez patienter quelques instants.";
      case AIErrorType.API_ERROR:
        return "Erreur du service IA. Veuillez réessayer plus tard.";
      case AIErrorType.PARSING_ERROR:
        return "Format de réponse invalide. Utilisation des données de secours.";
      case AIErrorType.VALIDATION_ERROR:
        return "Réponse invalide reçue. Tentative de récupération...";
      default:
        return error.message || "Une erreur inattendue s'est produite.";
    }
  };

  /**
   * Call specific provider API
   */
  const callProviderAPI = async (provider: AIProvider, request: Omit<AIRequest, 'retries'>): Promise<string> => {
    const { prompt, systemMessage, maxTokens, temperature } = request;
    
    switch (provider.provider) {
      case 'openai':
        return callOpenAI(provider, prompt, systemMessage, maxTokens, temperature);
      case 'anthropic':
        return callAnthropic(provider, prompt, systemMessage, maxTokens, temperature);
      case 'google':
        return callGoogle(provider, prompt, systemMessage, maxTokens, temperature);
      case 'openrouter':
        return callOpenRouter(provider, prompt, systemMessage, maxTokens, temperature);
      default:
        throw new Error(`Provider ${provider.provider} not supported`);
    }
  };

  /**
   * OpenAI API implementation
   */
  const callOpenAI = async (
    provider: AIProvider,
    prompt: string,
    systemMessage?: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<string> => {
    const messages = [];
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.selected_model || 'gpt-4o',
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      const error = new Error(errorData?.error?.message || `HTTP ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || '';
  };

  /**
   * Anthropic API implementation
   */
  const callAnthropic = async (
    provider: AIProvider,
    prompt: string,
    systemMessage?: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<string> => {
    const fullPrompt = systemMessage ? `${systemMessage}\n\n${prompt}` : prompt;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': provider.api_key,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: provider.selected_model || 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: fullPrompt }],
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      const error = new Error(errorData?.error?.message || `HTTP ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();
    return data?.content?.[0]?.text || '';
  };

  /**
   * Google/Gemini API implementation
   */
  const callGoogle = async (
    provider: AIProvider,
    prompt: string,
    systemMessage?: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<string> => {
    const fullPrompt = systemMessage ? `${systemMessage}\n\n${prompt}` : prompt;
    const model = provider.selected_model || 'gemini-2.0-flash-exp';

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${provider.api_key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
          topP: 0.8,
          topK: 40
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      const error = new Error(errorData.error?.message || `HTTP ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  };

  /**
   * OpenRouter API implementation
   */
  const callOpenRouter = async (
    provider: AIProvider,
    prompt: string,
    systemMessage?: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<string> => {
    const messages = [];
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.api_key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
      },
      body: JSON.stringify({
        model: provider.selected_model || 'deepseek/deepseek-r1',
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      const error = new Error(errorData.error?.message || `HTTP ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || '';
  };

  /**
   * Clear request cache
   */
  const clearCache = useCallback(() => {
    setRequestCache(new Map());
    console.log('🧹 [AIApiManager] Cache cleared');
  }, []);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Main AI call function that wraps makeAPICall
   */
  const callAI = useCallback(async (request: AIRequest, parseOptions?: ParseOptions) => {
    // For now, use a default provider - this should be improved to get from config
    const defaultProvider: AIProvider = {
      id: 'default',
      provider: 'google',
      api_key: process.env.REACT_APP_GOOGLE_API_KEY || '',
      is_default: true,
      selected_model: 'gemini-2.0-flash-exp'
    };
    
    setError(null);
    const result = await makeAPICall(defaultProvider, request, parseOptions);
    
    if (!result.success && result.error) {
      setError(result.error);
    }
    
    return result;
  }, [makeAPICall]);

  return {
    isConfigured,
    callAI,
    makeAPICall,
    parseAIResponse,
    categorizeError,
    isLoading,
    error,
    clearError,
    clearCache
  };
};