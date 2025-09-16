/**
 * useAdvancedFiltering.ts - Hook pour le filtrage avancé et la recherche globale
 * Gère la recherche globale, filtres avancés, presets et filtres rapides
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task } from './useTaskManager';

interface FilterCriteria {
  search?: string;
  categories?: string[];
  priorities?: string[];
  statuses?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  assignees?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
}

interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  criteria: FilterCriteria;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SearchResult {
  id: string;
  type: 'task' | 'note' | 'goal' | 'habit';
  title: string;
  content?: string;
  relevanceScore: number;
  matchedFields: string[];
  context?: any;
}

interface QuickFilter {
  id: string;
  label: string;
  criteria: FilterCriteria;
  icon?: string;
  color?: string;
}

const DEFAULT_QUICK_FILTERS: QuickFilter[] = [
  {
    id: 'today',
    label: 'Aujourd\'hui',
    criteria: {
      dateRange: {
        start: new Date(),
        end: new Date()
      }
    },
    icon: 'Calendar',
    color: 'blue'
  },
  {
    id: 'high-priority',
    label: 'Priorité haute',
    criteria: {
      priorities: ['high']
    },
    icon: 'AlertTriangle',
    color: 'red'
  },
  {
    id: 'in-progress',
    label: 'En cours',
    criteria: {
      statuses: ['in-progress', 'doing']
    },
    icon: 'Play',
    color: 'orange'
  },
  {
    id: 'overdue',
    label: 'En retard',
    criteria: {
      dateRange: {
        end: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    },
    icon: 'Clock',
    color: 'red'
  }
];

export const useAdvancedFiltering = () => {
  const [currentCriteria, setCurrentCriteria] = useState<FilterCriteria>({});
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);
  const [quickFilters] = useState<QuickFilter[]>(DEFAULT_QUICK_FILTERS);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Charger les presets sauvegardés
  useEffect(() => {
    const saved = localStorage.getItem('productivity-filter-presets');
    if (saved) {
      try {
        const presets = JSON.parse(saved).map((preset: any) => ({
          ...preset,
          createdAt: new Date(preset.createdAt),
          updatedAt: new Date(preset.updatedAt)
        }));
        setSavedPresets(presets);
      } catch (error) {
        console.error('Erreur lors du chargement des presets:', error);
      }
    }
  }, []);

  // Sauvegarder les presets
  const savePresets = useCallback((presets: FilterPreset[]) => {
    localStorage.setItem('productivity-filter-presets', JSON.stringify(presets));
    setSavedPresets(presets);
  }, []);

  // Fonction de recherche globale
  const globalSearch = useCallback(async (query: string, sources: string[] = ['tasks', 'notes', 'goals']) => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);
    
    try {
      const results: SearchResult[] = [];
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

      // Simuler la recherche dans différentes sources
      // En production, ceci ferait des appels API réels
      
      if (sources.includes('tasks')) {
        // Recherche dans les tâches (simulée)
        const taskResults = await searchInTasks(searchTerms);
        results.push(...taskResults);
      }

      if (sources.includes('notes')) {
        // Recherche dans les notes (simulée)
        const noteResults = await searchInNotes(searchTerms);
        results.push(...noteResults);
      }

      if (sources.includes('goals')) {
        // Recherche dans les objectifs (simulée)
        const goalResults = await searchInGoals(searchTerms);
        results.push(...goalResults);
      }

      // Trier par score de pertinence
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      setSearchResults(results);
      
      // Ajouter à l'historique de recherche
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(h => h !== query)];
        return newHistory.slice(0, 10); // Garder seulement les 10 dernières
      });
      
      return results;
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Fonctions de recherche simulées (à remplacer par de vrais appels API)
  const searchInTasks = async (searchTerms: string[]): Promise<SearchResult[]> => {
    // Simulation - en production, ceci ferait un appel API
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      {
        id: 'task-1',
        type: 'task',
        title: 'Exemple de tâche trouvée',
        content: 'Contenu de la tâche qui correspond aux termes de recherche',
        relevanceScore: 0.9,
        matchedFields: ['title', 'content'],
        context: { status: 'todo', priority: 'high' }
      }
    ];
  };

  const searchInNotes = async (searchTerms: string[]): Promise<SearchResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return [];
  };

  const searchInGoals = async (searchTerms: string[]): Promise<SearchResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [];
  };

  // Filtrage des tâches
  const filterTasks = useCallback((tasks: Task[], criteria: FilterCriteria = currentCriteria): Task[] => {
    return tasks.filter(task => {
      // Recherche textuelle
      if (criteria.search) {
        const searchLower = criteria.search.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Filtrage par catégorie
      if (criteria.categories && criteria.categories.length > 0) {
        if (!task.category || !criteria.categories.includes(task.category)) {
          return false;
        }
      }

      // Filtrage par priorité
      if (criteria.priorities && criteria.priorities.length > 0) {
        if (!task.priority || !criteria.priorities.includes(task.priority)) {
          return false;
        }
      }

      // Filtrage par statut
      if (criteria.statuses && criteria.statuses.length > 0) {
        if (!criteria.statuses.includes(task.status)) {
          return false;
        }
      }

      // Filtrage par plage de dates
      if (criteria.dateRange) {
        const taskDate = task.dueDate ? new Date(task.dueDate) : null;
        
        if (criteria.dateRange.start && taskDate) {
          if (taskDate < criteria.dateRange.start) return false;
        }
        
        if (criteria.dateRange.end && taskDate) {
          if (taskDate > criteria.dateRange.end) return false;
        }
      }

      // Filtrage par tags
      if (criteria.tags && criteria.tags.length > 0) {
        if (!task.tags || !criteria.tags.some(tag => task.tags?.includes(tag))) {
          return false;
        }
      }

      // Filtrage par assignés
      if (criteria.assignees && criteria.assignees.length > 0) {
        if (!task.assignedTo || !criteria.assignees.includes(task.assignedTo)) {
          return false;
        }
      }

      return true;
    });
  }, [currentCriteria]);

  // Gestion des critères de filtrage
  const updateCriteria = useCallback((newCriteria: Partial<FilterCriteria>) => {
    setCurrentCriteria(prev => ({ ...prev, ...newCriteria }));
  }, []);

  const clearCriteria = useCallback(() => {
    setCurrentCriteria({});
  }, []);

  const applyCriteria = useCallback((criteria: FilterCriteria) => {
    setCurrentCriteria(criteria);
  }, []);

  // Gestion des presets
  const savePreset = useCallback((name: string, description?: string) => {
    const preset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      description,
      criteria: { ...currentCriteria },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newPresets = [...savedPresets, preset];
    savePresets(newPresets);
    
    return preset;
  }, [currentCriteria, savedPresets, savePresets]);

  const updatePreset = useCallback((presetId: string, updates: Partial<FilterPreset>) => {
    const newPresets = savedPresets.map(preset => 
      preset.id === presetId 
        ? { ...preset, ...updates, updatedAt: new Date() }
        : preset
    );
    savePresets(newPresets);
  }, [savedPresets, savePresets]);

  const deletePreset = useCallback((presetId: string) => {
    const newPresets = savedPresets.filter(preset => preset.id !== presetId);
    savePresets(newPresets);
  }, [savedPresets, savePresets]);

  const applyPreset = useCallback((preset: FilterPreset) => {
    setCurrentCriteria(preset.criteria);
  }, []);

  // Filtres rapides
  const applyQuickFilter = useCallback((filterId: string) => {
    const filter = quickFilters.find(f => f.id === filterId);
    if (filter) {
      setCurrentCriteria(filter.criteria);
    }
  }, [quickFilters]);

  // Statistiques de filtrage
  const getFilterStats = useCallback((tasks: Task[]) => {
    const filtered = filterTasks(tasks);
    const total = tasks.length;
    
    return {
      total,
      filtered: filtered.length,
      percentage: total > 0 ? Math.round((filtered.length / total) * 100) : 0,
      hidden: total - filtered.length
    };
  }, [filterTasks]);

  // Suggestions de recherche
  const getSearchSuggestions = useCallback((query: string, limit: number = 5) => {
    if (!query.trim()) return searchHistory.slice(0, limit);
    
    const suggestions = searchHistory
      .filter(item => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
    
    return suggestions;
  }, [searchHistory]);

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = useMemo(() => {
    return Object.keys(currentCriteria).some(key => {
      const value = currentCriteria[key as keyof FilterCriteria];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== undefined && v !== null);
      }
      return value !== undefined && value !== null && value !== '';
    });
  }, [currentCriteria]);

  return {
    // Critères de filtrage
    currentCriteria,
    updateCriteria,
    clearCriteria,
    applyCriteria,
    hasActiveFilters,
    
    // Filtrage
    filterTasks,
    getFilterStats,
    
    // Recherche globale
    globalSearch,
    searchResults,
    isSearching,
    searchHistory,
    getSearchSuggestions,
    
    // Presets
    savedPresets,
    savePreset,
    updatePreset,
    deletePreset,
    applyPreset,
    
    // Filtres rapides
    quickFilters,
    applyQuickFilter
  };
};

// Hook pour la recherche avec debounce
export const useDebouncedSearch = (delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm
  };
};