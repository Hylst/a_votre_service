/**
 * usePerformanceMonitoring.ts - Hook pour le monitoring des performances
 * Surveille les performances, métriques vitales et optimisations automatiques
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Métriques personnalisées
  renderTime?: number;
  interactionTime?: number;
  memoryUsage?: number;
  taskCount?: number;
  
  // Métriques de navigation
  navigationStart?: number;
  domContentLoaded?: number;
  loadComplete?: number;
}

interface PerformanceEntry {
  id: string;
  timestamp: Date;
  metrics: PerformanceMetrics;
  context: {
    component?: string;
    action?: string;
    userAgent: string;
    viewport: { width: number; height: number };
    connection?: string;
  };
  warnings: string[];
  suggestions: string[];
}

interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  renderTime: { good: number; needsImprovement: number };
  memoryUsage: { good: number; needsImprovement: number };
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  renderTime: { good: 16, needsImprovement: 50 },
  memoryUsage: { good: 50, needsImprovement: 100 }
};

export const usePerformanceMonitoring = (options: {
  enableAutoReporting?: boolean;
  sampleRate?: number;
  thresholds?: Partial<PerformanceThresholds>;
  component?: string;
} = {}) => {
  const {
    enableAutoReporting = true,
    sampleRate = 0.1, // 10% des sessions
    thresholds = {},
    component
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [performanceEntries, setPerformanceEntries] = useState<PerformanceEntry[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number>(0);
  
  const observerRef = useRef<PerformanceObserver | null>(null);
  const renderStartTime = useRef<number>(0);
  const interactionStartTime = useRef<number>(0);
  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  // Démarrer le monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring || Math.random() > sampleRate) return;
    
    setIsMonitoring(true);
    renderStartTime.current = performance.now();

    // Observer pour les Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            }
            
            if (entry.entryType === 'first-input') {
              const fidEntry = entry as any;
              setMetrics(prev => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }));
            }
            
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              setMetrics(prev => ({ 
                ...prev, 
                cls: (prev.cls || 0) + (entry as any).value 
              }));
            }
            
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
              }
            }
            
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              setMetrics(prev => ({
                ...prev,
                ttfb: navEntry.responseStart - navEntry.requestStart,
                navigationStart: navEntry.navigationStart,
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
                loadComplete: navEntry.loadEventEnd - navEntry.navigationStart
              }));
            }
          });
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint', 'navigation'] });
        observerRef.current = observer;
      } catch (error) {
        console.warn('PerformanceObserver non supporté:', error);
      }
    }

    // Monitoring de la mémoire
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryInfo.usedJSHeapSize / 1024 / 1024 // MB
      }));
    }
  }, [isMonitoring, sampleRate]);

  // Arrêter le monitoring
  const stopMonitoring = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Mesurer le temps de rendu
  const measureRenderTime = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
      renderStartTime.current = 0;
      return renderTime;
    }
    return 0;
  }, []);

  // Mesurer le temps d'interaction
  const startInteractionMeasure = useCallback(() => {
    interactionStartTime.current = performance.now();
  }, []);

  const endInteractionMeasure = useCallback(() => {
    if (interactionStartTime.current > 0) {
      const interactionTime = performance.now() - interactionStartTime.current;
      setMetrics(prev => ({ ...prev, interactionTime }));
      interactionStartTime.current = 0;
      return interactionTime;
    }
    return 0;
  }, []);

  // Calculer le score de performance
  const calculatePerformanceScore = useCallback((metrics: PerformanceMetrics): number => {
    let score = 100;
    let factors = 0;

    // LCP Score (25%)
    if (metrics.lcp !== undefined) {
      factors++;
      if (metrics.lcp > finalThresholds.lcp.needsImprovement) {
        score -= 25;
      } else if (metrics.lcp > finalThresholds.lcp.good) {
        score -= 10;
      }
    }

    // FID Score (25%)
    if (metrics.fid !== undefined) {
      factors++;
      if (metrics.fid > finalThresholds.fid.needsImprovement) {
        score -= 25;
      } else if (metrics.fid > finalThresholds.fid.good) {
        score -= 10;
      }
    }

    // CLS Score (25%)
    if (metrics.cls !== undefined) {
      factors++;
      if (metrics.cls > finalThresholds.cls.needsImprovement) {
        score -= 25;
      } else if (metrics.cls > finalThresholds.cls.good) {
        score -= 10;
      }
    }

    // Render Time Score (25%)
    if (metrics.renderTime !== undefined) {
      factors++;
      if (metrics.renderTime > finalThresholds.renderTime.needsImprovement) {
        score -= 25;
      } else if (metrics.renderTime > finalThresholds.renderTime.good) {
        score -= 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  }, [finalThresholds]);

  // Générer des avertissements et suggestions
  const generateInsights = useCallback((metrics: PerformanceMetrics) => {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (metrics.lcp && metrics.lcp > finalThresholds.lcp.needsImprovement) {
      warnings.push('LCP trop élevé (> 4s)');
      suggestions.push('Optimiser les images et réduire le temps de chargement des ressources critiques');
    }

    if (metrics.fid && metrics.fid > finalThresholds.fid.needsImprovement) {
      warnings.push('FID trop élevé (> 300ms)');
      suggestions.push('Réduire le JavaScript bloquant et optimiser les gestionnaires d\'événements');
    }

    if (metrics.cls && metrics.cls > finalThresholds.cls.needsImprovement) {
      warnings.push('CLS trop élevé (> 0.25)');
      suggestions.push('Définir des dimensions pour les images et éviter l\'insertion dynamique de contenu');
    }

    if (metrics.renderTime && metrics.renderTime > finalThresholds.renderTime.needsImprovement) {
      warnings.push('Temps de rendu trop élevé (> 50ms)');
      suggestions.push('Optimiser les composants React et utiliser la mémorisation');
    }

    if (metrics.memoryUsage && metrics.memoryUsage > finalThresholds.memoryUsage.needsImprovement) {
      warnings.push('Utilisation mémoire élevée (> 100MB)');
      suggestions.push('Vérifier les fuites mémoire et optimiser la gestion des données');
    }

    return { warnings, suggestions };
  }, [finalThresholds]);

  // Créer une entrée de performance
  const createPerformanceEntry = useCallback(() => {
    const { warnings, suggestions } = generateInsights(metrics);
    const score = calculatePerformanceScore(metrics);
    
    const entry: PerformanceEntry = {
      id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      metrics: { ...metrics },
      context: {
        component,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: (navigator as any).connection?.effectiveType
      },
      warnings,
      suggestions
    };

    setPerformanceEntries(prev => [entry, ...prev.slice(0, 49)]); // Garder 50 entrées max
    setPerformanceScore(score);
    
    return entry;
  }, [metrics, generateInsights, calculatePerformanceScore, component]);

  // Reporting automatique
  const reportPerformance = useCallback(async (entry: PerformanceEntry) => {
    if (!enableAutoReporting) return;

    try {
      // En production, envoyer à un service d'analytics
      console.log('Performance Report:', entry);
      
      // Sauvegarder localement
      const existingReports = JSON.parse(localStorage.getItem('performance-reports') || '[]');
      existingReports.push(entry);
      
      // Garder seulement les 100 derniers rapports
      if (existingReports.length > 100) {
        existingReports.splice(0, existingReports.length - 100);
      }
      
      localStorage.setItem('performance-reports', JSON.stringify(existingReports));
    } catch (error) {
      console.error('Erreur lors du reporting de performance:', error);
    }
  }, [enableAutoReporting]);

  // Obtenir les métriques de performance du navigateur
  const getBrowserMetrics = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      navigation: navigation ? {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        ttfb: navigation.responseStart - navigation.requestStart
      } : null,
      paint: paint.reduce((acc, entry) => {
        acc[entry.name.replace('-', '')] = entry.startTime;
        return acc;
      }, {} as Record<string, number>)
    };
  }, []);

  // Mesurer une fonction
  const measureFunction = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    name: string
  ): T => {
    return ((...args: any[]) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      console.log(`${name} took ${end - start} milliseconds`);
      
      return result;
    }) as T;
  }, []);

  // Mesurer une fonction async
  const measureAsyncFunction = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name: string
  ): T => {
    return (async (...args: any[]) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      
      console.log(`${name} took ${end - start} milliseconds`);
      
      return result;
    }) as T;
  }, []);

  // Démarrer automatiquement le monitoring
  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  // Créer une entrée de performance quand les métriques changent
  useEffect(() => {
    if (Object.keys(metrics).length > 0) {
      const entry = createPerformanceEntry();
      reportPerformance(entry);
    }
  }, [metrics, createPerformanceEntry, reportPerformance]);

  // Composant d'affichage des métriques de performance
  const PerformancePanel = () => {
    if (!isMonitoring) return null;

    const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-green-600';
      if (score >= 70) return 'text-yellow-600';
      return 'text-red-600';
    };

    return (
      <div className="fixed bottom-4 right-4 bg-card text-card-foreground p-4 rounded-lg shadow-lg max-w-sm z-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Performance</h3>
          <span className={`font-bold ${getScoreColor(performanceScore)}`}>
            {performanceScore}/100
          </span>
        </div>
        
        <div className="space-y-1 text-xs">
          {metrics.lcp && (
            <div className="flex justify-between">
              <span>LCP:</span>
              <span>{Math.round(metrics.lcp)}ms</span>
            </div>
          )}
          {metrics.fid && (
            <div className="flex justify-between">
              <span>FID:</span>
              <span>{Math.round(metrics.fid)}ms</span>
            </div>
          )}
          {metrics.cls && (
            <div className="flex justify-between">
              <span>CLS:</span>
              <span>{metrics.cls.toFixed(3)}</span>
            </div>
          )}
          {metrics.renderTime && (
            <div className="flex justify-between">
              <span>Render:</span>
              <span>{Math.round(metrics.renderTime)}ms</span>
            </div>
          )}
          {metrics.memoryUsage && (
            <div className="flex justify-between">
              <span>Memory:</span>
              <span>{Math.round(metrics.memoryUsage)}MB</span>
            </div>
          )}
        </div>
        
        <button
          onClick={stopMonitoring}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Masquer
        </button>
      </div>
    );
  };

  return {
    // État
    metrics,
    performanceEntries,
    isMonitoring,
    performanceScore,
    
    // Contrôles
    startMonitoring,
    stopMonitoring,
    
    // Mesures
    measureRenderTime,
    startInteractionMeasure,
    endInteractionMeasure,
    measureFunction,
    measureAsyncFunction,
    
    // Utilitaires
    getBrowserMetrics,
    createPerformanceEntry,
    
    // Composants
    PerformancePanel
  };
};

// Hook pour mesurer les performances de rendu des composants
export const useRenderPerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);
  
  useEffect(() => {
    renderCount.current++;
    const now = performance.now();
    
    if (lastRenderTime.current > 0) {
      const timeSinceLastRender = now - lastRenderTime.current;
      console.log(`${componentName} render #${renderCount.current} - ${timeSinceLastRender.toFixed(2)}ms since last render`);
    }
    
    lastRenderTime.current = now;
  });
  
  return {
    renderCount: renderCount.current
  };
};