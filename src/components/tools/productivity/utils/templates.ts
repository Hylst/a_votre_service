/**
 * templates.ts - Système de templates pour les outils de productivité
 * Fournit des workflows prédéfinis et la gestion de templates personnalisés
 */

import { Task } from '../hooks/useTaskManager';

// Types pour les templates
export interface ProductivityTemplate {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'marketing' | 'management' | 'personal' | 'custom';
  type: 'kanban' | 'eisenhower' | 'hybrid';
  tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[];
  columns?: string[]; // Pour les templates Kanban
  settings?: {
    wipLimits?: Record<string, number>;
    autoAssignQuadrants?: boolean;
    defaultPriority?: 'low' | 'medium' | 'high';
    estimatedDurationDefault?: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  isDefault: boolean;
  author?: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: ProductivityTemplate[];
}

// Templates prédéfinis pour le développement
const DEVELOPMENT_TEMPLATES: ProductivityTemplate[] = [
  {
    id: 'dev-sprint-planning',
    name: 'Sprint Planning',
    description: 'Template pour organiser un sprint de développement avec toutes les phases essentielles',
    category: 'development',
    type: 'kanban',
    columns: ['Backlog', 'Sprint Planning', 'En Développement', 'Code Review', 'Testing', 'Déployé'],
    tasks: [
      {
        title: 'Planification du sprint',
        description: 'Définir les objectifs et sélectionner les user stories',
        priority: 'high',
        status: 'todo',
        category: 'development',
        tags: ['planning', 'sprint'],
        estimatedDuration: 120,
        completed: false
      },
      {
        title: 'Setup environnement de développement',
        description: 'Configurer les outils et dépendances nécessaires',
        priority: 'high',
        status: 'todo',
        category: 'development',
        tags: ['setup', 'environment'],
        estimatedDuration: 60,
        completed: false
      },
      {
        title: 'Développement des fonctionnalités core',
        description: 'Implémenter les fonctionnalités principales du sprint',
        priority: 'high',
        status: 'todo',
        category: 'development',
        tags: ['development', 'core'],
        estimatedDuration: 480,
        completed: false
      },
      {
        title: 'Tests unitaires',
        description: 'Écrire et exécuter les tests unitaires',
        priority: 'medium',
        status: 'todo',
        category: 'development',
        tags: ['testing', 'unit-tests'],
        estimatedDuration: 180,
        completed: false
      },
      {
        title: 'Code review',
        description: 'Révision du code par les pairs',
        priority: 'medium',
        status: 'todo',
        category: 'development',
        tags: ['review', 'quality'],
        estimatedDuration: 90,
        completed: false
      },
      {
        title: 'Documentation',
        description: 'Mettre à jour la documentation technique',
        priority: 'low',
        status: 'todo',
        category: 'development',
        tags: ['documentation'],
        estimatedDuration: 60,
        completed: false
      }
    ],
    settings: {
      wipLimits: { 'En Développement': 3, 'Code Review': 2, 'Testing': 2 },
      defaultPriority: 'medium',
      estimatedDurationDefault: 120
    },
    tags: ['development', 'agile', 'sprint'],
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'dev-bug-fixing',
    name: 'Bug Fixing Workflow',
    description: 'Processus structuré pour identifier, reproduire et corriger les bugs',
    category: 'development',
    type: 'eisenhower',
    tasks: [
      {
        title: 'Triage des bugs critiques',
        description: 'Identifier et prioriser les bugs bloquants',
        priority: 'high',
        status: 'todo',
        category: 'development',
        tags: ['bug', 'critical', 'urgent'],
        estimatedDuration: 30,
        completed: false
      },
      {
        title: 'Reproduction des bugs',
        description: 'Reproduire les bugs pour comprendre leur cause',
        priority: 'high',
        status: 'todo',
        category: 'development',
        tags: ['bug', 'reproduction'],
        estimatedDuration: 60,
        completed: false
      },
      {
        title: 'Correction des bugs prioritaires',
        description: 'Développer les corrections pour les bugs importants',
        priority: 'high',
        status: 'todo',
        category: 'development',
        tags: ['bug', 'fix', 'important'],
        estimatedDuration: 180,
        completed: false
      },
      {
        title: 'Amélioration de la couverture de tests',
        description: 'Ajouter des tests pour éviter les régressions',
        priority: 'medium',
        status: 'todo',
        category: 'development',
        tags: ['testing', 'prevention'],
        estimatedDuration: 120,
        completed: false
      },
      {
        title: 'Documentation des corrections',
        description: 'Documenter les corrections apportées',
        priority: 'low',
        status: 'todo',
        category: 'development',
        tags: ['documentation', 'changelog'],
        estimatedDuration: 45,
        completed: false
      }
    ],
    settings: {
      autoAssignQuadrants: true,
      defaultPriority: 'high'
    },
    tags: ['development', 'bugs', 'maintenance'],
    createdAt: new Date().toISOString(),
    isDefault: true
  }
];

// Templates prédéfinis pour le marketing
const MARKETING_TEMPLATES: ProductivityTemplate[] = [
  {
    id: 'marketing-campaign-launch',
    name: 'Lancement de Campagne Marketing',
    description: 'Workflow complet pour planifier et lancer une campagne marketing',
    category: 'marketing',
    type: 'hybrid',
    columns: ['Idéation', 'Planification', 'Création', 'Révision', 'Publication', 'Analyse'],
    tasks: [
      {
        title: 'Définition des objectifs de campagne',
        description: 'Établir les KPIs et objectifs mesurables',
        priority: 'high',
        status: 'todo',
        category: 'marketing',
        tags: ['strategy', 'objectives', 'important'],
        estimatedDuration: 90,
        completed: false
      },
      {
        title: 'Recherche et analyse de la concurrence',
        description: 'Analyser les campagnes concurrentes et identifier les opportunités',
        priority: 'medium',
        status: 'todo',
        category: 'marketing',
        tags: ['research', 'competition'],
        estimatedDuration: 120,
        completed: false
      },
      {
        title: 'Création du contenu créatif',
        description: 'Développer les visuels, textes et vidéos',
        priority: 'high',
        status: 'todo',
        category: 'marketing',
        tags: ['creative', 'content', 'urgent'],
        estimatedDuration: 240,
        completed: false
      },
      {
        title: 'Configuration des canaux de diffusion',
        description: 'Paramétrer les plateformes de publication',
        priority: 'high',
        status: 'todo',
        category: 'marketing',
        tags: ['setup', 'channels', 'urgent'],
        estimatedDuration: 60,
        completed: false
      },
      {
        title: 'Tests A/B des créatifs',
        description: 'Tester différentes versions du contenu',
        priority: 'medium',
        status: 'todo',
        category: 'marketing',
        tags: ['testing', 'optimization'],
        estimatedDuration: 90,
        completed: false
      },
      {
        title: 'Lancement de la campagne',
        description: 'Publier et activer la campagne sur tous les canaux',
        priority: 'high',
        status: 'todo',
        category: 'marketing',
        tags: ['launch', 'urgent'],
        estimatedDuration: 30,
        completed: false
      },
      {
        title: 'Monitoring et optimisation',
        description: 'Suivre les performances et ajuster si nécessaire',
        priority: 'medium',
        status: 'todo',
        category: 'marketing',
        tags: ['monitoring', 'optimization'],
        estimatedDuration: 60,
        completed: false
      }
    ],
    settings: {
      wipLimits: { 'Création': 2, 'Révision': 3 },
      autoAssignQuadrants: true,
      defaultPriority: 'medium'
    },
    tags: ['marketing', 'campaign', 'digital'],
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'marketing-content-calendar',
    name: 'Calendrier de Contenu',
    description: 'Organisation mensuelle du contenu sur les réseaux sociaux',
    category: 'marketing',
    type: 'kanban',
    columns: ['Idées', 'Planification', 'Création', 'Révision', 'Programmé', 'Publié'],
    tasks: [
      {
        title: 'Brainstorming thématiques mensuelles',
        description: 'Définir les thèmes et sujets du mois',
        priority: 'high',
        status: 'todo',
        category: 'marketing',
        tags: ['planning', 'themes'],
        estimatedDuration: 60,
        completed: false
      },
      {
        title: 'Création de 10 posts Instagram',
        description: 'Développer le contenu visuel et textuel',
        priority: 'medium',
        status: 'todo',
        category: 'marketing',
        tags: ['instagram', 'content'],
        estimatedDuration: 180,
        completed: false
      },
      {
        title: 'Rédaction de 5 articles de blog',
        description: 'Écrire des articles de fond pour le blog',
        priority: 'medium',
        status: 'todo',
        category: 'marketing',
        tags: ['blog', 'articles'],
        estimatedDuration: 300,
        completed: false
      },
      {
        title: 'Programmation des publications',
        description: 'Planifier les dates et heures de publication',
        priority: 'low',
        status: 'todo',
        category: 'marketing',
        tags: ['scheduling', 'automation'],
        estimatedDuration: 45,
        completed: false
      }
    ],
    settings: {
      wipLimits: { 'Création': 5, 'Révision': 3 },
      defaultPriority: 'medium'
    },
    tags: ['marketing', 'content', 'social-media'],
    createdAt: new Date().toISOString(),
    isDefault: true
  }
];

// Templates prédéfinis pour le management
const MANAGEMENT_TEMPLATES: ProductivityTemplate[] = [
  {
    id: 'management-team-onboarding',
    name: 'Onboarding Équipe',
    description: 'Processus d\'intégration pour nouveaux membres d\'équipe',
    category: 'management',
    type: 'eisenhower',
    tasks: [
      {
        title: 'Préparation du poste de travail',
        description: 'Setup matériel et accès systèmes',
        priority: 'high',
        status: 'todo',
        category: 'management',
        tags: ['setup', 'urgent', 'important'],
        estimatedDuration: 60,
        completed: false
      },
      {
        title: 'Session d\'accueil et présentation équipe',
        description: 'Présenter l\'équipe et la culture d\'entreprise',
        priority: 'high',
        status: 'todo',
        category: 'management',
        tags: ['welcome', 'team', 'important'],
        estimatedDuration: 90,
        completed: false
      },
      {
        title: 'Formation aux outils et processus',
        description: 'Former sur les outils et méthodologies utilisés',
        priority: 'medium',
        status: 'todo',
        category: 'management',
        tags: ['training', 'tools'],
        estimatedDuration: 180,
        completed: false
      },
      {
        title: 'Définition des objectifs à 30/60/90 jours',
        description: 'Établir les objectifs progressifs',
        priority: 'medium',
        status: 'todo',
        category: 'management',
        tags: ['objectives', 'planning'],
        estimatedDuration: 60,
        completed: false
      },
      {
        title: 'Suivi hebdomadaire premier mois',
        description: 'Points réguliers pour accompagner l\'intégration',
        priority: 'low',
        status: 'todo',
        category: 'management',
        tags: ['follow-up', 'support'],
        estimatedDuration: 30,
        completed: false
      }
    ],
    settings: {
      autoAssignQuadrants: true,
      defaultPriority: 'high'
    },
    tags: ['management', 'onboarding', 'hr'],
    createdAt: new Date().toISOString(),
    isDefault: true
  }
];

// Templates prédéfinis pour usage personnel
const PERSONAL_TEMPLATES: ProductivityTemplate[] = [
  {
    id: 'personal-weekly-review',
    name: 'Revue Hebdomadaire Personnelle',
    description: 'Template pour organiser sa semaine et faire le bilan',
    category: 'personal',
    type: 'eisenhower',
    tasks: [
      {
        title: 'Bilan de la semaine écoulée',
        description: 'Analyser les réussites et points d\'amélioration',
        priority: 'medium',
        status: 'todo',
        category: 'personal',
        tags: ['review', 'reflection'],
        estimatedDuration: 30,
        completed: false
      },
      {
        title: 'Planification des priorités de la semaine',
        description: 'Définir les 3 objectifs principaux',
        priority: 'high',
        status: 'todo',
        category: 'personal',
        tags: ['planning', 'priorities', 'important'],
        estimatedDuration: 45,
        completed: false
      },
      {
        title: 'Organisation du calendrier',
        description: 'Bloquer les créneaux pour les tâches importantes',
        priority: 'medium',
        status: 'todo',
        category: 'personal',
        tags: ['calendar', 'time-blocking'],
        estimatedDuration: 20,
        completed: false
      },
      {
        title: 'Préparation des réunions importantes',
        description: 'Préparer les points clés des réunions de la semaine',
        priority: 'medium',
        status: 'todo',
        category: 'personal',
        tags: ['meetings', 'preparation'],
        estimatedDuration: 60,
        completed: false
      }
    ],
    settings: {
      autoAssignQuadrants: true,
      defaultPriority: 'medium'
    },
    tags: ['personal', 'planning', 'productivity'],
    createdAt: new Date().toISOString(),
    isDefault: true
  }
];

// Toutes les catégories de templates
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'development',
    name: 'Développement',
    description: 'Templates pour les équipes de développement logiciel',
    icon: 'Code',
    templates: DEVELOPMENT_TEMPLATES
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Templates pour les campagnes et stratégies marketing',
    icon: 'TrendingUp',
    templates: MARKETING_TEMPLATES
  },
  {
    id: 'management',
    name: 'Management',
    description: 'Templates pour la gestion d\'équipe et les processus RH',
    icon: 'Users',
    templates: MANAGEMENT_TEMPLATES
  },
  {
    id: 'personal',
    name: 'Personnel',
    description: 'Templates pour l\'organisation personnelle et la productivité',
    icon: 'User',
    templates: PERSONAL_TEMPLATES
  }
];

// Fonctions utilitaires pour la gestion des templates
export class TemplateManager {
  private static STORAGE_KEY = 'productivity-templates';
  private static CUSTOM_TEMPLATES_KEY = 'custom-productivity-templates';

  /**
   * Récupère tous les templates disponibles (par défaut + personnalisés)
   */
  static getAllTemplates(): TemplateCategory[] {
    const customTemplates = this.getCustomTemplates();
    const categories = [...TEMPLATE_CATEGORIES];
    
    if (customTemplates.length > 0) {
      const customCategory: TemplateCategory = {
        id: 'custom',
        name: 'Personnalisés',
        description: 'Vos templates personnalisés',
        icon: 'Star',
        templates: customTemplates
      };
      categories.push(customCategory);
    }
    
    return categories;
  }

  /**
   * Récupère les templates personnalisés depuis le localStorage
   */
  static getCustomTemplates(): ProductivityTemplate[] {
    try {
      const stored = localStorage.getItem(this.CUSTOM_TEMPLATES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des templates personnalisés:', error);
      return [];
    }
  }

  /**
   * Sauvegarde un template personnalisé
   */
  static saveCustomTemplate(template: Omit<ProductivityTemplate, 'id' | 'createdAt' | 'isDefault'>): ProductivityTemplate {
    const customTemplates = this.getCustomTemplates();
    const newTemplate: ProductivityTemplate = {
      ...template,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isDefault: false,
      category: 'custom'
    };
    
    customTemplates.push(newTemplate);
    localStorage.setItem(this.CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
    
    return newTemplate;
  }

  /**
   * Supprime un template personnalisé
   */
  static deleteCustomTemplate(templateId: string): boolean {
    try {
      const customTemplates = this.getCustomTemplates();
      const filteredTemplates = customTemplates.filter(t => t.id !== templateId);
      localStorage.setItem(this.CUSTOM_TEMPLATES_KEY, JSON.stringify(filteredTemplates));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du template:', error);
      return false;
    }
  }

  /**
   * Trouve un template par son ID
   */
  static getTemplateById(templateId: string): ProductivityTemplate | null {
    const allCategories = this.getAllTemplates();
    for (const category of allCategories) {
      const template = category.templates.find(t => t.id === templateId);
      if (template) return template;
    }
    return null;
  }

  /**
   * Applique un template en créant les tâches correspondantes
   */
  static applyTemplate(template: ProductivityTemplate): Task[] {
    return template.tasks.map((taskTemplate, index) => ({
      ...taskTemplate,
      id: `${template.id}-task-${index}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * Crée un template à partir d'une liste de tâches existantes
   */
  static createTemplateFromTasks(
    tasks: Task[],
    templateInfo: {
      name: string;
      description: string;
      type: ProductivityTemplate['type'];
      columns?: string[];
      settings?: ProductivityTemplate['settings'];
      category?: ProductivityTemplate['category'];
    }
  ): ProductivityTemplate {
    const templateTasks = tasks.map(task => {
      const { id, createdAt, updatedAt, ...taskWithoutIds } = task;
      return {
        ...taskWithoutIds,
        completed: false, // Reset completion status for template
        status: 'todo' as const
      };
    });

    return this.saveCustomTemplate({
      ...templateInfo,
      category: templateInfo.category || 'custom',
      tasks: templateTasks,
      tags: [...new Set(tasks.flatMap(t => t.tags))], // Unique tags from all tasks
      author: 'User'
    });
  }

  /**
   * Recherche des templates par mots-clés
   */
  static searchTemplates(query: string): ProductivityTemplate[] {
    const allCategories = this.getAllTemplates();
    const allTemplates = allCategories.flatMap(cat => cat.templates);
    
    const searchTerms = query.toLowerCase().split(' ');
    
    return allTemplates.filter(template => {
      const searchableText = `${template.name} ${template.description} ${template.tags.join(' ')}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  /**
   * Exporte les templates personnalisés
   */
  static exportCustomTemplates(): string {
    const customTemplates = this.getCustomTemplates();
    return JSON.stringify(customTemplates, null, 2);
  }

  /**
   * Importe des templates personnalisés
   */
  static importCustomTemplates(jsonData: string): boolean {
    try {
      const templates = JSON.parse(jsonData) as ProductivityTemplate[];
      const currentCustom = this.getCustomTemplates();
      const merged = [...currentCustom, ...templates];
      localStorage.setItem(this.CUSTOM_TEMPLATES_KEY, JSON.stringify(merged));
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation des templates:', error);
      return false;
    }
  }
}