/**
 * useProductivityTemplates.ts - Hook pour la gestion des templates de productivité
 * Gère les templates Kanban et Eisenhower avec sauvegarde, chargement et application
 */

import { useState, useEffect, useCallback } from 'react';
import { Task } from './useTaskManager';
import { ProductivityTemplate, TemplateManager } from '../utils/templates';

export interface TemplateMetrics {
  usage: {
    templateId: string;
    name: string;
    timesUsed: number;
    lastUsed: Date;
    averageRating: number;
    category: string;
  }[];
  popular: ProductivityTemplate[];
  recent: ProductivityTemplate[];
  recommended: ProductivityTemplate[];
}

export interface TemplateApplication {
  templateId: string;
  appliedAt: string; // ISO string format for consistent storage
  tasksCreated: number;
  success: boolean;
  feedback?: {
    rating: number;
    comment: string;
  };
}

interface UseProductivityTemplatesOptions {
  autoSave?: boolean;
  syncInterval?: number;
  enableMetrics?: boolean;
  maxRecentTemplates?: number;
}

interface UseProductivityTemplatesReturn {
  // Templates management
  templates: ProductivityTemplate[];
  isLoading: boolean;
  error: string | null;
  
  // Template operations
  loadTemplates: () => Promise<void>;
  saveTemplate: (template: Omit<ProductivityTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTemplate: (id: string, updates: Partial<ProductivityTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string, newName?: string) => Promise<string>;
  
  // Template application
  applyTemplate: (templateId: string, options?: {
    replaceExisting?: boolean;
    customizations?: Record<string, any>;
  }) => Promise<Task[]>;
  
  // Template discovery
  searchTemplates: (query: string, filters?: {
    category?: string;
    type?: 'kanban' | 'eisenhower';
    tags?: string[];
  }) => ProductivityTemplate[];
  getTemplatesByCategory: (category: string) => ProductivityTemplate[];
  getRecommendedTemplates: (basedOnUsage?: boolean) => ProductivityTemplate[];
  
  // Import/Export
  exportTemplate: (templateId: string) => Promise<string>;
  exportAllTemplates: () => Promise<string>;
  importTemplate: (templateData: string) => Promise<string>;
  importTemplates: (templatesData: string) => Promise<string[]>;
  
  // Metrics and analytics
  metrics: TemplateMetrics;
  getTemplateMetrics: (templateId: string) => {
    timesUsed: number;
    lastUsed: Date | null;
    averageRating: number;
    successRate: number;
  } | null;
  rateTemplate: (templateId: string, rating: number, comment?: string) => Promise<void>;
  
  // Template validation
  validateTemplate: (template: Partial<ProductivityTemplate>) => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  
  // Favorites
  favoriteTemplates: string[];
  toggleFavorite: (templateId: string) => void;
  getFavoriteTemplates: () => ProductivityTemplate[];
}

const STORAGE_KEYS = {
  TEMPLATES: 'productivity_templates',
  METRICS: 'template_metrics',
  APPLICATIONS: 'template_applications',
  FAVORITES: 'template_favorites'
};

export const useProductivityTemplates = ({
  autoSave = true,
  syncInterval = 30000, // 30 seconds
  enableMetrics = true,
  maxRecentTemplates = 10
}: UseProductivityTemplatesOptions = {}): UseProductivityTemplatesReturn => {
  const [templates, setTemplates] = useState<ProductivityTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<TemplateMetrics>({
    usage: [],
    popular: [],
    recent: [],
    recommended: []
  });
  const [applications, setApplications] = useState<TemplateApplication[]>([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
  
  // TemplateManager methods are static, no need to instantiate

  // Chargement initial
  useEffect(() => {
    loadTemplates();
    loadMetrics();
    loadApplications();
    loadFavorites();
  }, []);

  // Auto-save
  useEffect(() => {
    if (!autoSave) return;

    const interval = setInterval(() => {
      saveToStorage();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSave, syncInterval, templates, metrics, applications, favoriteTemplates]);

  // Chargement des templates
  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger depuis le localStorage
      const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (stored) {
        const parsedTemplates = JSON.parse(stored);
        setTemplates(parsedTemplates);
      } else {
        // Charger les templates par défaut
        const defaultTemplates = TemplateManager.getAllTemplates().flatMap(cat => cat.templates);
        setTemplates(defaultTemplates);
      }
      
      updateMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sauvegarde d'un template
  const saveTemplate = useCallback(async (
    template: Omit<ProductivityTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    try {
      const newTemplate: ProductivityTemplate = {
        ...template,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const validation = validateTemplate(newTemplate);
      if (!validation.isValid) {
        throw new Error(`Template invalide: ${validation.errors.join(', ')}`);
      }
      
      setTemplates(prev => [...prev, newTemplate]);
      
      if (autoSave) {
        await saveToStorage();
      }
      
      return newTemplate.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
      throw err;
    }
  }, [autoSave]);

  // Mise à jour d'un template
  const updateTemplate = useCallback(async (
    id: string, 
    updates: Partial<ProductivityTemplate>
  ): Promise<void> => {
    try {
      setTemplates(prev => prev.map(template => 
        template.id === id 
          ? { ...template, ...updates, updatedAt: new Date().toISOString() }
          : template
      ));
      
      if (autoSave) {
        await saveToStorage();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    }
  }, [autoSave]);

  // Suppression d'un template
  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    try {
      setTemplates(prev => prev.filter(template => template.id !== id));
      setFavoriteTemplates(prev => prev.filter(fav => fav !== id));
      
      if (autoSave) {
        await saveToStorage();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    }
  }, [autoSave]);

  // Duplication d'un template
  const duplicateTemplate = useCallback(async (
    id: string, 
    newName?: string
  ): Promise<string> => {
    try {
      const original = templates.find(t => t.id === id);
      if (!original) {
        throw new Error('Template non trouvé');
      }
      
      const duplicate = {
        ...original,
        name: newName || `${original.name} (Copie)`,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTemplates(prev => [...prev, duplicate]);
      
      if (autoSave) {
        await saveToStorage();
      }
      
      return duplicate.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la duplication');
      throw err;
    }
  }, [templates, autoSave]);

  // Application d'un template
  const applyTemplate = useCallback(async (
    templateId: string,
    options: {
      replaceExisting?: boolean;
      customizations?: Record<string, any>;
    } = {}
  ): Promise<Task[]> => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template non trouvé');
      }
      
      const tasks = TemplateManager.applyTemplate(template);
      
      // Enregistrer l'application
      const application: TemplateApplication = {
        templateId,
        appliedAt: new Date().toISOString(),
        tasksCreated: tasks.length,
        success: true
      };
      
      setApplications(prev => [...prev, application]);
      
      if (enableMetrics) {
        updateTemplateUsage(templateId);
      }
      
      return tasks;
    } catch (err) {
      const application: TemplateApplication = {
        templateId,
        appliedAt: new Date().toISOString(),
        tasksCreated: 0,
        success: false
      };
      
      setApplications(prev => [...prev, application]);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'application');
      throw err;
    }
  }, [templates, enableMetrics]);

  // Recherche de templates
  const searchTemplates = useCallback((
    query: string,
    filters: {
      category?: string;
      type?: 'kanban' | 'eisenhower';
      tags?: string[];
    } = {}
  ): ProductivityTemplate[] => {
    return templates.filter(template => {
      // Recherche textuelle
      const matchesQuery = !query || 
        template.name.toLowerCase().includes(query.toLowerCase()) ||
        template.description.toLowerCase().includes(query.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      // Filtres
      const matchesCategory = !filters.category || template.category === filters.category;
      const matchesType = !filters.type || template.type === filters.type;
      const matchesTags = !filters.tags || 
        filters.tags.every(tag => template.tags.includes(tag));
      
      return matchesQuery && matchesCategory && matchesType && matchesTags;
    });
  }, [templates]);

  // Templates par catégorie
  const getTemplatesByCategory = useCallback((category: string): ProductivityTemplate[] => {
    return templates.filter(template => template.category === category);
  }, [templates]);

  // Templates recommandés
  const getRecommendedTemplates = useCallback((basedOnUsage = true): ProductivityTemplate[] => {
    if (!basedOnUsage) {
      return templates.slice(0, 5); // Templates par défaut
    }
    
    // Basé sur l'utilisation et les évaluations
    return templates
      .map(template => {
        const usage = metrics.usage.find(u => u.templateId === template.id);
        return {
          template,
          score: (usage?.timesUsed || 0) * 0.3 + (usage?.averageRating || 0) * 0.7
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.template);
  }, [templates, metrics]);

  // Export d'un template
  const exportTemplate = useCallback(async (templateId: string): Promise<string> => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template non trouvé');
    }
    
    return JSON.stringify(template, null, 2);
  }, [templates]);

  // Export de tous les templates
  const exportAllTemplates = useCallback(async (): Promise<string> => {
    return JSON.stringify(templates, null, 2);
  }, [templates]);

  // Import d'un template
  const importTemplate = useCallback(async (templateData: string): Promise<string> => {
    try {
      const template = JSON.parse(templateData) as ProductivityTemplate;
      
      // Générer un nouvel ID pour éviter les conflits
      const importedTemplate = {
        ...template,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const validation = validateTemplate(importedTemplate);
      if (!validation.isValid) {
        throw new Error(`Template invalide: ${validation.errors.join(', ')}`);
      }
      
      setTemplates(prev => [...prev, importedTemplate]);
      
      return importedTemplate.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
      throw err;
    }
  }, []);

  // Import de plusieurs templates
  const importTemplates = useCallback(async (templatesData: string): Promise<string[]> => {
    try {
      const templatesArray = JSON.parse(templatesData) as ProductivityTemplate[];
      const importedIds: string[] = [];
      
      for (const template of templatesArray) {
        const importedTemplate = {
          ...template,
          id: generateId(),
          createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
        };
        
        const validation = validateTemplate(importedTemplate);
        if (validation.isValid) {
          setTemplates(prev => [...prev, importedTemplate]);
          importedIds.push(importedTemplate.id);
        }
      }
      
      return importedIds;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
      throw err;
    }
  }, []);

  // Métriques d'un template
  const getTemplateMetrics = useCallback((templateId: string) => {
    const usage = metrics.usage.find(u => u.templateId === templateId);
    if (!usage) return null;
    
    const templateApplications = applications.filter(a => a.templateId === templateId);
    const successRate = templateApplications.length > 0 
      ? (templateApplications.filter(a => a.success).length / templateApplications.length) * 100
      : 0;
    
    return {
      timesUsed: usage.timesUsed,
      lastUsed: usage.lastUsed,
      averageRating: usage.averageRating,
      successRate
    };
  }, [metrics, applications]);

  // Évaluation d'un template
  const rateTemplate = useCallback(async (
    templateId: string, 
    rating: number, 
    comment?: string
  ): Promise<void> => {
    try {
      // Trouver la dernière application
      const lastApplication = applications
        .filter(a => a.templateId === templateId)
        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())[0];
      
      if (lastApplication) {
        lastApplication.feedback = { rating, comment: comment || '' };
        setApplications(prev => [...prev]);
      }
      
      updateTemplateRating(templateId, rating);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'évaluation');
      throw err;
    }
  }, [applications]);

  // Validation d'un template
  const validateTemplate = useCallback((template: Partial<ProductivityTemplate>) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!template.name || template.name.trim().length === 0) {
      errors.push('Le nom du template est requis');
    }
    
    if (!template.type) {
      errors.push('Le type du template est requis');
    }
    
    if (!template.category) {
      warnings.push('La catégorie du template n\'est pas définie');
    }
    
    if (!template.tasks || template.tasks.length === 0) {
      warnings.push('Le template ne contient aucune tâche');
    }
    
    if (template.tasks && template.tasks.length > 50) {
      warnings.push('Le template contient beaucoup de tâches (>50)');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  // Gestion des favoris
  const toggleFavorite = useCallback((templateId: string) => {
    setFavoriteTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  }, []);

  const getFavoriteTemplates = useCallback((): ProductivityTemplate[] => {
    return templates.filter(template => favoriteTemplates.includes(template.id));
  }, [templates, favoriteTemplates]);

  // Fonctions utilitaires
  const saveToStorage = async () => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
      localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteTemplates));
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  const loadMetrics = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.METRICS);
      if (stored) {
        setMetrics(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Erreur lors du chargement des métriques:', err);
    }
  };

  const loadApplications = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (stored) {
        const parsedApplications = JSON.parse(stored);
        // appliedAt should remain as string (ISO format)
        setApplications(parsedApplications);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des applications:', err);
    }
  };

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (stored) {
        setFavoriteTemplates(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Erreur lors du chargement des favoris:', err);
    }
  };

  const updateMetrics = () => {
    const usage = templates.map(template => {
      const templateApplications = applications.filter(a => a.templateId === template.id);
      const ratings = templateApplications
        .filter(a => a.feedback?.rating)
        .map(a => a.feedback!.rating);
      
      return {
        templateId: template.id,
        name: template.name,
        timesUsed: templateApplications.length,
        lastUsed: templateApplications.length > 0 
          ? new Date(Math.max(...templateApplications.map(a => new Date(a.appliedAt).getTime())))
          : new Date(0),
        averageRating: ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0,
        category: template.category
      };
    });
    
    const popular = templates
      .map(template => ({ template, usage: usage.find(u => u.templateId === template.id)! }))
      .sort((a, b) => b.usage.timesUsed - a.usage.timesUsed)
      .slice(0, 5)
      .map(item => item.template);
    
    const recent = templates
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, maxRecentTemplates);
    
    const recommended = getRecommendedTemplates(true);
    
    setMetrics({
      usage,
      popular,
      recent,
      recommended
    });
  };

  const updateTemplateUsage = (templateId: string) => {
    setMetrics(prev => ({
      ...prev,
      usage: prev.usage.map(usage => 
        usage.templateId === templateId
          ? { ...usage, timesUsed: usage.timesUsed + 1, lastUsed: new Date() }
          : usage
      )
    }));
  };

  const updateTemplateRating = (templateId: string, rating: number) => {
    setMetrics(prev => ({
      ...prev,
      usage: prev.usage.map(usage => {
        if (usage.templateId === templateId) {
          const templateApplications = applications.filter(a => a.templateId === templateId);
          const ratings = templateApplications
            .filter(a => a.feedback?.rating)
            .map(a => a.feedback!.rating);
          ratings.push(rating);
          
          const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
          
          return { ...usage, averageRating };
        }
        return usage;
      })
    }));
  };

  return {
    templates,
    isLoading,
    error,
    loadTemplates,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    applyTemplate,
    searchTemplates,
    getTemplatesByCategory,
    getRecommendedTemplates,
    exportTemplate,
    exportAllTemplates,
    importTemplate,
    importTemplates,
    metrics,
    getTemplateMetrics,
    rateTemplate,
    validateTemplate,
    favoriteTemplates,
    toggleFavorite,
    getFavoriteTemplates
  };
};

// Fonction utilitaire pour générer des IDs
function generateId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default useProductivityTemplates;