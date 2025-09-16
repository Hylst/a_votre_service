/**
 * taskPresets.ts - TypeScript interfaces and types for task preset system
 * Defines the structure for task presets that can be used across all productivity tools
 */

// Base interface for all preset types
export interface BasePreset {
  id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  estimatedDuration?: number; // in minutes
  icon?: string;
  color?: string;
}

// Task preset for To-Do List and Task Manager
export interface TaskPreset extends BasePreset {
  type: 'task';
  subtasks?: string[]; // Array of subtask titles
  dueDate?: string; // Relative date like '+1d', '+1w', '+1m'
  recurring?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
}

// Objective preset for Goals/Objectives tool
export interface ObjectivePreset extends BasePreset {
  type: 'objective';
  milestones?: string[];
  targetDate?: string; // Relative date
  measurable: boolean;
  kpis?: string[]; // Key Performance Indicators
}

// Pomodoro session preset
export interface PomodoroPreset extends BasePreset {
  type: 'pomodoro';
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
  backgroundMusic?: string;
}

// Union type for all presets
export type Preset = TaskPreset | ObjectivePreset | PomodoroPreset;

// Category structure for organizing presets
export interface PresetCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  subcategories?: PresetSubcategory[];
}

export interface PresetSubcategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

// Preset library structure
export interface PresetLibrary {
  categories: PresetCategory[];
  presets: Preset[];
  version: string;
  lastUpdated: string;
}

// Filter and search options
export interface PresetFilters {
  category?: string;
  subcategory?: string;
  type?: Preset['type'];
  priority?: BasePreset['priority'] | 'all';
  tags?: string[];
  searchTerm?: string;
  estimatedDuration?: {
    min?: number;
    max?: number;
  };
}

// Preset selection result
export interface PresetSelection {
  preset: Preset;
  customizations?: {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: BasePreset['priority'];
    tags?: string[];
  };
}

// Hook return type for preset management
export interface UsePresetLibrary {
  presets: Preset[];
  categories: PresetCategory[];
  filteredPresets: Preset[];
  filters: PresetFilters;
  setFilters: (filters: Partial<PresetFilters>) => void;
  searchPresets: (term: string) => void;
  getPresetsByCategory: (categoryId: string) => Preset[];
  getPresetsByType: (type: Preset['type']) => Preset[];
  addCustomPreset: (preset: Omit<TaskPreset, 'id'> | Omit<ObjectivePreset, 'id'> | Omit<PomodoroPreset, 'id'>) => void;
  removeCustomPreset: (presetId: string) => void;
  isLoading: boolean;
  error?: string;
}

// Export utility types
export type PresetType = Preset['type'];
export type PresetPriority = BasePreset['priority'];
export type PresetCategory_ID = string;
export type PresetID = string;