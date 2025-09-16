/**
 * useEnhancedUX.ts - Hook pour les fonctionnalités UX avancées
 * Gère les animations, états de chargement, undo/redo et interactions fluides
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from './useTaskManager';

interface UXConfig {
  enableAnimations?: boolean;
  animationDuration?: number;
  enableUndoRedo?: boolean;
  maxHistorySize?: number;
  enableLoadingStates?: boolean;
}

interface ActionHistory {
  id: string;
  type: 'create' | 'update' | 'delete' | 'move' | 'bulk';
  timestamp: number;
  data: any;
  description: string;
}

interface LoadingState {
  isLoading: boolean;
  operation: string;
  progress?: number;
}

interface AnimationState {
  activeAnimations: Set<string>;
  queuedAnimations: Array<{ id: string; type: string; duration: number }>;
}

export const useEnhancedUX = (config: UXConfig = {}) => {
  const {
    enableAnimations = true,
    animationDuration = 300,
    enableUndoRedo = true,
    maxHistorySize = 50,
    enableLoadingStates = true
  } = config;

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    operation: ''
  });

  const [animationState, setAnimationState] = useState<AnimationState>({
    activeAnimations: new Set(),
    queuedAnimations: []
  });

  const [history, setHistory] = useState<ActionHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [bulkSelection, setBulkSelection] = useState<Set<string>>(new Set());

  const animationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Gestion des états de chargement
  const startLoading = useCallback((operation: string, progress?: number) => {
    if (!enableLoadingStates) return;
    
    setLoadingState({
      isLoading: true,
      operation,
      progress
    });
  }, [enableLoadingStates]);

  const updateLoadingProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({ ...prev, progress }));
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      operation: '',
      progress: undefined
    });
  }, []);

  // Gestion des animations
  const startAnimation = useCallback((id: string, type: string, duration: number = animationDuration) => {
    if (!enableAnimations) return;

    setAnimationState(prev => ({
      ...prev,
      activeAnimations: new Set([...prev.activeAnimations, id])
    }));

    // Auto-cleanup de l'animation
    const timeout = setTimeout(() => {
      setAnimationState(prev => {
        const newAnimations = new Set(prev.activeAnimations);
        newAnimations.delete(id);
        return { ...prev, activeAnimations: newAnimations };
      });
    }, duration);

    animationTimeouts.current.set(id, timeout);
  }, [enableAnimations, animationDuration]);

  const stopAnimation = useCallback((id: string) => {
    const timeout = animationTimeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      animationTimeouts.current.delete(id);
    }

    setAnimationState(prev => {
      const newAnimations = new Set(prev.activeAnimations);
      newAnimations.delete(id);
      return { ...prev, activeAnimations: newAnimations };
    });
  }, []);

  const isAnimating = useCallback((id: string) => {
    return animationState.activeAnimations.has(id);
  }, [animationState.activeAnimations]);

  // Gestion de l'historique pour undo/redo
  const addToHistory = useCallback((action: Omit<ActionHistory, 'id' | 'timestamp'>) => {
    if (!enableUndoRedo) return;

    const historyItem: ActionHistory = {
      ...action,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(historyItem);
      
      // Limiter la taille de l'historique
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      return newHistory;
    });

    setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [enableUndoRedo, historyIndex, maxHistorySize]);

  const undo = useCallback(() => {
    if (!enableUndoRedo || historyIndex < 0) return null;

    const action = history[historyIndex];
    setHistoryIndex(prev => prev - 1);
    
    return action;
  }, [enableUndoRedo, history, historyIndex]);

  const redo = useCallback(() => {
    if (!enableUndoRedo || historyIndex >= history.length - 1) return null;

    const action = history[historyIndex + 1];
    setHistoryIndex(prev => prev + 1);
    
    return action;
  }, [enableUndoRedo, history, historyIndex]);

  const canUndo = enableUndoRedo && historyIndex >= 0;
  const canRedo = enableUndoRedo && historyIndex < history.length - 1;

  // Gestion de la sélection multiple
  const toggleBulkSelection = useCallback((taskId: string) => {
    setBulkSelection(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(taskId)) {
        newSelection.delete(taskId);
      } else {
        newSelection.add(taskId);
      }
      return newSelection;
    });
  }, []);

  const selectAll = useCallback((taskIds: string[]) => {
    setBulkSelection(new Set(taskIds));
  }, []);

  const clearSelection = useCallback(() => {
    setBulkSelection(new Set());
  }, []);

  const isSelected = useCallback((taskId: string) => {
    return bulkSelection.has(taskId);
  }, [bulkSelection]);

  // Opérations en lot
  const bulkUpdateTasks = useCallback(async (
    taskIds: string[],
    updates: Partial<Task>,
    updateFunction: (taskId: string, updates: Partial<Task>) => Promise<void>
  ) => {
    startLoading('Mise à jour en lot', 0);
    
    const total = taskIds.length;
    const results = [];
    
    for (let i = 0; i < taskIds.length; i++) {
      try {
        await updateFunction(taskIds[i], updates);
        results.push({ id: taskIds[i], success: true });
      } catch (error) {
        results.push({ id: taskIds[i], success: false, error });
      }
      
      updateLoadingProgress((i + 1) / total * 100);
    }
    
    stopLoading();
    
    // Ajouter à l'historique
    addToHistory({
      type: 'bulk',
      data: { taskIds, updates, results },
      description: `Mise à jour en lot de ${taskIds.length} tâches`
    });
    
    return results;
  }, [startLoading, updateLoadingProgress, stopLoading, addToHistory]);

  const bulkDeleteTasks = useCallback(async (
    taskIds: string[],
    deleteFunction: (taskId: string) => Promise<void>
  ) => {
    startLoading('Suppression en lot', 0);
    
    const total = taskIds.length;
    const results = [];
    
    for (let i = 0; i < taskIds.length; i++) {
      try {
        await deleteFunction(taskIds[i]);
        results.push({ id: taskIds[i], success: true });
      } catch (error) {
        results.push({ id: taskIds[i], success: false, error });
      }
      
      updateLoadingProgress((i + 1) / total * 100);
    }
    
    stopLoading();
    clearSelection();
    
    // Ajouter à l'historique
    addToHistory({
      type: 'bulk',
      data: { taskIds, results },
      description: `Suppression en lot de ${taskIds.length} tâches`
    });
    
    return results;
  }, [startLoading, updateLoadingProgress, stopLoading, clearSelection, addToHistory]);

  // Animations prédéfinies
  const animateTaskMove = useCallback((taskId: string, fromColumn: string, toColumn: string) => {
    const animationId = `move-${taskId}`;
    startAnimation(animationId, 'move', 500);
    
    return animationId;
  }, [startAnimation]);

  const animateTaskCreate = useCallback((taskId: string) => {
    const animationId = `create-${taskId}`;
    startAnimation(animationId, 'create', 300);
    
    return animationId;
  }, [startAnimation]);

  const animateTaskDelete = useCallback((taskId: string) => {
    const animationId = `delete-${taskId}`;
    startAnimation(animationId, 'delete', 200);
    
    return animationId;
  }, [startAnimation]);

  // Feedback haptique (si supporté)
  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      animationTimeouts.current.forEach(timeout => clearTimeout(timeout));
      animationTimeouts.current.clear();
    };
  }, []);

  // Composant de chargement avec skeleton
  const LoadingOverlay = ({ children }: { children?: React.ReactNode }) => {
    if (!loadingState.isLoading) return null;
    
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
          <div className="space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm font-medium">{loadingState.operation}</p>
              {loadingState.progress !== undefined && (
                <div className="mt-2">
                  <div className="bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${loadingState.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(loadingState.progress)}%
                  </p>
                </div>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  };

  return {
    // États de chargement
    loadingState,
    startLoading,
    updateLoadingProgress,
    stopLoading,
    
    // Animations
    startAnimation,
    stopAnimation,
    isAnimating,
    animateTaskMove,
    animateTaskCreate,
    animateTaskDelete,
    
    // Historique
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    
    // Sélection multiple
    bulkSelection,
    toggleBulkSelection,
    selectAll,
    clearSelection,
    isSelected,
    bulkUpdateTasks,
    bulkDeleteTasks,
    
    // Feedback
    hapticFeedback,
    
    // Composants
    LoadingOverlay
  };
};

// Hook pour les transitions fluides
export const useSmoothTransitions = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTransition = useCallback((duration: number = 300) => {
    setIsTransitioning(true);
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTransitioning,
    startTransition
  };
};