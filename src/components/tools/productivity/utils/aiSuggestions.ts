/**
 * aiSuggestions.ts - Système de suggestions IA pour les outils de productivité
 * Analyse les mots-clés des tâches pour recommander automatiquement les quadrants Eisenhower et colonnes Kanban
 */

import { Task } from '../hooks/useTaskManager';

// Types pour les suggestions
export interface EisenhowerSuggestion {
  quadrant: 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'not-urgent-not-important';
  confidence: number; // 0-100
  reasoning: string;
}

export interface KanbanSuggestion {
  column: 'todo' | 'in-progress' | 'review' | 'done';
  confidence: number; // 0-100
  reasoning: string;
}

// Dictionnaires de mots-clés pour l'analyse
const URGENCY_KEYWORDS = {
  high: ['urgent', 'asap', 'immédiat', 'critique', 'deadline', 'échéance', 'maintenant', 'rapidement', 'emergency', 'urgence'],
  medium: ['bientôt', 'cette semaine', 'prochainement', 'soon', 'week'],
  low: ['plus tard', 'éventuellement', 'someday', 'later', 'futur']
};

const IMPORTANCE_KEYWORDS = {
  high: ['important', 'crucial', 'essentiel', 'vital', 'priorité', 'critical', 'key', 'major', 'strategic'],
  medium: ['utile', 'nécessaire', 'helpful', 'useful', 'needed'],
  low: ['optionnel', 'nice to have', 'bonus', 'extra', 'optional']
};

const KANBAN_KEYWORDS = {
  todo: ['nouveau', 'planifier', 'à faire', 'new', 'plan', 'todo', 'backlog', 'idea', 'idée'],
  'in-progress': ['en cours', 'travail', 'développement', 'working', 'progress', 'doing', 'active', 'current'],
  review: ['révision', 'test', 'vérification', 'review', 'check', 'validate', 'testing', 'qa'],
  done: ['terminé', 'fini', 'complété', 'done', 'finished', 'completed', 'closed']
};

const CONTEXT_KEYWORDS = {
  meeting: ['réunion', 'meeting', 'call', 'rendez-vous', 'entretien'],
  development: ['code', 'développement', 'bug', 'feature', 'dev', 'programming', 'coding'],
  communication: ['email', 'message', 'appel', 'communication', 'contact'],
  planning: ['planification', 'stratégie', 'planning', 'roadmap', 'strategy'],
  learning: ['formation', 'apprentissage', 'learning', 'training', 'étude'],
  administrative: ['admin', 'administratif', 'paperwork', 'documentation', 'rapport']
};

/**
 * Analyse le texte pour extraire les mots-clés pertinents
 */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Zàâäéèêëïîôöùûüÿç\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

/**
 * Calcule le score de correspondance pour une catégorie de mots-clés
 */
function calculateKeywordScore(keywords: string[], categoryKeywords: string[]): number {
  const matches = keywords.filter(keyword => 
    categoryKeywords.some(catKeyword => 
      keyword.includes(catKeyword) || catKeyword.includes(keyword)
    )
  );
  return (matches.length / Math.max(keywords.length, 1)) * 100;
}

/**
 * Analyse le contexte temporel de la tâche
 */
function analyzeTemporalContext(task: Task): { urgency: number; importance: number } {
  let urgency = 0;
  let importance = 0;

  // Analyse de la date d'échéance
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 1) urgency += 40;
    else if (daysUntilDue <= 3) urgency += 30;
    else if (daysUntilDue <= 7) urgency += 20;
    else if (daysUntilDue <= 14) urgency += 10;
  }

  // Analyse de la priorité
  switch (task.priority) {
    case 'high':
      importance += 40;
      urgency += 20;
      break;
    case 'medium':
      importance += 20;
      urgency += 10;
      break;
    case 'low':
      importance += 5;
      break;
  }

  // Analyse de la durée estimée
  if (task.estimatedDuration) {
    if (task.estimatedDuration > 240) importance += 15; // Tâches longues souvent importantes
    if (task.estimatedDuration < 30) urgency += 10; // Tâches courtes peuvent être urgentes
  }

  return { urgency: Math.min(urgency, 100), importance: Math.min(importance, 100) };
}

/**
 * Génère une suggestion pour le quadrant Eisenhower
 */
export function suggestEisenhowerQuadrant(task: Task): EisenhowerSuggestion {
  const allText = `${task.title} ${task.description || ''} ${task.tags.join(' ')}`;
  const keywords = extractKeywords(allText);
  const temporal = analyzeTemporalContext(task);

  // Calcul des scores d'urgence et d'importance basés sur les mots-clés
  const urgencyScores = {
    high: calculateKeywordScore(keywords, URGENCY_KEYWORDS.high),
    medium: calculateKeywordScore(keywords, URGENCY_KEYWORDS.medium),
    low: calculateKeywordScore(keywords, URGENCY_KEYWORDS.low)
  };

  const importanceScores = {
    high: calculateKeywordScore(keywords, IMPORTANCE_KEYWORDS.high),
    medium: calculateKeywordScore(keywords, IMPORTANCE_KEYWORDS.medium),
    low: calculateKeywordScore(keywords, IMPORTANCE_KEYWORDS.low)
  };

  // Combinaison des scores temporels et textuels
  const finalUrgency = (temporal.urgency + urgencyScores.high - urgencyScores.low) / 2;
  const finalImportance = (temporal.importance + importanceScores.high - importanceScores.low) / 2;

  // Détermination du quadrant
  const isUrgent = finalUrgency > 30;
  const isImportant = finalImportance > 30;

  let quadrant: EisenhowerSuggestion['quadrant'];
  let reasoning: string;
  let confidence: number;

  if (isUrgent && isImportant) {
    quadrant = 'urgent-important';
    reasoning = 'Tâche critique nécessitant une attention immédiate';
    confidence = Math.min(90, (finalUrgency + finalImportance) / 2);
  } else if (!isUrgent && isImportant) {
    quadrant = 'important-not-urgent';
    reasoning = 'Tâche importante à planifier pour éviter qu\'elle devienne urgente';
    confidence = Math.min(85, finalImportance);
  } else if (isUrgent && !isImportant) {
    quadrant = 'urgent-not-important';
    reasoning = 'Tâche urgente mais peu importante, considérer la délégation';
    confidence = Math.min(80, finalUrgency);
  } else {
    quadrant = 'not-urgent-not-important';
    reasoning = 'Tâche de faible priorité, à traiter quand le temps le permet';
    confidence = Math.max(60, 100 - (finalUrgency + finalImportance) / 2);
  }

  // Ajustement de la confiance basé sur la richesse des données
  const dataRichness = (task.description ? 20 : 0) + (task.tags.length * 5) + (task.dueDate ? 15 : 0);
  confidence = Math.min(95, confidence + dataRichness);

  return { quadrant, confidence, reasoning };
}

/**
 * Génère une suggestion pour la colonne Kanban
 */
export function suggestKanbanColumn(task: Task): KanbanSuggestion {
  const allText = `${task.title} ${task.description || ''} ${task.tags.join(' ')}`;
  const keywords = extractKeywords(allText);

  // Calcul des scores pour chaque colonne
  const columnScores = {
    todo: calculateKeywordScore(keywords, KANBAN_KEYWORDS.todo),
    'in-progress': calculateKeywordScore(keywords, KANBAN_KEYWORDS['in-progress']),
    review: calculateKeywordScore(keywords, KANBAN_KEYWORDS.review),
    done: calculateKeywordScore(keywords, KANBAN_KEYWORDS.done)
  };

  // Analyse du contexte
  const contextScores = {
    meeting: calculateKeywordScore(keywords, CONTEXT_KEYWORDS.meeting),
    development: calculateKeywordScore(keywords, CONTEXT_KEYWORDS.development),
    communication: calculateKeywordScore(keywords, CONTEXT_KEYWORDS.communication),
    planning: calculateKeywordScore(keywords, CONTEXT_KEYWORDS.planning),
    learning: calculateKeywordScore(keywords, CONTEXT_KEYWORDS.learning),
    administrative: calculateKeywordScore(keywords, CONTEXT_KEYWORDS.administrative)
  };

  // Ajustements basés sur le contexte
  if (contextScores.meeting > 20) {
    columnScores.todo += 15; // Les réunions sont souvent planifiées
  }
  if (contextScores.development > 20) {
    columnScores['in-progress'] += 20; // Le développement est souvent en cours
  }
  if (contextScores.planning > 20) {
    columnScores.todo += 25; // La planification commence par todo
  }

  // Ajustements basés sur l'état de la tâche
  if (task.completed) {
    return {
      column: 'done',
      confidence: 95,
      reasoning: 'Tâche marquée comme terminée'
    };
  }

  // Ajustements basés sur la date d'échéance
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 1) {
      columnScores['in-progress'] += 30;
    } else if (daysUntilDue <= 3) {
      columnScores['in-progress'] += 15;
    }
  }

  // Détermination de la meilleure colonne
  const bestColumn = Object.entries(columnScores).reduce((best, [column, score]) => 
    score > best.score ? { column: column as KanbanSuggestion['column'], score } : best,
    { column: 'todo' as KanbanSuggestion['column'], score: 0 }
  );

  // Génération du raisonnement
  const reasoningMap = {
    todo: 'Nouvelle tâche à planifier et organiser',
    'in-progress': 'Tâche active nécessitant un travail continu',
    review: 'Tâche nécessitant une révision ou validation',
    done: 'Tâche terminée et prête à être archivée'
  };

  let confidence = Math.min(90, bestColumn.score + 40);
  
  // Ajustement de la confiance
  const dataRichness = (task.description ? 15 : 0) + (task.tags.length * 3) + (task.dueDate ? 10 : 0);
  confidence = Math.min(95, confidence + dataRichness);

  return {
    column: bestColumn.column,
    confidence,
    reasoning: reasoningMap[bestColumn.column]
  };
}

/**
 * Analyse une tâche et génère des suggestions complètes
 */
export function analyzeTaskForSuggestions(task: Task): {
  eisenhower: EisenhowerSuggestion;
  kanban: KanbanSuggestion;
  insights: string[];
} {
  const eisenhower = suggestEisenhowerQuadrant(task);
  const kanban = suggestKanbanColumn(task);
  
  const insights: string[] = [];
  
  // Génération d'insights supplémentaires
  if (eisenhower.confidence > 80) {
    insights.push(`Classification Eisenhower très fiable (${eisenhower.confidence.toFixed(0)}%)`);
  }
  
  if (kanban.confidence > 80) {
    insights.push(`Suggestion Kanban très fiable (${kanban.confidence.toFixed(0)}%)`);
  }
  
  if (task.estimatedDuration && task.estimatedDuration > 180) {
    insights.push('Tâche longue - considérer la diviser en sous-tâches');
  }
  
  if (task.tags.length === 0) {
    insights.push('Ajouter des tags améliorerait la précision des suggestions');
  }
  
  if (!task.dueDate && eisenhower.quadrant.includes('urgent')) {
    insights.push('Définir une échéance clarifierait l\'urgence');
  }

  return { eisenhower, kanban, insights };
}

/**
 * Génère des suggestions d'amélioration pour une liste de tâches
 */
export function generateProductivityInsights(tasks: Task[]): {
  suggestions: string[];
  patterns: string[];
  recommendations: string[];
} {
  const suggestions: string[] = [];
  const patterns: string[] = [];
  const recommendations: string[] = [];

  // Analyse des patterns
  const urgentTasks = tasks.filter(task => {
    const suggestion = suggestEisenhowerQuadrant(task);
    return suggestion.quadrant.includes('urgent');
  });

  const importantTasks = tasks.filter(task => {
    const suggestion = suggestEisenhowerQuadrant(task);
    return suggestion.quadrant.includes('important');
  });

  // Suggestions basées sur les patterns
  if (urgentTasks.length > tasks.length * 0.4) {
    suggestions.push('Trop de tâches urgentes détectées - améliorer la planification');
    recommendations.push('Planifier davantage de tâches importantes non urgentes');
  }

  if (importantTasks.length < tasks.length * 0.3) {
    suggestions.push('Peu de tâches importantes identifiées - revoir les priorités');
    recommendations.push('Identifier et prioriser les tâches à fort impact');
  }

  // Détection de patterns temporels
  const tasksWithDeadlines = tasks.filter(task => task.dueDate);
  if (tasksWithDeadlines.length < tasks.length * 0.5) {
    patterns.push('Beaucoup de tâches sans échéance définie');
    recommendations.push('Définir des échéances pour améliorer la planification');
  }

  // Analyse de la complexité
  const complexTasks = tasks.filter(task => task.estimatedDuration && task.estimatedDuration > 120);
  if (complexTasks.length > tasks.length * 0.3) {
    patterns.push('Nombreuses tâches complexes détectées');
    recommendations.push('Diviser les tâches complexes en sous-tâches plus petites');
  }

  return { suggestions, patterns, recommendations };
}