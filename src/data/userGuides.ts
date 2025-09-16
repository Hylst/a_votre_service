/**
 * userGuides.ts - Configuration des guides d'utilisation pour la suite Organisation productive
 * Contient les modes d'emploi et conseils pour chaque outil
 */

import { GuideSection } from '@/components/ui/UserGuide';
import { 
  CheckSquare2, 
  CheckSquare, 
  Target, 
  Timer, 
  BookOpen, 
  Grid3X3, 
  Zap 
} from 'lucide-react';
import React from 'react';

export interface ToolGuideConfig {
  toolName: string;
  toolIcon: React.ReactNode;
  sections: GuideSection[];
  quickTips: string[];
  shortcuts: { key: string; description: string }[];
}

/**
 * Configuration des guides pour chaque outil de la suite productive
 */
export const USER_GUIDES: Record<string, ToolGuideConfig> = {
  'todo': {
    toolName: 'To-Do List',
    toolIcon: React.createElement(CheckSquare2, { className: 'w-5 h-5 text-blue-600' }),
    sections: [
      {
        title: 'Gestion des tâches',
        type: 'instruction',
        content: [
          'Cliquez sur "Ajouter une tâche" pour créer une nouvelle entrée',
          'Utilisez les catégories pour organiser vos tâches par domaine',
          'Définissez une priorité (Faible, Moyenne, Haute) pour chaque tâche',
          'Ajoutez une date d\'échéance pour un meilleur suivi temporel',
          'Cochez les tâches terminées pour les marquer comme complétées'
        ]
      },
      {
        title: 'Organisation efficace',
        type: 'best-practice',
        content: [
          'Limitez-vous à 3-5 tâches prioritaires par jour',
          'Utilisez des descriptions détaillées pour les tâches complexes',
          'Regroupez les tâches similaires dans la même catégorie',
          'Planifiez vos tâches la veille pour le lendemain',
          'Révisez régulièrement vos tâches en retard'
        ]
      },
      {
        title: 'Filtres et recherche',
        type: 'tip',
        content: [
          'Utilisez les filtres par statut pour voir uniquement les tâches actives',
          'Filtrez par catégorie pour vous concentrer sur un domaine',
          'Le filtre par priorité vous aide à identifier l\'urgent',
          'Consultez les statistiques pour suivre votre progression'
        ]
      }
    ],
    quickTips: [
      'Commencez par les tâches de haute priorité le matin',
      'Utilisez des verbes d\'action pour nommer vos tâches ("Appeler", "Rédiger", "Envoyer")',
      'Décomposez les grandes tâches en sous-tâches plus petites',
      'Définissez des échéances réalistes pour éviter le stress'
    ],
    shortcuts: [
      { key: 'Ctrl + N', description: 'Nouvelle tâche' },
      { key: 'Ctrl + F', description: 'Rechercher' },
      { key: 'Espace', description: 'Marquer comme terminé' }
    ]
  },

  'tasks': {
    toolName: 'Tâches Pro',
    toolIcon: React.createElement(CheckSquare, { className: 'w-5 h-5 text-emerald-600' }),
    sections: [
      {
        title: 'Gestion avancée des tâches',
        type: 'instruction',
        content: [
          'Créez des tâches avec estimation de durée pour une meilleure planification',
          'Utilisez les sous-tâches pour décomposer les projets complexes',
          'Assignez des responsables pour le travail en équipe',
          'Suivez le temps passé sur chaque tâche',
          'Utilisez les templates pour standardiser vos processus'
        ]
      },
      {
        title: 'Planification stratégique',
        type: 'best-practice',
        content: [
          'Estimez toujours la durée de vos tâches avant de commencer',
          'Planifiez des buffers de 25% pour les imprévus',
          'Regroupez les tâches similaires pour optimiser votre temps',
          'Utilisez la méthode Getting Things Done (GTD)',
          'Révisez vos tâches hebdomadairement'
        ]
      },
      {
        title: 'Collaboration efficace',
        type: 'tip',
        content: [
          'Assignez clairement les responsabilités',
          'Utilisez les commentaires pour communiquer sur l\'avancement',
          'Partagez les templates avec votre équipe',
          'Synchronisez régulièrement avec les autres outils'
        ]
      }
    ],
    quickTips: [
      'Utilisez la technique Pomodoro avec l\'estimation de durée',
      'Créez des templates pour vos processus récurrents',
      'Exportez vos données régulièrement pour sauvegarde',
      'Utilisez les tags pour une organisation transversale'
    ],
    shortcuts: [
      { key: 'Ctrl + Shift + N', description: 'Nouvelle tâche avancée' },
      { key: 'Ctrl + D', description: 'Dupliquer la tâche' },
      { key: 'Ctrl + E', description: 'Exporter les données' }
    ]
  },

  'goals': {
    toolName: 'Objectifs',
    toolIcon: React.createElement(Target, { className: 'w-5 h-5 text-purple-600' }),
    sections: [
      {
        title: 'Définition d\'objectifs SMART',
        type: 'instruction',
        content: [
          'Définissez des objectifs Spécifiques, Mesurables, Atteignables',
          'Fixez des dates de début et d\'échéance réalistes',
          'Décomposez chaque objectif en étapes (milestones)',
          'Suivez votre progression avec des indicateurs quantifiables',
          'Réajustez vos objectifs selon les circonstances'
        ]
      },
      {
        title: 'Stratégie de réussite',
        type: 'best-practice',
        content: [
          'Limitez-vous à 3-5 objectifs majeurs simultanément',
          'Visualisez régulièrement vos objectifs à long terme',
          'Célébrez les petites victoires et étapes franchies',
          'Identifiez et éliminez les obstacles potentiels',
          'Partagez vos objectifs pour créer de l\'engagement'
        ]
      },
      {
        title: 'Suivi et ajustement',
        type: 'tip',
        content: [
          'Révisez vos objectifs chaque semaine',
          'Utilisez les métriques pour mesurer votre progression',
          'Ajustez les échéances si nécessaire sans culpabiliser',
          'Documentez les leçons apprises pour les futurs objectifs'
        ]
      }
    ],
    quickTips: [
      'Écrivez vos objectifs comme s\'ils étaient déjà atteints',
      'Visualisez le résultat final pour maintenir la motivation',
      'Décomposez les grands objectifs en actions quotidiennes',
      'Utilisez la règle des 1% d\'amélioration continue'
    ],
    shortcuts: [
      { key: 'Ctrl + G', description: 'Nouvel objectif' },
      { key: 'Ctrl + M', description: 'Ajouter une étape' },
      { key: 'Ctrl + P', description: 'Voir la progression' }
    ]
  },

  'pomodoro': {
    toolName: 'Pomodoro',
    toolIcon: React.createElement(Timer, { className: 'w-5 h-5 text-red-600' }),
    sections: [
      {
        title: 'Technique Pomodoro',
        type: 'instruction',
        content: [
          'Travaillez par blocs de 25 minutes sans interruption',
          'Prenez une pause de 5 minutes entre chaque pomodoro',
          'Après 4 pomodoros, prenez une pause longue de 15-30 minutes',
          'Éliminez toutes les distractions pendant les sessions',
          'Notez vos accomplissements à la fin de chaque session'
        ]
      },
      {
        title: 'Optimisation de la concentration',
        type: 'best-practice',
        content: [
          'Préparez votre espace de travail avant de commencer',
          'Définissez un objectif clair pour chaque pomodoro',
          'Utilisez la règle "2 minutes" pour les tâches rapides',
          'Planifiez vos pomodoros selon votre énergie naturelle',
          'Respectez strictement les temps de pause'
        ]
      },
      {
        title: 'Gestion des interruptions',
        type: 'tip',
        content: [
          'Notez les interruptions sans arrêter le timer',
          'Utilisez la technique "Informer, Négocier, Planifier"',
          'Mettez votre téléphone en mode silencieux',
          'Informez votre entourage de vos sessions de travail'
        ]
      }
    ],
    quickTips: [
      'Commencez par des tâches faciles pour créer de l\'élan',
      'Utilisez des sons de notification discrets',
      'Adaptez les durées selon votre capacité de concentration',
      'Combinez avec d\'autres techniques de productivité'
    ],
    shortcuts: [
      { key: 'Espace', description: 'Démarrer/Pause' },
      { key: 'R', description: 'Reset timer' },
      { key: 'S', description: 'Passer à la pause' }
    ]
  },

  'notes': {
    toolName: 'Notes',
    toolIcon: React.createElement(BookOpen, { className: 'w-5 h-5 text-amber-600' }),
    sections: [
      {
        title: 'Organisation des notes',
        type: 'instruction',
        content: [
          'Utilisez des titres descriptifs pour retrouver facilement vos notes',
          'Organisez par catégories selon vos domaines d\'activité',
          'Utilisez les couleurs pour un codage visuel rapide',
          'Épinglez les notes importantes en haut de la liste',
          'Utilisez la fonction de recherche pour retrouver du contenu'
        ]
      },
      {
        title: 'Techniques de prise de notes',
        type: 'best-practice',
        content: [
          'Utilisez la méthode Cornell pour structurer vos notes',
          'Créez des liens entre les notes connexes',
          'Utilisez des puces et des listes pour la clarté',
          'Ajoutez des dates et contextes pour la traçabilité',
          'Révisez et consolidez vos notes régulièrement'
        ]
      },
      {
        title: 'Formatage et style',
        type: 'tip',
        content: [
          'Utilisez le Markdown pour un formatage rapide',
          'Créez des templates pour vos types de notes récurrents',
          'Utilisez des abréviations personnelles pour gagner du temps',
          'Ajoutez des schémas et diagrammes quand c\'est pertinent'
        ]
      }
    ],
    quickTips: [
      'Prenez des notes pendant les réunions pour une meilleure rétention',
      'Utilisez la technique du "brain dump" pour vider votre esprit',
      'Créez une note quotidienne pour capturer vos idées',
      'Exportez vos notes importantes vers d\'autres outils'
    ],
    shortcuts: [
      { key: 'Ctrl + N', description: 'Nouvelle note' },
      { key: 'Ctrl + S', description: 'Sauvegarder' },
      { key: 'Ctrl + F', description: 'Rechercher dans les notes' }
    ]
  },

  'kanban': {
    toolName: 'Kanban',
    toolIcon: React.createElement(Grid3X3, { className: 'w-5 h-5 text-indigo-600' }),
    sections: [
      {
        title: 'Flux de travail Kanban',
        type: 'instruction',
        content: [
          'Organisez vos tâches en colonnes selon leur statut',
          'Déplacez les cartes de gauche à droite au fur et à mesure',
          'Limitez le nombre de tâches "En cours" (WIP limit)',
          'Utilisez des couleurs pour catégoriser les types de tâches',
          'Ajoutez des détails dans chaque carte (échéance, assigné, etc.)'
        ]
      },
      {
        title: 'Optimisation du flux',
        type: 'best-practice',
        content: [
          'Identifiez et éliminez les goulots d\'étranglement',
          'Mesurez le temps de cycle de vos tâches',
          'Organisez des réunions de revue de tableau régulières',
          'Adaptez vos colonnes selon votre processus réel',
          'Utilisez des métriques pour améliorer continuellement'
        ]
      },
      {
        title: 'Collaboration d\'équipe',
        type: 'tip',
        content: [
          'Assignez clairement les responsables de chaque carte',
          'Utilisez les commentaires pour communiquer sur l\'avancement',
          'Organisez des stand-ups quotidiens devant le tableau',
          'Partagez les bonnes pratiques entre les membres de l\'équipe'
        ]
      }
    ],
    quickTips: [
      'Commencez avec 3 colonnes simples : À faire, En cours, Terminé',
      'Ajoutez des colonnes selon vos besoins spécifiques',
      'Utilisez des étiquettes pour prioriser visuellement',
      'Archivez régulièrement les cartes terminées'
    ],
    shortcuts: [
      { key: 'N', description: 'Nouvelle carte' },
      { key: 'Flèches', description: 'Déplacer les cartes' },
      { key: 'Del', description: 'Supprimer la carte sélectionnée' }
    ]
  },

  'eisenhower': {
    toolName: 'Eisenhower',
    toolIcon: React.createElement(Zap, { className: 'w-5 h-5 text-orange-600' }),
    sections: [
      {
        title: 'Matrice de priorisation',
        type: 'instruction',
        content: [
          'Classez vos tâches selon Urgent/Important dans 4 quadrants',
          'Quadrant 1 (Urgent + Important) : À faire immédiatement',
          'Quadrant 2 (Important, pas urgent) : À planifier',
          'Quadrant 3 (Urgent, pas important) : À déléguer',
          'Quadrant 4 (Ni urgent, ni important) : À éliminer'
        ]
      },
      {
        title: 'Stratégie de priorisation',
        type: 'best-practice',
        content: [
          'Concentrez-vous sur le Quadrant 2 pour la croissance',
          'Minimisez le temps passé dans les Quadrants 3 et 4',
          'Utilisez cette matrice pour la planification hebdomadaire',
          'Réévaluez régulièrement l\'urgence et l\'importance',
          'Déléguez systématiquement les tâches du Quadrant 3'
        ]
      },
      {
        title: 'Analyse et amélioration',
        type: 'tip',
        content: [
          'Analysez où vous passez le plus de temps',
          'Identifiez les tâches qui deviennent urgentes par négligence',
          'Utilisez les analytics pour optimiser votre répartition',
          'Planifiez du temps dédié aux activités du Quadrant 2'
        ]
      }
    ],
    quickTips: [
      'Posez-vous toujours : "Est-ce urgent ET important ?"',
      'Planifiez 60% de votre temps sur le Quadrant 2',
      'Éliminez impitoyablement les activités du Quadrant 4',
      'Transformez les urgences récurrentes en processus préventifs'
    ],
    shortcuts: [
      { key: '1-4', description: 'Déplacer vers quadrant 1-4' },
      { key: 'Ctrl + A', description: 'Analyser la répartition' },
      { key: 'Tab', description: 'Naviguer entre quadrants' }
    ]
  }
};

/**
 * Fonction utilitaire pour obtenir la configuration d'un guide
 * @param toolKey - Clé de l'outil (todo, tasks, goals, etc.)
 * @returns Configuration du guide ou null si non trouvé
 */
export const getToolGuide = (toolKey: string): ToolGuideConfig | null => {
  return USER_GUIDES[toolKey] || null;
};

/**
 * Fonction pour obtenir tous les guides disponibles
 * @returns Tableau de toutes les configurations de guides
 */
export const getAllToolGuides = (): ToolGuideConfig[] => {
  return Object.values(USER_GUIDES);
};