/**
 * usePerformanceOptimizations.ts - Hook pour les optimisations de performance
 * Gère la virtualisation, la mémorisation et les optimisations de rendu
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { Task } from './useTaskManager';

interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface PerformanceMetrics {
  renderTime: number;
  taskCount: number;
  memoryUsage?: number;
}

export const useVirtualScroll = (items: any[], config: VirtualScrollConfig) => {
  const [scrollTop, setScrollTop] = useState(0);
  const { itemHeight, containerHeight, overscan = 5 } = config;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      ...item,
      index: visibleRange.startIndex + index,
      offsetY: (visibleRange.startIndex + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    visibleRange
  };
};

export const useDebouncedSearch = (initialValue: string = '', delay: number = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  const debouncedSetValue = useMemo(
    () => debounce((newValue: string) => {
      setDebouncedValue(newValue);
    }, delay),
    [delay]
  );

  useEffect(() => {
    debouncedSetValue(value);
    return () => {
      debouncedSetValue.cancel();
    };
  }, [value, debouncedSetValue]);

  return [debouncedValue, setValue] as const;
};

export const useMemoizedTasks = (tasks: Task[], filters: {
  searchTerm: string;
  status: string;
  priority: string;
  category?: string;
}) => {
  return useMemo(() => {
    let filteredTasks = tasks;

    // Filtre par terme de recherche
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.category?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par statut
    if (filters.status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }

    // Filtre par priorité
    if (filters.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    // Filtre par catégorie
    if (filters.category && filters.category !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.category === filters.category);
    }

    return filteredTasks;
  }, [tasks, filters.searchTerm, filters.status, filters.priority, filters.category]);
};

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({ renderTime: 0, taskCount: 0 });
  const renderStartTime = useRef<number>(0);

  const startRenderMeasurement = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRenderMeasurement = useCallback((taskCount: number) => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({ ...prev, renderTime, taskCount }));
  }, []);

  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({ 
        ...prev, 
        memoryUsage: memoryInfo.usedJSHeapSize / 1024 / 1024 // MB
      }));
    }
  }, []);

  return {
    metrics,
    startRenderMeasurement,
    endRenderMeasurement,
    measureMemoryUsage
  };
};

export const useOptimizedDragAndDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startDrag = useCallback((itemId: string) => {
    setIsDragging(true);
    setDraggedItem(itemId);
    
    // Auto-cleanup après 10 secondes pour éviter les états bloqués
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(false);
      setDraggedItem(null);
    }, 10000);
  }, []);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  return {
    isDragging,
    draggedItem,
    startDrag,
    endDrag
  };
};

export const useLazyLoading = <T extends any>(items: T[], batchSize: number = 20) => {
  const [loadedCount, setLoadedCount] = useState(batchSize);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(() => {
    if (loadedCount >= items.length || isLoading) return;
    
    setIsLoading(true);
    // Simule un délai de chargement
    setTimeout(() => {
      setLoadedCount(prev => Math.min(prev + batchSize, items.length));
      setIsLoading(false);
    }, 100);
  }, [loadedCount, items.length, isLoading, batchSize]);

  const visibleItems = useMemo(() => {
    return items.slice(0, loadedCount);
  }, [items, loadedCount]);

  const hasMore = loadedCount < items.length;

  // Reset when items change
  useEffect(() => {
    setLoadedCount(Math.min(batchSize, items.length));
  }, [items.length, batchSize]);

  return {
    visibleItems,
    loadMore,
    hasMore,
    isLoading,
    loadedCount,
    totalCount: items.length
  };
};

export const useAnimationFrame = (callback: () => void, deps: any[]) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      callback();
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, deps);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
};

// Main hook that combines all performance optimizations
export const usePerformanceOptimizations = () => {
  const performanceMonitoring = usePerformanceMonitoring();
  const dragAndDrop = useOptimizedDragAndDrop();

  return {
    ...performanceMonitoring,
    ...dragAndDrop,
    useVirtualScroll,
    useDebouncedSearch,
    useMemoizedTasks,
    useLazyLoading,
    useAnimationFrame
  };
};