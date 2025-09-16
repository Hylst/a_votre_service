/**
 * exportUtils.ts - Utility functions for exporting productivity data
 * Provides PDF and CSV export functionality for Kanban and Eisenhower tools
 */

import { Task } from '../hooks/useTaskManager';
import { jsPDF } from 'jspdf';

/**
 * Interface pour les options d'export
 */
export interface ExportOptions {
  format: 'pdf' | 'csv';
  includeMetrics?: boolean;
  includeAnalytics?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Exporte les données Kanban au format spécifié
 */
export const exportKanbanData = async (
  tasks: Task[],
  options: ExportOptions
): Promise<void> => {
  if (options.format === 'csv') {
    await exportKanbanToCSV(tasks, options);
  } else {
    await exportKanbanToPDF(tasks, options);
  }
};

/**
 * Exporte les données Eisenhower au format spécifié
 */
export const exportEisenhowerData = async (
  tasks: Task[],
  options: ExportOptions
): Promise<void> => {
  if (options.format === 'csv') {
    await exportEisenhowerToCSV(tasks, options);
  } else {
    await exportEisenhowerToPDF(tasks, options);
  }
};

/**
 * Exporte les données Kanban au format CSV
 */
const exportKanbanToCSV = async (
  tasks: Task[],
  options: ExportOptions
): Promise<void> => {
  const headers = [
    'ID',
    'Titre',
    'Description',
    'Statut',
    'Priorité',
    'Catégorie',
    'Tags',
    'Date de création',
    'Date d\'échéance',
    'Durée estimée',
    'Temps passé'
  ];

  const csvContent = [
    headers.join(','),
    ...tasks.map(task => [
      task.id,
      `"${task.title.replace(/"/g, '""')}"`,
      `"${(task.description || '').replace(/"/g, '""')}"`,
      task.status,
      task.priority,
      task.category || '',
      `"${(task.tags || []).join(', ')}"`,
      new Date(task.createdAt).toLocaleDateString('fr-FR'),
      task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : '',
      task.estimatedDuration || '',
      task.timeSpent || '0'
    ].join(','))
  ].join('\n');

  downloadFile(
    csvContent,
    `kanban-export-${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv'
  );
};

/**
 * Exporte les données Eisenhower au format CSV
 */
const exportEisenhowerToCSV = async (
  tasks: Task[],
  options: ExportOptions
): Promise<void> => {
  const headers = [
    'ID',
    'Titre',
    'Description',
    'Quadrant',
    'Priorité',
    'Catégorie',
    'Tags',
    'Date de création',
    'Date d\'échéance',
    'Durée estimée',
    'Urgence',
    'Importance'
  ];

  const getQuadrant = (task: Task): string => {
    const isUrgent = task.priority === 'high' || (task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const isImportant = task.priority !== 'low' && (task.category === 'work' || task.category === 'personal');
    
    if (isUrgent && isImportant) return 'Q1 - Urgent & Important';
    if (!isUrgent && isImportant) return 'Q2 - Important & Non-urgent';
    if (isUrgent && !isImportant) return 'Q3 - Urgent & Non-important';
    return 'Q4 - Non-urgent & Non-important';
  };

  const csvContent = [
    headers.join(','),
    ...tasks.map(task => {
      const isUrgent = task.priority === 'high' || (task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      const isImportant = task.priority !== 'low' && (task.category === 'work' || task.category === 'personal');
      
      return [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${(task.description || '').replace(/"/g, '""')}"`,
        `"${getQuadrant(task)}"`,
        task.priority,
        task.category || '',
        `"${(task.tags || []).join(', ')}"`,
        new Date(task.createdAt).toLocaleDateString('fr-FR'),
        task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : '',
        task.estimatedDuration || '',
        isUrgent ? 'Oui' : 'Non',
        isImportant ? 'Oui' : 'Non'
      ].join(',');
    })
  ].join('\n');

  downloadFile(
    csvContent,
    `eisenhower-export-${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv'
  );
};

/**
 * Exporte les données Kanban au format PDF
 */
const exportKanbanToPDF = async (
  tasks: Task[],
  options: ExportOptions
): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = margin;

  // Titre
  doc.setFontSize(20);
  doc.text('Rapport Kanban', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Date d'export
  doc.setFontSize(12);
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
  yPosition += 15;

  // Statistiques générales
  doc.setFontSize(14);
  doc.text('Statistiques générales:', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  doc.text(`Total des tâches: ${stats.total}`, margin, yPosition);
  yPosition += 8;
  doc.text(`À faire: ${stats.todo}`, margin, yPosition);
  yPosition += 8;
  doc.text(`En cours: ${stats.inProgress}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Terminées: ${stats.done}`, margin, yPosition);
  yPosition += 15;

  // Liste des tâches
  doc.setFontSize(14);
  doc.text('Liste des tâches:', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(9);
  tasks.forEach((task, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }

    doc.text(`${index + 1}. ${task.title}`, margin, yPosition);
    yPosition += 6;
    doc.text(`   Statut: ${task.status} | Priorité: ${task.priority}`, margin + 5, yPosition);
    yPosition += 6;
    if (task.description) {
      const description = task.description.length > 80 ? 
        task.description.substring(0, 80) + '...' : task.description;
      doc.text(`   Description: ${description}`, margin + 5, yPosition);
      yPosition += 6;
    }
    yPosition += 3;
  });

  doc.save(`kanban-rapport-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporte les données Eisenhower au format PDF
 */
const exportEisenhowerToPDF = async (
  tasks: Task[],
  options: ExportOptions
): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = margin;

  // Titre
  doc.setFontSize(20);
  doc.text('Rapport Matrice d\'Eisenhower', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Date d'export
  doc.setFontSize(12);
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
  yPosition += 15;

  // Organiser les tâches par quadrant
  const getQuadrant = (task: Task): string => {
    const isUrgent = task.priority === 'high' || (task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const isImportant = task.priority !== 'low' && (task.category === 'work' || task.category === 'personal');
    
    if (isUrgent && isImportant) return 'Q1';
    if (!isUrgent && isImportant) return 'Q2';
    if (isUrgent && !isImportant) return 'Q3';
    return 'Q4';
  };

  const quadrants = {
    Q1: { name: 'Q1 - Urgent & Important', tasks: [] as Task[] },
    Q2: { name: 'Q2 - Important & Non-urgent', tasks: [] as Task[] },
    Q3: { name: 'Q3 - Urgent & Non-important', tasks: [] as Task[] },
    Q4: { name: 'Q4 - Non-urgent & Non-important', tasks: [] as Task[] }
  };

  tasks.forEach(task => {
    const quadrant = getQuadrant(task);
    quadrants[quadrant as keyof typeof quadrants].tasks.push(task);
  });

  // Afficher chaque quadrant
  Object.values(quadrants).forEach(quadrant => {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    doc.text(`${quadrant.name} (${quadrant.tasks.length} tâches)`, margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    quadrant.tasks.forEach((task, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(`${index + 1}. ${task.title}`, margin + 5, yPosition);
      yPosition += 6;
      doc.text(`   Priorité: ${task.priority}`, margin + 10, yPosition);
      yPosition += 6;
      if (task.description) {
        const description = task.description.length > 70 ? 
          task.description.substring(0, 70) + '...' : task.description;
        doc.text(`   Description: ${description}`, margin + 10, yPosition);
        yPosition += 6;
      }
      yPosition += 3;
    });
    yPosition += 10;
  });

  doc.save(`eisenhower-rapport-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Télécharge un fichier avec le contenu spécifié
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Génère un rapport de métriques pour l'export
 */
export const generateMetricsReport = (tasks: Task[]): string => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : '0';
  
  const averageTimeSpent = tasks
    .filter(t => t.timeSpent && t.timeSpent > 0)
    .reduce((sum, t) => sum + (t.timeSpent || 0), 0) / 
    Math.max(1, tasks.filter(t => t.timeSpent && t.timeSpent > 0).length);

  return `
Rapport de métriques:
- Total des tâches: ${totalTasks}
- Tâches terminées: ${completedTasks}
- Tâches en cours: ${inProgressTasks}
- Tâches à faire: ${todoTasks}
- Taux de completion: ${completionRate}%
- Temps moyen par tâche: ${averageTimeSpent.toFixed(1)} minutes
`;
};