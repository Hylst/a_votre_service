/**
 * presetLibrary.ts - Comprehensive library of task presets organized by categories
 * Contains predefined tasks, objectives, and pomodoro sessions for productivity tools
 */

import { PresetLibrary, PresetCategory, TaskPreset, ObjectivePreset, PomodoroPreset } from '../types/taskPresets';

// Categories for organizing presets
export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: 'work',
    name: 'Travail & Carrière',
    description: 'Tâches professionnelles et développement de carrière',
    icon: '💼',
    color: 'bg-blue-100 text-blue-800',
    subcategories: [
      { id: 'meetings', name: 'Réunions', icon: '🤝' },
      { id: 'projects', name: 'Projets', icon: '📊' },
      { id: 'admin', name: 'Administratif', icon: '📋' },
      { id: 'development', name: 'Développement', icon: '💻' }
    ]
  },
  {
    id: 'personal',
    name: 'Personnel & Bien-être',
    description: 'Développement personnel et santé',
    icon: '🌱',
    color: 'bg-green-100 text-green-800',
    subcategories: [
      { id: 'health', name: 'Santé', icon: '❤️' },
      { id: 'fitness', name: 'Sport', icon: '💪' },
      { id: 'mindfulness', name: 'Bien-être mental', icon: '🧘' },
      { id: 'learning', name: 'Apprentissage', icon: '📚' }
    ]
  },
  {
    id: 'home',
    name: 'Maison & Famille',
    description: 'Tâches domestiques et familiales',
    icon: '🏠',
    color: 'bg-orange-100 text-orange-800',
    subcategories: [
      { id: 'cleaning', name: 'Ménage', icon: '🧹' },
      { id: 'maintenance', name: 'Entretien', icon: '🔧' },
      { id: 'family', name: 'Famille', icon: '👨‍👩‍👧‍👦' },
      { id: 'cooking', name: 'Cuisine', icon: '👨‍🍳' }
    ]
  },
  {
    id: 'finance',
    name: 'Finance & Budget',
    description: 'Gestion financière et budgétaire',
    icon: '💰',
    color: 'bg-emerald-100 text-emerald-800',
    subcategories: [
      { id: 'budget', name: 'Budget', icon: '📊' },
      { id: 'investments', name: 'Investissements', icon: '📈' },
      { id: 'taxes', name: 'Impôts', icon: '🧾' },
      { id: 'shopping', name: 'Achats', icon: '🛒' }
    ]
  },
  {
    id: 'creative',
    name: 'Créatif & Loisirs',
    description: 'Projets créatifs et activités de loisir',
    icon: '🎨',
    color: 'bg-purple-100 text-purple-800',
    subcategories: [
      { id: 'art', name: 'Art', icon: '🖼️' },
      { id: 'music', name: 'Musique', icon: '🎵' },
      { id: 'writing', name: 'Écriture', icon: '✍️' },
      { id: 'hobbies', name: 'Loisirs', icon: '🎯' }
    ]
  },
  {
    id: 'social',
    name: 'Social & Événements',
    description: 'Relations sociales et organisation d\'événements',
    icon: '👥',
    color: 'bg-pink-100 text-pink-800',
    subcategories: [
      { id: 'events', name: 'Événements', icon: '🎉' },
      { id: 'relationships', name: 'Relations', icon: '💕' },
      { id: 'networking', name: 'Réseautage', icon: '🤝' },
      { id: 'travel', name: 'Voyage', icon: '✈️' }
    ]
  },
  {
    id: 'todo-list',
    name: 'To-Do List Spécialisée',
    description: 'Listes de tâches organisées par contexte et priorité',
    icon: '📝',
    color: 'bg-indigo-100 text-indigo-800',
    subcategories: [
      { id: 'daily', name: 'Quotidien', icon: '☀️' },
      { id: 'weekly', name: 'Hebdomadaire', icon: '📅' },
      { id: 'urgent', name: 'Urgent', icon: '🚨' },
      { id: 'context', name: 'Par Contexte', icon: '📍' }
    ]
  },
  {
    id: 'advanced-tasks',
    name: 'Gestionnaire de Tâches Avancé',
    description: 'Tâches complexes avec dépendances et workflows',
    icon: '⚙️',
    color: 'bg-slate-100 text-slate-800',
    subcategories: [
      { id: 'workflows', name: 'Workflows', icon: '🔄' },
      { id: 'dependencies', name: 'Dépendances', icon: '🔗' },
      { id: 'automation', name: 'Automatisation', icon: '🤖' },
      { id: 'templates', name: 'Modèles', icon: '📋' }
    ]
  },
  {
    id: 'advanced-goals',
    name: 'Objectifs Avancés',
    description: 'Objectifs stratégiques avec métriques et jalons',
    icon: '🎯',
    color: 'bg-amber-100 text-amber-800',
    subcategories: [
      { id: 'strategic', name: 'Stratégiques', icon: '🏆' },
      { id: 'okr', name: 'OKR', icon: '📊' },
      { id: 'kpi', name: 'KPI', icon: '📈' },
      { id: 'milestones', name: 'Jalons', icon: '🚩' }
    ]
  }
];

// Task presets
export const TASK_PRESETS: TaskPreset[] = [
  // Work & Career
  {
    id: 'daily-standup',
    type: 'task',
    title: 'Daily Standup Meeting',
    description: 'Réunion quotidienne d\'équipe pour synchroniser les tâches',
    category: 'work',
    subcategory: 'meetings',
    tags: ['réunion', 'équipe', 'quotidien'],
    priority: 'medium',
    estimatedDuration: 15,
    icon: '🤝',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'code-review',
    type: 'task',
    title: 'Code Review',
    description: 'Révision du code des collègues',
    category: 'work',
    subcategory: 'development',
    tags: ['code', 'révision', 'qualité'],
    priority: 'high',
    estimatedDuration: 45,
    icon: '👀',
    subtasks: [
      'Vérifier la logique métier',
      'Contrôler les tests unitaires',
      'Valider les conventions de code',
      'Laisser des commentaires constructifs'
    ]
  },
  {
    id: 'weekly-report',
    type: 'task',
    title: 'Rapport hebdomadaire',
    description: 'Rédiger le rapport d\'activité de la semaine',
    category: 'work',
    subcategory: 'admin',
    tags: ['rapport', 'hebdomadaire', 'suivi'],
    priority: 'medium',
    estimatedDuration: 30,
    icon: '📊',
    dueDate: '+1w',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },
  {
    id: 'project-planning',
    type: 'task',
    title: 'Planification de projet',
    description: 'Définir les étapes et ressources nécessaires',
    category: 'work',
    subcategory: 'projects',
    tags: ['planification', 'projet', 'organisation'],
    priority: 'high',
    estimatedDuration: 120,
    icon: '📋',
    subtasks: [
      'Définir les objectifs du projet',
      'Identifier les parties prenantes',
      'Estimer les ressources nécessaires',
      'Créer le planning détaillé',
      'Définir les critères de succès'
    ]
  },

  // Personal & Well-being
  {
    id: 'morning-routine',
    type: 'task',
    title: 'Routine matinale',
    description: 'Routine pour bien commencer la journée',
    category: 'personal',
    subcategory: 'health',
    tags: ['routine', 'matin', 'bien-être'],
    priority: 'high',
    estimatedDuration: 45,
    icon: '🌅',
    recurring: { enabled: true, frequency: 'daily', interval: 1 },
    subtasks: [
      'Méditation 10 minutes',
      'Exercices d\'étirement',
      'Petit-déjeuner équilibré',
      'Planifier la journée'
    ]
  },
  {
    id: 'workout-session',
    type: 'task',
    title: 'Séance de sport',
    description: 'Entraînement physique régulier',
    category: 'personal',
    subcategory: 'fitness',
    tags: ['sport', 'santé', 'exercice'],
    priority: 'medium',
    estimatedDuration: 60,
    icon: '💪',
    recurring: { enabled: true, frequency: 'weekly', interval: 3 }
  },
  {
    id: 'read-book',
    type: 'task',
    title: 'Lecture quotidienne',
    description: 'Lire 20-30 pages d\'un livre',
    category: 'personal',
    subcategory: 'learning',
    tags: ['lecture', 'apprentissage', 'développement'],
    priority: 'medium',
    estimatedDuration: 30,
    icon: '📚',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },

  // Home & Family
  {
    id: 'weekly-cleaning',
    type: 'task',
    title: 'Ménage hebdomadaire',
    description: 'Grand nettoyage de la maison',
    category: 'home',
    subcategory: 'cleaning',
    tags: ['ménage', 'nettoyage', 'maison'],
    priority: 'medium',
    estimatedDuration: 120,
    icon: '🧹',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 },
    subtasks: [
      'Aspirer tous les sols',
      'Nettoyer les salles de bain',
      'Dépoussiérer les meubles',
      'Laver les sols',
      'Changer les draps'
    ]
  },
  {
    id: 'meal-prep',
    type: 'task',
    title: 'Préparation des repas',
    description: 'Préparer les repas pour la semaine',
    category: 'home',
    subcategory: 'cooking',
    tags: ['cuisine', 'préparation', 'repas'],
    priority: 'medium',
    estimatedDuration: 90,
    icon: '👨‍🍳',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },

  // Finance & Budget
  {
    id: 'monthly-budget-review',
    type: 'task',
    title: 'Révision budget mensuel',
    description: 'Analyser les dépenses et revenus du mois',
    category: 'finance',
    subcategory: 'budget',
    tags: ['budget', 'finance', 'analyse'],
    priority: 'high',
    estimatedDuration: 60,
    icon: '📊',
    recurring: { enabled: true, frequency: 'monthly', interval: 1 },
    subtasks: [
      'Collecter tous les relevés',
      'Catégoriser les dépenses',
      'Comparer avec le budget prévisionnel',
      'Identifier les écarts',
      'Ajuster le budget suivant'
    ]
  },
  {
    id: 'grocery-shopping',
    type: 'task',
    title: 'Courses alimentaires',
    description: 'Faire les courses de la semaine',
    category: 'finance',
    subcategory: 'shopping',
    tags: ['courses', 'alimentation', 'budget'],
    priority: 'medium',
    estimatedDuration: 45,
    icon: '🛒',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },

  // Creative & Hobbies
  {
    id: 'creative-writing',
    type: 'task',
    title: 'Écriture créative',
    description: 'Session d\'écriture créative quotidienne',
    category: 'creative',
    subcategory: 'writing',
    tags: ['écriture', 'créativité', 'expression'],
    priority: 'low',
    estimatedDuration: 30,
    icon: '✍️',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'photo-editing',
    type: 'task',
    title: 'Retouche photo',
    description: 'Éditer et organiser les photos récentes',
    category: 'creative',
    subcategory: 'art',
    tags: ['photo', 'retouche', 'créatif'],
    priority: 'low',
    estimatedDuration: 60,
    icon: '📸'
  },

  // Social & Events
  {
    id: 'call-family',
    type: 'task',
    title: 'Appeler la famille',
    description: 'Prendre des nouvelles de la famille',
    category: 'social',
    subcategory: 'relationships',
    tags: ['famille', 'contact', 'relations'],
    priority: 'medium',
    estimatedDuration: 30,
    icon: '📞',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },
  {
    id: 'plan-weekend',
    type: 'task',
    title: 'Planifier le weekend',
    description: 'Organiser les activités du weekend',
    category: 'social',
    subcategory: 'events',
    tags: ['weekend', 'planification', 'loisirs'],
    priority: 'low',
    estimatedDuration: 15,
    icon: '📅',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },

  // Additional Work & Career Tasks
  {
    id: 'client-follow-up',
    type: 'task',
    title: 'Suivi client',
    description: 'Contacter les clients pour le suivi des projets',
    category: 'work',
    subcategory: 'admin',
    tags: ['client', 'suivi', 'relation'],
    priority: 'high',
    estimatedDuration: 30,
    icon: '📞',
    recurring: { enabled: true, frequency: 'weekly', interval: 2 }
  },
  {
    id: 'team-retrospective',
    type: 'task',
    title: 'Rétrospective équipe',
    description: 'Analyser les performances de l\'équipe et identifier les améliorations',
    category: 'work',
    subcategory: 'meetings',
    tags: ['équipe', 'rétrospective', 'amélioration'],
    priority: 'medium',
    estimatedDuration: 60,
    icon: '🔄',
    recurring: { enabled: true, frequency: 'monthly', interval: 1 }
  },
  {
    id: 'documentation-update',
    type: 'task',
    title: 'Mise à jour documentation',
    description: 'Mettre à jour la documentation technique du projet',
    category: 'work',
    subcategory: 'development',
    tags: ['documentation', 'technique', 'mise à jour'],
    priority: 'medium',
    estimatedDuration: 90,
    icon: '📝'
  },
  {
    id: 'performance-review',
    type: 'task',
    title: 'Évaluation performance',
    description: 'Préparer l\'évaluation annuelle de performance',
    category: 'work',
    subcategory: 'admin',
    tags: ['évaluation', 'performance', 'carrière'],
    priority: 'high',
    estimatedDuration: 120,
    icon: '📊',
    dueDate: '+1m'
  },
  {
    id: 'skill-assessment',
    type: 'task',
    title: 'Évaluation compétences',
    description: 'Faire le bilan de ses compétences techniques',
    category: 'work',
    subcategory: 'development',
    tags: ['compétences', 'évaluation', 'développement'],
    priority: 'medium',
    estimatedDuration: 45,
    icon: '🎯'
  },
  {
    id: 'network-maintenance',
    type: 'task',
    title: 'Maintenance réseau',
    description: 'Vérifier et maintenir l\'infrastructure réseau',
    category: 'work',
    subcategory: 'development',
    tags: ['réseau', 'maintenance', 'infrastructure'],
    priority: 'medium',
    estimatedDuration: 75,
    icon: '🔧',
    recurring: { enabled: true, frequency: 'monthly', interval: 1 }
  },
  {
    id: 'backup-verification',
    type: 'task',
    title: 'Vérification sauvegardes',
    description: 'Contrôler l\'intégrité des sauvegardes système',
    category: 'work',
    subcategory: 'admin',
    tags: ['sauvegarde', 'vérification', 'sécurité'],
    priority: 'high',
    estimatedDuration: 30,
    icon: '💾',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },
  {
    id: 'security-audit',
    type: 'task',
    title: 'Audit sécurité',
    description: 'Effectuer un audit de sécurité des systèmes',
    category: 'work',
    subcategory: 'development',
    tags: ['sécurité', 'audit', 'système'],
    priority: 'high',
    estimatedDuration: 180,
    icon: '🔒',
    recurring: { enabled: true, frequency: 'monthly', interval: 3 }
  },
  {
    id: 'vendor-meeting',
    type: 'task',
    title: 'Réunion fournisseur',
    description: 'Rencontrer les fournisseurs pour négocier les contrats',
    category: 'work',
    subcategory: 'meetings',
    tags: ['fournisseur', 'négociation', 'contrat'],
    priority: 'medium',
    estimatedDuration: 90,
    icon: '🤝'
  },
  {
    id: 'training-session',
    type: 'task',
    title: 'Session formation',
    description: 'Participer à une session de formation professionnelle',
    category: 'work',
    subcategory: 'development',
    tags: ['formation', 'apprentissage', 'professionnel'],
    priority: 'medium',
    estimatedDuration: 240,
    icon: '🎓'
  },
  {
    id: 'inventory-check',
    type: 'task',
    title: 'Contrôle inventaire',
    description: 'Vérifier l\'inventaire du matériel informatique',
    category: 'work',
    subcategory: 'admin',
    tags: ['inventaire', 'matériel', 'contrôle'],
    priority: 'low',
    estimatedDuration: 60,
    icon: '📦',
    recurring: { enabled: true, frequency: 'monthly', interval: 6 }
  },
  {
    id: 'database-optimization',
    type: 'task',
    title: 'Optimisation base de données',
    description: 'Optimiser les performances de la base de données',
    category: 'work',
    subcategory: 'development',
    tags: ['base de données', 'optimisation', 'performance'],
    priority: 'medium',
    estimatedDuration: 120,
    icon: '🗄️'
  },

  // Additional Personal & Well-being Tasks
  {
    id: 'evening-routine',
    type: 'task',
    title: 'Routine du soir',
    description: 'Routine pour bien terminer la journée',
    category: 'personal',
    subcategory: 'health',
    tags: ['routine', 'soir', 'détente'],
    priority: 'medium',
    estimatedDuration: 30,
    icon: '🌙',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'hydration-tracking',
    type: 'task',
    title: 'Suivi hydratation',
    description: 'Suivre sa consommation d\'eau quotidienne',
    category: 'personal',
    subcategory: 'health',
    tags: ['hydratation', 'santé', 'suivi'],
    priority: 'low',
    estimatedDuration: 5,
    icon: '💧',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'stretching-session',
    type: 'task',
    title: 'Session étirements',
    description: 'Faire des étirements pour la flexibilité',
    category: 'personal',
    subcategory: 'fitness',
    tags: ['étirements', 'flexibilité', 'bien-être'],
    priority: 'medium',
    estimatedDuration: 20,
    icon: '🤸',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'journal-writing',
    type: 'task',
    title: 'Écriture journal',
    description: 'Tenir un journal personnel quotidien',
    category: 'personal',
    subcategory: 'mindfulness',
    tags: ['journal', 'réflexion', 'écriture'],
    priority: 'low',
    estimatedDuration: 15,
    icon: '📔',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'vitamin-intake',
    type: 'task',
    title: 'Prise vitamines',
    description: 'Prendre ses vitamines et compléments alimentaires',
    category: 'personal',
    subcategory: 'health',
    tags: ['vitamines', 'santé', 'compléments'],
    priority: 'medium',
    estimatedDuration: 2,
    icon: '💊',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'sleep-tracking',
    type: 'task',
    title: 'Suivi sommeil',
    description: 'Analyser la qualité de son sommeil',
    category: 'personal',
    subcategory: 'health',
    tags: ['sommeil', 'suivi', 'santé'],
    priority: 'low',
    estimatedDuration: 10,
    icon: '😴',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'language-practice',
    type: 'task',
    title: 'Pratique langue',
    description: 'Pratiquer une langue étrangère',
    category: 'personal',
    subcategory: 'learning',
    tags: ['langue', 'apprentissage', 'pratique'],
    priority: 'medium',
    estimatedDuration: 25,
    icon: '🗣️',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'podcast-listening',
    type: 'task',
    title: 'Écoute podcast',
    description: 'Écouter un podcast éducatif ou inspirant',
    category: 'personal',
    subcategory: 'learning',
    tags: ['podcast', 'éducation', 'inspiration'],
    priority: 'low',
    estimatedDuration: 45,
    icon: '🎧',
    recurring: { enabled: true, frequency: 'weekly', interval: 3 }
  },
  {
    id: 'goal-review',
    type: 'task',
    title: 'Révision objectifs',
    description: 'Revoir et ajuster ses objectifs personnels',
    category: 'personal',
    subcategory: 'mindfulness',
    tags: ['objectifs', 'révision', 'planification'],
    priority: 'medium',
    estimatedDuration: 30,
    icon: '🎯',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },
  {
    id: 'nature-walk',
    type: 'task',
    title: 'Promenade nature',
    description: 'Faire une promenade dans la nature',
    category: 'personal',
    subcategory: 'fitness',
    tags: ['nature', 'promenade', 'détente'],
    priority: 'low',
    estimatedDuration: 60,
    icon: '🌳',
    recurring: { enabled: true, frequency: 'weekly', interval: 2 }
  },
  {
    id: 'breathing-exercise',
    type: 'task',
    title: 'Exercices respiration',
    description: 'Pratiquer des exercices de respiration',
    category: 'personal',
    subcategory: 'mindfulness',
    tags: ['respiration', 'relaxation', 'bien-être'],
    priority: 'medium',
    estimatedDuration: 10,
    icon: '🫁',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'skill-practice',
    type: 'task',
    title: 'Pratique compétence',
    description: 'Pratiquer une compétence en cours d\'apprentissage',
    category: 'personal',
    subcategory: 'learning',
    tags: ['compétence', 'pratique', 'amélioration'],
    priority: 'medium',
    estimatedDuration: 45,
    icon: '🎯',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },

  // Additional Home & Family Tasks
  {
    id: 'laundry-day',
    type: 'task',
    title: 'Jour de lessive',
    description: 'Faire la lessive et plier le linge',
    category: 'home',
    subcategory: 'cleaning',
    tags: ['lessive', 'linge', 'ménage'],
    priority: 'medium',
    estimatedDuration: 90,
    icon: '👕',
    recurring: { enabled: true, frequency: 'weekly', interval: 2 }
  },
  {
    id: 'garden-maintenance',
    type: 'task',
    title: 'Entretien jardin',
    description: 'Arroser et entretenir les plantes',
    category: 'home',
    subcategory: 'maintenance',
    tags: ['jardin', 'plantes', 'entretien'],
    priority: 'medium',
    estimatedDuration: 45,
    icon: '🌱',
    recurring: { enabled: true, frequency: 'weekly', interval: 2 }
  },
  {
    id: 'car-maintenance',
    type: 'task',
    title: 'Entretien voiture',
    description: 'Vérifier et entretenir le véhicule',
    category: 'home',
    subcategory: 'maintenance',
    tags: ['voiture', 'entretien', 'maintenance'],
    priority: 'medium',
    estimatedDuration: 60,
    icon: '🚗',
    recurring: { enabled: true, frequency: 'monthly', interval: 1 }
  },
  {
    id: 'organize-closet',
    type: 'task',
    title: 'Organiser placard',
    description: 'Trier et organiser les vêtements',
    category: 'home',
    subcategory: 'cleaning',
    tags: ['organisation', 'vêtements', 'tri'],
    priority: 'low',
    estimatedDuration: 120,
    icon: '👔',
    recurring: { enabled: true, frequency: 'monthly', interval: 3 }
  },
  {
    id: 'deep-cleaning',
    type: 'task',
    title: 'Nettoyage approfondi',
    description: 'Nettoyage en profondeur d\'une pièce',
    category: 'home',
    subcategory: 'cleaning',
    tags: ['nettoyage', 'profondeur', 'ménage'],
    priority: 'medium',
    estimatedDuration: 180,
    icon: '🧽',
    recurring: { enabled: true, frequency: 'monthly', interval: 1 }
  },
  {
    id: 'home-repairs',
    type: 'task',
    title: 'Réparations maison',
    description: 'Effectuer les petites réparations nécessaires',
    category: 'home',
    subcategory: 'maintenance',
    tags: ['réparation', 'bricolage', 'maintenance'],
    priority: 'medium',
    estimatedDuration: 90,
    icon: '🔨'
  },
  {
    id: 'family-activity',
    type: 'task',
    title: 'Activité familiale',
    description: 'Organiser une activité avec la famille',
    category: 'home',
    subcategory: 'family',
    tags: ['famille', 'activité', 'loisir'],
    priority: 'high',
    estimatedDuration: 120,
    icon: '👨‍👩‍👧‍👦',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },
  {
    id: 'recipe-planning',
    type: 'task',
    title: 'Planification recettes',
    description: 'Planifier les repas de la semaine',
    category: 'home',
    subcategory: 'cooking',
    tags: ['recettes', 'planification', 'repas'],
    priority: 'medium',
    estimatedDuration: 30,
    icon: '📋',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },
  {
    id: 'pet-care',
    type: 'task',
    title: 'Soins animaux',
    description: 'Prendre soin des animaux domestiques',
    category: 'home',
    subcategory: 'family',
    tags: ['animaux', 'soins', 'domestique'],
    priority: 'high',
    estimatedDuration: 30,
    icon: '🐕',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'utility-bills',
    type: 'task',
    title: 'Factures services',
    description: 'Payer les factures de services publics',
    category: 'home',
    subcategory: 'maintenance',
    tags: ['factures', 'services', 'paiement'],
    priority: 'high',
    estimatedDuration: 20,
    icon: '💡',
    recurring: { enabled: true, frequency: 'monthly', interval: 1 }
  },
  {
    id: 'emergency-kit',
    type: 'task',
    title: 'Kit urgence',
    description: 'Vérifier et mettre à jour le kit d\'urgence',
    category: 'home',
    subcategory: 'maintenance',
    tags: ['urgence', 'sécurité', 'préparation'],
    priority: 'medium',
    estimatedDuration: 45,
    icon: '🚨',
    recurring: { enabled: true, frequency: 'monthly', interval: 6 }
  },
  {
    id: 'seasonal-decoration',
    type: 'task',
    title: 'Décoration saisonnière',
    description: 'Changer la décoration selon la saison',
    category: 'home',
    subcategory: 'maintenance',
    tags: ['décoration', 'saison', 'ambiance'],
    priority: 'low',
    estimatedDuration: 90,
    icon: '🎄',
    recurring: { enabled: true, frequency: 'monthly', interval: 3 }
  },

  // Additional Finance & Budget Tasks
  {
    id: 'investment-review',
    type: 'task',
    title: 'Révision investissements',
    description: 'Analyser la performance des investissements',
    category: 'finance',
    subcategory: 'investments',
    tags: ['investissement', 'analyse', 'performance'],
    priority: 'medium',
    estimatedDuration: 60,
    icon: '📈',
    recurring: { enabled: true, frequency: 'monthly', interval: 1 }
  },
  {
    id: 'tax-preparation',
    type: 'task',
    title: 'Préparation impôts',
    description: 'Rassembler les documents pour la déclaration',
    category: 'finance',
    subcategory: 'taxes',
    tags: ['impôts', 'déclaration', 'documents'],
    priority: 'high',
    estimatedDuration: 180,
    icon: '🧾',
    dueDate: '+2m'
  },
  {
    id: 'insurance-review',
    type: 'task',
    title: 'Révision assurances',
    description: 'Revoir les contrats d\'assurance',
    category: 'finance',
    subcategory: 'budget',
    tags: ['assurance', 'contrat', 'révision'],
    priority: 'medium',
    estimatedDuration: 90,
    icon: '🛡️',
    recurring: { enabled: true, frequency: 'monthly', interval: 12 }
  },
  {
    id: 'savings-goal',
    type: 'task',
    title: 'Objectif épargne',
    description: 'Suivre les progrès de l\'objectif d\'épargne',
    category: 'finance',
    subcategory: 'budget',
    tags: ['épargne', 'objectif', 'suivi'],
    priority: 'medium',
    estimatedDuration: 15,
    icon: '🏦',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },
  {
    id: 'expense-categorization',
    type: 'task',
    title: 'Catégorisation dépenses',
    description: 'Classer les dépenses par catégorie',
    category: 'finance',
    subcategory: 'budget',
    tags: ['dépenses', 'catégorie', 'organisation'],
    priority: 'medium',
    estimatedDuration: 30,
    icon: '📊',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },
  {
    id: 'price-comparison',
    type: 'task',
    title: 'Comparaison prix',
    description: 'Comparer les prix avant un achat important',
    category: 'finance',
    subcategory: 'shopping',
    tags: ['prix', 'comparaison', 'économie'],
    priority: 'medium',
    estimatedDuration: 45,
    icon: '🔍'
  },

  // Additional Creative & Hobbies Tasks
  {
    id: 'music-practice',
    type: 'task',
    title: 'Pratique musicale',
    description: 'Pratiquer un instrument de musique',
    category: 'creative',
    subcategory: 'music',
    tags: ['musique', 'instrument', 'pratique'],
    priority: 'medium',
    estimatedDuration: 45,
    icon: '🎹',
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'art-project',
    type: 'task',
    title: 'Projet artistique',
    description: 'Travailler sur un projet créatif',
    category: 'creative',
    subcategory: 'art',
    tags: ['art', 'créatif', 'projet'],
    priority: 'low',
    estimatedDuration: 90,
    icon: '🎨',
    recurring: { enabled: true, frequency: 'weekly', interval: 2 }
  },
  {
    id: 'blog-writing',
    type: 'task',
    title: 'Rédaction blog',
    description: 'Écrire un article de blog',
    category: 'creative',
    subcategory: 'writing',
    tags: ['blog', 'écriture', 'article'],
    priority: 'low',
    estimatedDuration: 120,
    icon: '📝',
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },
  {
    id: 'craft-project',
    type: 'task',
    title: 'Projet bricolage',
    description: 'Réaliser un projet de bricolage créatif',
    category: 'creative',
    subcategory: 'hobbies',
    tags: ['bricolage', 'créatif', 'manuel'],
    priority: 'low',
    estimatedDuration: 180,
    icon: '✂️'
  },
  {
    id: 'video-editing',
    type: 'task',
    title: 'Montage vidéo',
    description: 'Éditer et monter des vidéos personnelles',
    category: 'creative',
    subcategory: 'art',
    tags: ['vidéo', 'montage', 'édition'],
    priority: 'low',
    estimatedDuration: 120,
    icon: '🎬'
  },

  // Additional Social & Events Tasks
  {
    id: 'birthday-planning',
    type: 'task',
    title: 'Planification anniversaire',
    description: 'Organiser une fête d\'anniversaire',
    category: 'social',
    subcategory: 'events',
    tags: ['anniversaire', 'fête', 'organisation'],
    priority: 'high',
    estimatedDuration: 180,
    icon: '🎂'
  },
  {
    id: 'friend-meetup',
    type: 'task',
    title: 'Rencontre amis',
    description: 'Organiser une sortie avec des amis',
    category: 'social',
    subcategory: 'relationships',
    tags: ['amis', 'sortie', 'social'],
    priority: 'medium',
    estimatedDuration: 180,
    icon: '👫',
    recurring: { enabled: true, frequency: 'weekly', interval: 2 }
  },
  {
    id: 'networking-event',
    type: 'task',
    title: 'Événement networking',
    description: 'Participer à un événement de réseautage',
    category: 'social',
    subcategory: 'networking',
    tags: ['réseautage', 'professionnel', 'contacts'],
    priority: 'medium',
    estimatedDuration: 120,
    icon: '🤝',
    recurring: { enabled: true, frequency: 'monthly', interval: 1 }
  },
  {
    id: 'travel-planning',
    type: 'task',
    title: 'Planification voyage',
    description: 'Organiser un voyage ou une escapade',
    category: 'social',
    subcategory: 'travel',
    tags: ['voyage', 'planification', 'vacances'],
    priority: 'medium',
    estimatedDuration: 240,
    icon: '✈️'
  },
  {
    id: 'volunteer-work',
    type: 'task',
    title: 'Bénévolat',
    description: 'Participer à une activité bénévole',
    category: 'social',
    subcategory: 'relationships',
    tags: ['bénévolat', 'communauté', 'aide'],
    priority: 'medium',
    estimatedDuration: 120,
    icon: '🤲',
    recurring: { enabled: true, frequency: 'monthly', interval: 1 }
  },
  {
    id: 'community-event',
    type: 'task',
    title: 'Événement communautaire',
    description: 'Participer à un événement local',
    category: 'social',
    subcategory: 'events',
    tags: ['communauté', 'local', 'participation'],
    priority: 'low',
    estimatedDuration: 180,
    icon: '🏘️',
    recurring: { enabled: true, frequency: 'monthly', interval: 2 }
  },

  // To-Do List Spécialisée
  {
    id: 'morning-checklist',
    type: 'task',
    title: 'Checklist Matinale',
    description: 'Routine matinale pour bien commencer la journée',
    category: 'todo-list',
    subcategory: 'daily',
    tags: ['routine', 'matin', 'productivité'],
    priority: 'high',
    estimatedDuration: 30,
    icon: '☀️',
    subtasks: ['Méditation 10min', 'Révision objectifs du jour', 'Vérifier agenda', 'Préparer matériel'],
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },
  {
    id: 'urgent-tasks-triage',
    type: 'task',
    title: 'Triage des Tâches Urgentes',
    description: 'Identifier et prioriser les tâches urgentes',
    category: 'todo-list',
    subcategory: 'urgent',
    tags: ['urgent', 'priorisation', 'triage'],
    priority: 'high',
    estimatedDuration: 15,
    icon: '🚨',
    subtasks: ['Lister toutes les urgences', 'Évaluer impact/effort', 'Définir ordre de traitement']
  },
  {
    id: 'weekly-planning',
    type: 'task',
    title: 'Planification Hebdomadaire',
    description: 'Organiser les tâches et objectifs de la semaine',
    category: 'todo-list',
    subcategory: 'weekly',
    tags: ['planification', 'semaine', 'organisation'],
    priority: 'medium',
    estimatedDuration: 45,
    icon: '📅',
    subtasks: ['Réviser semaine précédente', 'Définir priorités', 'Bloquer créneaux', 'Prévoir imprévus'],
    recurring: { enabled: true, frequency: 'weekly', interval: 1 }
  },
  {
    id: 'context-work-tasks',
    type: 'task',
    title: 'Tâches Contexte Bureau',
    description: 'Liste des tâches à faire uniquement au bureau',
    category: 'todo-list',
    subcategory: 'context',
    tags: ['contexte', 'bureau', 'lieu'],
    priority: 'medium',
    estimatedDuration: 120,
    icon: '🏢',
    subtasks: ['Imprimer documents', 'Réunions en présentiel', 'Utiliser équipements spécialisés']
  },
  {
    id: 'context-home-tasks',
    type: 'task',
    title: 'Tâches Contexte Maison',
    description: 'Liste des tâches à faire à la maison',
    category: 'todo-list',
    subcategory: 'context',
    tags: ['contexte', 'maison', 'personnel'],
    priority: 'medium',
    estimatedDuration: 90,
    icon: '🏠',
    subtasks: ['Appels personnels', 'Tâches ménagères', 'Projets créatifs']
  },
  {
    id: 'energy-high-tasks',
    type: 'task',
    title: 'Tâches Haute Énergie',
    description: 'Tâches complexes nécessitant concentration maximale',
    category: 'todo-list',
    subcategory: 'context',
    tags: ['énergie', 'concentration', 'complexe'],
    priority: 'high',
    estimatedDuration: 180,
    icon: '⚡',
    subtasks: ['Analyse stratégique', 'Résolution problèmes', 'Création contenu']
  },
  {
    id: 'quick-wins-list',
    type: 'task',
    title: 'Liste Quick Wins',
    description: 'Petites tâches rapides pour maintenir momentum',
    category: 'todo-list',
    subcategory: 'daily',
    tags: ['rapide', 'momentum', 'efficacité'],
    priority: 'low',
    estimatedDuration: 30,
    icon: '⚡',
    subtasks: ['Répondre emails simples', 'Ranger bureau', 'Mettre à jour statuts']
  },
  {
    id: 'waiting-for-list',
    type: 'task',
    title: 'Liste En Attente',
    description: 'Suivi des tâches en attente de réponse/action externe',
    category: 'todo-list',
    subcategory: 'context',
    tags: ['attente', 'suivi', 'externe'],
    priority: 'medium',
    estimatedDuration: 20,
    icon: '⏳',
    subtasks: ['Relancer contacts', 'Vérifier statuts', 'Planifier suivis']
  },
  {
    id: 'someday-maybe-review',
    type: 'task',
    title: 'Révision Someday/Maybe',
    description: 'Révision périodique des idées et projets futurs',
    category: 'todo-list',
    subcategory: 'weekly',
    tags: ['révision', 'futur', 'idées'],
    priority: 'low',
    estimatedDuration: 30,
    icon: '💭',
    subtasks: ['Parcourir liste idées', 'Évaluer pertinence', 'Promouvoir en projets'],
    recurring: { enabled: true, frequency: 'weekly', interval: 2 }
  },
  {
    id: 'daily-shutdown-ritual',
    type: 'task',
    title: 'Rituel de Fin de Journée',
    description: 'Clôturer proprement la journée de travail',
    category: 'todo-list',
    subcategory: 'daily',
    tags: ['rituel', 'clôture', 'bilan'],
    priority: 'medium',
    estimatedDuration: 15,
    icon: '🌅',
    subtasks: ['Réviser accomplissements', 'Préparer lendemain', 'Ranger espace travail'],
    recurring: { enabled: true, frequency: 'daily', interval: 1 }
  },

  // Gestionnaire de Tâches Avancé
  {
    id: 'project-workflow-setup',
    type: 'task',
    title: 'Configuration Workflow Projet',
    description: 'Mettre en place un workflow complet pour nouveau projet',
    category: 'advanced-tasks',
    subcategory: 'workflows',
    tags: ['workflow', 'projet', 'configuration'],
    priority: 'high',
    estimatedDuration: 120,
    icon: '🔄',
    subtasks: ['Définir étapes', 'Configurer outils', 'Assigner responsabilités', 'Tester processus']
  },
  {
    id: 'dependency-mapping',
    type: 'task',
    title: 'Cartographie des Dépendances',
    description: 'Identifier et mapper toutes les dépendances de tâches',
    category: 'advanced-tasks',
    subcategory: 'dependencies',
    tags: ['dépendances', 'cartographie', 'analyse'],
    priority: 'high',
    estimatedDuration: 90,
    icon: '🔗',
    subtasks: ['Lister toutes tâches', 'Identifier liens', 'Créer diagramme', 'Optimiser séquence']
  },
  {
    id: 'automation-audit',
    type: 'task',
    title: 'Audit d\'Automatisation',
    description: 'Identifier opportunités d\'automatisation des tâches répétitives',
    category: 'advanced-tasks',
    subcategory: 'automation',
    tags: ['automatisation', 'audit', 'optimisation'],
    priority: 'medium',
    estimatedDuration: 180,
    icon: '🤖',
    subtasks: ['Analyser tâches répétitives', 'Évaluer ROI automation', 'Sélectionner outils', 'Planifier implémentation']
  },
  {
    id: 'template-creation',
    type: 'task',
    title: 'Création de Modèles',
    description: 'Développer des modèles réutilisables pour tâches récurrentes',
    category: 'advanced-tasks',
    subcategory: 'templates',
    tags: ['modèles', 'réutilisable', 'standardisation'],
    priority: 'medium',
    estimatedDuration: 150,
    icon: '📋',
    subtasks: ['Identifier patterns', 'Créer structures', 'Documenter usage', 'Tester efficacité']
  },
  {
    id: 'critical-path-analysis',
    type: 'task',
    title: 'Analyse du Chemin Critique',
    description: 'Identifier le chemin critique dans un projet complexe',
    category: 'advanced-tasks',
    subcategory: 'dependencies',
    tags: ['chemin critique', 'analyse', 'optimisation'],
    priority: 'high',
    estimatedDuration: 120,
    icon: '🎯',
    subtasks: ['Mapper toutes activités', 'Calculer durées', 'Identifier chemin critique', 'Optimiser planning']
  },
  {
    id: 'workflow-optimization',
    type: 'task',
    title: 'Optimisation de Workflow',
    description: 'Améliorer l\'efficacité d\'un workflow existant',
    category: 'advanced-tasks',
    subcategory: 'workflows',
    tags: ['optimisation', 'efficacité', 'amélioration'],
    priority: 'medium',
    estimatedDuration: 180,
    icon: '⚡',
    subtasks: ['Analyser workflow actuel', 'Identifier goulots', 'Proposer améliorations', 'Tester changements']
  },
  {
    id: 'resource-allocation',
    type: 'task',
    title: 'Allocation des Ressources',
    description: 'Optimiser l\'allocation des ressources entre tâches',
    category: 'advanced-tasks',
    subcategory: 'workflows',
    tags: ['ressources', 'allocation', 'optimisation'],
    priority: 'high',
    estimatedDuration: 90,
    icon: '⚖️',
    subtasks: ['Inventorier ressources', 'Évaluer besoins', 'Optimiser répartition', 'Monitorer usage']
  },
  {
    id: 'risk-assessment-tasks',
    type: 'task',
    title: 'Évaluation des Risques',
    description: 'Identifier et évaluer les risques liés aux tâches critiques',
    category: 'advanced-tasks',
    subcategory: 'dependencies',
    tags: ['risques', 'évaluation', 'mitigation'],
    priority: 'high',
    estimatedDuration: 120,
    icon: '⚠️',
    subtasks: ['Identifier risques', 'Évaluer probabilité/impact', 'Définir mitigations', 'Créer plans contingence']
  },
  {
    id: 'performance-metrics',
    type: 'task',
    title: 'Métriques de Performance',
    description: 'Définir et suivre les métriques de performance des tâches',
    category: 'advanced-tasks',
    subcategory: 'templates',
    tags: ['métriques', 'performance', 'suivi'],
    priority: 'medium',
    estimatedDuration: 90,
    icon: '📊',
    subtasks: ['Définir KPIs', 'Configurer tracking', 'Créer dashboards', 'Analyser tendances']
  },
  {
    id: 'stakeholder-communication',
    type: 'task',
    title: 'Communication Parties Prenantes',
    description: 'Gérer la communication avec toutes les parties prenantes',
    category: 'advanced-tasks',
    subcategory: 'workflows',
    tags: ['communication', 'stakeholders', 'coordination'],
    priority: 'high',
    estimatedDuration: 60,
    icon: '📢',
    subtasks: ['Identifier stakeholders', 'Définir fréquence comm', 'Créer formats rapports', 'Planifier réunions']
  }
];

// Objective presets
export const OBJECTIVE_PRESETS: ObjectivePreset[] = [
  {
    id: 'learn-new-skill',
    type: 'objective',
    title: 'Apprendre une nouvelle compétence',
    description: 'Maîtriser une nouvelle compétence professionnelle ou personnelle',
    category: 'personal',
    subcategory: 'learning',
    tags: ['apprentissage', 'compétence', 'développement'],
    priority: 'high',
    estimatedDuration: 2400, // 40 hours
    icon: '🎯',
    targetDate: '+3m',
    measurable: true,
    milestones: [
      'Identifier la compétence à apprendre',
      'Trouver les ressources d\'apprentissage',
      'Créer un plan d\'étude',
      'Pratiquer régulièrement',
      'Évaluer les progrès',
      'Obtenir une certification ou validation'
    ],
    kpis: ['Heures d\'étude par semaine', 'Exercices pratiques réalisés', 'Score aux évaluations']
  },
  {
    id: 'fitness-goal',
    type: 'objective',
    title: 'Objectif de remise en forme',
    description: 'Améliorer sa condition physique et sa santé',
    category: 'personal',
    subcategory: 'fitness',
    tags: ['santé', 'sport', 'forme'],
    priority: 'high',
    estimatedDuration: 1800, // 30 hours sur 3 mois
    icon: '💪',
    targetDate: '+3m',
    measurable: true,
    milestones: [
      'Évaluation condition physique initiale',
      'Définir objectifs spécifiques',
      'Créer programme d\'entraînement',
      'Établir routine alimentaire',
      'Suivi hebdomadaire des progrès',
      'Évaluation finale'
    ],
    kpis: ['Poids', 'Tour de taille', 'Endurance cardio', 'Force musculaire']
  },
  {
    id: 'save-money',
    type: 'objective',
    title: 'Économiser de l\'argent',
    description: 'Atteindre un objectif d\'épargne spécifique',
    category: 'finance',
    subcategory: 'budget',
    tags: ['épargne', 'économies', 'budget'],
    priority: 'high',
    estimatedDuration: 240, // 4 hours de planification
    icon: '💰',
    targetDate: '+6m',
    measurable: true,
    milestones: [
      'Définir montant cible',
      'Analyser dépenses actuelles',
      'Identifier postes d\'économie',
      'Créer budget d\'épargne',
      'Automatiser les virements',
      'Suivi mensuel des progrès'
    ],
    kpis: ['Montant épargné', 'Pourcentage de l\'objectif atteint', 'Économies mensuelles']
  },

  // Objectifs Avancés
  {
    id: 'strategic-business-goal',
    type: 'objective',
    title: 'Objectif Stratégique d\'Entreprise',
    description: 'Définir et atteindre un objectif stratégique majeur pour l\'entreprise',
    category: 'advanced-goals',
    subcategory: 'strategic',
    tags: ['stratégie', 'entreprise', 'croissance'],
    priority: 'high',
    targetDate: '+12m',
    measurable: true,
    milestones: [
      'Analyse de marché complète',
      'Définition de la stratégie',
      'Plan d\'action détaillé',
      'Mise en œuvre phase 1',
      'Évaluation intermédiaire',
      'Ajustements stratégiques',
      'Mise en œuvre phase 2',
      'Évaluation finale'
    ],
    kpis: ['Chiffre d\'affaires', 'Parts de marché', 'ROI', 'Satisfaction client']
  },
  {
    id: 'okr-quarterly-goal',
    type: 'objective',
    title: 'OKR Trimestriel',
    description: 'Objectif et résultats clés pour un trimestre',
    category: 'advanced-goals',
    subcategory: 'okr',
    tags: ['OKR', 'trimestriel', 'mesurable'],
    priority: 'high',
    targetDate: '+3m',
    measurable: true,
    milestones: [
      'Définition de l\'objectif principal',
      'Identification des résultats clés',
      'Définition des métriques',
      'Plan d\'action mensuel',
      'Suivi hebdomadaire',
      'Évaluation mi-parcours',
      'Ajustements nécessaires',
      'Évaluation finale'
    ],
    kpis: ['Progression vers objectif', 'Résultats clés atteints', 'Score de confiance']
  },
  {
    id: 'kpi-improvement-goal',
    type: 'objective',
    title: 'Amélioration KPI Critique',
    description: 'Améliorer significativement un indicateur de performance clé',
    category: 'advanced-goals',
    subcategory: 'kpi',
    tags: ['KPI', 'amélioration', 'performance'],
    priority: 'high',
    targetDate: '+6m',
    measurable: true,
    milestones: [
      'Analyse de l\'état actuel',
      'Identification des causes racines',
      'Plan d\'amélioration',
      'Mise en œuvre des actions',
      'Suivi des progrès',
      'Optimisations continues'
    ],
    kpis: ['Valeur KPI cible', 'Taux d\'amélioration', 'Temps d\'atteinte']
  },
  {
    id: 'milestone-based-project',
    type: 'objective',
    title: 'Projet par Jalons',
    description: 'Projet complexe structuré en jalons mesurables',
    category: 'advanced-goals',
    subcategory: 'milestones',
    tags: ['projet', 'jalons', 'complexe'],
    priority: 'high',
    targetDate: '+9m',
    measurable: true,
    milestones: [
      'Jalon 1: Conception et planification',
      'Jalon 2: Développement phase 1',
      'Jalon 3: Tests et validation',
      'Jalon 4: Développement phase 2',
      'Jalon 5: Intégration système',
      'Jalon 6: Tests d\'acceptation',
      'Jalon 7: Déploiement',
      'Jalon 8: Stabilisation'
    ],
    kpis: ['Jalons respectés', 'Budget consommé', 'Qualité livrée', 'Satisfaction utilisateurs']
  },
  {
    id: 'transformation-goal',
    type: 'objective',
    title: 'Objectif de Transformation',
    description: 'Conduire une transformation organisationnelle majeure',
    category: 'advanced-goals',
    subcategory: 'strategic',
    tags: ['transformation', 'changement', 'organisation'],
    priority: 'high',
    targetDate: '+18m',
    measurable: true,
    milestones: [
      'Diagnostic organisationnel',
      'Vision de transformation',
      'Plan de conduite du changement',
      'Communication et engagement',
      'Formation des équipes',
      'Mise en œuvre pilote',
      'Déploiement généralisé',
      'Ancrage des nouvelles pratiques'
    ],
    kpis: ['Taux d\'adoption', 'Résistance au changement', 'Performance post-transformation']
  },
  {
    id: 'innovation-goal',
    type: 'objective',
    title: 'Objectif d\'Innovation',
    description: 'Développer et lancer une innovation disruptive',
    category: 'advanced-goals',
    subcategory: 'strategic',
    tags: ['innovation', 'R&D', 'disruptif'],
    priority: 'high',
    targetDate: '+15m',
    measurable: true,
    milestones: [
      'Recherche et veille technologique',
      'Idéation et créativité',
      'Prototypage rapide',
      'Tests utilisateurs',
      'Développement MVP',
      'Tests marché',
      'Industrialisation',
      'Lancement commercial'
    ],
    kpis: ['Nombre d\'innovations', 'Taux de succès', 'ROI innovation', 'Time-to-market']
  },
  {
    id: 'performance-dashboard-goal',
    type: 'objective',
    title: 'Tableau de Bord Performance',
    description: 'Créer un système de pilotage par la performance',
    category: 'advanced-goals',
    subcategory: 'kpi',
    tags: ['dashboard', 'pilotage', 'performance'],
    priority: 'medium',
    targetDate: '+4m',
    measurable: true,
    milestones: [
      'Identification des KPIs critiques',
      'Conception du dashboard',
      'Développement technique',
      'Intégration des données',
      'Tests et validation',
      'Formation utilisateurs',
      'Déploiement',
      'Optimisation continue'
    ],
    kpis: ['Nombre de KPIs suivis', 'Fréquence de mise à jour', 'Adoption utilisateurs']
  },
  {
    id: 'agile-transformation',
    type: 'objective',
    title: 'Transformation Agile',
    description: 'Transformer l\'organisation vers l\'agilité',
    category: 'advanced-goals',
    subcategory: 'strategic',
    tags: ['agile', 'transformation', 'méthodes'],
    priority: 'high',
    targetDate: '+12m',
    measurable: true,
    milestones: [
      'Évaluation maturité agile',
      'Formation des équipes',
      'Mise en place des rituels',
      'Coaching agile',
      'Adaptation des processus',
      'Mesure de la vélocité',
      'Amélioration continue',
      'Certification agile'
    ],
    kpis: ['Vélocité des équipes', 'Time-to-market', 'Satisfaction équipes', 'Qualité produit']
  },
  {
    id: 'customer-experience-goal',
    type: 'objective',
    title: 'Excellence Expérience Client',
    description: 'Atteindre l\'excellence en expérience client',
    category: 'advanced-goals',
    subcategory: 'kpi',
    tags: ['expérience client', 'satisfaction', 'excellence'],
    priority: 'high',
    targetDate: '+8m',
    measurable: true,
    milestones: [
      'Cartographie parcours client',
      'Identification points de friction',
      'Plan d\'amélioration',
      'Mise en œuvre des améliorations',
      'Formation des équipes',
      'Mesure satisfaction',
      'Optimisation continue',
      'Certification excellence'
    ],
    kpis: ['NPS', 'CSAT', 'Taux de rétention', 'Temps de résolution']
  },
  {
    id: 'digital-transformation',
    type: 'objective',
    title: 'Transformation Digitale',
    description: 'Digitaliser les processus et services de l\'organisation',
    category: 'advanced-goals',
    subcategory: 'strategic',
    tags: ['digital', 'transformation', 'technologie'],
    priority: 'high',
    targetDate: '+24m',
    measurable: true,
    milestones: [
      'Audit digital actuel',
      'Stratégie de transformation',
      'Sélection des technologies',
      'Plan de migration',
      'Formation des utilisateurs',
      'Déploiement par phases',
      'Optimisation des processus',
      'Mesure de l\'impact'
    ],
    kpis: ['Taux de digitalisation', 'Gains de productivité', 'Adoption utilisateurs', 'ROI digital']
  }
];

// Pomodoro presets
export const POMODORO_PRESETS: PomodoroPreset[] = [
  {
    id: 'classic-pomodoro',
    type: 'pomodoro',
    title: 'Pomodoro Classique',
    description: 'Technique Pomodoro traditionnelle 25/5',
    category: 'work',
    tags: ['concentration', 'productivité', 'classique'],
    priority: 'medium',
    icon: '🍅',
    focusDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4
  },
  {
    id: 'deep-work',
    type: 'pomodoro',
    title: 'Travail Profond',
    description: 'Sessions longues pour le travail nécessitant une concentration intense',
    category: 'work',
    tags: ['concentration', 'travail profond', 'focus'],
    priority: 'high',
    icon: '🧠',
    focusDuration: 50,
    breakDuration: 10,
    longBreakDuration: 30,
    sessionsBeforeLongBreak: 3
  },
  {
    id: 'creative-flow',
    type: 'pomodoro',
    title: 'Flow Créatif',
    description: 'Sessions adaptées au travail créatif',
    category: 'creative',
    tags: ['créativité', 'flow', 'inspiration'],
    priority: 'medium',
    icon: '🎨',
    focusDuration: 45,
    breakDuration: 15,
    longBreakDuration: 30,
    sessionsBeforeLongBreak: 3
  },
  {
    id: 'study-session',
    type: 'pomodoro',
    title: 'Session d\'Étude',
    description: 'Optimisé pour l\'apprentissage et la mémorisation',
    category: 'personal',
    subcategory: 'learning',
    tags: ['étude', 'apprentissage', 'mémorisation'],
    priority: 'medium',
    icon: '📚',
    focusDuration: 30,
    breakDuration: 10,
    longBreakDuration: 20,
    sessionsBeforeLongBreak: 4
  }
];

// Complete preset library
export const PRESET_LIBRARY: PresetLibrary = {
  categories: PRESET_CATEGORIES,
  presets: [...TASK_PRESETS, ...OBJECTIVE_PRESETS, ...POMODORO_PRESETS],
  version: '1.0.0',
  lastUpdated: new Date().toISOString()
};

// Utility functions
export const getPresetsByCategory = (categoryId: string) => {
  return PRESET_LIBRARY.presets.filter(preset => preset.category === categoryId);
};

export const getPresetsByType = (type: 'task' | 'objective' | 'pomodoro') => {
  return PRESET_LIBRARY.presets.filter(preset => preset.type === type);
};

export const searchPresets = (searchTerm: string) => {
  const term = searchTerm.toLowerCase();
  return PRESET_LIBRARY.presets.filter(preset => 
    preset.title.toLowerCase().includes(term) ||
    preset.description?.toLowerCase().includes(term) ||
    preset.tags.some(tag => tag.toLowerCase().includes(term))
  );
};