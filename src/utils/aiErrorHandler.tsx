/**
 * aiErrorHandler.ts
 * AI Error Handler utility for categorized error management and user-friendly messages
 */

import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

// Error categories and types
export enum AIErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  API_ERROR = 'api_error',
  PARSING = 'parsing',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  QUOTA_EXCEEDED = 'quota_exceeded',
  MODEL_ERROR = 'model_error',
  UNKNOWN = 'unknown'
}

export interface AIError {
  category: AIErrorCategory;
  code?: string;
  message: string;
  originalError?: Error;
  statusCode?: number;
  retryable: boolean;
  retryAfter?: number; // seconds
  context?: Record<string, any>;
  timestamp: Date;
}

export interface ErrorHandlingOptions {
  showToast?: boolean;
  logError?: boolean;
  includeContext?: boolean;
  customMessage?: string;
  retryCallback?: () => void;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  retryableCategories: AIErrorCategory[];
}

/**
 * AI Error Handler Class
 * Provides comprehensive error categorization, handling, and user feedback
 */
export class AIErrorHandler {
  private static instance: AIErrorHandler;
  private errorHistory: AIError[] = [];
  private maxHistorySize = 100;
  
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableCategories: [
      AIErrorCategory.NETWORK,
      AIErrorCategory.RATE_LIMIT,
      AIErrorCategory.API_ERROR,
      AIErrorCategory.TIMEOUT
    ]
  };

  public static getInstance(): AIErrorHandler {
    if (!AIErrorHandler.instance) {
      AIErrorHandler.instance = new AIErrorHandler();
    }
    return AIErrorHandler.instance;
  }

  /**
   * Categorize and handle errors
   */
  public handleError(
    error: any,
    context?: Record<string, any>,
    options: ErrorHandlingOptions = {}
  ): AIError {
    const categorizedError = this.categorizeError(error, context);
    
    // Add to error history
    this.addToHistory(categorizedError);
    
    // Log error if requested
    if (options.logError !== false) {
      this.logError(categorizedError, options.includeContext);
    }
    
    // Show user notification if requested
    if (options.showToast !== false) {
      this.showErrorToast(categorizedError, options.customMessage, options.retryCallback);
    }
    
    return categorizedError;
  }

  /**
   * Categorize errors based on various indicators
   */
  public categorizeError(error: any, context?: Record<string, any>): AIError {
    const timestamp = new Date();
    const message = this.extractErrorMessage(error);
    const statusCode = this.extractStatusCode(error);
    
    // Network errors
    if (this.isNetworkError(error, message)) {
      return {
        category: AIErrorCategory.NETWORK,
        message: 'Erreur de connexion réseau',
        originalError: error,
        retryable: true,
        retryAfter: 5,
        context,
        timestamp
      };
    }
    
    // Authentication errors
    if (this.isAuthenticationError(error, statusCode, message)) {
      return {
        category: AIErrorCategory.AUTHENTICATION,
        message: 'Erreur d\'authentification API',
        originalError: error,
        statusCode,
        retryable: false,
        context,
        timestamp
      };
    }
    
    // Rate limiting
    if (this.isRateLimitError(error, statusCode, message)) {
      const retryAfter = this.extractRetryAfter(error) || 60;
      return {
        category: AIErrorCategory.RATE_LIMIT,
        message: 'Limite de taux atteinte',
        originalError: error,
        statusCode,
        retryable: true,
        retryAfter,
        context,
        timestamp
      };
    }
    
    // Quota exceeded
    if (this.isQuotaExceededError(error, statusCode, message)) {
      return {
        category: AIErrorCategory.QUOTA_EXCEEDED,
        message: 'Quota API dépassé',
        originalError: error,
        statusCode,
        retryable: false,
        context,
        timestamp
      };
    }
    
    // Timeout errors
    if (this.isTimeoutError(error, message)) {
      return {
        category: AIErrorCategory.TIMEOUT,
        message: 'Délai d\'attente dépassé',
        originalError: error,
        retryable: true,
        retryAfter: 10,
        context,
        timestamp
      };
    }
    
    // Model-specific errors
    if (this.isModelError(error, message)) {
      return {
        category: AIErrorCategory.MODEL_ERROR,
        message: 'Erreur du modèle IA',
        originalError: error,
        statusCode,
        retryable: false,
        context,
        timestamp
      };
    }
    
    // Parsing errors
    if (this.isParsingError(error, message)) {
      return {
        category: AIErrorCategory.PARSING,
        message: 'Erreur de format de réponse',
        originalError: error,
        retryable: false,
        context,
        timestamp
      };
    }
    
    // Validation errors
    if (this.isValidationError(error, message)) {
      return {
        category: AIErrorCategory.VALIDATION,
        message: 'Erreur de validation des données',
        originalError: error,
        retryable: false,
        context,
        timestamp
      };
    }
    
    // API errors (server-side)
    if (this.isAPIError(error, statusCode)) {
      return {
        category: AIErrorCategory.API_ERROR,
        message: 'Erreur du serveur API',
        originalError: error,
        statusCode,
        retryable: statusCode ? statusCode >= 500 : true,
        retryAfter: 30,
        context,
        timestamp
      };
    }
    
    // Unknown errors
    return {
      category: AIErrorCategory.UNKNOWN,
      message: message || 'Erreur inconnue',
      originalError: error,
      statusCode,
      retryable: true,
      context,
      timestamp
    };
  }

  /**
   * Get user-friendly error message
   */
  public getUserFriendlyMessage(error: AIError): string {
    const baseMessages = {
      [AIErrorCategory.NETWORK]: 'Problème de connexion. Vérifiez votre connexion internet.',
      [AIErrorCategory.AUTHENTICATION]: 'Erreur d\'authentification. Vérifiez votre configuration API.',
      [AIErrorCategory.RATE_LIMIT]: `Trop de requêtes. Veuillez patienter ${error.retryAfter || 60} secondes.`,
      [AIErrorCategory.API_ERROR]: 'Erreur du service IA. Veuillez réessayer plus tard.',
      [AIErrorCategory.PARSING]: 'Format de réponse invalide. Utilisation des données de secours.',
      [AIErrorCategory.VALIDATION]: 'Réponse invalide reçue. Tentative de récupération...',
      [AIErrorCategory.TIMEOUT]: 'Délai d\'attente dépassé. Veuillez réessayer.',
      [AIErrorCategory.QUOTA_EXCEEDED]: 'Quota API dépassé. Contactez votre administrateur.',
      [AIErrorCategory.MODEL_ERROR]: 'Erreur du modèle IA. Essayez un autre modèle.',
      [AIErrorCategory.UNKNOWN]: 'Une erreur inattendue s\'est produite.'
    };
    
    return baseMessages[error.category] || error.message;
  }

  /**
   * Determine if error is retryable
   */
  public isRetryable(error: AIError, config?: Partial<RetryConfig>): boolean {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    return error.retryable && retryConfig.retryableCategories.includes(error.category);
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  public calculateRetryDelay(attempt: number, error: AIError, config?: Partial<RetryConfig>): number {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    
    // Use error-specific retry delay if available
    if (error.retryAfter) {
      return error.retryAfter * 1000;
    }
    
    // Exponential backoff
    const delay = retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, retryConfig.maxDelay);
  }

  /**
   * Execute retry logic with proper error handling
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    config?: Partial<RetryConfig>,
    onRetry?: (attempt: number, error: AIError) => void
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: AIError;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = this.categorizeError(error, { attempt });
        
        // Don't retry if not retryable or max attempts reached
        if (!this.isRetryable(lastError, retryConfig) || attempt === retryConfig.maxRetries) {
          throw lastError;
        }
        
        // Calculate delay and wait
        const delay = this.calculateRetryDelay(attempt, lastError, retryConfig);
        console.log(`🔄 [AIErrorHandler] Retrying in ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxRetries + 1})`);
        
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Get error statistics
   */
  public getErrorStats(timeWindow?: number): Record<AIErrorCategory, number> {
    const cutoff = timeWindow ? new Date(Date.now() - timeWindow) : new Date(0);
    const recentErrors = this.errorHistory.filter(error => error.timestamp >= cutoff);
    
    const stats: Record<AIErrorCategory, number> = {
      [AIErrorCategory.NETWORK]: 0,
      [AIErrorCategory.AUTHENTICATION]: 0,
      [AIErrorCategory.RATE_LIMIT]: 0,
      [AIErrorCategory.API_ERROR]: 0,
      [AIErrorCategory.PARSING]: 0,
      [AIErrorCategory.VALIDATION]: 0,
      [AIErrorCategory.TIMEOUT]: 0,
      [AIErrorCategory.QUOTA_EXCEEDED]: 0,
      [AIErrorCategory.MODEL_ERROR]: 0,
      [AIErrorCategory.UNKNOWN]: 0
    };
    
    recentErrors.forEach(error => {
      stats[error.category]++;
    });
    
    return stats;
  }

  // Private helper methods
  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    if (error?.data?.error?.message) return error.data.error.message;
    return error?.toString() || 'Unknown error';
  }

  private extractStatusCode(error: any): number | undefined {
    return error?.status || error?.statusCode || error?.response?.status;
  }

  private extractRetryAfter(error: any): number | undefined {
    const retryAfter = error?.headers?.['retry-after'] || error?.response?.headers?.['retry-after'];
    return retryAfter ? parseInt(retryAfter, 10) : undefined;
  }

  private isNetworkError(error: any, message: string): boolean {
    return (
      error?.name === 'TypeError' ||
      error?.name === 'NetworkError' ||
      message.toLowerCase().includes('network') ||
      message.toLowerCase().includes('fetch') ||
      message.toLowerCase().includes('connection')
    );
  }

  private isAuthenticationError(error: any, statusCode?: number, message?: string): boolean {
    return (
      statusCode === 401 ||
      statusCode === 403 ||
      message?.toLowerCase().includes('unauthorized') ||
      message?.toLowerCase().includes('forbidden') ||
      message?.toLowerCase().includes('api key')
    );
  }

  private isRateLimitError(error: any, statusCode?: number, message?: string): boolean {
    return (
      statusCode === 429 ||
      message?.toLowerCase().includes('rate limit') ||
      message?.toLowerCase().includes('too many requests')
    );
  }

  private isQuotaExceededError(error: any, statusCode?: number, message?: string): boolean {
    return (
      statusCode === 402 ||
      message?.toLowerCase().includes('quota') ||
      message?.toLowerCase().includes('billing') ||
      message?.toLowerCase().includes('exceeded')
    );
  }

  private isTimeoutError(error: any, message: string): boolean {
    return (
      error?.name === 'TimeoutError' ||
      message.toLowerCase().includes('timeout') ||
      message.toLowerCase().includes('timed out')
    );
  }

  private isModelError(error: any, message: string): boolean {
    return (
      message.toLowerCase().includes('model') ||
      message.toLowerCase().includes('invalid request') ||
      message.toLowerCase().includes('content policy')
    );
  }

  private isParsingError(error: any, message: string): boolean {
    return (
      message.toLowerCase().includes('json') ||
      message.toLowerCase().includes('parse') ||
      message.toLowerCase().includes('format')
    );
  }

  private isValidationError(error: any, message: string): boolean {
    return (
      message.toLowerCase().includes('validation') ||
      message.toLowerCase().includes('invalid') ||
      message.toLowerCase().includes('required')
    );
  }

  private isAPIError(error: any, statusCode?: number): boolean {
    return statusCode !== undefined && statusCode >= 400;
  }

  private addToHistory(error: AIError): void {
    this.errorHistory.push(error);
    
    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
  }

  private logError(error: AIError, includeContext?: boolean): void {
    const logData = {
      category: error.category,
      message: error.message,
      statusCode: error.statusCode,
      retryable: error.retryable,
      timestamp: error.timestamp.toISOString()
    };
    
    if (includeContext && error.context) {
      (logData as any).context = error.context;
    }
    
    console.error('🚨 [AIErrorHandler] Error occurred:', logData);
    
    if (error.originalError) {
      console.error('🔍 [AIErrorHandler] Original error:', error.originalError);
    }
  }

  private showErrorToast(error: AIError, customMessage?: string, retryCallback?: () => void): void {
    const message = customMessage || this.getUserFriendlyMessage(error);
    const title = this.getErrorTitle(error.category);
    
    toast({
      title,
      description: message,
      variant: "destructive",
      action: retryCallback && error.retryable ? (
        <ToastAction onClick={retryCallback}>
          Réessayer
        </ToastAction>
      ) : undefined
    });
  }

  private getErrorTitle(category: AIErrorCategory): string {
    const titles = {
      [AIErrorCategory.NETWORK]: 'Erreur de connexion',
      [AIErrorCategory.AUTHENTICATION]: 'Erreur d\'authentification',
      [AIErrorCategory.RATE_LIMIT]: 'Limite atteinte',
      [AIErrorCategory.API_ERROR]: 'Erreur du service',
      [AIErrorCategory.PARSING]: 'Erreur de format',
      [AIErrorCategory.VALIDATION]: 'Erreur de validation',
      [AIErrorCategory.TIMEOUT]: 'Délai dépassé',
      [AIErrorCategory.QUOTA_EXCEEDED]: 'Quota dépassé',
      [AIErrorCategory.MODEL_ERROR]: 'Erreur du modèle',
      [AIErrorCategory.UNKNOWN]: 'Erreur inconnue'
    };
    
    return titles[category] || 'Erreur';
  }

  /**
   * Clear error history
   */
  public clearHistory(): void {
    this.errorHistory = [];
    console.log('🧹 [AIErrorHandler] Error history cleared');
  }
}

// Export singleton instance
export const aiErrorHandler = AIErrorHandler.getInstance();

// Export utility functions
export const handleAIError = (
  error: any,
  context?: Record<string, any>,
  options?: ErrorHandlingOptions
): AIError => {
  return aiErrorHandler.handleError(error, context, options);
};

export const executeWithRetry = aiErrorHandler.executeWithRetry.bind(aiErrorHandler);

export const getErrorStats = aiErrorHandler.getErrorStats.bind(aiErrorHandler);

// Export types (avoiding conflicts)
export type {
  AIError as AIErrorType,
  ErrorHandlingOptions as AIErrorHandlingOptions,
  RetryConfig as AIRetryConfig
};