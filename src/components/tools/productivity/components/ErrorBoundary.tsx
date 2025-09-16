/**
 * ErrorBoundary.tsx - Composant de gestion d'erreurs pour les outils de productivité
 * Capture et gère les erreurs React avec interface de récupération et reporting
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, Send } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableReporting?: boolean;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  isReporting: boolean;
  reportSent: boolean;
}

interface ErrorReport {
  id: string;
  timestamp: Date;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo: {
    componentStack: string;
  };
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  additionalInfo?: Record<string, any>;
}

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      isReporting: false,
      reportSent: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Mise à jour de l'état pour afficher l'interface d'erreur
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log de l'erreur
    console.error('ErrorBoundary a capturé une erreur:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Callback personnalisé
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Sauvegarde locale de l'erreur
    this.saveErrorLocally(error, errorInfo);

    // Reporting automatique si activé
    if (this.props.enableReporting) {
      this.reportError(error, errorInfo);
    }
  }

  private saveErrorLocally = (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorLog = {
        id: this.state.errorId,
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      const existingLogs = JSON.parse(localStorage.getItem('productivity-error-logs') || '[]');
      existingLogs.push(errorLog);
      
      // Garder seulement les 50 dernières erreurs
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('productivity-error-logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Impossible de sauvegarder l\'erreur localement:', e);
    }
  };

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    if (this.state.isReporting || this.state.reportSent) return;

    this.setState({ isReporting: true });

    try {
      const report: ErrorReport = {
        id: this.state.errorId!,
        timestamp: new Date(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSessionId(),
        additionalInfo: {
          retryCount: this.retryCount,
          timestamp: Date.now()
        }
      };

      // En production, envoyer à un service de monitoring
      // await this.sendErrorReport(report);
      
      // Pour le développement, log dans la console
      console.log('Rapport d\'erreur:', report);
      
      this.setState({ reportSent: true });
    } catch (reportError) {
      console.error('Erreur lors du reporting:', reportError);
    } finally {
      this.setState({ isReporting: false });
    }
  };

  private getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('productivity-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('productivity-session-id', sessionId);
    }
    return sessionId;
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        reportSent: false
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportManually = () => {
    if (this.state.error && this.state.errorInfo) {
      this.reportError(this.state.error, this.state.errorInfo);
    }
  };

  private renderErrorDetails = () => {
    if (!this.props.showDetails || !this.state.error) return null;

    return (
      <details className="mt-4 p-4 bg-secondary rounded-lg">
        <summary className="cursor-pointer font-medium text-sm mb-2">
          Détails techniques
        </summary>
        <div className="space-y-2 text-xs font-mono">
          <div>
            <strong>Erreur:</strong> {this.state.error.name}
          </div>
          <div>
            <strong>Message:</strong> {this.state.error.message}
          </div>
          <div>
            <strong>ID:</strong> {this.state.errorId}
          </div>
          {this.state.error.stack && (
            <div>
              <strong>Stack trace:</strong>
              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                {this.state.error.stack}
              </pre>
            </div>
          )}
          {this.state.errorInfo && (
            <div>
              <strong>Component stack:</strong>
              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      </details>
    );
  };

  render() {
    if (this.state.hasError) {
      // Interface d'erreur personnalisée ou fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.retryCount < this.maxRetries;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card text-card-foreground rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Oups ! Une erreur s'est produite
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quelque chose ne s'est pas passé comme prévu
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                {this.state.error?.message || 'Une erreur inattendue s\'est produite.'}
              </p>
              
              {this.state.errorId && (
                <p className="text-xs text-muted-foreground">
                  ID d'erreur: <code className="bg-muted px-1 rounded">{this.state.errorId}</code>
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <div className="flex space-x-3">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Réessayer</span>
                  </button>
                )}
                
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Recharger</span>
                </button>
              </div>

              {this.props.enableReporting && !this.state.reportSent && (
                <button
                  onClick={this.handleReportManually}
                  disabled={this.state.isReporting}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  {this.state.isReporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Signaler l'erreur</span>
                    </>
                  )}
                </button>
              )}

              {this.state.reportSent && (
                <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-md">
                  <Bug className="h-4 w-4" />
                  <span className="text-sm">Erreur signalée avec succès</span>
                </div>
              )}

              {!canRetry && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Nombre maximum de tentatives atteint ({this.maxRetries})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Veuillez recharger la page ou contacter le support
                  </p>
                </div>
              )}
            </div>

            {this.renderErrorDetails()}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Hook pour utiliser l'ErrorBoundary de manière programmatique
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`Erreur dans ${context || 'composant'}:`, error);
    
    // En production, envoyer à un service de monitoring
    // reportError(error, context);
  };

  const handleAsyncError = (asyncFn: () => Promise<any>, context?: string) => {
    return async (...args: any[]) => {
      try {
        return await asyncFn.apply(null, args);
      } catch (error) {
        handleError(error as Error, context);
        throw error;
      }
    };
  };

  return {
    handleError,
    handleAsyncError
  };
};

// Composant wrapper pour les erreurs spécifiques aux outils de productivité
export const ProductivityErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log spécifique aux outils de productivité
    console.error('Erreur dans les outils de productivité:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <ErrorBoundary
      onError={handleError}
      enableReporting={true}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
};