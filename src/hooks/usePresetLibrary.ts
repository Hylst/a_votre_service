/**
 * usePresetLibrary.ts - Hook for managing task preset library
 * Provides functionality to search, filter, and manage task presets
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Preset, 
  PresetFilters, 
  PresetCategory, 
  UsePresetLibrary,
  TaskPreset,
  ObjectivePreset,
  PomodoroPreset,
  PresetSelection
} from '../types/taskPresets';
import { 
  PRESET_LIBRARY, 
  getPresetsByCategory, 
  getPresetsByType, 
  searchPresets 
} from '../data/presetLibrary';
import { useRobustDataManager } from './useRobustDataManager';
import { useToast } from './use-toast';

const STORAGE_KEY = 'custom_presets';

export const usePresetLibrary = (): UsePresetLibrary => {
  const [filters, setFilters] = useState<PresetFilters>({
    category: undefined,
    subcategory: undefined,
    type: undefined,
    priority: undefined,
    tags: [],
    searchTerm: '',
    estimatedDuration: undefined
  });
  
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  
  const { saveData, loadData } = useRobustDataManager();
  const { toast } = useToast();

  // Load custom presets from storage
  useEffect(() => {
    const loadCustomPresets = async () => {
      try {
        setIsLoading(true);
        const saved = await loadData(STORAGE_KEY);
        if (saved && Array.isArray(saved)) {
          setCustomPresets(saved);
        }
      } catch (err) {
        console.error('Error loading custom presets:', err);
        setError('Erreur lors du chargement des presets personnalisés');
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomPresets();
  }, [loadData]);

  // All presets (built-in + custom)
  const allPresets = useMemo(() => {
    return [...PRESET_LIBRARY.presets, ...customPresets];
  }, [customPresets]);

  // Filtered presets based on current filters
  const filteredPresets = useMemo(() => {
    let result = allPresets;

    // Filter by search term
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.toLowerCase().trim();
      result = result.filter(preset => 
        preset.title.toLowerCase().includes(searchTerm) ||
        preset.description?.toLowerCase().includes(searchTerm) ||
        preset.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      result = result.filter(preset => preset.category === filters.category);
    }

    // Filter by subcategory
    if (filters.subcategory && filters.subcategory !== 'all') {
      result = result.filter(preset => preset.subcategory === filters.subcategory);
    }

    // Filter by type
    if (filters.type) {
      result = result.filter(preset => preset.type === filters.type);
    }

    // Filter by priority
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter(preset => preset.priority === filters.priority);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(preset => 
        filters.tags!.some(filterTag => 
          preset.tags.some(presetTag => 
            presetTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )
      );
    }

    // Filter by estimated duration
    if (filters.estimatedDuration) {
      const { min, max } = filters.estimatedDuration;
      result = result.filter(preset => {
        if (!preset.estimatedDuration) return false;
        if (min !== undefined && preset.estimatedDuration < min) return false;
        if (max !== undefined && preset.estimatedDuration > max) return false;
        return true;
      });
    }

    return result;
  }, [allPresets, filters]);

  // Update filters
  const updateFilters = (newFilters: Partial<PresetFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Search presets
  const searchPresetsFunction = (term: string) => {
    updateFilters({ searchTerm: term });
  };

  // Get presets by category
  const getPresetsByCategoryFunction = (categoryId: string) => {
    return allPresets.filter(preset => preset.category === categoryId);
  };

  // Get presets by type
  const getPresetsByTypeFunction = (type: Preset['type']) => {
    return allPresets.filter(preset => preset.type === type);
  };

  // Add custom preset
  const addCustomPreset = async (presetData: Omit<TaskPreset, 'id'> | Omit<ObjectivePreset, 'id'> | Omit<PomodoroPreset, 'id'>) => {
    try {
      setIsLoading(true);
      
      // Generate unique ID
      const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newPreset = {
        ...presetData,
        id
      } as Preset;

      const updatedCustomPresets = [...customPresets, newPreset];
      setCustomPresets(updatedCustomPresets);
      
      // Save to storage
      await saveData(STORAGE_KEY, updatedCustomPresets);
      
      toast({
        title: 'Preset ajouté',
        description: `Le preset "${newPreset.title}" a été ajouté avec succès.`,
      });
      
    } catch (err) {
      console.error('Error adding custom preset:', err);
      setError('Erreur lors de l\'ajout du preset personnalisé');
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le preset personnalisé.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove custom preset
  const removeCustomPreset = async (presetId: string) => {
    try {
      setIsLoading(true);
      
      // Only allow removal of custom presets
      if (!presetId.startsWith('custom_')) {
        throw new Error('Cannot remove built-in presets');
      }
      
      const updatedCustomPresets = customPresets.filter(preset => preset.id !== presetId);
      setCustomPresets(updatedCustomPresets);
      
      // Save to storage
      await saveData(STORAGE_KEY, updatedCustomPresets);
      
      toast({
        title: 'Preset supprimé',
        description: 'Le preset personnalisé a été supprimé avec succès.',
      });
      
    } catch (err) {
      console.error('Error removing custom preset:', err);
      setError('Erreur lors de la suppression du preset');
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le preset.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(undefined), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    presets: allPresets,
    categories: PRESET_LIBRARY.categories,
    filteredPresets,
    filters,
    setFilters: updateFilters,
    searchPresets: searchPresetsFunction,
    getPresetsByCategory: getPresetsByCategoryFunction,
    getPresetsByType: getPresetsByTypeFunction,
    addCustomPreset,
    removeCustomPreset,
    isLoading,
    error
  };
};

// Utility hook for converting presets to task format
export const usePresetConverter = () => {
  const convertTaskPreset = (preset: Preset, customizations?: any) => {
    // Type guard to ensure we have a TaskPreset
    if (preset.type !== 'task') {
      throw new Error('Preset must be of type "task" to convert to TaskPreset');
    }
    const taskPreset = preset as TaskPreset;
    const dueDate = customizations?.dueDate || taskPreset.dueDate;
    let dueDateValue = '';
    
    if (dueDate) {
      const now = new Date();
      if (dueDate.startsWith('+')) {
        const match = dueDate.match(/\+(\d+)([dwmy])/);
        if (match) {
          const [, amount, unit] = match;
          const num = parseInt(amount);
          switch (unit) {
            case 'd':
              now.setDate(now.getDate() + num);
              break;
            case 'w':
              now.setDate(now.getDate() + (num * 7));
              break;
            case 'm':
              now.setMonth(now.getMonth() + num);
              break;
            case 'y':
              now.setFullYear(now.getFullYear() + num);
              break;
          }
          dueDateValue = now.toISOString().split('T')[0];
        }
      } else {
        dueDateValue = dueDate;
      }
    }

    return {
      title: customizations?.title || taskPreset.title,
      description: customizations?.description || taskPreset.description || '',
      priority: customizations?.priority || taskPreset.priority,
      category: taskPreset.category,
      tags: customizations?.tags?.join(', ') || taskPreset.tags.join(', '),
      dueDate: dueDateValue,
      estimatedDuration: taskPreset.estimatedDuration?.toString() || ''
    };
  };

  const convertObjectivePreset = (preset: Preset, customizations?: any) => {
    // Type guard to ensure we have an ObjectivePreset
    if (preset.type !== 'objective') {
      throw new Error('Preset must be of type "objective" to convert to ObjectivePreset');
    }
    const objectivePreset = preset as ObjectivePreset;
    return {
      title: customizations?.title || objectivePreset.title,
      description: customizations?.description || objectivePreset.description || '',
      priority: customizations?.priority || objectivePreset.priority,
      category: objectivePreset.category,
      tags: customizations?.tags?.join(', ') || objectivePreset.tags.join(', '),
      targetDate: objectivePreset.targetDate || '',
      milestones: objectivePreset.milestones || [],
      kpis: objectivePreset.kpis || []
    };
  };

  const convertPomodoroPreset = (preset: Preset) => {
    // Type guard to ensure we have a PomodoroPreset
    if (preset.type !== 'pomodoro') {
      throw new Error('Preset must be of type "pomodoro" to convert to PomodoroPreset');
    }
    const pomodoroPreset = preset as PomodoroPreset;
    return {
      title: pomodoroPreset.title,
      description: pomodoroPreset.description || '',
      focusDuration: pomodoroPreset.focusDuration,
      breakDuration: pomodoroPreset.breakDuration,
      longBreakDuration: pomodoroPreset.longBreakDuration,
      sessionsBeforeLongBreak: pomodoroPreset.sessionsBeforeLongBreak
    };
  };

  // Convert preset to goal format
  const convertPresetToGoal = (presetSelection: PresetSelection) => {
    const { preset, customizations } = presetSelection;
    
    if (preset.type !== 'objective') {
      throw new Error('Only objective presets can be converted to goals');
    }

    const objectivePreset = preset as ObjectivePreset;
    
    // Calculate target date based on preset's targetDate
    let targetDate = '';
    if (objectivePreset.targetDate) {
      const date = new Date();
      if (objectivePreset.targetDate.includes('d')) {
        const days = parseInt(objectivePreset.targetDate.replace('+', '').replace('d', ''));
        date.setDate(date.getDate() + days);
      } else if (objectivePreset.targetDate.includes('w')) {
        const weeks = parseInt(objectivePreset.targetDate.replace('+', '').replace('w', ''));
        date.setDate(date.getDate() + (weeks * 7));
      } else if (objectivePreset.targetDate.includes('m')) {
        const months = parseInt(objectivePreset.targetDate.replace('+', '').replace('m', ''));
        date.setMonth(date.getMonth() + months);
      }
      targetDate = date.toISOString().split('T')[0];
    }

    return {
      title: customizations?.title || objectivePreset.title,
      description: customizations?.description || objectivePreset.description || '',
      type: 'personal' as const,
      priority: customizations?.priority || objectivePreset.priority,
      targetValue: undefined,
      currentValue: 0,
      unit: '',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: targetDate || '',
      tags: customizations?.tags || objectivePreset.tags || []
    };
  };

  return {
    convertTaskPreset,
    convertObjectivePreset,
    convertPomodoroPreset,
    convertPresetToGoal
  };
};